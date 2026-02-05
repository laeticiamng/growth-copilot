import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { captureException, isSentryEnabled } from '@/lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, eventId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Capture to Sentry and get event ID
    const eventId = captureException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
    
    this.setState({ errorInfo, eventId: eventId || null });
    
    // Log structured error for debugging
    const errorPayload = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sentryEventId: eventId,
    };
    
    // Always log structured data
    console.error('[Error Boundary]', errorPayload);
    
    // In production, store in localStorage for diagnostics
    if (import.meta.env.PROD) {
      try {
        const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
        errors.unshift(errorPayload);
        localStorage.setItem('app_errors', JSON.stringify(errors.slice(0, 10)));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, eventId: null });
    window.location.reload();
  };

  handleReportProblem = () => {
    const subject = encodeURIComponent('Signalement erreur Growth OS');
    const body = encodeURIComponent(
      `Bonjour,\n\nJ'ai rencontré une erreur sur Growth OS.\n\n` +
      `ID de l'erreur : ${this.state.eventId || 'Non disponible'}\n` +
      `URL : ${window.location.href}\n` +
      `Date : ${new Date().toLocaleString('fr-FR')}\n\n` +
      `Description du problème :\n[Décrivez ce que vous faisiez quand l'erreur est survenue]\n\n` +
      `Cordialement`
    );
    window.location.href = `mailto:support@agent-growth-automator.com?subject=${subject}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card variant="feature" className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10 w-fit">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle>Une erreur inattendue s'est produite</CardTitle>
              <CardDescription>
                Notre équipe a été notifiée et travaille à résoudre ce problème.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error ID for support reference */}
              {this.state.eventId && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">
                    ID de l'erreur (à communiquer au support) :
                  </p>
                  <code className="text-sm font-mono text-foreground select-all">
                    {this.state.eventId}
                  </code>
                </div>
              )}
              
              {/* Sentry status indicator */}
              {isSentryEnabled && (
                <p className="text-xs text-center text-muted-foreground">
                  ✓ L'erreur a été automatiquement signalée à notre équipe technique.
                </p>
              )}
              
              {/* Dev-only error details */}
              {import.meta.env.DEV && this.state.error && (
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-sm font-mono text-destructive break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">
                        Stack trace
                      </summary>
                      <pre className="text-xs mt-2 overflow-auto max-h-40 text-muted-foreground">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recharger la page
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleReportProblem}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Signaler le problème
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
