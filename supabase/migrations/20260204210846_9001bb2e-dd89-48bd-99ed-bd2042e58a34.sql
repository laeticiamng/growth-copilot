-- MIGRATION V11: Final view security fix
DROP VIEW IF EXISTS public.v_integration_health;

CREATE OR REPLACE VIEW public.v_integration_health 
WITH (security_invoker = true) AS
SELECT i.id, i.workspace_id, i.provider, i.status, i.expires_at, i.last_sync_at,
  i.refresh_failure_count, i.last_auth_failure_at,
  CASE 
    WHEN i.status::text = 'active' AND (i.expires_at IS NULL OR i.expires_at > NOW()) THEN 'healthy'
    WHEN i.refresh_failure_count > 3 THEN 'critical'
    ELSE 'unknown'
  END AS health_status
FROM public.integrations i
WHERE i.workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()));

DROP POLICY IF EXISTS "policy_profiles_final_v9" ON public.policy_profiles;
CREATE POLICY "policy_profiles_v11" ON public.policy_profiles FOR SELECT TO authenticated
USING (is_system_preset = true OR public.is_workspace_member(auth.uid(), workspace_id));