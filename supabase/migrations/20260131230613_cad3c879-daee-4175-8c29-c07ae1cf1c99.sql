-- =============================================
-- V2 ENTERPRISE UPGRADE - PART 2: TABLES
-- =============================================

-- 1) ROLE PERMISSIONS TABLE
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission permission_action NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role, permission)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_permissions_read" ON public.role_permissions FOR SELECT USING (true);

-- 2) SITE-LEVEL ROLES
CREATE TABLE public.site_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, site_id)
);

ALTER TABLE public.site_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_roles_workspace_access" ON public.site_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sites s
      WHERE s.id = site_id 
      AND public.has_workspace_access(auth.uid(), s.workspace_id)
    )
  );

-- 3) POLICY ENGINE
CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  risk_level risk_level NOT NULL DEFAULT 'medium',
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  autopilot_allowed BOOLEAN NOT NULL DEFAULT false,
  constraints JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(workspace_id, site_id, action_type)
);

CREATE INDEX idx_policies_workspace ON public.policies(workspace_id);
CREATE INDEX idx_policies_action ON public.policies(action_type);

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "policies_workspace_access" ON public.policies
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 4) POLICY EVENTS (Audit)
CREATE TABLE public.policy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES public.policies(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  decision TEXT NOT NULL,
  reason TEXT,
  context JSONB DEFAULT '{}',
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_policy_events_workspace ON public.policy_events(workspace_id);
CREATE INDEX idx_policy_events_created ON public.policy_events(created_at DESC);

ALTER TABLE public.policy_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "policy_events_read" ON public.policy_events
  FOR SELECT USING (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "policy_events_insert" ON public.policy_events
  FOR INSERT WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

-- 5) EXPERIMENTS FRAMEWORK
CREATE TABLE public.experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  objective TEXT NOT NULL,
  hypothesis TEXT,
  primary_metric TEXT NOT NULL DEFAULT 'ctr',
  status experiment_status NOT NULL DEFAULT 'draft',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  winner_variant_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

CREATE INDEX idx_experiments_workspace ON public.experiments(workspace_id);
CREATE INDEX idx_experiments_status ON public.experiments(status);

ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "experiments_workspace_access" ON public.experiments
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 6) EXPERIMENT VARIANTS
CREATE TABLE public.experiment_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'A',
  creative_job_id UUID REFERENCES public.creative_jobs(id) ON DELETE SET NULL,
  asset_ids UUID[] DEFAULT '{}',
  utm_params JSONB DEFAULT '{}',
  traffic_allocation INTEGER NOT NULL DEFAULT 50 CHECK (traffic_allocation >= 0 AND traffic_allocation <= 100),
  is_control BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_variants_experiment ON public.experiment_variants(experiment_id);

ALTER TABLE public.experiment_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants_workspace_access" ON public.experiment_variants
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 7) EXPERIMENT RESULTS
CREATE TABLE public.experiment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.experiment_variants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  cost NUMERIC(12,2) DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  ctr NUMERIC(8,4),
  cvr NUMERIC(8,4),
  cpa NUMERIC(12,2),
  roas NUMERIC(8,2),
  confidence_level NUMERIC(5,2),
  is_significant BOOLEAN DEFAULT false,
  data_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(experiment_id, variant_id, snapshot_date)
);

CREATE INDEX idx_results_experiment ON public.experiment_results(experiment_id);

ALTER TABLE public.experiment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "results_workspace_access" ON public.experiment_results
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 8) AUDIT LOG (Immutable)
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  actor_id UUID,
  actor_type TEXT NOT NULL DEFAULT 'user',
  changes JSONB DEFAULT '{}',
  context JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_workspace ON public.audit_log(workspace_id);
CREATE INDEX idx_audit_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON public.audit_log(created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_read" ON public.audit_log
  FOR SELECT USING (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "audit_log_insert" ON public.audit_log
  FOR INSERT WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

-- Prevent updates/deletes on audit_log
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log is immutable - modifications not allowed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER audit_log_no_update
  BEFORE UPDATE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();

CREATE TRIGGER audit_log_no_delete
  BEFORE DELETE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();

-- 9) INCIDENT REPORTS (Ops)
CREATE TABLE public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.creative_jobs(id) ON DELETE SET NULL,
  agent_run_id UUID REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  step TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  reason TEXT NOT NULL,
  suggested_fix TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidents_workspace ON public.incident_reports(workspace_id);
CREATE INDEX idx_incidents_unresolved ON public.incident_reports(workspace_id) WHERE NOT is_resolved;

ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incidents_workspace_access" ON public.incident_reports
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 10) INTEGRATION TOKENS (Lifecycle)
CREATE TABLE public.integration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  refresh_failures INTEGER NOT NULL DEFAULT 0,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tokens_workspace ON public.integration_tokens(workspace_id);
CREATE INDEX idx_tokens_expiring ON public.integration_tokens(expires_at) WHERE NOT is_revoked;

ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tokens_workspace_access" ON public.integration_tokens
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 11) CLAIM GUARDRAILS
CREATE TABLE public.claim_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  creative_job_id UUID REFERENCES public.creative_jobs(id) ON DELETE CASCADE,
  original_claim TEXT NOT NULL,
  rewritten_claim TEXT,
  evidence_source TEXT,
  decision TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_claims_job ON public.claim_decisions(creative_job_id);

ALTER TABLE public.claim_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "claims_workspace_access" ON public.claim_decisions
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 12) PLATFORM POLICY PROFILES
CREATE TABLE public.platform_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  industry TEXT,
  policy_name TEXT NOT NULL,
  rules JSONB NOT NULL DEFAULT '{}',
  warnings TEXT[] DEFAULT '{}',
  required_approvals TEXT[] DEFAULT '{}',
  frequency_caps JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform, industry, policy_name)
);

ALTER TABLE public.platform_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_policies_read" ON public.platform_policies FOR SELECT USING (true);

-- 13) RENDER QA FRAMES
CREATE TABLE public.render_qa_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.creative_jobs(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.creative_assets(id) ON DELETE CASCADE,
  frame_position TEXT NOT NULL,
  frame_url TEXT,
  checks JSONB DEFAULT '{}',
  passed BOOLEAN,
  issues TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qa_frames_job ON public.render_qa_frames(job_id);

ALTER TABLE public.render_qa_frames ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qa_frames_workspace_access" ON public.render_qa_frames
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- 14) SAFE ZONES CONFIG
CREATE TABLE public.safe_zone_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  format TEXT NOT NULL UNIQUE,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  top_px INTEGER NOT NULL DEFAULT 0,
  bottom_px INTEGER NOT NULL DEFAULT 0,
  left_px INTEGER NOT NULL DEFAULT 0,
  right_px INTEGER NOT NULL DEFAULT 0,
  top_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  bottom_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  left_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  right_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.safe_zone_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "safe_zones_read" ON public.safe_zone_configs FOR SELECT USING (true);

-- 15) TRIGGERS
CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at
  BEFORE UPDATE ON public.experiments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tokens_updated_at
  BEFORE UPDATE ON public.integration_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();