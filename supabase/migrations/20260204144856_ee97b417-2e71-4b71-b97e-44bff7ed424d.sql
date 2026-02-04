-- Security Hardening: Fix Critical RLS Issues (with proper cleanup)

-- Fix meta_conversations
DROP POLICY IF EXISTS "meta_conversations_restricted_select" ON public.meta_conversations;
CREATE POLICY "meta_conversations_restricted_select"
ON public.meta_conversations
FOR SELECT
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_team')
    OR public.is_workspace_owner(auth.uid(), workspace_id)
    OR public.has_workspace_role(auth.uid(), workspace_id, 'admin')
    OR public.has_workspace_role(auth.uid(), workspace_id, 'owner')
  )
);

-- Fix contracts
DROP POLICY IF EXISTS "contracts_billing_only_select" ON public.contracts;
CREATE POLICY "contracts_billing_only_select"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_billing')
    OR public.is_workspace_owner(auth.uid(), workspace_id)
    OR public.has_workspace_role(auth.uid(), workspace_id, 'admin')
  )
);

-- Fix role_permissions
DROP POLICY IF EXISTS "Authenticated users can read role_permissions" ON public.role_permissions;
CREATE POLICY "Authenticated users can read role_permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);