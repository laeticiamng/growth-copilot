-- ═══════════════════════════════════════════════════════════════════════════
-- Launch OS — Backend Orchestrator Persistent Tables
-- Migration: 20260324100000_launch_orchestrator_tables
-- Purpose: Backend-first pipeline execution with stage runs, events, errors
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Launch Stage Runs ──────────────────────────────────────────────────────
-- Each row = one execution of one stage within a launch run.
-- The backend orchestrator creates and updates these rows. Frontend reads only.
CREATE TABLE IF NOT EXISTS launch_stage_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_run_id UUID NOT NULL REFERENCES launch_runs(id) ON DELETE CASCADE,
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped', 'waiting_approval', 'canceled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  blocking_reason TEXT,
  evidence_level TEXT NOT NULL DEFAULT 'TEMPLATE' CHECK (evidence_level IN ('VERIFIED', 'DERIVED', 'TEMPLATE')),
  output_refs JSONB NOT NULL DEFAULT '{}',
  agent_ids JSONB NOT NULL DEFAULT '[]',
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approval_checkpoint_id UUID REFERENCES launch_approval_checkpoints(id),
  approved_at TIMESTAMPTZ,
  skipped BOOLEAN NOT NULL DEFAULT false,
  skip_reason TEXT,
  duration_ms INTEGER,
  error_message TEXT,
  error_type TEXT,
  retry_after TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_launch_stage_runs_run ON launch_stage_runs(launch_run_id);
CREATE INDEX IF NOT EXISTS idx_launch_stage_runs_project ON launch_stage_runs(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_stage_runs_status ON launch_stage_runs(status);
CREATE INDEX IF NOT EXISTS idx_launch_stage_runs_stage ON launch_stage_runs(stage_name);

-- ─── Launch Run Events ──────────────────────────────────────────────────────
-- Immutable event log for every state change in a launch run.
CREATE TABLE IF NOT EXISTS launch_run_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_run_id UUID NOT NULL REFERENCES launch_runs(id) ON DELETE CASCADE,
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'run_started', 'run_completed', 'run_failed', 'run_canceled', 'run_resumed',
    'stage_started', 'stage_completed', 'stage_failed', 'stage_skipped', 'stage_retried',
    'approval_requested', 'approval_granted', 'approval_rejected', 'approval_expired',
    'agent_invoked', 'agent_completed', 'agent_failed',
    'connector_error', 'connector_recovered',
    'publish_started', 'publish_completed', 'publish_failed',
    'error_logged', 'error_resolved'
  )),
  stage_name TEXT,
  agent_id TEXT,
  details JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_launch_run_events_run ON launch_run_events(launch_run_id);
CREATE INDEX IF NOT EXISTS idx_launch_run_events_project ON launch_run_events(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_run_events_type ON launch_run_events(event_type);
CREATE INDEX IF NOT EXISTS idx_launch_run_events_created ON launch_run_events(created_at);

-- ─── Launch Run Errors ──────────────────────────────────────────────────────
-- Structured error tracking with retry state and resolution.
CREATE TABLE IF NOT EXISTS launch_run_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_run_id UUID NOT NULL REFERENCES launch_runs(id) ON DELETE CASCADE,
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  error_type TEXT NOT NULL CHECK (error_type IN (
    'agent_failure', 'ai_gateway_timeout', 'ai_gateway_quota',
    'connector_error', 'connector_auth_expired', 'data_missing',
    'validation_error', 'approval_timeout', 'approval_rejected',
    'publish_failure', 'rate_limit', 'network_error', 'unknown'
  )),
  message TEXT NOT NULL,
  stack_trace TEXT,
  recoverable BOOLEAN NOT NULL DEFAULT true,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  circuit_breaker_open BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_launch_run_errors_run ON launch_run_errors(launch_run_id);
CREATE INDEX IF NOT EXISTS idx_launch_run_errors_project ON launch_run_errors(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_run_errors_resolved ON launch_run_errors(resolved);

-- ─── Publication Jobs ───────────────────────────────────────────────────────
-- Tracks individual publish actions per asset per channel.
CREATE TABLE IF NOT EXISTS launch_publication_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  launch_run_id UUID REFERENCES launch_runs(id) ON DELETE SET NULL,
  asset_id UUID,
  asset_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'ready', 'awaiting_approval', 'scheduled', 'publishing',
    'published', 'exported_manual', 'failed', 'canceled'
  )),
  publish_method TEXT NOT NULL DEFAULT 'manual' CHECK (publish_method IN ('auto_api', 'export_manual', 'hybrid')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  export_url TEXT,
  external_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_launch_pub_jobs_project ON launch_publication_jobs(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_pub_jobs_status ON launch_publication_jobs(status);
CREATE INDEX IF NOT EXISTS idx_launch_pub_jobs_channel ON launch_publication_jobs(channel);

-- ─── Lead Scores ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  lead_handoff_id UUID NOT NULL REFERENCES launch_lead_handoffs(id) ON DELETE CASCADE,
  engagement_score INTEGER NOT NULL DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  fit_score INTEGER NOT NULL DEFAULT 0 CHECK (fit_score >= 0 AND fit_score <= 100),
  composite_score INTEGER NOT NULL DEFAULT 0 CHECK (composite_score >= 0 AND composite_score <= 100),
  scoring_factors JSONB NOT NULL DEFAULT '{}',
  classification TEXT NOT NULL DEFAULT 'raw' CHECK (classification IN ('raw', 'mql', 'sql', 'opportunity')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_launch_lead_scores_handoff ON launch_lead_scores(lead_handoff_id);

-- ─── CRM Push Log ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_crm_push_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  lead_handoff_id UUID NOT NULL REFERENCES launch_lead_handoffs(id) ON DELETE CASCADE,
  crm_provider TEXT NOT NULL DEFAULT 'none',
  push_status TEXT NOT NULL DEFAULT 'pending' CHECK (push_status IN ('pending', 'pushed', 'failed', 'queued_manual')),
  external_crm_id TEXT,
  error_message TEXT,
  pushed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Lifecycle Follow-up Queue ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_lifecycle_followup_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  lead_handoff_id UUID NOT NULL REFERENCES launch_lead_handoffs(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('email_sequence', 'sales_call', 'retarget', 'nurture', 'demo_invite')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed', 'skipped', 'failed')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_followup_lead ON launch_lifecycle_followup_queue(lead_handoff_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_followup_status ON launch_lifecycle_followup_queue(status);

-- ─── Add run_id reference to launch_runs for resume capability ──────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_runs' AND column_name = 'canceled_at') THEN
    ALTER TABLE launch_runs ADD COLUMN canceled_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_runs' AND column_name = 'cancel_reason') THEN
    ALTER TABLE launch_runs ADD COLUMN cancel_reason TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_runs' AND column_name = 'resumed_at') THEN
    ALTER TABLE launch_runs ADD COLUMN resumed_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_runs' AND column_name = 'resume_count') THEN
    ALTER TABLE launch_runs ADD COLUMN resume_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ─── RLS for new tables ─────────────────────────────────────────────────────
ALTER TABLE launch_stage_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_run_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_run_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_publication_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_crm_push_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_lifecycle_followup_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "launch_stage_runs_workspace" ON launch_stage_runs FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_stage_runs.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_run_events_workspace" ON launch_run_events FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_run_events.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_run_errors_workspace" ON launch_run_errors FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_run_errors.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_pub_jobs_workspace" ON launch_publication_jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_publication_jobs.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_lead_scores_workspace" ON launch_lead_scores FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_lead_scores.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_crm_push_log_workspace" ON launch_crm_push_log FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_crm_push_log.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_lifecycle_followup_workspace" ON launch_lifecycle_followup_queue FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_lifecycle_followup_queue.launch_project_id AND ur.user_id = auth.uid())
);
