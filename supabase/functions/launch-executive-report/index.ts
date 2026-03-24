import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Launch Executive Report — Generates a real executive launch report.
 *
 * Every section is tagged: VERIFIED / DERIVED / TEMPLATE.
 * Final READY decision is computed by rules, not marketing text.
 */
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { launch_project_id, workspace_id } = await req.json();
    if (!launch_project_id) {
      return new Response(JSON.stringify({ error: 'launch_project_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Gather all data
    const [
      projectRes, stageRunsRes, pubJobsRes, handoffsRes,
      signalsRes, creativesRes, checkpointsRes, errorsRes,
      integrationsRes,
    ] = await Promise.all([
      supabase.from('launch_projects').select('*').eq('id', launch_project_id).single(),
      supabase.from('launch_stage_runs').select('*').eq('launch_project_id', launch_project_id).order('stage_order'),
      supabase.from('launch_publication_jobs').select('*').eq('launch_project_id', launch_project_id),
      supabase.from('launch_lead_handoffs').select('*').eq('launch_project_id', launch_project_id),
      supabase.from('launch_signal_events').select('id', { count: 'exact', head: true }).eq('launch_project_id', launch_project_id),
      supabase.from('launch_creative_variants').select('id, status').eq('launch_project_id', launch_project_id),
      supabase.from('launch_approval_checkpoints').select('*').eq('launch_project_id', launch_project_id),
      supabase.from('launch_run_errors').select('*').eq('launch_project_id', launch_project_id).eq('resolved', false),
      workspace_id ? supabase.from('integrations').select('provider, status').eq('workspace_id', workspace_id).eq('status', 'active') : Promise.resolve({ data: [] }),
    ]);

    const project = projectRes.data;
    const stageRuns = stageRunsRes.data || [];
    const pubJobs = pubJobsRes.data || [];
    const handoffs = handoffsRes.data || [];
    const signalCount = signalsRes.count || 0;
    const creatives = creativesRes.data || [];
    const checkpoints = checkpointsRes.data || [];
    const unresolvedErrors = errorsRes.data || [];
    const activeIntegrations = (integrationsRes as { data: unknown[] | null }).data || [];

    // Build KPI summary
    const kpiSummary = [
      { metric_key: 'stages_completed', label: 'Stages Completed', target: 14, actual: stageRuns.filter((s: Record<string, unknown>) => s.status === 'completed').length, evidence_level: 'VERIFIED' },
      { metric_key: 'assets_produced', label: 'Creative Assets', target: 5, actual: creatives.length, evidence_level: 'VERIFIED' },
      { metric_key: 'assets_published', label: 'Assets Published', target: 3, actual: pubJobs.filter((j: Record<string, unknown>) => j.status === 'published').length, evidence_level: 'VERIFIED' },
      { metric_key: 'assets_exported_manual', label: 'Assets Exported (Manual)', target: 0, actual: pubJobs.filter((j: Record<string, unknown>) => j.status === 'exported_manual').length, evidence_level: 'VERIFIED' },
      { metric_key: 'leads_captured', label: 'Leads Captured', target: 10, actual: handoffs.length, evidence_level: handoffs.length > 0 ? 'DERIVED' : 'TEMPLATE' },
      { metric_key: 'signal_events', label: 'Signal Events', target: 100, actual: signalCount, evidence_level: signalCount > 0 ? 'VERIFIED' : 'TEMPLATE' },
      { metric_key: 'approvals_resolved', label: 'Approvals Resolved', target: checkpoints.length, actual: checkpoints.filter((c: Record<string, unknown>) => c.status === 'approved').length, evidence_level: 'VERIFIED' },
      { metric_key: 'connectors_active', label: 'Connectors Active', target: 5, actual: (activeIntegrations as unknown[]).length, evidence_level: 'VERIFIED' },
    ];

    // Channel performance (from publication jobs)
    const channelPerformance = [...new Set(pubJobs.map((j: Record<string, unknown>) => j.channel))].map(channel => ({
      channel,
      total_jobs: pubJobs.filter((j: Record<string, unknown>) => j.channel === channel).length,
      published: pubJobs.filter((j: Record<string, unknown>) => j.channel === channel && j.status === 'published').length,
      failed: pubJobs.filter((j: Record<string, unknown>) => j.channel === channel && j.status === 'failed').length,
      manual: pubJobs.filter((j: Record<string, unknown>) => j.channel === channel && j.status === 'exported_manual').length,
      evidence_level: pubJobs.some((j: Record<string, unknown>) => j.channel === channel && j.status === 'published') ? 'VERIFIED' : 'TEMPLATE',
    }));

    // Sales handoff summary
    const salesSummary = {
      total_leads: handoffs.length,
      mql: handoffs.filter((h: Record<string, unknown>) => h.qualification_status === 'mql').length,
      sql: handoffs.filter((h: Record<string, unknown>) => h.qualification_status === 'sql').length,
      avg_score: handoffs.length > 0 ? Math.round(handoffs.reduce((sum: number, h: Record<string, unknown>) => sum + (h.lead_score as number || 0), 0) / handoffs.length) : 0,
      crm_pushed: handoffs.filter((h: Record<string, unknown>) => h.handoff_to_crm).length,
      evidence_level: handoffs.length > 0 ? 'DERIVED' : 'TEMPLATE',
    };

    // Compute limitations
    const limitations: string[] = [];
    if (stageRuns.filter((s: Record<string, unknown>) => s.evidence_level === 'TEMPLATE').length > stageRuns.length / 2) {
      limitations.push('More than 50% of stages have TEMPLATE-level evidence only');
    }
    if (pubJobs.filter((j: Record<string, unknown>) => j.status === 'published').length === 0) {
      limitations.push('No assets have been auto-published via connectors');
    }
    if (unresolvedErrors.length > 0) {
      limitations.push(`${unresolvedErrors.length} unresolved error(s) in pipeline`);
    }
    if ((activeIntegrations as unknown[]).length < 3) {
      limitations.push('Fewer than 3 connectors active — limited attribution capability');
    }
    if (handoffs.length === 0) {
      limitations.push('No leads captured — sales handoff is empty');
    }

    // Compute READY decision
    const readyDecision = computeReadyDecision(stageRuns, pubJobs, unresolvedErrors, limitations);

    // Evidence level for the report itself
    const verifiedKPIs = kpiSummary.filter(k => k.evidence_level === 'VERIFIED').length;
    const reportEvidenceLevel = verifiedKPIs > kpiSummary.length * 0.6 ? 'DERIVED' : 'TEMPLATE';

    // Save report
    const report = {
      launch_project_id,
      report_type: 'executive',
      period_start: project?.created_at ? new Date(project.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      period_end: new Date().toISOString().slice(0, 10),
      kpi_summary: kpiSummary,
      channel_performance: channelPerformance,
      creative_performance: creatives.map((c: Record<string, unknown>) => ({ creative_id: c.id, status: c.status })),
      budget_summary: { total_budget: (project?.config as Record<string, unknown>)?.budget || 0, total_spent: 0, remaining: (project?.config as Record<string, unknown>)?.budget || 0, currency: 'EUR' },
      top_insights: [],
      recommendations: limitations.map(l => `Address: ${l}`),
      overall_status: readyDecision.status === 'READY' ? 'on_track' : readyDecision.status === 'READY_WITH_LIMITATIONS' ? 'at_risk' : 'behind',
      confidence_score: readyDecision.confidence,
      evidence_level: reportEvidenceLevel,
    };

    const { data: savedReport, error: saveErr } = await supabase.from('launch_reports').insert(report).select().single();
    if (saveErr) console.error('Failed to save report:', saveErr);

    return new Response(JSON.stringify({
      success: true,
      report_id: savedReport?.id,
      evidence_level: reportEvidenceLevel,
      ready_decision: readyDecision,
      kpi_summary: kpiSummary,
      channel_performance: channelPerformance,
      sales_summary: salesSummary,
      limitations,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Executive report error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

interface ReadyDecision {
  status: 'READY' | 'READY_WITH_LIMITATIONS' | 'NOT_READY';
  confidence: number;
  reasons: string[];
}

function computeReadyDecision(
  stageRuns: Record<string, unknown>[],
  pubJobs: Record<string, unknown>[],
  unresolvedErrors: Record<string, unknown>[],
  limitations: string[]
): ReadyDecision {
  const reasons: string[] = [];
  let score = 100;

  // Rule 1: All critical stages must be completed
  const criticalStages = ['intake', 'audience_research', 'positioning', 'messaging', 'creative_strategy', 'channel_plan', 'approval_gate'];
  const completedStages = stageRuns.filter((s: Record<string, unknown>) => s.status === 'completed').map((s: Record<string, unknown>) => s.stage_name);
  const missingCritical = criticalStages.filter(s => !completedStages.includes(s));
  if (missingCritical.length > 0) {
    score -= missingCritical.length * 15;
    reasons.push(`Missing critical stages: ${missingCritical.join(', ')}`);
  }

  // Rule 2: No unresolved critical errors
  if (unresolvedErrors.length > 0) {
    score -= unresolvedErrors.length * 10;
    reasons.push(`${unresolvedErrors.length} unresolved errors`);
  }

  // Rule 3: At least some verified evidence
  const verifiedStages = stageRuns.filter((s: Record<string, unknown>) => s.evidence_level === 'VERIFIED').length;
  if (verifiedStages === 0) {
    score -= 20;
    reasons.push('No stage has VERIFIED evidence level');
  }

  // Rule 4: Distribution must have some result
  if (pubJobs.length === 0) {
    score -= 15;
    reasons.push('No publication jobs created');
  }

  // Rule 5: Template ratio
  const templateStages = stageRuns.filter((s: Record<string, unknown>) => s.evidence_level === 'TEMPLATE' && s.status === 'completed').length;
  if (templateStages > stageRuns.length * 0.6) {
    score -= 15;
    reasons.push('High TEMPLATE ratio — most outputs are not data-backed');
  }

  // Apply limitations
  score -= limitations.length * 5;

  const confidence = Math.max(0, Math.min(100, score));

  let status: 'READY' | 'READY_WITH_LIMITATIONS' | 'NOT_READY';
  if (confidence >= 75 && missingCritical.length === 0 && unresolvedErrors.length === 0) {
    status = 'READY';
  } else if (confidence >= 40 && missingCritical.length <= 2) {
    status = 'READY_WITH_LIMITATIONS';
  } else {
    status = 'NOT_READY';
  }

  return { status, confidence, reasons };
}
