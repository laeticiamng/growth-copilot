-- ================================================================
-- MIGRATION: Complete RLS hardening - DROP existing first
-- Date: 2026-02-05
-- ================================================================

-- INTEGRATION_TOKENS - Drop all existing then recreate
DROP POLICY IF EXISTS "integration_tokens_select_owner" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_insert_owner" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_update_owner" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_delete_owner" ON public.integration_tokens;

CREATE POLICY "it_select_owner"
  ON public.integration_tokens FOR SELECT
  TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

CREATE POLICY "it_insert_owner"
  ON public.integration_tokens FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_owner(auth.uid(), workspace_id));

CREATE POLICY "it_update_owner"
  ON public.integration_tokens FOR UPDATE
  TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

CREATE POLICY "it_delete_owner"
  ON public.integration_tokens FOR DELETE
  TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- TIME_OFF_REQUESTS - Drop all existing then recreate
DROP POLICY IF EXISTS "time_off_select_own_or_hr" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_insert_own" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_update_hr" ON public.time_off_requests;
DROP POLICY IF EXISTS "Users can view time off in their workspace" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_workspace_member" ON public.time_off_requests;

CREATE POLICY "tor_select_own_or_hr"
  ON public.time_off_requests FOR SELECT
  TO authenticated
  USING (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR public.has_hr_access(auth.uid(), workspace_id)
  );

CREATE POLICY "tor_insert_own"
  ON public.time_off_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR public.has_hr_access(auth.uid(), workspace_id)
  );

CREATE POLICY "tor_update_hr"
  ON public.time_off_requests FOR UPDATE
  TO authenticated
  USING (public.has_hr_access(auth.uid(), workspace_id));

-- DEALS - Drop and recreate
DROP POLICY IF EXISTS "deals_select_assigned_or_manager" ON public.deals;
DROP POLICY IF EXISTS "deals_insert_sales" ON public.deals;
DROP POLICY IF EXISTS "deals_update_assigned_or_manager" ON public.deals;
DROP POLICY IF EXISTS "deals_delete_manager" ON public.deals;
DROP POLICY IF EXISTS "Users can view deals in their workspace" ON public.deals;
DROP POLICY IF EXISTS "deals_workspace_member" ON public.deals;

CREATE POLICY "deals_sel_assigned_or_mgr"
  ON public.deals FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR public.has_sales_access(auth.uid(), workspace_id)
  );

CREATE POLICY "deals_ins_sales"
  ON public.deals FOR INSERT
  TO authenticated
  WITH CHECK (public.has_sales_access(auth.uid(), workspace_id));

CREATE POLICY "deals_upd_assigned_or_mgr"
  ON public.deals FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR public.has_sales_access(auth.uid(), workspace_id)
  );

CREATE POLICY "deals_del_mgr"
  ON public.deals FOR DELETE
  TO authenticated
  USING (public.has_sales_access(auth.uid(), workspace_id));

-- ACTIVITIES - Drop and recreate
DROP POLICY IF EXISTS "activities_select_own_or_assigned" ON public.activities;
DROP POLICY IF EXISTS "activities_insert_member" ON public.activities;
DROP POLICY IF EXISTS "activities_update_own" ON public.activities;
DROP POLICY IF EXISTS "activities_delete_own" ON public.activities;
DROP POLICY IF EXISTS "Users can view activities in their workspace" ON public.activities;
DROP POLICY IF EXISTS "activities_workspace_member" ON public.activities;

CREATE POLICY "act_sel_own_or_assigned"
  ON public.activities FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR assigned_to = auth.uid()
    OR public.has_sales_access(auth.uid(), workspace_id)
  );

CREATE POLICY "act_ins_member"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "act_upd_own"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.has_sales_access(auth.uid(), workspace_id)
  );

CREATE POLICY "act_del_own"
  ON public.activities FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.has_sales_access(auth.uid(), workspace_id)
  );

-- SYSTEM_LOGS - Drop and recreate
DROP POLICY IF EXISTS "system_logs_select_owner" ON public.system_logs;
DROP POLICY IF EXISTS "system_logs_insert_member" ON public.system_logs;
DROP POLICY IF EXISTS "Users can view system logs" ON public.system_logs;
DROP POLICY IF EXISTS "system_logs_workspace_member" ON public.system_logs;

CREATE POLICY "syslog_sel_owner"
  ON public.system_logs FOR SELECT
  TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

CREATE POLICY "syslog_ins_member"
  ON public.system_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

-- WORKSPACE_QUOTAS - Drop and recreate
DROP POLICY IF EXISTS "quotas_select_billing" ON public.workspace_quotas;
DROP POLICY IF EXISTS "quotas_update_owner" ON public.workspace_quotas;
DROP POLICY IF EXISTS "Users can view quotas" ON public.workspace_quotas;
DROP POLICY IF EXISTS "quotas_workspace_member" ON public.workspace_quotas;

CREATE POLICY "wq_sel_billing"
  ON public.workspace_quotas FOR SELECT
  TO authenticated
  USING (public.has_billing_access(auth.uid(), workspace_id));

CREATE POLICY "wq_upd_owner"
  ON public.workspace_quotas FOR UPDATE
  TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- META_CONVERSATIONS - Workspace members
DROP POLICY IF EXISTS "Users can view meta conversations" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_workspace_member" ON public.meta_conversations;

CREATE POLICY "mc_sel_member"
  ON public.meta_conversations FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "mc_ins_member"
  ON public.meta_conversations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "mc_upd_member"
  ON public.meta_conversations FOR UPDATE
  TO authenticated
  USING (public.is_workspace_member(auth.uid(), workspace_id));

-- META_MESSAGES - Workspace members
DROP POLICY IF EXISTS "Users can view meta messages" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages_workspace_member" ON public.meta_messages;

CREATE POLICY "mm_sel_member"
  ON public.meta_messages FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "mm_ins_member"
  ON public.meta_messages FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

-- SMART_LINK_EMAILS - Workspace + public insert for lead capture
DROP POLICY IF EXISTS "Users can view smart link emails" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_workspace_member" ON public.smart_link_emails;

CREATE POLICY "sle_sel_member"
  ON public.smart_link_emails FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "sle_ins_public"
  ON public.smart_link_emails FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- APPROVAL_QUEUE - Workspace members
DROP POLICY IF EXISTS "Users can view approvals in their workspace" ON public.approval_queue;
DROP POLICY IF EXISTS "approval_queue_workspace_member" ON public.approval_queue;

CREATE POLICY "aq_sel_member"
  ON public.approval_queue FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "aq_ins_member"
  ON public.approval_queue FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "aq_upd_reviewer"
  ON public.approval_queue FOR UPDATE
  TO authenticated
  USING (
    reviewed_by = auth.uid()
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  );

-- KPIS_DAILY - Workspace members (analytics)
DROP POLICY IF EXISTS "Users can view kpis in their workspace" ON public.kpis_daily;
DROP POLICY IF EXISTS "kpis_workspace_member" ON public.kpis_daily;

CREATE POLICY "kpi_sel_member"
  ON public.kpis_daily FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "kpi_ins_member"
  ON public.kpis_daily FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "kpi_upd_member"
  ON public.kpis_daily FOR UPDATE
  TO authenticated
  USING (public.is_workspace_member(auth.uid(), workspace_id));