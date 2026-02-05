import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const GRAPH_API_VERSION = "v19.0";

interface CapiEventRequest {
  workspace_id: string;
  site_id: string;
  pixel_id: string;
  events: Array<{
    event_name: string;
    event_time?: number;
    event_id?: string;
    action_source?: string;
    event_source_url?: string;
    user_data?: {
      email?: string;
      phone?: string;
      first_name?: string;
      last_name?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
      external_id?: string;
      client_ip_address?: string;
      client_user_agent?: string;
      fbc?: string;
      fbp?: string;
    };
    custom_data?: {
      value?: number;
      currency?: string;
      content_ids?: string[];
      content_type?: string;
      content_name?: string;
      order_id?: string;
      num_items?: number;
    };
    opt_out?: boolean;
  }>;
  test_event_code?: string; // For testing in Meta Events Manager
}

/**
 * Hash value for CAPI using SHA256
 */
async function hashValue(value: string): Promise<string> {
  const normalized = value.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Decrypt token from oauth_tokens
 */
async function decryptToken(
  encrypted: { ct: string; iv: string },
  keyHex: string
): Promise<string> {
  const keyBytes = new Uint8Array(keyHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const keyBuffer = new ArrayBuffer(32);
  new Uint8Array(keyBuffer).set(keyBytes);

  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const ctBytes = Uint8Array.from(atob(encrypted.ct), c => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    ctBytes
  );

  return new TextDecoder().decode(decrypted);
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TOKEN_ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY")!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body: CapiEventRequest = await req.json();
    const { workspace_id, site_id, pixel_id, events, test_event_code } = body;

    if (!workspace_id || !pixel_id || !events?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: workspace_id, pixel_id, events" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Meta integration for this workspace
    const { data: integration, error: intError } = await supabase
      .from("integrations")
      .select("id")
      .eq("workspace_id", workspace_id)
      .eq("provider", "meta")
      .eq("status", "active")
      .single();

    if (intError || !integration) {
      return new Response(
        JSON.stringify({ error: "No active Meta integration found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get access token
    const { data: tokens, error: tokError } = await supabase
      .from("oauth_tokens")
      .select("access_ct, access_iv")
      .eq("integration_id", integration.id)
      .single();

    if (tokError || !tokens) {
      return new Response(
        JSON.stringify({ error: "OAuth tokens not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await decryptToken(
      { ct: tokens.access_ct, iv: tokens.access_iv },
      TOKEN_ENCRYPTION_KEY
    );

    // Process and hash user data for each event
    const processedEvents = await Promise.all(
      events.map(async (event) => {
        const eventTime = event.event_time || Math.floor(Date.now() / 1000);
        const eventId = event.event_id || `${eventTime}_${crypto.randomUUID()}`;

        // Hash user data
        const hashedUserData: Record<string, string[] | string> = {};

        if (event.user_data) {
          const ud = event.user_data;
          if (ud.email) hashedUserData.em = [await hashValue(ud.email)];
          if (ud.phone) hashedUserData.ph = [await hashValue(ud.phone.replace(/\D/g, ""))];
          if (ud.first_name) hashedUserData.fn = [await hashValue(ud.first_name)];
          if (ud.last_name) hashedUserData.ln = [await hashValue(ud.last_name)];
          if (ud.city) hashedUserData.ct = [await hashValue(ud.city)];
          if (ud.state) hashedUserData.st = [await hashValue(ud.state)];
          if (ud.zip) hashedUserData.zp = [await hashValue(ud.zip)];
          if (ud.country) hashedUserData.country = [await hashValue(ud.country)];
          if (ud.external_id) hashedUserData.external_id = [await hashValue(ud.external_id)];
          if (ud.client_ip_address) hashedUserData.client_ip_address = ud.client_ip_address;
          if (ud.client_user_agent) hashedUserData.client_user_agent = ud.client_user_agent;
          if (ud.fbc) hashedUserData.fbc = ud.fbc;
          if (ud.fbp) hashedUserData.fbp = ud.fbp;
        }

        // Store event in database
        const { data: dbEvent } = await supabase
          .from("meta_capi_events")
          .insert({
            workspace_id,
            site_id,
            pixel_id,
            event_name: event.event_name,
            event_time: new Date(eventTime * 1000).toISOString(),
            event_id: eventId,
            action_source: event.action_source || "website",
            user_data: event.user_data || {},
            custom_data: event.custom_data || {},
            event_source_url: event.event_source_url,
            opt_out: event.opt_out || false,
            status: "pending",
          })
          .select("id")
          .single();

        return {
          db_id: dbEvent?.id,
          event_name: event.event_name,
          event_time: eventTime,
          event_id: eventId,
          action_source: event.action_source || "website",
          event_source_url: event.event_source_url,
          user_data: hashedUserData,
          custom_data: event.custom_data,
          opt_out: event.opt_out,
        };
      })
    );

    // Send to Meta Conversions API
    const capiUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixel_id}/events`;
    const payload: Record<string, unknown> = {
      data: processedEvents.map(e => ({
        event_name: e.event_name,
        event_time: e.event_time,
        event_id: e.event_id,
        action_source: e.action_source,
        event_source_url: e.event_source_url,
        user_data: e.user_data,
        custom_data: e.custom_data,
        opt_out: e.opt_out,
      })),
      access_token: accessToken,
    };

    if (test_event_code) {
      payload.test_event_code = test_event_code;
    }

    const capiResponse = await fetch(capiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const capiResult = await capiResponse.json();

    // Update event statuses
    const status = capiResponse.ok ? "sent" : "failed";
    const errorMessage = capiResult.error?.message || null;

    for (const event of processedEvents) {
      if (event.db_id) {
        await supabase
          .from("meta_capi_events")
          .update({
            status,
            sent_at: status === "sent" ? new Date().toISOString() : null,
            fb_response: capiResult,
            error_message: errorMessage,
          })
          .eq("id", event.db_id);
      }
    }

    if (!capiResponse.ok) {
      console.error("CAPI error:", capiResult);
      return new Response(
        JSON.stringify({ error: capiResult.error?.message || "CAPI request failed", details: capiResult }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`CAPI: Sent ${processedEvents.length} events to pixel ${pixel_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        events_received: capiResult.events_received,
        fbtrace_id: capiResult.fbtrace_id,
        messages: capiResult.messages,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("CAPI error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
