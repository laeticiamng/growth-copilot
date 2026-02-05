-- =====================================================
-- SECURITY CLEANUP: Remove ALL overlapping policies
-- Keep only ONE strict policy per table per operation
-- =====================================================

-- EMPLOYEES: Remove ALL except our new one
DROP POLICY IF EXISTS "HR can view employees in their workspace" ON public.employees;
DROP POLICY IF EXISTS "employees_final_v9" ON public.employees;
DROP POLICY IF EXISTS "employees_hr_admin_self_v5" ON public.employees;
DROP POLICY IF EXISTS "employees_restricted_select" ON public.employees;
DROP POLICY IF EXISTS "employees_restricted_v8" ON public.employees;
DROP POLICY IF EXISTS "employees_select_restricted" ON public.employees;

-- LEADS: Remove ALL except our new one
DROP POLICY IF EXISTS "Sales team can view leads" ON public.leads;
DROP POLICY IF EXISTS "leads_final_v9" ON public.leads;
DROP POLICY IF EXISTS "leads_granular_select" ON public.leads;
DROP POLICY IF EXISTS "leads_hardened_select" ON public.leads;
DROP POLICY IF EXISTS "leads_restricted_access_v8" ON public.leads;
DROP POLICY IF EXISTS "leads_restricted_select_v13" ON public.leads;
DROP POLICY IF EXISTS "leads_sales_team_select" ON public.leads;
DROP POLICY IF EXISTS "leads_select_consolidated" ON public.leads;

-- CONTRACTS: Remove ALL except our new one
DROP POLICY IF EXISTS "Authorized roles can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "Billing managers can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "contracts_billing_restricted_v8" ON public.contracts;
DROP POLICY IF EXISTS "contracts_final_v9" ON public.contracts;
DROP POLICY IF EXISTS "contracts_select_owner_billing" ON public.contracts;

-- PERFORMANCE_REVIEWS: Remove ALL except our new one
DROP POLICY IF EXISTS "Authorized access to performance reviews" ON public.performance_reviews;
DROP POLICY IF EXISTS "HR can manage performance reviews" ON public.performance_reviews;
DROP POLICY IF EXISTS "HR reviewer and reviewee can view performance reviews" ON public.performance_reviews;
DROP POLICY IF EXISTS "Users view own reviews or managers view team" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_final_v9" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_private_select" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_restricted_select_v13" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_select_consolidated" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_strict_v8" ON public.performance_reviews;