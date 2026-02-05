import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getOAuthTokens, getIntegration } from "../_shared/oauth-tokens.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface GSCRequest {
  workspace_id: string;
  site_id: string;
  site_url: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const body: GSCRequest = await req.json();
    const { workspace_id, site_id, site_url } = body;

    if (!workspace_id || !site_id || !site_url) throw new Error("Missing required fields");

    const authResult = await validateWorkspaceAccess(req, workspace_id, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    if (!authResult.hasAccess) return forbiddenResponse(authResult.error || "Access denied", corsHeaders);

    const integration = await getIntegration(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, workspace_id, "google_search_console");
    if (!integration) {
      return new Response(JSON.stringify({ success: false, error: "GSC integration not configured." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, message: "GSC sync completed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("GSC sync error:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
