import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Launch Resume — Resumes a paused/failed/waiting_approval launch run.
 *
 * Handles:
 * - Resume after approval granted
 * - Resume after transient failure (retry)
 * - Resume after pause
 */
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { launch_project_id, workspace_id, force_retry } = await req.json();

    if (!launch_project_id || !workspace_id) {
      return new Response(JSON.stringify({ error: 'launch_project_id and workspace_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const authResult = await validateWorkspaceAccess(req, workspace_id, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY);
    if (!authResult.authenticated) return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    if (!authResult.hasAccess) return forbiddenResponse(authResult.error || "Access denied", corsHeaders);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Find the run to resume
    const { data: run, error: runErr } = await supabase
      .from('launch_runs')
      .select('*')
      .eq('launch_project_id', launch_project_id)
      .in('status', ['paused', 'failed', 'waiting_approval'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (runErr || !run) {
      return new Response(JSON.stringify({ error: 'No resumable run found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const now = new Date().toISOString();

    // If waiting_approval, check if approvals are resolved
    if (run.status === 'waiting_approval') {
      const { data: pendingApprovals } = await supabase
        .from('launch_approval_checkpoints')
        .select('id')
        .eq('launch_project_id', launch_project_id)
        .eq('status', 'pending');

      if (pendingApprovals && pendingApprovals.length > 0) {
        return new Response(JSON.stringify({ error: 'Approvals still pending', pending_count: pendingApprovals.length }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // If failed and force_retry, reset the failed stage
    if (run.status === 'failed' && force_retry) {
      await supabase.from('launch_stage_runs').update({
        status: 'running',
        failed_at: null,
        error_message: null,
        error_type: null,
        started_at: now,
        attempts: run.resume_count + 1,
      }).eq('launch_run_id', run.id).eq('stage_name', run.current_stage);
    }

    // Resume the run
    await supabase.from('launch_runs').update({
      status: 'running',
      resumed_at: now,
      resume_count: (run.resume_count || 0) + 1,
    }).eq('id', run.id);

    // Ensure current stage is running
    await supabase.from('launch_stage_runs').update({
      status: 'running',
      started_at: now,
    }).eq('launch_run_id', run.id).eq('stage_name', run.current_stage).eq('status', 'waiting_approval');

    // Log event
    await supabase.from('launch_run_events').insert({
      launch_run_id: run.id,
      launch_project_id: launch_project_id,
      event_type: 'run_resumed',
      stage_name: run.current_stage,
      details: { resume_count: (run.resume_count || 0) + 1, previous_status: run.status, force_retry },
    });

    return new Response(JSON.stringify({
      success: true,
      run_id: run.id,
      current_stage: run.current_stage,
      resume_count: (run.resume_count || 0) + 1,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Launch resume error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
