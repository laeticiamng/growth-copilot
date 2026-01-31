import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface DetectionResult {
  platform: string;
  platform_id: string | null;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  embed_html: string | null;
  artist_name: string | null;
  metadata_json: Record<string, unknown>;
}

// URL Pattern detection
function detectPlatform(url: string): { platform: string; id: string | null } {
  const urlLower = url.toLowerCase();
  
  // YouTube Video
  const ytVideoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytVideoMatch) {
    return { platform: 'youtube_video', id: ytVideoMatch[1] };
  }
  
  // YouTube Channel
  const ytChannelMatch = url.match(/youtube\.com\/(?:channel\/|c\/|@)([a-zA-Z0-9_-]+)/);
  if (ytChannelMatch) {
    return { platform: 'youtube_channel', id: ytChannelMatch[1] };
  }
  
  // Spotify Track
  const spotifyTrackMatch = url.match(/(?:open\.spotify\.com|spotify\.link)\/track\/([a-zA-Z0-9]+)/);
  if (spotifyTrackMatch) {
    return { platform: 'spotify_track', id: spotifyTrackMatch[1] };
  }
  
  // Spotify Album
  const spotifyAlbumMatch = url.match(/(?:open\.spotify\.com|spotify\.link)\/album\/([a-zA-Z0-9]+)/);
  if (spotifyAlbumMatch) {
    return { platform: 'spotify_album', id: spotifyAlbumMatch[1] };
  }
  
  // Spotify Artist
  const spotifyArtistMatch = url.match(/(?:open\.spotify\.com|spotify\.link)\/artist\/([a-zA-Z0-9]+)/);
  if (spotifyArtistMatch) {
    return { platform: 'spotify_artist', id: spotifyArtistMatch[1] };
  }
  
  // Apple Music
  if (urlLower.includes('music.apple.com')) {
    const appleMatch = url.match(/music\.apple\.com\/[a-z]{2}\/(?:album|song)\/[^\/]+\/(\d+)/);
    return { platform: 'apple_music', id: appleMatch ? appleMatch[1] : null };
  }
  
  // SoundCloud
  if (urlLower.includes('soundcloud.com')) {
    return { platform: 'soundcloud', id: null };
  }
  
  // TikTok
  if (urlLower.includes('tiktok.com')) {
    const tiktokMatch = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
    return { platform: 'tiktok', id: tiktokMatch ? tiktokMatch[1] : null };
  }
  
  return { platform: 'other', id: null };
}

// Fetch YouTube metadata via oEmbed (no API key needed for basic info)
async function fetchYouTubeMetadata(url: string, videoId: string): Promise<Partial<DetectionResult>> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      console.error('YouTube oEmbed failed:', response.status);
      return {};
    }
    
    const data = await response.json();
    
    return {
      title: data.title,
      artist_name: data.author_name,
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      embed_html: data.html,
      metadata_json: {
        author_url: data.author_url,
        provider_name: data.provider_name,
        width: data.width,
        height: data.height,
      }
    };
  } catch (error) {
    console.error('YouTube metadata fetch error:', error);
    return {};
  }
}

// Fetch Spotify metadata via oEmbed (no auth needed)
async function fetchSpotifyMetadata(url: string): Promise<Partial<DetectionResult>> {
  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      console.error('Spotify oEmbed failed:', response.status);
      return {};
    }
    
    const data = await response.json();
    
    // Parse title - format is usually "Track Name - Artist Name" or just title
    let title = data.title;
    let artist_name = null;
    
    if (data.title && data.title.includes(' - ')) {
      const parts = data.title.split(' - ');
      artist_name = parts.pop();
      title = parts.join(' - ');
    }
    
    return {
      title,
      artist_name,
      thumbnail_url: data.thumbnail_url,
      embed_html: data.html,
      metadata_json: {
        provider_name: data.provider_name,
        provider_url: data.provider_url,
        width: data.width,
        height: data.height,
        thumbnail_width: data.thumbnail_width,
        thumbnail_height: data.thumbnail_height,
      }
    };
  } catch (error) {
    console.error('Spotify metadata fetch error:', error);
    return {};
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const { url, workspace_id, save } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If saving, require authentication and workspace access
    if (save && workspace_id) {
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

    // Detect platform
    const { platform, id: platform_id } = detectPlatform(url);
    
    // Fetch metadata based on platform
    let metadata: Partial<DetectionResult> = {};
    
    if (platform === 'youtube_video' && platform_id) {
      metadata = await fetchYouTubeMetadata(url, platform_id);
    } else if (platform.startsWith('spotify_')) {
      metadata = await fetchSpotifyMetadata(url);
    }
    
    const result: DetectionResult = {
      platform,
      platform_id,
      title: metadata.title || null,
      description: metadata.description || null,
      thumbnail_url: metadata.thumbnail_url || null,
      embed_html: metadata.embed_html || null,
      artist_name: metadata.artist_name || null,
      metadata_json: metadata.metadata_json || {},
    };

    // Optionally save to database (auth already verified above)
    if (save && workspace_id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      
      // Generate smart link slug
      const slug = `${platform_id || Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const { data: asset, error } = await supabase
        .from('media_assets')
        .insert({
          workspace_id,
          url,
          platform,
          platform_id,
          title: result.title,
          description: result.description,
          thumbnail_url: result.thumbnail_url,
          embed_html: result.embed_html,
          artist_name: result.artist_name,
          metadata_json: result.metadata_json,
          smart_link_slug: slug,
          status: 'draft'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Save error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to save asset', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Create initial metadata snapshot
      await supabase.from('media_metadata_snapshots').insert({
        media_asset_id: asset.id,
        workspace_id,
        source: platform,
        snapshot_json: result.metadata_json
      });
      
      return new Response(
        JSON.stringify({ ...result, asset }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Media detect error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});