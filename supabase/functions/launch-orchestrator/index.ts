import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Launch Orchestrator — Backend-first pipeline execution.
 *
 * Actions:
 *   start_run    — Creates a launch run with all stage_runs, starts first stage
 *   advance      — Completes current stage, starts next (with approval gate check)
 *   get_status   — Returns full run state for frontend consumption
 *
 * The frontend MUST NOT simulate progression. It reads from this backend.
 */

const PIPELINE_STAGES = [
  { stage: 'intake', order: 1, requires_approval: false, can_skip: false },
  { stage: 'audience_research', order: 2, requires_approval: false, can_skip: false },
  { stage: 'positioning', order: 3, requires_approval: true, can_skip: false },
  { stage: 'messaging', order: 4, requires_approval: false, can_skip: false },
  { stage: 'creative_strategy', order: 5, requires_approval: true, can_skip: false },
  { stage: 'video_asset_planning', order: 6, requires_approval: true, can_skip: true },
  { stage: 'landing_funnel', order: 7, requires_approval: true, can_skip: true },
  { stage: 'channel_plan', order: 8, requires_approval: true, can_skip: false },
  { stage: 'approval_gate', order: 9, requires_approval: true, can_skip: false },
  { stage: 'publish_distribute', order: 10, requires_approval: false, can_skip: false },
  { stage: 'track_attribute', order: 11, requires_approval: false, can_skip: false },
  { stage: 'iterate_recommend', order: 12, requires_approval: false, can_skip: true },
  { stage: 'sales_handoff', order: 13, requires_approval: false, can_skip: true },
  { stage: 'executive_report', order: 14, requires_approval: false, can_skip: false },
];

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { action, launch_project_id, workspace_id, stage_name, skip_reason, stage_outputs } = await req.json();

    if (!action || !launch_project_id || !workspace_id) {
      return jsonResponse({ error: 'action, launch_project_id, workspace_id required' }, 400, corsHeaders);
    }

    const authResult = await validateWorkspaceAccess(req, workspace_id, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    if (!authResult.hasAccess) return forbiddenResponse(authResult.error || "Access denied", corsHeaders);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const userId = authResult.userId;

    switch (action) {
      case 'start_run':
        return await handleStartRun(supabase, launch_project_id, workspace_id, userId, corsHeaders);
      case 'advance':
        return await handleAdvance(supabase, launch_project_id, stage_outputs, corsHeaders);
      case 'skip_stage':
        return await handleSkipStage(supabase, launch_project_id, stage_name, skip_reason, corsHeaders);
      case 'get_status':
        return await handleGetStatus(supabase, launch_project_id, corsHeaders);
      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400, corsHeaders);
    }
  } catch (error) {
    console.error('Launch orchestrator error:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error' }, 500, corsHeaders);
  }
});

// ─── Start Run ──────────────────────────────────────────────────────────────

async function handleStartRun(
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  workspaceId: string,
  userId: string | undefined,
  corsHeaders: Record<string, string>
) {
  // Check no active run exists
  const { data: existingRuns } = await supabase
    .from('launch_runs')
    .select('id, status')
    .eq('launch_project_id', projectId)
    .in('status', ['running', 'paused', 'waiting_approval']);

  if (existingRuns && existingRuns.length > 0) {
    return jsonResponse({ error: 'Active run already exists. Cancel or complete it first.', existing_run_id: existingRuns[0].id }, 409, corsHeaders);
  }

  // Count previous runs
  const { count } = await supabase
    .from('launch_runs')
    .select('id', { count: 'exact', head: true })
    .eq('launch_project_id', projectId);

  const runNumber = (count || 0) + 1;

  // Create the run
  const { data: run, error: runError } = await supabase
    .from('launch_runs')
    .insert({
      launch_project_id: projectId,
      run_number: runNumber,
      current_stage: 'intake',
      stages_completed: [],
      stages_remaining: PIPELINE_STAGES.map(s => s.stage),
      status: 'running',
      triggered_by: userId,
      error_log: [],
    })
    .select()
    .single();

  if (runError || !run) {
    return jsonResponse({ error: `Failed to create run: ${runError?.message}` }, 500, corsHeaders);
  }

  // Create all stage_runs
  const stageRuns = PIPELINE_STAGES.map(s => ({
    launch_run_id: run.id,
    launch_project_id: projectId,
    stage_name: s.stage,
    stage_order: s.order,
    status: s.order === 1 ? 'running' : 'pending',
    started_at: s.order === 1 ? new Date().toISOString() : null,
    requires_approval: s.requires_approval,
    attempts: s.order === 1 ? 1 : 0,
  }));

  await supabase.from('launch_stage_runs').insert(stageRuns);

  // Log event
  await logEvent(supabase, run.id, projectId, 'run_started', null, null, { run_number: runNumber });
  await logEvent(supabase, run.id, projectId, 'stage_started', 'intake', null, {});

  // Update project
  await supabase.from('launch_projects').update({ current_stage: 'intake', status: 'readiness_check' }).eq('id', projectId);

  return jsonResponse({ success: true, run_id: run.id, run_number: runNumber, current_stage: 'intake' }, 200, corsHeaders);
}

// ─── Advance Stage ──────────────────────────────────────────────────────────

async function handleAdvance(
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  stageOutputs: Record<string, unknown> | undefined,
  corsHeaders: Record<string, string>
) {
  // Get active run
  const { data: run, error: runErr } = await supabase
    .from('launch_runs')
    .select('*')
    .eq('launch_project_id', projectId)
    .in('status', ['running', 'waiting_approval'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (runErr || !run) {
    return jsonResponse({ error: 'No active run found' }, 404, corsHeaders);
  }

  const currentStageName = run.current_stage;
  const currentStageDef = PIPELINE_STAGES.find(s => s.stage === currentStageName);
  if (!currentStageDef) {
    return jsonResponse({ error: `Unknown stage: ${currentStageName}` }, 400, corsHeaders);
  }

  // Check pending approvals
  if (currentStageDef.requires_approval) {
    const { data: pendingApprovals } = await supabase
      .from('launch_approval_checkpoints')
      .select('id, status')
      .eq('launch_project_id', projectId)
      .eq('status', 'pending');

    if (pendingApprovals && pendingApprovals.length > 0) {
      await supabase.from('launch_runs').update({ status: 'waiting_approval' }).eq('id', run.id);
      return jsonResponse({ error: 'Approval required before advancing', pending_approvals: pendingApprovals.length, status: 'waiting_approval' }, 409, corsHeaders);
    }
  }

  // Determine evidence level from outputs
  const evidenceLevel = determineEvidenceLevel(stageOutputs);

  // Complete current stage
  const now = new Date().toISOString();
  await supabase.from('launch_stage_runs')
    .update({
      status: 'completed',
      completed_at: now,
      evidence_level: evidenceLevel,
      output_refs: stageOutputs || {},
    })
    .eq('launch_run_id', run.id)
    .eq('stage_name', currentStageName);

  await logEvent(supabase, run.id, projectId, 'stage_completed', currentStageName, null, { evidence_level: evidenceLevel });

  // Find next stage
  const nextStageDef = PIPELINE_STAGES.find(s => s.order === currentStageDef.order + 1);
  if (!nextStageDef) {
    // All stages completed
    await supabase.from('launch_runs').update({
      status: 'completed',
      completed_at: now,
      current_stage: 'executive_report',
      stages_completed: PIPELINE_STAGES.map(s => s.stage),
      stages_remaining: [],
    }).eq('id', run.id);

    await logEvent(supabase, run.id, projectId, 'run_completed', null, null, {});
    await supabase.from('launch_projects').update({ status: 'completed', current_stage: 'executive_report' }).eq('id', projectId);

    return jsonResponse({ success: true, status: 'completed', message: 'All stages completed' }, 200, corsHeaders);
  }

  // Start next stage
  const completedStages = [...(run.stages_completed || []), currentStageName];
  const remainingStages = PIPELINE_STAGES.filter(s => s.order > nextStageDef.order).map(s => s.stage);

  await supabase.from('launch_runs').update({
    current_stage: nextStageDef.stage,
    stages_completed: completedStages,
    stages_remaining: [nextStageDef.stage, ...remainingStages],
    status: 'running',
  }).eq('id', run.id);

  await supabase.from('launch_stage_runs').update({
    status: 'running',
    started_at: now,
    attempts: 1,
  }).eq('launch_run_id', run.id).eq('stage_name', nextStageDef.stage);

  await logEvent(supabase, run.id, projectId, 'stage_started', nextStageDef.stage, null, {});
  await supabase.from('launch_projects').update({ current_stage: nextStageDef.stage }).eq('id', projectId);

  return jsonResponse({
    success: true,
    completed_stage: currentStageName,
    current_stage: nextStageDef.stage,
    progress: Math.round((completedStages.length / PIPELINE_STAGES.length) * 100),
    stages_completed: completedStages,
  }, 200, corsHeaders);
}

// ─── Skip Stage ─────────────────────────────────────────────────────────────

async function handleSkipStage(
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  stageName: string | undefined,
  skipReason: string | undefined,
  corsHeaders: Record<string, string>
) {
  if (!stageName) {
    return jsonResponse({ error: 'stage_name required' }, 400, corsHeaders);
  }

  const stageDef = PIPELINE_STAGES.find(s => s.stage === stageName);
  if (!stageDef || !stageDef.can_skip) {
    return jsonResponse({ error: `Stage ${stageName} cannot be skipped` }, 400, corsHeaders);
  }

  const { data: run } = await supabase
    .from('launch_runs')
    .select('id')
    .eq('launch_project_id', projectId)
    .in('status', ['running', 'waiting_approval'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!run) {
    return jsonResponse({ error: 'No active run' }, 404, corsHeaders);
  }

  await supabase.from('launch_stage_runs').update({
    status: 'skipped',
    skipped: true,
    skip_reason: skipReason || 'Skipped by user',
    completed_at: new Date().toISOString(),
  }).eq('launch_run_id', run.id).eq('stage_name', stageName);

  await logEvent(supabase, run.id, projectId, 'stage_skipped', stageName, null, { reason: skipReason });

  return jsonResponse({ success: true, skipped_stage: stageName }, 200, corsHeaders);
}

// ─── Get Status ─────────────────────────────────────────────────────────────

async function handleGetStatus(
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  corsHeaders: Record<string, string>
) {
  const { data: run } = await supabase
    .from('launch_runs')
    .select('*')
    .eq('launch_project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!run) {
    return jsonResponse({ run: null, stage_runs: [], events: [] }, 200, corsHeaders);
  }

  const [stageRunsRes, eventsRes, errorsRes] = await Promise.all([
    supabase.from('launch_stage_runs').select('*').eq('launch_run_id', run.id).order('stage_order', { ascending: true }),
    supabase.from('launch_run_events').select('*').eq('launch_run_id', run.id).order('created_at', { ascending: false }).limit(50),
    supabase.from('launch_run_errors').select('*').eq('launch_run_id', run.id).eq('resolved', false),
  ]);

  return jsonResponse({
    run,
    stage_runs: stageRunsRes.data || [],
    recent_events: eventsRes.data || [],
    unresolved_errors: errorsRes.data || [],
    progress: run.stages_completed ? Math.round((run.stages_completed.length / PIPELINE_STAGES.length) * 100) : 0,
  }, 200, corsHeaders);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function determineEvidenceLevel(outputs: Record<string, unknown> | undefined): string {
  if (!outputs) return 'TEMPLATE';
  const hasRealData = outputs.data_sources && Array.isArray(outputs.data_sources) && outputs.data_sources.length > 0;
  const hasConnectorData = outputs.connector_verified === true;
  if (hasConnectorData) return 'VERIFIED';
  if (hasRealData) return 'DERIVED';
  return 'TEMPLATE';
}

async function logEvent(
  supabase: ReturnType<typeof createClient>,
  runId: string,
  projectId: string,
  eventType: string,
  stageName: string | null,
  agentId: string | null,
  details: Record<string, unknown>
) {
  await supabase.from('launch_run_events').insert({
    launch_run_id: runId,
    launch_project_id: projectId,
    event_type: eventType,
    stage_name: stageName,
    agent_id: agentId,
    details,
  });
}

function jsonResponse(data: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
