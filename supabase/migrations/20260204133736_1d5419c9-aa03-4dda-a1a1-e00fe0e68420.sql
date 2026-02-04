-- Protect remaining system configuration tables from unauthenticated access

-- 1. role_permissions: Drop existing and recreate
DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON public.role_permissions;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view role permissions"
  ON public.role_permissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2. safe_zone_configs: Drop existing and recreate
DROP POLICY IF EXISTS "Authenticated users can view safe zone configs" ON public.safe_zone_configs;
ALTER TABLE public.safe_zone_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view safe zone configs"
  ON public.safe_zone_configs
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 3. services_catalog: Drop existing and recreate
DROP POLICY IF EXISTS "Authenticated users can view services catalog" ON public.services_catalog;
ALTER TABLE public.services_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view services catalog"
  ON public.services_catalog
  FOR SELECT
  USING (auth.uid() IS NOT NULL);