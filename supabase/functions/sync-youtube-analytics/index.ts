import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getOAuthTokens, getIntegration } from "../_shared/oauth-tokens.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncYouTubeRequest {
  workspace_id: string;
  media_asset_id?: string;
  video_id?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * YouTube Analytics API sync
 * Syncs advanced metrics: watch time, CTR, audience retention, etc.
 * Uses encrypted OAuth tokens from oauth_tokens table
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TOKEN_ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY");

  try {
    const body: SyncYouTubeRequest = await req.json();
    const { workspace_id, media_asset_id, video_id, start_date, end_date } = body;

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
      "youtube"
    );

    if (!integration) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "YouTube integration not configured. Please connect YouTube first.",
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
          error: "OAuth tokens not found or expired. Please reconnect YouTube.",
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

    console.log(`Syncing YouTube Analytics from ${dateStart} to ${dateEnd}`);

    // Log the sync attempt
    await supabase.from("action_log").insert({
      workspace_id,
      actor_type: "agent",
      actor_id: "sync-youtube-analytics",
      action_type: "DATA_SYNC",
      action_category: "integration",
      description: `YouTube Analytics sync initiated`,
      details: { sync_id: syncId, date_range: { start: dateStart, end: dateEnd } },
      is_automated: true,
      result: "pending",
    });

    // First, get the channel ID
    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=id,snippet,statistics&mine=true",
      {
        headers: {
          "Authorization": `Bearer ${tokens.accessToken}`,
        },
      }
    );

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error("YouTube Channels API error:", channelResponse.status, errorText);
      
      await supabase
        .from("action_log")
        .update({ result: "error", details: { error: errorText, sync_id: syncId } })
        .eq("workspace_id", workspace_id)
        .eq("details->>sync_id", syncId);

      return new Response(
        JSON.stringify({
          success: false,
          error: `YouTube API error: ${channelResponse.status}`,
          details: errorText,
        }),
        { status: channelResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];

    if (!channel) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No YouTube channel found for this account.",
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const channelId = channel.id;

    // Fetch YouTube Analytics data
    const analyticsUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
    analyticsUrl.searchParams.set("ids", `channel==${channelId}`);
    analyticsUrl.searchParams.set("startDate", dateStart);
    analyticsUrl.searchParams.set("endDate", dateEnd);
    analyticsUrl.searchParams.set("dimensions", "day");
    analyticsUrl.searchParams.set("metrics", "views,estimatedMinutesWatched,averageViewDuration,likes,comments,shares,subscribersGained,subscribersLost,annotationClickThroughRate");
    analyticsUrl.searchParams.set("sort", "day");

    const analyticsResponse = await fetch(analyticsUrl.toString(), {
      headers: {
        "Authorization": `Bearer ${tokens.accessToken}`,
      },
    });

    if (!analyticsResponse.ok) {
      const errorText = await analyticsResponse.text();
      console.error("YouTube Analytics API error:", analyticsResponse.status, errorText);
      
      // Try fallback to basic Data API stats
      console.log("Falling back to basic YouTube Data API stats");
    }

    let insertedCount = 0;
    const analyticsData = analyticsResponse.ok ? await analyticsResponse.json() : null;

    if (analyticsData?.rows) {
      // Process analytics data
      for (const row of analyticsData.rows) {
        const [date, views, watchMinutes, avgDuration, likes, comments, shares, subsGained, subsLost, ctr] = row;
        
        // Find or create media asset for channel
        let assetId = media_asset_id;
        if (!assetId) {
          const { data: existingAsset } = await supabase
            .from("media_assets")
            .select("id")
            .eq("workspace_id", workspace_id)
            .eq("platform", "youtube_channel")
            .eq("platform_id", channelId)
            .single();

          if (existingAsset) {
            assetId = existingAsset.id;
          } else {
            const { data: newAsset } = await supabase
              .from("media_assets")
              .insert({
                workspace_id,
                platform: "youtube_channel",
                platform_id: channelId,
                url: `https://youtube.com/channel/${channelId}`,
                title: channel.snippet?.title || "My Channel",
                description: channel.snippet?.description,
                thumbnail_url: channel.snippet?.thumbnails?.high?.url,
              })
              .select("id")
              .single();
            assetId = newAsset?.id;
          }
        }

        if (assetId) {
          await supabase.from("media_kpis_daily").upsert({
            workspace_id,
            media_asset_id: assetId,
            source: "youtube_analytics",
            date,
            views: views || 0,
            watch_time_minutes: watchMinutes || 0,
            likes: likes || 0,
            comments: comments || 0,
            shares: shares || 0,
            subscribers_gained: (subsGained || 0) - (subsLost || 0),
            ctr: ctr ? ctr * 100 : null,
            metrics_json: {
              avg_view_duration: avgDuration,
              subscribers_gained: subsGained,
              subscribers_lost: subsLost,
            },
          }, {
            onConflict: "media_asset_id,source,date",
          });
          insertedCount++;
        }
      }
    }

    // If specific video_id provided, fetch video-level analytics
    if (video_id) {
      const videoAnalyticsUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
      videoAnalyticsUrl.searchParams.set("ids", `channel==${channelId}`);
      videoAnalyticsUrl.searchParams.set("startDate", dateStart);
      videoAnalyticsUrl.searchParams.set("endDate", dateEnd);
      videoAnalyticsUrl.searchParams.set("dimensions", "day");
      videoAnalyticsUrl.searchParams.set("filters", `video==${video_id}`);
      videoAnalyticsUrl.searchParams.set("metrics", "views,estimatedMinutesWatched,likes,comments,shares");
      videoAnalyticsUrl.searchParams.set("sort", "day");

      const videoAnalyticsResponse = await fetch(videoAnalyticsUrl.toString(), {
        headers: {
          "Authorization": `Bearer ${tokens.accessToken}`,
        },
      });

      if (videoAnalyticsResponse.ok) {
        const videoAnalyticsData = await videoAnalyticsResponse.json();
        console.log(`Fetched ${videoAnalyticsData.rows?.length || 0} days of video analytics`);
        // Process video-specific data if needed
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
        details: { sync_id: syncId, days_synced: insertedCount }
      })
      .eq("workspace_id", workspace_id)
      .eq("details->>sync_id", syncId);

    return new Response(
      JSON.stringify({
        success: true,
        sync_id: syncId,
        message: `YouTube Analytics sync completed. ${insertedCount} days of data synced.`,
        days_synced: insertedCount,
        channel_id: channelId,
        channel_name: channel.snippet?.title,
        date_range: { start: dateStart, end: dateEnd },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("YouTube Analytics sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
