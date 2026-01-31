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

// Pricing configuration
const PRICING_CONFIG = {
  video_render: 0.05,
  thumbnail_render: 0.01,
  srt_generation: 0.005
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  // Track for finally{} cleanup
  let workspaceId: string | null = null;
  let quotaIncremented = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let serviceClient: any = null;

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

    // Service client for writes (untyped for Deno compatibility)
    serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { job_id, workspace_id }: RenderRequest = await req.json();
    workspaceId = workspace_id;

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
    quotaIncremented = true;

    // Update job status
    await serviceClient
      .from('creative_jobs')
      .update({ status: 'running' })
      .eq('id', job_id);

    // Fetch blueprints - only approved ones
    const { data: blueprints } = await serviceClient
      .from('creative_blueprints')
      .select('*')
      .eq('job_id', job_id)
      .eq('is_approved', true) // Only render approved blueprints
      .order('version', { ascending: false });

    if (!blueprints || blueprints.length === 0) {
      // Check if there are unapproved blueprints that need QA
      const { data: unapprovedBp } = await serviceClient
        .from('creative_blueprints')
        .select('id')
        .eq('job_id', job_id)
        .eq('is_approved', false)
        .limit(1);
      
      if (unapprovedBp && unapprovedBp.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: 'blueprints_not_approved', 
            message: 'Blueprints must pass QA before rendering. Run creative-qa first.',
            next_action: 'call_creative_qa'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
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
    const thumbnailResults: Array<{ aspect_ratio: string; url: string; variant: number }> = [];

    // Render each format (videos + thumbnails)
    for (const bp of blueprints) {
      const blueprint = bp.blueprint_json as Record<string, unknown>;
      const aspectRatio = blueprint.aspect_ratio as string;

      console.log(`[creative-render] Rendering ${aspectRatio}...`);

      try {
        // Convert to Creatomate format
        const source = blueprintToCreatomate(blueprint, copywriting, logoUrl);

        // Create render for video
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

        // Store video asset
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

        // Generate thumbnail using snapshot_time extraction from the rendered video
        // This is the recommended Creatomate approach for extracting frames
        const duration = blueprint.duration_seconds as number || 15;
        const snapshotTime = Math.max(0.5, duration * 0.25); // Extract at 25% mark, min 0.5s
        
        try {
          // Method 1: Extract frame from rendered video using snapshot_time
          const thumbnailSource = {
            output_format: 'jpg',
            snapshot_time: snapshotTime,
            elements: [
              {
                type: 'video',
                source: completed.url // Use the just-rendered video
              }
            ]
          };
          
          const thumbRender = await createRender(creatomateApiKey, thumbnailSource);
          const thumbCompleted = await pollRenderStatus(creatomateApiKey, thumbRender.id);
          
          if (thumbCompleted.url) {
            thumbnailResults.push({
              aspect_ratio: aspectRatio,
              url: thumbCompleted.url,
              variant: 1
            });

            await serviceClient
              .from('creative_assets')
              .insert({
                job_id,
                workspace_id,
                asset_type: 'thumbnail',
                url: thumbCompleted.url,
                meta_json: {
                  aspect_ratio: aspectRatio,
                  variant: 1,
                  source: 'snapshot_extraction',
                  snapshot_time: snapshotTime
                }
              });
              
            console.log(`[creative-render] Thumbnail generated via snapshot_time for ${aspectRatio}`);
          }
        } catch (thumbError) {
          console.warn(`[creative-render] Snapshot extraction failed for ${aspectRatio}, trying static composition fallback:`, thumbError);
          
          // Fallback Method 2: Render static composition (1-frame, no animations)
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sourceAny = source as any;
            const staticThumbnailSource = {
              output_format: 'jpg',
              width: sourceAny.width,
              height: sourceAny.height,
              elements: (sourceAny.elements || []).map((el: Record<string, unknown>) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { animations, time, duration: elDuration, ...rest } = el;
                return rest;
              })
            };
            
            const fallbackRender = await createRender(creatomateApiKey, staticThumbnailSource);
            const fallbackCompleted = await pollRenderStatus(creatomateApiKey, fallbackRender.id);
            
            if (fallbackCompleted.url) {
              thumbnailResults.push({
                aspect_ratio: aspectRatio,
                url: fallbackCompleted.url,
                variant: 1
              });

              await serviceClient
                .from('creative_assets')
                .insert({
                  job_id,
                  workspace_id,
                  asset_type: 'thumbnail',
                  url: fallbackCompleted.url,
                  meta_json: {
                    aspect_ratio: aspectRatio,
                    variant: 1,
                    source: 'static_composition_fallback'
                  }
                });
                
              console.log(`[creative-render] Thumbnail generated via static fallback for ${aspectRatio}`);
            }
          } catch (fallbackError) {
            console.error(`[creative-render] All thumbnail methods failed for ${aspectRatio}:`, fallbackError);
            // Final fallback: mark as needing manual upload
            await serviceClient
              .from('creative_assets')
              .insert({
                job_id,
                workspace_id,
                asset_type: 'thumbnail',
                url: null,
                meta_json: {
                  aspect_ratio: aspectRatio,
                  variant: 1,
                  source: 'pending_manual',
                  error: 'All auto-generation methods failed, manual upload required'
                }
              });
          }
        }

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

    // Calculate dynamic cost based on actual renders
    const costEstimate = (renderResults.length * PRICING_CONFIG.video_render) +
                         (thumbnailResults.length * PRICING_CONFIG.thumbnail_render) +
                         (renderResults.length * PRICING_CONFIG.srt_generation);

    // Update job
    await serviceClient
      .from('creative_jobs')
      .update({
        status: renderResults.length === 3 ? 'done' : 'needs_manual_review',
        output_json: {
          ...(job.output_json as Record<string, unknown> || {}),
          renders: renderResults,
          thumbnails: thumbnailResults,
          render_count: renderResults.length,
          thumbnail_count: thumbnailResults.length
        },
        duration_ms,
        cost_estimate: costEstimate
      })
      .eq('id', job_id);

    // Decrement concurrent runs - now in finally{} but also here for success path
    quotaIncremented = false;
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
        description: `Rendered ${renderResults.length} video formats + ${thumbnailResults.length} thumbnails`,
        details: {
          job_id,
          formats: renderResults.map(r => r.aspect_ratio),
          thumbnails: thumbnailResults.length,
          duration_ms,
          cost_estimate: costEstimate
        },
        is_automated: true
      });

    console.log('[creative-render] Completed:', renderResults.length, 'renders,', thumbnailResults.length, 'thumbnails');

    return new Response(
      JSON.stringify({
        success: true,
        job_id,
        renders: renderResults,
        thumbnails: thumbnailResults,
        duration_ms,
        cost_estimate: costEstimate
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
  } finally {
    // CRITICAL: Always decrement concurrent_runs to prevent quota leak
    if (quotaIncremented && workspaceId && serviceClient) {
      try {
        await serviceClient.rpc('update_workspace_quota', {
          p_workspace_id: workspaceId,
          p_decrement_concurrent: true
        });
        console.log('[creative-render] Quota decremented in finally');
      } catch (cleanupError) {
        console.error('[creative-render] Failed to decrement quota:', cleanupError);
      }
    }
  }
});
