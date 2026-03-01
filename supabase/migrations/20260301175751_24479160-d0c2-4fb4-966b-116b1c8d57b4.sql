-- Enable realtime broadcasting for dashboard-critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.executive_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kpis_daily;