import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP
const MAX_EMAIL_SUBMISSIONS_PER_HOUR = 5;

// In-memory rate limiter (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(ip: string, action: string): string {
  return `${ip}:${action}`;
}

function isRateLimited(ip: string, action: string, maxRequests: number, windowMs: number): boolean {
  const key = getRateLimitKey(ip, action);
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (entry.count >= maxRequests) {
    return true;
  }
  
  entry.count++;
  return false;
}

// Input validation helpers
const SLUG_REGEX = /^[a-zA-Z0-9_-]{3,64}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\//i;

function validateSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug);
}

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 254;
}

function sanitizeString(input: string | undefined, maxLength: number = 200): string | undefined {
  if (!input) return undefined;
  // Remove any null bytes and trim
  return input.replace(/\0/g, '').trim().slice(0, maxLength);
}

function validatePlatform(platform: string | undefined): string | undefined {
  const allowedPlatforms = ['youtube', 'spotify', 'apple_music', 'deezer', 'soundcloud', 'tidal', 'amazon_music'];
  if (!platform) return undefined;
  return allowedPlatforms.includes(platform) ? platform : undefined;
}

function getClientIP(req: Request): string {
  // Check various headers for client IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Expected path: /smart-link/{slug} or /smart-link/{slug}/click or /smart-link/{slug}/email
  const slug = pathParts[1];
  const action = pathParts[2];

  // Validate slug format
  if (!slug || !validateSlug(slug)) {
    return new Response(
      JSON.stringify({ error: 'Invalid slug format' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Apply general rate limiting
  if (isRateLimited(clientIP, 'general', MAX_REQUESTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Fetch media asset by slug - only return necessary public fields
    const { data: asset, error } = await supabase
      .from('media_assets')
      .select('id, smart_link_slug, title, artist_name, thumbnail_url, embed_html, platform, url, smart_link_config, workspace_id')
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
      let body;
      try {
        body = await req.json();
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { platform, referrer, utm_source, utm_medium, utm_campaign, country, device } = body;

      await supabase.from('smart_link_clicks').insert({
        media_asset_id: asset.id,
        platform: validatePlatform(platform),
        referrer: sanitizeString(referrer, 500),
        utm_source: sanitizeString(utm_source, 100),
        utm_medium: sanitizeString(utm_medium, 100),
        utm_campaign: sanitizeString(utm_campaign, 100),
        country: sanitizeString(country, 10),
        device: sanitizeString(device, 50)
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle email capture with strict rate limiting
    if (action === 'email' && req.method === 'POST') {
      // Apply stricter rate limiting for email submissions
      if (isRateLimited(clientIP, 'email', MAX_EMAIL_SUBMISSIONS_PER_HOUR, 60 * 60 * 1000)) {
        return new Response(
          JSON.stringify({ error: 'Too many email submissions. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '3600' } }
        );
      }

      let body;
      try {
        body = await req.json();
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { email, consent_given, utm_source, utm_medium, utm_campaign } = body;

      // Validate required fields
      if (!email || !consent_given) {
        return new Response(
          JSON.stringify({ error: 'Email and consent are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate email format
      if (!validateEmail(email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Ensure consent is explicitly true (not just truthy)
      if (consent_given !== true) {
        return new Response(
          JSON.stringify({ error: 'Explicit consent is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase.from('smart_link_emails').insert({
        media_asset_id: asset.id,
        workspace_id: asset.workspace_id,
        email: email.toLowerCase().trim(),
        consent_given: true,
        utm_source: sanitizeString(utm_source, 100),
        utm_medium: sanitizeString(utm_medium, 100),
        utm_campaign: sanitizeString(utm_campaign, 100)
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return smart link data for rendering (public read)
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
    
    if (asset.platform?.startsWith('spotify_')) {
      platformLinks.push({
        platform: 'spotify',
        label: 'Spotify',
        url: asset.url,
        icon: 'spotify',
        color: '#1DB954'
      });
    }

    // Add configured additional links (validate URLs)
    const validateAndAddLink = (url: string | undefined, platform: string, label: string, icon: string, color: string) => {
      if (url && typeof url === 'string' && URL_REGEX.test(url)) {
        platformLinks.push({ platform, label, url, icon, color });
      }
    };

    if (links.apple_music) {
      validateAndAddLink(links.apple_music, 'apple_music', 'Apple Music', 'apple', '#FA243C');
    }
    
    if (links.youtube && asset.platform !== 'youtube_video') {
      validateAndAddLink(links.youtube, 'youtube', 'YouTube', 'youtube', '#FF0000');
    }
    
    if (links.spotify && !asset.platform?.startsWith('spotify_')) {
      validateAndAddLink(links.spotify, 'spotify', 'Spotify', 'spotify', '#1DB954');
    }
    
    if (links.deezer) {
      validateAndAddLink(links.deezer, 'deezer', 'Deezer', 'music', '#FF0092');
    }
    
    if (links.soundcloud) {
      validateAndAddLink(links.soundcloud, 'soundcloud', 'SoundCloud', 'cloud', '#FF5500');
    }
    
    if (links.tidal) {
      validateAndAddLink(links.tidal, 'tidal', 'Tidal', 'music', '#000000');
    }
    
    if (links.amazon_music) {
      validateAndAddLink(links.amazon_music, 'amazon_music', 'Amazon Music', 'music', '#FF9900');
    }

    // Return only public-safe data (exclude workspace_id and internal fields)
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
    // Return generic error to avoid leaking internal details
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
