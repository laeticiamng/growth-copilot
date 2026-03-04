import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationPayload {
  workspace_id: string;
  event_type: "briefing" | "approval" | "alert";
  title: string;
  message: string;
  link?: string;
  severity?: "info" | "warning" | "critical";
}

function buildSlackPayload(p: NotificationPayload) {
  const emoji =
    p.event_type === "briefing"
      ? "📋"
      : p.event_type === "approval"
        ? "⏳"
        : p.severity === "critical"
          ? "🚨"
          : "⚠️";

  const color =
    p.event_type === "briefing"
      ? "#2563eb"
      : p.event_type === "approval"
        ? "#f59e0b"
        : p.severity === "critical"
          ? "#dc2626"
          : "#f97316";

  return {
    text: `${emoji} ${p.title}`,
    attachments: [
      {
        color,
        blocks: [
          {
            type: "section",
            text: { type: "mrkdwn", text: p.message },
          },
          ...(p.link
            ? [
                {
                  type: "actions",
                  elements: [
                    {
                      type: "button",
                      text: { type: "plain_text", text: "Voir dans Growth OS" },
                      url: p.link,
                      style: "primary",
                    },
                  ],
                },
              ]
            : []),
        ],
      },
    ],
  };
}

function buildTeamsPayload(p: NotificationPayload) {
  const emoji =
    p.event_type === "briefing"
      ? "📋"
      : p.event_type === "approval"
        ? "⏳"
        : p.severity === "critical"
          ? "🚨"
          : "⚠️";

  const color =
    p.event_type === "briefing"
      ? "0078D4"
      : p.event_type === "approval"
        ? "FFC107"
        : p.severity === "critical"
          ? "DC3545"
          : "FD7E14";

  return {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: color,
    summary: `${emoji} ${p.title}`,
    sections: [
      {
        activityTitle: `${emoji} ${p.title}`,
        text: p.message,
      },
    ],
    potentialAction: p.link
      ? [
          {
            "@type": "OpenUri",
            name: "Voir dans Growth OS",
            targets: [{ os: "default", uri: p.link }],
          },
        ]
      : [],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();

    if (!payload.workspace_id || !payload.event_type || !payload.title) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: workspace_id, event_type, title" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine which column to check
    const filterCol =
      payload.event_type === "briefing"
        ? "notify_briefings"
        : payload.event_type === "approval"
          ? "notify_approvals"
          : "notify_alerts";

    const { data: webhooks, error } = await supabase
      .from("notification_webhooks")
      .select("*")
      .eq("workspace_id", payload.workspace_id)
      .eq("is_active", true)
      .eq(filterCol, true);

    if (error) throw error;

    if (!webhooks || webhooks.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No active webhooks for this event" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = await Promise.allSettled(
      webhooks.map(async (wh: any) => {
        const body =
          wh.channel === "slack"
            ? buildSlackPayload(payload)
            : buildTeamsPayload(payload);

        const res = await fetch(wh.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`${wh.channel} webhook failed [${res.status}]: ${text}`);
        }

        return { channel: wh.channel, status: "sent" };
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results
      .filter((r) => r.status === "rejected")
      .map((r: any) => r.reason?.message);

    return new Response(
      JSON.stringify({ sent, failed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("notify-webhooks error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
