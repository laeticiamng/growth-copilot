import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * Meta Webhooks Handler
 * Handles webhook verification and incoming events from:
 * - Facebook Pages (feed, mentions, messages)
 * - Instagram (comments, mentions, story_insights)
 * - WhatsApp Business (messages, statuses)
 */
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const META_WEBHOOK_VERIFY_TOKEN = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") || "lovable_meta_webhook_2024";

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Handle webhook verification (GET request from Meta)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    console.log("Webhook verification request:", { mode, token });

    if (mode === "subscribe" && token === META_WEBHOOK_VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      return new Response(challenge, { status: 200 });
    }

    console.error("Webhook verification failed");
    return new Response("Forbidden", { status: 403 });
  }

  // Handle OPTIONS for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle incoming webhook events (POST)
  if (req.method === "POST") {
    try {
      const payload = await req.json();
      console.log("Webhook received:", JSON.stringify(payload).substring(0, 500));

      const objectType = payload.object; // 'page', 'instagram', 'whatsapp_business_account'
      const entries = payload.entry || [];

      for (const entry of entries) {
        const objectId = entry.id;
        const time = entry.time;

        // Find workspace for this object
        const { data: webhookConfig } = await supabase
          .from("meta_webhook_configs")
          .select("workspace_id, id")
          .eq("object_type", objectType)
          .eq("object_id", objectId)
          .eq("is_active", true)
          .single();

        const workspaceId = webhookConfig?.workspace_id;
        const webhookConfigId = webhookConfig?.id;

        // Process different event types
        if (objectType === "page") {
          // Facebook Page events
          const changes = entry.changes || [];
          for (const change of changes) {
            await supabase.from("meta_webhook_events").insert({
              workspace_id: workspaceId,
              webhook_config_id: webhookConfigId,
              object_type: objectType,
              object_id: objectId,
              field: change.field,
              event_type: change.value?.item || change.value?.verb || "unknown",
              payload: change,
            });
          }

          // Messenger messages
          const messaging = entry.messaging || [];
          for (const msg of messaging) {
            await supabase.from("meta_webhook_events").insert({
              workspace_id: workspaceId,
              webhook_config_id: webhookConfigId,
              object_type: objectType,
              object_id: objectId,
              field: "messaging",
              event_type: msg.message ? "message" : msg.read ? "read" : msg.delivery ? "delivery" : "unknown",
              payload: msg,
            });

            // If it's a message, process it for conversations
            if (msg.message && workspaceId) {
              await processMessengerMessage(supabase, workspaceId, objectId, msg);
            }
          }
        }

        if (objectType === "instagram") {
          // Instagram events (comments, mentions, story_insights)
          const changes = entry.changes || [];
          for (const change of changes) {
            await supabase.from("meta_webhook_events").insert({
              workspace_id: workspaceId,
              webhook_config_id: webhookConfigId,
              object_type: objectType,
              object_id: objectId,
              field: change.field,
              event_type: change.value?.item || "update",
              payload: change,
            });
          }

          // Instagram messaging
          const messaging = entry.messaging || [];
          for (const msg of messaging) {
            await supabase.from("meta_webhook_events").insert({
              workspace_id: workspaceId,
              webhook_config_id: webhookConfigId,
              object_type: objectType,
              object_id: objectId,
              field: "messaging",
              event_type: msg.message ? "message" : "unknown",
              payload: msg,
            });
          }
        }

        if (objectType === "whatsapp_business_account") {
          // WhatsApp events
          const changes = entry.changes || [];
          for (const change of changes) {
            const value = change.value || {};
            
            await supabase.from("meta_webhook_events").insert({
              workspace_id: workspaceId,
              webhook_config_id: webhookConfigId,
              object_type: objectType,
              object_id: objectId,
              field: change.field,
              event_type: value.statuses ? "status" : value.messages ? "message" : "unknown",
              payload: change,
            });

            // Process WhatsApp messages
            if (value.messages && workspaceId) {
              for (const waMsg of value.messages) {
                await processWhatsAppMessage(supabase, workspaceId, value.metadata?.phone_number_id, waMsg, value.contacts);
              }
            }

            // Process WhatsApp status updates
            if (value.statuses && workspaceId) {
              for (const status of value.statuses) {
                await processWhatsAppStatus(supabase, workspaceId, status);
              }
            }
          }
        }

        // Update last_event_at
        if (webhookConfigId) {
          await supabase
            .from("meta_webhook_configs")
            .update({ last_event_at: new Date().toISOString() })
            .eq("id", webhookConfigId);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      console.error("Webhook processing error:", err);
      // Always return 200 to Meta to prevent retries
      return new Response(JSON.stringify({ error: "Processing error" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});

/**
 * Process Messenger message into conversations
 */
async function processMessengerMessage(
  supabase: any,
  workspaceId: string,
  pageId: string,
  msg: {
    sender: { id: string };
    recipient: { id: string };
    timestamp: number;
    message?: { mid: string; text?: string; attachments?: Array<{ type: string; payload: { url: string } }> };
  }
) {
  const senderId = msg.sender.id;
  const isInbound = senderId !== pageId;
  const participantId = isInbound ? senderId : msg.recipient.id;

  // Upsert conversation
  const { data: conversation } = await supabase
    .from("meta_conversations")
    .upsert({
      workspace_id: workspaceId,
      platform: "messenger",
      page_id: pageId,
      conversation_id: `${pageId}_${participantId}`,
      participant_id: participantId,
      last_message_at: new Date(msg.timestamp).toISOString(),
      unread_count: isInbound ? 1 : 0,
    }, { 
      onConflict: "workspace_id,platform,conversation_id",
      ignoreDuplicates: false 
    })
    .select("id, unread_count")
    .single();

  if (!conversation) return;

  // Update unread count for inbound messages
  if (isInbound) {
    await supabase
      .from("meta_conversations")
      .update({ unread_count: (conversation.unread_count || 0) + 1 })
      .eq("id", conversation.id);
  }

  // Insert message
  const messageContent = msg.message?.text || 
    (msg.message?.attachments?.[0] ? `[${msg.message.attachments[0].type}]` : "");

  await supabase.from("meta_messages").upsert({
    workspace_id: workspaceId,
    conversation_id: conversation.id,
    message_id: msg.message?.mid || `${msg.timestamp}`,
    direction: isInbound ? "inbound" : "outbound",
    message_type: msg.message?.attachments?.[0]?.type || "text",
    content: messageContent,
    media_url: msg.message?.attachments?.[0]?.payload?.url,
    sent_at: new Date(msg.timestamp).toISOString(),
    status: "delivered",
  }, { onConflict: "workspace_id,message_id" });
}

/**
 * Process WhatsApp message
 */
async function processWhatsAppMessage(
  supabase: any,
  workspaceId: string,
  phoneNumberId: string,
  waMsg: {
    id: string;
    from: string;
    timestamp: string;
    type: string;
    text?: { body: string };
    image?: { id: string; mime_type: string };
    audio?: { id: string; mime_type: string };
    video?: { id: string; mime_type: string };
    document?: { id: string; filename: string };
  },
  contacts?: Array<{ profile: { name: string }; wa_id: string }>
) {
  const participantPhone = waMsg.from;
  const contact = contacts?.find(c => c.wa_id === participantPhone);

  // Upsert conversation
  const { data: conversation } = await supabase
    .from("meta_conversations")
    .upsert({
      workspace_id: workspaceId,
      platform: "whatsapp",
      phone_number_id: phoneNumberId,
      conversation_id: `${phoneNumberId}_${participantPhone}`,
      participant_id: participantPhone,
      participant_name: contact?.profile?.name,
      last_message_at: new Date(parseInt(waMsg.timestamp) * 1000).toISOString(),
      unread_count: 1,
    }, { onConflict: "workspace_id,platform,conversation_id" })
    .select("id")
    .single();

  if (!conversation) return;

  // Determine message content
  let content = "";
  const mediaUrl = "";
  
  switch (waMsg.type) {
    case "text":
      content = waMsg.text?.body || "";
      break;
    case "image":
    case "audio":
    case "video":
    case "document":
      content = `[${waMsg.type}]`;
      break;
    default:
      content = `[${waMsg.type}]`;
  }

  await supabase.from("meta_messages").upsert({
    workspace_id: workspaceId,
    conversation_id: conversation.id,
    message_id: waMsg.id,
    direction: "inbound",
    message_type: waMsg.type,
    content,
    media_url: mediaUrl,
    sent_at: new Date(parseInt(waMsg.timestamp) * 1000).toISOString(),
    status: "delivered",
  }, { onConflict: "workspace_id,message_id" });
}

/**
 * Process WhatsApp status updates
 */
async function processWhatsAppStatus(
  supabase: any,
  workspaceId: string,
  status: {
    id: string;
    status: "sent" | "delivered" | "read" | "failed";
    timestamp: string;
    recipient_id: string;
    errors?: Array<{ code: number; title: string }>;
  }
) {
  const updateData: Record<string, unknown> = {
    status: status.status,
  };

  if (status.status === "delivered") {
    updateData.delivered_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
  } else if (status.status === "read") {
    updateData.read_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
  } else if (status.status === "failed" && status.errors?.[0]) {
    updateData.error_code = status.errors[0].code.toString();
    updateData.error_message = status.errors[0].title;
  }

  await supabase
    .from("meta_messages")
    .update(updateData)
    .eq("workspace_id", workspaceId)
    .eq("message_id", status.id);
}
