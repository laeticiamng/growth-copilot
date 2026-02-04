-- =====================================================
-- MIGRATION V9: FINAL SECURITY CONSOLIDATION (FIXED V2)
-- Resolves all remaining security scan findings
-- =====================================================

-- 1. CRITICAL: Restrict policy_profiles to authenticated only
DROP POLICY IF EXISTS "policy_profiles_public_select" ON public.policy_profiles;
DROP POLICY IF EXISTS "System presets are readable" ON public.policy_profiles;
DROP POLICY IF EXISTS "System presets readable" ON public.policy_profiles;
DROP POLICY IF EXISTS "Workspace members can view their profiles" ON public.policy_profiles;
DROP POLICY IF EXISTS "policy_profiles_authenticated_only_v9" ON public.policy_profiles;
DROP POLICY IF EXISTS "policy_profiles_auth_v9" ON public.policy_profiles;

CREATE POLICY "policy_profiles_final_v9" 
ON public.policy_profiles FOR SELECT TO authenticated
USING (
  is_system_preset = true 
  OR public.is_workspace_member(auth.uid(), workspace_id)
);

-- 2. Restrict platform_policies to authenticated
DROP POLICY IF EXISTS "Platform policies public read" ON public.platform_policies;
DROP POLICY IF EXISTS "platform_policies_public_select" ON public.platform_policies;
DROP POLICY IF EXISTS "Platform policies readable" ON public.platform_policies;
DROP POLICY IF EXISTS "platform_policies_authenticated_v9" ON public.platform_policies;
DROP POLICY IF EXISTS "platform_policies_auth_v9" ON public.platform_policies;

CREATE POLICY "platform_policies_final_v9" 
ON public.platform_policies FOR SELECT TO authenticated
USING (true);

-- 3. Restrict safe_zone_configs to authenticated  
DROP POLICY IF EXISTS "Safe zones public read" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "safe_zone_configs_public_select" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "Safe zones readable" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "safe_zone_configs_authenticated_v9" ON public.safe_zone_configs;
DROP POLICY IF EXISTS "safe_zone_configs_auth_v9" ON public.safe_zone_configs;

CREATE POLICY "safe_zone_configs_final_v9" 
ON public.safe_zone_configs FOR SELECT TO authenticated
USING (true);

-- 4. Restrict ai_providers to authenticated
DROP POLICY IF EXISTS "AI providers public read" ON public.ai_providers;
DROP POLICY IF EXISTS "ai_providers_public_select" ON public.ai_providers;
DROP POLICY IF EXISTS "AI providers readable" ON public.ai_providers;
DROP POLICY IF EXISTS "ai_providers_authenticated_v9" ON public.ai_providers;
DROP POLICY IF EXISTS "ai_providers_auth_v9" ON public.ai_providers;

CREATE POLICY "ai_providers_final_v9" 
ON public.ai_providers FOR SELECT TO authenticated
USING (true);

-- 5. Restrict ai_models to authenticated
DROP POLICY IF EXISTS "AI models public read" ON public.ai_models;
DROP POLICY IF EXISTS "ai_models_public_select" ON public.ai_models;
DROP POLICY IF EXISTS "AI models readable" ON public.ai_models;
DROP POLICY IF EXISTS "ai_models_authenticated_v9" ON public.ai_models;
DROP POLICY IF EXISTS "ai_models_auth_v9" ON public.ai_models;

CREATE POLICY "ai_models_final_v9" 
ON public.ai_models FOR SELECT TO authenticated
USING (true);

-- 6. Restrict role_permissions to authenticated
DROP POLICY IF EXISTS "Role permissions public read" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_public_select" ON public.role_permissions;
DROP POLICY IF EXISTS "Role permissions readable" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_authenticated_v7" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_authenticated_v9" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_auth_v9" ON public.role_permissions;

CREATE POLICY "role_permissions_final_v9" 
ON public.role_permissions FOR SELECT TO authenticated
USING (true);

-- 7. Consolidate leads policies
DROP POLICY IF EXISTS "leads_access_consolidated_v7" ON public.leads;
DROP POLICY IF EXISTS "Leads workspace members select" ON public.leads;
DROP POLICY IF EXISTS "Users can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Managers can view all leads" ON public.leads;
DROP POLICY IF EXISTS "leads_sales_access" ON public.leads;
DROP POLICY IF EXISTS "leads_assigned_access" ON public.leads;
DROP POLICY IF EXISTS "leads_manager_access" ON public.leads;
DROP POLICY IF EXISTS "leads_admin_access" ON public.leads;
DROP POLICY IF EXISTS "leads_owner_access" ON public.leads;
DROP POLICY IF EXISTS "leads_unified_access_v9" ON public.leads;
DROP POLICY IF EXISTS "leads_unified_v9" ON public.leads;

CREATE POLICY "leads_final_v9" ON public.leads 
FOR SELECT TO authenticated
USING (
  public.is_workspace_member(auth.uid(), workspace_id)
  AND (
    assigned_to = auth.uid() 
    OR assigned_to IS NULL
    OR public.has_sales_access(auth.uid(), workspace_id)
  )
);

-- 8. Consolidate deals policies
DROP POLICY IF EXISTS "deals_access_consolidated_v7" ON public.deals;
DROP POLICY IF EXISTS "Deals workspace members select" ON public.deals;
DROP POLICY IF EXISTS "Users can view assigned deals" ON public.deals;
DROP POLICY IF EXISTS "deals_sales_access" ON public.deals;
DROP POLICY IF EXISTS "deals_assigned_access" ON public.deals;
DROP POLICY IF EXISTS "deals_manager_access" ON public.deals;
DROP POLICY IF EXISTS "deals_admin_access" ON public.deals;
DROP POLICY IF EXISTS "deals_unified_access_v9" ON public.deals;
DROP POLICY IF EXISTS "deals_unified_v9" ON public.deals;

CREATE POLICY "deals_final_v9" ON public.deals 
FOR SELECT TO authenticated
USING (
  public.is_workspace_member(auth.uid(), workspace_id)
  AND (
    assigned_to = auth.uid() 
    OR assigned_to IS NULL
    OR public.has_sales_access(auth.uid(), workspace_id)
  )
);

-- 9. Consolidate employees policies (HR + self-view)
DROP POLICY IF EXISTS "employees_hr_access_v8" ON public.employees;
DROP POLICY IF EXISTS "employees_self_view" ON public.employees;
DROP POLICY IF EXISTS "Employees self view" ON public.employees;
DROP POLICY IF EXISTS "HR can view employees" ON public.employees;
DROP POLICY IF EXISTS "employees_admin_access" ON public.employees;
DROP POLICY IF EXISTS "employees_owner_access" ON public.employees;
DROP POLICY IF EXISTS "employees_hr_only" ON public.employees;
DROP POLICY IF EXISTS "employees_basic_info" ON public.employees;
DROP POLICY IF EXISTS "employees_unified_access_v9" ON public.employees;
DROP POLICY IF EXISTS "employees_unified_v9" ON public.employees;

CREATE POLICY "employees_final_v9" ON public.employees 
FOR SELECT TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    user_id = auth.uid()
    OR public.has_hr_access(auth.uid(), workspace_id)
  )
);

-- 10. Consolidate contracts policies
DROP POLICY IF EXISTS "contracts_billing_access_v8" ON public.contracts;
DROP POLICY IF EXISTS "Contracts workspace access" ON public.contracts;
DROP POLICY IF EXISTS "contracts_billing_only" ON public.contracts;
DROP POLICY IF EXISTS "contracts_admin_access" ON public.contracts;
DROP POLICY IF EXISTS "contracts_owner_access" ON public.contracts;
DROP POLICY IF EXISTS "contracts_unified_access_v9" ON public.contracts;
DROP POLICY IF EXISTS "contracts_unified_v9" ON public.contracts;

CREATE POLICY "contracts_final_v9" ON public.contracts 
FOR SELECT TO authenticated
USING (
  public.has_billing_access(auth.uid(), workspace_id)
);

-- 11. Consolidate performance_reviews policies
DROP POLICY IF EXISTS "performance_reviews_hr_access_v8" ON public.performance_reviews;
DROP POLICY IF EXISTS "Performance reviews self view" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_self" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_reviewer" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_hr" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_admin" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_unified_v9" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_v9" ON public.performance_reviews;

CREATE POLICY "performance_reviews_final_v9" ON public.performance_reviews 
FOR SELECT TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR reviewer_id = auth.uid()
    OR public.has_hr_access(auth.uid(), workspace_id)
  )
);

-- 12. Consolidate gdpr_requests policies (uses requester_email, not user_id)
DROP POLICY IF EXISTS "GDPR requests self view" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_self" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_privacy_officer" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_admin" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_owner" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_unified_v9" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_v9" ON public.gdpr_requests;

CREATE POLICY "gdpr_requests_final_v9" ON public.gdpr_requests 
FOR SELECT TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND public.has_hr_access(auth.uid(), workspace_id)
);

-- 13. Consolidate meta_conversations policies
DROP POLICY IF EXISTS "Meta conversations workspace access" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_support" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_manager" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_admin" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_unified_v9" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_v9" ON public.meta_conversations;

CREATE POLICY "meta_conversations_final_v9" ON public.meta_conversations 
FOR SELECT TO authenticated
USING (
  public.is_workspace_member(auth.uid(), workspace_id)
);

-- 14. smart_link_clicks uses media_asset_id (no direct workspace_id)
-- Access via media_assets.workspace_id
DROP POLICY IF EXISTS "Smart link clicks workspace read" ON public.smart_link_clicks;
DROP POLICY IF EXISTS "smart_link_clicks_workspace_read" ON public.smart_link_clicks;
DROP POLICY IF EXISTS "smart_link_clicks_restricted_v9" ON public.smart_link_clicks;
DROP POLICY IF EXISTS "smart_link_clicks_v9" ON public.smart_link_clicks;

CREATE POLICY "smart_link_clicks_final_v9" ON public.smart_link_clicks 
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.media_assets ma
    WHERE ma.id = smart_link_clicks.media_asset_id
    AND public.has_sales_access(auth.uid(), ma.workspace_id)
  )
);

-- 15. Restrict smart_link_emails read to owners only
DROP POLICY IF EXISTS "Smart link emails workspace read" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_workspace_read" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_marketing_read_v8" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_owner_only_v9" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_v9" ON public.smart_link_emails;

CREATE POLICY "smart_link_emails_final_v9" ON public.smart_link_emails 
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.workspace_id = smart_link_emails.workspace_id
    AND ur.role = 'owner'
  )
);

-- 16. Simplify notifications with category filtering
DROP POLICY IF EXISTS "notifications_filtered_v8" ON public.notifications;
DROP POLICY IF EXISTS "Notifications workspace access" ON public.notifications;
DROP POLICY IF EXISTS "notifications_workspace_read" ON public.notifications;
DROP POLICY IF EXISTS "notifications_category_filtered_v9" ON public.notifications;
DROP POLICY IF EXISTS "notifications_v9" ON public.notifications;

CREATE POLICY "notifications_final_v9" ON public.notifications 
FOR SELECT TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    user_id = auth.uid()
    OR (
      category NOT IN ('security', 'billing', 'compliance', 'hr')
      OR public.has_hr_access(auth.uid(), workspace_id)
    )
  )
);

-- 17. Ensure creative_jobs requires proper approval visibility
DROP POLICY IF EXISTS "creative_jobs_workspace_read" ON public.creative_jobs;
DROP POLICY IF EXISTS "Creative jobs workspace access" ON public.creative_jobs;
DROP POLICY IF EXISTS "creative_jobs_approval_aware_v9" ON public.creative_jobs;
DROP POLICY IF EXISTS "creative_jobs_v9" ON public.creative_jobs;

CREATE POLICY "creative_jobs_final_v9" ON public.creative_jobs 
FOR SELECT TO authenticated
USING (
  public.is_workspace_member(auth.uid(), workspace_id)
  AND (
    status IN ('done', 'published')
    OR public.has_permission(auth.uid(), workspace_id, 'approve_actions')
  )
);