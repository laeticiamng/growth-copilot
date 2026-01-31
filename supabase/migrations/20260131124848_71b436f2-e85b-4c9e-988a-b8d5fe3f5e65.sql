-- AI Providers table
CREATE TABLE public.ai_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (name IN ('openai', 'anthropic', 'google', 'lovable')),
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Models table
CREATE TABLE public.ai_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('orchestrator', 'worker', 'writer', 'router')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  max_output_tokens INTEGER DEFAULT 4096,
  temperature NUMERIC(3,2) DEFAULT 0.7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, model_name, purpose)
);

-- AI Requests log table (detailed audit)
CREATE TABLE public.ai_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  input_hash TEXT,
  input_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_json JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error', 'retry', 'fallback')),
  error_message TEXT,
  tokens_in INTEGER,
  tokens_out INTEGER,
  cost_estimate NUMERIC(10,6),
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add columns to agent_runs for AI tracking
ALTER TABLE public.agent_runs 
ADD COLUMN IF NOT EXISTS ai_request_id UUID REFERENCES public.ai_requests(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS provider_name TEXT,
ADD COLUMN IF NOT EXISTS model_name TEXT;

-- Enable RLS on new tables
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_requests ENABLE ROW LEVEL SECURITY;

-- AI Providers: readable by all authenticated users (config data)
CREATE POLICY "ai_providers_select" ON public.ai_providers
FOR SELECT TO authenticated USING (true);

-- AI Models: readable by all authenticated users (config data)
CREATE POLICY "ai_models_select" ON public.ai_models
FOR SELECT TO authenticated USING (true);

-- AI Requests: readable only by workspace members
CREATE POLICY "ai_requests_select" ON public.ai_requests
FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- AI Requests: insert only (no update/delete from client - service role only)
CREATE POLICY "ai_requests_insert" ON public.ai_requests
FOR INSERT WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- Seed default providers and models (using Lovable AI Gateway)
INSERT INTO public.ai_providers (name, is_enabled) VALUES
  ('lovable', true),
  ('openai', false),
  ('anthropic', false),
  ('google', false);

-- Get the lovable provider id for model seeding
INSERT INTO public.ai_models (provider_id, model_name, purpose, is_default, max_output_tokens, temperature)
SELECT 
  p.id,
  m.model_name,
  m.purpose,
  m.is_default,
  m.max_output_tokens,
  m.temperature
FROM public.ai_providers p
CROSS JOIN (VALUES
  ('google/gemini-2.5-flash', 'orchestrator', true, 8192, 0.3),
  ('google/gemini-2.5-flash', 'worker', true, 4096, 0.2),
  ('google/gemini-2.5-flash-lite', 'writer', true, 4096, 0.7),
  ('google/gemini-2.5-flash-lite', 'router', true, 1024, 0.1)
) AS m(model_name, purpose, is_default, max_output_tokens, temperature)
WHERE p.name = 'lovable';

-- Create index for faster ai_requests lookups
CREATE INDEX idx_ai_requests_workspace_id ON public.ai_requests(workspace_id);
CREATE INDEX idx_ai_requests_created_at ON public.ai_requests(created_at DESC);
CREATE INDEX idx_ai_requests_agent_name ON public.ai_requests(agent_name);
CREATE INDEX idx_ai_requests_status ON public.ai_requests(status);