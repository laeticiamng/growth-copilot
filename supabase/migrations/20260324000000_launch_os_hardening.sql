-- ─── Launch OS Hardening Migration ───────────────────────────────────────────
-- Adds sub-entities for the canonical launch model, approval governance,
-- observability, and sales enablement.

-- ─── Launch Briefs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_description TEXT NOT NULL DEFAULT '',
  launch_goal TEXT NOT NULL DEFAULT '',
  target_audience_summary TEXT NOT NULL DEFAULT '',
  key_differentiators JSONB NOT NULL DEFAULT '[]',
  competitive_landscape TEXT NOT NULL DEFAULT '',
  budget_range JSONB NOT NULL DEFAULT '{}',
  timeline JSONB NOT NULL DEFAULT '{}',
  success_criteria JSONB NOT NULL DEFAULT '[]',
  constraints JSONB NOT NULL DEFAULT '[]',
  evidence_level TEXT NOT NULL DEFAULT 'TEMPLATE' CHECK (evidence_level IN ('VERIFIED', 'DERIVED', 'TEMPLATE')),
  evidence_source TEXT NOT NULL DEFAULT 'user_input',
  evidence_confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Audience Research ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_audience_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  icp JSONB NOT NULL DEFAULT '{}',
  segments JSONB NOT NULL DEFAULT '[]',
  persona_profiles JSONB NOT NULL DEFAULT '[]',
  market_estimate JSONB,
  data_sources JSONB NOT NULL DEFAULT '[]',
  evidence_level TEXT NOT NULL DEFAULT 'TEMPLATE' CHECK (evidence_level IN ('VERIFIED', 'DERIVED', 'TEMPLATE')),
  evidence_source TEXT NOT NULL DEFAULT 'ai_generation',
  evidence_confidence NUMERIC(3,2) NOT NULL DEFAULT 0.3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Messaging Frameworks ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_messaging_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  positioning_statement TEXT NOT NULL DEFAULT '',
  value_proposition TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  elevator_pitch TEXT NOT NULL DEFAULT '',
  key_messages JSONB NOT NULL DEFAULT '[]',
  tone_of_voice JSONB NOT NULL DEFAULT '{}',
  proof_points JSONB NOT NULL DEFAULT '[]',
  objection_responses JSONB NOT NULL DEFAULT '[]',
  evidence_level TEXT NOT NULL DEFAULT 'TEMPLATE' CHECK (evidence_level IN ('VERIFIED', 'DERIVED', 'TEMPLATE')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved')),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Offer Assets ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_offer_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  offer_name TEXT NOT NULL,
  offer_type TEXT NOT NULL DEFAULT 'main' CHECK (offer_type IN ('main', 'upsell', 'downsell', 'bonus', 'trial', 'freemium')),
  description TEXT NOT NULL DEFAULT '',
  price JSONB NOT NULL DEFAULT '{}',
  value_stack JSONB NOT NULL DEFAULT '[]',
  guarantees JSONB NOT NULL DEFAULT '[]',
  urgency_triggers JSONB NOT NULL DEFAULT '[]',
  scarcity_triggers JSONB NOT NULL DEFAULT '[]',
  cta_primary TEXT NOT NULL DEFAULT '',
  cta_secondary TEXT,
  evidence_level TEXT NOT NULL DEFAULT 'TEMPLATE' CHECK (evidence_level IN ('VERIFIED', 'DERIVED', 'TEMPLATE')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'active', 'deprecated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Landing Page Assets ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  url TEXT,
  page_type TEXT NOT NULL DEFAULT 'hero' CHECK (page_type IN ('hero', 'sales', 'waitlist', 'pre_launch', 'thank_you')),
  headline TEXT NOT NULL DEFAULT '',
  subheadline TEXT NOT NULL DEFAULT '',
  hero_cta TEXT NOT NULL DEFAULT '',
  sections JSONB NOT NULL DEFAULT '[]',
  seo_meta JSONB NOT NULL DEFAULT '{}',
  conversion_goals JSONB NOT NULL DEFAULT '[]',
  tracking_pixels JSONB NOT NULL DEFAULT '[]',
  evidence_level TEXT NOT NULL DEFAULT 'TEMPLATE' CHECK (evidence_level IN ('VERIFIED', 'DERIVED', 'TEMPLATE')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'live', 'deprecated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Campaign Plans ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_campaign_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'launch_burst' CHECK (campaign_type IN ('awareness', 'consideration', 'conversion', 'retention', 'launch_burst')),
  channels JSONB NOT NULL DEFAULT '[]',
  total_budget NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  start_date DATE,
  end_date DATE,
  objectives JSONB NOT NULL DEFAULT '[]',
  audience_targeting JSONB NOT NULL DEFAULT '{}',
  evidence_level TEXT NOT NULL DEFAULT 'TEMPLATE' CHECK (evidence_level IN ('VERIFIED', 'DERIVED', 'TEMPLATE')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'active', 'paused', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Approval Checkpoints ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_approval_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  checkpoint_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  approval_reason TEXT NOT NULL DEFAULT '',
  approver_role TEXT NOT NULL DEFAULT 'owner',
  blocking_level TEXT NOT NULL DEFAULT 'hard_block' CHECK (blocking_level IN ('hard_block', 'soft_block', 'advisory')),
  sla_hours INTEGER NOT NULL DEFAULT 24,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'bypassed')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  audit_log_entry_id UUID,
  rollback_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Launch Runs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  run_number INTEGER NOT NULL DEFAULT 1,
  current_stage TEXT NOT NULL DEFAULT 'intake',
  stages_completed JSONB NOT NULL DEFAULT '[]',
  stages_remaining JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'paused', 'completed', 'failed', 'waiting_approval')),
  triggered_by UUID REFERENCES auth.users(id),
  error_log JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Launch Insights ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('performance', 'anomaly', 'opportunity', 'risk', 'recommendation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  metric_key TEXT,
  metric_value NUMERIC,
  metric_trend TEXT CHECK (metric_trend IN ('up', 'down', 'stable')),
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  evidence_level TEXT NOT NULL DEFAULT 'TEMPLATE' CHECK (evidence_level IN ('VERIFIED', 'DERIVED', 'TEMPLATE')),
  evidence_source TEXT NOT NULL DEFAULT 'ai_generation',
  action_suggested TEXT,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Lead Handoffs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_lead_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  lead_source TEXT NOT NULL DEFAULT '',
  lead_email_hash TEXT NOT NULL DEFAULT '',
  lead_score INTEGER NOT NULL DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  qualification_status TEXT NOT NULL DEFAULT 'raw' CHECK (qualification_status IN ('raw', 'mql', 'sql', 'opportunity', 'closed_won', 'closed_lost')),
  first_touch_channel TEXT NOT NULL DEFAULT '',
  last_touch_channel TEXT NOT NULL DEFAULT '',
  touchpoint_count INTEGER NOT NULL DEFAULT 0,
  utm_source TEXT,
  utm_campaign TEXT,
  handoff_to_crm BOOLEAN NOT NULL DEFAULT false,
  crm_record_id TEXT,
  handoff_at TIMESTAMPTZ,
  lifecycle_stage TEXT NOT NULL DEFAULT 'awareness',
  follow_up_actions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Launch Reports ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL DEFAULT 'daily' CHECK (report_type IN ('daily', 'weekly', 'final', 'executive')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  kpi_summary JSONB NOT NULL DEFAULT '[]',
  channel_performance JSONB NOT NULL DEFAULT '[]',
  creative_performance JSONB NOT NULL DEFAULT '[]',
  budget_summary JSONB NOT NULL DEFAULT '{}',
  top_insights JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  overall_status TEXT NOT NULL DEFAULT 'on_track' CHECK (overall_status IN ('on_track', 'at_risk', 'behind', 'exceeded')),
  confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  evidence_level TEXT NOT NULL DEFAULT 'TEMPLATE' CHECK (evidence_level IN ('VERIFIED', 'DERIVED', 'TEMPLATE')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Video Asset Registry ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_video_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  video_concept_id UUID REFERENCES launch_video_concepts(id) ON DELETE SET NULL,
  script_text TEXT NOT NULL DEFAULT '',
  storyboard_url TEXT,
  voiceover_text TEXT,
  voiceover_url TEXT,
  caption_set JSONB,
  thumbnail_ideas JSONB NOT NULL DEFAULT '[]',
  cta_package JSONB NOT NULL DEFAULT '{}',
  aspect_ratio_variants JSONB NOT NULL DEFAULT '[]',
  channel_packaging JSONB NOT NULL DEFAULT '[]',
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK (publish_status IN ('draft', 'in_review', 'approved', 'scheduled', 'published', 'deprecated')),
  evidence_level TEXT NOT NULL DEFAULT 'TEMPLATE' CHECK (evidence_level IN ('VERIFIED', 'DERIVED', 'TEMPLATE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Asset Registry ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_asset_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('script', 'storyboard', 'voiceover', 'caption_set', 'thumbnail', 'cta_package', 'video_raw', 'image', 'copy')),
  name TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  format TEXT,
  channel_target TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'scheduled', 'published', 'deprecated')),
  parent_asset_id UUID REFERENCES launch_asset_registry(id) ON DELETE SET NULL,
  repurposed_from TEXT,
  brand_compliant BOOLEAN,
  compliance_notes JSONB NOT NULL DEFAULT '[]',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Launch Error Log ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS launch_error_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_project_id UUID NOT NULL REFERENCES launch_projects(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  recoverable BOOLEAN NOT NULL DEFAULT true,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Add columns to launch_projects for canonical model ──────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_projects' AND column_name = 'product_name') THEN
    ALTER TABLE launch_projects ADD COLUMN product_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_projects' AND column_name = 'product_type') THEN
    ALTER TABLE launch_projects ADD COLUMN product_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_projects' AND column_name = 'launch_goal') THEN
    ALTER TABLE launch_projects ADD COLUMN launch_goal TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_projects' AND column_name = 'target_audience') THEN
    ALTER TABLE launch_projects ADD COLUMN target_audience TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_projects' AND column_name = 'positioning') THEN
    ALTER TABLE launch_projects ADD COLUMN positioning TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_projects' AND column_name = 'key_offer') THEN
    ALTER TABLE launch_projects ADD COLUMN key_offer TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_projects' AND column_name = 'current_stage') THEN
    ALTER TABLE launch_projects ADD COLUMN current_stage TEXT NOT NULL DEFAULT 'intake';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_projects' AND column_name = 'owner') THEN
    ALTER TABLE launch_projects ADD COLUMN owner UUID REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_projects' AND column_name = 'evidence_level') THEN
    ALTER TABLE launch_projects ADD COLUMN evidence_level TEXT NOT NULL DEFAULT 'TEMPLATE' CHECK (evidence_level IN ('VERIFIED', 'DERIVED', 'TEMPLATE'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_projects' AND column_name = 'approval_policy') THEN
    ALTER TABLE launch_projects ADD COLUMN approval_policy JSONB NOT NULL DEFAULT '{"auto_approve_low_risk": false, "require_legal_review": false, "require_brand_review": false, "budget_approval_threshold": 1000}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_projects' AND column_name = 'risks') THEN
    ALTER TABLE launch_projects ADD COLUMN risks JSONB NOT NULL DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'launch_projects' AND column_name = 'dependencies') THEN
    ALTER TABLE launch_projects ADD COLUMN dependencies JSONB NOT NULL DEFAULT '[]';
  END IF;
END $$;

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_launch_briefs_project ON launch_briefs(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_audience_research_project ON launch_audience_research(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_messaging_frameworks_project ON launch_messaging_frameworks(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_offer_assets_project ON launch_offer_assets(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_landing_pages_project ON launch_landing_pages(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_campaign_plans_project ON launch_campaign_plans(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_approval_checkpoints_project ON launch_approval_checkpoints(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_approval_checkpoints_status ON launch_approval_checkpoints(status);
CREATE INDEX IF NOT EXISTS idx_launch_runs_project ON launch_runs(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_runs_status ON launch_runs(status);
CREATE INDEX IF NOT EXISTS idx_launch_insights_project ON launch_insights(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_lead_handoffs_project ON launch_lead_handoffs(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_lead_handoffs_status ON launch_lead_handoffs(qualification_status);
CREATE INDEX IF NOT EXISTS idx_launch_reports_project ON launch_reports(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_video_assets_project ON launch_video_assets(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_asset_registry_project ON launch_asset_registry(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_asset_registry_status ON launch_asset_registry(status);
CREATE INDEX IF NOT EXISTS idx_launch_error_log_project ON launch_error_log(launch_project_id);
CREATE INDEX IF NOT EXISTS idx_launch_error_log_stage ON launch_error_log(stage);

-- ─── RLS Policies ────────────────────────────────────────────────────────────
ALTER TABLE launch_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_audience_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_messaging_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_offer_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_campaign_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_approval_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_lead_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_video_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_asset_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_error_log ENABLE ROW LEVEL SECURITY;

-- RLS policies use launch_projects FK for workspace isolation
CREATE POLICY "launch_briefs_workspace" ON launch_briefs FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_briefs.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_audience_research_workspace" ON launch_audience_research FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_audience_research.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_messaging_frameworks_workspace" ON launch_messaging_frameworks FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_messaging_frameworks.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_offer_assets_workspace" ON launch_offer_assets FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_offer_assets.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_landing_pages_workspace" ON launch_landing_pages FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_landing_pages.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_campaign_plans_workspace" ON launch_campaign_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_campaign_plans.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_approval_checkpoints_workspace" ON launch_approval_checkpoints FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_approval_checkpoints.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_runs_workspace" ON launch_runs FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_runs.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_insights_workspace" ON launch_insights FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_insights.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_lead_handoffs_workspace" ON launch_lead_handoffs FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_lead_handoffs.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_reports_workspace" ON launch_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_reports.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_video_assets_workspace" ON launch_video_assets FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_video_assets.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_asset_registry_workspace" ON launch_asset_registry FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_asset_registry.launch_project_id AND ur.user_id = auth.uid())
);

CREATE POLICY "launch_error_log_workspace" ON launch_error_log FOR ALL USING (
  EXISTS (SELECT 1 FROM launch_projects lp JOIN user_roles ur ON ur.workspace_id = lp.workspace_id WHERE lp.id = launch_error_log.launch_project_id AND ur.user_id = auth.uid())
);

-- ─── Updated_at triggers ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'launch_briefs', 'launch_audience_research', 'launch_messaging_frameworks',
    'launch_offer_assets', 'launch_landing_pages', 'launch_campaign_plans',
    'launch_approval_checkpoints', 'launch_lead_handoffs',
    'launch_video_assets', 'launch_asset_registry'
  ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER IF NOT EXISTS set_updated_at_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      tbl, tbl
    );
  END LOOP;
EXCEPTION WHEN duplicate_object THEN
  -- Triggers already exist, skip
  NULL;
END $$;
