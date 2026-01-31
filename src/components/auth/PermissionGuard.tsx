import { ReactNode } from 'react';
import { usePermissions, PermissionAction, AppRole } from '@/hooks/usePermissions';
import { LoadingState } from '@/components/ui/loading-state';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: PermissionAction;
  permissions?: PermissionAction[];
  requireAll?: boolean;
  role?: AppRole;
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  fallback,
  showAccessDenied = true
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isAtLeastRole, loading } = usePermissions();

  if (loading) {
    return <LoadingState message="Vérification des permissions..." />;
  }

  let allowed = true;

  // Check single permission
  if (permission) {
    allowed = hasPermission(permission);
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    allowed = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // Check role
  if (role) {
    allowed = allowed && isAtLeastRole(role);
  }

  if (allowed) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access denied message
  if (showAccessDenied) {
    return (
      <Card variant="feature" className="max-w-md mx-auto mt-8">
        <CardContent className="py-8 text-center">
          <div className="p-3 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Accès refusé</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Contactez un administrateur pour obtenir l'accès</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// Utility component for hiding elements based on permissions
export function RequirePermission({ 
  permission, 
  children 
}: { 
  permission: PermissionAction; 
  children: ReactNode;
}) {
  const { hasPermission } = usePermissions();
  return hasPermission(permission) ? <>{children}</> : null;
}

// Utility component for hiding elements based on role
export function RequireRole({ 
  role, 
  children 
}: { 
  role: AppRole; 
  children: ReactNode;
}) {
  const { isAtLeastRole } = usePermissions();
  return isAtLeastRole(role) ? <>{children}</> : null;
}
