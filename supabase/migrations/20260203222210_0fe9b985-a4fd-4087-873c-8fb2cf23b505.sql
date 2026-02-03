-- Security hardening: Add restrictive RLS policies for sensitive tables
-- This migration adds workspace-scoped access controls to protect employee, lead, contract, and GDPR data

-- =============================================
-- 1. EMPLOYEES TABLE - Restrict to HR/Managers only
-- =============================================

-- Drop overly permissive policies if they exist
DROP POLICY IF EXISTS "Users can view employees in their workspace" ON public.employees;
DROP POLICY IF EXISTS "Users can manage employees in their workspace" ON public.employees;

-- Create restrictive policies
CREATE POLICY "HR personnel can view employees" 
ON public.employees FOR SELECT 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_team')
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

CREATE POLICY "HR personnel can manage employees" 
ON public.employees FOR ALL 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_team')
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
)
WITH CHECK (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_team')
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

-- =============================================
-- 2. LEADS TABLE - Restrict to sales team
-- =============================================

DROP POLICY IF EXISTS "Users can view leads in their workspace" ON public.leads;
DROP POLICY IF EXISTS "Users can manage leads in their workspace" ON public.leads;

CREATE POLICY "Sales team can view leads" 
ON public.leads FOR SELECT 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
);

CREATE POLICY "Sales team can manage leads" 
ON public.leads FOR ALL 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
)
WITH CHECK (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
);

-- =============================================
-- 3. CONTRACTS TABLE - Restrict to legal/admin
-- =============================================

DROP POLICY IF EXISTS "Users can view contracts in their workspace" ON public.contracts;
DROP POLICY IF EXISTS "Users can manage contracts in their workspace" ON public.contracts;

CREATE POLICY "Authorized users can view contracts" 
ON public.contracts FOR SELECT 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
);

CREATE POLICY "Admins can manage contracts" 
ON public.contracts FOR ALL 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND public.get_effective_role(auth.uid(), workspace_id) IN ('admin', 'owner', 'manager')
)
WITH CHECK (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND public.get_effective_role(auth.uid(), workspace_id) IN ('admin', 'owner', 'manager')
);

-- =============================================
-- 4. GDPR_REQUESTS TABLE - Restrict to compliance officers
-- =============================================

DROP POLICY IF EXISTS "Users can view GDPR requests" ON public.gdpr_requests;
DROP POLICY IF EXISTS "Users can manage GDPR requests" ON public.gdpr_requests;

CREATE POLICY "Compliance can view GDPR requests" 
ON public.gdpr_requests FOR SELECT 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND public.get_effective_role(auth.uid(), workspace_id) IN ('admin', 'owner', 'manager')
);

CREATE POLICY "Compliance can manage GDPR requests" 
ON public.gdpr_requests FOR ALL 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND public.get_effective_role(auth.uid(), workspace_id) IN ('admin', 'owner', 'manager')
)
WITH CHECK (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND public.get_effective_role(auth.uid(), workspace_id) IN ('admin', 'owner', 'manager')
);

-- =============================================
-- 5. META_CONVERSATIONS and META_MESSAGES - Restrict access
-- =============================================

DROP POLICY IF EXISTS "Users can view conversations" ON public.meta_conversations;
DROP POLICY IF EXISTS "Users can view messages" ON public.meta_messages;

CREATE POLICY "Workspace members can view conversations" 
ON public.meta_conversations FOR SELECT 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
);

CREATE POLICY "Workspace members can view messages" 
ON public.meta_messages FOR SELECT 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
);

-- =============================================
-- 6. Create performance_reviews table for HR module
-- =============================================

CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  overall_score NUMERIC(3,2) CHECK (overall_score >= 0 AND overall_score <= 5),
  strengths TEXT[],
  areas_for_improvement TEXT[],
  goals_met JSONB DEFAULT '[]',
  next_period_goals JSONB DEFAULT '[]',
  comments TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged', 'completed')),
  submitted_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can manage performance reviews" 
ON public.performance_reviews FOR ALL 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_team')
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
)
WITH CHECK (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_team')
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

-- =============================================
-- 7. Create time_off_requests table for HR module
-- =============================================

CREATE TABLE IF NOT EXISTS public.time_off_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('vacation', 'sick', 'personal', 'parental', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC(4,1) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can manage time off requests" 
ON public.time_off_requests FOR ALL 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
)
WITH CHECK (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
);

-- =============================================
-- 8. Create legal_templates table for Legal module
-- =============================================

CREATE TABLE IF NOT EXISTS public.legal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('cgu', 'cgv', 'nda', 'employment', 'service', 'privacy', 'terms', 'other')),
  description TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.legal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view templates" 
ON public.legal_templates FOR SELECT 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
);

CREATE POLICY "Admins can manage templates" 
ON public.legal_templates FOR ALL 
TO authenticated
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND public.get_effective_role(auth.uid(), workspace_id) IN ('admin', 'owner', 'manager')
)
WITH CHECK (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  AND public.get_effective_role(auth.uid(), workspace_id) IN ('admin', 'owner', 'manager')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON public.performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_workspace ON public.performance_reviews(workspace_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_employee ON public.time_off_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_workspace ON public.time_off_requests(workspace_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_dates ON public.time_off_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_legal_templates_workspace ON public.legal_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_legal_templates_type ON public.legal_templates(template_type);