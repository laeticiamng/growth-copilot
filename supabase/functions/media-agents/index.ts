import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface AgentRequest {
  agent_type: string;
  media_asset_id: string;
  workspace_id: string;
  options?: Record<string, unknown>;
}

// Agent system prompts
const AGENT_PROMPTS: Record<string, string> = {
  media_strategy: `You are the Media Strategy Agent. Your role is to create comprehensive launch plans for media content (videos, music, etc.).

Create a structured release plan with 3 phases:
1. PRE-LAUNCH (7-14 days before): Build anticipation, teasers, email list, community engagement
2. LAUNCH DAY: Coordinated release across platforms, initial push, engagement response
3. POST-LAUNCH (7-30 days after): Sustain momentum, repurpose content, analyze and iterate

For each phase, provide:
- Specific actions with dates relative to launch
- Platform-specific tactics
- KPIs to track
- Content pieces needed

Output as structured JSON with phases, actions, and KPIs.`,

  youtube_optimizer: `You are the YouTube Optimizer Agent. Your role is to optimize video metadata for maximum discoverability and engagement.

Analyze the provided video information and generate:
1. 3 title variations (hook-driven, under 60 chars, include main keyword)
2. Optimized description (first 150 chars critical, include links, timestamps placeholder)
3. 15-20 relevant tags (mix of broad and specific)
4. Chapter suggestions (if video > 5 min)
5. End screen recommendations
6. Thumbnail concepts (3 ideas with hook text)
7. Shorts repurpose strategy (3-5 clip ideas from main video)

Consider: CTR optimization, watch time, algorithm factors, competitor patterns.
Output as structured JSON.`,

  streaming_packager: `You are the Streaming Packager Agent. Your role is to create professional press kits and promotional assets for music releases.

Generate:
1. Artist/Release Bio (short 50 words, medium 150 words, long 300 words)
2. One-liner pitch (under 15 words)
3. Press release template
4. Smart link page content
5. Social captions (5 variations per platform: IG, Twitter, TikTok, Facebook)
6. Hook lines for short-form content (10 variations)
7. Email pitch template for playlist curators
8. Talking points for interviews/podcasts

Consider: Genre conventions, target audience, unique selling points.
Output as structured JSON.`,

  shortform_repurposer: `You are the Short-form Repurposer Agent. Your role is to transform long-form content into multiple short-form pieces.

From the provided content, generate:
1. 10 short-form content ideas (Reels/Shorts/TikTok)
2. For each idea:
   - Hook (first 3 seconds script)
   - Main content outline
   - Caption with hashtags
   - Trending audio suggestions (describe style, not specific tracks)
   - Best posting time recommendation
3. Carousel/Thread ideas (3 concepts)
4. Quote graphics (5 shareable quotes)

Platforms to target: TikTok, Instagram Reels, YouTube Shorts, Twitter/X.
Output as structured JSON with platform-specific adaptations.`,

  ads_creative: `You are the Ads Creative & Targeting Agent. Your role is to develop advertising strategies for media content promotion.

Generate:
1. 3 campaign angles (different value propositions)
2. For each angle:
   - Primary text (3 variations)
   - Headlines (3 variations)
   - Audience targeting recommendations
   - Placement suggestions
3. Budget allocation recommendations (test phase, scale phase)
4. Creative specs needed (video lengths, image sizes)
5. A/B testing plan
6. Performance benchmarks to aim for
7. Optimization triggers (when to pause, scale, adjust)

Focus on: YouTube Ads, Meta Ads (if applicable), cost efficiency.
Output as structured JSON.`,

  media_competitive_analyst: `You are the Media Competitive Analyst Agent. Your role is to analyze competitor content and extract actionable insights.

Analyze the provided competitor information and generate:
1. Content patterns (posting frequency, formats, lengths)
2. Engagement patterns (what drives comments, shares)
3. Title/thumbnail patterns (hooks, styles, colors)
4. Gaps and opportunities (what they're not covering)
5. Audience overlap analysis
6. Differentiator recommendations
7. Content ideas inspired by (not copied from) competitors
8. Timing insights (best days/times based on their patterns)

IMPORTANT: Never recommend copying. Focus on identifying patterns and opportunities.
Output as structured JSON.`,

  media_analytics_guardian: `You are the Media Analytics Guardian Agent. Your role is to monitor KPIs and detect anomalies that need attention.

Analyze the provided metrics and:
1. Identify performance trends (positive and negative)
2. Detect anomalies (sudden drops, unusual patterns)
3. Compare to benchmarks (industry and historical)
4. Prioritize issues by impact
5. Generate specific recommendations for each issue
6. Predict future performance based on trends
7. Recommend iteration actions

Key metrics to watch:
- CTR (thumbnail effectiveness)
- Retention/Watch time (content quality)
- Engagement rate (community health)
- Growth velocity (momentum)
- Conversion rates (if tracking links)

Output as structured JSON with alerts, insights, and actions.`
};

// Model configuration for different agent types
function getModelConfig(agentType: string): { model: string; temperature: number } {
  switch (agentType) {
    case 'media_strategy':
    case 'ads_creative':
      return { model: 'openai/gpt-5.2', temperature: 0.7 };
    case 'youtube_optimizer':
    case 'streaming_packager':
    case 'shortform_repurposer':
      return { model: 'openai/gpt-5.2', temperature: 0.8 };
    case 'media_competitive_analyst':
    case 'media_analytics_guardian':
      return { model: 'openai/gpt-5-mini', temperature: 0.3 };
    default:
      return { model: 'google/gemini-3-flash-preview', temperature: 0.7 };
  }
}

async function runAgent(
  agentType: string,
  mediaAsset: Record<string, unknown>,
  options: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const systemPrompt = AGENT_PROMPTS[agentType];
  if (!systemPrompt) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }

  const { model, temperature } = getModelConfig(agentType);
  
  // Build context based on agent type
  let userPrompt = `Analyze and generate recommendations for this media asset:

Asset Information:
- Platform: ${mediaAsset.platform}
- Title: ${mediaAsset.title || 'Not set'}
- Artist/Creator: ${mediaAsset.artist_name || 'Unknown'}
- Description: ${mediaAsset.description || 'None provided'}
- URL: ${mediaAsset.url}
- Genre: ${mediaAsset.genre || 'Not specified'}
- Target Markets: ${JSON.stringify(mediaAsset.target_markets || [])}
- Current Status: ${mediaAsset.status}

Additional metadata:
${JSON.stringify(mediaAsset.metadata_json || {}, null, 2)}
`;

  // Add competitor data for competitive analyst
  if (agentType === 'media_competitive_analyst' && options.competitors) {
    userPrompt += `\n\nCompetitor URLs to analyze:\n${JSON.stringify(options.competitors, null, 2)}`;
  }

  // Add KPI data for analytics guardian
  if (agentType === 'media_analytics_guardian' && options.kpis) {
    userPrompt += `\n\nRecent KPIs:\n${JSON.stringify(options.kpis, null, 2)}`;
  }

  // Add brand kit context if available
  if (options.brand_kit) {
    userPrompt += `\n\nBrand Guidelines:\n${JSON.stringify(options.brand_kit, null, 2)}`;
  }

  userPrompt += `\n\nProvide your analysis and recommendations in structured JSON format.`;

  // Call AI Gateway
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('AI Gateway error:', response.status, error);
    throw new Error(`AI Gateway error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in AI response');
  }

  try {
    return JSON.parse(content);
  } catch {
    // If not valid JSON, wrap in object
    return { raw_response: content };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { agent_type, media_asset_id, workspace_id, options = {} }: AgentRequest = await req.json();

    if (!agent_type || !media_asset_id || !workspace_id) {
      return new Response(
        JSON.stringify({ error: 'agent_type, media_asset_id, and workspace_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch media asset
    const { data: mediaAsset, error: assetError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', media_asset_id)
      .eq('workspace_id', workspace_id)
      .single();

    if (assetError || !mediaAsset) {
      return new Response(
        JSON.stringify({ error: 'Media asset not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch brand kit if available
    let brandKit = null;
    if (mediaAsset.site_id) {
      const { data } = await supabase
        .from('brand_kit')
        .select('*')
        .eq('site_id', mediaAsset.site_id)
        .single();
      brandKit = data;
    }

    // Create agent run record
    const startedAt = new Date().toISOString();
    const { data: agentRun, error: runError } = await supabase
      .from('agent_runs')
      .insert({
        workspace_id,
        site_id: mediaAsset.site_id,
        agent_type,
        status: 'running',
        started_at: startedAt,
        inputs: { media_asset_id, options }
      })
      .select()
      .single();

    if (runError) {
      console.error('Failed to create agent run:', runError);
    }

    // Run the agent
    const result = await runAgent(
      agent_type,
      mediaAsset,
      { ...options, brand_kit: brandKit }
    );

    // Update agent run with results
    const completedAt = new Date().toISOString();
    const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();

    if (agentRun) {
      await supabase
        .from('agent_runs')
        .update({
          status: 'completed',
          completed_at: completedAt,
          duration_ms: durationMs,
          outputs: result
        })
        .eq('id', agentRun.id);
    }

    // Log action
    await supabase.from('action_log').insert({
      workspace_id,
      site_id: mediaAsset.site_id,
      actor_type: 'agent',
      actor_id: agent_type,
      action_type: 'media_agent_run',
      action_category: 'media',
      entity_type: 'media_asset',
      entity_id: media_asset_id,
      description: `${agent_type} agent completed analysis`,
      is_automated: true,
      details: { duration_ms: durationMs }
    });

    return new Response(
      JSON.stringify({
        success: true,
        agent_type,
        run_id: agentRun?.id,
        result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Media agents error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});