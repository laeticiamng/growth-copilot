import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ExportData {
  workspace: Record<string, unknown>;
  sites: Record<string, unknown>[];
  leads: Record<string, unknown>[];
  deals: Record<string, unknown>[];
  content_briefs: Record<string, unknown>[];
  content_drafts: Record<string, unknown>[];
  campaigns: Record<string, unknown>[];
  agent_runs: Record<string, unknown>[];
  ai_requests: Record<string, unknown>[];
  action_log: Record<string, unknown>[];
  approval_queue: Record<string, unknown>[];
  brand_kit: Record<string, unknown>[];
  crawls: Record<string, unknown>[];
  gbp_profiles: Record<string, unknown>[];
  reviews: Record<string, unknown>[];
  social_posts: Record<string, unknown>[];
  keywords: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  user_roles: Record<string, unknown>[];
  automation_rules: Record<string, unknown>[];
  integrations: Record<string, unknown>[];
  exported_at: string;
  workspace_id: string;
  user_id: string;
  format_version: string;
  gdpr_compliance: {
    right_to_access: boolean;
    data_portability: boolean;
    export_format: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    const body = await req.json();
    const { workspace_id } = body;

    if (!workspace_id) {
      return new Response(
        JSON.stringify({ error: "workspace_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has access to workspace
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: hasAccess } = await serviceClient.rpc("has_workspace_access", {
      _user_id: user.id,
      _workspace_id: workspace_id,
    });

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting GDPR export for workspace ${workspace_id}, user ${user.id}`);

    // Fetch all workspace data in parallel - comprehensive GDPR export
    const [
      workspaceRes,
      sitesRes,
      leadsRes,
      dealsRes,
      briefsRes,
      draftsRes,
      campaignsRes,
      agentRunsRes,
      aiRequestsRes,
      actionLogRes,
      approvalsRes,
      brandKitRes,
      crawlsRes,
      gbpRes,
      reviewsRes,
      socialPostsRes,
      keywordsRes,
      notificationsRes,
      userRolesRes,
      automationRulesRes,
      integrationsRes,
    ] = await Promise.all([
      serviceClient.from("workspaces").select("*").eq("id", workspace_id).single(),
      serviceClient.from("sites").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("leads").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("deals").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("content_briefs").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("content_drafts").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("campaigns").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("agent_runs").select("*").eq("workspace_id", workspace_id).order("created_at", { ascending: false }).limit(5000),
      serviceClient.from("ai_requests").select("*").eq("workspace_id", workspace_id).order("created_at", { ascending: false }).limit(5000),
      serviceClient.from("action_log").select("*").eq("workspace_id", workspace_id).order("created_at", { ascending: false }).limit(5000),
      serviceClient.from("approval_queue").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("brand_kit").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("crawls").select("*").eq("workspace_id", workspace_id).limit(500),
      serviceClient.from("gbp_profiles").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("reviews").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("social_posts").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("keywords").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("notifications").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("user_roles").select("*").eq("workspace_id", workspace_id).eq("user_id", user.id),
      serviceClient.from("automation_rules").select("*").eq("workspace_id", workspace_id),
      serviceClient.from("integrations").select("id, provider, status, created_at, updated_at, workspace_id").eq("workspace_id", workspace_id),
    ]);

    // Build comprehensive export object
    const exportData: ExportData = {
      workspace: workspaceRes.data || {},
      sites: sitesRes.data || [],
      leads: leadsRes.data || [],
      deals: dealsRes.data || [],
      content_briefs: briefsRes.data || [],
      content_drafts: draftsRes.data || [],
      campaigns: campaignsRes.data || [],
      agent_runs: agentRunsRes.data || [],
      ai_requests: aiRequestsRes.data || [],
      action_log: actionLogRes.data || [],
      approval_queue: approvalsRes.data || [],
      brand_kit: brandKitRes.data || [],
      crawls: crawlsRes.data || [],
      gbp_profiles: gbpRes.data || [],
      reviews: reviewsRes.data || [],
      social_posts: socialPostsRes.data || [],
      keywords: keywordsRes.data || [],
      notifications: notificationsRes.data || [],
      user_roles: userRolesRes.data || [],
      automation_rules: automationRulesRes.data || [],
      integrations: integrationsRes.data || [],
      exported_at: new Date().toISOString(),
      workspace_id,
      user_id: user.id,
      format_version: "2.0",
      gdpr_compliance: {
        right_to_access: true,
        data_portability: true,
        export_format: "JSON",
      },
    };

    // Log the export action
    await serviceClient.from("action_log").insert({
      workspace_id,
      action_type: "gdpr_export",
      actor_type: "user",
      actor_id: user.id,
      description: "GDPR data export requested",
      is_automated: false,
      result: "success",
    });

    console.log(`GDPR export completed for workspace ${workspace_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: exportData,
        message: "Export completed successfully",
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="gdpr-export-${workspace_id}.json"`,
        } 
      }
    );
  } catch (error) {
    console.error("GDPR export error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Export failed", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
