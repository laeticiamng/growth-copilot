import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  workspace_id: string;
  site_id: string;
  month?: string; // YYYY-MM format, defaults to previous month
}

// Generate Monthly PDF Report
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body: ReportRequest = await req.json();
    const { workspace_id, site_id } = body;

    if (!workspace_id || !site_id) {
      throw new Error("Missing required fields: workspace_id, site_id");
    }

    // Calculate month range
    const today = new Date();
    const targetMonth = body.month
      ? new Date(body.month + "-01")
      : new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    const prevMonthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth() - 1, 1);
    const prevMonthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 0);

    const monthStr = monthStart.toISOString().slice(0, 7);
    console.log(`Generating report for ${monthStr}`);

    // Get site info
    const { data: site } = await supabase
      .from("sites")
      .select("name, domain")
      .eq("id", site_id)
      .single();

    // Get KPI data for current month
    const { data: currentKpis } = await supabase
      .from("kpis_daily")
      .select("*")
      .eq("site_id", site_id)
      .gte("date", monthStart.toISOString().split("T")[0])
      .lte("date", monthEnd.toISOString().split("T")[0]);

    // Get KPI data for previous month (MoM comparison)
    const { data: prevKpis } = await supabase
      .from("kpis_daily")
      .select("*")
      .eq("site_id", site_id)
      .gte("date", prevMonthStart.toISOString().split("T")[0])
      .lte("date", prevMonthEnd.toISOString().split("T")[0]);

    // Get completed actions this month
    const { data: actions } = await supabase
      .from("action_log")
      .select("*")
      .eq("workspace_id", workspace_id)
      .eq("site_id", site_id)
      .eq("result", "success")
      .gte("created_at", monthStart.toISOString())
      .lte("created_at", monthEnd.toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    // Get open issues for next month plan
    const { data: issues } = await supabase
      .from("issues")
      .select("*")
      .eq("site_id", site_id)
      .eq("status", "open")
      .order("impact_score", { ascending: false })
      .limit(10);

    // Get data quality alerts
    const { data: alerts } = await supabase
      .from("data_quality_alerts")
      .select("*")
      .eq("site_id", site_id)
      .eq("is_resolved", false);

    // Calculate aggregated KPIs
    const sumKpis = (kpis: typeof currentKpis) => {
      if (!kpis || kpis.length === 0) return null;
      return {
        organic_clicks: kpis.reduce((sum, k) => sum + (k.organic_clicks || 0), 0),
        organic_impressions: kpis.reduce((sum, k) => sum + (k.organic_impressions || 0), 0),
        organic_sessions: kpis.reduce((sum, k) => sum + (k.organic_sessions || 0), 0),
        total_conversions: kpis.reduce((sum, k) => sum + (k.total_conversions || 0), 0),
        total_leads: kpis.reduce((sum, k) => sum + (k.total_leads || 0), 0),
        revenue: kpis.reduce((sum, k) => sum + Number(k.revenue || 0), 0),
        avg_position: kpis.reduce((sum, k) => sum + Number(k.avg_position || 0), 0) / kpis.length,
      };
    };

    const current = sumKpis(currentKpis);
    const previous = sumKpis(prevKpis);

    const calcChange = (curr: number | null, prev: number | null) => {
      if (!curr || !prev || prev === 0) return null;
      return ((curr - prev) / prev * 100).toFixed(1);
    };

    const kpiChanges = current && previous ? {
      organic_clicks: { current: current.organic_clicks, previous: previous.organic_clicks, change: calcChange(current.organic_clicks, previous.organic_clicks) },
      organic_impressions: { current: current.organic_impressions, previous: previous.organic_impressions, change: calcChange(current.organic_impressions, previous.organic_impressions) },
      organic_sessions: { current: current.organic_sessions, previous: previous.organic_sessions, change: calcChange(current.organic_sessions, previous.organic_sessions) },
      total_conversions: { current: current.total_conversions, previous: previous.total_conversions, change: calcChange(current.total_conversions, previous.total_conversions) },
      revenue: { current: current.revenue, previous: previous.revenue, change: calcChange(current.revenue, previous.revenue) },
      avg_position: { current: current.avg_position?.toFixed(1), previous: previous.avg_position?.toFixed(1), change: calcChange(previous.avg_position, current.avg_position) }, // inverted - lower is better
    } : {};

    // Build report JSON structure
    const reportData = {
      generated_at: new Date().toISOString(),
      month: monthStr,
      site: {
        name: site?.name || "Unknown",
        domain: site?.domain || "Unknown",
      },
      executive_summary: generateExecutiveSummary(current, previous, actions?.length || 0, issues?.length || 0, alerts?.length || 0),
      kpi_summary: kpiChanges,
      actions_completed: (actions || []).map((a) => ({
        date: a.created_at,
        type: a.action_type,
        description: a.description,
      })),
      next_month_plan: (issues || []).slice(0, 5).map((i) => ({
        title: i.title,
        priority: i.severity,
        impact: i.impact_score,
        category: i.category,
      })),
      data_quality_risks: (alerts || []).map((a) => ({
        type: a.alert_type,
        severity: a.severity,
        title: a.title,
      })),
    };

    // Generate simple HTML report (can be converted to PDF via external service)
    const htmlReport = generateHTMLReport(reportData);

    // Store report in storage
    const fileName = `${workspace_id}/${site_id}/report-${monthStr}.html`;
    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(fileName, new Blob([htmlReport], { type: "text/html" }), {
        upsert: true,
        contentType: "text/html",
      });

    if (uploadError) {
      console.error("Failed to upload report:", uploadError);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("reports")
      .getPublicUrl(fileName);

    // Save to monthly_reports table
    const { data: report, error: reportError } = await supabase
      .from("monthly_reports")
      .upsert({
        workspace_id,
        site_id,
        month: monthStart.toISOString().split("T")[0],
        summary_json: reportData,
        kpi_changes: kpiChanges,
        actions_completed: reportData.actions_completed,
        next_actions: reportData.next_month_plan,
        risks: reportData.data_quality_risks,
        pdf_url: urlData?.publicUrl,
        generated_at: new Date().toISOString(),
      }, {
        onConflict: "site_id,month",
      })
      .select()
      .single();

    if (reportError) {
      console.error("Failed to save report:", reportError);
    }

    // Log report generation
    await supabase.from("action_log").insert({
      workspace_id,
      site_id,
      actor_type: "agent",
      actor_id: "report-generator",
      action_type: "REPORT_GENERATED",
      action_category: "reporting",
      description: `Monthly report generated for ${monthStr}`,
      details: { report_id: report?.id, month: monthStr },
      is_automated: true,
      result: "success",
    });

    return new Response(
      JSON.stringify({
        success: true,
        report_id: report?.id,
        month: monthStr,
        url: urlData?.publicUrl,
        summary: reportData.executive_summary,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Report generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateExecutiveSummary(
  current: ReturnType<typeof sumKpis> | null,
  previous: ReturnType<typeof sumKpis> | null,
  actionsCount: number,
  issuesCount: number,
  alertsCount: number
): string {
  if (!current) {
    return "Insufficient data to generate executive summary. Please ensure data integrations are connected.";
  }

  const parts: string[] = [];
  
  if (previous) {
    const clickChange = ((current.organic_clicks - previous.organic_clicks) / previous.organic_clicks * 100);
    if (clickChange > 0) {
      parts.push(`Organic clicks increased by ${clickChange.toFixed(1)}%`);
    } else if (clickChange < 0) {
      parts.push(`Organic clicks decreased by ${Math.abs(clickChange).toFixed(1)}%`);
    }

    const convChange = ((current.total_conversions - previous.total_conversions) / (previous.total_conversions || 1) * 100);
    if (convChange > 0) {
      parts.push(`conversions up ${convChange.toFixed(1)}%`);
    } else if (convChange < 0) {
      parts.push(`conversions down ${Math.abs(convChange).toFixed(1)}%`);
    }
  }

  parts.push(`${actionsCount} actions completed this month`);
  
  if (issuesCount > 0) {
    parts.push(`${issuesCount} open issues to address`);
  }
  
  if (alertsCount > 0) {
    parts.push(`${alertsCount} data quality alerts require attention`);
  }

  return parts.join(". ") + ".";
}

function sumKpis(kpis: unknown[] | null) {
  if (!kpis || kpis.length === 0) return null;
  const typedKpis = kpis as Array<{
    organic_clicks?: number;
    organic_impressions?: number;
    organic_sessions?: number;
    total_conversions?: number;
    total_leads?: number;
    revenue?: number;
    avg_position?: number;
  }>;
  return {
    organic_clicks: typedKpis.reduce((sum, k) => sum + (k.organic_clicks || 0), 0),
    organic_impressions: typedKpis.reduce((sum, k) => sum + (k.organic_impressions || 0), 0),
    organic_sessions: typedKpis.reduce((sum, k) => sum + (k.organic_sessions || 0), 0),
    total_conversions: typedKpis.reduce((sum, k) => sum + (k.total_conversions || 0), 0),
    total_leads: typedKpis.reduce((sum, k) => sum + (k.total_leads || 0), 0),
    revenue: typedKpis.reduce((sum, k) => sum + Number(k.revenue || 0), 0),
    avg_position: typedKpis.reduce((sum, k) => sum + Number(k.avg_position || 0), 0) / typedKpis.length,
  };
}

function generateHTMLReport(data: Record<string, unknown>): string {
  const report = data as {
    month: string;
    site: { name: string; domain: string };
    executive_summary: string;
    kpi_summary: Record<string, { current: unknown; previous: unknown; change: string | null }>;
    actions_completed: Array<{ date: string; type: string; description: string }>;
    next_month_plan: Array<{ title: string; priority: string; impact: number; category: string }>;
    data_quality_risks: Array<{ type: string; severity: string; title: string }>;
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Monthly Report - ${report.month}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; }
    h1 { color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .kpi-card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
    .kpi-value { font-size: 24px; font-weight: bold; color: #0066cc; }
    .kpi-change { font-size: 14px; margin-top: 5px; }
    .positive { color: #22c55e; }
    .negative { color: #ef4444; }
    .action-list { list-style: none; padding: 0; }
    .action-list li { padding: 10px; border-bottom: 1px solid #eee; }
    .alert { padding: 10px; margin: 5px 0; border-radius: 4px; }
    .alert.critical { background: #fee2e2; border-left: 4px solid #ef4444; }
    .alert.warning { background: #fef3c7; border-left: 4px solid #f59e0b; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>📊 Monthly Performance Report</h1>
  <p><strong>Site:</strong> ${report.site.name} (${report.site.domain})</p>
  <p><strong>Period:</strong> ${report.month}</p>
  
  <div class="summary">
    <h2>Executive Summary</h2>
    <p>${report.executive_summary}</p>
  </div>

  <h2>Key Performance Indicators</h2>
  <div class="kpi-grid">
    ${Object.entries(report.kpi_summary).map(([key, val]) => `
      <div class="kpi-card">
        <div class="kpi-label">${key.replace(/_/g, " ").toUpperCase()}</div>
        <div class="kpi-value">${typeof val.current === 'number' ? val.current.toLocaleString() : val.current}</div>
        ${val.change ? `<div class="kpi-change ${Number(val.change) >= 0 ? 'positive' : 'negative'}">${Number(val.change) >= 0 ? '↑' : '↓'} ${Math.abs(Number(val.change))}%</div>` : ''}
      </div>
    `).join("")}
  </div>

  <h2>Actions Completed This Month</h2>
  <ul class="action-list">
    ${report.actions_completed.slice(0, 10).map((a) => `
      <li><strong>${a.type}</strong>: ${a.description}</li>
    `).join("") || "<li>No actions recorded this month</li>"}
  </ul>

  <h2>Plan for Next Month</h2>
  <ul class="action-list">
    ${report.next_month_plan.map((p) => `
      <li><strong>[${p.priority}]</strong> ${p.title} <em>(${p.category})</em></li>
    `).join("") || "<li>No pending actions</li>"}
  </ul>

  ${report.data_quality_risks.length > 0 ? `
  <h2>⚠️ Data Quality Alerts</h2>
  ${report.data_quality_risks.map((r) => `
    <div class="alert ${r.severity}">${r.title}</div>
  `).join("")}
  ` : ""}

  <div class="footer">
    <p>Generated automatically by Growth Engine</p>
  </div>
</body>
</html>`;
}
