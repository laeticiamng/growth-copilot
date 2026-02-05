import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

interface SyncRequest {
  workspace_id: string;
  job_type: "seo" | "ads" | "sales" | "all";
}

// KPI Sync Edge Function - Aggregates data from various sources
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const body: SyncRequest = await req.json();
    const { workspace_id, job_type } = body;

    if (!workspace_id) {
      throw new Error("Missing workspace_id");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const syncId = crypto.randomUUID();
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    console.log(`[KPI-SYNC] Starting ${job_type} sync for workspace ${workspace_id}`);

    // Initialize aggregate data
    const aggregate: Record<string, unknown> = {
      workspace_id,
      date: dateStr,
      period_type: "daily",
      synced_at: new Date().toISOString(),
    };

    // Sync SEO data
    if (job_type === "seo" || job_type === "all") {
      console.log("[KPI-SYNC] Syncing SEO data...");
      
      // Get data from kpis_daily
      const { data: seoData } = await supabase
        .from("kpis_daily")
        .select("organic_sessions, organic_clicks, impressions, avg_position")
        .eq("workspace_id", workspace_id)
        .eq("date", dateStr)
        .single();

      if (seoData) {
        aggregate.seo_sessions = seoData.organic_sessions || 0;
        aggregate.seo_clicks = seoData.organic_clicks || 0;
        aggregate.seo_impressions = seoData.impressions || 0;
        aggregate.seo_avg_position = seoData.avg_position;
      }

      // Also check search_metrics
      const { data: searchData } = await supabase
        .from("search_metrics")
        .select("clicks, impressions, position")
        .eq("workspace_id", workspace_id)
        .gte("date", dateStr)
        .lt("date", new Date(today.getTime() + 86400000).toISOString().split("T")[0]);

      if (searchData && searchData.length > 0) {
        const totalClicks = searchData.reduce((sum, d) => sum + (d.clicks || 0), 0);
        const totalImpressions = searchData.reduce((sum, d) => sum + (d.impressions || 0), 0);
        const avgPosition = searchData.reduce((sum, d) => sum + (d.position || 0), 0) / searchData.length;
        
        aggregate.seo_clicks = totalClicks;
        aggregate.seo_impressions = totalImpressions;
        aggregate.seo_avg_position = avgPosition;
      }
    }

    // Sync Ads data
    if (job_type === "ads" || job_type === "all") {
      console.log("[KPI-SYNC] Syncing Ads data...");
      
      // Get campaign data
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("cost_30d, clicks_30d, impressions_30d, conversions_30d")
        .eq("workspace_id", workspace_id);

      if (campaigns && campaigns.length > 0) {
        const totalSpend = campaigns.reduce((sum, c) => sum + (c.cost_30d || 0), 0);
        const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks_30d || 0), 0);
        const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions_30d || 0), 0);
        const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions_30d || 0), 0);
        
        aggregate.ads_spend = totalSpend / 30; // Daily average
        aggregate.ads_clicks = Math.round(totalClicks / 30);
        aggregate.ads_impressions = Math.round(totalImpressions / 30);
        aggregate.ads_conversions = Math.round(totalConversions / 30);
        aggregate.ads_ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        aggregate.ads_cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
      }
    }

    // Sync Sales data
    if (job_type === "sales" || job_type === "all") {
      console.log("[KPI-SYNC] Syncing Sales data...");
      
      // Get from kpis_daily
      const { data: salesData } = await supabase
        .from("kpis_daily")
        .select("revenue, total_conversions")
        .eq("workspace_id", workspace_id)
        .eq("date", dateStr)
        .single();

      if (salesData) {
        aggregate.sales_revenue = salesData.revenue || 0;
        aggregate.sales_orders = salesData.total_conversions || 0;
        aggregate.sales_aov = (salesData.revenue || 0) / Math.max(1, salesData.total_conversions || 1);
      }

      // Get from deals
      const { data: deals } = await supabase
        .from("deals")
        .select("value, stage")
        .eq("workspace_id", workspace_id)
        .eq("stage", "won")
        .gte("closed_at", dateStr);

      if (deals && deals.length > 0) {
        const dealsRevenue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
        aggregate.sales_revenue = (aggregate.sales_revenue as number || 0) + dealsRevenue;
        aggregate.sales_orders = (aggregate.sales_orders as number || 0) + deals.length;
      }
    }

    // Calculate health score
    const { data: healthScore } = await supabase.rpc("calculate_health_score", {
      _workspace_id: workspace_id,
    });
    aggregate.health_score = healthScore || 50;

    // Calculate growth score (simple version)
    // Compare with previous day
    const yesterday = new Date(today.getTime() - 86400000).toISOString().split("T")[0];
    const { data: yesterdayData } = await supabase
      .from("kpi_aggregates")
      .select("seo_sessions, sales_revenue")
      .eq("workspace_id", workspace_id)
      .eq("date", yesterday)
      .single();

    if (yesterdayData) {
      const sessionGrowth = yesterdayData.seo_sessions > 0 
        ? ((aggregate.seo_sessions as number || 0) - yesterdayData.seo_sessions) / yesterdayData.seo_sessions * 100
        : 0;
      const revenueGrowth = yesterdayData.sales_revenue > 0
        ? ((aggregate.sales_revenue as number || 0) - yesterdayData.sales_revenue) / yesterdayData.sales_revenue * 100
        : 0;
      aggregate.growth_score = Math.max(0, Math.min(100, 50 + (sessionGrowth + revenueGrowth) / 4));
    } else {
      aggregate.growth_score = 50;
    }

    // Calculate ROI score
    const spend = (aggregate.ads_spend as number) || 0;
    const revenue = (aggregate.sales_revenue as number) || 0;
    if (spend > 0) {
      aggregate.ads_roas = revenue / spend;
      aggregate.roi_score = Math.min(100, Math.round((revenue - spend) / spend * 50 + 50));
    } else {
      aggregate.roi_score = 50;
    }

    // Upsert the aggregate
    const { error: upsertError } = await supabase
      .from("kpi_aggregates")
      .upsert(aggregate, { onConflict: "workspace_id,date,period_type" });

    if (upsertError) {
      console.error("[KPI-SYNC] Upsert error:", upsertError);
      throw upsertError;
    }

    // Update sync job status
    await supabase
      .from("kpi_sync_jobs")
      .upsert({
        workspace_id,
        job_type,
        last_run_at: new Date().toISOString(),
        last_run_status: "success",
        next_run_at: new Date(today.getTime() + 86400000).toISOString(),
      }, { onConflict: "workspace_id,job_type" });

    console.log(`[KPI-SYNC] Completed ${job_type} sync for workspace ${workspace_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        sync_id: syncId,
        job_type,
        aggregate,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[KPI-SYNC] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
