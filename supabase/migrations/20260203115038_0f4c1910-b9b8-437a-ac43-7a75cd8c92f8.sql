-- Create trigger to auto-enable core services and scheduled runs on workspace creation
DROP TRIGGER IF EXISTS tr_auto_enable_core_services ON public.workspaces;

CREATE TRIGGER tr_auto_enable_core_services
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_enable_core_services();

-- Backfill: Create scheduled runs for existing workspaces that don't have them
INSERT INTO public.scheduled_runs (workspace_id, run_type, schedule_cron, enabled)
SELECT w.id, 'DAILY_EXECUTIVE_BRIEF', '0 8 * * *', true
FROM public.workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM public.scheduled_runs sr 
  WHERE sr.workspace_id = w.id AND sr.run_type = 'DAILY_EXECUTIVE_BRIEF'
);

INSERT INTO public.scheduled_runs (workspace_id, run_type, schedule_cron, enabled)
SELECT w.id, 'WEEKLY_EXECUTIVE_REVIEW', '0 9 * * 1', true
FROM public.workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM public.scheduled_runs sr 
  WHERE sr.workspace_id = w.id AND sr.run_type = 'WEEKLY_EXECUTIVE_REVIEW'
);