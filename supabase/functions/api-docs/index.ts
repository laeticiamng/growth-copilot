import { getOpenApiSpec } from "../_shared/openapi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "json";

  try {
    const spec = getOpenApiSpec();

    if (format === "yaml") {
      // Simple YAML conversion for readability
      const yaml = jsonToYaml(spec);
      return new Response(yaml, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/yaml",
        },
      });
    }

    // Return as JSON (default)
    return new Response(JSON.stringify(spec, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error serving OpenAPI spec:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate OpenAPI spec" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Simple JSON to YAML converter
function jsonToYaml(obj: unknown, indent = 0): string {
  const spaces = "  ".repeat(indent);
  
  if (obj === null || obj === undefined) {
    return "null";
  }
  
  if (typeof obj === "string") {
    if (obj.includes("\n") || obj.includes(":") || obj.includes("#")) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }
  
  if (typeof obj === "number" || typeof obj === "boolean") {
    return String(obj);
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj
      .map((item) => `\n${spaces}- ${jsonToYaml(item, indent + 1).trim()}`)
      .join("");
  }
  
  if (typeof obj === "object") {
    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";
    return entries
      .map(([key, value]) => {
        const yamlValue = jsonToYaml(value, indent + 1);
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          return `\n${spaces}${key}:${yamlValue}`;
        }
        return `\n${spaces}${key}: ${yamlValue}`;
      })
      .join("");
  }
  
  return String(obj);
}
