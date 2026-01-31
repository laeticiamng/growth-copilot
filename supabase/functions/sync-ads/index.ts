import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getOAuthTokens, getIntegration } from "../_shared/oauth-tokens.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncAdsRequest {
  workspace_id: string;
  customer_id?: string;
  start_date?: string;
  end_date?: string;
}

// Google Ads API sync
// Uses encrypted OAuth tokens from oauth_tokens table
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TOKEN_ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY");
  const GOOGLE_ADS_DEV_TOKEN = Deno.env.get("GOOGLE_ADS_DEV_TOKEN");

  try {
    const body: SyncAdsRequest = await req.json();
    const { workspace_id, customer_id, start_date, end_date } = body;

    if (!workspace_id) {
      throw new Error("Missing required field: workspace_id");
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
      "google_ads"
    );

    if (!integration) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Google Ads integration not configured. Please connect Google Ads first.",
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
          error: "OAuth tokens not found or expired. Please reconnect Google Ads.",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const syncId = crypto.randomUUID();
    const today = new Date();
    const defaultEndDate = new Date(today.setDate(today.getDate() - 1));
    const defaultStartDate = new Date(defaultEndDate);
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const dateStart = start_date || defaultStartDate.toISOString().split("T")[0];
    const dateEnd = end_date || defaultEndDate.toISOString().split("T")[0];

    // Get customer ID from integration or request
    const adsCustomerId = customer_id || integration.account_id;
    if (!adsCustomerId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Google Ads customer ID not configured.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Syncing Google Ads for customer ${adsCustomerId} from ${dateStart} to ${dateEnd}`);

    // Log the sync attempt
    await supabase.from("action_log").insert({
      workspace_id,
      actor_type: "agent",
      actor_id: "sync-ads",
      action_type: "DATA_SYNC",
      action_category: "integration",
      description: `Google Ads sync initiated for customer ${adsCustomerId}`,
      details: { sync_id: syncId, customer_id: adsCustomerId, date_range: { start: dateStart, end: dateEnd } },
      is_automated: true,
      result: "pending",
    });

    // Build Google Ads API query
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign_budget.amount_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM campaign
      WHERE segments.date BETWEEN '${dateStart}' AND '${dateEnd}'
      ORDER BY metrics.cost_micros DESC
      LIMIT 100
    `;

    // Format customer ID (remove dashes if present)
    const formattedCustomerId = adsCustomerId.replace(/-/g, "");

    const adsApiUrl = `https://googleads.googleapis.com/v17/customers/${formattedCustomerId}/googleAds:search`;

    // Check for developer token
    if (!GOOGLE_ADS_DEV_TOKEN) {
      console.warn("GOOGLE_ADS_DEV_TOKEN not configured - using demo mode");
      
      // Return demo response
      await supabase
        .from("action_log")
        .update({ 
          result: "success",
          details: { sync_id: syncId, demo_mode: true, message: "Developer token not configured" }
        })
        .eq("workspace_id", workspace_id)
        .eq("details->>sync_id", syncId);

      return new Response(
        JSON.stringify({
          success: true,
          sync_id: syncId,
          message: "Sync completed in demo mode (developer token not configured)",
          demo_mode: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adsResponse = await fetch(adsApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokens.accessToken}`,
        "developer-token": GOOGLE_ADS_DEV_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!adsResponse.ok) {
      const errorText = await adsResponse.text();
      console.error("Google Ads API error:", adsResponse.status, errorText);
      
      await supabase
        .from("action_log")
        .update({ result: "error", details: { error: errorText } })
        .eq("workspace_id", workspace_id)
        .eq("details->>sync_id", syncId);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Google Ads API error: ${adsResponse.status}`,
          details: errorText,
        }),
        { status: adsResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adsData = await adsResponse.json();
    const results = adsData.results || [];
    let syncedCount = 0;

    // Get or create ads_account
    let adsAccountId: string;
    const { data: existingAccount } = await supabase
      .from("ads_accounts")
      .select("id")
      .eq("workspace_id", workspace_id)
      .eq("account_id", adsCustomerId)
      .single();

    if (existingAccount) {
      adsAccountId = existingAccount.id;
    } else {
      const { data: newAccount } = await supabase
        .from("ads_accounts")
        .insert({
          workspace_id,
          account_id: adsCustomerId,
          account_name: `Google Ads ${adsCustomerId}`,
          integration_id: integration.id,
          is_active: true,
        })
        .select("id")
        .single();
      
      adsAccountId = newAccount?.id;
    }

    // Sync campaigns
    for (const result of results) {
      const campaign = result.campaign;
      const metrics = result.metrics || {};
      const budget = result.campaignBudget || {};

      if (campaign?.id && adsAccountId) {
        await supabase.from("campaigns").upsert({
          workspace_id,
          ads_account_id: adsAccountId,
          campaign_id: campaign.id,
          name: campaign.name || "Untitled",
          status: campaign.status?.toLowerCase() || "unknown",
          campaign_type: campaign.advertisingChannelType || null,
          budget_daily: budget.amountMicros ? budget.amountMicros / 1000000 : null,
          impressions_30d: metrics.impressions || 0,
          clicks_30d: metrics.clicks || 0,
          cost_30d: metrics.costMicros ? metrics.costMicros / 1000000 : 0,
          conversions_30d: Math.round(metrics.conversions || 0),
        }, {
          onConflict: "workspace_id,campaign_id",
        });
        syncedCount++;
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
        details: { sync_id: syncId, campaigns_synced: syncedCount }
      })
      .eq("workspace_id", workspace_id)
      .eq("details->>sync_id", syncId);

    return new Response(
      JSON.stringify({
        success: true,
        sync_id: syncId,
        message: `Google Ads sync completed. ${syncedCount} campaigns synced.`,
        campaigns_synced: syncedCount,
        date_range: { start: dateStart, end: dateEnd },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Google Ads sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
