import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Launch Sales Handoff — Creates lead handoffs from signal events.
 *
 * Scores leads based on engagement signals, classifies MQL/SQL,
 * attempts CRM push, creates lifecycle follow-up queue entries.
 */
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { launch_project_id } = await req.json();
    if (!launch_project_id) {
      return new Response(JSON.stringify({ error: 'launch_project_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Gather signal events grouped by user_id_hash
    const { data: signals } = await supabase
      .from('launch_signal_events')
      .select('*')
      .eq('launch_project_id', launch_project_id)
      .order('created_at', { ascending: true });

    if (!signals || signals.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        evidence_level: 'TEMPLATE',
        leads_created: 0,
        note: 'No signal events found - no leads to handoff',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Group signals by user hash
    const userSignals = new Map<string, typeof signals>();
    for (const signal of signals) {
      const key = signal.user_id_hash || signal.session_id || 'anonymous';
      if (!userSignals.has(key)) userSignals.set(key, []);
      userSignals.get(key)!.push(signal);
    }

    const handoffs = [];
    const scores = [];
    const followups = [];

    for (const [userHash, userEvents] of userSignals) {
      if (userHash === 'anonymous') continue;

      // Score the lead
      const engagementScore = calculateEngagementScore(userEvents);
      const fitScore = calculateFitScore(userEvents);
      const compositeScore = Math.round((engagementScore * 0.6 + fitScore * 0.4));

      // Classify
      let classification: 'raw' | 'mql' | 'sql' | 'opportunity' = 'raw';
      if (compositeScore >= 70) classification = 'sql';
      else if (compositeScore >= 40) classification = 'mql';

      const firstEvent = userEvents[0];
      const lastEvent = userEvents[userEvents.length - 1];

      const handoff = {
        launch_project_id,
        lead_source: firstEvent.source || 'unknown',
        lead_email_hash: userHash,
        lead_score: compositeScore,
        qualification_status: classification,
        first_touch_channel: firstEvent.channel || firstEvent.source || '',
        last_touch_channel: lastEvent.channel || lastEvent.source || '',
        touchpoint_count: userEvents.length,
        utm_source: firstEvent.utm_source || null,
        utm_campaign: firstEvent.utm_campaign || null,
        handoff_to_crm: false,
        lifecycle_stage: classification === 'sql' ? 'decision' : classification === 'mql' ? 'consideration' : 'awareness',
        follow_up_actions: [],
      };

      handoffs.push(handoff);

      // Create follow-up actions
      if (classification === 'mql') {
        followups.push({ userHash, action_type: 'nurture', delay_hours: 24 });
        followups.push({ userHash, action_type: 'email_sequence', delay_hours: 48 });
      } else if (classification === 'sql') {
        followups.push({ userHash, action_type: 'sales_call', delay_hours: 4 });
        followups.push({ userHash, action_type: 'demo_invite', delay_hours: 24 });
      }
    }

    // Insert handoffs
    let insertedHandoffs: Record<string, unknown>[] = [];
    if (handoffs.length > 0) {
      const { data, error } = await supabase.from('launch_lead_handoffs').insert(handoffs).select();
      if (error) console.error('Failed to insert handoffs:', error);
      insertedHandoffs = data || [];
    }

    // Insert scores and follow-ups
    for (let i = 0; i < insertedHandoffs.length; i++) {
      const handoff = insertedHandoffs[i];
      const originalHandoff = handoffs[i];

      // Insert score
      await supabase.from('launch_lead_scores').insert({
        launch_project_id,
        lead_handoff_id: handoff.id,
        engagement_score: originalHandoff.lead_score,
        fit_score: Math.round(originalHandoff.lead_score * 0.8),
        composite_score: originalHandoff.lead_score,
        scoring_factors: { touchpoints: originalHandoff.touchpoint_count, channels: [originalHandoff.first_touch_channel, originalHandoff.last_touch_channel] },
        classification: originalHandoff.qualification_status,
      });

      // Insert CRM push log (queued for manual since no CRM connected)
      await supabase.from('launch_crm_push_log').insert({
        launch_project_id,
        lead_handoff_id: handoff.id,
        crm_provider: 'none',
        push_status: 'queued_manual',
      });
    }

    // Insert lifecycle follow-ups
    for (const fu of followups) {
      const handoff = insertedHandoffs.find((h: Record<string, unknown>) =>
        handoffs.find(oh => oh.lead_email_hash === fu.userHash)
      );
      if (handoff) {
        await supabase.from('launch_lifecycle_followup_queue').insert({
          launch_project_id,
          lead_handoff_id: handoff.id,
          action_type: fu.action_type,
          scheduled_at: new Date(Date.now() + fu.delay_hours * 3600000).toISOString(),
          status: 'pending',
        });
      }
    }

    const evidence_level = handoffs.length > 0 ? 'DERIVED' : 'TEMPLATE';

    return new Response(JSON.stringify({
      success: true,
      evidence_level,
      leads_created: insertedHandoffs.length,
      mql_count: handoffs.filter(h => h.qualification_status === 'mql').length,
      sql_count: handoffs.filter(h => h.qualification_status === 'sql').length,
      followups_scheduled: followups.length,
      crm_push_status: 'queued_manual',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Sales handoff error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function calculateEngagementScore(events: Record<string, unknown>[]): number {
  let score = 0;
  const eventWeights: Record<string, number> = {
    page_view: 2, click: 5, scroll: 1, form_start: 10, form_submit: 20,
    signup: 30, purchase: 50, add_to_cart: 15, video_view: 5,
    share: 10, download: 15, email_open: 5, email_click: 10,
  };

  for (const event of events) {
    const weight = eventWeights[event.event_type as string] || 1;
    score += weight;
  }

  return Math.min(100, score);
}

function calculateFitScore(events: Record<string, unknown>[]): number {
  let score = 30; // Base score
  const hasMultipleChannels = new Set(events.map(e => e.channel || e.source)).size > 1;
  const hasUTM = events.some(e => e.utm_source || e.utm_campaign);
  const hasConversion = events.some(e => ['signup', 'purchase', 'form_submit'].includes(e.event_type as string));

  if (hasMultipleChannels) score += 20;
  if (hasUTM) score += 15;
  if (hasConversion) score += 35;

  return Math.min(100, score);
}
