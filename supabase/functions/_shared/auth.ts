import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthResult {
  authenticated: boolean;
  userId: string | null;
  error: string | null;
  supabase: SupabaseClient | null;
}

export interface WorkspaceAuthResult extends AuthResult {
  hasAccess: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Validates the JWT token from the Authorization header
 * Returns authenticated user info or error
 */
export async function validateAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      userId: null,
      error: 'Missing or invalid Authorization header',
      supabase: null,
    };
  }

  const token = authHeader.replace('Bearer ', '');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  // Create client with user's token for RLS
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  });

  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return {
        authenticated: false,
        userId: null,
        error: error?.message || 'Invalid or expired token',
        supabase: null,
      };
    }

    return {
      authenticated: true,
      userId: data.user.id,
      error: null,
      supabase,
    };
  } catch (err) {
    return {
      authenticated: false,
      userId: null,
      error: err instanceof Error ? err.message : 'Authentication failed',
      supabase: null,
    };
  }
}

/**
 * Validates auth AND checks if user has access to the specified workspace
 */
export async function validateWorkspaceAccess(
  req: Request,
  workspaceId: string
): Promise<WorkspaceAuthResult> {
  const authResult = await validateAuth(req);
  
  if (!authResult.authenticated || !authResult.userId) {
    return {
      ...authResult,
      hasAccess: false,
    };
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data: hasAccess, error } = await serviceClient.rpc('has_workspace_access', {
      _user_id: authResult.userId,
      _workspace_id: workspaceId,
    });

    if (error) {
      console.error('Workspace access check failed:', error);
      return {
        ...authResult,
        hasAccess: false,
        error: 'Failed to verify workspace access',
      };
    }

    return {
      ...authResult,
      hasAccess: !!hasAccess,
    };
  } catch (err) {
    console.error('Workspace access check exception:', err);
    return {
      ...authResult,
      hasAccess: false,
      error: 'Failed to verify workspace access',
    };
  }
}

/**
 * Creates an unauthorized response with proper CORS headers
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Creates a forbidden response with proper CORS headers
 */
export function forbiddenResponse(message: string = 'Forbidden'): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { 
      status: 403, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export { corsHeaders };
