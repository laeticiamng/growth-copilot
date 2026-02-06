import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";
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
  Link as LinkIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

export interface KPIData {
  label: string;
  currentValue: number | null;
  previousValue: number | null;
  format?: "number" | "currency" | "percent";
}

interface MoMComparisonProps {
  kpis: KPIData[];
  onPeriodChange?: (period: string) => void;
  loading?: boolean;
  hasData?: boolean;
}

type ComparisonPeriod = "mom" | "yoy" | "wow" | "custom";

export function MoMComparison({ kpis, onPeriodChange, loading = false, hasData = true }: MoMComparisonProps) {
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = useState<ComparisonPeriod>("mom");

  const periodLabels: Record<ComparisonPeriod, string> = {
    mom: t("cockpit.momPeriodMom"),
    yoy: t("cockpit.momPeriodYoy"),
    wow: t("cockpit.momPeriodWow"),
    custom: t("cockpit.momPeriodCustom"),
  };

  const intlLocale = getIntlLocale(i18n.language);

  const handlePeriodChange = (value: ComparisonPeriod) => {
    setPeriod(value);
    onPeriodChange?.(value);
  };

  const formatValue = (value: number | null, format?: string): string => {
    if (value === null || value === undefined) return "—";
    switch (format) {
      case "currency":
        return new Intl.NumberFormat(intlLocale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);
      case "percent":
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat(intlLocale).format(value);
    }
  };

  const calculateChange = (current: number | null, previous: number | null): number | null => {
    if (current === null || previous === null) return null;
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const kpiWithChanges = useMemo(() => {
    return kpis.map(kpi => {
      const change = calculateChange(kpi.currentValue, kpi.previousValue);
      return { ...kpi, change, hasChange: change !== null, formattedCurrent: formatValue(kpi.currentValue, kpi.format), formattedPrevious: formatValue(kpi.previousValue, kpi.format) };
    });
  }, [kpis, intlLocale]);

  const summary = useMemo(() => {
    const kpisWithChange = kpiWithChanges.filter(k => k.hasChange);
    if (kpisWithChange.length === 0) return { positive: 0, negative: 0, neutral: 0, avgChange: null, hasValidData: false };
    const changes = kpisWithChange.map(k => k.change as number);
    return {
      positive: changes.filter(c => c > 0).length,
      negative: changes.filter(c => c < 0).length,
      neutral: changes.filter(c => c === 0).length,
      avgChange: changes.reduce((a, b) => a + b, 0) / changes.length,
      hasValidData: true,
    };
  }, [kpiWithChanges]);

  if (!hasData) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{t("cockpit.momNoKpiData")}</h3>
          <p className="text-muted-foreground max-w-md mb-6">{t("cockpit.momConnectGsc")}</p>
          <Link to="/dashboard/integrations">
            <Button variant="hero">
              <LinkIcon className="w-4 h-4 mr-2" />
              {t("cockpit.momConnectGscBtn")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t("cockpit.momTitle")}
            </CardTitle>
            <CardDescription>{t("cockpit.momSubtitle")}</CardDescription>
          </div>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[200px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(periodLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {summary.hasValidData ? (
          <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />{summary.positive}
              </Badge>
              <span className="text-sm text-muted-foreground">{t("cockpit.momUp")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />{summary.negative}
              </Badge>
              <span className="text-sm text-muted-foreground">{t("cockpit.momDown")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Minus className="w-3 h-3" />{summary.neutral}
              </Badge>
              <span className="text-sm text-muted-foreground">{t("cockpit.momStable")}</span>
            </div>
            <div className="ml-auto">
              <span className="text-sm text-muted-foreground">{t("cockpit.momAverage")} </span>
              <span className={`font-medium ${(summary.avgChange ?? 0) > 0 ? 'status-success' : (summary.avgChange ?? 0) < 0 ? 'text-destructive' : ''}`}>
                {(summary.avgChange ?? 0) > 0 ? '+' : ''}{(summary.avgChange ?? 0).toFixed(1)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <p className="text-sm text-muted-foreground">{t("cockpit.momNoPreviousData")}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiWithChanges.map((kpi, i) => (
            <div key={i} className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                {kpi.hasChange ? (
                  <Badge variant={(kpi.change ?? 0) > 0 ? "success" : (kpi.change ?? 0) < 0 ? "destructive" : "secondary"} className="flex items-center gap-1">
                    {(kpi.change ?? 0) > 0 ? <TrendingUp className="w-3 h-3" /> : (kpi.change ?? 0) < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {(kpi.change ?? 0) > 0 ? '+' : ''}{(kpi.change ?? 0).toFixed(1)}%
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">{t("cockpit.momNoComparison")}</Badge>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{kpi.formattedCurrent}</p>
                {kpi.previousValue !== null && <p className="text-sm text-muted-foreground">vs {kpi.formattedPrevious}</p>}
              </div>
              {kpi.hasChange && (
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${(kpi.change ?? 0) > 0 ? 'bg-green-500' : (kpi.change ?? 0) < 0 ? 'bg-red-500' : 'bg-muted-foreground'}`} style={{ width: `${Math.min(Math.abs(kpi.change ?? 0) * 2, 100)}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
