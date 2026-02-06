import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "analytics_session_id";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Lightweight analytics hook for KPI tracking.
 * Tracks page views and custom events to analytics_events table.
 */
export function useAnalytics() {
  const tracked = useRef(false);

  const track = useCallback(async (eventName: string, eventData?: Record<string, unknown>) => {
    try {
      await supabase.from("analytics_events").insert([{
        event_name: eventName,
        event_data: (eventData || {}) as any,
        page_url: window.location.pathname + window.location.search,
        referrer: document.referrer || null,
        session_id: getSessionId(),
      }]);
    } catch {
      // Silent fail — analytics should never break the app
    }
  }, []);

  const trackPageView = useCallback((pageName?: string) => {
    track("page_view", { page: pageName || window.location.pathname });
  }, [track]);

  // Auto-track page view once per mount
  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      trackPageView();
    }
  }, [trackPageView]);

  return { track, trackPageView };
}
