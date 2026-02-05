-- =====================================================
-- SECURITY HARDENING: Phase 2 - Corrected Policies
-- oauth_tokens uses integration_id, not workspace_id
-- =====================================================

-- 9. OAUTH_TOKENS: Owner only via integration relationship
DROP POLICY IF EXISTS "oauth_tokens_owner_only_v8" ON public.oauth_tokens;
DROP POLICY IF EXISTS "ot_select_owner" ON public.oauth_tokens;
DROP POLICY IF EXISTS "ot_insert_owner" ON public.oauth_tokens;
DROP POLICY IF EXISTS "ot_update_owner" ON public.oauth_tokens;
DROP POLICY IF EXISTS "ot_delete_owner" ON public.oauth_tokens;

CREATE POLICY "oauth_tokens_owner_strict" ON public.oauth_tokens
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations i 
      WHERE i.id = integration_id 
      AND public.is_workspace_owner(auth.uid(), i.workspace_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.integrations i 
      WHERE i.id = integration_id 
      AND public.is_workspace_owner(auth.uid(), i.workspace_id)
    )
  );

-- 10. INTEGRATION_TOKENS: Owner only
DROP POLICY IF EXISTS "it_select_owner" ON public.integration_tokens;
DROP POLICY IF EXISTS "it_insert_owner" ON public.integration_tokens;

CREATE POLICY "integration_tokens_owner_strict" ON public.integration_tokens
  FOR ALL
  USING (public.is_workspace_owner(auth.uid(), workspace_id))
  WITH CHECK (public.is_workspace_owner(auth.uid(), workspace_id));

-- 11. AI_REQUESTS: Owner/billing for cost data
DROP POLICY IF EXISTS "ai_requests_restricted_select_v13" ON public.ai_requests;

CREATE POLICY "ai_requests_owner_billing" ON public.ai_requests
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_workspace_owner(auth.uid(), workspace_id)
    OR public.has_billing_access(auth.uid(), workspace_id)
  );

-- 12. TIME_OFF_REQUESTS: Employee + HR only
DROP POLICY IF EXISTS "tor_select_own_or_hr" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_requests_employee" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_requests_hr" ON public.time_off_requests;

CREATE POLICY "time_off_employee_hr_only" ON public.time_off_requests
  FOR SELECT
  USING (
    auth.uid() = employee_id
    OR public.has_hr_access(auth.uid(), workspace_id)
  );

-- 13. NOTIFICATIONS: Category-based access
DROP POLICY IF EXISTS "notifications_user_v13" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_v13" ON public.notifications;

CREATE POLICY "notifications_strict_category" ON public.notifications
  FOR SELECT
  USING (
    auth.uid() = user_id
    AND (
      category NOT IN ('security', 'billing', 'compliance', 'hr')
      OR public.get_effective_role(auth.uid(), workspace_id, NULL) IN ('admin', 'owner')
    )
  );

-- 14. APPROVAL_QUEUE: Approvers + managers
DROP POLICY IF EXISTS "aq_sel_member" ON public.approval_queue;
DROP POLICY IF EXISTS "approval_queue_workspace" ON public.approval_queue;

CREATE POLICY "approval_queue_approvers" ON public.approval_queue
  FOR SELECT
  USING (
    public.has_permission(auth.uid(), workspace_id, 'approve_actions', site_id)
    OR public.get_effective_role(auth.uid(), workspace_id, NULL) IN ('manager', 'admin', 'owner')
  );

-- 15. CREATIVE_JOBS: Workspace managers only
DROP POLICY IF EXISTS "creative_jobs_workspace" ON public.creative_jobs;

CREATE POLICY "creative_jobs_mgr_only" ON public.creative_jobs
  FOR SELECT
  USING (
    public.get_effective_role(auth.uid(), workspace_id, NULL) IN ('manager', 'admin', 'owner')
  );

-- 16. EVIDENCE_BUNDLES: Managers/owners only
DROP POLICY IF EXISTS "evidence_bundles_workspace" ON public.evidence_bundles;

CREATE POLICY "evidence_bundles_owner_mgr" ON public.evidence_bundles
  FOR SELECT
  USING (
    public.get_effective_role(auth.uid(), workspace_id, NULL) IN ('manager', 'admin', 'owner')
  );

-- 17. EVIDENCE_SOURCES
DROP POLICY IF EXISTS "evidence_sources_workspace" ON public.evidence_sources;

CREATE POLICY "evidence_sources_owner_mgr" ON public.evidence_sources
  FOR SELECT
  USING (
    public.get_effective_role(auth.uid(), workspace_id, NULL) IN ('manager', 'admin', 'owner')
  );

-- 18. EVIDENCE_METRICS
DROP POLICY IF EXISTS "evidence_metrics_workspace" ON public.evidence_metrics;

CREATE POLICY "evidence_metrics_owner_mgr" ON public.evidence_metrics
  FOR SELECT
  USING (
    public.get_effective_role(auth.uid(), workspace_id, NULL) IN ('manager', 'admin', 'owner')
  );

-- 19. EVIDENCE_REASONING
DROP POLICY IF EXISTS "evidence_reasoning_workspace" ON public.evidence_reasoning;

CREATE POLICY "evidence_reasoning_owner_mgr" ON public.evidence_reasoning
  FOR SELECT
  USING (
    public.get_effective_role(auth.uid(), workspace_id, NULL) IN ('manager', 'admin', 'owner')
  );