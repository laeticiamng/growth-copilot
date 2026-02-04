-- Security Hardening Step 4: system_logs, team_invitations, anonymization

-- system_logs: Owners only
DROP POLICY IF EXISTS "Users can view system logs" ON public.system_logs;
CREATE POLICY "Owners can view system logs"
ON public.system_logs FOR SELECT
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

-- team_invitations: Own invitations + admins
DROP POLICY IF EXISTS "Users can view their pending invitations" ON public.team_invitations;
CREATE POLICY "Users can view their own pending invitations"
ON public.team_invitations FOR SELECT
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = email
  AND status = 'pending'
);

DROP POLICY IF EXISTS "Admins can view workspace invitations" ON public.team_invitations;
CREATE POLICY "Admins can view workspace invitations"
ON public.team_invitations FOR SELECT
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
  OR invited_by = auth.uid()
);

-- Anonymize old click data function
CREATE OR REPLACE FUNCTION public.anonymize_old_click_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.smart_link_clicks
  SET ip_hash = 'anonymized',
      user_agent = 'anonymized'
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND ip_hash != 'anonymized';
END;
$$;

-- Remove direct insert on audit_log if exists
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_log;