-- RLS HARDENING - Phase 3 Final (Simplified)

-- 1. EMPLOYEES
DROP POLICY IF EXISTS "employees_select_own_or_hr" ON public.employees;
DROP POLICY IF EXISTS "employees_hr_v13" ON public.employees;
DROP POLICY IF EXISTS "employees_own_or_hr_only" ON public.employees;

CREATE POLICY "emp_sel_strict" ON public.employees FOR SELECT USING (
  user_id = auth.uid() OR public.has_hr_access(auth.uid(), workspace_id) OR public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 2. CONTRACTS
DROP POLICY IF EXISTS "contracts_finance_legal_only_v13" ON public.contracts;
DROP POLICY IF EXISTS "contracts_owner_billing_only" ON public.contracts;

CREATE POLICY "cntr_sel_owner" ON public.contracts FOR SELECT USING (
  public.is_workspace_owner(auth.uid(), workspace_id) OR public.has_billing_access(auth.uid(), workspace_id)
);

-- 3. GDPR - Owner only
DROP POLICY IF EXISTS "gdpr_requests_workspace_access" ON public.gdpr_requests;

CREATE POLICY "gdpr_sel_owner" ON public.gdpr_requests FOR SELECT USING (public.is_workspace_owner(auth.uid(), workspace_id));

-- 4. META_CONVERSATIONS - Admin/Manager
DROP POLICY IF EXISTS "mc_sel_member" ON public.meta_conversations;

CREATE POLICY "metaconv_sel" ON public.meta_conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND workspace_id = meta_conversations.workspace_id AND role IN ('owner', 'admin', 'manager'))
);

-- 5. META_MESSAGES
DROP POLICY IF EXISTS "mm_sel_member" ON public.meta_messages;

CREATE POLICY "metamsg_sel" ON public.meta_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND workspace_id = meta_messages.workspace_id AND role IN ('owner', 'admin', 'manager'))
);

-- 6. AI_REQUESTS - Creator only
DROP POLICY IF EXISTS "ai_requests_restricted_select_v13" ON public.ai_requests;

CREATE POLICY "aireq_sel" ON public.ai_requests FOR SELECT USING (
  user_id = auth.uid() OR public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 7. CREATIVE_JOBS - Workspace admin/manager
DROP POLICY IF EXISTS "creative_jobs_workspace_access" ON public.creative_jobs;

CREATE POLICY "crjob_sel" ON public.creative_jobs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND workspace_id = creative_jobs.workspace_id AND role IN ('owner', 'admin', 'manager'))
);

-- 8. SMART_LINK_EMAILS - Owner/Admin read
DROP POLICY IF EXISTS "sle_sel_member" ON public.smart_link_emails;

CREATE POLICY "sle_sel_admin" ON public.smart_link_emails FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND workspace_id = smart_link_emails.workspace_id AND role IN ('owner', 'admin'))
);

-- 9. Self-approval prevention trigger
CREATE OR REPLACE FUNCTION public.check_approval_self_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN
  IF NEW.reviewed_by IS NOT NULL AND NEW.reviewed_by = (
    SELECT actor_id FROM public.action_log WHERE entity_id = NEW.id::text AND action_type = 'approval_requested' LIMIT 1
  ) THEN RAISE EXCEPTION 'Self-approval is not allowed'; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS approval_self_review_check ON public.approval_queue;
CREATE TRIGGER approval_self_review_check BEFORE UPDATE ON public.approval_queue FOR EACH ROW WHEN (NEW.reviewed_by IS NOT NULL) EXECUTE FUNCTION public.check_approval_self_review();

-- 10. Remove audit_log member insert (system only)
DROP POLICY IF EXISTS "audit_log_insert_member" ON public.audit_log;