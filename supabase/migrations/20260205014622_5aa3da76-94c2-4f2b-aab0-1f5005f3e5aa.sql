
-- Table pour les départements activés par workspace (abonnements à la carte)
CREATE TABLE IF NOT EXISTS public.workspace_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  department_slug TEXT NOT NULL,
  stripe_subscription_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  agents_count INTEGER NOT NULL DEFAULT 0,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, department_slug)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_workspace_departments_workspace ON workspace_departments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_departments_slug ON workspace_departments(department_slug);

-- Enable RLS
ALTER TABLE workspace_departments ENABLE ROW LEVEL SECURITY;

-- Policy: workspace members can read
CREATE POLICY "workspace_departments_member_select" ON workspace_departments
  FOR SELECT USING (public.is_workspace_member(auth.uid(), workspace_id));

-- Policy: only owners can modify
CREATE POLICY "workspace_departments_owner_all" ON workspace_departments
  FOR ALL USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- Trigger pour updated_at
CREATE TRIGGER update_workspace_departments_updated_at
  BEFORE UPDATE ON workspace_departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ajouter colonnes sur workspace_subscriptions si manquantes
ALTER TABLE workspace_subscriptions 
  ADD COLUMN IF NOT EXISTS enabled_departments TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_starter BOOLEAN DEFAULT false;

-- Fonction helper pour vérifier l'accès à un département
CREATE OR REPLACE FUNCTION public.has_department_access(_workspace_id UUID, _department_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Full Company ou Founder = accès à tout
    SELECT 1 FROM workspace_subscriptions ws
    WHERE ws.workspace_id = _workspace_id 
      AND ws.status = 'active'
      AND (ws.is_full_company = true OR ws.plan = 'founder')
  )
  OR EXISTS (
    -- Starter = accès lite à tout
    SELECT 1 FROM workspace_subscriptions ws
    WHERE ws.workspace_id = _workspace_id 
      AND ws.status = 'active'
      AND ws.is_starter = true
  )
  OR EXISTS (
    -- Département spécifique activé
    SELECT 1 FROM workspace_departments wd
    WHERE wd.workspace_id = _workspace_id 
      AND wd.department_slug = _department_slug
      AND wd.is_active = true
      AND (wd.expires_at IS NULL OR wd.expires_at > NOW())
  );
$$;

-- Fonction pour obtenir les agents accessibles
CREATE OR REPLACE FUNCTION public.get_accessible_agents(_workspace_id UUID)
RETURNS TABLE(agent_type TEXT, department TEXT, is_lite BOOLEAN)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_full_company BOOLEAN;
  _is_starter BOOLEAN;
  _is_founder BOOLEAN;
BEGIN
  -- Vérifier le type d'abonnement
  SELECT 
    COALESCE(ws.is_full_company, false),
    COALESCE(ws.is_starter, false),
    COALESCE(ws.plan = 'founder', false)
  INTO _is_full_company, _is_starter, _is_founder
  FROM workspace_subscriptions ws
  WHERE ws.workspace_id = _workspace_id AND ws.status = 'active'
  LIMIT 1;

  -- Full Company ou Founder = tous les agents complets
  IF _is_full_company OR _is_founder THEN
    RETURN QUERY
    SELECT 
      ar.agent_type::TEXT,
      CASE 
        WHEN ar.agent_type IN ('chief_growth_officer', 'quality_compliance') THEN 'direction'
        WHEN ar.agent_type IN ('tech_auditor', 'keyword_strategist', 'content_builder', 'local_manager', 'social_manager') THEN 'marketing'
        WHEN ar.agent_type IN ('offer_architect', 'sales_ops', 'lifecycle_manager') THEN 'sales'
        WHEN ar.agent_type IN ('analytics_guardian') THEN 'finance'
        WHEN ar.agent_type IN ('reputation_manager') THEN 'support'
        WHEN ar.agent_type IN ('cro_optimizer') THEN 'product'
        WHEN ar.agent_type IN ('competitive_analyst') THEN 'marketing'
        WHEN ar.agent_type IN ('ads_manager') THEN 'marketing'
        ELSE 'other'
      END,
      false::BOOLEAN
    FROM (SELECT DISTINCT agent_type FROM agent_runs WHERE workspace_id = _workspace_id
          UNION SELECT unnest(enum_range(NULL::agent_type))) ar;
    RETURN;
  END IF;

  -- Starter = 1 agent par département (mode lite)
  IF _is_starter THEN
    RETURN QUERY
    SELECT 'chief_growth_officer'::TEXT, 'direction'::TEXT, true::BOOLEAN
    UNION ALL SELECT 'tech_auditor', 'marketing', true
    UNION ALL SELECT 'offer_architect', 'sales', true
    UNION ALL SELECT 'analytics_guardian', 'finance', true
    UNION ALL SELECT 'tech_auditor', 'security', true
    UNION ALL SELECT 'cro_optimizer', 'product', true
    UNION ALL SELECT 'tech_auditor', 'engineering', true
    UNION ALL SELECT 'analytics_guardian', 'data', true
    UNION ALL SELECT 'reputation_manager', 'support', true
    UNION ALL SELECT 'quality_compliance', 'governance', true
    UNION ALL SELECT 'analytics_guardian', 'hr', true;
    RETURN;
  END IF;

  -- À la carte = agents des départements activés
  RETURN QUERY
  SELECT 
    unnest(CASE wd.department_slug
      WHEN 'marketing' THEN ARRAY['tech_auditor', 'keyword_strategist', 'content_builder', 'local_manager', 'ads_manager']
      WHEN 'sales' THEN ARRAY['offer_architect', 'sales_ops', 'lifecycle_manager', 'sales_ops']
      WHEN 'finance' THEN ARRAY['analytics_guardian', 'analytics_guardian', 'analytics_guardian']
      WHEN 'security' THEN ARRAY['tech_auditor', 'tech_auditor', 'tech_auditor']
      WHEN 'product' THEN ARRAY['analytics_guardian', 'cro_optimizer', 'analytics_guardian', 'analytics_guardian']
      WHEN 'engineering' THEN ARRAY['tech_auditor', 'tech_auditor', 'tech_auditor', 'tech_auditor', 'tech_auditor']
      WHEN 'data' THEN ARRAY['analytics_guardian', 'analytics_guardian', 'analytics_guardian', 'analytics_guardian']
      WHEN 'support' THEN ARRAY['reputation_manager', 'reputation_manager', 'content_builder']
      WHEN 'governance' THEN ARRAY['quality_compliance', 'quality_compliance', 'quality_compliance']
      WHEN 'hr' THEN ARRAY['analytics_guardian', 'analytics_guardian']
      WHEN 'legal' THEN ARRAY['analytics_guardian']
      ELSE ARRAY[]::TEXT[]
    END)::TEXT,
    wd.department_slug::TEXT,
    false::BOOLEAN
  FROM workspace_departments wd
  WHERE wd.workspace_id = _workspace_id
    AND wd.is_active = true
    AND (wd.expires_at IS NULL OR wd.expires_at > NOW());
END;
$$;
