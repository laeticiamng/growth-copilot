import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

interface YouTubeVideoStats {
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

interface YouTubeVideoSnippet {
  title: string;
  description: string;
  thumbnails: Record<string, { url: string }>;
  channelTitle: string;
  tags?: string[];
  categoryId: string;
}

/**
 * Validates auth and workspace access
 */
// deno-lint-ignore no-explicit-any
async function validateRequest(req: Request, workspaceId: string): Promise<{ 
  valid: boolean; 
  userId: string | null; 
  error: string | null;
  serviceClient: any;
}> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, userId: null, error: 'Missing Authorization header', serviceClient: null };
  }

  const token = authHeader.replace('Bearer ', '');
  
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  });

  try {
    const { data, error } = await userClient.auth.getUser(token);
    
    if (error || !data.user) {
      return { valid: false, userId: null, error: 'Invalid or expired token', serviceClient: null };
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: hasAccess, error: accessError } = await serviceClient.rpc('has_workspace_access', {
      _user_id: data.user.id,
      _workspace_id: workspaceId,
    });

    if (accessError || !hasAccess) {
      return { valid: false, userId: data.user.id, error: 'Access denied to workspace', serviceClient: null };
    }

    return { valid: true, userId: data.user.id, error: null, serviceClient };
  } catch (err) {
    return { valid: false, userId: null, error: 'Authentication failed', serviceClient: null };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { media_asset_id, workspace_id, video_id } = await req.json();

    if (!video_id) {
      return new Response(
        JSON.stringify({ error: 'video_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If updating database, require authentication
    if (media_asset_id && workspace_id) {
      const authResult = await validateRequest(req, workspace_id);
      if (!authResult.valid || !authResult.serviceClient) {
        return new Response(
          JSON.stringify({ error: authResult.error || 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = authResult.serviceClient;

      // Verify media asset belongs to workspace
      const { data: asset, error: assetError } = await supabase
        .from('media_assets')
        .select('id')
        .eq('id', media_asset_id)
        .eq('workspace_id', workspace_id)
        .single();

      if (assetError || !asset) {
        return new Response(
          JSON.stringify({ error: 'Media asset not found or access denied' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check if API key is configured
    if (!YOUTUBE_API_KEY) {
      // Fallback to oEmbed (basic info only)
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video_id}&format=json`;
        const oembedRes = await fetch(oembedUrl);
        
        if (!oembedRes.ok) {
          return new Response(
            JSON.stringify({ 
              error: 'YouTube API key not configured and oEmbed failed',
              mode: 'no_api_key'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const oembedData = await oembedRes.json();
        
        return new Response(
          JSON.stringify({
            mode: 'oembed',
            data: {
              title: oembedData.title,
              author_name: oembedData.author_name,
              author_url: oembedData.author_url,
              thumbnail_url: `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg`,
            },
            message: 'Using oEmbed fallback. Configure YOUTUBE_API_KEY for full statistics.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch {
        return new Response(
          JSON.stringify({ error: 'YouTube API key not configured', mode: 'no_api_key' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch video data using YouTube Data API
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${video_id}&part=snippet,statistics,contentDetails&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('YouTube API error:', response.status, error);
      
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: 'YouTube API quota exceeded',
            mode: 'quota_exceeded',
            message: 'Daily quota limit reached. Try again tomorrow or use oEmbed fallback.'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `YouTube API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Video not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const video = data.items[0];
    const snippet: YouTubeVideoSnippet = video.snippet;
    const stats: YouTubeVideoStats = video.statistics;
    const contentDetails = video.contentDetails;

    const result = {
      mode: 'api',
      data: {
        video_id,
        title: snippet.title,
        description: snippet.description,
        channel_title: snippet.channelTitle,
        thumbnail_url: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg`,
        tags: snippet.tags || [],
        category_id: snippet.categoryId,
        view_count: parseInt(stats.viewCount || '0'),
        like_count: parseInt(stats.likeCount || '0'),
        comment_count: parseInt(stats.commentCount || '0'),
        duration: contentDetails?.duration,
        definition: contentDetails?.definition,
        caption: contentDetails?.caption === 'true',
      }
    };

    // Save to database if asset ID provided and auth was validated
    if (media_asset_id && workspace_id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Update media asset
      await supabase
        .from('media_assets')
        .update({
          title: result.data.title,
          description: result.data.description,
          thumbnail_url: result.data.thumbnail_url,
          metadata_json: {
            ...result.data,
            synced_at: new Date().toISOString()
          }
        })
        .eq('id', media_asset_id);

      // Create metadata snapshot
      await supabase.from('media_metadata_snapshots').insert({
        media_asset_id,
        workspace_id,
        source: 'youtube_api',
        snapshot_json: result.data
      });

      // Save daily KPIs
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('media_kpis_daily').upsert({
        media_asset_id,
        workspace_id,
        source: 'youtube',
        date: today,
        views: result.data.view_count,
        likes: result.data.like_count,
        comments: result.data.comment_count,
        metrics_json: result.data
      }, {
        onConflict: 'media_asset_id,source,date'
      });
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('YouTube sync error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
