-- Security Hardening Step 1: Basic policies
-- employees: Restrict to HR managers + own record
DROP POLICY IF EXISTS "Users can view employees in their workspace" ON public.employees;
CREATE POLICY "HR can view employees in their workspace"
ON public.employees FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
    OR user_id = auth.uid()
  )
);