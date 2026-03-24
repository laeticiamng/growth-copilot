import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Launch Cancel — Cancels an active launch run with proper cleanup.
 */
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { launch_project_id, workspace_id, cancel_reason } = await req.json();

    if (!launch_project_id || !workspace_id) {
      return new Response(JSON.stringify({ error: 'launch_project_id and workspace_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const authResult = await validateWorkspaceAccess(req, workspace_id, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    if (!authResult.hasAccess) return forbiddenResponse(authResult.error || "Access denied", corsHeaders);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const now = new Date().toISOString();

    // Find active run
    const { data: run, error: runErr } = await supabase
      .from('launch_runs')
      .select('id, current_stage')
      .eq('launch_project_id', launch_project_id)
      .in('status', ['running', 'paused', 'waiting_approval', 'failed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (runErr || !run) {
      return new Response(JSON.stringify({ error: 'No active run to cancel' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Cancel the run
    await supabase.from('launch_runs').update({
      status: 'failed',
      canceled_at: now,
      cancel_reason: cancel_reason || 'Canceled by user',
      completed_at: now,
    }).eq('id', run.id);

    // Cancel all pending/running stage runs
    await supabase.from('launch_stage_runs').update({
      status: 'canceled',
      completed_at: now,
    }).eq('launch_run_id', run.id).in('status', ['pending', 'running', 'waiting_approval']);

    // Cancel pending publication jobs
    await supabase.from('launch_publication_jobs').update({
      status: 'canceled',
    }).eq('launch_project_id', launch_project_id).in('status', ['draft', 'ready', 'awaiting_approval', 'scheduled']);

    // Log event
    await supabase.from('launch_run_events').insert({
      launch_run_id: run.id,
      launch_project_id: launch_project_id,
      event_type: 'run_canceled',
      stage_name: run.current_stage,
      details: { reason: cancel_reason || 'Canceled by user' },
    });

    // Update project status
    await supabase.from('launch_projects').update({ status: 'paused' }).eq('id', launch_project_id);

    return new Response(JSON.stringify({ success: true, canceled_run_id: run.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Launch cancel error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
