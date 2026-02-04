import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Database,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { cn } from "@/lib/utils";

interface SyncLog {
  id: string;
  integration_id: string;
  provider: string;
  action: string;
  scopes: string[] | null;
  error_message: string | null;
  created_at: string;
}

interface SyncLogsViewerProps {
  integrationId?: string;
  provider?: string;
  limit?: number;
}

export function SyncLogsViewer({ integrationId, provider, limit = 20 }: SyncLogsViewerProps) {
  const { currentWorkspace } = useWorkspace();
  const [expanded, setExpanded] = useState(false);

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['sync-logs', currentWorkspace?.id, integrationId, provider],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];

      let query = supabase
        .from('integration_token_audit')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }
      if (provider) {
        query = query.eq('provider', provider);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SyncLog[];
    },
    enabled: !!currentWorkspace?.id,
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'token_created':
      case 'token_refreshed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'auth_failure':
      case 'token_expired':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'sync_started':
        return <RefreshCw className="w-4 h-4 text-primary" />;
      case 'sync_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'sync_failed':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Database className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      token_created: 'Token créé',
      token_refreshed: 'Token rafraîchi',
      token_expired: 'Token expiré',
      auth_failure: 'Échec authentification',
      sync_started: 'Synchronisation démarrée',
      sync_completed: 'Synchronisation terminée',
      sync_failed: 'Synchronisation échouée',
      scope_updated: 'Scopes mis à jour',
    };
    return labels[action] || action;
  };

  const getProviderLabel = (prov: string): string => {
    const labels: Record<string, string> = {
      google_combined: 'Google',
      google: 'Google',
      meta: 'Meta',
      youtube: 'YouTube',
    };
    return labels[prov] || prov;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayLogs = expanded ? logs : logs.slice(0, 5);
  const hasMore = logs.length > 5;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4" />
              Historique de synchronisation
            </CardTitle>
            <CardDescription className="text-xs">
              {logs.length} événement{logs.length !== 1 ? 's' : ''} récent{logs.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun événement de synchronisation</p>
          </div>
        ) : (
          <>
            <ScrollArea className={cn("pr-4", expanded ? "h-80" : "h-auto")}>
              <div className="space-y-2">
                {displayLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg",
                      log.error_message ? "bg-destructive/5" : "bg-secondary/50"
                    )}
                  >
                    <div className="mt-0.5">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {getActionLabel(log.action)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getProviderLabel(log.provider)}
                        </Badge>
                      </div>
                      {log.error_message && (
                        <p className="text-xs text-destructive mt-1 line-clamp-2">
                          {log.error_message}
                        </p>
                      )}
                      {log.scopes && log.scopes.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {log.scopes.slice(0, 2).map((scope, i) => (
                            <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-muted">
                              {scope.split('/').pop()}
                            </span>
                          ))}
                          {log.scopes.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{log.scopes.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(log.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {hasMore && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Voir moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Voir tout ({logs.length})
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
