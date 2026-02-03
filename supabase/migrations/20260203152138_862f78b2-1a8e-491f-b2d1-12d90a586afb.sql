-- =====================================================
-- EVIDENCE BUNDLES - Transparence IA
-- =====================================================

-- Types pour les sources de preuves
CREATE TYPE public.evidence_source_type AS ENUM (
  'database',      -- Données internes
  'api',           -- Appel API externe
  'web_scrape',    -- Crawl web
  'analytics',     -- Google Analytics, Search Console
  'ai_inference',  -- Raisonnement IA
  'user_input',    -- Données utilisateur
  'third_party',   -- Service tiers (Stripe, etc.)
  'historical'     -- Données historiques
);

CREATE TYPE public.evidence_confidence AS ENUM (
  'high',          -- Données vérifiées, source fiable
  'medium',        -- Données probables, source correcte
  'low',           -- Estimation, source incertaine
  'inferred'       -- Déduit par IA
);

-- Table principale des Evidence Bundles
CREATE TABLE public.evidence_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Liens vers les runs
  executive_run_id UUID REFERENCES public.executive_runs(id) ON DELETE CASCADE,
  agent_run_id UUID REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  approval_id UUID REFERENCES public.approval_queue(id) ON DELETE SET NULL,
  
  -- Métadonnées
  title TEXT NOT NULL,
  summary TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Métriques clés (données agrégées)
  key_metrics JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"name": "CTR", "value": 3.2, "unit": "%", "trend": "up", "baseline": 2.8}]
  
  -- Score de confiance global
  overall_confidence evidence_confidence NOT NULL DEFAULT 'medium',
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Limitations et avertissements
  limitations TEXT[],
  warnings TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_bundles_workspace ON public.evidence_bundles(workspace_id);
CREATE INDEX idx_evidence_bundles_exec_run ON public.evidence_bundles(executive_run_id);
CREATE INDEX idx_evidence_bundles_agent_run ON public.evidence_bundles(agent_run_id);

ALTER TABLE public.evidence_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evidence_bundles_workspace_access" ON public.evidence_bundles
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- Sources individuelles (détail des preuves)
CREATE TABLE public.evidence_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.evidence_bundles(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Type et identification
  source_type evidence_source_type NOT NULL,
  source_name TEXT NOT NULL,  -- Ex: "Google Analytics 4", "SEO Audit", "Historical Data"
  source_url TEXT,            -- URL de référence si applicable
  
  -- Données extraites
  data_extracted JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_snapshot_at TIMESTAMPTZ,  -- Quand les données ont été capturées
  
  -- Qualité
  confidence evidence_confidence NOT NULL DEFAULT 'medium',
  reliability_notes TEXT,
  
  -- Provenance
  query_used TEXT,            -- Requête SQL/API utilisée
  api_endpoint TEXT,
  extraction_method TEXT,
  
  -- Validation
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_sources_bundle ON public.evidence_sources(bundle_id);

ALTER TABLE public.evidence_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evidence_sources_workspace_access" ON public.evidence_sources
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- Métriques détaillées avec contexte
CREATE TABLE public.evidence_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.evidence_bundles(id) ON DELETE CASCADE,
  source_id UUID REFERENCES public.evidence_sources(id) ON DELETE SET NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Métrique
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_unit TEXT,
  
  -- Contexte
  period_start DATE,
  period_end DATE,
  comparison_type TEXT,  -- 'week_over_week', 'month_over_month', 'year_over_year'
  
  -- Tendance
  baseline_value NUMERIC,
  change_percent NUMERIC,
  trend TEXT,  -- 'up', 'down', 'stable'
  
  -- Seuils et alertes
  threshold_min NUMERIC,
  threshold_max NUMERIC,
  is_anomaly BOOLEAN DEFAULT false,
  anomaly_reason TEXT,
  
  -- Interprétation IA
  interpretation TEXT,
  recommended_action TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_metrics_bundle ON public.evidence_metrics(bundle_id);

ALTER TABLE public.evidence_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evidence_metrics_workspace_access" ON public.evidence_metrics
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- Raisonnements IA (chain of thought)
CREATE TABLE public.evidence_reasoning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.evidence_bundles(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Étape du raisonnement
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL,  -- 'observation', 'analysis', 'hypothesis', 'conclusion', 'recommendation'
  
  -- Contenu
  content TEXT NOT NULL,
  supporting_evidence JSONB,  -- Références aux sources/métriques
  
  -- Confiance
  confidence evidence_confidence NOT NULL DEFAULT 'medium',
  alternative_interpretations TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_reasoning_bundle ON public.evidence_reasoning(bundle_id);

ALTER TABLE public.evidence_reasoning ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evidence_reasoning_workspace_access" ON public.evidence_reasoning
  FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- Fonction pour créer un bundle d'évidence
CREATE OR REPLACE FUNCTION public.create_evidence_bundle(
  _workspace_id UUID,
  _title TEXT,
  _summary TEXT DEFAULT NULL,
  _executive_run_id UUID DEFAULT NULL,
  _agent_run_id UUID DEFAULT NULL,
  _key_metrics JSONB DEFAULT '[]'::jsonb,
  _confidence TEXT DEFAULT 'medium'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _bundle_id UUID;
BEGIN
  INSERT INTO public.evidence_bundles (
    workspace_id,
    executive_run_id,
    agent_run_id,
    title,
    summary,
    key_metrics,
    overall_confidence
  ) VALUES (
    _workspace_id,
    _executive_run_id,
    _agent_run_id,
    _title,
    _summary,
    _key_metrics,
    _confidence::evidence_confidence
  )
  RETURNING id INTO _bundle_id;
  
  RETURN _bundle_id;
END;
$$;

-- Fonction pour ajouter une source
CREATE OR REPLACE FUNCTION public.add_evidence_source(
  _bundle_id UUID,
  _workspace_id UUID,
  _source_type TEXT,
  _source_name TEXT,
  _data_extracted JSONB,
  _confidence TEXT DEFAULT 'medium',
  _source_url TEXT DEFAULT NULL,
  _query_used TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _source_id UUID;
BEGIN
  INSERT INTO public.evidence_sources (
    bundle_id,
    workspace_id,
    source_type,
    source_name,
    data_extracted,
    confidence,
    source_url,
    query_used,
    data_snapshot_at
  ) VALUES (
    _bundle_id,
    _workspace_id,
    _source_type::evidence_source_type,
    _source_name,
    _data_extracted,
    _confidence::evidence_confidence,
    _source_url,
    _query_used,
    NOW()
  )
  RETURNING id INTO _source_id;
  
  RETURN _source_id;
END;
$$;

-- Triggers updated_at
CREATE TRIGGER update_evidence_bundles_updated_at
  BEFORE UPDATE ON public.evidence_bundles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();