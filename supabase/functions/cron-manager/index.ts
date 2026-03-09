import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, corsPreflightResponse } from "../_shared/cors.ts";
import { validateWorkspaceAccess, unauthorizedResponse } from "../_shared/auth.ts";

const CRONJOB_API = "https://api.cron-job.org";

interface CronJobSchedule {
  timezone: string;
  hours: number[];
  mdays: number[];
  minutes: number[];
  months: number[];
  wdays: number[];
  expiresAt: number;
}

interface CronJobInput {
  title: string;
  url: string;
  enabled?: boolean;
  schedule: CronJobSchedule;
  requestMethod?: number; // 0=GET, 1=POST, 2=OPTIONS, 3=HEAD, 4=PUT, 5=DELETE, 6=TRACE, 7=CONNECT, 8=PATCH
  extendedData?: {
    headers?: Record<string, string>;
    body?: string;
  };
  notification?: {
    onFailure: boolean;
    onSuccess: boolean;
    onDisable: boolean;
  };
  requestTimeout?: number;
  saveResponses?: boolean;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return corsPreflightResponse(req);
  }

  const CRONJOB_API_KEY = Deno.env.get("CRONJOB_ORG_API_KEY");
  if (!CRONJOB_API_KEY) {
    return new Response(
      JSON.stringify({ error: "CRONJOB_ORG_API_KEY is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    // Parse request
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    // pathParts: ["cron-manager"] or ["cron-manager", "<jobId>"]
    const jobId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

    // For all operations, require workspace auth
    let workspaceId: string | undefined;

    if (req.method === "GET") {
      workspaceId = url.searchParams.get("workspace_id") || undefined;
    } else {
      const body = await req.clone().json().catch(() => ({}));
      workspaceId = body.workspace_id;
    }

    if (!workspaceId) {
      return new Response(
        JSON.stringify({ error: "workspace_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authResult = await validateWorkspaceAccess(req, workspaceId, supabaseUrl, supabaseAnonKey, supabaseServiceKey);
    if (!authResult.hasAccess) {
      return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    }

    const apiHeaders = {
      "Authorization": `Bearer ${CRONJOB_API_KEY}`,
      "Content-Type": "application/json",
    };

    // Route by method
    switch (req.method) {
      case "GET": {
        // List all cron jobs or get details
        if (jobId && jobId !== "cron-manager") {
          const response = await fetch(`${CRONJOB_API}/jobs/${jobId}`, { headers: apiHeaders });
          const data = await response.json();
          if (!response.ok) {
            return new Response(JSON.stringify({ error: "Failed to fetch cron job", details: data }), {
              status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const response = await fetch(`${CRONJOB_API}/jobs`, { headers: apiHeaders });
        const data = await response.json();
        if (!response.ok) {
          return new Response(JSON.stringify({ error: "Failed to list cron jobs", details: data }), {
            status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "PUT": {
        // Create a new cron job
        const body = await req.json();
        const jobData: CronJobInput = body.job;

        if (!jobData?.url || !jobData?.title) {
          return new Response(JSON.stringify({ error: "job.url and job.title are required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const response = await fetch(`${CRONJOB_API}/jobs`, {
          method: "PUT",
          headers: apiHeaders,
          body: JSON.stringify({ job: jobData }),
        });
        const data = await response.json();
        if (!response.ok) {
          return new Response(JSON.stringify({ error: "Failed to create cron job", details: data }), {
            status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Log to audit
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from("action_log").insert({
          workspace_id: workspaceId,
          actor_id: authResult.userId,
          actor_type: "user",
          action_type: "cron_job_created",
          action_category: "automation",
          description: `Created external cron job: ${jobData.title}`,
          details: { jobId: data.jobId, url: jobData.url },
          entity_type: "cron_job",
          is_automated: false,
        });

        return new Response(JSON.stringify(data), {
          status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "PATCH": {
        // Update a cron job
        if (!jobId || jobId === "cron-manager") {
          return new Response(JSON.stringify({ error: "jobId is required in URL path" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const body = await req.json();
        const response = await fetch(`${CRONJOB_API}/jobs/${jobId}`, {
          method: "PATCH",
          headers: apiHeaders,
          body: JSON.stringify({ job: body.job }),
        });
        const data = await response.json();
        if (!response.ok) {
          return new Response(JSON.stringify({ error: "Failed to update cron job", details: data }), {
            status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "DELETE": {
        // Delete a cron job
        if (!jobId || jobId === "cron-manager") {
          return new Response(JSON.stringify({ error: "jobId is required in URL path" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const body = await req.json().catch(() => ({}));
        const response = await fetch(`${CRONJOB_API}/jobs/${jobId}`, {
          method: "DELETE",
          headers: apiHeaders,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          return new Response(JSON.stringify({ error: "Failed to delete cron job", details: data }), {
            status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        await response.text(); // consume body

        // Log to audit
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from("action_log").insert({
          workspace_id: workspaceId,
          actor_id: authResult.userId,
          actor_type: "user",
          action_type: "cron_job_deleted",
          action_category: "automation",
          description: `Deleted external cron job: ${jobId}`,
          details: { jobId },
          entity_type: "cron_job",
          is_automated: false,
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("cron-manager error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
