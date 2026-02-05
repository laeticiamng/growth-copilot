import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

interface MetricsRequest {
  workspace_id?: string;
  action?: "collect" | "query" | "alert";
  time_range?: "1h" | "24h" | "7d";
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const body: MetricsRequest = await req.json();
    const { workspace_id, action = "query", time_range = "24h" } = body;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();
    
    const timeRangeMs: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
    };
    const startTime = new Date(now.getTime() - timeRangeMs[time_range]);

    console.log(`[MONITORING] Action: ${action}, Range: ${time_range}`);

    // Simplified metrics collection
    const metrics: Record<string, unknown> = { collected_at: new Date().toISOString() };

    return new Response(
      JSON.stringify({ success: true, metrics, time_range }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[MONITORING] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
