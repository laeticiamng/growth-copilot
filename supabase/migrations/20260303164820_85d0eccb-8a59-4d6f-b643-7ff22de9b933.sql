-- Cleanup redundant RLS policies on leads (keep *_strict variants)
DROP POLICY IF EXISTS "leads_select" ON public.leads;
DROP POLICY IF EXISTS "leads_assigned_or_manager" ON public.leads;
DROP POLICY IF EXISTS "leads_insert" ON public.leads;
DROP POLICY IF EXISTS "leads_update" ON public.leads;
DROP POLICY IF EXISTS "leads_delete" ON public.leads;

-- Cleanup redundant RLS policies on performance_reviews (keep strict + v8 variants)
DROP POLICY IF EXISTS "performance_reviews_select" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_insert" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_update" ON public.performance_reviews;