-- Migration v15: Security Hardening - Correct RLS policies
-- =========================================================

-- 1. EMPLOYEES: Consolidate policies
DROP POLICY IF EXISTS "Workspace members can view employees" ON public.employees;
DROP POLICY IF EXISTS "employees_select_workspace" ON public.employees;
DROP POLICY IF EXISTS "employees_workspace_access" ON public.employees;
DROP POLICY IF EXISTS "employees_select_hr_or_self" ON public.employees;

CREATE POLICY "employees_select_restricted"
ON public.employees FOR SELECT TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND (
    public.has_hr_access(auth.uid(), workspace_id)
    OR user_id = auth.uid()
  )
);

-- 2. LEADS: Consolidate policies
DROP POLICY IF EXISTS "Workspace members can view leads" ON public.leads;
DROP POLICY IF EXISTS "leads_select_workspace" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_select" ON public.leads;
DROP POLICY IF EXISTS "leads_select_assigned_or_managers" ON public.leads;

CREATE POLICY "leads_select_consolidated"
ON public.leads FOR SELECT TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND (
    public.has_sales_access(auth.uid(), workspace_id)
    OR assigned_to = auth.uid()
    OR assigned_to IS NULL
  )
);

-- 3. CONTRACTS: Owner and billing only
DROP POLICY IF EXISTS "Workspace members can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "contracts_select_workspace" ON public.contracts;
DROP POLICY IF EXISTS "contracts_select_billing_only" ON public.contracts;

CREATE POLICY "contracts_select_owner_billing"
ON public.contracts FOR SELECT TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND (
    public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
    OR public.has_billing_access(auth.uid(), workspace_id)
  )
);

-- 4. PERFORMANCE_REVIEWS: Consolidate
DROP POLICY IF EXISTS "performance_reviews_select" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_workspace_select" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_select_restricted" ON public.performance_reviews;

CREATE POLICY "performance_reviews_select_consolidated"
ON public.performance_reviews FOR SELECT TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND (
    public.has_hr_access(auth.uid(), workspace_id)
    OR reviewer_id = auth.uid()
    OR (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) AND status != 'draft')
  )
);

-- 5. GDPR_REQUESTS: Owner + requester only
DROP POLICY IF EXISTS "gdpr_requests_select" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_workspace_select" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_select_restricted" ON public.gdpr_requests;

CREATE POLICY "gdpr_requests_select_consolidated"
ON public.gdpr_requests FOR SELECT TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND (
    public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
    OR requester_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- 6. OAUTH_TOKENS: Owner only (via integration_id join)
DROP POLICY IF EXISTS "oauth_tokens_select" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_workspace_select" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_update" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_delete" ON public.oauth_tokens;

CREATE POLICY "oauth_tokens_select_owner"
ON public.oauth_tokens FOR SELECT TO authenticated
USING (
  integration_id IN (
    SELECT id FROM public.integrations 
    WHERE public.has_workspace_access(auth.uid(), workspace_id) 
    AND public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
  )
);

CREATE POLICY "oauth_tokens_update_owner"
ON public.oauth_tokens FOR UPDATE TO authenticated
USING (
  integration_id IN (
    SELECT id FROM public.integrations 
    WHERE public.has_workspace_access(auth.uid(), workspace_id) 
    AND public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
  )
);

CREATE POLICY "oauth_tokens_delete_owner"
ON public.oauth_tokens FOR DELETE TO authenticated
USING (
  integration_id IN (
    SELECT id FROM public.integrations 
    WHERE public.has_workspace_access(auth.uid(), workspace_id) 
    AND public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
  )
);

-- 7. INTEGRATION_TOKENS: Owner only
DROP POLICY IF EXISTS "integration_tokens_select" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_update" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_delete" ON public.integration_tokens;

CREATE POLICY "integration_tokens_select_owner"
ON public.integration_tokens FOR SELECT TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND
  public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
);

CREATE POLICY "integration_tokens_update_owner"
ON public.integration_tokens FOR UPDATE TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND
  public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
);

CREATE POLICY "integration_tokens_delete_owner"
ON public.integration_tokens FOR DELETE TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND
  public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
);

-- 8. NOTIFICATIONS: Consolidate
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_sensitive" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_regular" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_by_category" ON public.notifications;

CREATE POLICY "notifications_select_consolidated"
ON public.notifications FOR SELECT TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND (
    user_id = auth.uid()
    OR category NOT IN ('security', 'billing', 'compliance', 'hr')
    OR (category IN ('security', 'billing', 'compliance', 'hr') AND 
        (public.has_role(auth.uid(), workspace_id, 'owner'::app_role) OR
         public.has_role(auth.uid(), workspace_id, 'admin'::app_role)))
  )
);

-- 9. META_CONVERSATIONS: Admins only
DROP POLICY IF EXISTS "meta_conversations_select" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_select_admins" ON public.meta_conversations;

CREATE POLICY "meta_conversations_select_restricted"
ON public.meta_conversations FOR SELECT TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND (
    public.has_role(auth.uid(), workspace_id, 'admin'::app_role)
    OR public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
  )
);

-- 10. TIME_OFF_REQUESTS: HR and self only
DROP POLICY IF EXISTS "time_off_requests_select" ON public.time_off_requests;

CREATE POLICY "time_off_requests_select_hr_self"
ON public.time_off_requests FOR SELECT TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND (
    public.has_hr_access(auth.uid(), workspace_id)
    OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
);

-- 11. REVIEW_REQUESTS: Managers only
DROP POLICY IF EXISTS "review_requests_select" ON public.review_requests;

CREATE POLICY "review_requests_select_managers"
ON public.review_requests FOR SELECT TO authenticated
USING (
  public.has_workspace_access(auth.uid(), workspace_id) AND (
    public.has_role(auth.uid(), workspace_id, 'owner'::app_role)
    OR public.has_role(auth.uid(), workspace_id, 'admin'::app_role)
    OR public.has_role(auth.uid(), workspace_id, 'manager'::app_role)
  )
);