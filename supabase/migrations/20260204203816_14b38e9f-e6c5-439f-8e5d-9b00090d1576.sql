-- =====================================================
-- RLS POLICY CONSOLIDATION - SECURITY HARDENING v5 (FINAL)
-- Résolution des 13 findings critiques
-- Date: 2026-02-04
-- =====================================================

-- 1. oauth_tokens - Consolider pour owner uniquement
DROP POLICY IF EXISTS "authenticated_oauth_tokens_access" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_workspace_access" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_select" ON public.oauth_tokens;

CREATE POLICY "oauth_tokens_owner_only_v5" ON public.oauth_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.integrations i
      JOIN public.workspaces w ON w.id = i.workspace_id
      WHERE i.id = oauth_tokens.integration_id 
        AND w.owner_id = auth.uid()
    )
  );

-- 2. integration_tokens - Consolider pour owner uniquement
DROP POLICY IF EXISTS "authenticated_integration_tokens_access" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_workspace_access" ON public.integration_tokens;

CREATE POLICY "integration_tokens_owner_only_v5" ON public.integration_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = integration_tokens.workspace_id
        AND w.owner_id = auth.uid()
    )
  );

-- 3. employees - Restreindre à HR/Admin/Self uniquement
DROP POLICY IF EXISTS "authenticated_employees_access" ON public.employees;
DROP POLICY IF EXISTS "employees_basic_select" ON public.employees;
DROP POLICY IF EXISTS "employees_workspace_access" ON public.employees;

CREATE POLICY "employees_hr_admin_self_v5" ON public.employees
  FOR ALL USING (
    (employees.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = employees.workspace_id
        AND ur.role IN ('owner', 'admin')
    )
    OR public.has_permission(auth.uid(), employees.workspace_id, 'manage_team')
  );

-- 4. leads - Restreindre à l'assigné ou manager
DROP POLICY IF EXISTS "authenticated_leads_access" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_access" ON public.leads;

CREATE POLICY "leads_assigned_or_manager_v5" ON public.leads
  FOR ALL USING (
    leads.assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = leads.workspace_id
        AND ur.role IN ('owner', 'admin', 'manager')
    )
  );

-- 5. deals - Restreindre à l'assigné ou manager
DROP POLICY IF EXISTS "authenticated_deals_access" ON public.deals;
DROP POLICY IF EXISTS "deals_workspace_access" ON public.deals;

CREATE POLICY "deals_assigned_or_manager_v5" ON public.deals
  FOR ALL USING (
    deals.assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = deals.workspace_id
        AND ur.role IN ('owner', 'admin', 'manager')
    )
  );

-- 6. contracts - Restreindre à Billing/Owner
DROP POLICY IF EXISTS "authenticated_contracts_access" ON public.contracts;
DROP POLICY IF EXISTS "contracts_workspace_access" ON public.contracts;

CREATE POLICY "contracts_billing_owner_v5" ON public.contracts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = contracts.workspace_id
        AND ur.role IN ('owner', 'admin')
    )
    OR public.has_permission(auth.uid(), contracts.workspace_id, 'manage_billing')
  );

-- 7. performance_reviews - HR/Reviewer/Self uniquement
DROP POLICY IF EXISTS "authenticated_performance_reviews_access" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_workspace_access" ON public.performance_reviews;

CREATE POLICY "performance_reviews_restricted_v5" ON public.performance_reviews
  FOR ALL USING (
    performance_reviews.employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
    OR performance_reviews.reviewer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = performance_reviews.workspace_id
        AND ur.role IN ('owner', 'admin')
    )
    OR public.has_permission(auth.uid(), performance_reviews.workspace_id, 'manage_team')
  );

-- 8. gdpr_requests - Privacy Officer/Owner uniquement
DROP POLICY IF EXISTS "authenticated_gdpr_requests_access" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_workspace_access" ON public.gdpr_requests;

CREATE POLICY "gdpr_requests_privacy_officer_v5" ON public.gdpr_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = gdpr_requests.requester_email)
    OR EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = gdpr_requests.workspace_id
        AND w.owner_id = auth.uid()
    )
    OR public.has_permission(auth.uid(), gdpr_requests.workspace_id, 'manage_policies')
  );

-- 9. meta_conversations - Membres du workspace
DROP POLICY IF EXISTS "authenticated_meta_conversations_access" ON public.meta_conversations;

CREATE POLICY "meta_conversations_workspace_v5" ON public.meta_conversations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = meta_conversations.workspace_id
    )
  );

-- 10. meta_messages - Membres du workspace
DROP POLICY IF EXISTS "authenticated_meta_messages_access" ON public.meta_messages;

CREATE POLICY "meta_messages_workspace_v5" ON public.meta_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meta_conversations mc
      JOIN public.user_roles ur ON ur.workspace_id = mc.workspace_id
      WHERE mc.id = meta_messages.conversation_id
        AND ur.user_id = auth.uid()
    )
  );

-- 11. smart_link_emails - Marketing managers (via workspace_id direct)
DROP POLICY IF EXISTS "authenticated_smart_link_emails_select" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_workspace_select" ON public.smart_link_emails;

CREATE POLICY "smart_link_emails_marketing_v5" ON public.smart_link_emails
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.workspace_id = smart_link_emails.workspace_id
        AND ur.user_id = auth.uid()
        AND ur.role IN ('owner', 'admin', 'manager')
    )
  );

-- 12. ai_requests - Créateur ou Owner uniquement
DROP POLICY IF EXISTS "ai_requests_select" ON public.ai_requests;
DROP POLICY IF EXISTS "authenticated_ai_requests_access" ON public.ai_requests;

CREATE POLICY "ai_requests_creator_or_owner_v5" ON public.ai_requests
  FOR ALL USING (
    ai_requests.user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = ai_requests.workspace_id
        AND w.owner_id = auth.uid()
    )
    OR public.has_permission(auth.uid(), ai_requests.workspace_id, 'manage_billing')
  );

-- 13. Notifications - Restreindre les catégories sensibles
DROP POLICY IF EXISTS "notifications_workspace_access" ON public.notifications;

CREATE POLICY "notifications_restricted_v5" ON public.notifications
  FOR SELECT USING (
    notifications.user_id = auth.uid()
    OR (
      notifications.user_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.workspace_id = notifications.workspace_id
      )
      AND (notifications.category IS NULL OR notifications.category NOT IN ('security', 'billing', 'compliance'))
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = notifications.workspace_id
        AND ur.role IN ('owner', 'admin')
    )
  );

-- 14. creative_jobs - Accès manager/owner seulement pour jobs non terminés
DROP POLICY IF EXISTS "creative_jobs_status_based_access" ON public.creative_jobs;

CREATE POLICY "creative_jobs_approval_v5" ON public.creative_jobs
  FOR SELECT USING (
    -- Jobs terminés/publiés pour tous les membres du workspace
    (creative_jobs.status IN ('done', 'published') 
      AND EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.workspace_id = creative_jobs.workspace_id
      )
    )
    OR
    -- Accès complet pour managers
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.workspace_id = creative_jobs.workspace_id
        AND ur.role IN ('owner', 'admin', 'manager')
    )
  );