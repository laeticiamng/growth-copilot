/**
 * GSC Metrics Widget
 * Displays Google Search Console metrics from synced data
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  MousePointer, 
  TrendingUp, 
  RefreshCw, 
  Loader2,
  ExternalLink,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts";

interface GSCMetricsWidgetProps {
  className?: string;
}

interface KPIData {
  date: string;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  avg_position: number | null;
  metrics_json: Record<string, unknown> | null;
}

export function GSCMetricsWidget({ className }: GSCMetricsWidgetProps) {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [topQueries, setTopQueries] = useState<Array<{ query: string; clicks: number; impressions: number }>>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    if (currentWorkspace?.id) {
      checkConnection();
      loadMetrics();
    }
  }, [currentWorkspace?.id, currentSite?.id]);

  const checkConnection = async () => {
    if (!currentWorkspace?.id) return;
    
    const { data } = await supabase
      .from("integrations")
      .select("id, last_sync_at")
      .eq("workspace_id", currentWorkspace.id)
      .in("provider", ["google_search_console", "google_combined"])
      .eq("status", "active")
      .limit(1);
    
    if (data && data.length > 0) {
      setConnected(true);
      setLastSync(data[0].last_sync_at);
    }
  };

  const loadMetrics = async () => {
    if (!currentWorkspace?.id) {
      setLoading(false);
      return;
    }

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const query = supabase
        .from("kpis_daily")
        .select("date, metrics_json")
        .eq("source", "gsc")
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (currentSite?.id) {
        query.eq("site_id", currentSite.id);
      } else {
        query.eq("workspace_id", currentWorkspace.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      const parsed: KPIData[] = (data || []).map(d => {
        const mj = d.metrics_json as Record<string, unknown> | null;
        return {
          date: d.date,
          impressions: typeof mj?.impressions === 'number' ? mj.impressions : null,
          clicks: typeof mj?.clicks === 'number' ? mj.clicks : null,
          ctr: typeof mj?.ctr === 'number' ? mj.ctr : null,
          avg_position: typeof mj?.avg_position === 'number' ? mj.avg_position : null,
          metrics_json: mj,
        };
      });
      
      setKpiData(parsed);

      if (data && data.length > 0) {
        const lastDay = data[data.length - 1];
        const metricsJson = lastDay.metrics_json as Record<string, unknown> | null;
        if (metricsJson?.top_queries && Array.isArray(metricsJson.top_queries)) {
          setTopQueries(metricsJson.top_queries.slice(0, 5) as Array<{ query: string; clicks: number; impressions: number }>);
        }
      }
    } catch (err) {
      console.error("Error loading GSC metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!currentWorkspace?.id || !currentSite?.id) {
      toast.error(t("components.gscWidget.selectSite"));
      return;
    }

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-gsc", {
        body: {
          workspace_id: currentWorkspace.id,
          site_id: currentSite.id,
          site_url: currentSite.url,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(t("components.gscWidget.daysSynced", { count: data.rows_synced || 0 }));
        await loadMetrics();
        await checkConnection();
      } else {
        toast.error(data?.error || t("components.gscWidget.syncError"));
      }
    } catch (err) {
      console.error("Sync error:", err);
      toast.error(t("components.gscWidget.syncError"));
    } finally {
      setSyncing(false);
    }
  };

  const handleConnect = async () => {
    if (!currentWorkspace?.id) return;

    try {
      const redirectUrl = `${window.location.origin}/dashboard/integrations`;
      
      const { data, error } = await supabase.functions.invoke("oauth-init", {
        body: {
          workspace_id: currentWorkspace.id,
          provider: "google_combined",
          redirect_url: redirectUrl,
        },
      });

      if (error) throw error;
      
      if (data?.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (err) {
      console.error("OAuth init error:", err);
      toast.error(t("components.gscWidget.oauthError"));
    }
  };

  const totalImpressions = kpiData.reduce((sum, d) => sum + (d.impressions || 0), 0);
  const totalClicks = kpiData.reduce((sum, d) => sum + (d.clicks || 0), 0);
  const avgCTR = kpiData.length > 0 
    ? kpiData.reduce((sum, d) => sum + (d.ctr || 0), 0) / kpiData.length 
    : 0;
  const avgPosition = kpiData.length > 0 
    ? kpiData.reduce((sum, d) => sum + (d.avg_position || 0), 0) / kpiData.length 
    : 0;

  const chartData = kpiData.slice(-14).map(d => ({
    date: new Date(d.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
    clicks: d.clicks || 0,
    impressions: d.impressions || 0,
  }));

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-40" />
        </CardContent>
      </Card>
    );
  }

  if (!connected) {
    return (
      <Card variant="feature" className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Google Search Console
          </CardTitle>
          <CardDescription>
            {t("components.gscWidget.connectDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mb-4">
            {t("components.gscWidget.connectPrompt")}
          </p>
          <Button variant="hero" onClick={handleConnect}>
            <ExternalLink className="w-4 h-4 mr-2" />
            {t("components.gscWidget.connectBtn")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="feature" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Google Search Console
            </CardTitle>
            <CardDescription>
              {t("components.gscWidget.lastSync")}: {lastSync ? new Date(lastSync).toLocaleDateString() : "—"}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-1 mb-1">
              <Eye className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Impressions</span>
            </div>
            <p className="text-lg font-bold">{totalImpressions.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-1 mb-1">
              <MousePointer className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("components.gscWidget.clicks")}</span>
            </div>
            <p className="text-lg font-bold">{totalClicks.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">CTR</span>
            </div>
            <p className="text-lg font-bold">{avgCTR.toFixed(1)}%</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-1 mb-1">
              <Search className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Position</span>
            </div>
            <p className="text-lg font-bold">{avgPosition.toFixed(1)}</p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("common.noData")}</p>
          </div>
        )}

        {topQueries.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("components.gscWidget.topQueries")}</p>
            <div className="space-y-1">
              {topQueries.map((q, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-secondary/30">
                  <span className="truncate flex-1">{q.query}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{q.clicks} {t("components.gscWidget.clicks")}</span>
                    <span>{q.impressions} imp.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
