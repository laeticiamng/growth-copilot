import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GuardianRequest {
  workspace_id: string;
  site_id: string;
}

interface DataQualityAlert {
  workspace_id: string;
  site_id: string;
  alert_type: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  metric_name?: string;
  expected_value?: number;
  actual_value?: number;
  date_range_start?: string;
  date_range_end?: string;
}

// Analytics Guardian Agent
// Detects data gaps, anomalies, and tracking issues
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body: GuardianRequest = await req.json();
    const { workspace_id, site_id } = body;

    if (!workspace_id || !site_id) {
      throw new Error("Missing required fields: workspace_id, site_id");
    }

    console.log(`Running Analytics Guardian for site ${site_id}`);

    const alerts: DataQualityAlert[] = [];
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get KPI data for analysis
    const { data: kpis, error: kpiError } = await supabase
      .from("kpis_daily")
      .select("*")
      .eq("site_id", site_id)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (kpiError) {
      console.error("Failed to fetch KPIs:", kpiError);
    }

    const kpiData = kpis || [];

    // Check 1: Data Gaps (missing days)
    const dateSet = new Set(kpiData.map((k) => k.date));
    const expectedDates: string[] = [];
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      expectedDates.push(d.toISOString().split("T")[0]);
    }
    const missingDates = expectedDates.filter((d) => !dateSet.has(d));
    
    if (missingDates.length > 3) {
      alerts.push({
        workspace_id,
        site_id,
        alert_type: "data_gap",
        severity: missingDates.length > 7 ? "critical" : "warning",
        title: `Data gap detected: ${missingDates.length} days missing`,
        description: `Missing data for ${missingDates.length} days in the last 30 days. This may indicate tracking issues or sync failures.`,
        date_range_start: missingDates[0],
        date_range_end: missingDates[missingDates.length - 1],
      });
    }

    // Check 2: Zero Conversions (if usually has conversions)
    const conversionsData = kpiData.filter((k) => k.total_conversions !== null);
    const avgConversions = conversionsData.length > 0
      ? conversionsData.reduce((sum, k) => sum + (k.total_conversions || 0), 0) / conversionsData.length
      : 0;
    
    const recentZeroConversions = kpiData
      .slice(-7)
      .filter((k) => k.total_conversions === 0 || k.total_conversions === null);
    
    if (avgConversions > 1 && recentZeroConversions.length >= 3) {
      alerts.push({
        workspace_id,
        site_id,
        alert_type: "zero_conversions",
        severity: "critical",
        title: "Conversion tracking may be broken",
        description: `${recentZeroConversions.length} days with zero conversions in the last week, while average is ${avgConversions.toFixed(1)}. Check conversion tracking.`,
        metric_name: "conversions",
        expected_value: avgConversions,
        actual_value: 0,
      });
    }

    // Check 3: Sudden Drop (>50% decrease)
    if (kpiData.length >= 14) {
      const lastWeek = kpiData.slice(-7);
      const prevWeek = kpiData.slice(-14, -7);
      
      const lastWeekClicks = lastWeek.reduce((sum, k) => sum + (k.organic_clicks || 0), 0);
      const prevWeekClicks = prevWeek.reduce((sum, k) => sum + (k.organic_clicks || 0), 0);
      
      if (prevWeekClicks > 100 && lastWeekClicks < prevWeekClicks * 0.5) {
        const dropPercent = ((prevWeekClicks - lastWeekClicks) / prevWeekClicks * 100).toFixed(1);
        alerts.push({
          workspace_id,
          site_id,
          alert_type: "sudden_drop",
          severity: "critical",
          title: `Organic traffic dropped ${dropPercent}%`,
          description: `Organic clicks dropped from ${prevWeekClicks} to ${lastWeekClicks} week-over-week. Investigate potential algorithm update, technical issues, or manual actions.`,
          metric_name: "organic_clicks",
          expected_value: prevWeekClicks,
          actual_value: lastWeekClicks,
        });
      }

      const lastWeekSessions = lastWeek.reduce((sum, k) => sum + (k.organic_sessions || 0), 0);
      const prevWeekSessions = prevWeek.reduce((sum, k) => sum + (k.organic_sessions || 0), 0);
      
      if (prevWeekSessions > 100 && lastWeekSessions < prevWeekSessions * 0.5) {
        const dropPercent = ((prevWeekSessions - lastWeekSessions) / prevWeekSessions * 100).toFixed(1);
        alerts.push({
          workspace_id,
          site_id,
          alert_type: "sudden_drop",
          severity: "critical",
          title: `Sessions dropped ${dropPercent}%`,
          description: `Organic sessions dropped from ${prevWeekSessions} to ${lastWeekSessions} week-over-week. Check GA4 tracking and site availability.`,
          metric_name: "organic_sessions",
          expected_value: prevWeekSessions,
          actual_value: lastWeekSessions,
        });
      }
    }

    // Check 4: Tracking Suspect (no data from specific source)
    const gscData = kpiData.filter((k) => k.source === "gsc");
    const ga4Data = kpiData.filter((k) => k.source === "ga4");
    
    if (gscData.length === 0 && kpiData.length > 7) {
      alerts.push({
        workspace_id,
        site_id,
        alert_type: "tracking_suspect",
        severity: "warning",
        title: "No GSC data synced",
        description: "Google Search Console data is not being synced. Connect GSC integration to get organic search performance data.",
        metric_name: "gsc_sync",
      });
    }
    
    if (ga4Data.length === 0 && kpiData.length > 7) {
      alerts.push({
        workspace_id,
        site_id,
        alert_type: "tracking_suspect",
        severity: "warning",
        title: "No GA4 data synced",
        description: "Google Analytics 4 data is not being synced. Connect GA4 integration to get session and conversion data.",
        metric_name: "ga4_sync",
      });
    }

    // Check 5: Anomaly Detection (unusual spikes)
    if (kpiData.length >= 7) {
      const clicksData = kpiData.map((k) => k.organic_clicks || 0);
      const avgClicks = clicksData.reduce((a, b) => a + b, 0) / clicksData.length;
      const stdDev = Math.sqrt(
        clicksData.reduce((sum, val) => sum + Math.pow(val - avgClicks, 2), 0) / clicksData.length
      );
      
      const recentSpikes = kpiData.slice(-7).filter(
        (k) => (k.organic_clicks || 0) > avgClicks + 3 * stdDev
      );
      
      if (recentSpikes.length > 0 && stdDev > 10) {
        alerts.push({
          workspace_id,
          site_id,
          alert_type: "anomaly",
          severity: "info",
          title: "Unusual traffic spike detected",
          description: `${recentSpikes.length} day(s) with unusually high traffic. This could be viral content, bot traffic, or a marketing campaign effect.`,
          metric_name: "organic_clicks",
          expected_value: avgClicks,
          actual_value: Math.max(...recentSpikes.map((k) => k.organic_clicks || 0)),
        });
      }
    }

    // Clear old resolved alerts
    await supabase
      .from("data_quality_alerts")
      .delete()
      .eq("site_id", site_id)
      .eq("is_resolved", true)
      .lt("resolved_at", thirtyDaysAgo.toISOString());

    // Insert new alerts (avoid duplicates)
    for (const alert of alerts) {
      const { data: existing } = await supabase
        .from("data_quality_alerts")
        .select("id")
        .eq("site_id", site_id)
        .eq("alert_type", alert.alert_type)
        .eq("metric_name", alert.metric_name || "")
        .eq("is_resolved", false)
        .maybeSingle();

      if (!existing) {
        await supabase.from("data_quality_alerts").insert(alert);
      }
    }

    // Log guardian run
    await supabase.from("action_log").insert({
      workspace_id,
      site_id,
      actor_type: "agent",
      actor_id: "analytics-guardian",
      action_type: "DATA_QUALITY_CHECK",
      action_category: "monitoring",
      description: `Analytics Guardian found ${alerts.length} issue(s)`,
      details: {
        alerts_count: alerts.length,
        critical: alerts.filter((a) => a.severity === "critical").length,
        warning: alerts.filter((a) => a.severity === "warning").length,
        info: alerts.filter((a) => a.severity === "info").length,
      },
      is_automated: true,
      result: alerts.some((a) => a.severity === "critical") ? "warning" : "success",
    });

    return new Response(
      JSON.stringify({
        success: true,
        alerts_created: alerts.length,
        alerts,
        summary: {
          critical: alerts.filter((a) => a.severity === "critical").length,
          warning: alerts.filter((a) => a.severity === "warning").length,
          info: alerts.filter((a) => a.severity === "info").length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analytics Guardian error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
