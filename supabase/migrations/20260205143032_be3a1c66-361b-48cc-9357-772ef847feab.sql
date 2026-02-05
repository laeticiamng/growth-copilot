-- =============================================
-- SECURITY FIX: contact_submissions RLS policies
-- Issue: Table has RLS enabled but no policies (complete block)
-- Fix: Add policies for workspace owner/admin access only
-- =============================================

-- Add RLS policies for contact_submissions
-- Only workspace owners/admins can view contact submissions
CREATE POLICY "contact_submissions_admin_read"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
  -- Contact submissions don't have workspace_id, 
  -- so we need to check if user is admin of ANY workspace
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('owner', 'admin')
  )
);

-- Allow insert from anyone (public contact form)
-- This is intentional - contact forms should accept public submissions
CREATE POLICY "contact_submissions_public_insert"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can update (mark as replied, etc.)
CREATE POLICY "contact_submissions_admin_update"
ON public.contact_submissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('owner', 'admin')
  )
);

-- Only admins can delete
CREATE POLICY "contact_submissions_admin_delete"
ON public.contact_submissions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('owner', 'admin')
  )
);

-- =============================================
-- SECURITY FIX: employees_safe view
-- Issue: View doesn't use security_invoker, bypasses RLS
-- Fix: Recreate view with security_invoker = true
-- =============================================

DROP VIEW IF EXISTS public.employees_safe;

CREATE VIEW public.employees_safe
WITH (security_invoker = true)
AS
SELECT 
    id,
    workspace_id,
    user_id,
    first_name,
    last_name,
    email,
    phone,
    job_title,
    department,
    hire_date,
    end_date,
    status,
    manager_id,
    contract_type,
    work_location,
    skills,
    last_review_at,
    notes,
    created_at,
    updated_at,
    -- Sensitive fields only visible to HR
    CASE
        WHEN has_hr_access(auth.uid(), workspace_id) THEN salary_annual
        ELSE NULL::numeric
    END AS salary_annual,
    CASE
        WHEN has_hr_access(auth.uid(), workspace_id) THEN performance_score
        ELSE NULL::numeric
    END AS performance_score
FROM employees
WHERE has_workspace_access(auth.uid(), workspace_id);

-- Grant access to the view
GRANT SELECT ON public.employees_safe TO authenticated;

-- =============================================
-- CLEANUP: Remove redundant GDPR request policies  
-- Keep only the most secure and clear policies
-- =============================================

-- Drop older/redundant policies (keeping the best ones)
DROP POLICY IF EXISTS "Authorized access to GDPR requests" ON public.gdpr_requests;
DROP POLICY IF EXISTS "Privacy officers and requesters can view GDPR requests" ON public.gdpr_requests;
DROP POLICY IF EXISTS "Privacy officers only can view GDPR requests" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_privacy_officer_v5" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_final_v9" ON public.gdpr_requests;

-- Ensure we have clear, non-overlapping policies:
-- 1. gdpr_requests_privacy_officer_select - for SELECT by admins
-- 2. gdpr_requests_privacy_officer_only_v13 - for SELECT by requester email match
-- 3. Owners only can manage GDPR requests - for ALL operations by owners
-- 4. gdpr_requests_insert - for INSERT by workspace members