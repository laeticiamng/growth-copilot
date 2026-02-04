-- Renforcement RLS tables avec workspace_id existant uniquement

-- 1. Smart Link Emails : accès marketing managers uniquement
DROP POLICY IF EXISTS "Workspace members can view smart link emails" ON public.smart_link_emails;
CREATE POLICY "Marketing managers can view email list"
ON public.smart_link_emails FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
    OR public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
  )
);

-- 2. Performance Reviews : accès HR + reviewer + reviewee uniquement
DROP POLICY IF EXISTS "Managers can view team performance reviews" ON public.performance_reviews;
CREATE POLICY "HR reviewer and reviewee can view performance reviews"
ON public.performance_reviews FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    reviewer_id = auth.uid()
    OR public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
  )
);

DROP POLICY IF EXISTS "Managers can manage performance reviews" ON public.performance_reviews;
CREATE POLICY "HR can manage performance reviews"
ON public.performance_reviews FOR ALL
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
)
WITH CHECK (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
);

-- 3. GDPR Requests : accès owners uniquement
DROP POLICY IF EXISTS "Team managers can view GDPR requests" ON public.gdpr_requests;
CREATE POLICY "Privacy officers only can view GDPR requests"
ON public.gdpr_requests FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
);

DROP POLICY IF EXISTS "Team managers can manage GDPR requests" ON public.gdpr_requests;
CREATE POLICY "Owners only can manage GDPR requests"
ON public.gdpr_requests FOR ALL
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
)
WITH CHECK (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
);

-- 4. Integration Tokens : accès owner uniquement
DROP POLICY IF EXISTS "Owners can view integration tokens" ON public.integration_tokens;
CREATE POLICY "Only owners can view integration tokens"
ON public.integration_tokens FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND public.is_workspace_owner(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "Owners can manage integration tokens" ON public.integration_tokens;
CREATE POLICY "Only owners can manage integration tokens"
ON public.integration_tokens FOR ALL
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND public.is_workspace_owner(auth.uid(), workspace_id)
)
WITH CHECK (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND public.is_workspace_owner(auth.uid(), workspace_id)
);