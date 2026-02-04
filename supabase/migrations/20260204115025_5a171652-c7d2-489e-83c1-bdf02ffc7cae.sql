-- =========================================================
-- SECURITY HARDENING - CORRECTED COLUMN NAMES
-- =========================================================

-- 6. FIX: deals - Restrict to assigned_to or managers (not owner_id)
DROP POLICY IF EXISTS "Users can view assigned deals or as manager" ON public.deals;
DROP POLICY IF EXISTS "Users can create deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update their deals or as manager" ON public.deals;
DROP POLICY IF EXISTS "Users can delete their deals or as manager" ON public.deals;

CREATE POLICY "Users can view assigned deals or as manager"
ON public.deals FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    assigned_to = auth.uid()
    OR public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

CREATE POLICY "Users can create deals"
ON public.deals FOR INSERT
WITH CHECK (
  public.has_workspace_access(auth.uid(), workspace_id)
);

CREATE POLICY "Users can update their deals or as manager"
ON public.deals FOR UPDATE
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    assigned_to = auth.uid()
    OR public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
  )
);

CREATE POLICY "Users can delete their deals or as manager"
ON public.deals FOR DELETE
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    assigned_to = auth.uid()
    OR public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
  )
);

-- 7. FIX: activities - Restrict to assigned user or managers
DROP POLICY IF EXISTS "Users can view assigned activities or as manager" ON public.activities;
DROP POLICY IF EXISTS "Users can create activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update assigned activities" ON public.activities;
DROP POLICY IF EXISTS "Users can delete their activities" ON public.activities;

CREATE POLICY "Users can view assigned activities or as manager"
ON public.activities FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

CREATE POLICY "Users can create activities"
ON public.activities FOR INSERT
WITH CHECK (
  public.has_workspace_access(auth.uid(), workspace_id)
);

CREATE POLICY "Users can update assigned activities"
ON public.activities FOR UPDATE
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
  )
);

CREATE POLICY "Users can delete their activities"
ON public.activities FOR DELETE
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    created_by = auth.uid()
    OR public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
  )
);

-- 8. FIX: approval_queue - Restrict to reviewers only
DROP POLICY IF EXISTS "Users can view relevant approvals" ON public.approval_queue;
DROP POLICY IF EXISTS "Reviewers can update approvals" ON public.approval_queue;

CREATE POLICY "Users can view relevant approvals"
ON public.approval_queue FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    public.has_permission(auth.uid(), workspace_id, 'approve_actions'::permission_action)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

CREATE POLICY "Reviewers can update approvals"
ON public.approval_queue FOR UPDATE
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    public.has_permission(auth.uid(), workspace_id, 'approve_actions'::permission_action)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

-- 9. FIX: time_off_requests - Restrict to employee, manager, and HR
DROP POLICY IF EXISTS "Users can view own requests or as HR" ON public.time_off_requests;
DROP POLICY IF EXISTS "Users can create own requests" ON public.time_off_requests;
DROP POLICY IF EXISTS "HR can update requests" ON public.time_off_requests;

CREATE POLICY "Users can view own requests or as HR"
ON public.time_off_requests FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

CREATE POLICY "Users can create own requests"
ON public.time_off_requests FOR INSERT
WITH CHECK (
  public.has_workspace_access(auth.uid(), workspace_id)
);

CREATE POLICY "HR can update requests"
ON public.time_off_requests FOR UPDATE
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
);

-- 10. FIX: compliance_tasks - Restrict to compliance officers
DROP POLICY IF EXISTS "Compliance officers can view tasks" ON public.compliance_tasks;
DROP POLICY IF EXISTS "Compliance officers can update tasks" ON public.compliance_tasks;

CREATE POLICY "Compliance officers can view tasks"
ON public.compliance_tasks FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

CREATE POLICY "Compliance officers can update tasks"
ON public.compliance_tasks FOR UPDATE
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
);

-- 11. FIX: incident_reports - Restrict to admins and security team
DROP POLICY IF EXISTS "Admins can view incident reports" ON public.incident_reports;
DROP POLICY IF EXISTS "Anyone in workspace can create incidents" ON public.incident_reports;
DROP POLICY IF EXISTS "Admins can update incident reports" ON public.incident_reports;

CREATE POLICY "Admins can view incident reports"
ON public.incident_reports FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

CREATE POLICY "Anyone in workspace can create incidents"
ON public.incident_reports FOR INSERT
WITH CHECK (
  public.has_workspace_access(auth.uid(), workspace_id)
);

CREATE POLICY "Admins can update incident reports"
ON public.incident_reports FOR UPDATE
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND public.has_permission(auth.uid(), workspace_id, 'manage_team'::permission_action)
);

-- 12. FIX: audit_log - Restrict to admins only
DROP POLICY IF EXISTS "Admins and owners can view audit log" ON public.audit_log;

CREATE POLICY "Admins and owners can view audit log"
ON public.audit_log FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    public.has_permission(auth.uid(), workspace_id, 'view_audit'::permission_action)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

-- 13. FIX: workspace_quotas - Restrict detailed info to owners
DROP POLICY IF EXISTS "Owners can view workspace quotas" ON public.workspace_quotas;

CREATE POLICY "Owners can view workspace quotas"
ON public.workspace_quotas FOR SELECT
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
  OR public.has_permission(auth.uid(), workspace_id, 'manage_billing'::permission_action)
);

-- 14. FIX: kpis_daily - Restrict financial KPIs to managers
DROP POLICY IF EXISTS "Managers can view daily KPIs" ON public.kpis_daily;

CREATE POLICY "Managers can view daily KPIs"
ON public.kpis_daily FOR SELECT
USING (
  public.has_workspace_access(auth.uid(), workspace_id)
  AND (
    public.has_permission(auth.uid(), workspace_id, 'view_analytics'::permission_action)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
  )
);