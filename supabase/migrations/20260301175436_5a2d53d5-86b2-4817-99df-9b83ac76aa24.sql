
-- ============================================================
-- RLS CONSOLIDATION: Drop 113 redundant policies, replace with
-- clean 4-per-table structure on 15 tables.
-- oauth_tokens is SKIPPED (already consolidated).
-- ============================================================

-- ===================== EMPLOYEES =====================
DROP POLICY IF EXISTS "employees_select" ON public.employees;
DROP POLICY IF EXISTS "employees_insert" ON public.employees;
DROP POLICY IF EXISTS "employees_update" ON public.employees;
DROP POLICY IF EXISTS "employees_delete" ON public.employees;
DROP POLICY IF EXISTS "Employees are viewable by workspace members" ON public.employees;
DROP POLICY IF EXISTS "Employees can be created by HR" ON public.employees;
DROP POLICY IF EXISTS "Employees can be updated by HR" ON public.employees;
DROP POLICY IF EXISTS "Employees can be deleted by HR" ON public.employees;
DROP POLICY IF EXISTS "employees_select_workspace" ON public.employees;
DROP POLICY IF EXISTS "employees_insert_hr" ON public.employees;
DROP POLICY IF EXISTS "employees_update_hr" ON public.employees;
DROP POLICY IF EXISTS "employees_delete_hr" ON public.employees;
DROP POLICY IF EXISTS "employees_select_v2" ON public.employees;
DROP POLICY IF EXISTS "employees_insert_v2" ON public.employees;
DROP POLICY IF EXISTS "employees_update_v2" ON public.employees;
DROP POLICY IF EXISTS "employees_delete_v2" ON public.employees;

CREATE POLICY "employees_select" ON public.employees FOR SELECT TO authenticated
  USING (
    public.has_hr_access(auth.uid(), workspace_id)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
    OR user_id = auth.uid()
  );
CREATE POLICY "employees_insert" ON public.employees FOR INSERT TO authenticated
  WITH CHECK (public.has_hr_access(auth.uid(), workspace_id));
CREATE POLICY "employees_update" ON public.employees FOR UPDATE TO authenticated
  USING (public.has_hr_access(auth.uid(), workspace_id));
CREATE POLICY "employees_delete" ON public.employees FOR DELETE TO authenticated
  USING (public.has_hr_access(auth.uid(), workspace_id));

-- ===================== PERFORMANCE_REVIEWS =====================
DROP POLICY IF EXISTS "performance_reviews_select" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_insert" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_update" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_delete" ON public.performance_reviews;
DROP POLICY IF EXISTS "Performance reviews viewable by HR and participants" ON public.performance_reviews;
DROP POLICY IF EXISTS "Performance reviews can be created by HR" ON public.performance_reviews;
DROP POLICY IF EXISTS "Performance reviews can be updated by HR" ON public.performance_reviews;
DROP POLICY IF EXISTS "Performance reviews can be deleted by HR" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_select_v2" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_insert_v2" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_update_v2" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_delete_v2" ON public.performance_reviews;

CREATE POLICY "performance_reviews_select" ON public.performance_reviews FOR SELECT TO authenticated
  USING (
    public.has_hr_access(auth.uid(), workspace_id)
    OR reviewer_id = auth.uid()
    OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid() AND workspace_id = performance_reviews.workspace_id)
  );
CREATE POLICY "performance_reviews_insert" ON public.performance_reviews FOR INSERT TO authenticated
  WITH CHECK (
    public.has_hr_access(auth.uid(), workspace_id)
    OR public.has_sales_access(auth.uid(), workspace_id)
  );
CREATE POLICY "performance_reviews_update" ON public.performance_reviews FOR UPDATE TO authenticated
  USING (
    public.has_hr_access(auth.uid(), workspace_id)
    OR public.has_sales_access(auth.uid(), workspace_id)
  );
CREATE POLICY "performance_reviews_delete" ON public.performance_reviews FOR DELETE TO authenticated
  USING (public.has_hr_access(auth.uid(), workspace_id));

-- ===================== TIME_OFF_REQUESTS =====================
DROP POLICY IF EXISTS "time_off_requests_select" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_requests_insert" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_requests_update" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_requests_delete" ON public.time_off_requests;
DROP POLICY IF EXISTS "Time off requests viewable by HR and self" ON public.time_off_requests;
DROP POLICY IF EXISTS "Time off requests can be created by members" ON public.time_off_requests;
DROP POLICY IF EXISTS "Time off requests can be updated by HR" ON public.time_off_requests;
DROP POLICY IF EXISTS "Time off requests can be deleted by HR" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_requests_select_v2" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_requests_insert_v2" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_requests_update_v2" ON public.time_off_requests;
DROP POLICY IF EXISTS "time_off_requests_delete_v2" ON public.time_off_requests;

CREATE POLICY "time_off_requests_select" ON public.time_off_requests FOR SELECT TO authenticated
  USING (
    public.has_hr_access(auth.uid(), workspace_id)
    OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid() AND workspace_id = time_off_requests.workspace_id)
  );
CREATE POLICY "time_off_requests_insert" ON public.time_off_requests FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "time_off_requests_update" ON public.time_off_requests FOR UPDATE TO authenticated
  USING (
    public.has_hr_access(auth.uid(), workspace_id)
    OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid() AND workspace_id = time_off_requests.workspace_id)
  );
CREATE POLICY "time_off_requests_delete" ON public.time_off_requests FOR DELETE TO authenticated
  USING (public.has_hr_access(auth.uid(), workspace_id));

-- ===================== GDPR_REQUESTS =====================
DROP POLICY IF EXISTS "gdpr_requests_select" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_insert" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_update" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_delete" ON public.gdpr_requests;
DROP POLICY IF EXISTS "GDPR requests viewable by owner" ON public.gdpr_requests;
DROP POLICY IF EXISTS "GDPR requests can be created by owner" ON public.gdpr_requests;
DROP POLICY IF EXISTS "GDPR requests can be updated by owner" ON public.gdpr_requests;
DROP POLICY IF EXISTS "GDPR requests can be deleted by owner" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_select_v2" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_insert_v2" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_update_v2" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_delete_v2" ON public.gdpr_requests;

CREATE POLICY "gdpr_requests_select" ON public.gdpr_requests FOR SELECT TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));
CREATE POLICY "gdpr_requests_insert" ON public.gdpr_requests FOR INSERT TO authenticated
  WITH CHECK (
    public.is_workspace_owner(auth.uid(), workspace_id)
    OR public.has_hr_access(auth.uid(), workspace_id)
  );
CREATE POLICY "gdpr_requests_update" ON public.gdpr_requests FOR UPDATE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));
CREATE POLICY "gdpr_requests_delete" ON public.gdpr_requests FOR DELETE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- ===================== INTEGRATION_TOKENS =====================
DROP POLICY IF EXISTS "integration_tokens_select" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_insert" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_update" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_delete" ON public.integration_tokens;
DROP POLICY IF EXISTS "Integration tokens viewable by owner" ON public.integration_tokens;
DROP POLICY IF EXISTS "Integration tokens can be created by owner" ON public.integration_tokens;
DROP POLICY IF EXISTS "Integration tokens can be updated by owner" ON public.integration_tokens;
DROP POLICY IF EXISTS "Integration tokens can be deleted by owner" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_select_v2" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_insert_v2" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_update_v2" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_delete_v2" ON public.integration_tokens;

CREATE POLICY "integration_tokens_select" ON public.integration_tokens FOR SELECT TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));
CREATE POLICY "integration_tokens_insert" ON public.integration_tokens FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_owner(auth.uid(), workspace_id));
CREATE POLICY "integration_tokens_update" ON public.integration_tokens FOR UPDATE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));
CREATE POLICY "integration_tokens_delete" ON public.integration_tokens FOR DELETE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- ===================== LEADS =====================
DROP POLICY IF EXISTS "leads_select" ON public.leads;
DROP POLICY IF EXISTS "leads_insert" ON public.leads;
DROP POLICY IF EXISTS "leads_update" ON public.leads;
DROP POLICY IF EXISTS "leads_delete" ON public.leads;
DROP POLICY IF EXISTS "Leads are viewable by workspace members" ON public.leads;
DROP POLICY IF EXISTS "Leads can be created by workspace members" ON public.leads;
DROP POLICY IF EXISTS "Leads can be updated by sales" ON public.leads;
DROP POLICY IF EXISTS "Leads can be deleted by sales" ON public.leads;
DROP POLICY IF EXISTS "leads_select_v2" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_v2" ON public.leads;
DROP POLICY IF EXISTS "leads_update_v2" ON public.leads;
DROP POLICY IF EXISTS "leads_delete_v2" ON public.leads;

CREATE POLICY "leads_select" ON public.leads FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "leads_insert" ON public.leads FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "leads_update" ON public.leads FOR UPDATE TO authenticated
  USING (public.has_sales_access(auth.uid(), workspace_id));
CREATE POLICY "leads_delete" ON public.leads FOR DELETE TO authenticated
  USING (public.has_sales_access(auth.uid(), workspace_id));

-- ===================== DEALS =====================
DROP POLICY IF EXISTS "deals_select" ON public.deals;
DROP POLICY IF EXISTS "deals_insert" ON public.deals;
DROP POLICY IF EXISTS "deals_update" ON public.deals;
DROP POLICY IF EXISTS "deals_delete" ON public.deals;
DROP POLICY IF EXISTS "Deals are viewable by workspace members" ON public.deals;
DROP POLICY IF EXISTS "Deals can be created by sales" ON public.deals;
DROP POLICY IF EXISTS "Deals can be updated by sales" ON public.deals;
DROP POLICY IF EXISTS "Deals can be deleted by sales" ON public.deals;
DROP POLICY IF EXISTS "deals_select_v2" ON public.deals;
DROP POLICY IF EXISTS "deals_insert_v2" ON public.deals;
DROP POLICY IF EXISTS "deals_update_v2" ON public.deals;
DROP POLICY IF EXISTS "deals_delete_v2" ON public.deals;

CREATE POLICY "deals_select" ON public.deals FOR SELECT TO authenticated
  USING (
    public.has_sales_access(auth.uid(), workspace_id)
    OR assigned_to = auth.uid()
  );
CREATE POLICY "deals_insert" ON public.deals FOR INSERT TO authenticated
  WITH CHECK (public.has_sales_access(auth.uid(), workspace_id));
CREATE POLICY "deals_update" ON public.deals FOR UPDATE TO authenticated
  USING (
    public.has_sales_access(auth.uid(), workspace_id)
    OR assigned_to = auth.uid()
  );
CREATE POLICY "deals_delete" ON public.deals FOR DELETE TO authenticated
  USING (public.has_sales_access(auth.uid(), workspace_id));

-- ===================== ACTIVITIES =====================
DROP POLICY IF EXISTS "activities_select" ON public.activities;
DROP POLICY IF EXISTS "activities_insert" ON public.activities;
DROP POLICY IF EXISTS "activities_update" ON public.activities;
DROP POLICY IF EXISTS "activities_delete" ON public.activities;
DROP POLICY IF EXISTS "Activities are viewable by workspace members" ON public.activities;
DROP POLICY IF EXISTS "Activities can be created by workspace members" ON public.activities;
DROP POLICY IF EXISTS "Activities can be updated by creator or manager" ON public.activities;
DROP POLICY IF EXISTS "Activities can be deleted by creator or manager" ON public.activities;
DROP POLICY IF EXISTS "activities_select_v2" ON public.activities;
DROP POLICY IF EXISTS "activities_insert_v2" ON public.activities;
DROP POLICY IF EXISTS "activities_update_v2" ON public.activities;
DROP POLICY IF EXISTS "activities_delete_v2" ON public.activities;

CREATE POLICY "activities_select" ON public.activities FOR SELECT TO authenticated
  USING (
    public.has_workspace_access(auth.uid(), workspace_id)
  );
CREATE POLICY "activities_insert" ON public.activities FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "activities_update" ON public.activities FOR UPDATE TO authenticated
  USING (
    public.has_sales_access(auth.uid(), workspace_id)
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  );
CREATE POLICY "activities_delete" ON public.activities FOR DELETE TO authenticated
  USING (
    public.has_sales_access(auth.uid(), workspace_id)
    OR created_by = auth.uid()
  );

-- ===================== CONTRACTS =====================
DROP POLICY IF EXISTS "contracts_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_insert" ON public.contracts;
DROP POLICY IF EXISTS "contracts_update" ON public.contracts;
DROP POLICY IF EXISTS "contracts_delete" ON public.contracts;
DROP POLICY IF EXISTS "Contracts are viewable by billing or owner" ON public.contracts;
DROP POLICY IF EXISTS "Contracts can be created by billing" ON public.contracts;
DROP POLICY IF EXISTS "Contracts can be updated by billing" ON public.contracts;
DROP POLICY IF EXISTS "Contracts can be deleted by owner" ON public.contracts;
DROP POLICY IF EXISTS "contracts_select_v2" ON public.contracts;
DROP POLICY IF EXISTS "contracts_insert_v2" ON public.contracts;
DROP POLICY IF EXISTS "contracts_update_v2" ON public.contracts;
DROP POLICY IF EXISTS "contracts_delete_v2" ON public.contracts;

CREATE POLICY "contracts_select" ON public.contracts FOR SELECT TO authenticated
  USING (
    public.has_billing_access(auth.uid(), workspace_id)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  );
CREATE POLICY "contracts_insert" ON public.contracts FOR INSERT TO authenticated
  WITH CHECK (public.has_billing_access(auth.uid(), workspace_id));
CREATE POLICY "contracts_update" ON public.contracts FOR UPDATE TO authenticated
  USING (public.has_billing_access(auth.uid(), workspace_id));
CREATE POLICY "contracts_delete" ON public.contracts FOR DELETE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- ===================== AI_REQUESTS =====================
DROP POLICY IF EXISTS "ai_requests_select" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_insert" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_update" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_delete" ON public.ai_requests;
DROP POLICY IF EXISTS "AI requests viewable by workspace members" ON public.ai_requests;
DROP POLICY IF EXISTS "AI requests can be created by workspace members" ON public.ai_requests;
DROP POLICY IF EXISTS "AI requests can be updated by owner" ON public.ai_requests;
DROP POLICY IF EXISTS "AI requests can be deleted by owner" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_select_v2" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_insert_v2" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_update_v2" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_delete_v2" ON public.ai_requests;

CREATE POLICY "ai_requests_select" ON public.ai_requests FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_workspace_owner(auth.uid(), workspace_id)
    OR public.has_billing_access(auth.uid(), workspace_id)
  );
CREATE POLICY "ai_requests_insert" ON public.ai_requests FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "ai_requests_update" ON public.ai_requests FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  );
-- No DELETE policy for ai_requests (immutable audit trail)

-- ===================== KPIS_DAILY =====================
DROP POLICY IF EXISTS "kpis_daily_select" ON public.kpis_daily;
DROP POLICY IF EXISTS "kpis_daily_insert" ON public.kpis_daily;
DROP POLICY IF EXISTS "kpis_daily_update" ON public.kpis_daily;
DROP POLICY IF EXISTS "kpis_daily_delete" ON public.kpis_daily;
DROP POLICY IF EXISTS "KPIs viewable by workspace members" ON public.kpis_daily;
DROP POLICY IF EXISTS "KPIs can be created by workspace members" ON public.kpis_daily;
DROP POLICY IF EXISTS "KPIs can be updated by owner" ON public.kpis_daily;
DROP POLICY IF EXISTS "KPIs can be deleted by owner" ON public.kpis_daily;
DROP POLICY IF EXISTS "kpis_daily_select_v2" ON public.kpis_daily;
DROP POLICY IF EXISTS "kpis_daily_insert_v2" ON public.kpis_daily;
DROP POLICY IF EXISTS "kpis_daily_update_v2" ON public.kpis_daily;
DROP POLICY IF EXISTS "kpis_daily_delete_v2" ON public.kpis_daily;

CREATE POLICY "kpis_daily_select" ON public.kpis_daily FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "kpis_daily_insert" ON public.kpis_daily FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "kpis_daily_update" ON public.kpis_daily FOR UPDATE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));
CREATE POLICY "kpis_daily_delete" ON public.kpis_daily FOR DELETE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- ===================== META_CONVERSATIONS =====================
DROP POLICY IF EXISTS "meta_conversations_select" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_insert" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_update" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_delete" ON public.meta_conversations;
DROP POLICY IF EXISTS "Meta conversations viewable by workspace" ON public.meta_conversations;
DROP POLICY IF EXISTS "Meta conversations can be created by workspace" ON public.meta_conversations;
DROP POLICY IF EXISTS "Meta conversations can be updated by workspace" ON public.meta_conversations;
DROP POLICY IF EXISTS "Meta conversations can be deleted by owner" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_select_v2" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_insert_v2" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_update_v2" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_delete_v2" ON public.meta_conversations;

CREATE POLICY "meta_conversations_select" ON public.meta_conversations FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "meta_conversations_insert" ON public.meta_conversations FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "meta_conversations_update" ON public.meta_conversations FOR UPDATE TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "meta_conversations_delete" ON public.meta_conversations FOR DELETE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- ===================== META_MESSAGES =====================
DROP POLICY IF EXISTS "meta_messages_select" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages_insert" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages_update" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages_delete" ON public.meta_messages;
DROP POLICY IF EXISTS "Meta messages viewable by workspace" ON public.meta_messages;
DROP POLICY IF EXISTS "Meta messages can be created by workspace" ON public.meta_messages;
DROP POLICY IF EXISTS "Meta messages can be deleted by owner" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages_select_v2" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages_insert_v2" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages_delete_v2" ON public.meta_messages;

CREATE POLICY "meta_messages_select" ON public.meta_messages FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "meta_messages_insert" ON public.meta_messages FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));
-- No UPDATE policy (messages are immutable)
CREATE POLICY "meta_messages_delete" ON public.meta_messages FOR DELETE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- ===================== META_CAPI_EVENTS =====================
DROP POLICY IF EXISTS "meta_capi_events_select" ON public.meta_capi_events;
DROP POLICY IF EXISTS "meta_capi_events_insert" ON public.meta_capi_events;
DROP POLICY IF EXISTS "meta_capi_events_update" ON public.meta_capi_events;
DROP POLICY IF EXISTS "meta_capi_events_delete" ON public.meta_capi_events;
DROP POLICY IF EXISTS "CAPI events viewable by workspace" ON public.meta_capi_events;
DROP POLICY IF EXISTS "CAPI events can be created by workspace" ON public.meta_capi_events;
DROP POLICY IF EXISTS "CAPI events can be deleted by owner" ON public.meta_capi_events;
DROP POLICY IF EXISTS "meta_capi_events_select_v2" ON public.meta_capi_events;
DROP POLICY IF EXISTS "meta_capi_events_insert_v2" ON public.meta_capi_events;
DROP POLICY IF EXISTS "meta_capi_events_delete_v2" ON public.meta_capi_events;

CREATE POLICY "meta_capi_events_select" ON public.meta_capi_events FOR SELECT TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "meta_capi_events_insert" ON public.meta_capi_events FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));
-- No UPDATE policy (events are immutable)
CREATE POLICY "meta_capi_events_delete" ON public.meta_capi_events FOR DELETE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- ===================== SMART_LINK_EMAILS =====================
DROP POLICY IF EXISTS "smart_link_emails_select" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_insert" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_update" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_delete" ON public.smart_link_emails;
DROP POLICY IF EXISTS "Smart link emails viewable by owner" ON public.smart_link_emails;
DROP POLICY IF EXISTS "Smart link emails can be inserted by anyone" ON public.smart_link_emails;
DROP POLICY IF EXISTS "Smart link emails can be deleted by owner" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_select_v2" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_insert_v2" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_delete_v2" ON public.smart_link_emails;
DROP POLICY IF EXISTS "sle_public_insert_validated_v10" ON public.smart_link_emails;
DROP POLICY IF EXISTS "sle_select_owner_v2" ON public.smart_link_emails;
DROP POLICY IF EXISTS "sle_delete_owner_v2" ON public.smart_link_emails;

CREATE POLICY "smart_link_emails_select" ON public.smart_link_emails FOR SELECT TO authenticated
  USING (
    public.is_workspace_owner(auth.uid(), workspace_id)
    OR public.has_hr_access(auth.uid(), workspace_id)
  );
CREATE POLICY "smart_link_emails_insert" ON public.smart_link_emails FOR INSERT TO anon, authenticated
  WITH CHECK (
    consent_given = true
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND EXISTS (
      SELECT 1 FROM public.media_assets ma
      WHERE ma.id = media_asset_id
        AND ma.workspace_id = smart_link_emails.workspace_id
    )
  );
-- No UPDATE policy (lead capture is immutable)
CREATE POLICY "smart_link_emails_delete" ON public.smart_link_emails FOR DELETE TO authenticated
  USING (public.is_workspace_owner(auth.uid(), workspace_id));
