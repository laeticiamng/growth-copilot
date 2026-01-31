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
  // Combined scope for GA4 + GSC together
  google_combined: [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
    "openid",
    "email",
    "profile",
  ],
};

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
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!GOOGLE_CLIENT_ID) {
      return new Response(
        JSON.stringify({ 
          error: "Google OAuth not configured",
          message: "GOOGLE_CLIENT_ID secret is missing. Please configure it in Lovable Cloud.",
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

    // Get scopes for provider
    const scopes = PROVIDER_SCOPES[provider];
    if (!scopes) {
      return new Response(
        JSON.stringify({ error: `Unsupported provider: ${provider}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create state parameter (contains info for callback)
    const state = btoa(JSON.stringify({
      workspace_id,
      provider,
      redirect_url,
      user_id: claims.claims.sub,
      timestamp: Date.now(),
    }));

    // Build OAuth authorization URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", `${SUPABASE_URL}/functions/v1/oauth-callback`);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes.join(" "));
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("access_type", "offline"); // Get refresh token
    authUrl.searchParams.set("prompt", "consent"); // Force consent to get refresh token

    console.log(`OAuth init for ${provider}, workspace ${workspace_id}`);

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
