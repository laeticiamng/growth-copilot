import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSites } from "@/hooks/useSites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Minus, Brain, Calendar, Target, MousePointerClick, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { forecastKPI, formatForecastValue, type ForecastResult } from "@/lib/forecasting";

interface MetricConfig {
  key: string;
  label: string;
  column: string;
  icon: React.ElementType;
  color: string;
  invertTrend?: boolean; // e.g. avg_position: lower = better
}

export function PredictiveAnalytics() {
  const { t, i18n } = useTranslation();
  const { currentSite } = useSites();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const [horizon, setHorizon] = useState<"30" | "60" | "90">("30");

  const metrics: MetricConfig[] = [
    {
      key: "organic_clicks",
      label: lang === "fr" ? "Clics Organiques" : "Organic Clicks",
      column: "organic_clicks",
      icon: MousePointerClick,
      color: "hsl(var(--primary))",
    },
    {
      key: "total_conversions",
      label: lang === "fr" ? "Conversions" : "Conversions",
      column: "total_conversions",
      icon: Target,
      color: "hsl(var(--accent))",
    },
    {
      key: "avg_position",
      label: lang === "fr" ? "Position Moyenne" : "Avg Position",
      column: "avg_position",
      icon: TrendingUp,
      color: "hsl(142 76% 45%)",
      invertTrend: true,
    },
  ];

  // Fetch 180 days of historical data for forecasting
  const { data: historicalData, isLoading } = useQuery({
    queryKey: ["kpi-forecast-history", currentSite?.id],
    queryFn: async () => {
      if (!currentSite?.id) return null;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 180);

      const { data, error } = await supabase
        .from("kpis_daily")
        .select("date, organic_clicks, total_conversions, avg_position")
        .eq("site_id", currentSite.id)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!currentSite?.id,
    staleTime: 30 * 60 * 1000, // 30 min cache
  });

  // Compute forecasts for each metric
  const forecasts = useMemo(() => {
    if (!historicalData || historicalData.length < 7) return null;

    const results: Record<string, ForecastResult | null> = {};
    for (const metric of metrics) {
      const points = historicalData
        .filter((row) => row[metric.column as keyof typeof row] != null)
        .map((row) => ({
          date: row.date,
          value: Number(row[metric.column as keyof typeof row]) || 0,
        }));
      results[metric.key] = forecastKPI(points, 90);
    }
    return results;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historicalData]);

  const TrendIcon = ({ trend, invert }: { trend: "up" | "down" | "stable"; invert?: boolean }) => {
    const effective = invert ? (trend === "up" ? "down" : trend === "down" ? "up" : "stable") : trend;
    if (effective === "up") return <TrendingUp className="h-4 w-4 text-chart-3" />;
    if (effective === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const horizonDays = Number(horizon);

  // Build chart data for a metric
  const buildChartData = (result: ForecastResult) => {
    const historicalPoints = result.historical.slice(-60).map((d) => ({
      date: d.date,
      actual: d.value,
      predicted: null as number | null,
      lower: null as number | null,
      upper: null as number | null,
    }));

    const forecastPoints = result.forecast.slice(0, horizonDays).map((d) => ({
      date: d.date,
      actual: null as number | null,
      predicted: d.predicted,
      lower: d.lower,
      upper: d.upper,
    }));

    // Bridge: last historical point also gets a predicted value
    if (historicalPoints.length > 0 && forecastPoints.length > 0) {
      const last = historicalPoints[historicalPoints.length - 1];
      last.predicted = last.actual;
      last.lower = last.actual;
      last.upper = last.actual;
    }

    return [...historicalPoints, ...forecastPoints];
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" });
  };

  if (!currentSite) {
    return null;
  }

  const noData = !historicalData || historicalData.length < 7;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Brain className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {lang === "fr" ? "Prédictions IA" : "AI Predictions"}
              </CardTitle>
              <CardDescription>
                {lang === "fr"
                  ? "Forecasting basé sur vos données historiques"
                  : "Forecasting based on your historical data"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Tabs value={horizon} onValueChange={(v) => setHorizon(v as "30" | "60" | "90")}>
              <TabsList className="h-8">
                <TabsTrigger value="30" className="text-xs px-2.5 h-6">30j</TabsTrigger>
                <TabsTrigger value="60" className="text-xs px-2.5 h-6">60j</TabsTrigger>
                <TabsTrigger value="90" className="text-xs px-2.5 h-6">90j</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            {lang === "fr" ? "Chargement des prédictions..." : "Loading predictions..."}
          </div>
        )}

        {!isLoading && noData && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Brain className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {lang === "fr"
                ? "Pas assez de données historiques (minimum 7 jours). Connectez vos sources de données pour activer le forecasting."
                : "Not enough historical data (minimum 7 days). Connect your data sources to enable forecasting."}
            </p>
          </div>
        )}

        {!isLoading && forecasts && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {metrics.map((metric) => {
                const result = forecasts[metric.key];
                if (!result) return null;
                const Icon = metric.icon;
                const predictedTotal =
                  horizonDays === 30
                    ? result.predictedTotal30d
                    : horizonDays === 60
                    ? result.predictedTotal60d
                    : result.predictedTotal90d;

                const isGood = metric.invertTrend
                  ? result.trend === "down"
                  : result.trend === "up";

                return (
                  <div
                    key={metric.key}
                    className="rounded-xl border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                      </div>
                      <TrendIcon trend={result.trend} invert={metric.invertTrend} />
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold tabular-nums">
                        {formatForecastValue(predictedTotal, metric.key)}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] mb-1 ${isGood ? "text-chart-3 border-chart-3/30" : result.trend === "stable" ? "text-muted-foreground" : "text-destructive border-destructive/30"}`}
                      >
                        {isGood ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : result.trend !== "stable" ? <ArrowDownRight className="h-3 w-3 mr-0.5" /> : null}
                        {result.dailyChange > 0 ? "+" : ""}
                        {result.dailyChange}/j
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>R² = {result.r2}</span>
                      <span>•</span>
                      <span>{lang === "fr" ? `Prévu sur ${horizonDays}j` : `${horizonDays}d forecast`}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts */}
            {metrics.map((metric) => {
              const result = forecasts[metric.key];
              if (!result) return null;
              const chartData = buildChartData(result);
              const todayStr = new Date().toISOString().split("T")[0];

              return (
                <div key={metric.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {lang === "fr" ? "Historique + Prévision" : "Historical + Forecast"}
                    </Badge>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metric.color} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id={`gradient-forecast-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metric.color} stopOpacity={0.1} />
                            <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          interval="preserveStartEnd"
                          minTickGap={40}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          width={45}
                          tickFormatter={(v) => formatForecastValue(v, metric.key)}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "hsl(var(--popover-foreground))",
                          }}
                          labelFormatter={formatDate}
                          formatter={(value: number, name: string) => [
                            formatForecastValue(value, metric.key),
                            name === "actual"
                              ? lang === "fr" ? "Réel" : "Actual"
                              : name === "predicted"
                              ? lang === "fr" ? "Prédit" : "Predicted"
                              : name === "upper"
                              ? lang === "fr" ? "Max" : "Upper"
                              : lang === "fr" ? "Min" : "Lower",
                          ]}
                        />
                        <ReferenceLine
                          x={todayStr}
                          stroke="hsl(var(--muted-foreground))"
                          strokeDasharray="4 4"
                          opacity={0.5}
                          label={{
                            value: lang === "fr" ? "Aujourd'hui" : "Today",
                            position: "top",
                            fontSize: 10,
                            fill: "hsl(var(--muted-foreground))",
                          }}
                        />
                        {/* Confidence interval band */}
                        <Area
                          type="monotone"
                          dataKey="upper"
                          stroke="none"
                          fill={`url(#gradient-forecast-${metric.key})`}
                          fillOpacity={1}
                          connectNulls={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="lower"
                          stroke="none"
                          fill="hsl(var(--background))"
                          fillOpacity={1}
                          connectNulls={false}
                        />
                        {/* Historical */}
                        <Area
                          type="monotone"
                          dataKey="actual"
                          stroke={metric.color}
                          strokeWidth={2}
                          fill={`url(#gradient-${metric.key})`}
                          connectNulls={false}
                        />
                        {/* Forecast line */}
                        <Area
                          type="monotone"
                          dataKey="predicted"
                          stroke={metric.color}
                          strokeWidth={2}
                          strokeDasharray="6 3"
                          fill="none"
                          connectNulls={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}

            {/* Methodology note */}
            <p className="text-[10px] text-muted-foreground/60 text-center">
              {lang === "fr"
                ? "Prédictions basées sur régression linéaire avec lissage 7 jours. Intervalle de confiance à 80%. Plus de données = prédictions plus fiables."
                : "Predictions based on linear regression with 7-day smoothing. 80% confidence interval. More data = more reliable predictions."}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default PredictiveAnalytics;
