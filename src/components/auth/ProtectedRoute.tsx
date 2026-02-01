import { ReactNode } from 'react';
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
export function ProtectedRoute({ 
  children, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Vérification de l'authentification..." />;
  }

  if (!user) {
    // Save the attempted URL for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * PublicOnlyRoute - Redirects authenticated users away from public pages (login, signup)
 */
export function PublicOnlyRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Chargement..." />;
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
