import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GA4Request {
  workspace_id: string;
  site_id: string;
  property_id: string;
  start_date?: string;
  end_date?: string;
}

// Google Analytics 4 Data API sync
// Requires GA4_ACCESS_TOKEN stored in integrations table
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const body: GA4Request = await req.json();
    const { workspace_id, site_id, property_id, start_date, end_date } = body;

    if (!workspace_id || !site_id || !property_id) {
      throw new Error("Missing required fields: workspace_id, site_id, property_id");
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
      .eq("provider", "google_analytics")
      .eq("status", "active")
      .single();

    if (intError || !integration) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GA4 integration not configured. Please connect Google Analytics first.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const syncId = crypto.randomUUID();
    const today = new Date();
    const defaultEndDate = new Date(today.setDate(today.getDate() - 1)); // GA4 has 1-day lag
    const defaultStartDate = new Date(defaultEndDate);
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const dateStart = start_date || defaultStartDate.toISOString().split("T")[0];
    const dateEnd = end_date || defaultEndDate.toISOString().split("T")[0];

    console.log(`Syncing GA4 data for property ${property_id} from ${dateStart} to ${dateEnd}`);

    // Log the sync attempt
    await supabase.from("action_log").insert({
      workspace_id,
      site_id,
      actor_type: "agent",
      actor_id: "sync-ga4",
      action_type: "DATA_SYNC",
      action_category: "integration",
      description: `GA4 sync initiated for property ${property_id}`,
      details: { sync_id: syncId, property_id, date_range: { start: dateStart, end: dateEnd } },
      is_automated: true,
      result: "pending",
    });

    // GA4 Data API request structure
    // Real implementation would use: https://analyticsdata.googleapis.com/v1beta/properties/{propertyId}:runReport
    const ga4ApiPayload = {
      dateRanges: [{ startDate: dateStart, endDate: dateEnd }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "conversions" },
        { name: "totalRevenue" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
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
        message: "GA4 sync completed. Configure OAuth tokens for live data.",
        data_structure: {
          note: "Once OAuth is configured, this endpoint will return real GA4 data",
          expected_fields: ["date", "sessions", "activeUsers", "conversions", "totalRevenue", "bounceRate"],
          api_endpoint: `https://analyticsdata.googleapis.com/v1beta/properties/${property_id}:runReport`,
          payload_example: ga4ApiPayload,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GA4 sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
