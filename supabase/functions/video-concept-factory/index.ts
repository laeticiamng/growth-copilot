import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const SYSTEM_PROMPT = `You are a premium short-form video concept factory. Create production-ready video concepts in 9:16 format.

For each concept, provide:
- title: descriptive concept name
- format: "9:16"
- duration_seconds: 15-60
- hook_text: the first 3 seconds text/hook that grabs attention
- scenes: array of scene objects with:
  - order: number
  - duration_seconds: number
  - visual_description: what's on screen
  - text_overlay: text shown on screen (null if none)
  - voiceover: what's said (null if none)
  - transition: transition type to next scene (null for last)
- voiceover_script: full voiceover text (null if no VO)
- cta: call to action at the end
- angle: the marketing angle/approach
- platform_targets: ["tiktok", "instagram_reels", "youtube_shorts"]

Generate 3-5 concepts with DIFFERENT angles. Think:
- Educational/value-first
- Emotional/story-driven
- Problem-solution
- Social proof/testimonial style
- Behind-the-scenes/authentic

NEVER create cheap, aggressive, or "bro marketing" content. Premium, precise, surgical.
Return as JSON: { concepts: [...] }`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { launch_project_id, workspace_id } = await req.json();

    if (!launch_project_id || !workspace_id) {
      return new Response(
        JSON.stringify({ error: 'launch_project_id and workspace_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authResult = await validateWorkspaceAccess(req, workspace_id, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    if (!authResult.hasAccess) return forbiddenResponse(authResult.error || "Access denied", corsHeaders);

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: project } = await supabase
      .from('launch_projects')
      .select('*')
      .eq('id', launch_project_id)
      .eq('workspace_id', workspace_id)
      .single();

    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let mediaContext = '';
    if (project.media_asset_id) {
      const { data: asset } = await supabase.from('media_assets').select('*').eq('id', project.media_asset_id).single();
      if (asset) {
        mediaContext = `\nMedia: ${asset.title} by ${asset.artist_name}\nPlatform: ${asset.platform}\nGenre: ${asset.genre || 'N/A'}`;
      }
    }

    const userPrompt = `Create short-form video concepts for:

Project: ${project.name}
Type: ${project.launch_type}
URL: ${project.input_url || 'N/A'}${mediaContext}
Config: ${JSON.stringify(project.config || {})}

Generate 4 concepts with different angles. Each must be production-ready with scene-by-scene breakdown.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        temperature: 0.8,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResponse.ok) throw new Error(`AI error: ${aiResponse.status}`);

    const aiData = await aiResponse.json();
    const content = JSON.parse(aiData.choices?.[0]?.message?.content || '{}');
    const concepts = content.concepts || [];

    // Save to database
    const toInsert = concepts.map((c: Record<string, unknown>) => ({
      launch_project_id,
      workspace_id,
      title: c.title || 'Untitled Concept',
      format: c.format || '9:16',
      duration_seconds: c.duration_seconds || 30,
      hook_text: c.hook_text || '',
      scenes: c.scenes || [],
      voiceover_script: c.voiceover_script || null,
      cta: c.cta || '',
      angle: c.angle || '',
      platform_targets: c.platform_targets || ['tiktok', 'instagram_reels', 'youtube_shorts'],
      status: 'concept',
    }));

    let savedConcepts: unknown[] = [];
    if (toInsert.length > 0) {
      const { data, error } = await supabase.from('launch_video_concepts').insert(toInsert).select();
      if (error) console.error('Save error:', error);
      else savedConcepts = data || [];
    }

    await supabase.from('action_log').insert({
      workspace_id,
      actor_type: 'agent',
      actor_id: 'video_concept_factory',
      action_type: 'video_concepts_generated',
      action_category: 'launch_os',
      entity_type: 'launch_project',
      entity_id: launch_project_id,
      description: `Generated ${savedConcepts.length} video concepts`,
      is_automated: true,
      details: { count: savedConcepts.length },
    });

    return new Response(
      JSON.stringify({ success: true, concepts: savedConcepts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Video concept factory error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
