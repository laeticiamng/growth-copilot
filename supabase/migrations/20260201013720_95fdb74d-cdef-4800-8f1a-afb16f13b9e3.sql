-- Add unique constraint on autopilot_settings.workspace_id for upsert operations
ALTER TABLE public.autopilot_settings 
ADD CONSTRAINT autopilot_settings_workspace_id_key UNIQUE (workspace_id);