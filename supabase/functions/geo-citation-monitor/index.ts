import { getCorsHeaders, corsPreflightResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsPreflightResponse(req);
  }
  const corsHeaders = getCorsHeaders(req);

  try {
    const { query, brand } = await req.json();
    if (!query || !brand) {
      return new Response(JSON.stringify({ error: "Query and brand are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use Perplexity to simulate what an AI would return
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!perplexityKey) {
      return new Response(
        JSON.stringify({ error: "Perplexity connector not configured. Enable it in Settings > Integrations." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ppResp = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Answer the user's question with sources and citations.",
          },
          { role: "user", content: query },
        ],
      }),
    });

    if (!ppResp.ok) {
      throw new Error(`Perplexity API error: ${ppResp.status}`);
    }

    const ppData = await ppResp.json();
    const aiResponse = ppData.choices?.[0]?.message?.content || "";
    const citations = ppData.citations || [];

    // Check if brand is cited
    const brandLower = brand.toLowerCase();
    const cited = aiResponse.toLowerCase().includes(brandLower) ||
      citations.some((c: string) => c.toLowerCase().includes(brandLower));

    // Generate recommendations using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let recommendations: string[] = [];

    if (LOVABLE_API_KEY) {
      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: "You are a GEO expert. Return a JSON array of 3-5 actionable recommendations in French.",
              },
              {
                role: "user",
                content: `The brand "${brand}" was ${cited ? "cited" : "NOT cited"} in AI search results for the query "${query}". 
                
AI response: "${aiResponse.substring(0, 1000)}"
Citations: ${JSON.stringify(citations)}

Give 3-5 specific, actionable GEO recommendations to ${cited ? "maintain and improve" : "achieve"} AI citation visibility. Return ONLY a JSON array of strings.`,
              },
            ],
            temperature: 0.4,
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          let raw = aiData.choices?.[0]?.message?.content || "[]";
          raw = raw.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "").trim();
          try {
            recommendations = JSON.parse(raw);
          } catch {
            recommendations = [raw.substring(0, 200)];
          }
        }
      } catch (e) {
        console.warn("Recommendation generation failed:", e);
      }
    }

    return new Response(
      JSON.stringify({
        cited,
        aiResponse,
        citations,
        query,
        brand,
        recommendations,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Citation monitor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Monitor failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
