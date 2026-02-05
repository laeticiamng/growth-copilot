-- Add unique constraint on workspace_id + provider for upsert to work
ALTER TABLE public.integrations 
ADD CONSTRAINT integrations_workspace_provider_unique 
UNIQUE (workspace_id, provider);