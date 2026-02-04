-- =====================================================
-- MIGRATION V10: FINAL POLICY CLEANUP
-- Remove ALL redundant/legacy policies
-- =====================================================

-- EMPLOYEES: Remove all legacy policies, keep only unified
DROP POLICY IF EXISTS "Employees select own data" ON public.employees;
DROP POLICY IF EXISTS "Employees select for HR" ON public.employees;
DROP POLICY IF EXISTS "employees_self_select" ON public.employees;
DROP POLICY IF EXISTS "employees_hr_select" ON public.employees;
DROP POLICY IF EXISTS "employees_workspace_select" ON public.employees;
DROP POLICY IF EXISTS "employees_admin_select" ON public.employees;
DROP POLICY IF EXISTS "employees_owner_select" ON public.employees;
DROP POLICY IF EXISTS "employees_restricted_v5" ON public.employees;
DROP POLICY IF EXISTS "employees_hr_v5" ON public.employees;
DROP POLICY IF EXISTS "employees_self_v5" ON public.employees;
DROP POLICY IF EXISTS "employees_pii_self_v8" ON public.employees;

-- PERFORMANCE_REVIEWS: Remove all legacy policies
DROP POLICY IF EXISTS "Performance reviews select own" ON public.performance_reviews;
DROP POLICY IF EXISTS "Performance reviews select reviewer" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_employee_select" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_reviewer_select" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_hr_select" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_restricted_v5" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_self_v5" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_reviewer_v5" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_hr_v5" ON public.performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_restricted_v8" ON public.performance_reviews;

-- CONTRACTS: Remove all legacy policies
DROP POLICY IF EXISTS "Contracts select billing" ON public.contracts;
DROP POLICY IF EXISTS "contracts_billing_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_owner_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_billing_only_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_billing_owner_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_admin_select" ON public.contracts;
DROP POLICY IF EXISTS "contracts_billing_v5" ON public.contracts;
DROP POLICY IF EXISTS "contracts_owner_v5" ON public.contracts;
DROP POLICY IF EXISTS "contracts_restricted_v8" ON public.contracts;

-- LEADS: Remove all legacy policies
DROP POLICY IF EXISTS "Leads select assigned" ON public.leads;
DROP POLICY IF EXISTS "Leads select workspace" ON public.leads;
DROP POLICY IF EXISTS "leads_assigned_select" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_select" ON public.leads;
DROP POLICY IF EXISTS "leads_manager_select" ON public.leads;
DROP POLICY IF EXISTS "leads_restricted_select" ON public.leads;
DROP POLICY IF EXISTS "leads_assigned_v5" ON public.leads;
DROP POLICY IF EXISTS "leads_manager_v5" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_v5" ON public.leads;

-- DEALS: Remove all legacy policies
DROP POLICY IF EXISTS "Deals select assigned" ON public.deals;
DROP POLICY IF EXISTS "Deals select workspace" ON public.deals;
DROP POLICY IF EXISTS "deals_assigned_select" ON public.deals;
DROP POLICY IF EXISTS "deals_workspace_select" ON public.deals;
DROP POLICY IF EXISTS "deals_manager_select" ON public.deals;
DROP POLICY IF EXISTS "deals_restricted_select" ON public.deals;
DROP POLICY IF EXISTS "deals_assigned_v5" ON public.deals;
DROP POLICY IF EXISTS "deals_manager_v5" ON public.deals;
DROP POLICY IF EXISTS "deals_workspace_v5" ON public.deals;

-- GDPR_REQUESTS: Remove all legacy policies
DROP POLICY IF EXISTS "GDPR requests select owner" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_select" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_owner_select" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_hr_select" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_requester_select" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_privacy_v5" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_owner_v5" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_requester_v5" ON public.gdpr_requests;
DROP POLICY IF EXISTS "gdpr_requests_hr_v8" ON public.gdpr_requests;

-- META_CONVERSATIONS: Remove all legacy policies
DROP POLICY IF EXISTS "Meta conversations select" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_select" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_workspace_select" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_team_select" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_team_v8" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_agent_v5" ON public.meta_conversations;

-- SMART_LINK_EMAILS: Remove all legacy policies
DROP POLICY IF EXISTS "Smart link emails select" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_select" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_owner_select" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_marketing_select" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_marketing_v5" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_owner_v5" ON public.smart_link_emails;

-- NOTIFICATIONS: Remove all legacy policies
DROP POLICY IF EXISTS "Users can view their own or workspace notifications" ON public.notifications;
DROP POLICY IF EXISTS "Notifications select user" ON public.notifications;
DROP POLICY IF EXISTS "notifications_user_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_workspace_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_personal_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_user_v5" ON public.notifications;
DROP POLICY IF EXISTS "notifications_workspace_v5" ON public.notifications;
DROP POLICY IF EXISTS "notifications_category_v8" ON public.notifications;

-- CREATIVE_JOBS: Remove all legacy policies
DROP POLICY IF EXISTS "Workspace members can view creative jobs with approval control" ON public.creative_jobs;
DROP POLICY IF EXISTS "Creative jobs select workspace" ON public.creative_jobs;
DROP POLICY IF EXISTS "creative_jobs_select" ON public.creative_jobs;
DROP POLICY IF EXISTS "creative_jobs_workspace_select" ON public.creative_jobs;
DROP POLICY IF EXISTS "creative_jobs_approval_select" ON public.creative_jobs;
DROP POLICY IF EXISTS "creative_jobs_approval_v5" ON public.creative_jobs;

-- AI_REQUESTS: Remove legacy policies
DROP POLICY IF EXISTS "AI requests select own" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_user_select" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_billing_select" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_owner_billing_select" ON public.ai_requests;
DROP POLICY IF EXISTS "ai_requests_user_v5" ON public.ai_requests;

-- POLICY_PROFILES: Remove legacy policies, keep system preset access
DROP POLICY IF EXISTS "policy_profiles_select" ON public.policy_profiles;
DROP POLICY IF EXISTS "policy_profiles_system_select" ON public.policy_profiles;
DROP POLICY IF EXISTS "policy_profiles_workspace_select" ON public.policy_profiles;
DROP POLICY IF EXISTS "policy_profiles_system_v5" ON public.policy_profiles;

-- INTEGRATION_TOKENS: Remove legacy policies
DROP POLICY IF EXISTS "integration_tokens_owner_select" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_select" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_workspace_select" ON public.integration_tokens;
DROP POLICY IF EXISTS "integration_tokens_owner_v5" ON public.integration_tokens;

-- SMART_LINK_CLICKS: Remove legacy policies
DROP POLICY IF EXISTS "smart_link_clicks_select" ON public.smart_link_clicks;
DROP POLICY IF EXISTS "smart_link_clicks_workspace_select" ON public.smart_link_clicks;
DROP POLICY IF EXISTS "smart_link_clicks_manager_select" ON public.smart_link_clicks;
DROP POLICY IF EXISTS "smart_link_clicks_analytics_v5" ON public.smart_link_clicks;