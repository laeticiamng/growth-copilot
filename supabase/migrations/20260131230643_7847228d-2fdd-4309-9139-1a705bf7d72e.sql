-- =============================================
-- V2 ENTERPRISE UPGRADE - PART 3: ALTERATIONS & FUNCTIONS
-- =============================================

-- 1) ADD FIELDS TO CREATIVE_JOBS
ALTER TABLE public.creative_jobs 
  ADD COLUMN IF NOT EXISTS experiment_id UUID REFERENCES public.experiments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variant_name TEXT DEFAULT 'A',
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS audit_manifest JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS render_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS render_completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_jobs_idempotency ON public.creative_jobs(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_experiment ON public.creative_jobs(experiment_id) WHERE experiment_id IS NOT NULL;

-- 2) ADD FIELDS TO APPROVAL_QUEUE
ALTER TABLE public.approval_queue
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.experiment_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approval_scope TEXT DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS partial_decisions JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preview_urls JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS diff_summary JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sla_hours INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- 3) PERMISSION CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _workspace_id UUID, _permission permission_action, _site_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Workspace-level permission
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id
      AND ur.workspace_id = _workspace_id
      AND rp.permission = _permission
  )
  OR (
    -- Site-level permission (if site_id provided)
    _site_id IS NOT NULL AND EXISTS (
      SELECT 1
      FROM public.site_roles sr
      JOIN public.role_permissions rp ON rp.role = sr.role
      WHERE sr.user_id = _user_id
        AND sr.site_id = _site_id
        AND rp.permission = _permission
    )
  )
$$;

-- 4) POLICY CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.check_policy(_workspace_id UUID, _action_type TEXT, _site_id UUID DEFAULT NULL)
RETURNS TABLE(
  requires_approval BOOLEAN,
  autopilot_allowed BOOLEAN,
  risk_level risk_level,
  constraints JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(p.requires_approval, true),
    COALESCE(p.autopilot_allowed, false),
    COALESCE(p.risk_level, 'medium'::risk_level),
    COALESCE(p.constraints, '{}'::jsonb)
  FROM public.policies p
  WHERE p.workspace_id = _workspace_id
    AND p.action_type = _action_type
    AND (p.site_id IS NULL OR p.site_id = _site_id)
  ORDER BY p.site_id NULLS LAST
  LIMIT 1;
$$;

-- 5) GET USER PERMISSIONS FUNCTION
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID, _workspace_id UUID, _site_id UUID DEFAULT NULL)
RETURNS TABLE(permission permission_action)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Workspace-level permissions
  SELECT DISTINCT rp.permission
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role
  WHERE ur.user_id = _user_id
    AND ur.workspace_id = _workspace_id
  UNION
  -- Site-level permissions
  SELECT DISTINCT rp.permission
  FROM public.site_roles sr
  JOIN public.role_permissions rp ON rp.role = sr.role
  WHERE sr.user_id = _user_id
    AND (_site_id IS NULL OR sr.site_id = _site_id);
$$;

-- 6) GET USER EFFECTIVE ROLE FUNCTION
CREATE OR REPLACE FUNCTION public.get_effective_role(_user_id UUID, _workspace_id UUID, _site_id UUID DEFAULT NULL)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    -- Site-specific role takes precedence
    (SELECT sr.role FROM public.site_roles sr WHERE sr.user_id = _user_id AND sr.site_id = _site_id),
    -- Fallback to workspace role
    (SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = _user_id AND ur.workspace_id = _workspace_id),
    'viewer'::app_role
  );
$$;

-- 7) AUDIT LOG INSERT FUNCTION (for edge functions)
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _workspace_id UUID,
  _entity_type TEXT,
  _entity_id UUID,
  _action TEXT,
  _actor_id UUID,
  _actor_type TEXT DEFAULT 'user',
  _changes JSONB DEFAULT '{}',
  _context JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _audit_id UUID;
BEGIN
  INSERT INTO public.audit_log (workspace_id, entity_type, entity_id, action, actor_id, actor_type, changes, context)
  VALUES (_workspace_id, _entity_type, _entity_id, _action, _actor_id, _actor_type, _changes, _context)
  RETURNING id INTO _audit_id;
  
  RETURN _audit_id;
END;
$$;

-- 8) POLICY EVENT LOG FUNCTION
CREATE OR REPLACE FUNCTION public.log_policy_event(
  _workspace_id UUID,
  _policy_id UUID,
  _action_type TEXT,
  _decision TEXT,
  _reason TEXT DEFAULT NULL,
  _context JSONB DEFAULT '{}',
  _user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _event_id UUID;
BEGIN
  INSERT INTO public.policy_events (workspace_id, policy_id, action_type, decision, reason, context, user_id)
  VALUES (_workspace_id, _policy_id, _action_type, _decision, _reason, _context, _user_id)
  RETURNING id INTO _event_id;
  
  RETURN _event_id;
END;
$$;

-- 9) IDEMPOTENCY CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.check_idempotency_key(_key TEXT)
RETURNS TABLE(exists_already BOOLEAN, job_id UUID, status TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    TRUE,
    cj.id,
    cj.status
  FROM public.creative_jobs cj
  WHERE cj.idempotency_key = _key
  LIMIT 1;
$$;