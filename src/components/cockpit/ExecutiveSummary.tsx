import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface ServiceHealth {
  slug: string;
  name: string;
  status: "green" | "yellow" | "red" | "grey";
  message?: string;
  trend?: "up" | "down" | "stable";
  change?: number;
}

interface ExecutiveSummaryProps {
  siteName: string;
  services: ServiceHealth[];
  loading?: boolean;
}

const statusConfig = {
  green: {
    icon: CheckCircle2,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/30",
    label: "Opérationnel",
  },
  yellow: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    label: "Attention requise",
  },
  red: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    label: "Action urgente",
  },
  grey: {
    icon: Minus,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border",
    label: "Non configuré",
  },
};

export function ExecutiveSummary({ siteName, services, loading }: ExecutiveSummaryProps) {
  if (loading) {
    return (
      <Card variant="gradient">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const greenCount = services.filter((s) => s.status === "green").length;
  const yellowCount = services.filter((s) => s.status === "yellow").length;
  const redCount = services.filter((s) => s.status === "red").length;

  return (
    <Card variant="gradient" className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">État de {siteName}</CardTitle>
          <div className="flex items-center gap-2">
            {redCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {redCount} critique{redCount > 1 ? "s" : ""}
              </Badge>
            )}
            {yellowCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">
                {yellowCount} attention
              </Badge>
            )}
            {greenCount > 0 && redCount === 0 && yellowCount === 0 && (
              <Badge variant="secondary" className="text-xs bg-chart-3/20 text-chart-3">
                Tout va bien
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {services.map((service) => {
            const config = statusConfig[service.status];
            const Icon = config.icon;
            return (
              <div
                key={service.slug}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border",
                  config.bg,
                  config.border
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", config.color)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{service.name}</p>
                    {service.trend && (
                      <span className={cn(
                        "flex items-center gap-0.5 text-xs font-medium",
                        service.trend === "up" ? "text-chart-3" : service.trend === "down" ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {service.trend === "up" && <TrendingUp className="w-3 h-3" />}
                        {service.trend === "down" && <TrendingDown className="w-3 h-3" />}
                        {service.change !== undefined && (
                          <span>{service.trend === "up" ? "+" : ""}{service.change}%</span>
                        )}
                      </span>
                    )}
                  </div>
                  {service.message && (
                    <p className="text-xs text-muted-foreground truncate">
                      {service.message}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
