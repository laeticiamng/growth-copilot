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

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Try Firecrawl first, fallback to native fetch
    let html = "";
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (firecrawlKey) {
      try {
        const fcResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: formattedUrl,
            formats: ["html", "markdown"],
            onlyMainContent: false,
          }),
        });
        const fcData = await fcResp.json();
        html = fcData.data?.html || fcData.html || "";
      } catch {
        console.warn("Firecrawl failed, falling back to native fetch");
      }
    }

    if (!html) {
      const resp = await fetch(formattedUrl, {
        headers: { "User-Agent": "GrowthOS-GEO-Auditor/1.0" },
      });
      html = await resp.text();
    }

    // Run GEO checks
    const checks = [];
    let score = 0;
    const recommendations: string[] = [];
    const lowerHtml = html.toLowerCase();

    // 1. JSON-LD structured data
    const hasJsonLd = lowerHtml.includes('application/ld+json');
    checks.push({
      label: "JSON-LD Structured Data",
      pass: hasJsonLd,
      detail: hasJsonLd
        ? "Données structurées JSON-LD détectées — les IA peuvent comprendre votre contenu."
        : "Aucune donnée structurée JSON-LD. Les moteurs IA ne peuvent pas interpréter votre contenu de manière fiable.",
    });
    if (hasJsonLd) score += 20;
    else recommendations.push("Ajoutez du balisage JSON-LD (Organization, FAQPage, Product) pour être compris par ChatGPT, Perplexity et Claude.");

    // 2. Clear H1
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
    const hasH1 = !!h1Match;
    const h1Text = h1Match?.[1]?.replace(/<[^>]*>/g, "").trim() || "";
    const h1IsGeneric = /transformation digitale|solutions innovantes|partenaire|leader/i.test(h1Text);
    checks.push({
      label: "H1 clair et différenciant",
      pass: hasH1 && !h1IsGeneric,
      detail: !hasH1
        ? "Aucun H1 trouvé. Les IA utilisent le H1 pour comprendre le sujet principal de la page."
        : h1IsGeneric
        ? `H1 générique détecté : "${h1Text}". Les IA ignorent le jargon corporate.`
        : `H1 trouvé : "${h1Text.substring(0, 80)}"`,
    });
    if (hasH1 && !h1IsGeneric) score += 15;
    else recommendations.push("Réécrivez votre H1 avec un positionnement clair et unique — pas de jargon corporate.");

    // 3. Meta description
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/is);
    const hasMetaDesc = !!metaDescMatch;
    const metaDesc = metaDescMatch?.[1] || "";
    checks.push({
      label: "Meta description",
      pass: hasMetaDesc && metaDesc.length >= 50,
      detail: !hasMetaDesc
        ? "Pas de meta description. Les IA utilisent cette info pour décider de citer votre site."
        : metaDesc.length < 50
        ? "Meta description trop courte — visez 120-160 caractères."
        : `Meta description OK (${metaDesc.length} caractères).`,
    });
    if (hasMetaDesc && metaDesc.length >= 50) score += 10;
    else recommendations.push("Ajoutez une meta description de 120-160 caractères qui résume votre expertise unique.");

    // 4. FAQ section
    const hasFaq = /faq|questions?\s+fréquentes|frequently\s+asked/i.test(html);
    const hasFaqSchema = html.includes("FAQPage");
    checks.push({
      label: "Section FAQ",
      pass: hasFaq || hasFaqSchema,
      detail: hasFaq || hasFaqSchema
        ? "Section FAQ détectée — excellent pour les citations dans les réponses IA."
        : "Aucune FAQ. Les IA adorent citer les FAQ structurées.",
    });
    if (hasFaq || hasFaqSchema) score += 15;
    else recommendations.push("Ajoutez une section FAQ avec des questions que vos prospects posent aux IA, balisée en FAQPage JSON-LD.");

    // 5. About/Team/Expertise section
    const hasExpertise = /à propos|about|notre expertise|notre équipe|who we are|our team/i.test(html);
    checks.push({
      label: "Page expertise / À propos",
      pass: hasExpertise,
      detail: hasExpertise
        ? "Section expertise/à-propos trouvée — renforce l'autorité auprès des IA."
        : "Aucune section claire d'expertise. Les IA recommandent les marques dont l'expertise est clairement affirmée.",
    });
    if (hasExpertise) score += 10;
    else recommendations.push("Créez une section 'À propos' ou 'Notre expertise' qui affirme clairement votre positionnement unique.");

    // 6. Canonical URL
    const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);
    checks.push({
      label: "URL canonique",
      pass: hasCanonical,
      detail: hasCanonical
        ? "Balise canonical détectée — évite la duplication dans les sources IA."
        : "Pas de balise canonical. Risque de contenu dupliqué dans les réponses IA.",
    });
    if (hasCanonical) score += 10;
    else recommendations.push("Ajoutez une balise <link rel='canonical'> pour consolider votre autorité de page.");

    // 7. Content uniqueness (rough: check for generic phrases)
    const genericPhrases = ["partenaire de votre", "solutions innovantes", "accompagnons nos clients", "à votre écoute", "sur mesure"];
    const genericFound = genericPhrases.filter((p) => lowerHtml.includes(p.toLowerCase()));
    const isUnique = genericFound.length <= 1;
    checks.push({
      label: "Contenu différenciant",
      pass: isUnique,
      detail: isUnique
        ? "Contenu relativement unique — peu de formules corporate génériques."
        : `${genericFound.length} formules corporate génériques détectées : "${genericFound.join('", "')}". Les IA les ignorent.`,
    });
    if (isUnique) score += 20;
    else recommendations.push("Éliminez les formules corporate génériques et remplacez-les par votre proposition de valeur unique.");

    // Clamp score
    score = Math.min(100, Math.max(0, score));

    return new Response(
      JSON.stringify({ score, checks, recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GEO Audit error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Audit failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
