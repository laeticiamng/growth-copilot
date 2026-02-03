import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MetricsRequest {
  workspace_id?: string;
  action?: "collect" | "query" | "alert";
  time_range?: "1h" | "24h" | "7d";
}

interface LatencyMetrics {
  function_name: string;
  avg_duration_ms: number;
  p50_duration_ms: number;
  p95_duration_ms: number;
  p99_duration_ms: number;
  total_calls: number;
  error_count: number;
  success_rate: number;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  channel: "slack" | "email" | "webhook";
  triggered: boolean;
  last_triggered_at?: string;
}

// Monitoring Metrics Edge Function
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const body: MetricsRequest = await req.json();
    const { workspace_id, action = "query", time_range = "24h" } = body;

    // Create untyped client for flexibility
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();
    
    // Calculate time range
    const timeRangeMs: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
    };
    const startTime = new Date(now.getTime() - timeRangeMs[time_range]);

    console.log(`[MONITORING] Action: ${action}, Range: ${time_range}`);

    if (action === "collect") {
      // Collect and store current metrics snapshot
      const metricsSnapshot = await collectMetricsSnapshot(supabase as any, workspace_id, startTime);
      
      // Store in monitoring_snapshots table
      const { error: insertError } = await (supabase as any)
        .from("monitoring_snapshots")
        .insert({
          workspace_id: workspace_id || null,
          snapshot_at: now.toISOString(),
          metrics: metricsSnapshot,
          time_range,
        });

      if (insertError) {
        console.error("[MONITORING] Insert error:", insertError);
      }

      return new Response(
        JSON.stringify({ success: true, snapshot: metricsSnapshot }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "alert") {
      // Check alert conditions and trigger if needed
      const alerts = await checkAlertConditions(supabase as any, workspace_id, startTime);
      
      return new Response(
        JSON.stringify({ success: true, alerts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default: query metrics
    const metrics = await queryMetrics(supabase as any, workspace_id, startTime, time_range);

    return new Response(
      JSON.stringify({ success: true, metrics, time_range }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[MONITORING] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function collectMetricsSnapshot(
  supabase: any,
  workspaceId: string | undefined,
  startTime: Date
) {
  const metrics: Record<string, unknown> = {};

  // 1. Edge Function latency metrics from agent_runs
  const { data: agentRuns } = await supabase
    .from("agent_runs")
    .select("agent_type, duration_ms, status, created_at")
    .gte("created_at", startTime.toISOString())
    .order("created_at", { ascending: false });

  if (agentRuns && agentRuns.length > 0) {
    const byAgent = (agentRuns as any[]).reduce((acc: Record<string, any[]>, run: any) => {
      const key = run.agent_type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(run);
      return acc;
    }, {} as Record<string, any[]>);

    metrics.agent_latency = Object.entries(byAgent).map(([name, runs]) => {
      const durations = runs.map((r: any) => r.duration_ms || 0).filter((d: number) => d > 0).sort((a: number, b: number) => a - b);
      const total = runs.length;
      const errors = runs.filter((r: any) => r.status === "failed").length;
      
      return {
        function_name: name,
        avg_duration_ms: durations.length > 0 ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length) : 0,
        p50_duration_ms: durations.length > 0 ? durations[Math.floor(durations.length * 0.5)] : 0,
        p95_duration_ms: durations.length > 0 ? durations[Math.floor(durations.length * 0.95)] : 0,
        p99_duration_ms: durations.length > 0 ? durations[Math.floor(durations.length * 0.99)] : 0,
        total_calls: total,
        error_count: errors,
        success_rate: total > 0 ? Math.round((1 - errors / total) * 100) : 100,
      } as LatencyMetrics;
    });
  }

  // 2. AI request metrics
  const { data: aiRequests } = await supabase
    .from("ai_requests")
    .select("provider_name, model_name, duration_ms, status, tokens_in, tokens_out, cost_estimate")
    .gte("created_at", startTime.toISOString());

  if (aiRequests && aiRequests.length > 0) {
    const requests = aiRequests as any[];
    const totalTokens = requests.reduce((sum: number, r: any) => sum + (r.tokens_in || 0) + (r.tokens_out || 0), 0);
    const totalCost = requests.reduce((sum: number, r: any) => sum + (r.cost_estimate || 0), 0);
    const avgLatency = requests.reduce((sum: number, r: any) => sum + (r.duration_ms || 0), 0) / requests.length;

    metrics.ai_usage = {
      total_requests: requests.length,
      total_tokens: totalTokens,
      total_cost_usd: Math.round(totalCost * 100) / 100,
      avg_latency_ms: Math.round(avgLatency),
      by_provider: Object.entries(
        requests.reduce((acc: Record<string, { requests: number; tokens: number; cost: number }>, r: any) => {
          const key = r.provider_name;
          if (!acc[key]) acc[key] = { requests: 0, tokens: 0, cost: 0 };
          acc[key].requests++;
          acc[key].tokens += (r.tokens_in || 0) + (r.tokens_out || 0);
          acc[key].cost += r.cost_estimate || 0;
          return acc;
        }, {} as Record<string, { requests: number; tokens: number; cost: number }>)
      ).map(([provider, data]) => ({ provider, ...data })),
    };
  }

  // 3. Integration health (OAuth tokens)
  const { data: integrations } = await supabase
    .from("integrations")
    .select("provider, status, token_expires_at, last_sync_at, refresh_failure_count")
    .eq("status", "active");

  if (integrations) {
    const now = Date.now();
    metrics.integration_health = (integrations as any[]).map((i: any) => ({
      provider: i.provider,
      status: i.status,
      expires_in_hours: i.token_expires_at 
        ? Math.round((new Date(i.token_expires_at).getTime() - now) / (1000 * 60 * 60))
        : null,
      last_sync_hours_ago: i.last_sync_at
        ? Math.round((now - new Date(i.last_sync_at).getTime()) / (1000 * 60 * 60))
        : null,
      failure_count: i.refresh_failure_count || 0,
      needs_attention: (i.refresh_failure_count || 0) > 2 || 
        (i.token_expires_at && new Date(i.token_expires_at).getTime() < now + 24 * 60 * 60 * 1000),
    }));
  }

  // 4. Approval queue status
  const { data: approvals } = await supabase
    .from("approval_queue")
    .select("status, risk_level, created_at")
    .gte("created_at", startTime.toISOString());

  if (approvals) {
    const approvalsArr = approvals as any[];
    const pending = approvalsArr.filter((a: any) => a.status === "pending");
    const highRisk = pending.filter((a: any) => a.risk_level === "high");
    
    metrics.approval_queue = {
      total_pending: pending.length,
      high_risk_pending: highRisk.length,
      avg_wait_hours: pending.length > 0
        ? Math.round(pending.reduce((sum: number, a: any) => sum + (Date.now() - new Date(a.created_at).getTime()), 0) / pending.length / (1000 * 60 * 60) * 10) / 10
        : 0,
    };
  }

  // 5. System health scores
  if (workspaceId) {
    const { data: healthScore } = await supabase.rpc("calculate_health_score", {
      _workspace_id: workspaceId,
    });
    metrics.health_score = healthScore || 50;
  }

  // 6. Error rates from system_logs
  const { data: errorLogs } = await supabase
    .from("system_logs")
    .select("level, source")
    .gte("created_at", startTime.toISOString())
    .in("level", ["error", "critical"]);

  metrics.error_summary = {
    total_errors: errorLogs?.length || 0,
    by_source: (errorLogs as any[] || []).reduce((acc: Record<string, number>, log: any) => {
      acc[log.source || "unknown"] = (acc[log.source || "unknown"] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  metrics.collected_at = new Date().toISOString();
  return metrics;
}

async function queryMetrics(
  supabase: any,
  workspaceId: string | undefined,
  startTime: Date,
  timeRange: string
) {
  // Get latest snapshot or calculate fresh metrics
  const { data: latestSnapshot } = await supabase
    .from("monitoring_snapshots")
    .select("*")
    .order("snapshot_at", { ascending: false })
    .limit(1)
    .single();

  if (latestSnapshot && 
      new Date((latestSnapshot as any).snapshot_at).getTime() > Date.now() - 5 * 60 * 1000) {
    // Return cached snapshot if less than 5 minutes old
    return (latestSnapshot as any).metrics;
  }

  // Calculate fresh metrics
  return collectMetricsSnapshot(supabase, workspaceId, startTime);
}

async function checkAlertConditions(
  supabase: any,
  workspaceId: string | undefined,
  startTime: Date
): Promise<AlertRule[]> {
  const alerts: AlertRule[] = [];
  const metrics = await collectMetricsSnapshot(supabase, workspaceId, startTime);

  // Alert 1: High error rate
  const errorSummary = metrics.error_summary as { total_errors: number } | undefined;
  if (errorSummary && errorSummary.total_errors > 50) {
    alerts.push({
      id: "high_error_rate",
      name: "Taux d'erreur élevé",
      condition: "errors > 50 in 24h",
      threshold: 50,
      channel: "slack",
      triggered: true,
      last_triggered_at: new Date().toISOString(),
    });
  }

  // Alert 2: Integration token expiring
  const integrationHealth = metrics.integration_health as Array<{ provider: string; expires_in_hours: number | null }> | undefined;
  if (integrationHealth) {
    const expiring = integrationHealth.filter(i => i.expires_in_hours !== null && i.expires_in_hours < 24);
    if (expiring.length > 0) {
      alerts.push({
        id: "token_expiring",
        name: "Token OAuth expirant",
        condition: "token_expires_in < 24h",
        threshold: 24,
        channel: "email",
        triggered: true,
        last_triggered_at: new Date().toISOString(),
      });
    }
  }

  // Alert 3: High latency
  const agentLatency = metrics.agent_latency as LatencyMetrics[] | undefined;
  if (agentLatency) {
    const slowAgents = agentLatency.filter(a => a.p95_duration_ms > 5000);
    if (slowAgents.length > 0) {
      alerts.push({
        id: "high_latency",
        name: "Latence élevée détectée",
        condition: "p95_latency > 5s",
        threshold: 5000,
        channel: "slack",
        triggered: true,
        last_triggered_at: new Date().toISOString(),
      });
    }
  }

  // Alert 4: Pending approvals backlog
  const approvalQueue = metrics.approval_queue as { total_pending: number; avg_wait_hours: number } | undefined;
  if (approvalQueue && approvalQueue.total_pending > 20) {
    alerts.push({
      id: "approval_backlog",
      name: "File d'approbations saturée",
      condition: "pending_approvals > 20",
      threshold: 20,
      channel: "webhook",
      triggered: true,
      last_triggered_at: new Date().toISOString(),
    });
  }

  // Log alerts to data_quality_alerts table
  for (const alert of alerts.filter(a => a.triggered)) {
    await supabase.from("data_quality_alerts").insert({
      workspace_id: workspaceId,
      alert_type: alert.id,
      severity: "warning",
      message: alert.name,
      details: { condition: alert.condition, threshold: alert.threshold },
      resolved_at: null,
    });
  }

  return alerts;
}
