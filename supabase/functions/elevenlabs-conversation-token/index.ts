import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validate user auth
    const authResult = await validateAuth(req, supabaseUrl, supabaseAnonKey);
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      console.error("[ElevenLabs] API key not configured");
      return new Response(
        JSON.stringify({ error: "ElevenLabs not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get agent ID from request body or use default
    const body = await req.json().catch(() => ({}));
    const agentId = body.agent_id || Deno.env.get("ELEVENLABS_AGENT_ID");

    if (!agentId) {
      return new Response(
        JSON.stringify({ error: "No agent ID provided. Please configure ELEVENLABS_AGENT_ID or pass agent_id in the request." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[ElevenLabs] Generating conversation token for agent: ${agentId}, user: ${authResult.userId}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ElevenLabs] Token error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: "Failed to generate token", details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    console.log("[ElevenLabs] Token generated successfully");

    return new Response(
      JSON.stringify({ token: data.token }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[ElevenLabs] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
