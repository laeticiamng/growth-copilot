import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH_API_VERSION = "v19.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface SyncIgRequest {
  workspace_id: string;
  integration_id: string;
  sync_media?: boolean;
  media_limit?: number;
}

/**
 * Decrypt token
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
    const body: SyncIgRequest = await req.json();
    const { workspace_id, integration_id, sync_media = true, media_limit = 50 } = body;

    if (!workspace_id || !integration_id) {
      return new Response(
        JSON.stringify({ error: "Missing workspace_id or integration_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get tokens
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

    console.log(`Syncing Instagram for workspace ${workspace_id}...`);

    // 1. Get Facebook Pages with connected IG accounts
    const pagesRes = await graphRequest<Array<{
      id: string;
      name: string;
      instagram_business_account?: { id: string };
    }>>(
      "/me/accounts",
      accessToken,
      { fields: "id,name,instagram_business_account" }
    );

    if (pagesRes.error) {
      console.error("Failed to fetch pages:", pagesRes.error);
      return new Response(
        JSON.stringify({ error: pagesRes.error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const syncedAccounts: string[] = [];
    const syncedMedia: string[] = [];

    for (const page of pagesRes.data || []) {
      if (!page.instagram_business_account) continue;

      const igAccountId = page.instagram_business_account.id;

      // 2. Get IG account details
      const igRes = await graphRequest<{
        id: string;
        username: string;
        name?: string;
        profile_picture_url?: string;
        biography?: string;
        website?: string;
        followers_count: number;
        follows_count: number;
        media_count: number;
      }>(
        `/${igAccountId}`,
        accessToken,
        { fields: "id,username,name,profile_picture_url,biography,website,followers_count,follows_count,media_count" }
      );

      if (igRes.error) {
        console.error(`Failed to fetch IG account ${igAccountId}:`, igRes.error);
        continue;
      }

      const igData = igRes.data!;

      // Upsert IG account
      const { data: dbIgAccount, error: igError } = await supabase
        .from("meta_ig_accounts")
        .upsert({
          workspace_id,
          integration_id,
          ig_user_id: igData.id,
          username: igData.username,
          name: igData.name,
          profile_picture_url: igData.profile_picture_url,
          biography: igData.biography,
          website: igData.website,
          followers_count: igData.followers_count,
          follows_count: igData.follows_count,
          media_count: igData.media_count,
          connected_fb_page_id: page.id,
          last_sync_at: new Date().toISOString(),
        }, { onConflict: "workspace_id,ig_user_id" })
        .select("id")
        .single();

      if (igError) {
        console.error("Failed to upsert IG account:", igError);
        continue;
      }

      syncedAccounts.push(igData.username);

      // 3. Sync Media
      if (sync_media) {
        const mediaRes = await graphRequest<Array<{
          id: string;
          media_type: string;
          media_url?: string;
          thumbnail_url?: string;
          permalink: string;
          caption?: string;
          timestamp: string;
          like_count?: number;
          comments_count?: number;
        }>>(
          `/${igAccountId}/media`,
          accessToken,
          { 
            fields: "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count",
            limit: media_limit.toString()
          }
        );

        if (mediaRes.error) {
          console.error(`Failed to fetch media for ${igData.username}:`, mediaRes.error);
          continue;
        }

        for (const media of mediaRes.data || []) {
          // Get insights for each media
          let insights: { reach?: number; impressions?: number; engagement?: number; saved?: number; shares?: number; plays?: number } = {};
          
          const insightsRes = await graphRequest<Array<{ name: string; values: Array<{ value: number }> }>>(
            `/${media.id}/insights`,
            accessToken,
            { metric: "reach,impressions,engagement,saved,shares,plays" }
          );

          if (!insightsRes.error && insightsRes.data) {
            for (const metric of insightsRes.data) {
              insights[metric.name as keyof typeof insights] = metric.values[0]?.value;
            }
          }

          await supabase
            .from("meta_ig_media")
            .upsert({
              workspace_id,
              ig_account_id: dbIgAccount.id,
              media_id: media.id,
              media_type: media.media_type,
              media_url: media.media_url,
              thumbnail_url: media.thumbnail_url,
              permalink: media.permalink,
              caption: media.caption,
              timestamp: media.timestamp,
              like_count: media.like_count || 0,
              comments_count: media.comments_count || 0,
              reach: insights.reach,
              impressions: insights.impressions,
              engagement: insights.engagement,
              saved: insights.saved,
              shares: insights.shares,
              plays: insights.plays,
            }, { onConflict: "workspace_id,media_id" });

          syncedMedia.push(media.id);
        }
      }
    }

    // Update integration
    await supabase
      .from("integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", integration_id);

    console.log(`IG sync complete: ${syncedAccounts.length} accounts, ${syncedMedia.length} media`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: {
          accounts: syncedAccounts,
          media_count: syncedMedia.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("IG sync error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
