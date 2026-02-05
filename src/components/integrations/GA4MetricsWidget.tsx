/**
 * GA4 Metrics Widget
 * Displays Google Analytics 4 metrics from synced data
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  Users, 
  Eye, 
  TrendingUp, 
  RefreshCw, 
  Loader2,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { toast } from "sonner";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface GA4MetricsWidgetProps {
  className?: string;
}

interface KPIData {
  date: string;
  organic_sessions: number | null;
  total_conversions: number | null;
  revenue: number | null;
  metrics_json: Record<string, unknown> | null;
}

export function GA4MetricsWidget({ className }: GA4MetricsWidgetProps) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
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
      .in("provider", ["google_analytics", "google_combined"])
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
        .select("date, organic_sessions, total_conversions, revenue, metrics_json")
        .eq("source", "ga4")
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (currentSite?.id) {
        query.eq("site_id", currentSite.id);
      } else {
        query.eq("workspace_id", currentWorkspace.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setKpiData((data as KPIData[]) || []);
    } catch (err) {
      console.error("Error loading GA4 metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!currentWorkspace?.id || !currentSite?.id) {
      toast.error("Veuillez sélectionner un site");
      return;
    }

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-ga4", {
        body: {
          workspace_id: currentWorkspace.id,
          site_id: currentSite.id,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`${data.rows_synced} jours de données synchronisés`);
        await loadMetrics();
        await checkConnection();
      } else {
        toast.error(data?.error || "Erreur lors de la synchronisation");
      }
    } catch (err) {
      console.error("Sync error:", err);
      toast.error("Erreur lors de la synchronisation GA4");
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
      toast.error("Erreur lors de l'initialisation OAuth");
    }
  };

  // Calculate summary metrics
  const totalSessions = kpiData.reduce((sum, d) => sum + (d.organic_sessions || 0), 0);
  const totalConversions = kpiData.reduce((sum, d) => sum + (d.total_conversions || 0), 0);
  const totalRevenue = kpiData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  
  // Calculate trend (compare last 7 days to previous 7 days)
  const last7Days = kpiData.slice(-7);
  const prev7Days = kpiData.slice(-14, -7);
  const last7Sessions = last7Days.reduce((s, d) => s + (d.organic_sessions || 0), 0);
  const prev7Sessions = prev7Days.reduce((s, d) => s + (d.organic_sessions || 0), 0);
  const sessionsTrend = prev7Sessions > 0 ? ((last7Sessions - prev7Sessions) / prev7Sessions) * 100 : 0;

  // Chart data
  const chartData = kpiData.map(d => ({
    date: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    sessions: d.organic_sessions || 0,
    conversions: d.total_conversions || 0,
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
            <BarChart3 className="w-5 h-5 text-primary" />
            Google Analytics 4
          </CardTitle>
          <CardDescription>
            Connectez Google Analytics pour voir vos métriques
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mb-4">
            Connectez votre compte Google pour synchroniser vos données Analytics
          </p>
          <Button variant="hero" onClick={handleConnect}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Connecter Google Analytics
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
              <BarChart3 className="w-5 h-5 text-primary" />
              Google Analytics 4
            </CardTitle>
            <CardDescription>
              Dernière sync: {lastSync ? new Date(lastSync).toLocaleDateString("fr-FR") : "Jamais"}
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
        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sessions</span>
            </div>
            <p className="text-xl font-bold">{totalSessions.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              {sessionsTrend >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-chart-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-destructive" />
              )}
              <span className={`text-xs ${sessionsTrend >= 0 ? "text-chart-3" : "text-destructive"}`}>
                {Math.abs(sessionsTrend).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Conversions</span>
            </div>
            <p className="text-xl font-bold">{totalConversions.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Revenu</span>
            </div>
            <p className="text-xl font-bold">{totalRevenue.toFixed(0)}€</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1}
                  fill="url(#colorSessions)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aucune donnée disponible</p>
            <p className="text-xs mt-1">Cliquez sur sync pour récupérer les données</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
