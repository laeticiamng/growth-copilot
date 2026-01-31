import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CREATOMATE_API_URL = 'https://api.creatomate.com/v1';
const MAX_POLL_ATTEMPTS = 60; // 5 minutes with 5s intervals
const POLL_INTERVAL_MS = 5000;

interface RenderRequest {
  job_id: string;
  workspace_id: string;
}

interface CreatomateRender {
  id: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  url?: string;
  error_message?: string;
}

// Convert blueprint to Creatomate JSON
function blueprintToCreatomate(
  blueprint: Record<string, unknown>,
  copywriting: Record<string, unknown>,
  logoUrl?: string
): Record<string, unknown> {
  const aspectRatio = blueprint.aspect_ratio as string;
  const dimensions = {
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 },
    '16:9': { width: 1920, height: 1080 }
  };

  const dim = dimensions[aspectRatio as keyof typeof dimensions] || dimensions['9:16'];
  const scenes = blueprint.scenes as Array<Record<string, unknown>> || [];
  const duration = blueprint.duration_seconds as number || 15;

  // Build Creatomate elements from scenes
  const elements: Record<string, unknown>[] = [];

  // Background
  elements.push({
    type: 'shape',
    fill_color: (blueprint.brand_colors as Record<string, string>)?.primary || '#1a1a2e',
    width: '100%',
    height: '100%'
  });

  // Process scenes
  scenes.forEach((scene, index) => {
    const textOverlay = scene.text_overlay as Record<string, unknown>;
    if (textOverlay) {
      const position = textOverlay.position as string;
      const yPosition = position === 'top' ? '15%' : position === 'bottom' ? '75%' : '50%';
      const fontSize = textOverlay.font_size === 'large' ? 72 : textOverlay.font_size === 'medium' ? 56 : 42;

      elements.push({
        type: 'text',
        text: textOverlay.text,
        font_family: 'Inter',
        font_weight: 700,
        font_size: fontSize,
        fill_color: '#ffffff',
        x: '50%',
        y: yPosition,
        x_anchor: '50%',
        y_anchor: '50%',
        width: '80%',
        text_align: 'center',
        time: scene.start_time,
        duration: (scene.end_time as number) - (scene.start_time as number),
        animations: [
          { type: 'fade', fade: 'in', duration: 0.3 },
          { type: 'fade', fade: 'out', duration: 0.3, start: -0.3 }
        ]
      });
    }
  });

  // Logo if provided
  if (logoUrl) {
    elements.push({
      type: 'image',
      source: logoUrl,
      width: aspectRatio === '9:16' ? '30%' : '20%',
      x: aspectRatio === '9:16' ? '50%' : '10%',
      y: aspectRatio === '9:16' ? '8%' : '10%',
      x_anchor: aspectRatio === '9:16' ? '50%' : '0%',
      y_anchor: '50%'
    });
  }

  // CTA at the end
  const ctaPlacement = blueprint.cta_placement as Record<string, unknown>;
  const ctas = copywriting.ctas as string[] || ['En savoir plus'];
  elements.push({
    type: 'text',
    text: ctas[0],
    font_family: 'Inter',
    font_weight: 700,
    font_size: 48,
    fill_color: '#ffffff',
    background_color: (blueprint.brand_colors as Record<string, string>)?.secondary || '#6366f1',
    background_x_padding: 40,
    background_y_padding: 20,
    background_border_radius: 12,
    x: '50%',
    y: aspectRatio === '9:16' ? '82%' : '80%',
    x_anchor: '50%',
    y_anchor: '50%',
    time: (ctaPlacement?.timing as number) || duration - 3,
    duration: 3,
    animations: [
      { type: 'scale', scale: '0%', duration: 0.3, easing: 'back-out' }
    ]
  });

  return {
    output_format: 'mp4',
    width: dim.width,
    height: dim.height,
    duration,
    frame_rate: 30,
    elements
  };
}

// Generate SRT from blueprint subtitles
function generateSRT(subtitles: Array<{ start: number; end: number; text: string }>): string {
  return subtitles.map((sub, index) => {
    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
    };

    return `${index + 1}
${formatTime(sub.start)} --> ${formatTime(sub.end)}
${sub.text}`;
  }).join('\n\n');
}

// Call Creatomate API
async function createRender(apiKey: string, source: Record<string, unknown>): Promise<CreatomateRender> {
  const response = await fetch(`${CREATOMATE_API_URL}/renders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ source })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[creative-render] Creatomate create error:', error);
    throw new Error(`Creatomate API error: ${response.status}`);
  }

  const renders = await response.json();
  return renders[0];
}

// Poll render status
async function pollRenderStatus(apiKey: string, renderId: string): Promise<CreatomateRender> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const response = await fetch(`${CREATOMATE_API_URL}/renders/${renderId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to poll render status: ${response.status}`);
    }

    const render: CreatomateRender = await response.json();
    
    if (render.status === 'done') {
      return render;
    }
    
    if (render.status === 'failed') {
      throw new Error(render.error_message || 'Render failed');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error('Render timeout exceeded');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const creatomateApiKey = Deno.env.get('CREATOMATE_API_KEY');

    if (!creatomateApiKey) {
      console.error('[creative-render] CREATOMATE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Render service not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { job_id, workspace_id }: RenderRequest = await req.json();

    console.log('[creative-render] Starting render for job:', job_id);

    // Fetch job
    const { data: job, error: jobError } = await serviceClient
      .from('creative_jobs')
      .select('*')
      .eq('id', job_id)
      .eq('workspace_id', workspace_id)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check quotas
    const { data: quota } = await serviceClient.rpc('get_workspace_quota', {
      p_workspace_id: workspace_id
    });

    if (quota && quota[0] && quota[0].concurrent_runs >= 3) {
      return new Response(
        JSON.stringify({ error: 'quota_exceeded', message: 'Too many concurrent renders' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment concurrent runs
    await serviceClient.rpc('update_workspace_quota', {
      p_workspace_id: workspace_id,
      p_increment_concurrent: true
    });

    // Update job status
    await serviceClient
      .from('creative_jobs')
      .update({ status: 'running' })
      .eq('id', job_id);

    // Fetch blueprints
    const { data: blueprints } = await serviceClient
      .from('creative_blueprints')
      .select('*')
      .eq('job_id', job_id)
      .order('version', { ascending: false });

    if (!blueprints || blueprints.length === 0) {
      throw new Error('No blueprints found for job');
    }

    // Fetch copy pack
    const { data: copyAsset } = await serviceClient
      .from('creative_assets')
      .select('meta_json')
      .eq('job_id', job_id)
      .eq('asset_type', 'copy_pack')
      .single();

    const copywriting = copyAsset?.meta_json || {};
    const inputJson = job.input_json as Record<string, unknown>;
    const logoUrl = inputJson?.logo_url as string;

    const renderResults: Array<{ aspect_ratio: string; url: string; render_id: string }> = [];

    // Render each format
    for (const bp of blueprints) {
      const blueprint = bp.blueprint_json as Record<string, unknown>;
      const aspectRatio = blueprint.aspect_ratio as string;

      console.log(`[creative-render] Rendering ${aspectRatio}...`);

      try {
        // Convert to Creatomate format
        const source = blueprintToCreatomate(blueprint, copywriting, logoUrl);

        // Create render
        const render = await createRender(creatomateApiKey, source);
        console.log(`[creative-render] Render created: ${render.id}`);

        // Poll for completion
        const completed = await pollRenderStatus(creatomateApiKey, render.id);
        console.log(`[creative-render] Render completed: ${completed.url}`);

        renderResults.push({
          aspect_ratio: aspectRatio,
          url: completed.url!,
          render_id: render.id
        });

        // Store asset
        const assetType = aspectRatio === '9:16' ? 'video_9_16' : 
                          aspectRatio === '1:1' ? 'video_1_1' : 'video_16_9';

        await serviceClient
          .from('creative_assets')
          .insert({
            job_id,
            workspace_id,
            asset_type: assetType,
            url: completed.url,
            meta_json: {
              render_id: render.id,
              aspect_ratio: aspectRatio,
              duration: blueprint.duration_seconds
            }
          });

        // Generate and store SRT
        const subtitles = blueprint.subtitles as Array<{ start: number; end: number; text: string }>;
        if (subtitles && subtitles.length > 0) {
          const srtContent = generateSRT(subtitles);
          await serviceClient
            .from('creative_assets')
            .insert({
              job_id,
              workspace_id,
              asset_type: 'srt',
              meta_json: {
                aspect_ratio: aspectRatio,
                content: srtContent,
                subtitle_count: subtitles.length
              }
            });
        }

      } catch (renderError) {
        console.error(`[creative-render] Failed to render ${aspectRatio}:`, renderError);
        // Continue with other formats
      }
    }

    const duration_ms = Date.now() - startTime;

    // Update job
    await serviceClient
      .from('creative_jobs')
      .update({
        status: renderResults.length === 3 ? 'done' : 'needs_manual_review',
        output_json: {
          ...(job.output_json as Record<string, unknown> || {}),
          renders: renderResults,
          render_count: renderResults.length
        },
        duration_ms,
        cost_estimate: renderResults.length * 0.05 // Approximate cost per render
      })
      .eq('id', job_id);

    // Decrement concurrent runs
    await serviceClient.rpc('update_workspace_quota', {
      p_workspace_id: workspace_id,
      p_decrement_concurrent: true
    });

    // Log action
    await serviceClient
      .from('action_log')
      .insert({
        workspace_id,
        site_id: job.site_id,
        actor_type: 'agent',
        action_type: 'creative_render',
        action_category: 'creative',
        description: `Rendered ${renderResults.length} video formats`,
        details: {
          job_id,
          formats: renderResults.map(r => r.aspect_ratio),
          duration_ms
        },
        is_automated: true
      });

    console.log('[creative-render] Completed:', renderResults.length, 'renders');

    return new Response(
      JSON.stringify({
        success: true,
        job_id,
        renders: renderResults,
        duration_ms
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[creative-render] Error:', error);
    const message = error instanceof Error ? error.message : 'Render failed';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
