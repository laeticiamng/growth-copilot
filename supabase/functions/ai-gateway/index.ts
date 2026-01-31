import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Standard agent artifact schema
const ARTIFACT_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string", description: "Brief summary of the analysis or action" },
    actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          type: { type: "string", enum: ["recommendation", "approval_required", "auto_safe"] },
          impact: { type: "string", enum: ["high", "medium", "low"] },
          effort: { type: "string", enum: ["high", "medium", "low"] },
          why: { type: "string" },
          how: { type: "array", items: { type: "string" } },
          depends_on: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } }
        },
        required: ["id", "title", "type", "impact", "effort", "why", "how"]
      }
    },
    risks: { type: "array", items: { type: "string" } },
    dependencies: { type: "array", items: { type: "string" } },
    metrics_to_watch: { type: "array", items: { type: "string" } },
    requires_approval: { type: "boolean" }
  },
  required: ["summary", "actions", "risks", "dependencies", "metrics_to_watch", "requires_approval"]
};

// Minimal fallback artifact for error cases
function createFallbackArtifact(errorMessage: string): AgentArtifact {
  return {
    summary: `Analysis incomplete due to error: ${errorMessage}`,
    actions: [],
    risks: ["Analysis could not be completed - manual review required"],
    dependencies: [],
    metrics_to_watch: [],
    requires_approval: true
  };
}

interface AgentArtifact {
  summary: string;
  actions: Array<{
    id: string;
    title: string;
    type: "recommendation" | "approval_required" | "auto_safe";
    impact: "high" | "medium" | "low";
    effort: "high" | "medium" | "low";
    why: string;
    how: string[];
    depends_on?: string[];
    risks?: string[];
  }>;
  risks: string[];
  dependencies: string[];
  metrics_to_watch: string[];
  requires_approval: boolean;
}

interface RunLLMRequest {
  workspace_id: string;
  user_id?: string;
  agent_name: string;
  purpose: "cgo_plan" | "qa_review" | "seo_audit" | "copywriting" | "analysis";
  input: {
    system_prompt: string;
    user_prompt: string;
    context?: Record<string, unknown>;
  };
  provider_preference?: string;
}

// Validate JSON against expected artifact schema
function validateArtifact(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Response is not an object"] };
  }
  
  const artifact = data as Record<string, unknown>;
  
  // Required fields
  if (typeof artifact.summary !== "string") {
    errors.push("Missing or invalid 'summary' field");
  }
  if (!Array.isArray(artifact.actions)) {
    errors.push("Missing or invalid 'actions' array");
  }
  if (!Array.isArray(artifact.risks)) {
    errors.push("Missing or invalid 'risks' array");
  }
  if (!Array.isArray(artifact.dependencies)) {
    errors.push("Missing or invalid 'dependencies' array");
  }
  if (!Array.isArray(artifact.metrics_to_watch)) {
    errors.push("Missing or invalid 'metrics_to_watch' array");
  }
  if (typeof artifact.requires_approval !== "boolean") {
    errors.push("Missing or invalid 'requires_approval' boolean");
  }
  
  // Validate actions structure
  if (Array.isArray(artifact.actions)) {
    artifact.actions.forEach((action, index) => {
      if (typeof action !== "object" || !action) {
        errors.push(`Action ${index} is not an object`);
        return;
      }
      const a = action as Record<string, unknown>;
      if (!a.id) errors.push(`Action ${index} missing 'id'`);
      if (!a.title) errors.push(`Action ${index} missing 'title'`);
      if (!a.type || !["recommendation", "approval_required", "auto_safe"].includes(a.type as string)) {
        errors.push(`Action ${index} has invalid 'type'`);
      }
    });
  }
  
  return { valid: errors.length === 0, errors };
}

// Hash input for caching purposes
function hashInput(input: unknown): string {
  const str = JSON.stringify(input);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Get model config from purpose
function getModelConfig(purpose: string): { model: string; temperature: number; max_tokens: number } {
  const configs: Record<string, { model: string; temperature: number; max_tokens: number }> = {
    cgo_plan: { model: "google/gemini-2.5-flash", temperature: 0.3, max_tokens: 8192 },
    qa_review: { model: "google/gemini-2.5-flash", temperature: 0.1, max_tokens: 4096 },
    seo_audit: { model: "google/gemini-2.5-flash", temperature: 0.2, max_tokens: 4096 },
    copywriting: { model: "google/gemini-2.5-flash-lite", temperature: 0.7, max_tokens: 4096 },
    analysis: { model: "google/gemini-2.5-flash", temperature: 0.3, max_tokens: 4096 },
  };
  return configs[purpose] || configs.analysis;
}

// Estimate cost based on tokens (rough estimates)
function estimateCost(tokensIn: number, tokensOut: number, model: string): number {
  // Rough pricing per 1M tokens (Gemini models are much cheaper)
  const pricing: Record<string, { input: number; output: number }> = {
    "google/gemini-2.5-flash": { input: 0.075, output: 0.30 },
    "google/gemini-2.5-flash-lite": { input: 0.0375, output: 0.15 },
  };
  const modelPricing = pricing[model] || pricing["google/gemini-2.5-flash"];
  return (tokensIn * modelPricing.input + tokensOut * modelPricing.output) / 1_000_000;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const body: RunLLMRequest = await req.json();
    const { workspace_id, user_id, agent_name, purpose, input } = body;

    if (!workspace_id || !agent_name || !purpose || !input) {
      throw new Error("Missing required fields: workspace_id, agent_name, purpose, input");
    }

    const modelConfig = getModelConfig(purpose);
    const inputHash = hashInput(input);
    
    // Create initial ai_request record
    const { data: aiRequest, error: insertError } = await supabase
      .from("ai_requests")
      .insert({
        workspace_id,
        user_id,
        agent_name,
        purpose,
        provider_name: "lovable",
        model_name: modelConfig.model,
        input_hash: inputHash,
        input_json: input,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create ai_request:", insertError);
    }

    const requestId = aiRequest?.id;

    // Build the prompt with strict JSON output instructions
    const systemPrompt = `${input.system_prompt}

CRITICAL: You MUST respond with ONLY a valid JSON object following this exact schema:
${JSON.stringify(ARTIFACT_SCHEMA, null, 2)}

RULES:
- Output ONLY the JSON object, no markdown, no explanations
- All required fields must be present
- If you cannot complete the analysis, set requires_approval=true and explain in risks
- Never invent data - if unsure, leave actions empty and explain in risks
- Each action must have a unique id (use format: agent_purpose_001, agent_purpose_002, etc.)`;

    let result: AgentArtifact | null = null;
    let status: "success" | "error" | "retry" | "fallback" = "error";
    let errorMessage: string | null = null;
    let tokensIn = 0;
    let tokensOut = 0;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts && !result) {
      attempts++;
      
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelConfig.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.user_prompt + (input.context ? `\n\nContext: ${JSON.stringify(input.context)}` : "") },
            ],
            temperature: modelConfig.temperature,
            max_tokens: modelConfig.max_tokens,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 429) {
            throw new Error("Rate limit exceeded, please try again later");
          }
          if (response.status === 402) {
            throw new Error("AI credits exhausted, please add funds");
          }
          throw new Error(`AI gateway error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        // Extract token usage
        tokensIn = data.usage?.prompt_tokens || 0;
        tokensOut = data.usage?.completion_tokens || 0;

        if (!content) {
          throw new Error("Empty response from AI");
        }

        // Try to parse JSON from response
        let parsed: unknown;
        try {
          // Handle potential markdown code blocks
          let jsonStr = content.trim();
          if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.slice(7);
          }
          if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.slice(3);
          }
          if (jsonStr.endsWith("```")) {
            jsonStr = jsonStr.slice(0, -3);
          }
          parsed = JSON.parse(jsonStr.trim());
        } catch {
          if (attempts < maxAttempts) {
            status = "retry";
            console.log(`Attempt ${attempts}: JSON parse failed, retrying with repair prompt`);
            // Add repair instruction for retry
            input.user_prompt = `Your previous response was not valid JSON. Please try again.

Original request: ${input.user_prompt}

Remember: Output ONLY a valid JSON object, no markdown, no explanations.`;
            continue;
          }
          throw new Error("Failed to parse AI response as JSON");
        }

        // Validate the artifact structure
        const validation = validateArtifact(parsed);
        if (!validation.valid) {
          if (attempts < maxAttempts) {
            status = "retry";
            console.log(`Attempt ${attempts}: Validation failed (${validation.errors.join(", ")}), retrying`);
            input.user_prompt = `Your previous response had schema errors: ${validation.errors.join(", ")}

Please fix these issues and try again. Original request: ${input.user_prompt}`;
            continue;
          }
          throw new Error(`Invalid artifact schema: ${validation.errors.join(", ")}`);
        }

        result = parsed as AgentArtifact;
        status = attempts > 1 ? "retry" : "success";
        
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`Attempt ${attempts} failed:`, message);
        
        if (attempts >= maxAttempts) {
          errorMessage = message;
          status = "fallback";
          result = createFallbackArtifact(message);
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const costEstimate = estimateCost(tokensIn, tokensOut, modelConfig.model);

    // Update ai_request with results
    if (requestId) {
      await supabase
        .from("ai_requests")
        .update({
          output_json: result,
          status,
          error_message: errorMessage,
          tokens_in: tokensIn,
          tokens_out: tokensOut,
          cost_estimate: costEstimate,
          duration_ms: durationMs,
        })
        .eq("id", requestId);
    }

    // Log to action_log
    await supabase.from("action_log").insert({
      workspace_id,
      actor_type: "agent",
      actor_id: agent_name,
      action_type: "AI_RUN",
      action_category: "ai_gateway",
      description: `AI run for ${purpose} by ${agent_name}`,
      details: {
        request_id: requestId,
        purpose,
        provider: "lovable",
        model: modelConfig.model,
        status,
        tokens_in: tokensIn,
        tokens_out: tokensOut,
        cost_estimate: costEstimate,
        duration_ms: durationMs,
      },
      is_automated: true,
      result: status === "success" || status === "retry" ? "success" : "warning",
    });

    return new Response(
      JSON.stringify({
        success: status !== "error",
        status,
        request_id: requestId,
        artifact: result,
        usage: {
          tokens_in: tokensIn,
          tokens_out: tokensOut,
          cost_estimate: costEstimate,
          duration_ms: durationMs,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("AI Gateway error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        error: message,
        artifact: createFallbackArtifact(message),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
