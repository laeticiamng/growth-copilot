/**
 * Centralized CORS configuration with restrictive origin validation
 * Only allows requests from whitelisted domains
 */

const ALLOWED_ORIGINS = [
  // Production domains
  "https://www.agent-growth-automator.com",
  "https://agent-growth-automator.com",
  // Lovable preview/published domains
  "https://agent-growth-automator.lovable.app",
];

// Pattern for Lovable preview domains (dynamic subdomains)
const LOVABLE_PREVIEW_PATTERN = /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.lovable\.app$/;
const LOVABLE_PROJECT_PATTERN = /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/;

// Development origins (only added in development mode)
const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:8080",
];

/**
 * Check if an origin is allowed
 */
function isAllowedOrigin(origin: string): boolean {
  // Check exact matches
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // Check Lovable preview pattern
  if (LOVABLE_PREVIEW_PATTERN.test(origin)) {
    return true;
  }

  // Check Lovable project pattern
  if (LOVABLE_PROJECT_PATTERN.test(origin)) {
    return true;
  }

  // Check dev origins if in development mode
  const isDev = Deno.env.get("ENVIRONMENT") === "development";
  if (isDev && DEV_ORIGINS.includes(origin)) {
    return true;
  }

  return false;
}

/**
 * Get CORS headers for a request
 * Validates origin against whitelist and returns appropriate headers
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  
  // Use the origin if allowed, otherwise default to primary production domain
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, stripe-signature",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Create a CORS preflight response
 */
export function corsPreflightResponse(req: Request): Response {
  return new Response(null, { headers: getCorsHeaders(req) });
}
