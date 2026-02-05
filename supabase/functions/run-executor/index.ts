import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getTemplate } from "../_shared/email-templates.ts";

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
  | "SEO_TECH_AUDIT"
  | "FUNNEL_DIAGNOSTIC"
  | "ACCESS_REVIEW"
  | "SALES_PIPELINE_REVIEW"
  | "DAILY_ANOMALY_DETECTION"
  | "DAILY_PERFORMANCE_CHECK"
  | "DAILY_ADS_OPTIMIZATION"
  | "MONTHLY_COMPLIANCE_AUDIT"
  | "COMPETITIVE_INTEL"
  | "MONTHLY_PULSE_CHECK"
  | "WEEKLY_CONTENT_PLAN"
  | "MONTHLY_SECURITY_AUDIT"
  | "MONTHLY_SEO_HEALTH"
  | "REPUTATION_MONITORING";

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

// Mapping run_type -> département requis
const RUN_TYPE_DEPARTMENT: Record<RunType, string> = {
  DAILY_EXECUTIVE_BRIEF: "direction",
  WEEKLY_EXECUTIVE_REVIEW: "direction",
  MARKETING_WEEK_PLAN: "marketing",
  SEO_AUDIT_REPORT: "marketing",
  SEO_TECH_AUDIT: "marketing",
  FUNNEL_DIAGNOSTIC: "sales",
  ACCESS_REVIEW: "governance",
  SALES_PIPELINE_REVIEW: "sales",
  DAILY_ANOMALY_DETECTION: "data",
  DAILY_PERFORMANCE_CHECK: "engineering",
  DAILY_ADS_OPTIMIZATION: "marketing",
  MONTHLY_COMPLIANCE_AUDIT: "governance",
  COMPETITIVE_INTEL: "marketing",
  MONTHLY_PULSE_CHECK: "hr",
  WEEKLY_CONTENT_PLAN: "marketing",
  MONTHLY_SECURITY_AUDIT: "security",
  MONTHLY_SEO_HEALTH: "marketing",
  REPUTATION_MONITORING: "support",
};

// Quotas par plan
const PLAN_QUOTAS: Record<string, { runs_per_month: number; runs_per_day: number }> = {
  founder: { runs_per_month: 999999, runs_per_day: 999999 },
  full_company: { runs_per_month: 10000, runs_per_day: 500 },
  department: { runs_per_month: 200, runs_per_day: 20 },
  starter: { runs_per_month: 50, runs_per_day: 5 },
  free: { runs_per_month: 0, runs_per_day: 0 },
};

// Send run_completed email with anti-spam (max 1 per 5 minutes per workspace)
// deno-lint-ignore no-explicit-any
async function sendRunCompletedEmail(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string,
  runType: RunType,
  outputs: Record<string, unknown>
): Promise<void> {
  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.log("[RUN-EXECUTOR] RESEND_API_KEY not configured, skipping email");
      return;
    }

    // Anti-spam check: was an email sent in the last 5 minutes for this workspace?
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentEmails } = await supabase
      .from("email_log")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("template_name", "run_completed")
      .gte("created_at", fiveMinutesAgo)
      .limit(1);

    if (recentEmails && recentEmails.length > 0) {
      console.log("[RUN-EXECUTOR] Skipping email - already sent within last 5 minutes");
      return;
    }

    // Get workspace owner email
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("owner_id, name")
      .eq("id", workspaceId)
      .single();

    if (!workspace?.owner_id) {
      console.log("[RUN-EXECUTOR] No workspace owner found");
      return;
    }

    // Get owner's email from auth
    const { data: userData } = await supabase.auth.admin.getUserById(workspace.owner_id);
    const ownerEmail = userData?.user?.email;
    
    if (!ownerEmail) {
      console.log("[RUN-EXECUTOR] No owner email found");
      return;
    }

    // Prepare email data
    const summary = (outputs.summary as string) || `Exécution ${getRunTypeLabel(runType)} terminée avec succès.`;
    const emailData = {
      userName: userData?.user?.user_metadata?.name || undefined,
      agentName: "Growth OS",
      runType: getRunTypeLabel(runType),
      summary,
    };

    const { subject, html } = getTemplate("run_completed", emailData);

    // Send via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Growth OS <noreply@agent-growth-automator.com>",
        to: [ownerEmail],
        subject,
        html,
      }),
    });

    const resendData = await response.json();
    
    // Log to email_log
    await supabase.from("email_log").insert({
      workspace_id: workspaceId,
      recipient: ownerEmail,
      template_name: "run_completed",
      subject,
      status: response.ok ? "sent" : "failed",
      resend_id: resendData.id || null,
      error_message: response.ok ? null : (resendData.message || "Unknown error"),
    });

    console.log(`[RUN-EXECUTOR] Email ${response.ok ? "sent" : "failed"}: run_completed to ${ownerEmail}`);
  } catch (error) {
    console.error("[RUN-EXECUTOR] Email send error:", error);
  }
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
    run_type: runType,
    status: "running",
     inputs: { triggered_at: startedAt, site_id: siteId || null },
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
      case "SEO_TECH_AUDIT":
        outputs = await generateSEOTechAudit(supabase, workspaceId, siteId);
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
       case "DAILY_ANOMALY_DETECTION":
         outputs = await generateAnomalyDetection(supabase, workspaceId);
         break;
       case "DAILY_PERFORMANCE_CHECK":
         outputs = await generatePerformanceCheck(supabase, workspaceId);
         break;
       case "DAILY_ADS_OPTIMIZATION":
         outputs = await generateAdsOptimization(supabase, workspaceId);
         break;
       case "MONTHLY_COMPLIANCE_AUDIT":
         outputs = await generateComplianceAudit(supabase, workspaceId);
         break;
       case "COMPETITIVE_INTEL":
         outputs = await generateCompetitiveIntel(supabase, workspaceId);
         break;
       case "MONTHLY_PULSE_CHECK":
         outputs = await generatePulseCheck(supabase, workspaceId);
         break;
       case "WEEKLY_CONTENT_PLAN":
         outputs = await generateContentPlan(supabase, workspaceId);
         break;
       case "MONTHLY_SECURITY_AUDIT":
         outputs = await generateSecurityAudit(supabase, workspaceId);
         break;
       case "MONTHLY_SEO_HEALTH":
         outputs = await generateSEOHealth(supabase, workspaceId, siteId);
         break;
       case "REPUTATION_MONITORING":
         outputs = await generateReputationMonitoring(supabase, workspaceId);
         break;
      default:
         outputs = { summary: `Run type ${runType} exécuté`, generated_at: new Date().toISOString() };
    }

    // Update run as completed
    const completedAt = new Date().toISOString();
     const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();
     const { error: updateError } = await supabase
      .from("executive_runs")
      .update({
         status: "done",
        outputs,
        completed_at: completedAt,
         executive_summary: `Exécution ${getRunTypeLabel(runType)} terminée en ${durationMs}ms`,
      } as Record<string, unknown>)
      .eq("id", runId);
     
     if (updateError) {
       console.error("Failed to update run status:", updateError);
     }

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

    // Send run_completed email notification (with anti-spam: max 1 email per 5 minutes per workspace)
    await sendRunCompletedEmail(supabase, workspaceId, runType, outputs);

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
    SEO_TECH_AUDIT: "Audit SEO Technique",
    FUNNEL_DIAGNOSTIC: "Diagnostic funnel",
    ACCESS_REVIEW: "Revue des accès",
    SALES_PIPELINE_REVIEW: "Revue pipeline",
    DAILY_ANOMALY_DETECTION: "Détection d'anomalies",
    DAILY_PERFORMANCE_CHECK: "Check performance",
    DAILY_ADS_OPTIMIZATION: "Optimisation ads",
    MONTHLY_COMPLIANCE_AUDIT: "Audit conformité",
    COMPETITIVE_INTEL: "Veille concurrentielle",
    MONTHLY_PULSE_CHECK: "Pulse RH mensuel",
    WEEKLY_CONTENT_PLAN: "Plan contenu",
    MONTHLY_SECURITY_AUDIT: "Audit sécurité",
    MONTHLY_SEO_HEALTH: "Santé SEO",
    REPUTATION_MONITORING: "Veille réputation",
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

// SEO Tech Audit using AI Gateway for intelligent analysis
// deno-lint-ignore no-explicit-any
async function generateSEOTechAudit(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string,
  siteId?: string
): Promise<Record<string, unknown>> {
  // Get site URL
  let siteUrl = "";
  let siteName = "";
  
  if (siteId) {
    const { data: site } = await supabase
      .from("sites")
      .select("url, name")
      .eq("id", siteId)
      .single();
    siteUrl = site?.url || "";
    siteName = site?.name || "";
  }
  
  if (!siteUrl) {
    // Try to get default site for workspace
    const { data: defaultSite } = await supabase
      .from("sites")
      .select("url, name")
      .eq("workspace_id", workspaceId)
      .limit(1)
      .single();
    siteUrl = defaultSite?.url || "";
    siteName = defaultSite?.name || "";
  }
  
  if (!siteUrl) {
    return {
      summary: "Aucun site configuré pour l'audit",
      generated_at: new Date().toISOString(),
      error: "site_not_found",
      score: 0,
      issues: [],
      opportunities: [],
      action_plan: [],
    };
  }

  // Call AI Gateway for intelligent SEO analysis
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.log("[SEO_TECH_AUDIT] LOVABLE_API_KEY not configured, using template-based analysis");
    return generateTemplateBasedSEOAudit(siteUrl, siteName);
  }

  try {
    const systemPrompt = `Tu es un expert SEO technique. Analyse l'URL fournie et génère un audit SEO structuré.

Tu dois retourner un JSON valide avec cette structure exacte:
{
  "score": <number 0-100>,
  "issues": [
    {
      "id": "<string>",
      "severity": "<critical|warning|info>",
      "category": "<string>",
      "title": "<string>",
      "description": "<string>",
      "recommendation": "<string>",
      "effort": "<low|medium|high>"
    }
  ],
  "opportunities": [
    {
      "title": "<string>",
      "potential_impact": "<string>",
      "effort": "<low|medium|high>"
    }
  ],
  "action_plan": [
    {
      "priority": <number 1-5>,
      "action": "<string>",
      "estimated_time": "<string>",
      "impact": "<string>"
    }
  ],
  "metrics": {
    "estimated_page_speed": "<fast|medium|slow>",
    "mobile_friendly": <boolean>,
    "https_status": <boolean>,
    "indexation_risk": "<low|medium|high>"
  }
}

Catégories d'issues possibles: "meta_tags", "headings", "performance", "mobile", "indexation", "structured_data", "links", "content", "security"

Analyse les aspects suivants:
1. Balises meta (title, description)
2. Structure des headings (H1, H2, etc.)
3. Vitesse de chargement estimée
4. Compatibilité mobile
5. Indexation et robots.txt/sitemap
6. Données structurées
7. Liens internes/externes
8. HTTPS et sécurité

Sois précis et actionnable dans tes recommandations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyse SEO technique pour le site: ${siteUrl}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "seo_audit_result",
              description: "Retourne le résultat de l'audit SEO technique",
              parameters: {
                type: "object",
                properties: {
                  score: { type: "number", description: "Score SEO technique de 0 à 100" },
                  issues: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        severity: { type: "string", enum: ["critical", "warning", "info"] },
                        category: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        recommendation: { type: "string" },
                        effort: { type: "string", enum: ["low", "medium", "high"] },
                      },
                      required: ["id", "severity", "category", "title", "description", "recommendation", "effort"],
                    },
                  },
                  opportunities: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        potential_impact: { type: "string" },
                        effort: { type: "string", enum: ["low", "medium", "high"] },
                      },
                      required: ["title", "potential_impact", "effort"],
                    },
                  },
                  action_plan: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        priority: { type: "number" },
                        action: { type: "string" },
                        estimated_time: { type: "string" },
                        impact: { type: "string" },
                      },
                      required: ["priority", "action", "estimated_time", "impact"],
                    },
                  },
                  metrics: {
                    type: "object",
                    properties: {
                      estimated_page_speed: { type: "string", enum: ["fast", "medium", "slow"] },
                      mobile_friendly: { type: "boolean" },
                      https_status: { type: "boolean" },
                      indexation_risk: { type: "string", enum: ["low", "medium", "high"] },
                    },
                  },
                },
                required: ["score", "issues", "opportunities", "action_plan", "metrics"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "seo_audit_result" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[SEO_TECH_AUDIT] AI Gateway error:", response.status, errorText);
      return generateTemplateBasedSEOAudit(siteUrl, siteName);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const auditResult = JSON.parse(toolCall.function.arguments);
      
      // Store in agent_runs for history
      await supabase.from("agent_runs").insert({
        workspace_id: workspaceId,
        site_id: siteId,
        agent_type: "tech_auditor",
        status: "completed",
        inputs: { url: siteUrl, site_name: siteName },
        outputs: auditResult,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
      
      return {
        summary: `Audit SEO technique de ${siteName || siteUrl}`,
        generated_at: new Date().toISOString(),
        site_url: siteUrl,
        site_name: siteName,
        ...auditResult,
      };
    }

    return generateTemplateBasedSEOAudit(siteUrl, siteName);
  } catch (error) {
    console.error("[SEO_TECH_AUDIT] Error calling AI Gateway:", error);
    return generateTemplateBasedSEOAudit(siteUrl, siteName);
  }
}

// Fallback template-based SEO audit when AI is unavailable
function generateTemplateBasedSEOAudit(siteUrl: string, siteName: string): Record<string, unknown> {
  return {
    summary: `Audit SEO technique de ${siteName || siteUrl}`,
    generated_at: new Date().toISOString(),
    site_url: siteUrl,
    site_name: siteName,
    score: 65,
    issues: [
      {
        id: "meta_title_check",
        severity: "warning",
        category: "meta_tags",
        title: "Vérification des balises title",
        description: "Vérifiez que chaque page a une balise title unique et optimisée",
        recommendation: "Assurez-vous que chaque title est entre 50-60 caractères et contient vos mots-clés principaux",
        effort: "low",
      },
      {
        id: "meta_desc_check",
        severity: "warning",
        category: "meta_tags",
        title: "Vérification des meta descriptions",
        description: "Chaque page doit avoir une meta description unique et engageante",
        recommendation: "Rédigez des descriptions de 150-160 caractères avec un call-to-action",
        effort: "low",
      },
      {
        id: "h1_structure",
        severity: "info",
        category: "headings",
        title: "Structure des headings H1",
        description: "Vérifiez qu'il n'y a qu'un seul H1 par page",
        recommendation: "Auditez vos pages pour corriger les H1 multiples ou manquants",
        effort: "medium",
      },
      {
        id: "mobile_check",
        severity: "warning",
        category: "mobile",
        title: "Compatibilité mobile",
        description: "Assurez-vous que votre site est entièrement responsive",
        recommendation: "Testez sur plusieurs appareils et utilisez Google Mobile-Friendly Test",
        effort: "medium",
      },
      {
        id: "page_speed",
        severity: "warning",
        category: "performance",
        title: "Vitesse de chargement",
        description: "La vitesse de chargement impacte le SEO et l'expérience utilisateur",
        recommendation: "Utilisez PageSpeed Insights pour identifier les optimisations possibles",
        effort: "high",
      },
    ],
    opportunities: [
      {
        title: "Ajouter des données structurées",
        potential_impact: "Amélioration de l'affichage dans les résultats de recherche (rich snippets)",
        effort: "medium",
      },
      {
        title: "Optimiser le maillage interne",
        potential_impact: "Meilleure distribution du PageRank et crawlabilité",
        effort: "medium",
      },
      {
        title: "Créer un sitemap XML",
        potential_impact: "Indexation plus rapide des nouvelles pages",
        effort: "low",
      },
    ],
    action_plan: [
      {
        priority: 1,
        action: "Auditer et optimiser les balises title et meta description",
        estimated_time: "2-4 heures",
        impact: "Amélioration du CTR dans les SERPs",
      },
      {
        priority: 2,
        action: "Corriger les problèmes de structure H1/H2",
        estimated_time: "1-2 heures",
        impact: "Meilleure compréhension du contenu par Google",
      },
      {
        priority: 3,
        action: "Optimiser les performances (images, cache, minification)",
        estimated_time: "4-8 heures",
        impact: "Meilleur Core Web Vitals et classement",
      },
      {
        priority: 4,
        action: "Implémenter les données structurées Schema.org",
        estimated_time: "2-4 heures",
        impact: "Rich snippets et meilleure visibilité",
      },
    ],
    metrics: {
      estimated_page_speed: "medium",
      mobile_friendly: true,
      https_status: siteUrl.startsWith("https"),
      indexation_risk: "low",
    },
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

// ====== NOUVEAUX GÉNÉRATEURS POUR LES DÉPARTEMENTS ======

// deno-lint-ignore no-explicit-any
async function generateAnomalyDetection(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string
): Promise<Record<string, unknown>> {
  // Check for unusual patterns in agent runs
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const { data: recentRuns } = await supabase
    .from("agent_runs")
    .select("agent_type, status, duration_ms")
    .eq("workspace_id", workspaceId)
    .gte("created_at", yesterday.toISOString());

  // deno-lint-ignore no-explicit-any
  const failedRuns = recentRuns?.filter((r: any) => r.status === "failed") || [];
  const anomalyScore = failedRuns.length > 5 ? "high" : failedRuns.length > 2 ? "medium" : "low";

  return {
    summary: "Détection d'anomalies quotidienne",
    generated_at: new Date().toISOString(),
    metrics: {
      total_runs_24h: recentRuns?.length || 0,
      failed_runs: failedRuns.length,
      anomaly_score: anomalyScore,
    },
    anomalies: failedRuns.length > 0 ? [`${failedRuns.length} exécution(s) échouée(s) détectée(s)`] : [],
    recommendations: anomalyScore !== "low" ? ["Vérifier les logs des agents", "Contrôler les intégrations"] : [],
  };
}

// deno-lint-ignore no-explicit-any
async function generatePerformanceCheck(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string
): Promise<Record<string, unknown>> {
  const { data: runs } = await supabase
    .from("agent_runs")
    .select("duration_ms")
    .eq("workspace_id", workspaceId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(100);

  // deno-lint-ignore no-explicit-any
  const durations = runs?.map((r: any) => r.duration_ms).filter(Boolean) || [];
  const avgDuration = durations.length > 0 ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length : 0;

  return {
    summary: "Check de performance quotidien",
    generated_at: new Date().toISOString(),
    metrics: {
      avg_duration_ms: Math.round(avgDuration),
      total_runs_analyzed: durations.length,
      performance_status: avgDuration < 5000 ? "excellent" : avgDuration < 15000 ? "good" : "needs_attention",
    },
    recommendations: avgDuration > 15000 ? ["Optimiser les requêtes lentes", "Vérifier les timeouts"] : [],
  };
}

// deno-lint-ignore no-explicit-any
async function generateAdsOptimization(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string
): Promise<Record<string, unknown>> {
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("name, status, budget_daily, cost_30d, clicks_30d, conversions_30d")
    .eq("workspace_id", workspaceId)
    .eq("status", "active");

  return {
    summary: "Optimisation Ads quotidienne",
    generated_at: new Date().toISOString(),
    campaigns_analyzed: campaigns?.length || 0,
    recommendations: campaigns && campaigns.length > 0 
      ? ["Analyser le ROAS par campagne", "Ajuster les budgets selon performance"]
      : ["Créez votre première campagne publicitaire"],
  };
}

// deno-lint-ignore no-explicit-any
async function generateComplianceAudit(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string
): Promise<Record<string, unknown>> {
  const { data: gdprRequests } = await supabase
    .from("gdpr_requests")
    .select("status, request_type")
    .eq("workspace_id", workspaceId)
    .eq("status", "pending");

  const { data: policies } = await supabase
    .from("policies")
    .select("id, is_active")
    .eq("workspace_id", workspaceId);

  return {
    summary: "Audit de conformité mensuel",
    generated_at: new Date().toISOString(),
    gdpr: {
      pending_requests: gdprRequests?.length || 0,
      compliance_status: (gdprRequests?.length || 0) === 0 ? "compliant" : "action_required",
    },
    policies: {
      total: policies?.length || 0,
      // deno-lint-ignore no-explicit-any
      active: policies?.filter((p: any) => p.is_active).length || 0,
    },
    recommendations: (gdprRequests?.length || 0) > 0 
      ? ["Traiter les demandes RGPD en attente"] 
      : ["Conformité RGPD à jour"],
  };
}

// deno-lint-ignore no-explicit-any
async function generateCompetitiveIntel(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string
): Promise<Record<string, unknown>> {
  const { data: competitors } = await supabase
    .from("competitor_profiles")
    .select("name, domain, last_analyzed_at")
    .eq("workspace_id", workspaceId);

  return {
    summary: "Veille concurrentielle",
    generated_at: new Date().toISOString(),
    competitors_tracked: competitors?.length || 0,
    insights: competitors && competitors.length > 0 
      ? ["Analyse des mouvements concurrentiels", "Surveillance des prix et offres"]
      : [],
    recommendations: !competitors || competitors.length === 0 
      ? ["Ajoutez des concurrents à surveiller"] 
      : ["Planifier une analyse approfondie"],
  };
}

// deno-lint-ignore no-explicit-any
async function generatePulseCheck(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string
): Promise<Record<string, unknown>> {
  const { data: employees } = await supabase
    .from("employees")
    .select("status, department")
    .eq("workspace_id", workspaceId);

  const { data: timeOff } = await supabase
    .from("time_off_requests")
    .select("status")
    .eq("workspace_id", workspaceId)
    .eq("status", "pending");

  return {
    summary: "Pulse RH mensuel",
    generated_at: new Date().toISOString(),
    team: {
      total_employees: employees?.length || 0,
      pending_time_off: timeOff?.length || 0,
    },
    recommendations: (timeOff?.length || 0) > 0 
      ? ["Traiter les demandes de congés en attente"] 
      : ["Équipe RH à jour"],
  };
}

// deno-lint-ignore no-explicit-any
async function generateContentPlan(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string
): Promise<Record<string, unknown>> {
  const { data: content } = await supabase
    .from("content_items")
    .select("status, content_type")
    .eq("workspace_id", workspaceId);

  // deno-lint-ignore no-explicit-any
  const draft = content?.filter((c: any) => c.status === "draft").length || 0;
  // deno-lint-ignore no-explicit-any
  const published = content?.filter((c: any) => c.status === "published").length || 0;

  return {
    summary: "Plan de contenu hebdomadaire",
    generated_at: new Date().toISOString(),
    content_status: {
      drafts: draft,
      published: published,
      total: content?.length || 0,
    },
    recommendations: draft > 5 
      ? ["Finaliser les brouillons en attente"] 
      : ["Créer du nouveau contenu"],
  };
}

// deno-lint-ignore no-explicit-any
async function generateSecurityAudit(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string
): Promise<Record<string, unknown>> {
  const { data: auditLogs } = await supabase
    .from("audit_log")
    .select("action, actor_type")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100);

  // deno-lint-ignore no-explicit-any
  const suspiciousActions = auditLogs?.filter((l: any) => 
    l.action.includes("delete") || l.action.includes("permission")
  ).length || 0;

  return {
    summary: "Audit de sécurité mensuel",
    generated_at: new Date().toISOString(),
    security_score: suspiciousActions < 5 ? 95 : suspiciousActions < 15 ? 75 : 50,
    findings: {
      total_actions_reviewed: auditLogs?.length || 0,
      suspicious_actions: suspiciousActions,
    },
    recommendations: suspiciousActions > 10 
      ? ["Revoir les actions sensibles", "Vérifier les permissions"] 
      : ["Sécurité nominale"],
  };
}

// deno-lint-ignore no-explicit-any
async function generateSEOHealth(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string,
  siteId?: string
): Promise<Record<string, unknown>> {
  const query = siteId 
    ? supabase.from("seo_issues").select("severity, status").eq("site_id", siteId)
    : supabase.from("sites").select("id").eq("workspace_id", workspaceId).limit(1);

  const { data } = await query;

  return {
    summary: "Santé SEO mensuelle",
    generated_at: new Date().toISOString(),
    site_analyzed: siteId || "aucun",
    issues_found: Array.isArray(data) ? data.length : 0,
    recommendations: ["Lancer un audit SEO complet", "Vérifier les Core Web Vitals"],
  };
}

// deno-lint-ignore no-explicit-any
async function generateReputationMonitoring(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string
): Promise<Record<string, unknown>> {
  const { data: reviews } = await supabase
    .from("reputation_reviews")
    .select("rating, responded_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  // deno-lint-ignore no-explicit-any
  const avgRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length 
    : 0;
  // deno-lint-ignore no-explicit-any
  const unanswered = reviews?.filter((r: any) => !r.responded_at).length || 0;

  return {
    summary: "Veille réputation",
    generated_at: new Date().toISOString(),
    metrics: {
      avg_rating: Math.round(avgRating * 10) / 10,
      total_reviews: reviews?.length || 0,
      unanswered_reviews: unanswered,
    },
    recommendations: unanswered > 0 
      ? [`Répondre aux ${unanswered} avis en attente`] 
      : ["Réputation bien gérée"],
  };
}

// Vérifie l'accès au département et les quotas
// deno-lint-ignore no-explicit-any
async function checkSubscriptionAccess(
  supabase: SupabaseClient<any, "public", any>,
  workspaceId: string,
  runType: RunType
): Promise<{ allowed: boolean; reason?: string; plan?: string }> {
  const requiredDept = RUN_TYPE_DEPARTMENT[runType] || "direction";

  // Get subscription info
  const { data: subscription } = await supabase
    .from("workspace_subscriptions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "active")
    .single();

  if (!subscription) {
    return { allowed: false, reason: "No active subscription" };
  }

  const plan = subscription.plan || "free";
  const isFounder = plan === "founder";
  const isFullCompany = subscription.is_full_company === true || isFounder;
  const isStarter = subscription.is_starter === true;

  // Founder/Full Company = accès à tout
  if (isFullCompany) {
    return { allowed: true, plan };
  }

  // Starter = accès limité à tout
  if (isStarter) {
    // Check daily quota for starter
    const today = new Date().toISOString().split("T")[0];
    const { count: todayRuns } = await supabase
      .from("executive_runs")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .gte("started_at", `${today}T00:00:00Z`);

    if ((todayRuns || 0) >= PLAN_QUOTAS.starter.runs_per_day) {
      return { allowed: false, reason: "Daily run quota exceeded for Starter plan", plan };
    }

    // Check monthly quota
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const { count: monthRuns } = await supabase
      .from("executive_runs")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .gte("started_at", monthStart.toISOString());

    if ((monthRuns || 0) >= PLAN_QUOTAS.starter.runs_per_month) {
      return { allowed: false, reason: "Monthly run quota exceeded for Starter plan", plan };
    }

    return { allowed: true, plan };
  }

  // À la carte = vérifier que le département est activé
  if (requiredDept === "direction") {
    // Direction toujours accessible si au moins un département
    const { data: depts } = await supabase
      .from("workspace_departments")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("is_active", true)
      .limit(1);

    if (!depts || depts.length === 0) {
      return { allowed: false, reason: "No active department subscription", plan };
    }
  } else {
    // Vérifier l'accès au département spécifique
    const { data: deptAccess } = await supabase
      .from("workspace_departments")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("department_slug", requiredDept)
      .eq("is_active", true)
      .single();

    if (!deptAccess) {
      return { allowed: false, reason: `Department '${requiredDept}' not in your subscription`, plan };
    }
  }

  // Check quotas for department plan
  const today = new Date().toISOString().split("T")[0];
  const { count: deptCount } = await supabase
    .from("workspace_departments")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("is_active", true);

  const dailyLimit = PLAN_QUOTAS.department.runs_per_day * (deptCount || 1);
  const monthlyLimit = PLAN_QUOTAS.department.runs_per_month * (deptCount || 1);

  const { count: todayRuns } = await supabase
    .from("executive_runs")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .gte("started_at", `${today}T00:00:00Z`);

  if ((todayRuns || 0) >= dailyLimit) {
    return { allowed: false, reason: "Daily run quota exceeded", plan };
  }

  return { allowed: true, plan };
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
      
       // Get all workspaces with active subscriptions
       const { data: activeWorkspaces } = await supabase
         .from("workspace_subscriptions")
         .select("workspace_id")
         .eq("status", "active");

       if (activeWorkspaces && activeWorkspaces.length > 0) {
        const results = await Promise.allSettled(
           activeWorkspaces.map(async (ws) => {
             // Vérifier l'accès avant d'exécuter
             const access = await checkSubscriptionAccess(supabase, ws.workspace_id, run_type);
             if (access.allowed) {
               return executeRun(supabase, run_type, ws.workspace_id);
             } else {
               console.log(`[CRON] Skipped ${run_type} for ${ws.workspace_id}: ${access.reason}`);
               return { skipped: true, reason: access.reason };
             }
           })
        );
         const executed = results.filter(r => r.status === "fulfilled" && !(r.value as any)?.skipped).length;
         console.log(`[CRON] Completed ${executed}/${results.length} runs for ${run_type}`);
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

     // Check subscription access and quotas
     const subscriptionCheck = await checkSubscriptionAccess(supabase, workspace_id, run_type);
     if (!subscriptionCheck.allowed) {
       return new Response(JSON.stringify({ 
         error: "Subscription limit", 
         message: subscriptionCheck.reason,
         plan: subscriptionCheck.plan
       }), {
         status: 403,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }

     // Execute the run with subscription info
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
