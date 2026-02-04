import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
} from "lucide-react";

interface KPIData {
  label: string;
  currentValue: number;
  previousValue: number;
  format?: "number" | "currency" | "percent";
}

interface MoMComparisonProps {
  kpis: KPIData[];
  onPeriodChange?: (period: string) => void;
}

type ComparisonPeriod = "mom" | "yoy" | "wow" | "custom";

const periodLabels: Record<ComparisonPeriod, string> = {
  mom: "Mois précédent (MoM)",
  yoy: "Année précédente (YoY)",
  wow: "Semaine précédente (WoW)",
  custom: "Personnalisé",
};

export function MoMComparison({ kpis, onPeriodChange }: MoMComparisonProps) {
  const [period, setPeriod] = useState<ComparisonPeriod>("mom");

  const handlePeriodChange = (value: ComparisonPeriod) => {
    setPeriod(value);
    onPeriodChange?.(value);
  };

  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
        }).format(value);
      case "percent":
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('fr-FR').format(value);
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const kpiWithChanges = useMemo(() => {
    return kpis.map(kpi => ({
      ...kpi,
      change: calculateChange(kpi.currentValue, kpi.previousValue),
      formattedCurrent: formatValue(kpi.currentValue, kpi.format),
      formattedPrevious: formatValue(kpi.previousValue, kpi.format),
    }));
  }, [kpis]);

  // Summary stats
  const summary = useMemo(() => {
    const changes = kpiWithChanges.map(k => k.change);
    const positive = changes.filter(c => c > 0).length;
    const negative = changes.filter(c => c < 0).length;
    const neutral = changes.filter(c => c === 0).length;
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    
    return { positive, negative, neutral, avgChange };
  }, [kpiWithChanges]);

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Comparaison de Périodes
            </CardTitle>
            <CardDescription>
              Évolution de vos KPIs clés
            </CardDescription>
          </div>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[200px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(periodLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2">
            <Badge variant="success" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {summary.positive}
            </Badge>
            <span className="text-sm text-muted-foreground">en hausse</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              {summary.negative}
            </Badge>
            <span className="text-sm text-muted-foreground">en baisse</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Minus className="w-3 h-3" />
              {summary.neutral}
            </Badge>
            <span className="text-sm text-muted-foreground">stables</span>
          </div>
          <div className="ml-auto">
            <span className="text-sm text-muted-foreground">Moyenne: </span>
            <span className={`font-medium ${summary.avgChange > 0 ? 'status-success' : summary.avgChange < 0 ? 'text-destructive' : ''}`}>
              {summary.avgChange > 0 ? '+' : ''}{summary.avgChange.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiWithChanges.map((kpi, i) => (
            <div key={i} className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <Badge
                  variant={kpi.change > 0 ? "success" : kpi.change < 0 ? "destructive" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {kpi.change > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : kpi.change < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{kpi.formattedCurrent}</p>
                <p className="text-sm text-muted-foreground">
                  vs {kpi.formattedPrevious}
                </p>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    kpi.change > 0 ? 'bg-green-500' : kpi.change < 0 ? 'bg-red-500' : 'bg-muted-foreground'
                  }`}
                  style={{
                    width: `${Math.min(Math.abs(kpi.change) * 2, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
