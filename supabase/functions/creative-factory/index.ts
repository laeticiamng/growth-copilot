import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const MUSIC_PROMPT = `You are a premium creative factory for music launches. Generate multi-variant marketing assets.
Always generate MULTIPLE variants (3-5 per format). Never just one.

For each requested format, output structured JSON:
- hooks: array of {text, angle, platform_target, estimated_retention}
- captions: array of {text, platform, hashtags, angle}
- scripts: array of {title, hook_text, body, cta, duration_seconds, platform}
- ad_copy: array of {headline, primary_text, description, cta, angle, audience}
- bio: array of {text, length, style}
- pitch: array of {one_liner, full_pitch, angle}
- cta: array of {text, urgency_level, context}
- storyboard: array of {title, scenes: [{order, duration, visual, text_overlay, voiceover}], angle}

Think like a top music marketing strategist. Premium, not cheap.`;

const PLATFORM_PROMPT = `You are a premium creative factory for platform/SaaS/product launches. Generate multi-variant marketing assets.
Always generate MULTIPLE variants (3-5 per format). Never just one.

For each requested format, output structured JSON:
- hooks: array of {text, angle, platform_target, icp_segment}
- headlines: array of {text, subhead, angle, audience}
- ad_copy: array of {headline, primary_text, description, cta, angle, audience}
- email_subject: array of {text, preview_text, angle, sequence_position}
- email_body: array of {subject, body, cta, angle}
- offer_stack: array of {headline, benefits: string[], price_anchor, final_price, urgency, guarantee}
- objection_handler: array of {objection, response, proof_point}
- landing_copy: array of {headline, subhead, body, cta, social_proof, angle}
- scripts: array of {title, hook_text, body, cta, duration_seconds, format}

Think like a premium growth architect. Data-driven, precise, never aggressive or cheap.`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { launch_project_id, workspace_id, formats } = await req.json();

    if (!launch_project_id || !workspace_id) {
      return new Response(
        JSON.stringify({ error: 'launch_project_id and workspace_id are required' }),
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

    // Fetch project
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

    const musicTypes = ['single', 'ep', 'album', 'clip', 'music_evergreen'];
    const isMusic = musicTypes.includes(project.launch_type);
    const systemPrompt = isMusic ? MUSIC_PROMPT : PLATFORM_PROMPT;

    const requestedFormats = formats || (isMusic
      ? ['hooks', 'captions', 'scripts', 'ad_copy', 'bio', 'pitch', 'cta']
      : ['hooks', 'headlines', 'ad_copy', 'email_subject', 'offer_stack', 'objection_handler', 'landing_copy']);

    // Fetch media asset context if exists
    let mediaContext = '';
    if (project.media_asset_id) {
      const { data: asset } = await supabase
        .from('media_assets')
        .select('*')
        .eq('id', project.media_asset_id)
        .single();
      if (asset) {
        mediaContext = `\nMedia Asset: ${asset.title || 'Untitled'} by ${asset.artist_name || 'Unknown'}\nPlatform: ${asset.platform}\nGenre: ${asset.genre || 'N/A'}\nURL: ${asset.url}`;
      }
    }

    // Fetch campaign memories for this workspace/type
    const { data: memories } = await supabase
      .from('launch_campaign_memories')
      .select('learnings')
      .eq('workspace_id', workspace_id)
      .eq('launch_type', project.launch_type)
      .order('created_at', { ascending: false })
      .limit(3);

    let memoryContext = '';
    if (memories && memories.length > 0) {
      const topLearnings = memories.flatMap((m: Record<string, unknown>) => {
        const learnings = m.learnings as Array<{ insight: string; confidence: number }>;
        return Array.isArray(learnings) ? learnings : [];
      }).slice(0, 5);
      if (topLearnings.length > 0) {
        memoryContext = `\n\nPast Campaign Learnings (apply these):\n${topLearnings.map((l: { insight: string }) => `- ${l.insight}`).join('\n')}`;
      }
    }

    const userPrompt = `Generate creative variants for this launch project.

Project: ${project.name}
Type: ${project.launch_type}
URL: ${project.input_url || 'N/A'}${mediaContext}
Config: ${JSON.stringify(project.config || {})}${memoryContext}

Generate these formats: ${requestedFormats.join(', ')}

Return a JSON object where each key is a format name and the value is an array of variants.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        temperature: 0.8,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error('No AI response content');

    const generated = JSON.parse(content);

    // Save variants to database
    const variantsToInsert: Array<Record<string, unknown>> = [];

    for (const [format, variants] of Object.entries(generated)) {
      if (!Array.isArray(variants)) continue;
      for (const variant of variants) {
        variantsToInsert.push({
          launch_project_id,
          workspace_id,
          format,
          name: (variant as Record<string, string>).title || (variant as Record<string, string>).text?.slice(0, 50) || `${format} variant`,
          content: variant,
          platform_target: (variant as Record<string, string>).platform_target || (variant as Record<string, string>).platform || null,
          angle: (variant as Record<string, string>).angle || null,
          audience_segment: (variant as Record<string, string>).audience || (variant as Record<string, string>).icp_segment || null,
          status: 'draft',
        });
      }
    }

    let savedVariants: unknown[] = [];
    if (variantsToInsert.length > 0) {
      const { data, error } = await supabase
        .from('launch_creative_variants')
        .insert(variantsToInsert)
        .select();

      if (error) {
        console.error('Failed to save variants:', error);
      } else {
        savedVariants = data || [];
      }
    }

    // Log action
    await supabase.from('action_log').insert({
      workspace_id,
      actor_type: 'agent',
      actor_id: 'creative_factory',
      action_type: 'creatives_generated',
      action_category: 'launch_os',
      entity_type: 'launch_project',
      entity_id: launch_project_id,
      description: `Generated ${savedVariants.length} creative variants for ${project.name}`,
      is_automated: true,
      details: { formats: requestedFormats, count: savedVariants.length },
    });

    return new Response(
      JSON.stringify({ success: true, variants: savedVariants, count: savedVariants.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Creative factory error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
