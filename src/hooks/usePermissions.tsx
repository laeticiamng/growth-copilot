import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useAuth } from './useAuth';
import { useSites } from './useSites';

// Matches database permission_action enum
export type PermissionAction = 
  | 'run_agents'
  | 'approve_actions'
  | 'connect_integrations'
  | 'export_assets'
  | 'manage_billing'
  | 'manage_team'
  | 'view_analytics'
  | 'manage_policies'
  | 'manage_experiments'
  | 'view_audit';

// Matches database app_role enum
export type AppRole = 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer';

interface PermissionsContextType {
  permissions: PermissionAction[];
  effectiveRole: AppRole | null;
  loading: boolean;
  hasPermission: (permission: PermissionAction) => boolean;
  hasAnyPermission: (permissions: PermissionAction[]) => boolean;
  hasAllPermissions: (permissions: PermissionAction[]) => boolean;
  isAtLeastRole: (role: AppRole) => boolean;
  refetch: () => void;
}

const roleHierarchy: AppRole[] = ['viewer', 'analyst', 'manager', 'admin', 'owner'];

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [permissions, setPermissions] = useState<PermissionAction[]>([]);
  const [effectiveRole, setEffectiveRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user || !currentWorkspace) {
      setPermissions([]);
      setEffectiveRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch user permissions via RPC
      const { data: perms, error: permsError } = await supabase.rpc('get_user_permissions', {
        _user_id: user.id,
        _workspace_id: currentWorkspace.id,
        _site_id: currentSite?.id || null
      });

      if (permsError) {
        console.error('[usePermissions] Error fetching permissions:', permsError);
      } else {
        setPermissions((perms || []).map((p: { permission: PermissionAction }) => p.permission));
      }

      // Fetch effective role
      const { data: role, error: roleError } = await supabase.rpc('get_effective_role', {
        _user_id: user.id,
        _workspace_id: currentWorkspace.id,
        _site_id: currentSite?.id || null
      });

      if (roleError) {
        console.error('[usePermissions] Error fetching role:', roleError);
      } else {
        setEffectiveRole(role as AppRole);
      }
    } catch (err) {
      console.error('[usePermissions] Exception:', err);
    } finally {
      setLoading(false);
    }
  }, [user, currentWorkspace, currentSite]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback((permission: PermissionAction): boolean => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((perms: PermissionAction[]): boolean => {
    return perms.some(p => permissions.includes(p));
  }, [permissions]);

  const hasAllPermissions = useCallback((perms: PermissionAction[]): boolean => {
    return perms.every(p => permissions.includes(p));
  }, [permissions]);

  const isAtLeastRole = useCallback((role: AppRole): boolean => {
    if (!effectiveRole) return false;
    const currentIdx = roleHierarchy.indexOf(effectiveRole);
    const requiredIdx = roleHierarchy.indexOf(role);
    return currentIdx >= requiredIdx;
  }, [effectiveRole]);

  return (
    <PermissionsContext.Provider value={{
      permissions,
      effectiveRole,
      loading,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      isAtLeastRole,
      refetch: fetchPermissions
    }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

// Utility hook for permission-gated components
export function useRequirePermission(permission: PermissionAction) {
  const { hasPermission, loading } = usePermissions();
  return { allowed: hasPermission(permission), loading };
}

// Utility hook for role-gated components
export function useRequireRole(role: AppRole) {
  const { isAtLeastRole, loading } = usePermissions();
  return { allowed: isAtLeastRole(role), loading };
}
