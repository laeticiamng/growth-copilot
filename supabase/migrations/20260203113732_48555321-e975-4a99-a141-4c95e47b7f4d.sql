-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily executive brief at 8 AM UTC (adjust as needed)
SELECT cron.schedule(
  'daily-executive-brief',
  '0 8 * * *',  -- Every day at 8:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://goiklfzouhshghsvpxjo.supabase.co/functions/v1/run-executor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvaWtsZnpvdWhzaGdoc3ZweGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg1OTQ5OCwiZXhwIjoyMDg1NDM1NDk4fQ.PLACEHOLDER"}'::jsonb,
    body := '{"run_type": "DAILY_EXECUTIVE_BRIEF", "scheduled": true}'::jsonb
  );
  $$
);

-- Schedule weekly review on Monday at 9 AM UTC
SELECT cron.schedule(
  'weekly-executive-review',
  '0 9 * * 1',  -- Every Monday at 9:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://goiklfzouhshghsvpxjo.supabase.co/functions/v1/run-executor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvaWtsZnpvdWhzaGdoc3ZweGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg1OTQ5OCwiZXhwIjoyMDg1NDM1NDk4fQ.PLACEHOLDER"}'::jsonb,
    body := '{"run_type": "WEEKLY_EXECUTIVE_REVIEW", "scheduled": true}'::jsonb
  );
  $$
);