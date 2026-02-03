-- =============================================
-- PORTABLE COMPANY: Complete Schema
-- Create all tables in correct order
-- =============================================

-- Enums (skip if exists)
DO $$ BEGIN
  CREATE TYPE public.service_category AS ENUM (
    'core', 'marketing', 'sales', 'finance', 'security',
    'product', 'engineering', 'data', 'support', 'governance'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.run_status AS ENUM (
    'queued', 'running', 'blocked', 'requires_approval', 'done', 'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- TABLE: services_catalog
-- =============================================
CREATE TABLE IF NOT EXISTS public.services_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category service_category NOT NULL,
  icon TEXT DEFAULT 'Building2',
  is_core BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 100,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.services_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read services catalog" ON public.services_catalog;
CREATE POLICY "Anyone can read services catalog"
  ON public.services_catalog FOR SELECT USING (true);

-- =============================================
-- TABLE: workspace_services
-- =============================================
CREATE TABLE IF NOT EXISTS public.workspace_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services_catalog(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  enabled_at TIMESTAMPTZ DEFAULT now(),
  enabled_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, service_id)
);

ALTER TABLE public.workspace_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their workspace services" ON public.workspace_services;
CREATE POLICY "Users can view their workspace services"
  ON public.workspace_services FOR SELECT
  USING (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "Owners can manage workspace services" ON public.workspace_services;
CREATE POLICY "Owners can manage workspace services"
  ON public.workspace_services FOR ALL
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- =============================================
-- TABLE: workspace_subscriptions
-- =============================================
CREATE TABLE IF NOT EXISTS public.workspace_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID UNIQUE NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  is_full_company BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workspace_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their workspace subscription" ON public.workspace_subscriptions;
CREATE POLICY "Users can view their workspace subscription"
  ON public.workspace_subscriptions FOR SELECT
  USING (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "Owners can manage subscription" ON public.workspace_subscriptions;
CREATE POLICY "Owners can manage subscription"
  ON public.workspace_subscriptions FOR ALL
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- =============================================
-- TABLE: scheduled_runs
-- =============================================
CREATE TABLE IF NOT EXISTS public.scheduled_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL,
  service_slug TEXT,
  schedule_cron TEXT NOT NULL,
  timezone TEXT DEFAULT 'Europe/Paris',
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.scheduled_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their scheduled runs" ON public.scheduled_runs;
CREATE POLICY "Users can view their scheduled runs"
  ON public.scheduled_runs FOR SELECT
  USING (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "Admins can manage scheduled runs" ON public.scheduled_runs;
CREATE POLICY "Admins can manage scheduled runs"
  ON public.scheduled_runs FOR ALL
  USING (public.has_workspace_role(auth.uid(), workspace_id, 'admin') 
         OR public.is_workspace_owner(auth.uid(), workspace_id));

-- =============================================
-- TABLE: executive_runs
-- =============================================
CREATE TABLE IF NOT EXISTS public.executive_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  scheduled_run_id UUID REFERENCES public.scheduled_runs(id),
  run_type TEXT NOT NULL,
  service_slug TEXT,
  status run_status DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  inputs JSONB DEFAULT '{}'::jsonb,
  outputs JSONB DEFAULT '{}'::jsonb,
  executive_summary TEXT,
  evidence_bundle JSONB DEFAULT '[]'::jsonb,
  proposed_actions JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  triggered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.executive_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their runs" ON public.executive_runs;
CREATE POLICY "Users can view their runs"
  ON public.executive_runs FOR SELECT
  USING (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "Users can create runs" ON public.executive_runs;
CREATE POLICY "Users can create runs"
  ON public.executive_runs FOR INSERT
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

DROP POLICY IF EXISTS "System can update runs" ON public.executive_runs;
CREATE POLICY "System can update runs"
  ON public.executive_runs FOR UPDATE
  USING (public.has_workspace_access(auth.uid(), workspace_id));

-- =============================================
-- SEED: Services Catalog
-- =============================================
INSERT INTO public.services_catalog (slug, name, description, category, icon, is_core, display_order, features) VALUES
  ('core-os', 'Core OS', 'Workspace, RBAC, Approvals, Audit Log, Scheduler', 'core', 'Settings', true, 0, 
   '["Workspace Management", "Role-Based Access", "Approval Gate", "Audit Trail", "Scheduled Runs"]'::jsonb),
  ('marketing', 'Marketing', 'Content, SEO, Paid Ads, Social Media campaigns', 'marketing', 'Megaphone', false, 10,
   '["Content Calendar", "SEO Audits", "Ad Recommendations", "Social Publishing"]'::jsonb),
  ('sales', 'Sales', 'Pipeline management, Outreach sequences, Deal tracking', 'sales', 'TrendingUp', false, 20,
   '["Pipeline Review", "Outreach Drafts", "Deal Scoring", "Win/Loss Analysis"]'::jsonb),
  ('finance', 'Finance', 'ROI tracking, Budget alerts, Cost optimization', 'finance', 'DollarSign', false, 30,
   '["ROI Summaries", "Budget Monitoring", "Cost Alerts", "Revenue Forecasts"]'::jsonb),
  ('security', 'Security', 'Compliance posture, Access reviews, Secrets hygiene', 'security', 'Shield', false, 40,
   '["Access Reviews", "Secrets Hygiene", "Compliance Checklists", "Vulnerability Scans"]'::jsonb),
  ('product', 'Product', 'Roadmap prioritization, OKRs, Feature requests', 'product', 'Lightbulb', false, 50,
   '["Roadmap Management", "OKR Drafts", "Feature Prioritization", "User Feedback"]'::jsonb),
  ('engineering', 'Engineering', 'Release gates, QA health, Delivery metrics', 'engineering', 'Code', false, 60,
   '["Release Gates", "QA Summaries", "Delivery Health", "Tech Debt Tracking"]'::jsonb),
  ('data', 'Data & Analytics', 'Funnel diagnostics, Cohort analysis, Dashboards', 'data', 'BarChart3', false, 70,
   '["Funnel Diagnostics", "Cohort Analysis", "KPI Dashboards", "Tracking Audits"]'::jsonb),
  ('support', 'Support', 'Ticket triage, Knowledge base, Customer satisfaction', 'support', 'HeadphonesIcon', false, 80,
   '["Ticket Triage", "KB Updates", "CSAT Analysis", "Response Templates"]'::jsonb),
  ('governance', 'Governance', 'IT policies, Access governance, Vendor management', 'governance', 'Building', false, 90,
   '["Policy Management", "Access Governance", "Vendor Reviews", "IT Hygiene"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- FUNCTION: Auto-enable core services
-- =============================================
CREATE OR REPLACE FUNCTION public.auto_enable_core_services()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workspace_services (workspace_id, service_id, enabled)
  SELECT NEW.id, sc.id, true
  FROM public.services_catalog sc
  WHERE sc.is_core = true
  ON CONFLICT (workspace_id, service_id) DO NOTHING;
  
  INSERT INTO public.workspace_subscriptions (workspace_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'free', 'trialing', NOW() + INTERVAL '14 days')
  ON CONFLICT (workspace_id) DO NOTHING;
  
  INSERT INTO public.scheduled_runs (workspace_id, run_type, schedule_cron, enabled)
  VALUES 
    (NEW.id, 'DAILY_EXECUTIVE_BRIEF', '0 8 * * *', true),
    (NEW.id, 'WEEKLY_EXECUTIVE_REVIEW', '0 9 * * 1', true);
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_workspace_created_enable_core ON public.workspaces;
CREATE TRIGGER on_workspace_created_enable_core
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_enable_core_services();

-- =============================================
-- FUNCTION: Check if workspace has service
-- =============================================
CREATE OR REPLACE FUNCTION public.has_service(_workspace_id UUID, _service_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_services ws
    JOIN public.services_catalog sc ON sc.id = ws.service_id
    WHERE ws.workspace_id = _workspace_id
      AND sc.slug = _service_slug
      AND ws.enabled = true
      AND (ws.expires_at IS NULL OR ws.expires_at > NOW())
  )
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_services_workspace ON public.workspace_services(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_services_enabled ON public.workspace_services(workspace_id, enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_workspace_subscriptions_workspace ON public.workspace_subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_runs_workspace ON public.scheduled_runs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_runs_next ON public.scheduled_runs(next_run_at) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_executive_runs_workspace ON public.executive_runs(workspace_id, created_at DESC);