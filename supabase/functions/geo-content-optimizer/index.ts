import { getCorsHeaders, corsPreflightResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsPreflightResponse(req);
  }
  const corsHeaders = getCorsHeaders(req);

  try {
    const { content } = await req.json();
    if (!content) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are a GEO (Generative Engine Optimization) expert. Analyze this content and optimize it so that AI engines (ChatGPT, Perplexity, Claude) will cite it in their responses.

Content to analyze:
"""
${content.substring(0, 5000)}
"""

Return a JSON object with:
{
  "score": <0-100 GEO readiness score>,
  "optimizedContent": "<rewritten version optimized for AI citation>",
  "suggestions": ["<actionable suggestion 1>", "<suggestion 2>", ...],
  "issues": [
    {"type": "positioning", "detail": "<issue>"},
    {"type": "structure", "detail": "<issue>"},
    ...
  ]
}

GEO optimization rules:
1. Clear, unique positioning — no corporate jargon
2. Factual claims backed by data/sources
3. Direct answers to potential user questions
4. Structured format (lists, clear headings)
5. Expertise signals (specific details, methodology, results)
6. Conversational but authoritative tone
7. FAQ-ready format for common questions

Return ONLY valid JSON, no markdown.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a GEO optimization expert. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted, please top up." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResp.json();
    let resultRaw = aiData.choices?.[0]?.message?.content || "{}";
    resultRaw = resultRaw.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "").trim();

    let result;
    try {
      result = JSON.parse(resultRaw);
    } catch {
      result = { score: 0, suggestions: ["AI response parsing failed"], optimizedContent: resultRaw.substring(0, 1000) };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Content optimizer error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Optimization failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
