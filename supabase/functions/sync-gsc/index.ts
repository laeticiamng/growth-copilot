import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getOAuthTokens, getIntegration } from "../_shared/oauth-tokens.ts";

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

    // Get integration
    const integration = await getIntegration(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      workspace_id,
      "google_search_console"
    );

    if (!integration) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GSC integration not configured. Please connect Google Search Console first.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
          error: "OAuth tokens not found or expired. Please reconnect Google Search Console.",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Format site URL for GSC API (needs to be URL-encoded)
    const encodedSiteUrl = encodeURIComponent(site_url);
    const gscApiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`;

    // Call GSC API with real token
    const gscApiPayload = {
      startDate: dateStart,
      endDate: dateEnd,
      dimensions: ["date"],
      rowLimit: 1000,
    };

    const gscResponse = await fetch(gscApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gscApiPayload),
    });

    if (!gscResponse.ok) {
      const errorText = await gscResponse.text();
      console.error("GSC API error:", gscResponse.status, errorText);
      
      // Update action_log with error
      await supabase
        .from("action_log")
        .update({ result: "error", details: { error: errorText } })
        .eq("workspace_id", workspace_id)
        .eq("details->>sync_id", syncId);

      return new Response(
        JSON.stringify({
          success: false,
          error: `GSC API error: ${gscResponse.status}`,
          details: errorText,
        }),
        { status: gscResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const gscData = await gscResponse.json();

    // Parse and store data in kpis_daily
    const rows = gscData.rows || [];
    let insertedCount = 0;

    for (const row of rows) {
      const date = row.keys?.[0]; // Date dimension
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      const ctr = row.ctr || 0;
      const position = row.position || 0;

      if (date) {
        await supabase.from("kpis_daily").upsert({
          workspace_id,
          site_id,
          date,
          organic_clicks: clicks,
          organic_impressions: impressions,
          avg_position: position,
          source: "gsc",
          sync_id: syncId,
          metrics_json: { clicks, impressions, ctr, position },
        }, {
          onConflict: "site_id,date",
        });
        insertedCount++;
      }
    }

    // Also fetch keywords data
    const keywordsPayload = {
      startDate: dateStart,
      endDate: dateEnd,
      dimensions: ["query"],
      rowLimit: 500,
    };

    const keywordsResponse = await fetch(gscApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(keywordsPayload),
    });

    if (keywordsResponse.ok) {
      const keywordsData = await keywordsResponse.json();
      const keywordRows = keywordsData.rows || [];

      for (const row of keywordRows) {
        const keyword = row.keys?.[0];
        if (keyword) {
          await supabase.from("keywords").upsert({
            workspace_id,
            site_id,
            keyword,
            clicks_30d: row.clicks || 0,
            impressions_30d: row.impressions || 0,
            ctr_30d: row.ctr || 0,
            position_avg: row.position || 0,
            is_tracked: true,
            source: "gsc",
          }, {
            onConflict: "site_id,keyword",
          });
        }
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
        details: { sync_id: syncId, rows_synced: insertedCount }
      })
      .eq("workspace_id", workspace_id)
      .eq("details->>sync_id", syncId);

    return new Response(
      JSON.stringify({
        success: true,
        sync_id: syncId,
        message: `GSC sync completed. ${insertedCount} days of data synced.`,
        rows_synced: insertedCount,
        date_range: { start: dateStart, end: dateEnd },
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
