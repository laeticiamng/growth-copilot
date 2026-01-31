import { DiagnosticsPanel } from "@/components/diagnostics/DiagnosticsPanel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Terminal,
  FileText,
  AlertTriangle,
  Download,
  Bug,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Diagnostics() {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();

  // Fetch recent errors from action_log
  const { data: recentErrors } = useQuery({
    queryKey: ['diagnostic-errors', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      
      const { data, error } = await supabase
        .from('action_log')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('result', 'error')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id,
  });

  // Fetch recent agent runs with errors
  const { data: failedRuns } = useQuery({
    queryKey: ['failed-agent-runs', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      
      const { data, error } = await supabase
        .from('agent_runs')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id,
  });

  const exportDiagnostics = () => {
    const diagnosticData = {
      timestamp: new Date().toISOString(),
      workspace_id: currentWorkspace?.id,
      site_id: currentSite?.id,
      recent_errors: recentErrors,
      failed_runs: failedRuns,
      environment: import.meta.env.DEV ? "development" : "production",
      user_agent: navigator.userAgent,
    };

    const blob = new Blob([JSON.stringify(diagnosticData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Rapport de diagnostics exporté");
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${Math.floor(diffHours / 24)}j`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bug className="w-6 h-6 text-primary" />
            Diagnostics
          </h1>
          <p className="text-muted-foreground">
            Outils de debug et monitoring système
          </p>
        </div>
        <Button variant="outline" onClick={exportDiagnostics}>
          <Download className="w-4 h-4 mr-2" />
          Exporter rapport
        </Button>
      </div>

      {/* Main Diagnostics Panel */}
      <DiagnosticsPanel />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Errors */}
        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Erreurs récentes
            </CardTitle>
            <CardDescription>Dernières erreurs enregistrées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentErrors && recentErrors.length > 0 ? (
              recentErrors.map((error) => (
                <div key={error.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">{error.description}</p>
                    <Badge variant="destructive" className="text-xs">
                      {error.action_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {error.actor_type} • {formatTimeAgo(error.created_at || '')}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune erreur récente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Failed Agent Runs */}
        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              Agents en échec
            </CardTitle>
            <CardDescription>Exécutions d'agents ayant échoué</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {failedRuns && failedRuns.length > 0 ? (
              failedRuns.map((run) => (
                <div key={run.id} className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {run.agent_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-destructive mt-1">
                        {run.error_message || "Erreur inconnue"}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="text-xs">
                        Échec
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {run.duration_ms ? `${run.duration_ms}ms` : "—"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatTimeAgo(run.created_at || '')}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Terminal className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucun agent en échec récemment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card variant="feature">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Informations système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">Version App</p>
              <p className="text-sm font-medium">1.0.0</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">Build</p>
              <p className="text-sm font-medium">{import.meta.env.DEV ? "Development" : "Production"}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">React</p>
              <p className="text-sm font-medium">18.3.1</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">Supabase</p>
              <p className="text-sm font-medium">Cloud</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
