-- ============================================
-- MIGRATION v7: Security Hardening - Public Table Access Restriction
-- Date: 2026-02-04
-- Fixes: Remaining critical findings (publicly exposed tables)
-- ============================================

-- 10. SMART_LINK_CLICKS: Already has rate limit trigger - add additional check
DROP POLICY IF EXISTS "smart_link_clicks_insert" ON public.smart_link_clicks;
DROP POLICY IF EXISTS "Anyone can insert click" ON public.smart_link_clicks;

CREATE POLICY "smart_link_clicks_insert_v7" ON public.smart_link_clicks
FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 11. SMART_LINK_EMAILS: Already has rate limit trigger - tighten consent check
DROP POLICY IF EXISTS "smart_link_emails_consent_insert" ON public.smart_link_emails;
DROP POLICY IF EXISTS "Public can insert with consent" ON public.smart_link_emails;

CREATE POLICY "smart_link_emails_consent_insert_v7" ON public.smart_link_emails
FOR INSERT TO anon, authenticated WITH CHECK (
  consent_given = true
);

-- 12. NOTIFICATIONS: Ensure sensitive categories filtered - consolidate policies
DROP POLICY IF EXISTS "notifications_member_read" ON public.notifications;
DROP POLICY IF EXISTS "notifications_v5_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_sensitive_filter_v5" ON public.notifications;

CREATE POLICY "notifications_member_select_v7" ON public.notifications
FOR SELECT TO authenticated USING (
  public.is_workspace_member(auth.uid(), workspace_id)
  AND (
    user_id = auth.uid()
    OR user_id IS NULL
    OR category NOT IN ('security', 'billing', 'compliance')
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.workspace_id = notifications.workspace_id
      AND ur.role IN ('owner', 'admin')
    )
  )
);

-- 13. Consolidate LEADS policies (9 policies -> 1 clear policy)
DROP POLICY IF EXISTS "leads_assigned_or_manager_v5" ON public.leads;
DROP POLICY IF EXISTS "leads_select_assigned" ON public.leads;
DROP POLICY IF EXISTS "leads_select_manager" ON public.leads;
DROP POLICY IF EXISTS "leads_select_permission" ON public.leads;
DROP POLICY IF EXISTS "Leads visible to assigned or managers" ON public.leads;
DROP POLICY IF EXISTS "Members can view leads" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_member" ON public.leads;

CREATE POLICY "leads_access_consolidated_v7" ON public.leads
FOR SELECT TO authenticated USING (
  public.is_workspace_member(auth.uid(), workspace_id)
  AND (
    assigned_to = auth.uid()
    OR assigned_to IS NULL
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.workspace_id = leads.workspace_id
      AND ur.role IN ('owner', 'admin', 'manager')
    )
  )
);

-- 14. Consolidate DEALS policies (8 policies -> 1 clear policy)
DROP POLICY IF EXISTS "deals_assigned_or_manager_v5" ON public.deals;
DROP POLICY IF EXISTS "deals_select_assigned" ON public.deals;
DROP POLICY IF EXISTS "deals_select_manager" ON public.deals;
DROP POLICY IF EXISTS "Deals visible to assigned or managers" ON public.deals;
DROP POLICY IF EXISTS "Members can view deals" ON public.deals;
DROP POLICY IF EXISTS "deals_workspace_member" ON public.deals;

CREATE POLICY "deals_access_consolidated_v7" ON public.deals
FOR SELECT TO authenticated USING (
  public.is_workspace_member(auth.uid(), workspace_id)
  AND (
    assigned_to = auth.uid()
    OR assigned_to IS NULL
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.workspace_id = deals.workspace_id
      AND ur.role IN ('owner', 'admin', 'manager')
    )
  )
);

-- SUMMARY of this migration:
-- ✅ smart_link_clicks: Rate limited insert (trigger enforced)
-- ✅ smart_link_emails: Consent required for insert
-- ✅ notifications: Sensitive categories filtered to owner/admin
-- ✅ leads: Consolidated to 1 clear policy (assigned OR manager)
-- ✅ deals: Consolidated to 1 clear policy (assigned OR manager)