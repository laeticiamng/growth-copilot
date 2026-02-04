-- ============================================================================
-- Security Hardening Migration Part 5 - Complete remaining policies
-- ============================================================================

-- 10. Restrict deals to workspace members only (simplified - already protected via workspace_id)
DROP POLICY IF EXISTS "deals_restricted_select" ON public.deals;
DROP POLICY IF EXISTS "Workspace members can view deals" ON public.deals;
DROP POLICY IF EXISTS "deals_select" ON public.deals;

CREATE POLICY "deals_restricted_select"
ON public.deals
FOR SELECT
TO authenticated
USING (
  public.has_permission(auth.uid(), workspace_id, 'manage_team')
  OR
  public.has_permission(auth.uid(), workspace_id, 'view_analytics')
  OR
  public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 11. Restrict ai_requests to system administrators only
DROP POLICY IF EXISTS "ai_requests_restricted_select" ON public.ai_requests;
DROP POLICY IF EXISTS "Owners and admins can view AI requests" ON public.ai_requests;

CREATE POLICY "ai_requests_restricted_select"
ON public.ai_requests
FOR SELECT
TO authenticated
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 12. Restrict webhooks management to workspace owners
DROP POLICY IF EXISTS "webhooks_owner_only_select" ON public.webhooks;
DROP POLICY IF EXISTS "webhooks_owner_only_insert" ON public.webhooks;
DROP POLICY IF EXISTS "webhooks_owner_only_update" ON public.webhooks;
DROP POLICY IF EXISTS "webhooks_owner_only_delete" ON public.webhooks;
DROP POLICY IF EXISTS "Users can manage workspace webhooks" ON public.webhooks;

CREATE POLICY "webhooks_owner_only_select"
ON public.webhooks
FOR SELECT
TO authenticated
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

CREATE POLICY "webhooks_owner_only_insert"
ON public.webhooks
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

CREATE POLICY "webhooks_owner_only_update"
ON public.webhooks
FOR UPDATE
TO authenticated
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

CREATE POLICY "webhooks_owner_only_delete"
ON public.webhooks
FOR DELETE
TO authenticated
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);