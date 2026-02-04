-- =============================================================================
-- CONSOLIDATE RLS POLICIES: Remove duplicate and {public} role policies
-- Keep only the most restrictive authenticated policies
-- =============================================================================

-- EMPLOYEES: Remove duplicates
DROP POLICY IF EXISTS "Employees workspace access" ON public.employees;
DROP POLICY IF EXISTS "HR personnel can manage employees" ON public.employees;
DROP POLICY IF EXISTS "HR personnel can view employees" ON public.employees;
-- Keep: authenticated_employees_access

-- LEADS: Remove duplicates
DROP POLICY IF EXISTS "Leads workspace access" ON public.leads;
DROP POLICY IF EXISTS "leads_workspace_access" ON public.leads;
DROP POLICY IF EXISTS "Sales team can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Sales team can view leads" ON public.leads;
-- Keep: authenticated_leads_access

-- CONTRACTS: Remove duplicates
DROP POLICY IF EXISTS "Contracts workspace access" ON public.contracts;
DROP POLICY IF EXISTS "Admins can manage contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authorized users can view contracts" ON public.contracts;
-- Keep: authenticated_contracts_access

-- DEALS: Remove duplicates
DROP POLICY IF EXISTS "deals workspace access" ON public.deals;
DROP POLICY IF EXISTS "Workspace access for deals" ON public.deals;
-- Keep: authenticated_deals_access

-- GDPR_REQUESTS: Remove duplicates
DROP POLICY IF EXISTS "GDPR requests workspace access" ON public.gdpr_requests;
DROP POLICY IF EXISTS "Compliance can manage GDPR requests" ON public.gdpr_requests;
DROP POLICY IF EXISTS "Compliance can view GDPR requests" ON public.gdpr_requests;
-- Keep: authenticated_gdpr_requests_access

-- INTEGRATION_TOKENS: Remove duplicates
DROP POLICY IF EXISTS "integration_tokens workspace access" ON public.integration_tokens;
DROP POLICY IF EXISTS "tokens_workspace_access" ON public.integration_tokens;
-- Keep: authenticated_integration_tokens_access

-- OAUTH_TOKENS: Remove duplicates, keep only owner access
DROP POLICY IF EXISTS "oauth_tokens via integration access" ON public.oauth_tokens;
DROP POLICY IF EXISTS "Owner can manage oauth_tokens" ON public.oauth_tokens;
DROP POLICY IF EXISTS "Workspace access for oauth_tokens" ON public.oauth_tokens;
-- Keep: authenticated_oauth_tokens_access

-- META_CONVERSATIONS: Remove duplicates
DROP POLICY IF EXISTS "Workspace access for meta_conversations" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations access" ON public.meta_conversations;
DROP POLICY IF EXISTS "meta_conversations_workspace_access" ON public.meta_conversations;
-- Keep: authenticated_meta_conversations_access

-- META_MESSAGES: Remove duplicates
DROP POLICY IF EXISTS "Workspace access for meta_messages" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages access" ON public.meta_messages;
DROP POLICY IF EXISTS "meta_messages_workspace_access" ON public.meta_messages;
-- Keep: authenticated_meta_messages_access

-- PERFORMANCE_REVIEWS: Remove duplicates
DROP POLICY IF EXISTS "Performance reviews workspace access" ON public.performance_reviews;
DROP POLICY IF EXISTS "HR can manage performance reviews" ON public.performance_reviews;
DROP POLICY IF EXISTS "HR can view performance reviews" ON public.performance_reviews;
-- Keep: authenticated_performance_reviews_access

-- TIME_OFF_REQUESTS: Remove duplicates
DROP POLICY IF EXISTS "Time off requests workspace access" ON public.time_off_requests;
DROP POLICY IF EXISTS "HR can manage time off requests" ON public.time_off_requests;
-- Keep: authenticated_time_off_requests_access

-- SMART_LINK_EMAILS: Consolidate (keep public INSERT for lead capture + authenticated SELECT)
DROP POLICY IF EXISTS "smart_link_emails_workspace_access" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_workspace_insert" ON public.smart_link_emails;
DROP POLICY IF EXISTS "Workspace view smart link emails" ON public.smart_link_emails;
DROP POLICY IF EXISTS "Workspace access for smart_link_emails" ON public.smart_link_emails;
-- Keep: Anyone can insert, Public can insert with rate limit, authenticated_smart_link_emails_select

-- COMPLIANCE_TASKS: Remove duplicates
DROP POLICY IF EXISTS "Compliance tasks workspace access" ON public.compliance_tasks;
-- Keep: authenticated_compliance_tasks_access

-- LEGAL_TEMPLATES: Remove duplicates
DROP POLICY IF EXISTS "Legal templates workspace access" ON public.legal_templates;
-- Keep: authenticated_legal_templates_access