-- ════════════════════════════════════════════════════════════════════════════
-- Launch OS — Core Database Schema
-- Migration: 20260317100000_launch_os_tables
-- Description: Creates all tables for the Launch Operating System
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Enums ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE launch_type AS ENUM (
    'single', 'ep', 'album', 'clip', 'music_evergreen',
    'website_launch', 'saas_launch', 'mobile_app_launch',
    'landing_page_promo', 'digital_product_launch', 'brand_campaign'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE launch_status AS ENUM (
    'draft', 'readiness_check', 'ready_to_launch',
    'pre_launch', 'launching', 'post_launch',
    'completed', 'paused', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE readiness_status AS ENUM ('not_ready', 'needs_fix', 'ready_to_launch');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE creative_variant_status AS ENUM ('draft', 'approved', 'rejected', 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE distribution_status AS ENUM ('scheduled', 'active', 'paused', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE decision_action_status AS ENUM ('recommended', 'approved', 'executed', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE video_concept_status AS ENUM ('concept', 'storyboard', 'scripted', 'ready_for_production');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Launch Projects ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  launch_type launch_type NOT NULL,
  status launch_status NOT NULL DEFAULT 'draft',
  input_url text,
  input_metadata jsonb NOT NULL DEFAULT '{}',
  media_asset_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  launch_date timestamptz,
  playbook_id uuid,
  readiness_score integer,
  readiness_status readiness_status,
  config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_launch_projects_workspace ON public.launch_projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_launch_projects_status ON public.launch_projects(status);
CREATE INDEX IF NOT EXISTS idx_launch_projects_type ON public.launch_projects(launch_type);

ALTER TABLE public.launch_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "launch_projects_workspace_access" ON public.launch_projects
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()));

-- ─── Launch Playbooks ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  launch_type launch_type NOT NULL,
  description text,
  is_template boolean NOT NULL DEFAULT false,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  phases jsonb NOT NULL DEFAULT '[]',
  default_channels text[] NOT NULL DEFAULT '{}',
  default_kpi_targets jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_launch_playbooks_workspace ON public.launch_playbooks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_launch_playbooks_type ON public.launch_playbooks(launch_type);

ALTER TABLE public.launch_playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "launch_playbooks_access" ON public.launch_playbooks
  FOR ALL TO authenticated
  USING (
    workspace_id IS NULL  -- system templates visible to all
    OR workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid())
  )
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()));

-- Add FK back to launch_projects
ALTER TABLE public.launch_projects
  ADD CONSTRAINT fk_launch_projects_playbook
  FOREIGN KEY (playbook_id) REFERENCES public.launch_playbooks(id) ON DELETE SET NULL;

-- ─── Launch Readiness Scores ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_readiness_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id uuid NOT NULL REFERENCES public.launch_projects(id) ON DELETE CASCADE,
  overall_score integer NOT NULL,
  status readiness_status NOT NULL,
  dimensions jsonb NOT NULL DEFAULT '[]',
  blockers jsonb NOT NULL DEFAULT '[]',
  recommendations jsonb NOT NULL DEFAULT '[]',
  scored_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readiness_scores_project ON public.launch_readiness_scores(launch_project_id);

ALTER TABLE public.launch_readiness_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "readiness_scores_access" ON public.launch_readiness_scores
  FOR ALL TO authenticated
  USING (launch_project_id IN (
    SELECT id FROM public.launch_projects WHERE workspace_id IN (
      SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  ))
  WITH CHECK (launch_project_id IN (
    SELECT id FROM public.launch_projects WHERE workspace_id IN (
      SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  ));

-- ─── Creative Variants ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_creative_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id uuid NOT NULL REFERENCES public.launch_projects(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  format text NOT NULL,
  name text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  platform_target text,
  angle text,
  audience_segment text,
  status creative_variant_status NOT NULL DEFAULT 'draft',
  performance_score real,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creative_variants_project ON public.launch_creative_variants(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_creative_variants_workspace ON public.launch_creative_variants(workspace_id);
CREATE INDEX IF NOT EXISTS idx_creative_variants_format ON public.launch_creative_variants(format);

ALTER TABLE public.launch_creative_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creative_variants_access" ON public.launch_creative_variants
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()));

-- ─── Video Concepts ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_video_concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id uuid NOT NULL REFERENCES public.launch_projects(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  format text NOT NULL DEFAULT '9:16',
  duration_seconds integer NOT NULL DEFAULT 30,
  hook_text text NOT NULL,
  scenes jsonb NOT NULL DEFAULT '[]',
  voiceover_script text,
  cta text,
  angle text,
  platform_targets text[] NOT NULL DEFAULT '{}',
  status video_concept_status NOT NULL DEFAULT 'concept',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_concepts_project ON public.launch_video_concepts(launch_project_id);

ALTER TABLE public.launch_video_concepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "video_concepts_access" ON public.launch_video_concepts
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()));

-- ─── Distribution Runs ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_distribution_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id uuid NOT NULL REFERENCES public.launch_projects(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  channel text NOT NULL,
  status distribution_status NOT NULL DEFAULT 'scheduled',
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  config jsonb NOT NULL DEFAULT '{}',
  results jsonb,
  budget_allocated numeric(12,2) NOT NULL DEFAULT 0,
  budget_spent numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_distribution_runs_project ON public.launch_distribution_runs(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_distribution_runs_status ON public.launch_distribution_runs(status);

ALTER TABLE public.launch_distribution_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "distribution_runs_access" ON public.launch_distribution_runs
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()));

-- ─── Distribution Steps ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_distribution_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_run_id uuid NOT NULL REFERENCES public.launch_distribution_runs(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  action text NOT NULL,
  channel text NOT NULL,
  asset_ids uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  scheduled_at timestamptz,
  executed_at timestamptz,
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_distribution_steps_run ON public.launch_distribution_steps(distribution_run_id);

ALTER TABLE public.launch_distribution_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "distribution_steps_access" ON public.launch_distribution_steps
  FOR ALL TO authenticated
  USING (distribution_run_id IN (
    SELECT id FROM public.launch_distribution_runs WHERE workspace_id IN (
      SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  ))
  WITH CHECK (distribution_run_id IN (
    SELECT id FROM public.launch_distribution_runs WHERE workspace_id IN (
      SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  ));

-- ─── Signal Events ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_signal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id uuid NOT NULL REFERENCES public.launch_projects(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  source text NOT NULL,
  channel text,
  session_id text,
  user_id_hash text,
  value numeric(12,4) NOT NULL DEFAULT 1,
  metadata jsonb NOT NULL DEFAULT '{}',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signal_events_project ON public.launch_signal_events(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_signal_events_type ON public.launch_signal_events(event_type);
CREATE INDEX IF NOT EXISTS idx_signal_events_created ON public.launch_signal_events(created_at);
CREATE INDEX IF NOT EXISTS idx_signal_events_workspace ON public.launch_signal_events(workspace_id);

ALTER TABLE public.launch_signal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signal_events_access" ON public.launch_signal_events
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()));

-- ─── Decision Rules ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_decision_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  condition jsonb NOT NULL,
  action text NOT NULL,
  action_config jsonb NOT NULL DEFAULT '{}',
  is_auto_execute boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decision_rules_workspace ON public.launch_decision_rules(workspace_id);

ALTER TABLE public.launch_decision_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decision_rules_access" ON public.launch_decision_rules
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()));

-- ─── Decision Action Log ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_decision_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id uuid NOT NULL REFERENCES public.launch_projects(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES public.launch_decision_rules(id) ON DELETE SET NULL,
  action text NOT NULL,
  reason text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}',
  status decision_action_status NOT NULL DEFAULT 'recommended',
  approved_by uuid REFERENCES auth.users(id),
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decision_actions_project ON public.launch_decision_actions(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_decision_actions_status ON public.launch_decision_actions(status);

ALTER TABLE public.launch_decision_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decision_actions_access" ON public.launch_decision_actions
  FOR ALL TO authenticated
  USING (launch_project_id IN (
    SELECT id FROM public.launch_projects WHERE workspace_id IN (
      SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  ))
  WITH CHECK (launch_project_id IN (
    SELECT id FROM public.launch_projects WHERE workspace_id IN (
      SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  ));

-- ─── Campaign Memory ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_campaign_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  launch_project_id uuid NOT NULL REFERENCES public.launch_projects(id) ON DELETE CASCADE,
  launch_type launch_type NOT NULL,
  summary jsonb NOT NULL DEFAULT '{}',
  learnings jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_memories_workspace ON public.launch_campaign_memories(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaign_memories_type ON public.launch_campaign_memories(launch_type);

ALTER TABLE public.launch_campaign_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_memories_access" ON public.launch_campaign_memories
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()));

-- ─── Launch KPI Targets ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_kpi_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id uuid NOT NULL REFERENCES public.launch_projects(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  target_value numeric(12,4) NOT NULL,
  current_value numeric(12,4),
  unit text NOT NULL DEFAULT 'number',
  last_updated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (launch_project_id, metric_key)
);

CREATE INDEX IF NOT EXISTS idx_kpi_targets_project ON public.launch_kpi_targets(launch_project_id);

ALTER TABLE public.launch_kpi_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kpi_targets_access" ON public.launch_kpi_targets
  FOR ALL TO authenticated
  USING (launch_project_id IN (
    SELECT id FROM public.launch_projects WHERE workspace_id IN (
      SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  ))
  WITH CHECK (launch_project_id IN (
    SELECT id FROM public.launch_projects WHERE workspace_id IN (
      SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  ));

-- ─── Launch Experiments ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id uuid NOT NULL REFERENCES public.launch_projects(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  hypothesis text,
  metric_key text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  started_at timestamptz,
  ended_at timestamptz,
  winner_variant_id uuid,
  results jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiments_project ON public.launch_experiments(launch_project_id);

ALTER TABLE public.launch_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiments_access" ON public.launch_experiments
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()));

-- ─── Launch Experiment Variants ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_experiment_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.launch_experiments(id) ON DELETE CASCADE,
  name text NOT NULL,
  variant_type text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}',
  impressions integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  metric_value numeric(12,4),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiment_variants_experiment ON public.launch_experiment_variants(experiment_id);

ALTER TABLE public.launch_experiment_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiment_variants_access" ON public.launch_experiment_variants
  FOR ALL TO authenticated
  USING (experiment_id IN (
    SELECT id FROM public.launch_experiments WHERE workspace_id IN (
      SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  ))
  WITH CHECK (experiment_id IN (
    SELECT id FROM public.launch_experiments WHERE workspace_id IN (
      SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  ));

-- ─── Audience Segments ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_audience_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  launch_project_id uuid REFERENCES public.launch_projects(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  criteria jsonb NOT NULL DEFAULT '{}',
  estimated_size integer,
  channel text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audience_segments_workspace ON public.launch_audience_segments(workspace_id);

ALTER TABLE public.launch_audience_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audience_segments_access" ON public.launch_audience_segments
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()));

-- ─── Retargeting Rules ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.launch_retargeting_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  launch_project_id uuid REFERENCES public.launch_projects(id) ON DELETE SET NULL,
  name text NOT NULL,
  source_event text NOT NULL,
  target_audience_id uuid REFERENCES public.launch_audience_segments(id),
  delay_hours integer NOT NULL DEFAULT 24,
  creative_variant_id uuid REFERENCES public.launch_creative_variants(id),
  channel text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retargeting_rules_workspace ON public.launch_retargeting_rules(workspace_id);

ALTER TABLE public.launch_retargeting_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retargeting_rules_access" ON public.launch_retargeting_rules
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.user_roles WHERE user_id = auth.uid()));

-- ─── Updated At Triggers ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_launch_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_launch_projects_updated_at ON public.launch_projects;
CREATE TRIGGER trigger_launch_projects_updated_at
  BEFORE UPDATE ON public.launch_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_launch_projects_updated_at();
