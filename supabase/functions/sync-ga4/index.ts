import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getOAuthTokens, getIntegration } from "../_shared/oauth-tokens.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GA4Request {
  workspace_id: string;
  site_id: string;
  property_id?: string; // Now optional - will be fetched from integration metadata
  start_date?: string;
  end_date?: string;
}

// Google Analytics 4 Data API sync
// Uses encrypted OAuth tokens from oauth_tokens table
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TOKEN_ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY");

  try {
    const body: GA4Request = await req.json();
    const { workspace_id, site_id, start_date, end_date } = body;
    let { property_id } = body;

    if (!workspace_id || !site_id) {
      throw new Error("Missing required fields: workspace_id, site_id");
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

    // Get integration
    const integration = await getIntegration(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      workspace_id,
      "google_analytics"
    );

    if (!integration) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GA4 integration not configured. Please connect Google Analytics first.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get property_id from site metadata if not provided
    if (!property_id) {
      const { data: site } = await supabase
        .from("sites")
        .select("metadata")
        .eq("id", site_id)
        .single();
      
      property_id = (site?.metadata as Record<string, unknown>)?.ga4_property_id as string;
      
      if (!property_id) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "GA4 property_id not configured. Please set ga4_property_id in site settings.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check if encryption key is configured
    if (!TOKEN_ENCRYPTION_KEY) {
      console.error("TOKEN_ENCRYPTION_KEY not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token encryption not configured. Contact administrator.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get decrypted OAuth tokens
    const tokens = await getOAuthTokens(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      TOKEN_ENCRYPTION_KEY,
      integration.id
    );

    if (!tokens) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "OAuth tokens not found or expired. Please reconnect Google Analytics.",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Call GA4 Data API with real token
    const ga4ApiUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${property_id}:runReport`;
    const ga4ApiPayload = {
      dateRanges: [{ startDate: dateStart, endDate: dateEnd }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "conversions" },
        { name: "totalRevenue" },
      ],
    };

    const ga4Response = await fetch(ga4ApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ga4ApiPayload),
    });

    if (!ga4Response.ok) {
      const errorText = await ga4Response.text();
      console.error("GA4 API error:", ga4Response.status, errorText);
      
      // Update action_log with error
      await supabase
        .from("action_log")
        .update({ result: "error", details: { error: errorText } })
        .eq("workspace_id", workspace_id)
        .eq("details->>sync_id", syncId);

      return new Response(
        JSON.stringify({
          success: false,
          error: `GA4 API error: ${ga4Response.status}`,
          details: errorText,
        }),
        { status: ga4Response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ga4Data = await ga4Response.json();

    // Parse and store data in kpis_daily
    const rows = ga4Data.rows || [];
    let insertedCount = 0;

    for (const row of rows) {
      const date = row.dimensionValues?.[0]?.value;
      const sessions = parseInt(row.metricValues?.[0]?.value || "0");
      const activeUsers = parseInt(row.metricValues?.[1]?.value || "0");
      const conversions = parseInt(row.metricValues?.[2]?.value || "0");
      const revenue = parseFloat(row.metricValues?.[3]?.value || "0");

      if (date) {
        // Format date from YYYYMMDD to YYYY-MM-DD
        const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
        
        await supabase.from("kpis_daily").upsert({
          workspace_id,
          site_id,
          date: formattedDate,
          organic_sessions: sessions,
          total_conversions: conversions,
          revenue,
          source: "ga4",
          sync_id: syncId,
          metrics_json: { activeUsers, sessions, conversions, revenue },
        }, {
          onConflict: "site_id,date",
        });
        insertedCount++;
      }
    }

    // Update integration last_sync_at
    await supabase
      .from("integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", integration.id);

    // Update action_log with success
    await supabase
      .from("action_log")
      .update({ 
        result: "success",
        details: { sync_id: syncId, property_id, rows_synced: insertedCount }
      })
      .eq("workspace_id", workspace_id)
      .eq("details->>sync_id", syncId);

    return new Response(
      JSON.stringify({
        success: true,
        sync_id: syncId,
        message: `GA4 sync completed. ${insertedCount} days of data synced.`,
        rows_synced: insertedCount,
        date_range: { start: dateStart, end: dateEnd },
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
