-- ============================================================================
-- Security Hardening Migration Part 1 - Core Tables (validated schemas)
-- ============================================================================

-- 1. Rate limit for smart_link_clicks INSERT
DROP POLICY IF EXISTS "smart_link_clicks_public_insert" ON public.smart_link_clicks;
DROP POLICY IF EXISTS "Anyone can record clicks" ON public.smart_link_clicks;

CREATE POLICY "smart_link_clicks_rate_limited_insert"
ON public.smart_link_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (TRUE);

-- Add rate limit trigger for smart_link_clicks
CREATE OR REPLACE FUNCTION public.check_smart_link_click_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.smart_link_clicks
  WHERE created_at > NOW() - INTERVAL '1 minute'
  AND ip_hash = NEW.ip_hash;
  
  IF recent_count >= 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded for click tracking';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS smart_link_click_rate_limit ON public.smart_link_clicks;
CREATE TRIGGER smart_link_click_rate_limit
  BEFORE INSERT ON public.smart_link_clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.check_smart_link_click_rate_limit();

-- 2. Restrict smart_link_emails to require consent_given = true
DROP POLICY IF EXISTS "smart_link_emails_public_insert" ON public.smart_link_emails;
DROP POLICY IF EXISTS "Anyone can submit email" ON public.smart_link_emails;

CREATE POLICY "smart_link_emails_consent_required_insert"
ON public.smart_link_emails
FOR INSERT
TO anon, authenticated
WITH CHECK (consent_given = true);

-- 3. Restrict employees table - HR/Admin/Self only
DROP POLICY IF EXISTS "employees_workspace_select" ON public.employees;
DROP POLICY IF EXISTS "Workspace members can view employees" ON public.employees;
DROP POLICY IF EXISTS "employees_restricted_select" ON public.employees;

CREATE POLICY "employees_restricted_select"
ON public.employees
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_permission(auth.uid(), workspace_id, 'manage_team')
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 4. Restrict leads to sales team
DROP POLICY IF EXISTS "leads_workspace_select" ON public.leads;
DROP POLICY IF EXISTS "Workspace members can view leads" ON public.leads;
DROP POLICY IF EXISTS "leads_restricted_select" ON public.leads;
DROP POLICY IF EXISTS "leads_sales_team_select" ON public.leads;

CREATE POLICY "leads_sales_team_select"
ON public.leads
FOR SELECT
TO authenticated
USING (
  assigned_to = auth.uid()
  OR public.has_permission(auth.uid(), workspace_id, 'manage_team')
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 5. Restrict contracts to admin only
DROP POLICY IF EXISTS "contracts_workspace_select" ON public.contracts;
DROP POLICY IF EXISTS "Workspace members can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "contracts_restricted_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_admin_only_select" ON public.contracts;

CREATE POLICY "contracts_admin_only_select"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
  OR public.has_permission(auth.uid(), workspace_id, 'manage_billing')
);

-- 6. gdpr_requests - privacy officer/owner only
DROP POLICY IF EXISTS "gdpr_requests_select" ON public.gdpr_requests;
DROP POLICY IF EXISTS "Workspace admins can view GDPR requests" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_restricted_select" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_privacy_officer_select" ON public.gdpr_requests;

CREATE POLICY "gdpr_requests_privacy_officer_select"
ON public.gdpr_requests
FOR SELECT
TO authenticated
USING (
  public.has_permission(auth.uid(), workspace_id, 'view_audit')
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 7. performance_reviews - HR/manager/employee
DROP POLICY IF EXISTS "performance_reviews_select" ON public.performance_reviews;
DROP POLICY IF EXISTS "Workspace members can view reviews" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_restricted_select" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_private_select" ON public.performance_reviews;

CREATE POLICY "performance_reviews_private_select"
ON public.performance_reviews
FOR SELECT
TO authenticated
USING (
  employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  OR reviewer_id = auth.uid()
  OR public.has_permission(auth.uid(), workspace_id, 'manage_team')
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 8. integration_tokens - owner only (via integration_id join)
DROP POLICY IF EXISTS "integration_tokens_owner_select" ON public.integration_tokens;
DROP POLICY IF EXISTS "Owners can view integration tokens" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_restricted_select" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_owner_only_select" ON public.integration_tokens;

CREATE POLICY "integration_tokens_owner_only_select"
ON public.integration_tokens
FOR SELECT
TO authenticated
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);

-- 9. oauth_tokens - owner only (via integration_id join)
DROP POLICY IF EXISTS "oauth_tokens_owner_select" ON public.oauth_tokens;
DROP POLICY IF EXISTS "Workspace owners can view tokens" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_restricted_select" ON public.oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_owner_only_select" ON public.oauth_tokens;

CREATE POLICY "oauth_tokens_owner_only_select"
ON public.oauth_tokens
FOR SELECT
TO authenticated
USING (
  integration_id IN (
    SELECT id FROM integrations 
    WHERE public.is_workspace_owner(auth.uid(), workspace_id)
  )
);