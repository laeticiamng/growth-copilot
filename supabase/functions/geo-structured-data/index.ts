import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Scrape the page
    let markdown = "";
    let metadata: any = {};
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (firecrawlKey) {
      const fcResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formattedUrl,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      });
      const fcData = await fcResp.json();
      markdown = fcData.data?.markdown || fcData.markdown || "";
      metadata = fcData.data?.metadata || fcData.metadata || {};
    } else {
      const resp = await fetch(formattedUrl, {
        headers: { "User-Agent": "GrowthOS-GEO/1.0" },
      });
      const html = await resp.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
      metadata = {
        title: titleMatch?.[1] || "",
        description: descMatch?.[1] || "",
        sourceURL: formattedUrl,
      };
      markdown = html.replace(/<[^>]*>/g, " ").substring(0, 5000);
    }

    // Use AI to generate structured data
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Analyze this webpage and generate comprehensive JSON-LD structured data schemas optimized for GEO (Generative Engine Optimization).

URL: ${formattedUrl}
Title: ${metadata.title || "N/A"}
Description: ${metadata.description || "N/A"}

Content excerpt:
${markdown.substring(0, 3000)}

Generate an array of JSON-LD schemas that would help AI engines (ChatGPT, Perplexity, Claude) understand and cite this page. Include all relevant schema types:
- Organization (if company/brand page)
- WebSite (always)
- WebPage (always)
- FAQPage (if FAQ content detected)
- Product/Service (if products/services described)
- Article (if blog/article content)
- HowTo (if step-by-step content)
- BreadcrumbList (always)

Return ONLY a valid JSON array of schema objects, no markdown, no explanation.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a Schema.org and JSON-LD expert. Return only valid JSON arrays." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
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
    let schemasRaw = aiData.choices?.[0]?.message?.content || "[]";
    
    // Clean markdown code block if present
    schemasRaw = schemasRaw.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "").trim();

    let schemas;
    try {
      schemas = JSON.parse(schemasRaw);
    } catch {
      schemas = [{ error: "Failed to parse AI response", raw: schemasRaw.substring(0, 500) }];
    }

    return new Response(
      JSON.stringify({ schemas, url: formattedUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Structured data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
