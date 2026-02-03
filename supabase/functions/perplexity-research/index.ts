import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ResearchRequest {
  workspace_id: string;
  query: string;
  mode: 'competitor' | 'market' | 'trends' | 'custom';
  domain_filter?: string[];
  recency?: 'day' | 'week' | 'month' | 'year';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validate user auth
    const authResult = await validateAuth(req, supabaseUrl, supabaseAnonKey);
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error || "Unauthorized", corsHeaders);
    }

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      console.error("[Perplexity] API key not configured");
      return new Response(
        JSON.stringify({ error: "Perplexity not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ResearchRequest = await req.json();
    const { query, mode, domain_filter, recency } = body;

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt based on mode
    let systemPrompt = "You are a strategic business analyst. Provide structured, actionable intelligence. Always respond in French.";
    
    switch (mode) {
      case 'competitor':
        systemPrompt = `Tu es un analyste de veille concurrentielle. Analyse les concurrents de manière approfondie :
- Forces et faiblesses clés
- Positionnement et stratégie de prix
- Mouvements et annonces récents
- Menaces et opportunités potentielles
Structure ta réponse avec des sections claires et des bullet points.`;
        break;
      case 'market':
        systemPrompt = `Tu es un analyste de marché. Fournis :
- Taille du marché et tendances de croissance
- Acteurs clés et parts de marché
- Dynamiques et moteurs de l'industrie
- Perspectives futures et prédictions
Sois précis avec les données et les sources.`;
        break;
      case 'trends':
        systemPrompt = `Tu es un analyste de tendances. Identifie :
- Tendances et patterns émergents
- Évolutions technologiques
- Changements de comportement consommateur
- Évolutions réglementaires
Concentre-toi sur des insights actionnables pour la stratégie business.`;
        break;
      case 'custom':
        systemPrompt = `Tu es un analyste business stratégique. Réponds de manière structurée, précise et actionnable. Toujours en français.`;
        break;
    }

    console.log(`[Perplexity] Research query: "${query.substring(0, 50)}..." mode: ${mode}, user: ${authResult.userId}`);

    const requestBody: Record<string, unknown> = {
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
    };

    if (domain_filter && domain_filter.length > 0) {
      requestBody.search_domain_filter = domain_filter;
    }

    if (recency) {
      requestBody.search_recency_filter = recency;
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Perplexity] API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erreur API Perplexity", details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    console.log(`[Perplexity] Research completed, citations: ${data.citations?.length || 0}`);

    return new Response(
      JSON.stringify({
        content: data.choices?.[0]?.message?.content || '',
        citations: data.citations || [],
        model: data.model,
        usage: data.usage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Perplexity] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
