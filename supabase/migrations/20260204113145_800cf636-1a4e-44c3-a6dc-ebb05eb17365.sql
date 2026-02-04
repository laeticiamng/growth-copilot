-- =============================================================
-- SECURITY FIXES: RLS Policy Corrections (verified table structures)
-- =============================================================

-- 6. FIX: leads - Add assignment-based access (has workspace_id)
DROP POLICY IF EXISTS "Workspace members can view leads" ON public.leads;
CREATE POLICY "Workspace members can view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND
  (
    public.has_permission(auth.uid(), workspace_id, 'view_analytics') OR
    assigned_to = auth.uid() OR
    assigned_to IS NULL
  )
);

-- 7. FIX: contracts - Restrict to finance/legal roles (has workspace_id)
DROP POLICY IF EXISTS "Workspace members can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authorized roles can view contracts" ON public.contracts;
CREATE POLICY "Authorized roles can view contracts"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND
  (
    public.has_permission(auth.uid(), workspace_id, 'manage_billing') OR
    public.has_permission(auth.uid(), workspace_id, 'view_analytics')
  )
);

-- 8. FIX: performance_reviews - Employees see only their own (has workspace_id)
DROP POLICY IF EXISTS "Workspace members can view performance reviews" ON public.performance_reviews;
DROP POLICY IF EXISTS "Authorized access to performance reviews" ON public.performance_reviews;
CREATE POLICY "Authorized access to performance reviews"
ON public.performance_reviews
FOR SELECT
TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND
  (
    public.has_permission(auth.uid(), workspace_id, 'manage_team') OR
    EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.id = employee_id 
      AND e.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

-- 9. FIX: gdpr_requests - Requesters see only their own (has workspace_id)
DROP POLICY IF EXISTS "Workspace members can view GDPR requests" ON public.gdpr_requests;
DROP POLICY IF EXISTS "Authorized access to GDPR requests" ON public.gdpr_requests;
CREATE POLICY "Authorized access to GDPR requests"
ON public.gdpr_requests
FOR SELECT
TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND
  (
    public.has_permission(auth.uid(), workspace_id, 'manage_team') OR
    requester_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- 10. FIX: oauth_tokens - Restrict via integration (joins to integrations.workspace_id)
DROP POLICY IF EXISTS "Owners and admins can manage tokens" ON public.oauth_tokens;
DROP POLICY IF EXISTS "Owners can manage OAuth tokens" ON public.oauth_tokens;
CREATE POLICY "Owners can manage OAuth tokens"
ON public.oauth_tokens
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.integrations i 
    WHERE i.id = integration_id 
    AND public.is_workspace_owner(auth.uid(), i.workspace_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.integrations i 
    WHERE i.id = integration_id 
    AND public.is_workspace_owner(auth.uid(), i.workspace_id)
  )
);