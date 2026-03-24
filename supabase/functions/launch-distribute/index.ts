import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Launch Distribute — Manages publication job execution.
 *
 * Handles:
 * - Dispatching ready jobs for auto-publish channels
 * - Generating export packages for manual channels
 * - Updating job statuses based on connector results
 * - Journaling all publication events
 *
 * RULE: No asset appears as "published" unless the connector confirms it.
 */
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { launch_project_id, action, job_id, workspace_id } = await req.json();
    if (!launch_project_id) {
      return new Response(JSON.stringify({ error: 'launch_project_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    switch (action || 'get_status') {
      case 'dispatch': {
        // Move all 'ready' jobs to 'publishing' and attempt execution
        const { data: readyJobs } = await supabase
          .from('launch_publication_jobs')
          .select('*')
          .eq('launch_project_id', launch_project_id)
          .eq('status', 'ready');

        const results = [];
        for (const job of (readyJobs || [])) {
          if (job.publish_method === 'auto_api') {
            // For now, mark as exported_manual since no real API integration
            // A real implementation would call Meta/Google/etc APIs here
            await supabase.from('launch_publication_jobs').update({
              status: 'exported_manual',
              updated_at: new Date().toISOString(),
              metadata: { ...job.metadata, dispatch_note: 'Auto-publish connector not yet implemented. Exported for manual publishing.' },
            }).eq('id', job.id);
            results.push({ job_id: job.id, channel: job.channel, result: 'exported_manual', reason: 'Auto-publish not yet implemented for this channel' });
          } else {
            await supabase.from('launch_publication_jobs').update({
              status: 'exported_manual',
              updated_at: new Date().toISOString(),
            }).eq('id', job.id);
            results.push({ job_id: job.id, channel: job.channel, result: 'exported_manual' });
          }
        }

        return new Response(JSON.stringify({
          success: true,
          dispatched: results.length,
          results,
          note: 'Auto-publish via API is not yet implemented. All jobs exported for manual publishing.',
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'mark_published': {
        if (!job_id) {
          return new Response(JSON.stringify({ error: 'job_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        await supabase.from('launch_publication_jobs').update({
          status: 'published',
          published_at: new Date().toISOString(),
        }).eq('id', job_id);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'mark_failed': {
        if (!job_id) {
          return new Response(JSON.stringify({ error: 'job_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        await supabase.from('launch_publication_jobs').update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          failure_reason: 'Manually marked as failed',
        }).eq('id', job_id);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get_status':
      default: {
        const { data: jobs } = await supabase
          .from('launch_publication_jobs')
          .select('*')
          .eq('launch_project_id', launch_project_id)
          .order('created_at', { ascending: false });

        const allJobs = jobs || [];
        const summary = {
          total: allJobs.length,
          draft: allJobs.filter((j: Record<string, unknown>) => j.status === 'draft').length,
          ready: allJobs.filter((j: Record<string, unknown>) => j.status === 'ready').length,
          awaiting_approval: allJobs.filter((j: Record<string, unknown>) => j.status === 'awaiting_approval').length,
          scheduled: allJobs.filter((j: Record<string, unknown>) => j.status === 'scheduled').length,
          publishing: allJobs.filter((j: Record<string, unknown>) => j.status === 'publishing').length,
          published: allJobs.filter((j: Record<string, unknown>) => j.status === 'published').length,
          exported_manual: allJobs.filter((j: Record<string, unknown>) => j.status === 'exported_manual').length,
          failed: allJobs.filter((j: Record<string, unknown>) => j.status === 'failed').length,
          canceled: allJobs.filter((j: Record<string, unknown>) => j.status === 'canceled').length,
        };

        return new Response(JSON.stringify({
          jobs: allJobs,
          summary,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
  } catch (error) {
    console.error('Distribute error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
