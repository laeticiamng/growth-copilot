import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Shared authentication utilities for edge functions
 * Validates JWT tokens and checks workspace access
 */

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  error?: string;
}

export interface WorkspaceAuthResult extends AuthResult {
  hasAccess?: boolean;
}

/**
 * Validate JWT from Authorization header
 * Returns userId if valid, error message if invalid
 */
export async function validateAuth(
  req: Request,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      authenticated: false,
      error: "Missing or invalid Authorization header. Expected: Bearer <token>",
    };
  }

  const token = authHeader.replace("Bearer ", "");
  
  // Create client with the user's token
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  try {
    const { data, error } = await supabase.auth.getClaims(token);
    
    if (error || !data?.claims) {
      console.error("Auth validation failed:", error?.message);
      return {
        authenticated: false,
        error: "Invalid or expired token",
      };
    }

    return {
      authenticated: true,
      userId: data.claims.sub as string,
    };
  } catch (err) {
    console.error("Auth exception:", err);
    return {
      authenticated: false,
      error: "Authentication failed",
    };
  }
}

/**
 * Validate JWT and check workspace access
 * Uses has_workspace_access RPC function
 */
export async function validateWorkspaceAccess(
  req: Request,
  workspaceId: string,
  supabaseUrl: string,
  supabaseAnonKey: string,
  supabaseServiceKey: string
): Promise<WorkspaceAuthResult> {
  // First validate the JWT
  const authResult = await validateAuth(req, supabaseUrl, supabaseAnonKey);
  
  if (!authResult.authenticated) {
    return authResult;
  }

  // Now check workspace access using service role
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data: hasAccess, error } = await supabase.rpc("has_workspace_access", {
      _user_id: authResult.userId,
      _workspace_id: workspaceId,
    });

    if (error) {
      console.error("Workspace access check failed:", error.message);
      return {
        ...authResult,
        hasAccess: false,
        error: "Failed to verify workspace access",
      };
    }

    if (!hasAccess) {
      return {
        ...authResult,
        hasAccess: false,
        error: "Access denied: You don't have access to this workspace",
      };
    }

    return {
      ...authResult,
      hasAccess: true,
    };
  } catch (err) {
    console.error("Workspace access exception:", err);
    return {
      ...authResult,
      hasAccess: false,
      error: "Failed to verify workspace access",
    };
  }
}

/**
 * Create unauthorized response with CORS headers
 */
export function unauthorizedResponse(
  message: string,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ error: message, code: "UNAUTHORIZED" }),
    {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Create forbidden response with CORS headers
 */
export function forbiddenResponse(
  message: string,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ error: message, code: "FORBIDDEN" }),
    {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
