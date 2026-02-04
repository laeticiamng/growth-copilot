-- Supprimer toutes les policies qui permettent l'accès public/anon aux tables de configuration

-- platform_policies: supprimer les policies avec roles {public}
DROP POLICY IF EXISTS "platform_policies_read" ON public.platform_policies;
DROP POLICY IF EXISTS "Authenticated users can view platform policies" ON public.platform_policies;
DROP POLICY IF EXISTS "platform_policies_auth_read" ON public.platform_policies;
DROP POLICY IF EXISTS "platform_policies_authenticated_select" ON public.platform_policies;

-- role_permissions: supprimer les policies avec roles {public}
DROP POLICY IF EXISTS "role_permissions_read" ON public.role_permissions;
DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_auth_read" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_authenticated_select" ON public.role_permissions;

-- safe_zone_configs: supprimer les policies avec roles {public}
DROP POLICY IF EXISTS "safe_zones_read" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "Authenticated users can view safe zone configs" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "safe_zone_configs_auth_read" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "safe_zone_configs_authenticated_select" ON public.safe_zone_configs;

-- services_catalog: garder uniquement pour les utilisateurs auth (intentionnel pour marketing)
DROP POLICY IF EXISTS "Anyone can read services catalog" ON public.services_catalog;
DROP POLICY IF EXISTS "Authenticated users can view services catalog" ON public.services_catalog;
DROP POLICY IF EXISTS "services_catalog_authenticated_select" ON public.services_catalog;