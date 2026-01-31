-- V2 ADD-ONS PART 2: Remaining tables + functions
-- =============================================

-- 1) Token Lifecycle - audit table
CREATE TABLE IF NOT EXISTS public.integration_token_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    action TEXT NOT NULL,
    scopes JSONB DEFAULT '[]',
    ip_address INET,
    user_agent TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_audit_workspace ON public.integration_token_audit(workspace_id);
CREATE INDEX IF NOT EXISTS idx_token_audit_integration ON public.integration_token_audit(integration_id);
CREATE INDEX IF NOT EXISTS idx_token_audit_created ON public.integration_token_audit(created_at DESC);

ALTER TABLE public.integration_token_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view token audit for their workspaces" ON public.integration_token_audit;
CREATE POLICY "Users can view token audit for their workspaces" ON public.integration_token_audit
    FOR SELECT TO authenticated
    USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- Token refresh tracking columns on integrations
ALTER TABLE public.integrations 
    ADD COLUMN IF NOT EXISTS token_refresh_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS refresh_failure_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_auth_failure_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS scopes_granted JSONB DEFAULT '[]';

-- 2) Policy Profiles table
CREATE TABLE IF NOT EXISTS public.policy_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    platform TEXT,
    industry TEXT,
    is_system_preset BOOLEAN DEFAULT false,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    policy_rules JSONB NOT NULL DEFAULT '{}',
    warnings JSONB DEFAULT '[]',
    required_approvals JSONB DEFAULT '[]',
    anti_spam_config JSONB DEFAULT '{"max_posts_per_day": 5, "min_interval_hours": 2, "audience_blacklist": []}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_policy_profiles_workspace ON public.policy_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_policy_profiles_platform ON public.policy_profiles(platform);
CREATE INDEX IF NOT EXISTS idx_policy_profiles_industry ON public.policy_profiles(industry);

ALTER TABLE public.policy_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read system policy presets" ON public.policy_profiles;
CREATE POLICY "Anyone can read system policy presets" ON public.policy_profiles
    FOR SELECT TO authenticated
    USING (is_system_preset = true OR workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

DROP POLICY IF EXISTS "Admins can manage workspace policy profiles" ON public.policy_profiles;
CREATE POLICY "Admins can manage workspace policy profiles" ON public.policy_profiles
    FOR ALL TO authenticated
    USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) AND is_system_preset = false)
    WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) AND is_system_preset = false);

-- 3) Ops metrics daily table
CREATE TABLE IF NOT EXISTS public.ops_metrics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    agent_runs_total INTEGER DEFAULT 0,
    agent_runs_success INTEGER DEFAULT 0,
    agent_runs_failed INTEGER DEFAULT 0,
    agent_avg_duration_ms INTEGER,
    creative_jobs_total INTEGER DEFAULT 0,
    creative_jobs_completed INTEGER DEFAULT 0,
    creative_jobs_manual_review INTEGER DEFAULT 0,
    total_cost_usd NUMERIC(10,4) DEFAULT 0,
    render_cost_usd NUMERIC(10,4) DEFAULT 0,
    ai_cost_usd NUMERIC(10,4) DEFAULT 0,
    top_manual_review_reasons JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(workspace_id, date)
);

CREATE INDEX IF NOT EXISTS idx_ops_metrics_workspace ON public.ops_metrics_daily(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ops_metrics_date ON public.ops_metrics_daily(date DESC);

ALTER TABLE public.ops_metrics_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view ops metrics" ON public.ops_metrics_daily;
CREATE POLICY "Admins can view ops metrics" ON public.ops_metrics_daily
    FOR SELECT TO authenticated
    USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- RLS for existing tables
ALTER TABLE public.render_qa_frames ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view render QA for their workspaces" ON public.render_qa_frames;
CREATE POLICY "Users can view render QA for their workspaces" ON public.render_qa_frames
    FOR SELECT TO authenticated
    USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

DROP POLICY IF EXISTS "Users can view claim decisions for their workspaces" ON public.claim_decisions;
CREATE POLICY "Users can view claim decisions for their workspaces" ON public.claim_decisions
    FOR SELECT TO authenticated
    USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

DROP POLICY IF EXISTS "Users can view incidents for their workspaces" ON public.incident_reports;
CREATE POLICY "Users can view incidents for their workspaces" ON public.incident_reports
    FOR SELECT TO authenticated
    USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

DROP POLICY IF EXISTS "Admins can manage incidents" ON public.incident_reports;
CREATE POLICY "Admins can manage incidents" ON public.incident_reports
    FOR ALL TO authenticated
    USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
    WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));