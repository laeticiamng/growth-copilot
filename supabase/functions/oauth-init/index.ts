import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OAuthInitRequest {
  workspace_id: string;
  provider: "google_analytics" | "google_search_console" | "google_ads" | "youtube";
  redirect_url: string;
}

// Scopes for each provider
const PROVIDER_SCOPES: Record<string, string[]> = {
  google_analytics: [
    "https://www.googleapis.com/auth/analytics.readonly",
    "openid",
    "email",
    "profile",
  ],
  google_search_console: [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "openid",
    "email",
    "profile",
  ],
  google_ads: [
    "https://www.googleapis.com/auth/adwords",
    "openid",
    "email",
    "profile",
  ],
  youtube: [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
    "openid",
    "email",
    "profile",
  ],
  google_combined: [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
    "openid",
    "email",
    "profile",
  ],
};

// Whitelist of allowed redirect URL origins
const ALLOWED_REDIRECT_ORIGINS = [
  "https://id-preview--c548a033-0937-4830-bc84-bb2548968cd3.lovable.app",
  "https://lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

/**
 * Validates that redirect_url is from an allowed origin
 */
function isValidRedirectUrl(redirectUrl: string): boolean {
  try {
    const url = new URL(redirectUrl);
    const origin = url.origin;
    return ALLOWED_REDIRECT_ORIGINS.some(allowed => 
      origin === allowed || origin.endsWith('.lovable.app')
    );
  } catch {
    return false;
  }
}

/**
 * Generate HMAC signature for state verification
 */
async function generateHmac(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate cryptographically secure nonce
 */
function generateNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Initiates OAuth flow for Google APIs
 * Returns the authorization URL for the user to visit
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const OAUTH_STATE_SECRET = Deno.env.get("OAUTH_STATE_SECRET");

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabaseClient.auth.getClaims(token);
    
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub as string;

    if (!GOOGLE_CLIENT_ID) {
      return new Response(
        JSON.stringify({ 
          error: "Google OAuth not configured",
          message: "GOOGLE_CLIENT_ID secret is missing. Please configure it in Lovable Cloud.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!OAUTH_STATE_SECRET) {
      return new Response(
        JSON.stringify({ 
          error: "OAuth security not configured",
          message: "OAUTH_STATE_SECRET is missing. Please configure it in Lovable Cloud.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: OAuthInitRequest = await req.json();
    const { workspace_id, provider, redirect_url } = body;

    if (!workspace_id || !provider || !redirect_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: workspace_id, provider, redirect_url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate redirect URL against whitelist
    if (!isValidRedirectUrl(redirect_url)) {
      console.error(`Invalid redirect URL attempted: ${redirect_url}`);
      return new Response(
        JSON.stringify({ error: "Invalid redirect_url: not in allowed origins" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get scopes for provider
    const scopes = PROVIDER_SCOPES[provider];
    if (!scopes) {
      return new Response(
        JSON.stringify({ error: `Unsupported provider: ${provider}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate secure nonce for state
    const nonce = generateNonce();
    const timestamp = Date.now();
    const expiresAt = new Date(timestamp + 10 * 60 * 1000); // 10 minutes TTL

    // Create state data to sign
    const stateData = {
      nonce,
      workspace_id,
      provider,
      redirect_url,
      user_id: userId,
      timestamp,
    };

    // Generate HMAC signature for state integrity
    const dataToSign = JSON.stringify(stateData);
    const hmacSignature = await generateHmac(dataToSign, OAUTH_STATE_SECRET);

    // Store nonce in database for verification (using service role)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { error: insertError } = await supabaseAdmin
      .from("oauth_state_nonces")
      .insert({
        nonce,
        workspace_id,
        provider,
        redirect_url,
        user_id: userId,
        hmac_signature: hmacSignature,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Failed to store OAuth nonce:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to initialize OAuth flow" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // State only contains nonce - all sensitive data stored server-side
    const state = btoa(JSON.stringify({ nonce, sig: hmacSignature }));

    // Build OAuth authorization URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", `${SUPABASE_URL}/functions/v1/oauth-callback`);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes.join(" "));
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");

    console.log(`OAuth init for ${provider}, workspace ${workspace_id}, nonce ${nonce.substring(0, 8)}...`);

    return new Response(
      JSON.stringify({
        success: true,
        auth_url: authUrl.toString(),
        provider,
        scopes,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("OAuth init error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
