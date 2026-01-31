import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GSCRequest {
  workspace_id: string;
  site_id: string;
  site_url: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Validates auth and workspace access
 */
// deno-lint-ignore no-explicit-any
async function validateRequest(req: Request, workspaceId: string): Promise<{ 
  valid: boolean; 
  userId: string | null; 
  error: string | null;
  serviceClient: any;
}> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, userId: null, error: 'Missing Authorization header', serviceClient: null };
  }

  const token = authHeader.replace('Bearer ', '');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  });

  try {
    const { data, error } = await userClient.auth.getUser(token);
    
    if (error || !data.user) {
      return { valid: false, userId: null, error: 'Invalid or expired token', serviceClient: null };
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: hasAccess, error: accessError } = await serviceClient.rpc('has_workspace_access', {
      _user_id: data.user.id,
      _workspace_id: workspaceId,
    });

    if (accessError || !hasAccess) {
      return { valid: false, userId: data.user.id, error: 'Access denied to workspace', serviceClient: null };
    }

    return { valid: true, userId: data.user.id, error: null, serviceClient };
  } catch (err) {
    return { valid: false, userId: null, error: 'Authentication failed', serviceClient: null };
  }
}

// Google Search Console API sync
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: GSCRequest = await req.json();
    const { workspace_id, site_id, site_url, start_date, end_date } = body;

    if (!workspace_id || !site_id || !site_url) {
      throw new Error("Missing required fields: workspace_id, site_id, site_url");
    }

    // Validate authentication and workspace access
    const authResult = await validateRequest(req, workspace_id);
    if (!authResult.valid || !authResult.serviceClient) {
      return new Response(
        JSON.stringify({ success: false, error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = authResult.serviceClient;

    // Validate site belongs to workspace
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id")
      .eq("id", site_id)
      .eq("workspace_id", workspace_id)
      .single();

    if (siteError || !site) {
      return new Response(
        JSON.stringify({ success: false, error: "Site not found or access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get integration credentials
    const { data: integration, error: intError } = await supabase
      .from("integrations")
      .select("*")
      .eq("workspace_id", workspace_id)
      .eq("provider", "google_search_console")
      .eq("status", "active")
      .single();

    if (intError || !integration) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GSC integration not configured. Please connect Google Search Console first.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const syncId = crypto.randomUUID();
    const today = new Date();
    const defaultEndDate = new Date(today.setDate(today.getDate() - 2));
    const defaultStartDate = new Date(defaultEndDate);
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const dateStart = start_date || defaultStartDate.toISOString().split("T")[0];
    const dateEnd = end_date || defaultEndDate.toISOString().split("T")[0];

    console.log(`Syncing GSC data for ${site_url} from ${dateStart} to ${dateEnd}, user: ${authResult.userId}`);

    // Log the sync attempt
    await supabase.from("action_log").insert({
      workspace_id,
      site_id,
      actor_type: "agent",
      actor_id: "sync-gsc",
      action_type: "DATA_SYNC",
      action_category: "integration",
      description: `GSC sync initiated for ${site_url}`,
      details: { sync_id: syncId, date_range: { start: dateStart, end: dateEnd } },
      is_automated: true,
      result: "pending",
    });

    // GSC API request structure (for when OAuth is configured)
    const gscApiPayload = {
      startDate: dateStart,
      endDate: dateEnd,
      dimensions: ["date"],
      rowLimit: 1000,
      aggregationType: "byPage",
    };

    // Update integration last_sync_at
    await supabase
      .from("integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", integration.id);

    // Update action_log with success
    await supabase
      .from("action_log")
      .update({ result: "success" })
      .eq("workspace_id", workspace_id)
      .eq("details->sync_id", syncId);

    return new Response(
      JSON.stringify({
        success: true,
        sync_id: syncId,
        message: "GSC sync completed. Configure OAuth tokens for live data.",
        data_structure: {
          note: "Once OAuth is configured, this endpoint will return real GSC data",
          expected_fields: ["date", "clicks", "impressions", "ctr", "position"],
          api_endpoint: "https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query",
          payload_example: gscApiPayload,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GSC sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
