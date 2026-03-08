
-- P0 FIX: Remove overly permissive contact_submissions policies
-- These policies allowed ANY workspace admin to access ALL contact submissions
DROP POLICY IF EXISTS "contact_submissions_admin_read" ON public.contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_admin_update" ON public.contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_admin_delete" ON public.contact_submissions;

-- Replace with a platform-owner-only policy using a hardcoded check
-- Only the platform owner (workspace 11111111-1111-1111-1111-111111111111 owner) can manage submissions
CREATE POLICY "contact_submissions_platform_admin_read"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = '11111111-1111-1111-1111-111111111111'
      AND w.owner_id = auth.uid()
  )
);

CREATE POLICY "contact_submissions_platform_admin_update"
ON public.contact_submissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = '11111111-1111-1111-1111-111111111111'
      AND w.owner_id = auth.uid()
  )
);

CREATE POLICY "contact_submissions_platform_admin_delete"
ON public.contact_submissions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = '11111111-1111-1111-1111-111111111111'
      AND w.owner_id = auth.uid()
  )
);

-- P1 FIX: Update get_user_workspace_ids to respect agency_role
-- Agency viewers should NOT get full client workspace access
CREATE OR REPLACE FUNCTION public.get_user_workspace_ids(_user_id uuid)
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $$
  -- Direct access
  SELECT workspace_id FROM public.user_roles WHERE user_id = _user_id
  UNION
  -- Agency access - only for agency members with manager/admin/owner roles
  SELECT ac.client_workspace_id 
  FROM public.agency_clients ac
  JOIN public.user_roles ur ON ur.workspace_id = ac.agency_workspace_id
  WHERE ur.user_id = _user_id
    AND ur.role IN ('owner', 'admin', 'manager')
$$;
