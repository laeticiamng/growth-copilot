import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

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

    // If workspace_id provided, require authentication
    if (workspace_id) {
      const authResult = await validateWorkspaceAccess(
        req,
        workspace_id,
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_KEY
      );

      if (!authResult.authenticated) {
        return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
      }

      if (!authResult.hasAccess) {
        return forbiddenResponse(authResult.error || "Access denied", corsHeaders);
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
      } catch (e) {
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
      
      // Check for quota exceeded
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

    // Save to database if asset ID provided
    if (media_asset_id && workspace_id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});
