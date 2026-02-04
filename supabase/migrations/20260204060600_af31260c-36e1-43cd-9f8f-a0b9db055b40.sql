-- platform_policies: system-wide platform rules (no workspace_id)
-- These are platform-level policies, not user data - restrict to authenticated only
ALTER TABLE public.platform_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view platform policies"
ON public.platform_policies FOR SELECT
TO authenticated
USING (true);

-- No INSERT/UPDATE/DELETE for regular users - admin only via service role

-- safe_zone_configs: creative format reference data (no workspace_id)
-- Read-only reference data for all authenticated users
ALTER TABLE public.safe_zone_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view safe zone configs"
ON public.safe_zone_configs FOR SELECT
TO authenticated
USING (true);

-- role_permissions: RBAC reference table (no workspace_id)
-- Must be readable by auth system to check permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view role permissions"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);