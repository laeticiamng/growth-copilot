
-- Minimal analytics events table for KPI tracking
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  session_id TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public tracking)
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

-- Only workspace admins can read (via edge function, not direct)
CREATE POLICY "No direct select on analytics_events"
ON public.analytics_events FOR SELECT
USING (false);

-- Index for querying
CREATE INDEX idx_analytics_events_name_created ON public.analytics_events (event_name, created_at DESC);
CREATE INDEX idx_analytics_events_session ON public.analytics_events (session_id, created_at DESC);

-- Auto-cleanup after 90 days
COMMENT ON TABLE public.analytics_events IS 'Minimal KPI tracking. Auto-cleanup recommended after 90 days.';
