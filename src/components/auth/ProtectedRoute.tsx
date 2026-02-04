import { ReactNode, forwardRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/ui/loading-state';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute - Guards routes requiring authentication
 * Redirects unauthenticated users to login page with return URL
 */
export const ProtectedRoute = forwardRef<HTMLDivElement, ProtectedRouteProps>(
  function ProtectedRoute({ children, redirectTo = '/auth' }, ref) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return <LoadingState message="Vérification de l'authentification..." />;
    }

    if (!user) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return <div ref={ref}>{children}</div>;
  }
);

/**
 * PublicOnlyRoute - Redirects authenticated users away from public pages (login, signup)
 * Uses forwardRef to prevent React warnings when used with Route components
 */
export const PublicOnlyRoute = forwardRef<HTMLDivElement, ProtectedRouteProps>(
  function PublicOnlyRoute({ children, redirectTo = '/dashboard' }, ref) {
    const { user, loading } = useAuth();

    if (loading) {
      return <LoadingState message="Chargement..." />;
    }

    if (user) {
      return <Navigate to={redirectTo} replace />;
    }

    return <div ref={ref}>{children}</div>;
  }
);
