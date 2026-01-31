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

export interface RoleAuthResult extends WorkspaceAuthResult {
  role?: string;
  hasRequiredRole?: boolean;
}

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 0,
  analyst: 1,
  manager: 2,
  admin: 3,
  owner: 4,
};

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
 * Validate JWT, workspace access, AND role requirement
 * Enforces minimum role level for sensitive operations
 */
export async function validateRoleAccess(
  req: Request,
  workspaceId: string,
  requiredRole: "viewer" | "analyst" | "manager" | "admin" | "owner",
  supabaseUrl: string,
  supabaseAnonKey: string,
  supabaseServiceKey: string
): Promise<RoleAuthResult> {
  // First validate workspace access
  const wsResult = await validateWorkspaceAccess(
    req,
    workspaceId,
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey
  );
  
  if (!wsResult.hasAccess) {
    return wsResult;
  }

  // Now check role using service role
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data: effectiveRole, error } = await supabase.rpc("get_effective_role", {
      _user_id: wsResult.userId,
      _workspace_id: workspaceId,
    });

    if (error) {
      console.error("Role check failed:", error.message);
      return {
        ...wsResult,
        hasRequiredRole: false,
        error: "Failed to verify role",
      };
    }

    const userRoleLevel = ROLE_HIERARCHY[effectiveRole] ?? 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];
    const hasRequiredRole = userRoleLevel >= requiredRoleLevel;

    if (!hasRequiredRole) {
      return {
        ...wsResult,
        role: effectiveRole,
        hasRequiredRole: false,
        error: `Access denied: Requires ${requiredRole} role or higher (you have ${effectiveRole})`,
      };
    }

    return {
      ...wsResult,
      role: effectiveRole,
      hasRequiredRole: true,
    };
  } catch (err) {
    console.error("Role check exception:", err);
    return {
      ...wsResult,
      hasRequiredRole: false,
      error: "Failed to verify role",
    };
  }
}

/**
 * Log integration action to action_log table
 */
export async function logIntegrationAction(
  supabaseServiceKey: string,
  supabaseUrl: string,
  workspaceId: string,
  userId: string,
  actionType: "integration_connected" | "integration_disconnected" | "integration_sync",
  provider: string,
  details?: Record<string, unknown>
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    await supabase.from("action_log").insert({
      workspace_id: workspaceId,
      actor_id: userId,
      actor_type: "user",
      action_type: actionType,
      action_category: "integration",
      description: `${actionType}: ${provider}`,
      details: details || {},
      entity_type: "integration",
      is_automated: false,
    });
  } catch (err) {
    console.error("Failed to log integration action:", err);
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
