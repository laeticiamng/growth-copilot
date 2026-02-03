import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useKPIAggregates } from "@/hooks/useKPIAggregates";
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign,
  MousePointer,
  ShoppingCart,
  Activity,
  Clock,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  const colorClass = value > 0 
    ? "text-green-600 bg-green-100" 
    : value < 0 
      ? "text-red-600 bg-red-100" 
      : "text-muted-foreground bg-muted";

  return (
    <Badge variant="outline" className={`${colorClass} border-0 text-xs`}>
      <Icon className="w-3 h-3 mr-1" />
      {value > 0 ? "+" : ""}{value}%
    </Badge>
  );
}

export function KPIDashboard() {
  const { 
    aggregates, 
    syncJobs, 
    loading, 
    summary, 
    triggerSync, 
    isSyncing,
    updateSyncJob 
  } = useKPIAggregates({ days: 7 });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with sync controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Tableau de bord ROI</h2>
          <p className="text-sm text-muted-foreground">
            Dernière sync: {summary.lastSync 
              ? format(new Date(summary.lastSync), "dd MMM HH:mm", { locale: fr })
              : "Jamais"}
          </p>
        </div>
        <Button onClick={() => triggerSync("all")} disabled={isSyncing} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
          Synchroniser
        </Button>
      </div>

      {/* Health Score */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Score de Santé Global</p>
              <p className="text-4xl font-bold">{summary.health}%</p>
            </div>
            <div className="w-24">
              <Progress value={summary.health} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* SEO */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-blue-500" />
              SEO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{summary.seo.sessions.toLocaleString()}</span>
                <TrendBadge value={summary.seo.change} />
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.seo.clicks.toLocaleString()} clics
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ads */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Ads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{summary.ads.conversions}</span>
                <TrendBadge value={summary.ads.change} />
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.ads.spend.toFixed(0)}€ dépensés • ROAS {summary.ads.roas.toFixed(1)}x
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sales */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-purple-500" />
              Ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{summary.sales.revenue.toFixed(0)}€</span>
                <TrendBadge value={summary.sales.change} />
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.sales.orders} commandes • AOV {summary.sales.aov.toFixed(0)}€
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              ROI Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {summary.ads.spend > 0 
                    ? ((summary.sales.revenue - summary.ads.spend) / summary.ads.spend * 100).toFixed(0)
                    : "∞"}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Profit: {(summary.sales.revenue - summary.ads.spend).toFixed(0)}€
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Jobs Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Synchronisation automatique</CardTitle>
          <CardDescription>Configurez la collecte automatique des données</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["seo", "ads", "sales"].map((jobType) => {
              const job = syncJobs.find(j => j.job_type === jobType);
              return (
                <div key={jobType} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {jobType === "seo" && <MousePointer className="w-4 h-4" />}
                      {jobType === "ads" && <DollarSign className="w-4 h-4" />}
                      {jobType === "sales" && <ShoppingCart className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">{jobType}</p>
                      <p className="text-xs text-muted-foreground">
                        {job?.last_run_at 
                          ? `Dernière sync: ${format(new Date(job.last_run_at), "dd/MM HH:mm", { locale: fr })}`
                          : "Jamais synchronisé"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {job?.last_run_status === "success" && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    <Switch 
                      checked={job?.enabled ?? false}
                      onCheckedChange={(enabled) => updateSyncJob({ jobType, enabled })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
