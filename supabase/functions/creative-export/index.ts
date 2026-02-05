import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from "../_shared/cors.ts";

interface ExportRequest {
  job_id: string;
  workspace_id: string;
  include_utm?: boolean;
  utm_params?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  experiment_id?: string; // V2: Link to experiment for variant-specific UTMs
}

interface AdPackExport {
  job_id: string;
  experiment_id?: string;
  variant_name?: string;
  generated_at: string;
  videos: Array<{
    format: string;
    aspect_ratio: string;
    url: string;
    filename: string;
    variant?: string; // V2: A/B variant tag
  }>;
  thumbnails: Array<{
    variant: number;
    url: string;
    filename: string;
  }>;
  subtitles: Array<{
    format: string;
    srt_content: string;
    filename: string;
  }>;
  copy_pack: {
    hooks: string[];
    headlines: string[];
    primary_texts: string[];
    ctas: string[];
    scripts: Array<{ duration: number; script: string }>;
  };
  utm_links: Record<string, string>;
  variant_utm_links?: Record<string, Record<string, string>>; // V2: Per-variant UTM links
  launch_checklist: Array<{
    platform: string;
    format: string;
    specs: string;
    ready: boolean;
  }>;
  audit_manifest?: Record<string, unknown>; // V2: Audit trail
}

// Generate UTM link
function generateUTMLink(
  baseUrl: string,
  params: { source: string; medium: string; campaign: string; content?: string }
): string {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', params.source);
  url.searchParams.set('utm_medium', params.medium);
  url.searchParams.set('utm_campaign', params.campaign);
  if (params.content) {
    url.searchParams.set('utm_content', params.content);
  }
  return url.toString();
}

// Generate filename with naming convention
function generateFilename(
  brandName: string,
  campaign: string,
  format: string,
  type: string,
  variant?: number
): string {
  const sanitize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const parts = [
    sanitize(brandName),
    sanitize(campaign),
    format.replace(':', 'x'),
    type,
    variant ? `v${variant}` : null,
    date
  ].filter(Boolean);
  return parts.join('_');
}

// Generate launch checklist
function generateLaunchChecklist(videos: Array<{ format: string; aspect_ratio: string }>): Array<{
  platform: string;
  format: string;
  specs: string;
  ready: boolean;
}> {
  const checklist = [];

  // Meta (Facebook/Instagram)
  if (videos.some(v => v.aspect_ratio === '9:16')) {
    checklist.push({
      platform: 'Instagram Reels',
      format: '9:16',
      specs: '1080x1920, max 60s, captions burned-in recommended',
      ready: true
    });
    checklist.push({
      platform: 'Facebook Stories',
      format: '9:16',
      specs: '1080x1920, max 15s for stories',
      ready: true
    });
  }

  if (videos.some(v => v.aspect_ratio === '1:1')) {
    checklist.push({
      platform: 'Instagram Feed',
      format: '1:1',
      specs: '1080x1080, max 60s',
      ready: true
    });
    checklist.push({
      platform: 'Facebook Feed',
      format: '1:1',
      specs: '1080x1080, max 240 minutes',
      ready: true
    });
  }

  // YouTube
  if (videos.some(v => v.aspect_ratio === '16:9')) {
    checklist.push({
      platform: 'YouTube Ads',
      format: '16:9',
      specs: '1920x1080, min 12s for skippable',
      ready: true
    });
    checklist.push({
      platform: 'YouTube Shorts',
      format: '9:16',
      specs: 'Use 9:16 version, max 60s',
      ready: videos.some(v => v.aspect_ratio === '9:16')
    });
  }

  // TikTok
  if (videos.some(v => v.aspect_ratio === '9:16')) {
    checklist.push({
      platform: 'TikTok Ads',
      format: '9:16',
      specs: '1080x1920, 9-60s recommended, captions required',
      ready: true
    });
  }

  // Google Display
  checklist.push({
    platform: 'Google Display Ads',
    format: 'Multiple',
    specs: 'All formats supported, check aspect ratios',
    ready: videos.length >= 2
  });

  return checklist;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Validate user
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await userClient.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claims.claims.sub;
    const { job_id, workspace_id, include_utm, utm_params, experiment_id }: ExportRequest = await req.json();

    console.log('[creative-export] Exporting job:', job_id);

    // Validate access
    const { data: hasAccess } = await userClient.rpc('has_workspace_access', {
      _user_id: userId,
      _workspace_id: workspace_id
    });

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'No access to workspace' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // V2: Fetch experiment info if linked
    let experimentInfo: { id: string; hypothesis: string; variants: string[] } | null = null;
    const jobExperimentId = experiment_id || job.experiment_id;
    if (jobExperimentId) {
      const { data: exp } = await serviceClient
        .from('experiments')
        .select('id, hypothesis, variants')
        .eq('id', jobExperimentId)
        .single();
      if (exp) {
        experimentInfo = {
          id: exp.id,
          hypothesis: exp.hypothesis || '',
          variants: (exp.variants as string[]) || ['A', 'B']
        };
      }
    }

    // Fetch assets
    const { data: assets } = await serviceClient
      .from('creative_assets')
      .select('*')
      .eq('job_id', job_id);

    if (!assets || assets.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No assets found for job' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch site info for naming
    let brandName = 'brand';
    if (job.site_id) {
      const { data: site } = await serviceClient
        .from('sites')
        .select('name, domain')
        .eq('id', job.site_id)
        .single();
      if (site) {
        brandName = site.name || site.domain || 'brand';
      }
    }

    const inputJson = job.input_json as Record<string, unknown>;
    const offer = (inputJson?.offer as string) || 'promo';
    const siteUrl = (inputJson?.site_url as string) || '';
    const variantName = job.variant_name || 'A';

    // Organize videos with variant tags
    const videos = assets
      .filter(a => a.asset_type.startsWith('video_'))
      .map(a => {
        const meta = a.meta_json as Record<string, unknown>;
        const ratio = a.asset_type === 'video_9_16' ? '9:16' :
                      a.asset_type === 'video_1_1' ? '1:1' : '16:9';
        const variant = (meta?.variant as string) || variantName;
        return {
          format: a.asset_type,
          aspect_ratio: ratio,
          url: a.url || '',
          filename: generateFilename(brandName, offer, ratio, `video_${variant}`) + '.mp4',
          variant
        };
      });

    // Organize thumbnails (generate from video frames if not available)
    const thumbnails = assets
      .filter(a => a.asset_type === 'thumbnail')
      .map((a, i) => ({
        variant: i + 1,
        url: a.url || '',
        filename: generateFilename(brandName, offer, '1x1', 'thumb', i + 1) + '.jpg'
      }));

    // If no thumbnails, create placeholders
    if (thumbnails.length === 0) {
      for (let i = 1; i <= 3; i++) {
        thumbnails.push({
          variant: i,
          url: '', // Would be generated from video frames
          filename: generateFilename(brandName, offer, '1x1', 'thumb', i) + '.jpg'
        });
      }
    }

    // Organize subtitles
    const subtitles = assets
      .filter(a => a.asset_type === 'srt')
      .map(a => {
        const meta = a.meta_json as Record<string, unknown>;
        return {
          format: (meta?.aspect_ratio as string) || 'all',
          srt_content: (meta?.content as string) || '',
          filename: generateFilename(brandName, offer, (meta?.aspect_ratio as string) || 'all', 'subtitles') + '.srt'
        };
      });

    // Get copy pack
    const copyAsset = assets.find(a => a.asset_type === 'copy_pack');
    const copyPack = (copyAsset?.meta_json as Record<string, unknown>) || {
      hooks: [],
      headlines: [],
      primary_texts: [],
      ctas: [],
      scripts: []
    };

    // Generate UTM links
    const utmLinks: Record<string, string> = {};
    const variantUtmLinks: Record<string, Record<string, string>> = {};
    
    if (include_utm && siteUrl) {
      const baseParams = {
        source: utm_params?.source || 'paid_social',
        medium: utm_params?.medium || 'video',
        campaign: utm_params?.campaign || offer.toLowerCase().replace(/\s+/g, '_')
      };

      utmLinks['meta_reels'] = generateUTMLink(siteUrl, { ...baseParams, source: 'instagram', content: 'reels' });
      utmLinks['meta_feed'] = generateUTMLink(siteUrl, { ...baseParams, source: 'facebook', content: 'feed' });
      utmLinks['youtube_ads'] = generateUTMLink(siteUrl, { ...baseParams, source: 'youtube', content: 'trueview' });
      utmLinks['tiktok'] = generateUTMLink(siteUrl, { ...baseParams, source: 'tiktok', content: 'infeed' });
      
      // V2: Generate variant-specific UTM links for A/B experiments
      if (experimentInfo) {
        for (const variant of experimentInfo.variants) {
          variantUtmLinks[variant] = {
            meta_reels: generateUTMLink(siteUrl, { ...baseParams, source: 'instagram', content: `reels_${variant.toLowerCase()}` }),
            meta_feed: generateUTMLink(siteUrl, { ...baseParams, source: 'facebook', content: `feed_${variant.toLowerCase()}` }),
            youtube_ads: generateUTMLink(siteUrl, { ...baseParams, source: 'youtube', content: `trueview_${variant.toLowerCase()}` }),
            tiktok: generateUTMLink(siteUrl, { ...baseParams, source: 'tiktok', content: `infeed_${variant.toLowerCase()}` })
          };
        }
      }
    }

    // Generate launch checklist
    const launchChecklist = generateLaunchChecklist(videos);
    
    // V2: Build audit manifest for compliance
    const auditManifest = {
      exported_at: new Date().toISOString(),
      exported_by: userId,
      job_id,
      experiment_id: experimentInfo?.id,
      variants_exported: [...new Set(videos.map(v => v.variant))],
      asset_counts: {
        videos: videos.length,
        thumbnails: thumbnails.length,
        subtitles: subtitles.length
      }
    };

    const exportData: AdPackExport = {
      job_id,
      experiment_id: experimentInfo?.id,
      variant_name: variantName,
      generated_at: new Date().toISOString(),
      videos,
      thumbnails,
      subtitles,
      copy_pack: {
        hooks: (copyPack.hooks as string[]) || [],
        headlines: (copyPack.headlines as string[]) || [],
        primary_texts: (copyPack.primary_texts as string[]) || [],
        ctas: (copyPack.ctas as string[]) || [],
        scripts: (copyPack.scripts as Array<{ duration: number; script: string }>) || []
      },
      utm_links: utmLinks,
      variant_utm_links: Object.keys(variantUtmLinks).length > 0 ? variantUtmLinks : undefined,
      launch_checklist: launchChecklist,
      audit_manifest: auditManifest
    };

    // Log export action
    await serviceClient
      .from('action_log')
      .insert({
        workspace_id,
        site_id: job.site_id,
        actor_type: 'user',
        actor_id: userId,
        action_type: 'creative_export',
        action_category: 'creative',
        description: `Exported Ad Pack: ${videos.length} videos, ${subtitles.length} SRT files`,
        details: {
          job_id,
          video_formats: videos.map(v => v.aspect_ratio),
          include_utm
        }
      });

    console.log('[creative-export] Export completed:', job_id);

    return new Response(
      JSON.stringify({
        success: true,
        export: exportData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[creative-export] Error:', error);
    const message = error instanceof Error ? error.message : 'Export failed';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
