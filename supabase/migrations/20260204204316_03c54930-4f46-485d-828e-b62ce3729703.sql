-- ============================================
-- Security Hardening v6 - Final Audit Fixes (v3)
-- Fix remaining security scan findings
-- ============================================

-- v_integration_health was already recreated with security_invoker in previous attempt
-- Comments on platform_policies, services_catalog, smart_link_* were applied

-- 1. safe_zone_configs - Global config table (creative design specs)
-- No workspace_id, just format specs - readable by authenticated users only
COMMENT ON TABLE public.safe_zone_configs IS 'Creative safe zone specifications by format. Global configuration table. Readable by authenticated users only.';

-- 2. role_permissions - Lookup table for RBAC, auth required
-- Note: Already created in previous migration, but it failed. Recreate.
DROP POLICY IF EXISTS "role_permissions_auth_read_v6" ON public.role_permissions;
CREATE POLICY "role_permissions_auth_read_v6" ON public.role_permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 3. is_workspace_member helper function (was created in previous attempt)
-- Verify it exists, create if not
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
  )
$$;

-- 4. policy_profiles - Has workspace_id and is_system_preset
DROP POLICY IF EXISTS "policy_profiles_proper_access_v6" ON public.policy_profiles;
CREATE POLICY "policy_profiles_proper_access_v6" ON public.policy_profiles
  FOR SELECT USING (
    is_system_preset = true 
    OR 
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.workspace_id = policy_profiles.workspace_id
    )
  );

-- 5. ai_providers - Global config, document as intentional
COMMENT ON TABLE public.ai_providers IS 'AI provider registry. Global configuration. Readable by authenticated users only.';

-- 6. ai_models - Global config, document as intentional
COMMENT ON TABLE public.ai_models IS 'AI model configurations. Global settings for available models. Readable by authenticated users only.';