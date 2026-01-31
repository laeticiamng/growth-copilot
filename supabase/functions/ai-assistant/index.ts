import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'assistant IA de Growth OS, une plateforme marketing tout-en-un. Tu aides les utilisateurs à :
- Comprendre leurs KPIs et performances
- Configurer les modules (SEO, Ads, CRM, Social, CRO)
- Résoudre leurs problèmes techniques
- Optimiser leur stratégie de croissance
- Utiliser les 12 agents IA spécialisés

Tu es expert en marketing digital, SEO, Google Ads, Meta Ads, CRM, et growth hacking.
Réponds en français, de manière concise et actionnable.
Si tu ne sais pas, dis-le honnêtement.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    switch (action) {
      case "chat": {
        const { conversation_id, message, workspace_id } = params;

        if (!message || !workspace_id) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get or create conversation
        let convId = conversation_id;
        if (!convId) {
          const { data: newConv, error: convError } = await serviceClient
            .from("ai_conversations")
            .insert({
              workspace_id,
              user_id: user.id,
              title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
            })
            .select()
            .single();

          if (convError) throw convError;
          convId = newConv.id;
        }

        // Save user message
        await serviceClient.from("ai_messages").insert({
          conversation_id: convId,
          workspace_id,
          role: "user",
          content: message,
        });

        // Get conversation history
        const { data: history } = await serviceClient
          .from("ai_messages")
          .select("role, content")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true })
          .limit(20);

        const messages = [
          { role: "system", content: SYSTEM_PROMPT },
          ...(history || []).map((m) => ({ role: m.role, content: m.content })),
        ];

        // Call Lovable AI
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) {
          throw new Error("LOVABLE_API_KEY not configured");
        }

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages,
            stream: false,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error("[AI Assistant] API error:", aiResponse.status, errorText);
          
          if (aiResponse.status === 429) {
            return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (aiResponse.status === 402) {
            return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const assistantMessage = aiData.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";
        const tokensUsed = aiData.usage?.total_tokens || 0;

        // Save assistant message
        await serviceClient.from("ai_messages").insert({
          conversation_id: convId,
          workspace_id,
          role: "assistant",
          content: assistantMessage,
          tokens_used: tokensUsed,
        });

        return new Response(
          JSON.stringify({
            conversation_id: convId,
            message: assistantMessage,
            tokens_used: tokensUsed,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "conversations": {
        const { workspace_id } = params;
        const { data, error } = await serviceClient
          .from("ai_conversations")
          .select("id, title, created_at, updated_at")
          .eq("workspace_id", workspace_id)
          .eq("user_id", user.id)
          .eq("is_archived", false)
          .order("updated_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        return new Response(JSON.stringify({ conversations: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "history": {
        const { conversation_id, workspace_id } = params;
        const { data, error } = await serviceClient
          .from("ai_messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", conversation_id)
          .eq("workspace_id", workspace_id)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return new Response(JSON.stringify({ messages: data }), {
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
    console.error("[AI Assistant] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
