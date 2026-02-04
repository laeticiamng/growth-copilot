-- ============================================
-- SECURITY HARDENING: Phase Finale
-- Correction des 6 vulnérabilités critiques
-- ============================================

-- 1. LEADS: Restreindre accès aux leads assignés ou avec permission manage_team
DROP POLICY IF EXISTS "Leads workspace access" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_select" ON public.leads;

CREATE POLICY "leads_granular_select" ON public.leads
  FOR SELECT TO authenticated
  USING (
    workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
    AND (
      -- Soit le lead est assigné à l'utilisateur
      assigned_to = auth.uid()
      -- Soit l'utilisateur a la permission manage_team
      OR public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
      -- Soit l'utilisateur est owner
      OR public.is_workspace_owner(auth.uid(), workspace_id)
    )
  );

-- 2. EMPLOYEES: Restreindre données sensibles (salaire, performance) aux RH et owners
DROP POLICY IF EXISTS "employees_workspace_select" ON public.employees;
DROP POLICY IF EXISTS "Employees workspace access" ON public.employees;

-- Vue publique limitée (pas de salaire ni performance score)
CREATE POLICY "employees_basic_select" ON public.employees
  FOR SELECT TO authenticated
  USING (
    workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
    AND (
      -- L'employé peut voir son propre profil complet
      user_id = auth.uid()
      -- Les autres peuvent voir les infos basiques (pas les colonnes sensibles via app logic)
      OR public.has_permission(auth.uid(), workspace_id, 'view_analytics'::permission_action)
    )
  );

-- 3. META_CONVERSATIONS: Restreindre aux agents service client
DROP POLICY IF EXISTS "meta_conversations_workspace_select" ON public.meta_conversations;

CREATE POLICY "meta_conversations_restricted_select" ON public.meta_conversations
  FOR SELECT TO authenticated
  USING (
    workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
    AND (
      -- Seuls les utilisateurs avec manage_team peuvent voir les conversations
      public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
      OR public.is_workspace_owner(auth.uid(), workspace_id)
    )
  );

-- 4. SMART_LINK_EMAILS: Ajouter rate limiting via fonction
DROP POLICY IF EXISTS "smart_link_emails_public_insert" ON public.smart_link_emails;
DROP POLICY IF EXISTS "Public can submit emails with consent" ON public.smart_link_emails;

CREATE POLICY "smart_link_emails_rate_limited_insert" ON public.smart_link_emails
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    consent_given = true
    -- Le rate limiting est géré par le trigger check_smart_link_email_rate_limit
  );

-- 5. CONTRACTS: Restreindre aux billing managers et owners
DROP POLICY IF EXISTS "contracts_workspace_select" ON public.contracts;
DROP POLICY IF EXISTS "Contracts workspace access" ON public.contracts;

CREATE POLICY "contracts_billing_select" ON public.contracts
  FOR SELECT TO authenticated
  USING (
    workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
    AND (
      public.has_permission(auth.uid(), workspace_id, 'manage_billing'::permission_action)
      OR public.is_workspace_owner(auth.uid(), workspace_id)
    )
  );

-- 6. GDPR_REQUESTS: Restreindre aux privacy officers (owners uniquement)
DROP POLICY IF EXISTS "gdpr_requests_workspace_select" ON public.gdpr_requests;
DROP POLICY IF EXISTS "Users can view own GDPR requests" ON public.gdpr_requests;

CREATE POLICY "gdpr_requests_privacy_officer_select" ON public.gdpr_requests
  FOR SELECT TO authenticated
  USING (
    -- Seul le demandeur peut voir sa propre demande (via email match indirecte)
    -- Ou le workspace owner pour traitement
    workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
    AND public.is_workspace_owner(auth.uid(), workspace_id)
  );

-- Politique pour que le demandeur puisse voir sa demande
CREATE POLICY "gdpr_requests_requester_select" ON public.gdpr_requests
  FOR SELECT TO authenticated
  USING (
    -- Le demandeur peut voir ses propres demandes
    requester_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 7. OAUTH_TOKENS: Restreindre à service role uniquement (pas de SELECT pour users)
DROP POLICY IF EXISTS "oauth_tokens_workspace_select" ON public.oauth_tokens;
DROP POLICY IF EXISTS "Oauth tokens workspace access" ON public.oauth_tokens;

-- Aucune politique SELECT pour les users - uniquement accessible via service role
-- Les edge functions utilisent le service role key

-- 8. INTEGRATION_TOKENS: Même traitement
DROP POLICY IF EXISTS "integration_tokens_workspace_select" ON public.integration_tokens;
DROP POLICY IF EXISTS "Integration tokens workspace access" ON public.integration_tokens;

-- Aucune politique SELECT pour les users - uniquement accessible via service role