import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Run types supported by the executor
type RunType =
  | "DAILY_EXECUTIVE_BRIEF"
  | "WEEKLY_EXECUTIVE_REVIEW"
  | "MARKETING_WEEK_PLAN"
  | "SEO_AUDIT_REPORT"
  | "FUNNEL_DIAGNOSTIC"
  | "ACCESS_REVIEW"
  | "SALES_PIPELINE_REVIEW";

interface RunRequest {
  run_type: RunType;
  workspace_id: string;
  site_id?: string;
  inputs?: Record<string, unknown>;
}

interface RunResult {
  run_id: string;
  status: "queued" | "running" | "completed" | "failed";
  outputs?: Record<string, unknown>;
  evidence_bundle_id?: string;
  error?: string;
}

interface EvidenceData {
  sources: Array<{
    type: string;
    name: string;
    data: Record<string, unknown>;
    confidence: string;
  }>;
  metrics: Array<{
    name: string;
    value: number;
    unit?: string;
    trend?: string;
    baseline?: number;
  }>;
  reasoning: Array<{
    type: string;
    content: string;
    confidence: string;
  }>;
}

// Template-based run executor (works without AI keys)
// deno-lint-ignore no-explicit-any
async function executeRun(
  supabase: SupabaseClient<any, "public", any>,
  runType: RunType,
  workspaceId: string,
  siteId?: string
): Promise<RunResult> {
  const runId = crypto.randomUUID();
  const startedAt = new Date().toISOString();

  // Create run record
  const { error: insertError } = await supabase.from("executive_runs").insert({
    id: runId,
    workspace_id: workspaceId,
    site_id: siteId || null,
    run_type: runType,
    status: "running",
    inputs: { triggered_at: startedAt },
    started_at: startedAt,
  } as Record<string, unknown>);

  if (insertError) {
    console.error("Failed to create run record:", insertError);
    return { run_id: runId, status: "failed", error: insertError.message };
  }

  try {
    let outputs: Record<string, unknown> = {};

    switch (runType) {
      case "DAILY_EXECUTIVE_BRIEF":
        outputs = await generateDailyBrief(supabase, workspaceId, siteId);
        break;
      case "WEEKLY_EXECUTIVE_REVIEW":
        outputs = await generateWeeklyReview(supabase, workspaceId, siteId);
        break;
      case "MARKETING_WEEK_PLAN":
        outputs = await generateMarketingPlan(supabase, workspaceId, siteId);
        break;
      case "SEO_AUDIT_REPORT":
        outputs = await generateSEOReport(supabase, workspaceId, siteId);
        break;
      case "FUNNEL_DIAGNOSTIC":
        outputs = await generateFunnelDiagnostic(supabase, workspaceId, siteId);
        break;
      case "ACCESS_REVIEW":
        outputs = await generateAccessReview(supabase, workspaceId);
        break;
      case "SALES_PIPELINE_REVIEW":
        outputs = await generateSalesPipelineReview(supabase, workspaceId);
        break;
      default:
        throw new Error(`Unknown run type: ${runType}`);
    }

    // Update run as completed
    const completedAt = new Date().toISOString();
    await supabase
      .from("executive_runs")
      .update({
        status: "completed",
        outputs,
        completed_at: completedAt,
        duration_ms: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
      } as Record<string, unknown>)
      .eq("id", runId);

    // Create Evidence Bundle
    const evidenceBundleId = await createEvidenceBundle(
      supabase,
      workspaceId,
      runId,
      runType,
      outputs
    );

    // Log action
    await supabase.from("action_log").insert({
      workspace_id: workspaceId,
      site_id: siteId || null,
      actor_type: "agent",
      action_type: runType.toLowerCase(),
      description: `Exécution ${runType} terminée`,
      is_automated: true,
      result: "success",
    } as Record<string, unknown>);

    return { run_id: runId, status: "completed", outputs, evidence_bundle_id: evidenceBundleId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    await supabase
      .from("executive_runs")
      .update({
        status: "failed",
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq("id", runId);

    return { run_id: runId, status: "failed", error: errorMessage };
  }
}

// Create Evidence Bundle for a completed run
// deno-lint-ignore no-explicit-any
async function createEvidenceBundle(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string,
  runId: string,
  runType: RunType,
  outputs: Record<string, unknown>
): Promise<string | undefined> {
  try {
    // Build key metrics from outputs
    const keyMetrics: Array<{ name: string; value: number; unit?: string; trend?: string }> = [];
    
    // Extract metrics based on run type
    // deno-lint-ignore no-explicit-any
    const metrics = outputs.metrics as Record<string, any> | undefined;
    if (metrics) {
      if (typeof metrics.pending_approvals === 'number') {
        keyMetrics.push({ name: "Approbations en attente", value: metrics.pending_approvals });
      }
      if (typeof metrics.success_rate === 'number') {
        keyMetrics.push({ name: "Taux de succès", value: metrics.success_rate, unit: "%" });
      }
      if (typeof metrics.total_actions === 'number') {
        keyMetrics.push({ name: "Actions totales", value: metrics.total_actions });
      }
    }

    // deno-lint-ignore no-explicit-any
    const issuesSummary = outputs.issues_summary as Record<string, any> | undefined;
    if (issuesSummary) {
      if (typeof issuesSummary.critical === 'number') {
        keyMetrics.push({ name: "Problèmes critiques", value: issuesSummary.critical });
      }
      if (typeof issuesSummary.total === 'number') {
        keyMetrics.push({ name: "Total problèmes", value: issuesSummary.total });
      }
    }

    // deno-lint-ignore no-explicit-any
    const healthScore = outputs.health_score as number | undefined;
    if (typeof healthScore === 'number') {
      keyMetrics.push({ name: "Score de santé", value: healthScore, unit: "%" });
    }

    // Determine confidence based on data availability
    const hasRealData = keyMetrics.length > 0;
    const confidence = hasRealData ? 'medium' : 'low';

    // Create the bundle
    const { data: bundle, error: bundleError } = await supabase
      .from("evidence_bundles")
      .insert({
        workspace_id: workspaceId,
        executive_run_id: runId,
        title: `Evidence: ${getRunTypeLabel(runType)}`,
        summary: outputs.summary as string || `Preuves pour l'exécution ${runType}`,
        key_metrics: keyMetrics,
        overall_confidence: confidence,
        confidence_score: hasRealData ? 70 : 30,
        limitations: hasRealData ? [] : ["Données limitées disponibles"],
        warnings: [],
      } as Record<string, unknown>)
      .select("id")
      .single();

    if (bundleError) {
      console.error("Failed to create evidence bundle:", bundleError);
      return undefined;
    }

    const bundleId = bundle.id;

    // Add data sources
    const sources: Array<{ type: string; name: string; data: Record<string, unknown>; confidence: string }> = [];

    if (metrics) {
      sources.push({
        type: "database",
        name: "Métriques internes",
        data: metrics,
        confidence: "high",
      });
    }

    if (outputs.recent_activity) {
      sources.push({
        type: "database",
        name: "Historique des actions",
        data: { count: (outputs.recent_activity as unknown[]).length },
        confidence: "high",
      });
    }

    if (outputs.team) {
      sources.push({
        type: "database",
        name: "Données équipe",
        data: outputs.team as Record<string, unknown>,
        confidence: "high",
      });
    }

    if (outputs.pipeline) {
      sources.push({
        type: "database",
        name: "Pipeline commercial",
        data: outputs.pipeline as Record<string, unknown>,
        confidence: "high",
      });
    }

    // Insert sources
    if (sources.length > 0) {
      await supabase.from("evidence_sources").insert(
        sources.map((s) => ({
          bundle_id: bundleId,
          workspace_id: workspaceId,
          source_type: s.type,
          source_name: s.name,
          data_extracted: s.data,
          confidence: s.confidence,
          data_snapshot_at: new Date().toISOString(),
        } as Record<string, unknown>))
      );
    }

    // Add reasoning steps
    const reasoning: Array<{ order: number; type: string; content: string; confidence: string }> = [];

    reasoning.push({
      order: 1,
      type: "observation",
      content: `Exécution de l'analyse ${getRunTypeLabel(runType)}`,
      confidence: "high",
    });

    if (outputs.priorities && Array.isArray(outputs.priorities)) {
      reasoning.push({
        order: 2,
        type: "analysis",
        content: `${(outputs.priorities as string[]).filter(Boolean).length} priorité(s) identifiée(s)`,
        confidence: "medium",
      });
    }

    if (outputs.recommendations && Array.isArray(outputs.recommendations)) {
      const recs = (outputs.recommendations as string[]).filter(Boolean);
      reasoning.push({
        order: 3,
        type: "recommendation",
        content: recs.length > 0 ? recs[0] : "Aucune recommandation spécifique",
        confidence: "medium",
      });
    }

    if (reasoning.length > 0) {
      await supabase.from("evidence_reasoning").insert(
        reasoning.map((r) => ({
          bundle_id: bundleId,
          workspace_id: workspaceId,
          step_order: r.order,
          step_type: r.type,
          content: r.content,
          confidence: r.confidence,
        } as Record<string, unknown>))
      );
    }

    return bundleId;
  } catch (error) {
    console.error("Error creating evidence bundle:", error);
    return undefined;
  }
}

function getRunTypeLabel(runType: RunType): string {
  const labels: Record<RunType, string> = {
    DAILY_EXECUTIVE_BRIEF: "Brief quotidien",
    WEEKLY_EXECUTIVE_REVIEW: "Revue hebdomadaire",
    MARKETING_WEEK_PLAN: "Plan marketing",
    SEO_AUDIT_REPORT: "Audit SEO",
    FUNNEL_DIAGNOSTIC: "Diagnostic funnel",
    ACCESS_REVIEW: "Revue des accès",
    SALES_PIPELINE_REVIEW: "Revue pipeline",
  };
  return labels[runType] || runType;
}

// Template-based generators (work without AI)
// deno-lint-ignore no-explicit-any
async function generateDailyBrief(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string,
  siteId?: string
): Promise<Record<string, unknown>> {
  // Gather real data
  const { data: pendingApprovals } = await supabase
    .from("approval_queue")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("status", "pending");

  const { data: recentActions } = await supabase
    .from("action_log")
    .select("action_type, description, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(5);

  const kpisQuery = siteId
    ? await supabase
        .from("kpis_daily")
        .select("*")
        .eq("site_id", siteId)
        .order("date", { ascending: false })
        .limit(7)
    : { data: null };

  return {
    summary: "Votre brief exécutif quotidien",
    generated_at: new Date().toISOString(),
    metrics: {
      pending_approvals: pendingApprovals?.length || 0,
      recent_actions: recentActions?.length || 0,
      kpi_days_available: kpisQuery.data?.length || 0,
    },
    priorities: [
      pendingApprovals && pendingApprovals.length > 0
        ? `${pendingApprovals.length} action(s) en attente d'approbation`
        : null,
      !kpisQuery.data || kpisQuery.data.length === 0
        ? "Connectez vos sources de données pour des insights personnalisés"
        : null,
    ].filter(Boolean),
    recent_activity: recentActions || [],
  };
}

// deno-lint-ignore no-explicit-any
async function generateWeeklyReview(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string,
  _siteId?: string
): Promise<Record<string, unknown>> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: weekActions } = await supabase
    .from("action_log")
    .select("action_type, result")
    .eq("workspace_id", workspaceId)
    .gte("created_at", weekAgo.toISOString());

  // deno-lint-ignore no-explicit-any
  const successCount = weekActions?.filter((a: any) => a.result === "success").length || 0;
  const totalCount = weekActions?.length || 0;

  return {
    summary: "Revue hebdomadaire exécutive",
    period: {
      start: weekAgo.toISOString(),
      end: new Date().toISOString(),
    },
    metrics: {
      total_actions: totalCount,
      successful_actions: successCount,
      success_rate: totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0,
    },
    highlights: [
      `${totalCount} actions exécutées cette semaine`,
      `Taux de succès: ${totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0}%`,
    ],
    recommendations: [
      "Continuer à monitorer les KPIs quotidiens",
      "Prioriser les actions à fort impact",
    ],
  };
}

// deno-lint-ignore no-explicit-any
async function generateMarketingPlan(
  _supabase: SupabaseClient<any, "public", any>,
  _workspaceId: string,
  _siteId?: string
): Promise<Record<string, unknown>> {
  return {
    summary: "Plan marketing de la semaine",
    week_of: new Date().toISOString(),
    focus_areas: [
      { area: "SEO", priority: "high", tasks: ["Audit technique", "Optimisation meta"] },
      { area: "Contenu", priority: "medium", tasks: ["Calendrier éditorial", "Briefs articles"] },
      { area: "Social", priority: "medium", tasks: ["Planification posts", "Engagement"] },
    ],
    kpis_to_watch: ["Trafic organique", "Taux de conversion", "Position moyenne"],
    blockers: [],
  };
}

// deno-lint-ignore no-explicit-any
async function generateSEOReport(
  supabase: SupabaseClient<any, "public", any>,
  _workspaceId: string,
  siteId?: string
): Promise<Record<string, unknown>> {
  // Check for existing crawl data
  const issuesQuery = siteId
    ? await supabase
        .from("seo_issues")
        .select("severity, issue_type")
        .eq("site_id", siteId)
        .eq("status", "open")
    : { data: null };

  // deno-lint-ignore no-explicit-any
  const criticalCount = issuesQuery.data?.filter((i: any) => i.severity === "critical").length || 0;
  // deno-lint-ignore no-explicit-any
  const highCount = issuesQuery.data?.filter((i: any) => i.severity === "high").length || 0;

  return {
    summary: "Rapport d'audit SEO",
    generated_at: new Date().toISOString(),
    health_score: issuesQuery.data ? Math.max(0, 100 - criticalCount * 20 - highCount * 5) : null,
    issues_summary: {
      critical: criticalCount,
      high: highCount,
      total: issuesQuery.data?.length || 0,
    },
    recommendations: [
      criticalCount > 0 ? "Corriger les problèmes critiques en priorité" : null,
      !issuesQuery.data ? "Lancez un crawl pour analyser votre site" : null,
    ].filter(Boolean),
  };
}

// deno-lint-ignore no-explicit-any
async function generateFunnelDiagnostic(
  _supabase: SupabaseClient<any, "public", any>,
  _workspaceId: string,
  _siteId?: string
): Promise<Record<string, unknown>> {
  return {
    summary: "Diagnostic du tunnel de conversion",
    generated_at: new Date().toISOString(),
    funnel_stages: [
      { stage: "Acquisition", status: "needs_data", metric: null },
      { stage: "Activation", status: "needs_data", metric: null },
      { stage: "Retention", status: "needs_data", metric: null },
      { stage: "Revenue", status: "needs_data", metric: null },
      { stage: "Referral", status: "needs_data", metric: null },
    ],
    recommendations: [
      "Connectez Google Analytics pour un diagnostic complet",
      "Définissez vos événements de conversion clés",
    ],
  };
}

// deno-lint-ignore no-explicit-any
async function generateAccessReview(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string
): Promise<Record<string, unknown>> {
  const { data: members } = await supabase
    .from("user_roles")
    .select("role")
    .eq("workspace_id", workspaceId);

  const { data: integrations } = await supabase
    .from("integrations")
    .select("provider, status")
    .eq("workspace_id", workspaceId);

  return {
    summary: "Revue des accès et permissions",
    generated_at: new Date().toISOString(),
    team: {
      total_members: members?.length || 0,
      // deno-lint-ignore no-explicit-any
      by_role: members?.reduce((acc: Record<string, number>, m: any) => {
        acc[m.role] = (acc[m.role] || 0) + 1;
        return acc;
      }, {}) || {},
    },
    integrations: {
      total: integrations?.length || 0,
      // deno-lint-ignore no-explicit-any
      active: integrations?.filter((i: any) => i.status === "active").length || 0,
    },
    recommendations: [
      "Vérifiez régulièrement les permissions des membres",
      "Désactivez les intégrations inutilisées",
    ],
  };
}

// deno-lint-ignore no-explicit-any
async function generateSalesPipelineReview(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string
): Promise<Record<string, unknown>> {
  const { data: deals } = await supabase
    .from("deals")
    .select("stage, value")
    .eq("workspace_id", workspaceId);

  // deno-lint-ignore no-explicit-any
  const totalValue = deals?.reduce((sum: number, d: any) => sum + (d.value || 0), 0) || 0;

  return {
    summary: "Revue du pipeline commercial",
    generated_at: new Date().toISOString(),
    pipeline: {
      total_deals: deals?.length || 0,
      total_value: totalValue,
      // deno-lint-ignore no-explicit-any
      by_stage: deals?.reduce((acc: Record<string, number>, d: any) => {
        acc[d.stage] = (acc[d.stage] || 0) + 1;
        return acc;
      }, {}) || {},
    },
    recommendations: deals && deals.length > 0
      ? ["Suivez les deals en cours", "Relancez les opportunités stagnantes"]
      : ["Créez votre premier deal pour commencer"],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { run_type, workspace_id, site_id, scheduled } = body;

    // For scheduled runs (from cron), execute for all active workspaces
    if (scheduled) {
      console.log(`[CRON] Executing scheduled run: ${run_type}`);
      
      // Get all workspaces with active scheduled runs for this type
      const { data: scheduledRuns } = await supabase
        .from("scheduled_runs")
        .select("workspace_id")
        .eq("run_type", run_type)
        .eq("enabled", true);

      if (scheduledRuns && scheduledRuns.length > 0) {
        const results = await Promise.allSettled(
          scheduledRuns.map((sr) => executeRun(supabase, run_type, sr.workspace_id))
        );
        console.log(`[CRON] Completed ${results.length} runs for ${run_type}`);
      }

      return new Response(JSON.stringify({ scheduled: true, run_type }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For user-triggered runs, validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate workspace access
    const { data: access } = await supabase.rpc("has_workspace_access", {
      _user_id: user.id,
      _workspace_id: workspace_id,
    });

    if (!access) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Execute the run
    const result = await executeRun(supabase, run_type, workspace_id, site_id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Run executor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
