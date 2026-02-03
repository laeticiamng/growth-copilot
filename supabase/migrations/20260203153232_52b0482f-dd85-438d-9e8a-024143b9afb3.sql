
-- =============================================
-- TABLE: employees (RH Department)
-- =============================================
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  job_title TEXT NOT NULL,
  department TEXT,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'onboarding' CHECK (status IN ('active', 'onboarding', 'offboarding', 'on_leave', 'terminated')),
  manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  salary_annual NUMERIC(12,2),
  contract_type TEXT NOT NULL DEFAULT 'cdi' CHECK (contract_type IN ('cdi', 'cdd', 'freelance', 'internship', 'apprenticeship')),
  work_location TEXT,
  skills TEXT[],
  performance_score NUMERIC(3,2),
  last_review_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_employees_workspace ON public.employees(workspace_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(workspace_id, status);

DROP POLICY IF EXISTS "Employees workspace access" ON public.employees;
CREATE POLICY "Employees workspace access" ON public.employees
  FOR ALL USING (
    public.has_workspace_access(auth.uid(), workspace_id)
  );

-- =============================================
-- TABLE: contracts (Legal Department)
-- =============================================
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  contract_number TEXT,
  title TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  counterparty_name TEXT,
  counterparty_email TEXT,
  description TEXT,
  effective_date DATE,
  expiry_date DATE,
  auto_renew BOOLEAN DEFAULT FALSE,
  renewal_notice_days INTEGER DEFAULT 30,
  value_amount NUMERIC(14,2),
  value_currency TEXT DEFAULT 'EUR',
  payment_terms TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'active', 'expired', 'terminated')),
  document_url TEXT,
  signed_document_url TEXT,
  signed_at TIMESTAMPTZ,
  signed_by UUID,
  key_clauses TEXT[],
  obligations JSONB DEFAULT '[]',
  risk_assessment TEXT,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID,
  related_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_contracts_workspace ON public.contracts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_contracts_expiry ON public.contracts(expiry_date) WHERE status = 'active';

DROP POLICY IF EXISTS "Contracts workspace access" ON public.contracts;
CREATE POLICY "Contracts workspace access" ON public.contracts
  FOR ALL USING (
    public.has_workspace_access(auth.uid(), workspace_id)
  );

-- =============================================
-- TABLE: compliance_tasks (Legal/Governance)
-- =============================================
CREATE TABLE IF NOT EXISTS public.compliance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL, -- 'gdpr_request', 'audit', 'policy_review', 'training'
  title TEXT NOT NULL,
  description TEXT,
  regulation TEXT, -- 'gdpr', 'ccpa', 'hipaa', 'pci-dss', 'iso27001'
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID,
  evidence_urls TEXT[],
  completed_at TIMESTAMPTZ,
  completed_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.compliance_tasks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_compliance_tasks_workspace ON public.compliance_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_status ON public.compliance_tasks(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_due ON public.compliance_tasks(due_date) WHERE status NOT IN ('completed', 'cancelled');

DROP POLICY IF EXISTS "Compliance tasks workspace access" ON public.compliance_tasks;
CREATE POLICY "Compliance tasks workspace access" ON public.compliance_tasks
  FOR ALL USING (
    public.has_workspace_access(auth.uid(), workspace_id)
  );

-- =============================================
-- TABLE: gdpr_requests (Compliance/Legal)
-- =============================================
CREATE TABLE IF NOT EXISTS public.gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'deletion', 'rectification', 'portability', 'restriction', 'objection')),
  requester_email TEXT NOT NULL,
  requester_name TEXT,
  request_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  deadline DATE NOT NULL, -- GDPR: 30 days
  completed_at TIMESTAMPTZ,
  completed_by UUID,
  response_notes TEXT,
  export_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_gdpr_requests_workspace ON public.gdpr_requests(workspace_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status ON public.gdpr_requests(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_deadline ON public.gdpr_requests(deadline) WHERE status = 'pending';

DROP POLICY IF EXISTS "GDPR requests workspace access" ON public.gdpr_requests;
CREATE POLICY "GDPR requests workspace access" ON public.gdpr_requests
  FOR ALL USING (
    public.has_workspace_access(auth.uid(), workspace_id)
  );

-- =============================================
-- Triggers for updated_at
-- =============================================
DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_compliance_tasks_updated_at ON public.compliance_tasks;
CREATE TRIGGER update_compliance_tasks_updated_at
  BEFORE UPDATE ON public.compliance_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gdpr_requests_updated_at ON public.gdpr_requests;
CREATE TRIGGER update_gdpr_requests_updated_at
  BEFORE UPDATE ON public.gdpr_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
