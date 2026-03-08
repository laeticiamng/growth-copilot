
-- P1 FIX: Recreate v_integration_health with SECURITY INVOKER (correct columns)
DROP VIEW IF EXISTS public.v_integration_health;
CREATE VIEW public.v_integration_health
WITH (security_invoker = true)
AS
SELECT 
  id, workspace_id, provider, status, 
  token_expires_at, last_sync_at,
  refresh_failure_count, last_auth_failure_at, created_at, updated_at
FROM public.integrations;

-- P1 FIX: Harden has_agency_access to require manager+ role
CREATE OR REPLACE FUNCTION public.has_agency_access(_user_id uuid, _client_workspace_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.agency_clients ac
    JOIN public.user_roles ur ON ur.workspace_id = ac.agency_workspace_id
    WHERE ac.client_workspace_id = _client_workspace_id
      AND ur.user_id = _user_id
      AND ur.role IN ('owner', 'admin', 'manager')
  )
$$;

-- P1 FIX: Restrict meta_capi_events SELECT to manager+
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'meta_capi_events_restrict_pii_read' AND tablename = 'meta_capi_events'
  ) THEN
    CREATE POLICY "meta_capi_events_restrict_pii_read"
    ON public.meta_capi_events
    AS RESTRICTIVE
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.workspace_id = meta_capi_events.workspace_id
          AND ur.role IN ('owner', 'admin', 'manager')
      )
    );
  END IF;
END $$;
