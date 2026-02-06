import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Quick site analysis for onboarding.
 * Scrapes the homepage via Firecrawl and extracts key signals:
 * - Title, description, favicon
 * - Tech stack hints (CMS, analytics)
 * - Page speed / structure
 * - Social links
 * No auth required — runs before workspace creation.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format & validate URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Block private IPs (SSRF protection)
    try {
      const parsed = new URL(formattedUrl);
      if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|localhost|0\.0\.0\.0)/i.test(parsed.hostname)) {
        return new Response(
          JSON.stringify({ success: false, error: "Private URLs are not allowed" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    let analysis: Record<string, unknown> = {};

    if (FIRECRAWL_API_KEY) {
      console.log("[site-analyze] Scraping with Firecrawl:", formattedUrl);

      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formattedUrl,
          formats: ["markdown", "links"],
          onlyMainContent: false,
          waitFor: 3000,
        }),
      });

      const data = await response.json();
      const pageData = data.data || data;

      const metadata = pageData.metadata || {};
      const markdown = pageData.markdown || "";
      const links = pageData.links || [];
      const html = pageData.html || "";

      // Extract tech signals from metadata and content
      const techSignals: string[] = [];
      const socialLinks: string[] = [];

      // Detect CMS
      if (metadata.generator) techSignals.push(metadata.generator);
      if (markdown.includes("wp-content") || markdown.includes("wordpress")) techSignals.push("WordPress");
      if (markdown.includes("shopify") || metadata.sourceURL?.includes("myshopify")) techSignals.push("Shopify");
      if (markdown.includes("wix.com")) techSignals.push("Wix");

      // Detect analytics/tracking
      if (markdown.includes("gtag") || markdown.includes("google-analytics") || markdown.includes("G-")) techSignals.push("Google Analytics");
      if (markdown.includes("gtm") || markdown.includes("googletagmanager")) techSignals.push("Google Tag Manager");
      if (markdown.includes("fbq(") || markdown.includes("facebook.com/tr")) techSignals.push("Meta Pixel");

      // Extract social links
      for (const link of links) {
        if (typeof link === "string") {
          if (link.includes("instagram.com/")) socialLinks.push(link);
          else if (link.includes("facebook.com/")) socialLinks.push(link);
          else if (link.includes("linkedin.com/")) socialLinks.push(link);
          else if (link.includes("youtube.com/") || link.includes("youtu.be/")) socialLinks.push(link);
          else if (link.includes("twitter.com/") || link.includes("x.com/")) socialLinks.push(link);
          else if (link.includes("tiktok.com/")) socialLinks.push(link);
        }
      }

      // Count pages (internal links)
      const parsed = new URL(formattedUrl);
      const internalLinks = links.filter((l: string) => {
        try { return new URL(l).hostname === parsed.hostname; } catch { return false; }
      });

      // Content length estimation
      const wordCount = markdown.split(/\s+/).filter(Boolean).length;

      // H1 detection
      const h1Match = markdown.match(/^#\s+(.+)$/m);

      analysis = {
        title: metadata.title || null,
        description: metadata.description || null,
        language: metadata.language || null,
        favicon: metadata.favicon || null,
        ogImage: metadata.ogImage || null,
        h1: h1Match?.[1] || null,
        wordCount,
        internalLinksCount: internalLinks.length,
        totalLinksCount: links.length,
        techStack: [...new Set(techSignals)],
        socialLinks: [...new Set(socialLinks)].slice(0, 10),
        hasAnalytics: techSignals.some(t => t.includes("Analytics") || t.includes("Tag Manager")),
        hasMetaPixel: techSignals.includes("Meta Pixel"),
        detectedCMS: techSignals.find(t => ["WordPress", "Shopify", "Wix"].includes(t)) || null,
      };

      console.log("[site-analyze] Analysis complete:", JSON.stringify(analysis, null, 2));
    } else {
      // Fallback: basic fetch without Firecrawl
      console.log("[site-analyze] No Firecrawl key, using basic fetch");
      try {
        const response = await fetch(formattedUrl, {
          headers: { "User-Agent": "GrowthOS-Bot/1.0" },
          redirect: "follow",
        });
        const html = await response.text();

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

        analysis = {
          title: titleMatch?.[1]?.trim() || null,
          description: descMatch?.[1]?.trim() || null,
          h1: h1Match?.[1]?.trim() || null,
          wordCount: html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length,
          techStack: [],
          socialLinks: [],
          hasAnalytics: html.includes("gtag") || html.includes("analytics"),
          hasMetaPixel: html.includes("fbq("),
          detectedCMS: html.includes("wp-content") ? "WordPress" : html.includes("Shopify") ? "Shopify" : null,
        };
      } catch (e) {
        console.error("[site-analyze] Basic fetch failed:", e);
        analysis = { error: "Could not reach the site" };
      }
    }

    return new Response(
      JSON.stringify({ success: true, url: formattedUrl, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[site-analyze] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
