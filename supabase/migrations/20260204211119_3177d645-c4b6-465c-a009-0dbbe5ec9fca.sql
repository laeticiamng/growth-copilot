-- =====================================================
-- MIGRATION v12: Final Security Hardening
-- Restrict configuration tables to authenticated users only
-- =====================================================

-- 1. policy_profiles: Remove public access, add authenticated-only
DROP POLICY IF EXISTS "policy_profiles_public_read" ON public.policy_profiles;
DROP POLICY IF EXISTS "policy_profiles_select_v7" ON public.policy_profiles;
DROP POLICY IF EXISTS "Anyone can view policy profiles" ON public.policy_profiles;

CREATE POLICY "policy_profiles_authenticated_only_v12" ON public.policy_profiles
FOR SELECT TO authenticated
USING (
  is_system_preset = true 
  OR workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
);

-- 2. platform_policies: Remove public access
DROP POLICY IF EXISTS "platform_policies_public_read" ON public.platform_policies;
DROP POLICY IF EXISTS "platform_policies_select_v7" ON public.platform_policies;
DROP POLICY IF EXISTS "Anyone can view platform policies" ON public.platform_policies;

CREATE POLICY "platform_policies_authenticated_only_v12" ON public.platform_policies
FOR SELECT TO authenticated
USING (true);

-- 3. safe_zone_configs: Remove public access
DROP POLICY IF EXISTS "safe_zone_configs_public_read" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "safe_zone_configs_select_v7" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "Anyone can view safe zone configs" ON public.safe_zone_configs;

CREATE POLICY "safe_zone_configs_authenticated_only_v12" ON public.safe_zone_configs
FOR SELECT TO authenticated
USING (true);

-- 4. role_permissions: Remove public access (critical security fix)
DROP POLICY IF EXISTS "role_permissions_public_read" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_select_v7" ON public.role_permissions;
DROP POLICY IF EXISTS "Anyone can view role permissions" ON public.role_permissions;

CREATE POLICY "role_permissions_authenticated_only_v12" ON public.role_permissions
FOR SELECT TO authenticated
USING (true);

-- 5. ai_models: Remove public access
DROP POLICY IF EXISTS "ai_models_public_read" ON public.ai_models;
DROP POLICY IF EXISTS "ai_models_select_v7" ON public.ai_models;
DROP POLICY IF EXISTS "Anyone can view AI models" ON public.ai_models;

CREATE POLICY "ai_models_authenticated_only_v12" ON public.ai_models
FOR SELECT TO authenticated
USING (true);

-- 6. ai_providers: Remove public access
DROP POLICY IF EXISTS "ai_providers_public_read" ON public.ai_providers;
DROP POLICY IF EXISTS "ai_providers_select_v7" ON public.ai_providers;
DROP POLICY IF EXISTS "Anyone can view AI providers" ON public.ai_providers;

CREATE POLICY "ai_providers_authenticated_only_v12" ON public.ai_providers
FOR SELECT TO authenticated
USING (true);

-- 7. oauth_state_nonces: Fix conflicting policies (remove permissive one)
DROP POLICY IF EXISTS "oauth_nonces_service_role_only" ON public.oauth_state_nonces;
DROP POLICY IF EXISTS "oauth_nonces_no_public_access" ON public.oauth_state_nonces;

-- Ensure only edge functions can access nonces (deny all user access)
CREATE POLICY "oauth_nonces_deny_all_v12" ON public.oauth_state_nonces
FOR ALL TO authenticated
USING (false)
WITH CHECK (false);

-- 8. system_logs: Ensure proper workspace filtering
DROP POLICY IF EXISTS "system_logs_workspace_members_v7" ON public.system_logs;
DROP POLICY IF EXISTS "system_logs_workspace_only" ON public.system_logs;

CREATE POLICY "system_logs_workspace_members_v12" ON public.system_logs
FOR SELECT TO authenticated
USING (
  workspace_id IS NOT NULL 
  AND workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
);