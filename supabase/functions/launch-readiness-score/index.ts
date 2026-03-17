import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

/**
 * Launch Readiness Score Edge Function
 * Evaluates a launch project's readiness across multiple dimensions.
 * Uses AI to assess qualitative dimensions (hook strength, CTA clarity, etc.).
 */
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { launch_project_id, workspace_id } = await req.json();

    if (!launch_project_id || !workspace_id) {
      return new Response(
        JSON.stringify({ error: 'launch_project_id and workspace_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auth check
    const authResult = await validateWorkspaceAccess(req, workspace_id, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    if (!authResult.hasAccess) return forbiddenResponse(authResult.error || "Access denied", corsHeaders);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch project
    const { data: project, error: projError } = await supabase
      .from('launch_projects')
      .select('*')
      .eq('id', launch_project_id)
      .eq('workspace_id', workspace_id)
      .single();

    if (projError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gather data for scoring
    const [creativesRes, integrationsRes, trackerRes] = await Promise.all([
      supabase.from('launch_creative_variants').select('id').eq('launch_project_id', launch_project_id),
      supabase.from('integrations').select('id, provider, status').eq('workspace_id', workspace_id).eq('status', 'active'),
      supabase.from('launch_signal_events').select('id').eq('launch_project_id', launch_project_id).limit(1),
    ]);

    const creativesCount = creativesRes.data?.length || 0;
    const hasAnalytics = (integrationsRes.data || []).some((i: { provider: string }) => ['ga4', 'google_analytics'].includes(i.provider));
    const hasTracking = (trackerRes.data?.length || 0) > 0;
    const config = project.config || {};

    // Score dimensions
    const musicTypes = ['single', 'ep', 'album', 'clip', 'music_evergreen'];
    const isMusic = musicTypes.includes(project.launch_type);

    const dimensions = isMusic ? [
      { key: 'branding', label: 'Branding & Identity', weight: 0.08, score: 50 },
      { key: 'hook_strength', label: 'Hook Strength', weight: 0.12, score: creativesCount > 0 ? 60 : 0 },
      { key: 'smart_link', label: 'Smart Link', weight: 0.1, score: project.media_asset_id ? 80 : 0 },
      { key: 'creatives', label: 'Creative Assets', weight: 0.15, score: Math.min(100, creativesCount * 15) },
      { key: 'analytics', label: 'Analytics', weight: 0.08, score: hasAnalytics ? 100 : 0 },
      { key: 'tracking', label: 'Tracking', weight: 0.1, score: hasTracking ? 100 : 0 },
      { key: 'email_list', label: 'Email List', weight: 0.08, score: 30 },
      { key: 'budget', label: 'Budget', weight: 0.1, score: config.budget ? Math.min(100, config.budget / 5) : 0 },
      { key: 'channel_fit', label: 'Channel Fit', weight: 0.1, score: (config.channels?.length || 0) > 0 ? 70 : 30 },
      { key: 'retargeting', label: 'Retargeting', weight: 0.09, score: hasTracking && hasAnalytics ? 80 : hasTracking ? 40 : 0 },
    ] : [
      { key: 'branding', label: 'Branding & Identity', weight: 0.07, score: 50 },
      { key: 'offer_clarity', label: 'Offer Clarity', weight: 0.12, score: project.input_url ? 60 : 20 },
      { key: 'landing_quality', label: 'Landing Page', weight: 0.15, score: project.input_url ? 60 : 0 },
      { key: 'social_proof', label: 'Social Proof', weight: 0.08, score: 30 },
      { key: 'creatives', label: 'Creatives', weight: 0.12, score: Math.min(100, creativesCount * 12) },
      { key: 'analytics', label: 'Analytics', weight: 0.1, score: hasAnalytics ? 100 : 0 },
      { key: 'tracking', label: 'Tracking', weight: 0.1, score: hasTracking ? 100 : 0 },
      { key: 'onboarding', label: 'Onboarding', weight: 0.08, score: 50 },
      { key: 'budget', label: 'Budget', weight: 0.1, score: config.budget ? Math.min(100, config.budget / 10) : 0 },
      { key: 'channel_fit', label: 'Channel Fit', weight: 0.08, score: (config.channels?.length || 0) > 0 ? 70 : 30 },
    ];

    // Enrich with AI scoring if API key available
    if (LOVABLE_API_KEY && project.input_url) {
      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            temperature: 0.3,
            messages: [
              { role: 'system', content: 'You are a launch readiness evaluator. Score these dimensions 0-100 based on the project context. Return JSON with keys matching dimension keys.' },
              { role: 'user', content: `Project: ${project.name}\nType: ${project.launch_type}\nURL: ${project.input_url}\nDimensions: ${dimensions.map(d => d.key).join(', ')}` },
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiScores = JSON.parse(aiData.choices?.[0]?.message?.content || '{}');
          for (const dim of dimensions) {
            if (aiScores[dim.key] != null && typeof aiScores[dim.key] === 'number') {
              dim.score = Math.round((dim.score + aiScores[dim.key]) / 2);
            }
          }
        }
      } catch (err) {
        console.error('AI scoring failed, using rule-based scores:', err);
      }
    }

    const overallScore = Math.round(dimensions.reduce((acc, d) => acc + d.score * d.weight, 0));

    const blockers = dimensions
      .filter(d => d.score === 0 && d.weight >= 0.1)
      .map(d => ({
        dimension: d.key,
        severity: 'critical' as const,
        message: `${d.label} is not configured`,
        fix_hint: `Set up ${d.label.toLowerCase()} before launching`,
      }));

    const recommendations = dimensions
      .filter(d => d.score < 60)
      .sort((a, b) => (a.score * a.weight) - (b.score * b.weight))
      .map((d, i) => ({
        priority: i + 1,
        dimension: d.key,
        title: `Improve ${d.label}`,
        description: `Current score: ${d.score}/100`,
        impact: d.weight >= 0.12 ? 'high' : d.weight >= 0.08 ? 'medium' : 'low',
      }));

    const status = blockers.length > 0 ? 'not_ready' : overallScore < 60 ? 'needs_fix' : 'ready_to_launch';

    // Save score
    const { data: savedScore, error: saveError } = await supabase
      .from('launch_readiness_scores')
      .insert({
        launch_project_id,
        overall_score: overallScore,
        status,
        dimensions,
        blockers,
        recommendations,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save readiness score:', saveError);
    }

    // Update project
    await supabase
      .from('launch_projects')
      .update({ readiness_score: overallScore, readiness_status: status, status: 'readiness_check' })
      .eq('id', launch_project_id);

    return new Response(
      JSON.stringify({ success: true, score: savedScore || { overall_score: overallScore, status, dimensions, blockers, recommendations } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Launch readiness score error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
