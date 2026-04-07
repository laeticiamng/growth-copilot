import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingState, SkeletonCard } from '@/components/ui/loading-state';

/**
 * Section-level ErrorBoundary for dashboard pages.
 * Unlike the global ErrorBoundary, this renders inline (not full-screen)
 * so that the rest of the dashboard remains functional.
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[DashboardErrorBoundary${this.props.pageName ? ` - ${this.props.pageName}` : ''}]`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 p-2 rounded-full bg-destructive/10 w-fit">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-base">
              Une erreur est survenue{this.props.pageName ? ` dans ${this.props.pageName}` : ''}
            </CardTitle>
            <CardDescription className="text-sm">
              Cette section n'a pas pu se charger correctement.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-4">
            <Button variant="outline" size="sm" onClick={this.handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
          {import.meta.env.DEV && this.state.error && (
            <CardContent className="pt-0">
              <pre className="text-xs text-destructive/80 overflow-auto max-h-32 bg-destructive/5 p-2 rounded">
                {this.state.error.message}
              </pre>
            </CardContent>
          )}
        </Card>
      );
    }
    return this.props.children;
  }
}

/**
 * Loading skeleton for a typical dashboard page with stats cards + content.
 */
export function DashboardPageSkeleton({ cardCount = 4 }: { cardCount?: number }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div>
        <div className="h-8 bg-muted rounded w-1/3 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard count={cardCount} />
      </div>
      {/* Content skeleton */}
      <div className="rounded-xl border bg-card p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Wraps a dashboard page with error boundary and optional loading state.
 */
interface DashboardPageWrapperProps {
  children: ReactNode;
  pageName?: string;
  loading?: boolean;
  skeletonCards?: number;
}

export function DashboardPageWrapper({
  children,
  pageName,
  loading = false,
  skeletonCards = 4,
}: DashboardPageWrapperProps) {
  if (loading) {
    return <DashboardPageSkeleton cardCount={skeletonCards} />;
  }

  return (
    <DashboardErrorBoundary pageName={pageName}>
      {children}
    </DashboardErrorBoundary>
  );
}
