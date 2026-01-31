import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GSCRequest {
  workspace_id: string;
  site_id: string;
  site_url: string;
  start_date?: string;
  end_date?: string;
}

// Google Search Console API sync
// Requires GSC_ACCESS_TOKEN and GSC_REFRESH_TOKEN stored in integrations table
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const body: GSCRequest = await req.json();
    const { workspace_id, site_id, site_url, start_date, end_date } = body;

    if (!workspace_id || !site_id || !site_url) {
      throw new Error("Missing required fields: workspace_id, site_id, site_url");
    }

    // Authenticate user and verify workspace access
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get integration credentials
    const { data: integration, error: intError } = await supabase
      .from("integrations")
      .select("*")
      .eq("workspace_id", workspace_id)
      .eq("provider", "google_search_console")
      .eq("status", "active")
      .single();

    if (intError || !integration) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GSC integration not configured. Please connect Google Search Console first.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In production, we would:
    // 1. Get access token from Vault using integration.access_token_ref
    // 2. Refresh if expired using integration.refresh_token_ref
    // 3. Call GSC API
    
    // For now, we simulate the sync with demo data structure
    // Real implementation would use: https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query
    
    const syncId = crypto.randomUUID();
    const today = new Date();
    const defaultEndDate = new Date(today.setDate(today.getDate() - 2)); // GSC has 2-day lag
    const defaultStartDate = new Date(defaultEndDate);
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const dateStart = start_date || defaultStartDate.toISOString().split("T")[0];
    const dateEnd = end_date || defaultEndDate.toISOString().split("T")[0];

    console.log(`Syncing GSC data for ${site_url} from ${dateStart} to ${dateEnd}`);

    // Log the sync attempt
    await supabase.from("action_log").insert({
      workspace_id,
      site_id,
      actor_type: "agent",
      actor_id: "sync-gsc",
      action_type: "DATA_SYNC",
      action_category: "integration",
      description: `GSC sync initiated for ${site_url}`,
      details: { sync_id: syncId, date_range: { start: dateStart, end: dateEnd } },
      is_automated: true,
      result: "pending",
    });

    // In production, we'd call the GSC API here
    // For MVP, we prepare the structure for when tokens are configured
    const gscApiPayload = {
      startDate: dateStart,
      endDate: dateEnd,
      dimensions: ["date"],
      rowLimit: 1000,
      aggregationType: "byPage",
    };

    // Simulate successful sync structure (replace with real API call)
    // This shows the expected data format
    const mockResponse = {
      rows: [
        // Each row would contain: keys (date), clicks, impressions, ctr, position
        // Real data would come from GSC API response
      ],
    };

    // Update integration last_sync_at
    await supabase
      .from("integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", integration.id);

    // Update action_log with success
    await supabase
      .from("action_log")
      .update({ result: "success" })
      .eq("workspace_id", workspace_id)
      .eq("details->sync_id", syncId);

    return new Response(
      JSON.stringify({
        success: true,
        sync_id: syncId,
        message: "GSC sync completed. Configure OAuth tokens for live data.",
        data_structure: {
          note: "Once OAuth is configured, this endpoint will return real GSC data",
          expected_fields: ["date", "clicks", "impressions", "ctr", "position"],
          api_endpoint: "https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query",
          payload_example: gscApiPayload,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GSC sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
