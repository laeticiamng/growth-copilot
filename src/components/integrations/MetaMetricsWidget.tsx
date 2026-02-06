/**
 * Meta Metrics Widget
 * Displays Instagram/Meta Business metrics from synced data
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Instagram, 
  Users, 
  Heart, 
  Eye, 
  RefreshCw, 
  Loader2,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { toast } from "sonner";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts";

interface MetaMetricsWidgetProps {
  className?: string;
}

interface MetaData {
  date: string;
  followers: number | null;
  reach: number | null;
  engagement_rate: number | null;
  metrics_json: Record<string, unknown> | null;
}

export function MetaMetricsWidget({ className }: MetaMetricsWidgetProps) {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [metaData, setMetaData] = useState<MetaData[]>([]);
  const [topPosts, setTopPosts] = useState<Array<{ id: string; type: string; engagement: number }>>([]);
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
      .in("provider", ["meta", "instagram"])
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
        .eq("source", "instagram")
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (currentSite?.id) {
        query.eq("site_id", currentSite.id);
      } else {
        query.eq("workspace_id", currentWorkspace.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Parse metrics_json into structured data
      const parsed: MetaData[] = (data || []).map(d => {
        const mj = d.metrics_json as Record<string, unknown> | null;
        return {
          date: d.date,
          followers: typeof mj?.followers === 'number' ? mj.followers : null,
          reach: typeof mj?.reach === 'number' ? mj.reach : null,
          engagement_rate: typeof mj?.engagement_rate === 'number' ? mj.engagement_rate : null,
          metrics_json: mj,
        };
      });
      
      setMetaData(parsed);

      // Extract top posts from the most recent day
      if (data && data.length > 0) {
        const lastDay = data[data.length - 1];
        const metricsJson = lastDay.metrics_json as Record<string, unknown> | null;
        if (metricsJson?.top_posts && Array.isArray(metricsJson.top_posts)) {
          setTopPosts(metricsJson.top_posts.slice(0, 3) as Array<{ id: string; type: string; engagement: number }>);
        }
      }
    } catch (err) {
      console.error("Error loading Meta metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!currentWorkspace?.id || !currentSite?.id) {
      toast.error(t("components.ga4Widget.selectSite"));
      return;
    }

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("meta-ig-sync", {
        body: {
          workspace_id: currentWorkspace.id,
          site_id: currentSite.id,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(t("components.metaWidget.igSynced"));
        await loadMetrics();
        await checkConnection();
      } else {
        toast.error(data?.error || t("components.metaWidget.syncError"));
      }
    } catch (err) {
      console.error("Sync error:", err);
      toast.error(t("components.metaWidget.syncErrorMeta"));
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
          provider: "meta_instagram",
          redirect_url: redirectUrl,
        },
      });

      if (error) throw error;
      
      if (data?.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (err) {
      console.error("OAuth init error:", err);
      toast.error(t("components.connectors.oauthInitError"));
    }
  };

  // Calculate summary metrics
  const latestData = metaData.length > 0 ? metaData[metaData.length - 1] : null;
  const totalReach = metaData.reduce((sum, d) => sum + (d.reach || 0), 0);
  const avgEngagement = metaData.length > 0 
    ? metaData.reduce((sum, d) => sum + (d.engagement_rate || 0), 0) / metaData.length 
    : 0;

  // Chart data
  const chartData = metaData.slice(-14).map(d => ({
    date: new Date(d.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
    reach: d.reach || 0,
    engagement: (d.engagement_rate || 0) * 100,
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
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-chart-4/10 to-chart-5/10">
              <Instagram className="w-4 h-4 text-chart-5" />
            </div>
            Instagram / Meta Business
          </CardTitle>
          <CardDescription>{t("components.metaWidget.connectDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Instagram className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mb-4">{t("components.metaWidget.connectPrompt")}</p>
          <Button variant="hero" onClick={handleConnect}>
            <ExternalLink className="w-4 h-4 mr-2" />
            {t("components.metaWidget.connectButton")}
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
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-chart-4/10 to-chart-5/10">
                <Instagram className="w-4 h-4 text-chart-5" />
              </div>
              Instagram
            </CardTitle>
            <CardDescription>
              {t("components.ga4Widget.lastSync")}: {lastSync ? new Date(lastSync).toLocaleDateString() : "—"}
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
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-1 mb-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Followers</span>
            </div>
            <p className="text-lg font-bold">
              {latestData?.followers?.toLocaleString() || "—"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-1 mb-1">
              <Eye className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Reach (30j)</span>
            </div>
            <p className="text-lg font-bold">{totalReach.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-1 mb-1">
              <Heart className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Engagement</span>
            </div>
            <p className="text-lg font-bold">{avgEngagement.toFixed(2)}%</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0}/>
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
                  dataKey="reach" 
                  stroke="hsl(var(--chart-5))" 
                  fillOpacity={1}
                  fill="url(#colorReach)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Instagram className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("components.ga4Widget.noData")}</p>
          </div>
        )}

        {/* Top Posts */}
        {topPosts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("components.metaWidget.topPosts")}</p>
            <div className="flex gap-2">
              {topPosts.map((p, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {p.type} • {p.engagement} engagements
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
