-- =====================================================
-- ACCESS REVIEW MODULE - Revue des accès
-- =====================================================

-- Table pour les snapshots de revue d'accès
CREATE TABLE public.access_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Métadonnées
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  initiated_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  
  -- Résumé
  total_users INTEGER DEFAULT 0,
  total_roles INTEGER DEFAULT 0,
  total_integrations INTEGER DEFAULT 0,
  issues_found INTEGER DEFAULT 0,
  
  -- Résultats
  findings JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_access_reviews_workspace ON public.access_reviews(workspace_id);
CREATE INDEX idx_access_reviews_date ON public.access_reviews(review_date);

ALTER TABLE public.access_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "access_reviews_workspace_access" ON public.access_reviews
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- Table pour les détails d'accès par utilisateur
CREATE TABLE public.access_review_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.access_reviews(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Utilisateur
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  
  -- Accès
  role TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  sites_access JSONB DEFAULT '[]'::jsonb,
  integrations_access JSONB DEFAULT '[]'::jsonb,
  
  -- Dernière activité
  last_login_at TIMESTAMPTZ,
  last_action_at TIMESTAMPTZ,
  is_inactive BOOLEAN DEFAULT false,
  inactive_days INTEGER,
  
  -- Risques
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_reasons TEXT[],
  
  -- Actions recommandées
  recommended_action TEXT,
  action_taken TEXT,
  action_taken_by UUID REFERENCES auth.users(id),
  action_taken_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_access_review_entries_review ON public.access_review_entries(review_id);

ALTER TABLE public.access_review_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "access_review_entries_workspace_access" ON public.access_review_entries
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- =====================================================
-- KPI AUTOMATION - Tables analytiques
-- =====================================================

-- Table pour les KPI agrégés par workspace
CREATE TABLE public.kpi_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Période
  date DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  
  -- SEO
  seo_sessions INTEGER DEFAULT 0,
  seo_clicks INTEGER DEFAULT 0,
  seo_impressions INTEGER DEFAULT 0,
  seo_avg_position NUMERIC(5,2),
  
  -- Ads
  ads_spend NUMERIC(12,2) DEFAULT 0,
  ads_impressions INTEGER DEFAULT 0,
  ads_clicks INTEGER DEFAULT 0,
  ads_conversions INTEGER DEFAULT 0,
  ads_ctr NUMERIC(5,2),
  ads_cpc NUMERIC(8,2),
  ads_roas NUMERIC(8,2),
  
  -- Sales
  sales_revenue NUMERIC(12,2) DEFAULT 0,
  sales_orders INTEGER DEFAULT 0,
  sales_aov NUMERIC(10,2),
  sales_new_customers INTEGER DEFAULT 0,
  
  -- Engagement
  nps_score NUMERIC(4,1),
  support_tickets INTEGER DEFAULT 0,
  support_resolution_time_hrs NUMERIC(6,2),
  
  -- Scores calculés
  health_score NUMERIC(3,0),
  growth_score NUMERIC(3,0),
  roi_score NUMERIC(3,0),
  
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id, date, period_type)
);

CREATE INDEX idx_kpi_aggregates_workspace_date ON public.kpi_aggregates(workspace_id, date DESC);
CREATE INDEX idx_kpi_aggregates_period ON public.kpi_aggregates(period_type, date DESC);

ALTER TABLE public.kpi_aggregates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kpi_aggregates_workspace_access" ON public.kpi_aggregates
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- Table pour le scheduling des syncs KPI
CREATE TABLE public.kpi_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  job_type TEXT NOT NULL CHECK (job_type IN ('seo', 'ads', 'sales', 'all')),
  schedule_cron TEXT DEFAULT '0 6 * * *', -- Daily at 6 AM
  enabled BOOLEAN DEFAULT true,
  
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT,
  last_run_error TEXT,
  next_run_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id, job_type)
);

ALTER TABLE public.kpi_sync_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kpi_sync_jobs_workspace_access" ON public.kpi_sync_jobs
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- Trigger pour updated_at
CREATE TRIGGER update_kpi_sync_jobs_updated_at
  BEFORE UPDATE ON public.kpi_sync_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ONBOARDING - Tables de priorités
-- =====================================================

-- Table pour stocker les priorités business de l'onboarding
CREATE TABLE public.onboarding_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Priorités sélectionnées
  objectives TEXT[] DEFAULT '{}',
  focus_channels TEXT[] DEFAULT '{}',
  industry TEXT,
  company_size TEXT,
  
  -- Questions avancées
  monthly_budget TEXT,
  timeline TEXT,
  current_tools TEXT[],
  
  -- Statut
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id)
);

ALTER TABLE public.onboarding_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding_priorities_workspace_access" ON public.onboarding_priorities
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- Trigger pour updated_at
CREATE TRIGGER update_onboarding_priorities_updated_at
  BEFORE UPDATE ON public.onboarding_priorities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour calculer le score de santé
CREATE OR REPLACE FUNCTION public.calculate_health_score(_workspace_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _score INTEGER := 50; -- Base score
  _has_site BOOLEAN;
  _has_integration BOOLEAN;
  _active_runs INTEGER;
  _pending_approvals INTEGER;
BEGIN
  -- Check site setup
  SELECT EXISTS(SELECT 1 FROM sites WHERE workspace_id = _workspace_id) INTO _has_site;
  IF _has_site THEN _score := _score + 15; END IF;
  
  -- Check integrations
  SELECT EXISTS(SELECT 1 FROM integrations WHERE workspace_id = _workspace_id AND status = 'active') INTO _has_integration;
  IF _has_integration THEN _score := _score + 15; END IF;
  
  -- Check recent runs (last 7 days)
  SELECT COUNT(*) INTO _active_runs 
  FROM executive_runs 
  WHERE workspace_id = _workspace_id 
    AND status = 'completed' 
    AND created_at > NOW() - INTERVAL '7 days';
  IF _active_runs > 0 THEN _score := _score + 10; END IF;
  IF _active_runs > 5 THEN _score := _score + 5; END IF;
  
  -- Pending approvals (negative impact)
  SELECT COUNT(*) INTO _pending_approvals 
  FROM approval_queue 
  WHERE workspace_id = _workspace_id 
    AND status = 'pending';
  IF _pending_approvals > 10 THEN _score := _score - 10; END IF;
  
  RETURN LEAST(100, GREATEST(0, _score));
END;
$$;