-- =============================================
-- Template Ads Factory - Database Schema
-- =============================================

-- Creative Jobs: Main job tracking
CREATE TABLE public.creative_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'done', 'failed', 'needs_manual_review')),
  provider TEXT NOT NULL DEFAULT 'creatomate',
  objective TEXT NOT NULL CHECK (objective IN ('lead', 'sale', 'booking', 'awareness')),
  language TEXT NOT NULL DEFAULT 'fr',
  geo TEXT,
  style TEXT DEFAULT 'minimal_premium',
  duration_seconds INTEGER DEFAULT 15,
  input_json JSONB NOT NULL DEFAULT '{}',
  output_json JSONB,
  cost_estimate NUMERIC(10,4),
  duration_ms INTEGER,
  error_message TEXT,
  qa_iterations INTEGER DEFAULT 0,
  approval_id UUID REFERENCES public.approval_queue(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Creative Blueprints: Versioned blueprints for iteration
CREATE TABLE public.creative_blueprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.creative_jobs(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  blueprint_json JSONB NOT NULL,
  qa_report_json JSONB,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, version)
);

-- Creative Assets: Final outputs
CREATE TABLE public.creative_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.creative_jobs(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('video_9_16', 'video_1_1', 'video_16_9', 'thumbnail', 'srt', 'copy_pack')),
  url TEXT,
  storage_path TEXT,
  meta_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Video Templates: Pre-configured base templates (if needed for optimization)
CREATE TABLE public.video_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'creatomate',
  aspect_ratio TEXT NOT NULL CHECK (aspect_ratio IN ('9:16', '1:1', '16:9')),
  language TEXT NOT NULL DEFAULT 'fr',
  category TEXT,
  template_json JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creative_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: READ-ONLY for workspace members (writes via service_role only)

-- creative_jobs: Read for workspace members
CREATE POLICY "Workspace members can view creative jobs"
ON public.creative_jobs FOR SELECT
USING (public.has_workspace_access(auth.uid(), workspace_id));

-- creative_blueprints: Read for workspace members
CREATE POLICY "Workspace members can view creative blueprints"
ON public.creative_blueprints FOR SELECT
USING (public.has_workspace_access(auth.uid(), workspace_id));

-- creative_assets: Read for workspace members
CREATE POLICY "Workspace members can view creative assets"
ON public.creative_assets FOR SELECT
USING (public.has_workspace_access(auth.uid(), workspace_id));

-- video_templates: Read for workspace members (global or workspace-specific)
CREATE POLICY "View global or workspace templates"
ON public.video_templates FOR SELECT
USING (is_global = true OR public.has_workspace_access(auth.uid(), workspace_id));

-- Indexes for performance
CREATE INDEX idx_creative_jobs_workspace ON public.creative_jobs(workspace_id);
CREATE INDEX idx_creative_jobs_status ON public.creative_jobs(status);
CREATE INDEX idx_creative_jobs_site ON public.creative_jobs(site_id);
CREATE INDEX idx_creative_blueprints_job ON public.creative_blueprints(job_id);
CREATE INDEX idx_creative_assets_job ON public.creative_assets(job_id);
CREATE INDEX idx_creative_assets_type ON public.creative_assets(asset_type);

-- Trigger for updated_at
CREATE TRIGGER update_creative_jobs_updated_at
BEFORE UPDATE ON public.creative_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();