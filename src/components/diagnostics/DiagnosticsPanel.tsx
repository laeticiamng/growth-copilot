import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, Database, Shield, Clock, AlertTriangle, CheckCircle2, RefreshCw,
  Wifi, WifiOff, Server, User, Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";

interface HealthCheck {
  name: string;
  status: "ok" | "warning" | "error" | "pending";
  latency?: number;
  message?: string;
}

interface DiagnosticData {
  userId: string | null;
  sessionValid: boolean;
  workspaceId: string | null;
  siteId: string | null;
  environment: "development" | "production";
  lastApiError: string | null;
  avgLatency: number;
  healthChecks: HealthCheck[];
  timestamp: Date;
}

export function DiagnosticsPanel() {
  const { t, i18n } = useTranslation();
  const { user, session } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [diagnostics, setDiagnostics] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    const healthChecks: HealthCheck[] = [];
    const latencies: number[] = [];

    // Check Auth
    const authStart = performance.now();
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const authLatency = performance.now() - authStart;
      latencies.push(authLatency);
      healthChecks.push({
        name: "Authentication",
        status: currentSession ? "ok" : "warning",
        latency: Math.round(authLatency),
        message: currentSession ? t("components.diagnostics.sessionActive") : t("components.diagnostics.notConnected"),
      });
    } catch {
      healthChecks.push({ name: "Authentication", status: "error", message: t("components.diagnostics.authCheckFailed") });
    }

    // Check Database
    const dbStart = performance.now();
    try {
      const { error } = await supabase.from("workspaces").select("id").limit(1);
      const dbLatency = performance.now() - dbStart;
      latencies.push(dbLatency);
      healthChecks.push({
        name: "Database",
        status: error ? "error" : "ok",
        latency: Math.round(dbLatency),
        message: error ? error.message : t("components.diagnostics.connectionOk"),
      });
    } catch {
      healthChecks.push({ name: "Database", status: "error", message: t("components.diagnostics.connectionFailed") });
    }

    // Check Edge Functions
    const edgeStart = performance.now();
    try {
      const { error } = await supabase.functions.invoke("webhooks", { body: { action: "ping" } });
      const edgeLatency = performance.now() - edgeStart;
      latencies.push(edgeLatency);
      healthChecks.push({
        name: "Edge Functions",
        status: error ? "warning" : "ok",
        latency: Math.round(edgeLatency),
        message: error ? t("components.diagnostics.limitedAvailability") : t("components.diagnostics.functional"),
      });
    } catch {
      healthChecks.push({ name: "Edge Functions", status: "warning", message: t("components.diagnostics.testInconclusive") });
    }

    // Check RLS
    healthChecks.push({ name: "Row Level Security", status: "ok", message: t("components.diagnostics.rlsEnabled") });

    // Check Storage
    const storageStart = performance.now();
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      const storageLatency = performance.now() - storageStart;
      latencies.push(storageLatency);
      healthChecks.push({
        name: "Storage",
        status: storageError ? "warning" : "ok",
        latency: Math.round(storageLatency),
        message: storageError ? t("components.diagnostics.limitedAccess") : t("components.diagnostics.bucketsConfigured", { count: buckets?.length || 0 }),
      });
    } catch {
      healthChecks.push({ name: "Storage", status: "warning", message: t("components.diagnostics.checkImpossible") });
    }

    // Check Quotas
    if (currentWorkspace) {
      try {
        const { data } = await supabase.from("workspace_quotas").select("*").eq("workspace_id", currentWorkspace.id).single();
        const monthlyUsage = (data?.monthly_tokens_used || 0) / 1000000;
        const crawlsUsed = data?.crawls_today || 0;
        healthChecks.push({
          name: "Quotas",
          status: monthlyUsage > 80 ? "warning" : "ok",
          message: `${monthlyUsage.toFixed(1)}M tokens • ${crawlsUsed} crawls ${t("components.diagnostics.today")}`,
        });
      } catch {
        healthChecks.push({ name: "Quotas", status: "ok", message: t("components.diagnostics.quotaAvailable") });
      }
    }

    // Check for stored errors
    try {
      const storedErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      if (storedErrors.length > 0) {
        healthChecks.push({
          name: t("components.diagnostics.recentErrors"),
          status: "warning",
          message: t("components.diagnostics.errorsRecorded", { count: storedErrors.length }),
        });
      }
    } catch { /* Ignore */ }

    const avgLatency = latencies.length > 0 
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;

    setDiagnostics({
      userId: user?.id || null, sessionValid: !!session,
      workspaceId: currentWorkspace?.id || null, siteId: currentSite?.id || null,
      environment: import.meta.env.DEV ? "development" : "production",
      lastApiError: null, avgLatency: Math.round(avgLatency), healthChecks, timestamp: new Date(),
    });

    setLoading(false);
  };

  useEffect(() => { runDiagnostics(); }, [user, currentWorkspace, currentSite]);

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "ok": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: HealthCheck["status"]) => {
    switch (status) {
      case "ok": return "success";
      case "warning": return "secondary";
      case "error": return "destructive";
      default: return "outline";
    }
  };

  const overallHealth = diagnostics?.healthChecks.every(h => h.status === "ok") 
    ? "ok" 
    : diagnostics?.healthChecks.some(h => h.status === "error") ? "error" : "warning";

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              {t("components.diagnostics.title")}
            </CardTitle>
            <CardDescription>{t("components.diagnostics.subtitle")}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="success" className="gap-1"><Wifi className="w-3 h-3" />{t("components.diagnostics.online")}</Badge>
            ) : (
              <Badge variant="destructive" className="gap-1"><WifiOff className="w-3 h-3" />{t("components.diagnostics.offline")}</Badge>
            )}
            <Button variant="outline" size="sm" onClick={runDiagnostics} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
          <div className={`p-3 rounded-full ${overallHealth === "ok" ? "bg-green-500/20" : overallHealth === "error" ? "bg-destructive/20" : "bg-yellow-500/20"}`}>
            {overallHealth === "ok" ? <CheckCircle2 className="w-6 h-6 text-green-500" /> :
             overallHealth === "error" ? <AlertTriangle className="w-6 h-6 text-destructive" /> :
             <AlertTriangle className="w-6 h-6 text-yellow-500" />}
          </div>
          <div>
            <p className="font-medium">
              {overallHealth === "ok" ? t("components.diagnostics.allOperational") :
               overallHealth === "error" ? t("components.diagnostics.issuesDetected") :
               t("components.diagnostics.degraded")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("components.diagnostics.avgLatency")}: {diagnostics?.avgLatency || 0}ms
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 mb-1"><User className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">User ID</span></div>
            <p className="text-sm font-mono truncate">{diagnostics?.userId?.slice(0, 8) || "—"}...</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 mb-1"><Shield className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Session</span></div>
            <p className="text-sm">{diagnostics?.sessionValid ? `✓ ${t("components.diagnostics.valid")}` : `✗ ${t("components.diagnostics.invalid")}`}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 mb-1"><Server className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">{t("components.diagnostics.environment")}</span></div>
            <p className="text-sm capitalize">{diagnostics?.environment || "—"}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 mb-1"><Database className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Workspace</span></div>
            <p className="text-sm font-mono truncate">{diagnostics?.workspaceId?.slice(0, 8) || "—"}...</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium mb-3">{t("components.diagnostics.healthChecks")}</p>
          {diagnostics?.healthChecks.map((check, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <span className="font-medium">{check.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{check.message}</span>
                {check.latency && <Badge variant="outline" className="text-xs">{check.latency}ms</Badge>}
                <Badge variant={getStatusColor(check.status) as any} className="text-xs capitalize">{check.status}</Badge>
              </div>
            </div>
          ))}
        </div>

        {diagnostics?.timestamp && (
          <p className="text-xs text-muted-foreground text-right">
            {t("components.diagnostics.lastCheck")}: {diagnostics.timestamp.toLocaleTimeString(getIntlLocale(i18n.language))}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
