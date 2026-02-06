import { useState, useEffect } from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DiagnosticsPanel, LatencyHistoryChart, ConsoleLogsViewer } from "@/components/diagnostics";
import { GA4MetricsWidget } from "@/components/integrations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Terminal,
  FileText,
  AlertTriangle,
  Download,
  Bug,
  Zap,
  Clock,
  Server,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

interface LatencyMetric {
  name: string;
  latency: number | null;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: Date;
}

export default function Diagnostics() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const { isOnline } = useNetworkStatus();
  const [latencyMetrics, setLatencyMetrics] = useState<LatencyMetric[]>([]);
  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);
 
   // Real-time subscription for action_log errors
   useRealtimeSubscription(
     `diagnostics-${currentWorkspace?.id}`,
     {
       table: 'action_log',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     () => {},
     !!currentWorkspace?.id
   );

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

  // Real-time latency monitoring
  const runHealthCheck = async () => {
    setIsRunningHealthCheck(true);
    const metrics: LatencyMetric[] = [];

    // Test Supabase Database
    try {
      const start = performance.now();
      await supabase.from('workspaces').select('id').limit(1);
      const latency = Math.round(performance.now() - start);
      metrics.push({
        name: 'Database',
        latency,
        status: latency < 200 ? 'healthy' : latency < 500 ? 'degraded' : 'down',
        lastCheck: new Date(),
      });
    } catch {
      metrics.push({ name: 'Database', latency: null, status: 'down', lastCheck: new Date() });
    }

    // Test Auth Service
    try {
      const start = performance.now();
      await supabase.auth.getSession();
      const latency = Math.round(performance.now() - start);
      metrics.push({
        name: 'Auth Service',
        latency,
        status: latency < 150 ? 'healthy' : latency < 400 ? 'degraded' : 'down',
        lastCheck: new Date(),
      });
    } catch {
      metrics.push({ name: 'Auth Service', latency: null, status: 'down', lastCheck: new Date() });
    }

    // Test Edge Functions (ai-gateway)
    try {
      const start = performance.now();
      await supabase.functions.invoke('ai-gateway', { 
        body: { ping: true },
      }).catch(() => null); // May fail but we measure response time
      const latency = Math.round(performance.now() - start);
      metrics.push({
        name: 'Edge Functions',
        latency,
        status: latency < 300 ? 'healthy' : latency < 800 ? 'degraded' : 'down',
        lastCheck: new Date(),
      });
    } catch {
      metrics.push({ name: 'Edge Functions', latency: null, status: 'down', lastCheck: new Date() });
    }

    // Test Storage
    try {
      const start = performance.now();
      await supabase.storage.listBuckets();
      const latency = Math.round(performance.now() - start);
      metrics.push({
        name: 'Storage',
        latency,
        status: latency < 200 ? 'healthy' : latency < 500 ? 'degraded' : 'down',
        lastCheck: new Date(),
      });
    } catch {
      metrics.push({ name: 'Storage', latency: null, status: 'down', lastCheck: new Date() });
    }

    setLatencyMetrics(metrics);
    setIsRunningHealthCheck(false);
    toast.success(t("modules.diagnostics.healthCheckDone"));
  };

  // Auto-run health check on mount
  useEffect(() => {
    if (currentWorkspace?.id) {
      runHealthCheck();
    }
  }, [currentWorkspace?.id]);

  const exportDiagnostics = () => {
    const diagnosticData = {
      timestamp: new Date().toISOString(),
      workspace_id: currentWorkspace?.id,
      site_id: currentSite?.id,
      recent_errors: recentErrors,
      failed_runs: failedRuns,
      latency_metrics: latencyMetrics,
      network_status: isOnline ? 'online' : 'offline',
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
    
    toast.success(t("modules.diagnostics.diagnosticsExported"));
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return t("modules.diagnostics.justNow");
    if (diffMins < 60) return t("modules.diagnostics.minutesAgo", { n: diffMins });
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return t("modules.diagnostics.hoursAgo", { n: diffHours });
    return t("modules.diagnostics.daysAgo", { n: Math.floor(diffHours / 24) });
  };

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="w-4 h-4 status-success" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 status-warning" />;
      case 'down': return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Auth Service': return <Server className="w-4 h-4" />;
      case 'Edge Functions': return <Zap className="w-4 h-4" />;
      case 'Storage': return <FileText className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const overallHealth = latencyMetrics.length > 0 
    ? latencyMetrics.every(m => m.status === 'healthy') 
      ? 'healthy' 
      : latencyMetrics.some(m => m.status === 'down') 
        ? 'down' 
        : 'degraded'
    : 'unknown';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bug className="w-6 h-6 text-primary" />
            {t("modules.diagnostics.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("modules.diagnostics.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={runHealthCheck} disabled={isRunningHealthCheck}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRunningHealthCheck ? 'animate-spin' : ''}`} />
            {t("modules.diagnostics.healthCheck")}
          </Button>
          <Button variant="outline" onClick={exportDiagnostics}>
            <Download className="w-4 h-4 mr-2" />
            {t("modules.diagnostics.exportReport")}
          </Button>
        </div>
      </div>

      {/* Network Status Banner */}
      {!isOnline && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-4">
            <WifiOff className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">{t("modules.diagnostics.networkLost")}</p>
              <p className="text-sm text-muted-foreground">{t("modules.diagnostics.networkLostDesc")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health Overview */}
      <Card variant="feature">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                {t("modules.diagnostics.systemHealth")}
              </CardTitle>
              <CardDescription>{t("modules.diagnostics.systemHealthDesc")}</CardDescription>
            </div>
            <Badge 
              variant={overallHealth === 'healthy' ? 'success' : overallHealth === 'degraded' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {overallHealth === 'healthy' ? t("modules.diagnostics.allOperational") : 
               overallHealth === 'degraded' ? t("modules.diagnostics.degraded") : 
               overallHealth === 'down' ? t("modules.diagnostics.servicesDown") : t("modules.diagnostics.checking")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latencyMetrics.map((metric) => (
              <div key={metric.name} className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getServiceIcon(metric.name)}
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  {getStatusIcon(metric.status)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className={`text-lg font-bold ${
                    metric.status === 'healthy' ? 'status-success' : 
                    metric.status === 'degraded' ? 'status-warning' : 'text-destructive'
                  }`}>
                    {metric.latency !== null ? `${metric.latency}ms` : '—'}
                  </span>
                </div>
                <Progress 
                  value={metric.latency ? Math.min(100, (500 - metric.latency) / 5) : 0} 
                  className="h-1 mt-2" 
                />
              </div>
            ))}
            {latencyMetrics.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{t("modules.diagnostics.clickHealthCheck")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GA4 Metrics Widget */}
      <GA4MetricsWidget />

      {/* Main Diagnostics Panel */}
      <DiagnosticsPanel />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Errors */}
        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t("modules.diagnostics.recentErrors")}
            </CardTitle>
            <CardDescription>{t("modules.diagnostics.recentErrorsDesc")}</CardDescription>
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
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 status-success opacity-50" />
                <p className="text-sm">{t("modules.diagnostics.noRecentErrors")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Failed Agent Runs */}
        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              {t("modules.diagnostics.failedAgents")}
            </CardTitle>
            <CardDescription>{t("modules.diagnostics.failedAgentsDesc")}</CardDescription>
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
                        {run.error_message || t("modules.diagnostics.unknownError")}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="text-xs">
                        {t("modules.diagnostics.failure")}
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
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 status-success opacity-50" />
                <p className="text-sm">{t("modules.diagnostics.noFailedAgents")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Latency History Chart */}
      <LatencyHistoryChart />

      {/* Console Logs Viewer */}
      <ConsoleLogsViewer />

      {/* System Info */}
      <Card variant="feature">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t("modules.diagnostics.systemInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">{t("modules.diagnostics.appVersion")}</p>
              <p className="text-sm font-medium">1.0.0</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">{t("modules.diagnostics.build")}</p>
              <p className="text-sm font-medium">{import.meta.env.DEV ? "Development" : "Production"}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">React</p>
              <p className="text-sm font-medium">18.3.1</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">Backend</p>
              <p className="text-sm font-medium">Lovable Cloud</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-2">
                {isOnline ? <Wifi className="w-4 h-4 status-success" /> : <WifiOff className="w-4 h-4 text-destructive" />}
                <div>
                  <p className="text-xs text-muted-foreground">{t("modules.diagnostics.network")}</p>
                  <p className="text-sm font-medium">{isOnline ? t("modules.diagnostics.online") : t("modules.diagnostics.offline")}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}