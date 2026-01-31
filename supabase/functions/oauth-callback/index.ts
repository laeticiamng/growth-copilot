import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * OAuth callback handler for Google APIs (GA4, GSC)
 * Exchanges authorization code for tokens and stores in integrations table
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error);
      return redirectWithError("oauth_denied", state);
    }

    if (!code || !state) {
      return redirectWithError("missing_params", state);
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Missing Google OAuth credentials");
      return redirectWithError("config_error", state);
    }

    // Decode state (contains workspace_id, provider, redirect_url)
    let stateData: { workspace_id: string; provider: string; redirect_url: string };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return redirectWithError("invalid_state", null);
    }

    const { workspace_id, provider, redirect_url } = stateData;

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
      return redirectWithError("token_exchange_failed", state);
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate token expiry
    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    // Upsert integration record
    const { error: upsertError } = await supabase
      .from("integrations")
      .upsert({
        workspace_id,
        provider: provider as any,
        status: "active",
        account_id: accountInfo.id || accountInfo.email,
        account_name: accountInfo.email,
        access_token_ref: tokens.access_token, // In production, encrypt or use Vault
        refresh_token_ref: tokens.refresh_token || null,
        expires_at: expiresAt,
        scopes: tokens.scope ? tokens.scope.split(" ") : [],
        last_sync_at: new Date().toISOString(),
        metadata: {
          token_type: tokens.token_type,
          connected_at: new Date().toISOString(),
        },
      }, {
        onConflict: "workspace_id,provider",
      });

    if (upsertError) {
      console.error("Failed to save integration:", upsertError);
      return redirectWithError("save_failed", state);
    }

    console.log(`Integration ${provider} saved for workspace ${workspace_id}`);

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

function redirectWithError(error: string, state: string | null): Response {
  let redirectUrl = "/dashboard/integrations";
  
  if (state) {
    try {
      const stateData = JSON.parse(atob(state));
      redirectUrl = stateData.redirect_url || redirectUrl;
    } catch {}
  }

  const errorUrl = new URL(redirectUrl, "https://placeholder.com");
  errorUrl.searchParams.set("oauth", "error");
  errorUrl.searchParams.set("error_type", error);

  return new Response(null, {
    status: 302,
    headers: { Location: errorUrl.pathname + errorUrl.search },
  });
}
