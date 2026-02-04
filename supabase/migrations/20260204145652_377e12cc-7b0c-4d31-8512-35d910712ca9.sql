-- Security Hardening: Fix remaining critical RLS issues (v4 - correct app_role enum)

-- 1. Fix role_permissions - restrict to authenticated only
DROP POLICY IF EXISTS "Public can view role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Authenticated users can read role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Only authenticated users can read role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_authenticated_only" ON public.role_permissions;
CREATE POLICY "role_permissions_auth_read"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

-- 2. Fix platform_policies - restrict to authenticated workspace members
ALTER TABLE public.platform_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read policies" ON public.platform_policies;
DROP POLICY IF EXISTS "platform_policies_authenticated_read" ON public.platform_policies;
DROP POLICY IF EXISTS "platform_policies_auth_only" ON public.platform_policies;
CREATE POLICY "platform_policies_auth_read"
ON public.platform_policies
FOR SELECT
TO authenticated
USING (true);

-- 3. Fix safe_zone_configs - restrict to authenticated users
ALTER TABLE public.safe_zone_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "safe_zone_configs_authenticated_read" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "safe_zone_configs_auth_only" ON public.safe_zone_configs;
CREATE POLICY "safe_zone_configs_auth_read"
ON public.safe_zone_configs
FOR SELECT
TO authenticated
USING (true);

-- 4. Harden employees table with more restrictive policies
DROP POLICY IF EXISTS "employees_hr_select" ON public.employees;
DROP POLICY IF EXISTS "Workspace members can read employees" ON public.employees;
DROP POLICY IF EXISTS "employees_restricted_select" ON public.employees;
DROP POLICY IF EXISTS "employees_restricted_access" ON public.employees;
CREATE POLICY "employees_hardened_select"
ON public.employees
FOR SELECT
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    public.is_workspace_owner(auth.uid(), workspace_id)
    OR public.has_workspace_role(auth.uid(), workspace_id, 'admin')
    OR public.has_workspace_role(auth.uid(), workspace_id, 'manager')
    OR public.has_permission(auth.uid(), workspace_id, 'manage_team')
    OR user_id = auth.uid()
  )
);

-- 5. Harden leads table with proper permission check  
DROP POLICY IF EXISTS "leads_restricted_select" ON public.leads;
DROP POLICY IF EXISTS "Workspace members can read leads" ON public.leads;
DROP POLICY IF EXISTS "leads_restricted_access" ON public.leads;
CREATE POLICY "leads_hardened_select"
ON public.leads
FOR SELECT
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    public.is_workspace_owner(auth.uid(), workspace_id)
    OR public.has_workspace_role(auth.uid(), workspace_id, 'admin')
    OR public.has_workspace_role(auth.uid(), workspace_id, 'manager')
    OR public.has_workspace_role(auth.uid(), workspace_id, 'member')
    OR assigned_to = auth.uid()
  )
);