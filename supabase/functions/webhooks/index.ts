import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Anti-SSRF: Block private IPs, localhost, and metadata endpoints
const BLOCKED_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^localhost$/i,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /metadata\.google/i,
  /169\.254\.169\.254/,
  /metadata\.aws/i,
  /instance-data/i,
];

function isBlockedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(hostname)) {
        return true;
      }
    }
    
    // Block non-HTTP(S) protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return true;
    }
    
    return false;
  } catch {
    return true; // Block malformed URLs
  }
}

// Rate limiting: simple in-memory tracker
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // requests per minute per workspace
const RATE_WINDOW_MS = 60000;

function checkRateLimit(workspaceId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(workspaceId);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(workspaceId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

interface WebhookPayload {
  event_type: string;
  workspace_id: string;
  data: Record<string, unknown>;
}

interface WebhookRow {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  is_active: boolean;
  headers: Record<string, string> | null;
  retry_count: number;
}

async function triggerWebhooks(
  supabaseUrl: string,
  supabaseKey: string,
  payload: WebhookPayload
): Promise<{ triggered: number; success: number; failed: number }> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: webhooks, error } = await supabase
    .from("webhooks")
    .select("id, name, url, secret, events, is_active, headers, retry_count")
    .eq("workspace_id", payload.workspace_id)
    .eq("is_active", true);

  if (error || !webhooks?.length) {
    console.log("[Webhooks] No active webhooks for event:", payload.event_type);
    return { triggered: 0, success: 0, failed: 0 };
  }

  // Filter webhooks that match the event + validate URL security
  const matchingWebhooks = (webhooks as WebhookRow[]).filter(
    (w) => {
      // Check event match
      const eventMatch = w.events.includes(payload.event_type) || w.events.includes("*");
      // Security: block SSRF-vulnerable URLs
      const urlSafe = !isBlockedUrl(w.url);
      if (!urlSafe) {
        console.warn(`[Webhooks] Blocked SSRF-vulnerable URL: ${w.url}`);
      }
      return eventMatch && urlSafe;
    }
  );

  if (!matchingWebhooks.length) {
    return { triggered: 0, success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const webhook of matchingWebhooks) {
    const startTime = Date.now();
    let responseStatus = 0;
    let responseBody = "";
    let errorMessage = "";

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Webhook-Event": payload.event_type,
        ...(webhook.headers || {}),
      };

      if (webhook.secret) {
        headers["X-Webhook-Signature"] = await generateSignature(
          JSON.stringify(payload.data),
          webhook.secret
        );
      }

      const response = await fetch(webhook.url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          event: payload.event_type,
          timestamp: new Date().toISOString(),
          data: payload.data,
        }),
      });

      responseStatus = response.status;
      responseBody = await response.text();

      if (response.ok) {
        success++;
      } else {
        failed++;
        errorMessage = `HTTP ${responseStatus}: ${responseBody.substring(0, 500)}`;
      }
    } catch (err) {
      failed++;
      errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`[Webhooks] Failed to call ${webhook.url}:`, errorMessage);
    }

    const durationMs = Date.now() - startTime;

    // Log the webhook call
    await supabase.from("webhook_logs").insert({
      webhook_id: webhook.id,
      workspace_id: payload.workspace_id,
      event_type: payload.event_type,
      payload: payload.data,
      response_status: responseStatus,
      response_body: responseBody.substring(0, 5000),
      duration_ms: durationMs,
      error_message: errorMessage || null,
    });

    // Update webhook last triggered
    await supabase
      .from("webhooks")
      .update({
        last_triggered_at: new Date().toISOString(),
        last_status: responseStatus,
      })
      .eq("id", webhook.id);
  }

  console.log(`[Webhooks] Triggered ${matchingWebhooks.length} webhooks: ${success} success, ${failed} failed`);
  return { triggered: matchingWebhooks.length, success, failed };
}

async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { action, ...params } = await req.json();

    switch (action) {
      case "ping": {
        return new Response(JSON.stringify({ ok: true, timestamp: Date.now() }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "trigger": {
        // Rate limiting
        if (!checkRateLimit(params.workspace_id)) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Max 100 webhooks/minute." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const result = await triggerWebhooks(supabaseUrl, supabaseServiceKey, params as WebhookPayload);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "test": {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { webhook_id, workspace_id } = params;
        
        const { data: webhook } = await supabase
          .from("webhooks")
          .select("*")
          .eq("id", webhook_id)
          .eq("workspace_id", workspace_id)
          .single();

        if (!webhook) {
          return new Response(JSON.stringify({ error: "Webhook not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const testPayload: WebhookPayload = {
          event_type: "test",
          workspace_id,
          data: { test: true, timestamp: new Date().toISOString() },
        };

        const result = await triggerWebhooks(supabaseUrl, supabaseServiceKey, testPayload);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("[Webhooks] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
