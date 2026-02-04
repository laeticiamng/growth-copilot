-- Fix security findings: Restrict public access to configuration tables

-- 1. role_permissions: Only authenticated users can read
DROP POLICY IF EXISTS "Authenticated users can read role permissions" ON public.role_permissions;
CREATE POLICY "Authenticated users can read role permissions"
  ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. safe_zone_configs: Only authenticated users can read  
DROP POLICY IF EXISTS "Authenticated users can read safe zone configs" ON public.safe_zone_configs;
CREATE POLICY "Authenticated users can read safe zone configs"
  ON public.safe_zone_configs
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. services_catalog: Only authenticated users can read
DROP POLICY IF EXISTS "Authenticated users can read services catalog" ON public.services_catalog;
CREATE POLICY "Authenticated users can read services catalog"
  ON public.services_catalog
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. platform_policies: Only authenticated users can read
DROP POLICY IF EXISTS "Authenticated users can read platform policies" ON public.platform_policies;
CREATE POLICY "Authenticated users can read platform policies"
  ON public.platform_policies
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. policy_profiles: Only authenticated users can read
DROP POLICY IF EXISTS "Authenticated users can read policy profiles" ON public.policy_profiles;
CREATE POLICY "Authenticated users can read policy profiles"
  ON public.policy_profiles
  FOR SELECT
  TO authenticated
  USING (true);