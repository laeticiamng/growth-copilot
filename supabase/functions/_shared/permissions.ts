import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Permission check utilities for edge functions
 * Server-side RBAC validation
 */

export type PermissionAction = 
  | 'run_agents'
  | 'approve_actions'
  | 'connect_integrations'
  | 'export_assets'
  | 'manage_billing'
  | 'manage_team'
  | 'view_reports'
  | 'edit_content'
  | 'publish_content'
  | 'manage_ads'
  | 'manage_experiments';

export interface PermissionCheckResult {
  allowed: boolean;
  userId?: string;
  role?: string;
  error?: string;
}

/**
 * Check if user has a specific permission in a workspace
 */
export async function checkPermission(
  supabaseServiceClient: SupabaseClient,
  userId: string,
  workspaceId: string,
  permission: PermissionAction,
  siteId?: string
): Promise<PermissionCheckResult> {
  try {
    const { data: hasPermission, error } = await supabaseServiceClient.rpc('has_permission', {
      _user_id: userId,
      _workspace_id: workspaceId,
      _permission: permission,
      _site_id: siteId || null
    });

    if (error) {
      console.error('Permission check failed:', error);
      return { 
        allowed: false, 
        error: 'Permission check failed',
        userId 
      };
    }

    return { 
      allowed: !!hasPermission,
      userId
    };
  } catch (err) {
    console.error('Permission check exception:', err);
    return { 
      allowed: false, 
      error: 'Permission check error',
      userId 
    };
  }
}

/**
 * Check workspace access and get user's effective role
 */
export async function getEffectiveRole(
  supabaseServiceClient: SupabaseClient,
  userId: string,
  workspaceId: string,
  siteId?: string
): Promise<{ role: string | null; error?: string }> {
  try {
    const { data, error } = await supabaseServiceClient.rpc('get_effective_role', {
      _user_id: userId,
      _workspace_id: workspaceId,
      _site_id: siteId || null
    });

    if (error) {
      return { role: null, error: error.message };
    }

    return { role: data };
  } catch (err) {
    return { role: null, error: 'Failed to get role' };
  }
}

/**
 * Check policy for an action type
 */
export async function checkPolicy(
  supabaseServiceClient: SupabaseClient,
  workspaceId: string,
  actionType: string,
  siteId?: string
): Promise<{
  requires_approval: boolean;
  autopilot_allowed: boolean;
  risk_level: string;
  constraints: Record<string, unknown>;
}> {
  try {
    const { data, error } = await supabaseServiceClient.rpc('check_policy', {
      _workspace_id: workspaceId,
      _action_type: actionType,
      _site_id: siteId || null
    });

    if (error || !data || data.length === 0) {
      // Default: require approval, no autopilot
      return {
        requires_approval: true,
        autopilot_allowed: false,
        risk_level: 'medium',
        constraints: {}
      };
    }

    const policy = data[0];
    return {
      requires_approval: policy.requires_approval ?? true,
      autopilot_allowed: policy.autopilot_allowed ?? false,
      risk_level: policy.risk_level ?? 'medium',
      constraints: (policy.constraints as Record<string, unknown>) ?? {}
    };
  } catch (err) {
    console.error('Policy check failed:', err);
    return {
      requires_approval: true,
      autopilot_allowed: false,
      risk_level: 'high',
      constraints: {}
    };
  }
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(
  message: string,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ 
      error: message, 
      code: 'FORBIDDEN',
      permission_denied: true 
    }),
    {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Log permission audit event
 */
export async function logPermissionAudit(
  supabaseServiceClient: SupabaseClient,
  workspaceId: string,
  userId: string,
  action: string,
  permission: PermissionAction,
  allowed: boolean,
  context?: Record<string, unknown>
): Promise<void> {
  try {
    await supabaseServiceClient.rpc('log_audit_event', {
      _workspace_id: workspaceId,
      _entity_type: 'permission_check',
      _entity_id: null,
      _action: action,
      _actor_id: userId,
      _actor_type: 'user',
      _changes: { permission, allowed },
      _context: context || {}
    });
  } catch (err) {
    console.error('Failed to log permission audit:', err);
  }
}
