import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { addBreadcrumb, setTag } from '@/lib/sentry';

/**
 * Hook to track route changes as Sentry breadcrumbs
 * Adds navigation context for better error debugging
 */
export function useSentryRouting(): void {
  const location = useLocation();

  useEffect(() => {
    // Add breadcrumb for each navigation
    addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${location.pathname}`,
      level: 'info',
      data: {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
    });

    // Set current route as tag for filtering
    setTag('route', location.pathname);
  }, [location.pathname, location.search, location.hash]);
}
