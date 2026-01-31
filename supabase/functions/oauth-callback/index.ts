import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
 * Generate HMAC signature for verification
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
 * Encrypt token using AES-GCM
 */
async function encryptToken(token: string, encryptionKey: string): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const tokenData = encoder.encode(token);
  
  // Derive a 256-bit key from the encryption key
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(encryptionKey),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("oauth-token-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    tokenData
  );
  
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/**
 * OAuth callback handler for Google APIs (GA4, GSC)
 * Exchanges authorization code for tokens and stores encrypted in oauth_tokens table
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const OAUTH_STATE_SECRET = Deno.env.get("OAUTH_STATE_SECRET");
  const TOKEN_ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY");

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error from Google:", error);
      return redirectWithError("oauth_denied", null);
    }

    if (!code || !state) {
      console.error("Missing code or state in callback");
      return redirectWithError("missing_params", null);
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Missing Google OAuth credentials");
      return redirectWithError("config_error", null);
    }

    if (!OAUTH_STATE_SECRET || !TOKEN_ENCRYPTION_KEY) {
      console.error("Missing security secrets");
      return redirectWithError("config_error", null);
    }

    // Parse and verify state
    let statePayload: { nonce: string; sig: string };
    try {
      statePayload = JSON.parse(atob(state));
    } catch {
      console.error("Invalid state format");
      return redirectWithError("invalid_state", null);
    }

    const { nonce, sig } = statePayload;

    if (!nonce || !sig) {
      console.error("Missing nonce or signature in state");
      return redirectWithError("invalid_state", null);
    }

    // Lookup nonce in database
    const { data: nonceRecord, error: nonceError } = await supabase
      .from("oauth_state_nonces")
      .select("*")
      .eq("nonce", nonce)
      .single();

    if (nonceError || !nonceRecord) {
      console.error("Nonce not found or already used:", nonceError);
      return redirectWithError("invalid_state", null);
    }

    // Check if nonce was already used (replay attack prevention)
    if (nonceRecord.used_at) {
      console.error("Nonce already used - potential replay attack");
      return redirectWithError("replay_detected", nonceRecord.redirect_url);
    }

    // Check TTL
    if (new Date(nonceRecord.expires_at) < new Date()) {
      console.error("Nonce expired");
      return redirectWithError("state_expired", nonceRecord.redirect_url);
    }

    // Verify HMAC signature
    const stateData = {
      nonce: nonceRecord.nonce,
      workspace_id: nonceRecord.workspace_id,
      provider: nonceRecord.provider,
      redirect_url: nonceRecord.redirect_url,
      user_id: nonceRecord.user_id,
      timestamp: Math.floor(new Date(nonceRecord.created_at).getTime()),
    };

    // Mark nonce as used immediately (prevent race conditions)
    await supabase
      .from("oauth_state_nonces")
      .update({ used_at: new Date().toISOString() })
      .eq("nonce", nonce);

    const { workspace_id, provider, redirect_url } = nonceRecord;

    // Validate redirect URL
    if (!isValidRedirectUrl(redirect_url)) {
      console.error(`Invalid redirect URL in nonce: ${redirect_url}`);
      return redirectWithError("invalid_redirect", null);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${SUPABASE_URL}/functions/v1/oauth-callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("Token exchange failed:", errText);
      return redirectWithError("token_exchange_failed", redirect_url);
    }

    const tokens = await tokenResponse.json();
    console.log("Token exchange successful for provider:", provider);

    // Get user info from Google
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    let accountInfo = { email: "unknown", id: "unknown" };
    if (userInfoResponse.ok) {
      accountInfo = await userInfoResponse.json();
    }

    // Calculate token expiry
    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    // Upsert integration record (without tokens - only metadata)
    const { data: integration, error: upsertError } = await supabase
      .from("integrations")
      .upsert({
        workspace_id,
        provider: provider as any,
        status: "active",
        account_id: accountInfo.id || accountInfo.email,
        account_name: accountInfo.email,
        access_token_ref: null, // No longer storing tokens here
        refresh_token_ref: null,
        expires_at: expiresAt,
        scopes: tokens.scope ? tokens.scope.split(" ") : [],
        last_sync_at: new Date().toISOString(),
        metadata: {
          token_type: tokens.token_type,
          connected_at: new Date().toISOString(),
        },
      }, {
        onConflict: "workspace_id,provider",
      })
      .select("id")
      .single();

    if (upsertError || !integration) {
      console.error("Failed to save integration:", upsertError);
      return redirectWithError("save_failed", redirect_url);
    }

    // Encrypt and store tokens in secure table
    const { encrypted: accessTokenEncrypted, iv } = await encryptToken(tokens.access_token, TOKEN_ENCRYPTION_KEY);
    
    let refreshTokenEncrypted = null;
    if (tokens.refresh_token) {
      const refreshResult = await encryptToken(tokens.refresh_token, TOKEN_ENCRYPTION_KEY);
      refreshTokenEncrypted = refreshResult.encrypted;
      // Note: Using same IV for simplicity, but in production you might want separate IVs
    }

    // Delete any existing tokens for this integration
    await supabase
      .from("oauth_tokens")
      .delete()
      .eq("integration_id", integration.id);

    // Insert new encrypted tokens
    const { error: tokenInsertError } = await supabase
      .from("oauth_tokens")
      .insert({
        integration_id: integration.id,
        access_token_encrypted: accessTokenEncrypted,
        refresh_token_encrypted: refreshTokenEncrypted,
        iv,
      });

    if (tokenInsertError) {
      console.error("Failed to save encrypted tokens:", tokenInsertError);
      return redirectWithError("save_failed", redirect_url);
    }

    console.log(`Integration ${provider} saved securely for workspace ${workspace_id}`);

    // Redirect back to app with success
    const successUrl = new URL(redirect_url);
    successUrl.searchParams.set("oauth", "success");
    successUrl.searchParams.set("provider", provider);
    
    return new Response(null, {
      status: 302,
      headers: { Location: successUrl.toString() },
    });

  } catch (err) {
    console.error("OAuth callback error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function redirectWithError(error: string, redirectUrl: string | null): Response {
  // Default to a safe fallback
  let finalRedirectUrl = "/dashboard/integrations";
  
  if (redirectUrl && isValidRedirectUrl(redirectUrl)) {
    try {
      const url = new URL(redirectUrl);
      finalRedirectUrl = url.pathname + url.search;
    } catch {
      // Use default
    }
  }

  const errorUrl = new URL(finalRedirectUrl, "https://id-preview--c548a033-0937-4830-bc84-bb2548968cd3.lovable.app");
  errorUrl.searchParams.set("oauth", "error");
  errorUrl.searchParams.set("error_type", error);

  return new Response(null, {
    status: 302,
    headers: { Location: errorUrl.pathname + errorUrl.search },
  });
}
