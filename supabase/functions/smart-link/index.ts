import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Expected path: /smart-link/{slug} or /smart-link/{slug}/click
  const slug = pathParts[1];
  const action = pathParts[2];

  if (!slug) {
    return new Response(
      JSON.stringify({ error: 'Slug is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Fetch media asset by slug
    const { data: asset, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('smart_link_slug', slug)
      .single();

    if (error || !asset) {
      return new Response(
        JSON.stringify({ error: 'Smart link not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle click tracking
    if (action === 'click' && req.method === 'POST') {
      const body = await req.json();
      const { platform, referrer, utm_source, utm_medium, utm_campaign, country, device } = body;

      await supabase.from('smart_link_clicks').insert({
        media_asset_id: asset.id,
        platform,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        country,
        device
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle email capture
    if (action === 'email' && req.method === 'POST') {
      const body = await req.json();
      const { email, consent_given, utm_source, utm_medium, utm_campaign } = body;

      if (!email || !consent_given) {
        return new Response(
          JSON.stringify({ error: 'Email and consent are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase.from('smart_link_emails').insert({
        media_asset_id: asset.id,
        workspace_id: asset.workspace_id,
        email,
        consent_given,
        utm_source,
        utm_medium,
        utm_campaign
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return smart link data for rendering
    const config = asset.smart_link_config || {};
    const links = config.links || {};

    // Build platform links
    const platformLinks = [];
    
    // Always include the original platform
    if (asset.platform === 'youtube_video' || asset.platform === 'youtube_channel') {
      platformLinks.push({
        platform: 'youtube',
        label: 'YouTube',
        url: asset.url,
        icon: 'youtube',
        color: '#FF0000'
      });
    }
    
    if (asset.platform.startsWith('spotify_')) {
      platformLinks.push({
        platform: 'spotify',
        label: 'Spotify',
        url: asset.url,
        icon: 'spotify',
        color: '#1DB954'
      });
    }

    // Add configured additional links
    if (links.apple_music) {
      platformLinks.push({
        platform: 'apple_music',
        label: 'Apple Music',
        url: links.apple_music,
        icon: 'apple',
        color: '#FA243C'
      });
    }
    
    if (links.youtube && asset.platform !== 'youtube_video') {
      platformLinks.push({
        platform: 'youtube',
        label: 'YouTube',
        url: links.youtube,
        icon: 'youtube',
        color: '#FF0000'
      });
    }
    
    if (links.spotify && !asset.platform.startsWith('spotify_')) {
      platformLinks.push({
        platform: 'spotify',
        label: 'Spotify',
        url: links.spotify,
        icon: 'spotify',
        color: '#1DB954'
      });
    }
    
    if (links.deezer) {
      platformLinks.push({
        platform: 'deezer',
        label: 'Deezer',
        url: links.deezer,
        icon: 'music',
        color: '#FF0092'
      });
    }
    
    if (links.soundcloud) {
      platformLinks.push({
        platform: 'soundcloud',
        label: 'SoundCloud',
        url: links.soundcloud,
        icon: 'cloud',
        color: '#FF5500'
      });
    }
    
    if (links.tidal) {
      platformLinks.push({
        platform: 'tidal',
        label: 'Tidal',
        url: links.tidal,
        icon: 'music',
        color: '#000000'
      });
    }
    
    if (links.amazon_music) {
      platformLinks.push({
        platform: 'amazon_music',
        label: 'Amazon Music',
        url: links.amazon_music,
        icon: 'music',
        color: '#FF9900'
      });
    }

    const smartLinkData = {
      id: asset.id,
      slug: asset.smart_link_slug,
      title: asset.title,
      artist_name: asset.artist_name,
      thumbnail_url: asset.thumbnail_url,
      embed_html: asset.embed_html,
      platform: asset.platform,
      links: platformLinks,
      show_email_capture: config.show_email_capture || false,
      email_capture_text: config.email_capture_text || 'Get notified about new releases',
      background_color: config.background_color || '#1a1a2e',
      text_color: config.text_color || '#ffffff',
      accent_color: config.accent_color || '#4a90d9'
    };

    return new Response(
      JSON.stringify(smartLinkData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Smart link error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});