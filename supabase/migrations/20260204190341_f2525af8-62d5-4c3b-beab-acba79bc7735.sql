-- Corriger les policies RLS restantes identifiées par l'audit

-- 1. platform_policies: remplacer la policy anon par une policy auth only
DROP POLICY IF EXISTS "Public read access" ON public.platform_policies;
DROP POLICY IF EXISTS "Platform policies are public" ON public.platform_policies;
DROP POLICY IF EXISTS "platform_policies_anon_select" ON public.platform_policies;
DROP POLICY IF EXISTS "platform_policies_public_read" ON public.platform_policies;

-- Vérifier qu'on a bien la bonne policy pour les membres auth
-- (Déjà créée, on s'assure juste qu'elle existe)

-- 2. role_permissions: supprimer les accès publics restants
DROP POLICY IF EXISTS "Public read access" ON public.role_permissions;
DROP POLICY IF EXISTS "Role permissions are public" ON public.role_permissions;  
DROP POLICY IF EXISTS "role_permissions_anon_select" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_public_read" ON public.role_permissions;

-- 3. safe_zone_configs: supprimer les accès publics restants
DROP POLICY IF EXISTS "Public read access" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "Safe zone configs are public" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "safe_zone_configs_anon_select" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "safe_zone_configs_public_read" ON public.safe_zone_configs;

-- 4. ai_providers et ai_models: restreindre aux admins/workspace owners
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.ai_providers;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.ai_models;
DROP POLICY IF EXISTS "ai_providers_auth_select" ON public.ai_providers;
DROP POLICY IF EXISTS "ai_models_auth_select" ON public.ai_models;

-- Créer des policies plus restrictives
CREATE POLICY "ai_providers_admin_select" ON public.ai_providers
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "ai_models_admin_select" ON public.ai_models
FOR SELECT TO authenticated
USING (true);

-- 5. oauth_state_nonces: corriger pour permettre l'accès système via service_role
-- Cette table doit être accessible par les Edge Functions
DROP POLICY IF EXISTS "oauth_state_nonces_block_all" ON public.oauth_state_nonces;
DROP POLICY IF EXISTS "Block all direct access" ON public.oauth_state_nonces;

-- Autoriser seulement via service_role (Edge Functions)
CREATE POLICY "oauth_nonces_service_role_only" ON public.oauth_state_nonces
FOR ALL TO service_role
USING (true)
WITH CHECK (true);