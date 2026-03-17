import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Signal Ingest — Unified event ingestion endpoint.
 * Accepts events from multiple sources and normalizes them into the signal_events table.
 * Supports batch ingestion for efficiency.
 */

const VALID_EVENT_TYPES = new Set([
  'view', 'impression', 'watch_3s', 'watch_25pct', 'watch_50pct', 'watch_75pct', 'watch_100pct',
  'click', 'outbound_click', 'like', 'comment', 'share', 'save',
  'pre_save', 'smart_link_click', 'stream_start', 'playlist_add', 'follow',
  'signup', 'waitlist_join', 'trial_start', 'activation', 'purchase', 'repeat_purchase',
  'email_open', 'email_click', 'conversion_post_retargeting',
]);

const VALID_SOURCES = new Set(['ga4', 'meta', 'smart_link', 'internal', 'manual', 'webhook', 'api']);

interface IngestEvent {
  event_type: string;
  source: string;
  launch_project_id: string;
  channel?: string;
  session_id?: string;
  user_id_hash?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  timestamp?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const events: IngestEvent[] = Array.isArray(body.events) ? body.events : [body];
    const workspace_id = body.workspace_id;

    if (!workspace_id) {
      return new Response(
        JSON.stringify({ error: 'workspace_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (events.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No events provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (events.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Maximum 1000 events per batch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Validate and normalize events
    const validEvents: Array<Record<string, unknown>> = [];
    const errors: string[] = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      if (!VALID_EVENT_TYPES.has(event.event_type)) {
        errors.push(`Event ${i}: invalid event_type "${event.event_type}"`);
        continue;
      }

      if (!VALID_SOURCES.has(event.source)) {
        errors.push(`Event ${i}: invalid source "${event.source}"`);
        continue;
      }

      if (!event.launch_project_id) {
        errors.push(`Event ${i}: missing launch_project_id`);
        continue;
      }

      validEvents.push({
        launch_project_id: event.launch_project_id,
        workspace_id,
        event_type: event.event_type,
        source: event.source,
        channel: event.channel || null,
        session_id: event.session_id || null,
        user_id_hash: event.user_id_hash || null,
        value: event.value ?? 1,
        metadata: event.metadata || {},
        utm_source: event.utm_source || null,
        utm_medium: event.utm_medium || null,
        utm_campaign: event.utm_campaign || null,
        created_at: event.timestamp || new Date().toISOString(),
      });
    }

    let ingested = 0;
    if (validEvents.length > 0) {
      const { data, error } = await supabase
        .from('launch_signal_events')
        .insert(validEvents);

      if (error) {
        console.error('Signal ingest error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to ingest events', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      ingested = validEvents.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        ingested,
        rejected: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Signal ingest error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
