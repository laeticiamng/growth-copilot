-- =====================================================
-- Migration v8: Critical Security Hardening (CORRECTED)
-- Fixes: 6 CRITICAL findings from security scan
-- =====================================================

-- 1. FIX: Smart Link Clicks - Validate required fields
DROP POLICY IF EXISTS "smart_link_clicks_insert_public" ON public.smart_link_clicks;
DROP POLICY IF EXISTS "Allow click tracking insert" ON public.smart_link_clicks;
DROP POLICY IF EXISTS "smart_link_clicks_insert_validated_v8" ON public.smart_link_clicks;

CREATE POLICY "smart_link_clicks_insert_validated_v8" 
ON public.smart_link_clicks 
FOR INSERT 
WITH CHECK (
  media_asset_id IS NOT NULL 
  AND ip_hash IS NOT NULL 
  AND char_length(ip_hash) >= 8
);

-- 2. FIX: Smart Link Emails - Require consent and valid email
DROP POLICY IF EXISTS "smart_link_emails_insert_consent_v7" ON public.smart_link_emails;
DROP POLICY IF EXISTS "Allow email submissions with consent" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_validated_v8" ON public.smart_link_emails;

CREATE POLICY "smart_link_emails_validated_v8" 
ON public.smart_link_emails 
FOR INSERT 
WITH CHECK (
  consent_given = true 
  AND email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- 3. FIX: Leads - Restrict to assigned user or manager roles
DROP POLICY IF EXISTS "leads_access_consolidated_v7" ON public.leads;
DROP POLICY IF EXISTS "leads_assigned_or_manager_v5" ON public.leads;
DROP POLICY IF EXISTS "Leads workspace access" ON public.leads;
DROP POLICY IF EXISTS "leads_restricted_access_v8" ON public.leads;

-- Helper for sales access (role-based only)
CREATE OR REPLACE FUNCTION public.has_sales_access(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
      AND role IN ('owner', 'admin', 'manager')
  )
$$;

CREATE POLICY "leads_restricted_access_v8" 
ON public.leads 
FOR ALL 
TO authenticated 
USING (
  public.is_workspace_member(auth.uid(), workspace_id)
  AND (
    leads.assigned_to = auth.uid() 
    OR leads.assigned_to IS NULL 
    OR public.has_sales_access(auth.uid(), workspace_id)
  )
);

-- 4. FIX: Employees - Restrict salary to HR/Owner only
DROP POLICY IF EXISTS "employees_hr_owner_only" ON public.employees;
DROP POLICY IF EXISTS "employees_self_and_hr_v5" ON public.employees;
DROP POLICY IF EXISTS "Employees HR access" ON public.employees;
DROP POLICY IF EXISTS "employees_restricted_v8" ON public.employees;
DROP POLICY IF EXISTS "employees_write_hr_only_v8" ON public.employees;
DROP POLICY IF EXISTS "employees_update_hr_only_v8" ON public.employees;
DROP POLICY IF EXISTS "employees_delete_hr_only_v8" ON public.employees;

-- Helper for HR access (role-based only)
CREATE OR REPLACE FUNCTION public.has_hr_access(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
      AND role IN ('owner', 'admin')
  )
$$;

CREATE POLICY "employees_restricted_v8" 
ON public.employees 
FOR SELECT 
TO authenticated 
USING (
  public.is_workspace_member(auth.uid(), workspace_id)
  AND (
    employees.user_id = auth.uid()
    OR public.has_hr_access(auth.uid(), workspace_id)
  )
);

CREATE POLICY "employees_write_hr_only_v8" 
ON public.employees 
FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_hr_access(auth.uid(), workspace_id)
);

CREATE POLICY "employees_update_hr_only_v8" 
ON public.employees 
FOR UPDATE 
TO authenticated 
USING (
  public.has_hr_access(auth.uid(), workspace_id)
);

CREATE POLICY "employees_delete_hr_only_v8" 
ON public.employees 
FOR DELETE 
TO authenticated 
USING (
  public.has_hr_access(auth.uid(), workspace_id)
);

-- 5. FIX: Contracts - Restrict to billing/owner only
DROP POLICY IF EXISTS "contracts_billing_owner_v5" ON public.contracts;
DROP POLICY IF EXISTS "contracts_owner_billing_v7" ON public.contracts;
DROP POLICY IF EXISTS "contracts_billing_restricted_v7" ON public.contracts;
DROP POLICY IF EXISTS "contracts_billing_restricted_v8" ON public.contracts;
DROP POLICY IF EXISTS "Contracts billing access" ON public.contracts;

CREATE OR REPLACE FUNCTION public.has_billing_access(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
      AND role IN ('owner', 'admin')
  )
  OR public.has_permission(_user_id, _workspace_id, 'manage_billing'::permission_action)
$$;

CREATE POLICY "contracts_billing_restricted_v8" 
ON public.contracts 
FOR ALL 
TO authenticated 
USING (
  public.has_billing_access(auth.uid(), workspace_id)
);

-- 6. FIX: Performance Reviews - Strict isolation
DROP POLICY IF EXISTS "performance_reviews_self_reviewer" ON public.performance_reviews;
DROP POLICY IF EXISTS "Performance reviews access" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_strict_v8" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_write_hr_v8" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_update_v8" ON public.performance_reviews;

CREATE POLICY "performance_reviews_strict_v8" 
ON public.performance_reviews 
FOR SELECT 
TO authenticated 
USING (
  public.is_workspace_member(auth.uid(), workspace_id)
  AND (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR reviewer_id = auth.uid()
    OR public.has_hr_access(auth.uid(), workspace_id)
  )
);

CREATE POLICY "performance_reviews_write_hr_v8" 
ON public.performance_reviews 
FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_hr_access(auth.uid(), workspace_id)
);

CREATE POLICY "performance_reviews_update_v8" 
ON public.performance_reviews 
FOR UPDATE 
TO authenticated 
USING (
  reviewer_id = auth.uid()
  OR public.has_hr_access(auth.uid(), workspace_id)
);

-- 7. FIX: Meta conversations - Workspace members with manager access
DROP POLICY IF EXISTS "meta_conversations_team_access" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_assigned_v8" ON public.meta_conversations;

CREATE POLICY "meta_conversations_team_v8" 
ON public.meta_conversations 
FOR SELECT 
TO authenticated 
USING (
  public.is_workspace_member(auth.uid(), workspace_id)
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND workspace_id = meta_conversations.workspace_id
      AND role IN ('owner', 'admin', 'manager')
  )
);

-- 8. FIX: Notifications - Filter sensitive categories
DROP POLICY IF EXISTS "notifications_filtered_v7" ON public.notifications;
DROP POLICY IF EXISTS "notifications_user_filtered_v5" ON public.notifications;
DROP POLICY IF EXISTS "notifications_strict_v7" ON public.notifications;
DROP POLICY IF EXISTS "notifications_strict_v8" ON public.notifications;

CREATE POLICY "notifications_strict_v8" 
ON public.notifications 
FOR SELECT 
TO authenticated 
USING (
  user_id = auth.uid()
  AND (
    category NOT IN ('billing', 'security', 'compliance', 'hr')
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND workspace_id = notifications.workspace_id
        AND role IN ('owner', 'admin')
    )
  )
);