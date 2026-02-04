-- Security Hardening Step 2: leads, contracts, performance_reviews, gdpr

-- leads: Restrict to assigned + billing managers
DROP POLICY IF EXISTS "Users can view leads in their workspace" ON public.leads;
CREATE POLICY "Sales team can view leads"
ON public.leads FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    assigned_to = auth.uid()
    OR public.has_permission(auth.uid(), workspace_id, 'manage_billing'::permission_action)
  )
);

-- contracts: Billing managers only
DROP POLICY IF EXISTS "Users can view contracts in their workspace" ON public.contracts;
CREATE POLICY "Billing managers can view contracts"
ON public.contracts FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND public.has_permission(auth.uid(), workspace_id, 'manage_billing'::permission_action)
);

-- performance_reviews: Own reviews + reviewers + owners
DROP POLICY IF EXISTS "Users can view performance reviews in their workspace" ON public.performance_reviews;
CREATE POLICY "Users view own reviews or managers view team"
ON public.performance_reviews FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR reviewer_id = auth.uid()
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

-- gdpr_requests: Requester email match + owners
DROP POLICY IF EXISTS "Users can view GDPR requests in their workspace" ON public.gdpr_requests;
CREATE POLICY "Privacy officers and requesters can view GDPR requests"
ON public.gdpr_requests FOR SELECT
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
);