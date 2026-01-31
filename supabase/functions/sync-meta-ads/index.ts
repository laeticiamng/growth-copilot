import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH_API_VERSION = "v19.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface SyncMetaAdsRequest {
  workspace_id: string;
  integration_id: string;
  sync_insights?: boolean;
  date_range?: { start: string; end: string };
}

/**
 * Decrypt token from oauth_tokens table
 */
async function decryptToken(
  encrypted: { ct: string; iv: string },
  keyHex: string
): Promise<string> {
  const keyBytes = new Uint8Array(keyHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const keyBuffer = new ArrayBuffer(32);
  new Uint8Array(keyBuffer).set(keyBytes);

  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const ctBytes = Uint8Array.from(atob(encrypted.ct), c => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    ctBytes
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Make Graph API request
 */
async function graphRequest<T>(
  endpoint: string,
  accessToken: string,
  params: Record<string, string> = {}
): Promise<{ data?: T; error?: { message: string } }> {
  const url = new URL(`${GRAPH_API_BASE}${endpoint}`);
  url.searchParams.set("access_token", accessToken);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  const json = await res.json();

  if (!res.ok || json.error) {
    return { error: json.error || { message: "Unknown error" } };
  }
  return { data: json.data || json };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TOKEN_ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY")!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body: SyncMetaAdsRequest = await req.json();
    const { workspace_id, integration_id, sync_insights = true, date_range } = body;

    if (!workspace_id || !integration_id) {
      return new Response(
        JSON.stringify({ error: "Missing workspace_id or integration_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get integration and tokens
    const { data: integration, error: intError } = await supabase
      .from("integrations")
      .select("id, provider, account_id")
      .eq("id", integration_id)
      .eq("workspace_id", workspace_id)
      .single();

    if (intError || !integration) {
      return new Response(
        JSON.stringify({ error: "Integration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: tokens, error: tokError } = await supabase
      .from("oauth_tokens")
      .select("access_ct, access_iv")
      .eq("integration_id", integration_id)
      .single();

    if (tokError || !tokens) {
      return new Response(
        JSON.stringify({ error: "OAuth tokens not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await decryptToken(
      { ct: tokens.access_ct, iv: tokens.access_iv },
      TOKEN_ENCRYPTION_KEY
    );

    console.log(`Syncing Meta Ads for workspace ${workspace_id}...`);

    // 1. Get Ad Accounts
    const accountsRes = await graphRequest<Array<{
      id: string;
      name: string;
      account_id: string;
      business?: { id: string };
      currency: string;
      timezone_name: string;
      account_status: number;
      spend_cap?: string;
      amount_spent: string;
    }>>(
      "/me/adaccounts",
      accessToken,
      { fields: "id,name,account_id,business,currency,timezone_name,account_status,spend_cap,amount_spent" }
    );

    if (accountsRes.error) {
      console.error("Failed to fetch ad accounts:", accountsRes.error);
      return new Response(
        JSON.stringify({ error: accountsRes.error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accounts = accountsRes.data || [];
    const syncedAccounts: string[] = [];
    const syncedCampaigns: string[] = [];
    const syncedAdsets: string[] = [];
    const syncedAds: string[] = [];

    for (const account of accounts) {
      // Upsert ad account
      const { data: dbAccount, error: accError } = await supabase
        .from("meta_ad_accounts")
        .upsert({
          workspace_id,
          integration_id,
          account_id: account.account_id,
          account_name: account.name,
          business_id: account.business?.id,
          currency: account.currency,
          timezone: account.timezone_name,
          account_status: account.account_status,
          spend_cap: account.spend_cap ? parseFloat(account.spend_cap) / 100 : null,
          amount_spent: parseFloat(account.amount_spent) / 100,
          last_sync_at: new Date().toISOString(),
        }, { onConflict: "workspace_id,account_id" })
        .select("id")
        .single();

      if (accError) {
        console.error("Failed to upsert account:", accError);
        continue;
      }

      syncedAccounts.push(account.account_id);

      // 2. Get Campaigns
      const campaignsRes = await graphRequest<Array<{
        id: string;
        name: string;
        objective: string;
        status: string;
        effective_status: string;
        daily_budget?: string;
        lifetime_budget?: string;
        bid_strategy?: string;
        start_time?: string;
        stop_time?: string;
      }>>(
        `/${account.id}/campaigns`,
        accessToken,
        { fields: "id,name,objective,status,effective_status,daily_budget,lifetime_budget,bid_strategy,start_time,stop_time", limit: "500" }
      );

      if (campaignsRes.error) {
        console.error(`Failed to fetch campaigns for ${account.id}:`, campaignsRes.error);
        continue;
      }

      for (const campaign of campaignsRes.data || []) {
        const { data: dbCampaign, error: campError } = await supabase
          .from("meta_campaigns")
          .upsert({
            workspace_id,
            ad_account_id: dbAccount.id,
            campaign_id: campaign.id,
            name: campaign.name,
            objective: campaign.objective,
            status: campaign.status,
            effective_status: campaign.effective_status,
            daily_budget: campaign.daily_budget ? parseFloat(campaign.daily_budget) / 100 : null,
            lifetime_budget: campaign.lifetime_budget ? parseFloat(campaign.lifetime_budget) / 100 : null,
            bid_strategy: campaign.bid_strategy,
            start_time: campaign.start_time,
            stop_time: campaign.stop_time,
          }, { onConflict: "workspace_id,campaign_id" })
          .select("id")
          .single();

        if (campError) {
          console.error("Failed to upsert campaign:", campError);
          continue;
        }

        syncedCampaigns.push(campaign.id);

        // 3. Get Adsets
        const adsetsRes = await graphRequest<Array<{
          id: string;
          name: string;
          status: string;
          effective_status: string;
          daily_budget?: string;
          lifetime_budget?: string;
          targeting?: object;
          optimization_goal?: string;
          billing_event?: string;
          bid_amount?: string;
          start_time?: string;
          end_time?: string;
        }>>(
          `/${campaign.id}/adsets`,
          accessToken,
          { fields: "id,name,status,effective_status,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event,bid_amount,start_time,end_time", limit: "500" }
        );

        if (adsetsRes.error) continue;

        for (const adset of adsetsRes.data || []) {
          const { data: dbAdset, error: adsetError } = await supabase
            .from("meta_adsets")
            .upsert({
              workspace_id,
              campaign_id: dbCampaign.id,
              adset_id: adset.id,
              name: adset.name,
              status: adset.status,
              effective_status: adset.effective_status,
              daily_budget: adset.daily_budget ? parseFloat(adset.daily_budget) / 100 : null,
              lifetime_budget: adset.lifetime_budget ? parseFloat(adset.lifetime_budget) / 100 : null,
              targeting: adset.targeting || {},
              optimization_goal: adset.optimization_goal,
              billing_event: adset.billing_event,
              bid_amount: adset.bid_amount ? parseFloat(adset.bid_amount) / 100 : null,
              start_time: adset.start_time,
              end_time: adset.end_time,
            }, { onConflict: "workspace_id,adset_id" })
            .select("id")
            .single();

          if (adsetError) continue;
          syncedAdsets.push(adset.id);

          // 4. Get Ads
          const adsRes = await graphRequest<Array<{
            id: string;
            name: string;
            status: string;
            effective_status: string;
            creative?: { id: string };
            tracking_specs?: object[];
            preview_shareable_link?: string;
          }>>(
            `/${adset.id}/ads`,
            accessToken,
            { fields: "id,name,status,effective_status,creative,tracking_specs,preview_shareable_link", limit: "500" }
          );

          if (adsRes.error) continue;

          for (const ad of adsRes.data || []) {
            await supabase
              .from("meta_ads")
              .upsert({
                workspace_id,
                adset_id: dbAdset.id,
                ad_id: ad.id,
                name: ad.name,
                status: ad.status,
                effective_status: ad.effective_status,
                creative_id: ad.creative?.id,
                tracking_specs: ad.tracking_specs || [],
                preview_url: ad.preview_shareable_link,
              }, { onConflict: "workspace_id,ad_id" });

            syncedAds.push(ad.id);
          }
        }
      }

      // 5. Sync Insights (last 30 days by default)
      if (sync_insights) {
        const endDate = date_range?.end || new Date().toISOString().split("T")[0];
        const startDate = date_range?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const insightsRes = await graphRequest<Array<{
          date_start: string;
          impressions: string;
          clicks: string;
          spend: string;
          reach: string;
          frequency: string;
          cpm: string;
          cpc: string;
          ctr: string;
          actions?: Array<{ action_type: string; value: string }>;
          action_values?: Array<{ action_type: string; value: string }>;
        }>>(
          `/${account.id}/insights`,
          accessToken,
          {
            fields: "impressions,clicks,spend,reach,frequency,cpm,cpc,ctr,actions,action_values",
            time_range: JSON.stringify({ since: startDate, until: endDate }),
            time_increment: "1",
            level: "account",
          }
        );

        if (!insightsRes.error && insightsRes.data) {
          for (const insight of insightsRes.data) {
            const conversions = insight.actions?.find(a => 
              ["purchase", "lead", "complete_registration"].includes(a.action_type)
            );
            const conversionValue = insight.action_values?.find(a => 
              a.action_type === "purchase"
            );

            await supabase.from("meta_insights").upsert({
              workspace_id,
              ad_account_id: dbAccount.id,
              date: insight.date_start,
              level: "account",
              impressions: parseInt(insight.impressions) || 0,
              clicks: parseInt(insight.clicks) || 0,
              spend: parseFloat(insight.spend) || 0,
              reach: parseInt(insight.reach) || 0,
              frequency: parseFloat(insight.frequency) || null,
              cpm: parseFloat(insight.cpm) || null,
              cpc: parseFloat(insight.cpc) || null,
              ctr: parseFloat(insight.ctr) || null,
              conversions: conversions ? parseInt(conversions.value) : 0,
              conversion_value: conversionValue ? parseFloat(conversionValue.value) : 0,
              actions: insight.actions || [],
            }, { onConflict: "workspace_id,ad_account_id,campaign_id,adset_id,ad_id,date,level" });
          }
        }
      }
    }

    // Update integration last_sync_at
    await supabase
      .from("integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", integration_id);

    console.log(`Meta Ads sync complete: ${syncedAccounts.length} accounts, ${syncedCampaigns.length} campaigns, ${syncedAdsets.length} adsets, ${syncedAds.length} ads`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: {
          accounts: syncedAccounts.length,
          campaigns: syncedCampaigns.length,
          adsets: syncedAdsets.length,
          ads: syncedAds.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Sync Meta Ads error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
