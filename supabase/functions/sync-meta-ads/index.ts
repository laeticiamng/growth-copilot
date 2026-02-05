import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const body = await req.json();
    const { workspace_id, integration_id } = body;

    if (!workspace_id || !integration_id) {
      return new Response(
        JSON.stringify({ error: "Missing workspace_id or integration_id" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate user authentication and workspace access
    const authResult = await validateWorkspaceAccess(
      req,
      workspace_id,
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY
    );

    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    }

    if (!authResult.hasAccess) {
      return forbiddenResponse(authResult.error || "Access denied", corsHeaders);
    }

    console.log(`[SYNC-META-ADS] User ${authResult.userId} syncing Meta Ads for workspace ${workspace_id}...`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify integration exists and belongs to workspace
    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("id, provider, status")
      .eq("id", integration_id)
      .eq("workspace_id", workspace_id)
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: "Integration not found or access denied" }), 
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TODO: Implement actual Meta Ads sync logic here
    // For now, return success with placeholder data
    return new Response(
      JSON.stringify({ success: true, synced: { accounts: 0, campaigns: 0 } }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[SYNC-META-ADS] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
