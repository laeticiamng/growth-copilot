-- ============================================
-- SECURITY HARDENING: Tables de Configuration Système
-- Protéger les tables exposées publiquement
-- ============================================

-- 1. SERVICES_CATALOG: Restreindre aux utilisateurs authentifiés
ALTER TABLE public.services_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_catalog_public_select" ON public.services_catalog;
DROP POLICY IF EXISTS "Services catalog public read" ON public.services_catalog;

CREATE POLICY "services_catalog_authenticated_select" ON public.services_catalog
  FOR SELECT TO authenticated
  USING (true);

-- 2. PLATFORM_POLICIES: Restreindre aux utilisateurs authentifiés
ALTER TABLE public.platform_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_policies_public_select" ON public.platform_policies;
DROP POLICY IF EXISTS "Platform policies public read" ON public.platform_policies;

CREATE POLICY "platform_policies_authenticated_select" ON public.platform_policies
  FOR SELECT TO authenticated
  USING (true);

-- 3. SAFE_ZONE_CONFIGS: Restreindre aux utilisateurs authentifiés
ALTER TABLE public.safe_zone_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "safe_zone_configs_public_select" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "Safe zone configs public read" ON public.safe_zone_configs;

CREATE POLICY "safe_zone_configs_authenticated_select" ON public.safe_zone_configs
  FOR SELECT TO authenticated
  USING (true);

-- 4. ROLE_PERMISSIONS: Restreindre aux utilisateurs authentifiés
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "role_permissions_public_select" ON public.role_permissions;
DROP POLICY IF EXISTS "Role permissions public read" ON public.role_permissions;

CREATE POLICY "role_permissions_authenticated_select" ON public.role_permissions
  FOR SELECT TO authenticated
  USING (true);