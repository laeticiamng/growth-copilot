-- Data Quality Alerts table for Analytics Guardian
CREATE TABLE public.data_quality_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  alert_type text NOT NULL, -- 'data_gap', 'anomaly', 'tracking_suspect', 'zero_conversions', 'sudden_drop'
  severity text NOT NULL DEFAULT 'warning', -- 'critical', 'warning', 'info'
  title text NOT NULL,
  description text,
  metric_name text, -- e.g. 'conversions', 'sessions', 'clicks'
  expected_value numeric,
  actual_value numeric,
  date_range_start date,
  date_range_end date,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add source tracking to kpis_daily
ALTER TABLE kpis_daily 
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual', -- 'gsc', 'ga4', 'manual', 'ads'
  ADD COLUMN IF NOT EXISTS metrics_json jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS sync_id uuid;

-- Create storage bucket for reports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for reports bucket
CREATE POLICY "Workspace members can view their reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM workspaces 
    WHERE id IN (SELECT get_user_workspace_ids(auth.uid()))
  )
);

CREATE POLICY "System can upload reports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reports');

-- RLS for data_quality_alerts
ALTER TABLE data_quality_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace access for data_quality_alerts"
ON data_quality_alerts FOR ALL
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- Index for faster queries
CREATE INDEX idx_data_quality_alerts_workspace ON data_quality_alerts(workspace_id, site_id);
CREATE INDEX idx_data_quality_alerts_unresolved ON data_quality_alerts(workspace_id, is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_kpis_daily_source ON kpis_daily(site_id, source, date);