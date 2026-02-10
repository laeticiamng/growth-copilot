import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getOAuthTokens } from "../_shared/oauth-tokens.ts";
import { metaGraphRequest } from "../_shared/meta-api.ts";

interface SyncMetaAdsRequest {
  workspace_id: string;
  integration_id?: string;
}

interface MetaAdAccount {
  id: string;
  name?: string;
  account_status?: number;
  business?: { id: string };
  currency?: string;
  timezone_name?: string;
  spend_cap?: string;
  amount_spent?: string;
}

interface MetaCampaign {
  id: string;
  name: string;
  objective?: string;
  status?: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  bid_strategy?: string;
  start_time?: string;
  stop_time?: string;
}

function parseNumeric(value?: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value?: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TOKEN_ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY")!;

  try {
    const body: SyncMetaAdsRequest = await req.json();
    const { workspace_id, integration_id } = body;

    if (!workspace_id) {
      return new Response(
        JSON.stringify({ error: "Missing workspace_id" }),
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

    const providerCandidates = ["meta_ads", "meta"];

    // Verify integration exists and belongs to workspace
    const integrationQuery = supabase
      .from("integrations")
      .select("id, provider, status")
      .eq("workspace_id", workspace_id)
      .in("provider", providerCandidates)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(1);

    const { data: integrations, error: integrationError } = integration_id
      ? await integrationQuery.eq("id", integration_id)
      : await integrationQuery;

    const integration = integrations?.[0];

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: "Meta integration not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!providerCandidates.includes(integration.provider)) {
      return new Response(
        JSON.stringify({ error: `Invalid provider for this sync: ${integration.provider}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokens = await getOAuthTokens(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      TOKEN_ENCRYPTION_KEY,
      integration.id
    );

    if (!tokens?.accessToken) {
      return new Response(
        JSON.stringify({ error: "OAuth tokens not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adAccountsRes = await metaGraphRequest<MetaAdAccount[]>(
      "/me/adaccounts",
      tokens.accessToken,
      {
        params: {
          fields: "id,name,account_status,business,currency,timezone_name,spend_cap,amount_spent",
          limit: "50",
        },
      }
    );

    if (adAccountsRes.error) {
      return new Response(
        JSON.stringify({ error: adAccountsRes.error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const synced = {
      accounts: 0,
      campaigns: 0,
    };

    for (const adAccount of adAccountsRes.data || []) {
      const { data: dbAccount, error: accountUpsertError } = await supabase
        .from("meta_ad_accounts")
        .upsert(
          {
            workspace_id,
            integration_id: integration.id,
            account_id: adAccount.id,
            account_name: adAccount.name || adAccount.id,
            business_id: adAccount.business?.id || null,
            currency: adAccount.currency || "EUR",
            timezone: adAccount.timezone_name || null,
            account_status: adAccount.account_status || null,
            spend_cap: parseNumeric(adAccount.spend_cap),
            amount_spent: parseNumeric(adAccount.amount_spent) || 0,
            is_active: (adAccount.account_status || 0) === 1,
            last_sync_at: new Date().toISOString(),
          },
          { onConflict: "workspace_id,account_id" }
        )
        .select("id")
        .single();

      if (accountUpsertError || !dbAccount) {
        console.error("[SYNC-META-ADS] Failed to upsert ad account", adAccount.id, accountUpsertError);
        continue;
      }

      synced.accounts += 1;

      const campaignsRes = await metaGraphRequest<MetaCampaign[]>(
        `/${adAccount.id}/campaigns`,
        tokens.accessToken,
        {
          params: {
            fields: "id,name,objective,status,effective_status,daily_budget,lifetime_budget,bid_strategy,start_time,stop_time",
            limit: "100",
          },
        }
      );

      if (campaignsRes.error) {
        console.error("[SYNC-META-ADS] Failed to fetch campaigns for", adAccount.id, campaignsRes.error);
        continue;
      }

      for (const campaign of campaignsRes.data || []) {
        const { error: campaignUpsertError } = await supabase
          .from("meta_campaigns")
          .upsert(
            {
              workspace_id,
              ad_account_id: dbAccount.id,
              campaign_id: campaign.id,
              name: campaign.name,
              objective: campaign.objective || null,
              status: campaign.status || "PAUSED",
              effective_status: campaign.effective_status || null,
              daily_budget: parseNumeric(campaign.daily_budget),
              lifetime_budget: parseNumeric(campaign.lifetime_budget),
              bid_strategy: campaign.bid_strategy || null,
              start_time: parseDate(campaign.start_time),
              stop_time: parseDate(campaign.stop_time),
            },
            { onConflict: "workspace_id,campaign_id" }
          );

        if (campaignUpsertError) {
          console.error("[SYNC-META-ADS] Failed to upsert campaign", campaign.id, campaignUpsertError);
          continue;
        }

        synced.campaigns += 1;
      }
    }

    await supabase
      .from("integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", integration.id);

    return new Response(
      JSON.stringify({
        success: true,
        synced,
        // Compat fields used by older clients/tests
        accounts_synced: synced.accounts,
        campaigns_synced: synced.campaigns,
        insights_synced: 0,
      }),
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
