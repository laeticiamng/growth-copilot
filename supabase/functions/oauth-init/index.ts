import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateRoleAccess, forbiddenResponse, logIntegrationAction } from "../_shared/auth.ts";

interface OAuthInitRequest {
  workspace_id: string;
  provider: "google_analytics" | "google_search_console" | "google_ads" | "youtube" | "google_business_profile" | "meta";
  redirect_url: string;
}

// Provider configurations
type ProviderType = "google" | "meta";

interface ProviderConfig {
  type: ProviderType;
  scopes: string[];
  authUrl: string;
}

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  google_analytics: {
    type: "google",
    scopes: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "openid",
      "email",
      "profile",
    ],
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  },
  google_search_console: {
    type: "google",
    scopes: [
      "https://www.googleapis.com/auth/webmasters.readonly",
      "openid",
      "email",
      "profile",
    ],
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  },
  google_ads: {
    type: "google",
    scopes: [
      "https://www.googleapis.com/auth/adwords",
      "openid",
      "email",
      "profile",
    ],
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  },
  youtube: {
    type: "google",
    scopes: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
      "openid",
      "email",
      "profile",
    ],
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  },
  google_business_profile: {
    type: "google",
    scopes: [
      "https://www.googleapis.com/auth/business.manage",
      "openid",
      "email",
      "profile",
    ],
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  },
  google_combined: {
    type: "google",
    scopes: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/webmasters.readonly",
      "openid",
      "email",
      "profile",
    ],
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  },
  meta: {
    type: "meta",
    scopes: [
      // Core
      "public_profile",
      "email",
      // Marketing API (Ads)
      "ads_read",
      "ads_management",
      "business_management",
      // Pages & Instagram
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "pages_messaging",
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_insights",
      "instagram_manage_comments",
      // WhatsApp (requires Business verification)
      "whatsapp_business_messaging",
      "whatsapp_business_management",
    ],
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
  },
  // Separate configs for granular permission requests
  meta_ads: {
    type: "meta",
    scopes: [
      "public_profile",
      "email",
      "ads_read",
      "business_management",
    ],
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
  },
  meta_instagram: {
    type: "meta",
    scopes: [
      "public_profile",
      "email",
      "pages_show_list",
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_insights",
    ],
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
  },
  meta_messaging: {
    type: "meta",
    scopes: [
      "public_profile",
      "email",
      "pages_show_list",
      "pages_messaging",
      "whatsapp_business_messaging",
    ],
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
  },
};

// Whitelist of allowed redirect URL origins
const ALLOWED_REDIRECT_ORIGINS = [
  "https://id-preview--c548a033-0937-4830-bc84-bb2548968cd3.lovable.app",
  "https://lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Allowed domain patterns for dynamic Lovable environments
const ALLOWED_DOMAIN_PATTERNS = [
  /\.lovable\.app$/,
  /\.lovableproject\.com$/,
];

/**
 * Validates that redirect_url is from an allowed origin
 */
function isValidRedirectUrl(redirectUrl: string): boolean {
  try {
    const url = new URL(redirectUrl);
    const origin = url.origin;
    const hostname = url.hostname;
    
    // Check exact match first
    if (ALLOWED_REDIRECT_ORIGINS.includes(origin)) {
      return true;
    }
    
    // Check dynamic Lovable domain patterns
    return ALLOWED_DOMAIN_PATTERNS.some(pattern => pattern.test(hostname));
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
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const META_APP_ID = Deno.env.get("META_APP_ID");
  const OAUTH_STATE_SECRET = Deno.env.get("OAUTH_STATE_SECRET");

  try {
    // Parse body first to get workspace_id for auth check
    const body: OAuthInitRequest = await req.json();
    const { workspace_id, provider, redirect_url } = body;

    if (!workspace_id || !provider || !redirect_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: workspace_id, provider, redirect_url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // RBAC: Require admin role for integration management
    const authResult = await validateRoleAccess(
      req,
      workspace_id,
      "admin",
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY
    );

    if (!authResult.hasRequiredRole) {
      console.error(`OAuth init denied for user ${authResult.userId}: ${authResult.error}`);
      return forbiddenResponse(
        authResult.error || "Admin role required for integration management",
        corsHeaders
      );
    }

    const userId = authResult.userId!;

    if (!OAUTH_STATE_SECRET) {
      return new Response(
        JSON.stringify({ 
          error: "OAuth security not configured",
          message: "OAUTH_STATE_SECRET is missing. Please configure it in Lovable Cloud.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Get provider config
    const providerConfig = PROVIDER_CONFIGS[provider];
    if (!providerConfig) {
      return new Response(
        JSON.stringify({ error: `Unsupported provider: ${provider}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate credentials for the provider type
    if (providerConfig.type === "google" && !GOOGLE_CLIENT_ID) {
      return new Response(
        JSON.stringify({ 
          error: "Google OAuth not configured",
          message: "GOOGLE_CLIENT_ID secret is missing. Please configure it in Lovable Cloud.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (providerConfig.type === "meta" && !META_APP_ID) {
      return new Response(
        JSON.stringify({ 
          error: "Meta OAuth not configured",
          message: "META_APP_ID secret is missing. Please configure it in Lovable Cloud.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Build OAuth authorization URL based on provider type
    const authUrl = new URL(providerConfig.authUrl);
    const redirectUri = `${SUPABASE_URL}/functions/v1/oauth-callback`;

    if (providerConfig.type === "google") {
      authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID!);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", providerConfig.scopes.join(" "));
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
    } else if (providerConfig.type === "meta") {
      authUrl.searchParams.set("client_id", META_APP_ID!);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", providerConfig.scopes.join(","));
      authUrl.searchParams.set("state", state);
    }

    console.log(`OAuth init for ${provider}, workspace ${workspace_id}, user ${userId}, role ${authResult.role}`);

    // Log the integration action
    await logIntegrationAction(
      SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_URL,
      workspace_id,
      userId,
      "integration_connected",
      provider,
      { scopes: providerConfig.scopes }
    );

    return new Response(
      JSON.stringify({
        success: true,
        auth_url: authUrl.toString(),
        provider,
        scopes: providerConfig.scopes,
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
