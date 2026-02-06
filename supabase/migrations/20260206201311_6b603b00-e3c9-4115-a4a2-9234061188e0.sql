
-- Tighten analytics_events INSERT policy with basic validation
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Validated analytics event insert"
ON public.analytics_events
FOR INSERT
WITH CHECK (
  event_name IS NOT NULL 
  AND length(event_name) <= 100
  AND (page_url IS NULL OR length(page_url) <= 2000)
  AND (user_agent IS NULL OR length(user_agent) <= 500)
  AND (referrer IS NULL OR length(referrer) <= 2000)
);
