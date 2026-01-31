import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  className?: string;
  variant?: "default" | "compact";
}

export function KPICard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendLabel,
  className,
  variant = "default"
}: KPICardProps) {
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString() 
    : value;

  return (
    <Card className={cn("", className)}>
      <CardContent className={cn("pt-4", variant === "compact" && "pt-3 pb-3")}>
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          {trend !== undefined && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                trend >= 0 ? 'text-primary border-primary/30' : 'text-destructive border-destructive/30'
              )}
            >
              {trend >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(trend)}%
            </Badge>
          )}
        </div>
        <p className={cn(
          "font-bold",
          variant === "default" ? "text-2xl" : "text-xl"
        )}>
          {formattedValue}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {trendLabel && (
          <p className="text-xs text-muted-foreground mt-1">{trendLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Utility to calculate trend percentage
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Format duration in minutes to human readable
export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${minutes}m`;
}
