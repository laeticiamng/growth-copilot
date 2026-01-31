-- LIVRAISON 4+5: Approval Queue + Autopilot Settings + Quotas Final

-- 1. Approval Queue Table for pending actions
CREATE TABLE public.approval_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_data JSONB NOT NULL DEFAULT '{}',
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    auto_approved BOOLEAN DEFAULT false
);

-- 2. Autopilot Settings per site
CREATE TABLE public.autopilot_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT false,
    max_actions_per_week INTEGER DEFAULT 10,
    max_daily_budget NUMERIC DEFAULT 0,
    allowed_actions JSONB DEFAULT '["seo_fix", "content_suggestion", "review_response"]',
    require_approval_above_risk TEXT DEFAULT 'medium' CHECK (require_approval_above_risk IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (workspace_id, site_id)
);

-- 3. Competitive Analysis table
CREATE TABLE public.competitor_analysis (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    competitor_url TEXT NOT NULL,
    competitor_name TEXT,
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    insights JSONB DEFAULT '{}',
    keyword_gaps JSONB DEFAULT '[]',
    content_gaps JSONB DEFAULT '[]',
    backlink_comparison JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Update workspace_quotas with final limits
ALTER TABLE public.workspace_quotas 
    ADD COLUMN IF NOT EXISTS crawls_per_month INTEGER DEFAULT 10,
    ADD COLUMN IF NOT EXISTS agent_runs_per_month INTEGER DEFAULT 100,
    ADD COLUMN IF NOT EXISTS reports_per_month INTEGER DEFAULT 5,
    ADD COLUMN IF NOT EXISTS sites_limit INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS integrations_limit INTEGER DEFAULT 3;

-- 5. Enable RLS on new tables
ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopilot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for approval_queue
CREATE POLICY "Workspace access for approval_queue" ON public.approval_queue
    FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
    WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- 7. RLS Policies for autopilot_settings
CREATE POLICY "Workspace access for autopilot_settings" ON public.autopilot_settings
    FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
    WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- 8. RLS Policies for competitor_analysis
CREATE POLICY "Workspace access for competitor_analysis" ON public.competitor_analysis
    FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
    WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- 9. Create index for approval queue expiration
CREATE INDEX idx_approval_queue_status ON public.approval_queue(status, expires_at);
CREATE INDEX idx_approval_queue_workspace ON public.approval_queue(workspace_id, status);

-- 10. Add trigger for updated_at on autopilot_settings
CREATE TRIGGER update_autopilot_settings_updated_at
    BEFORE UPDATE ON public.autopilot_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Add trigger for updated_at on competitor_analysis
CREATE TRIGGER update_competitor_analysis_updated_at
    BEFORE UPDATE ON public.competitor_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();