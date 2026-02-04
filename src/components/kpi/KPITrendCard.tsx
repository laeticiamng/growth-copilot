import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface KPITrendCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  sparklineData?: number[];
  icon?: React.ReactNode;
  tooltip?: string;
  format?: "number" | "currency" | "percent";
  variant?: "default" | "success" | "warning" | "danger";
}

export function KPITrendCard({
  title,
  value,
  previousValue,
  change,
  changeLabel = "vs période précédente",
  sparklineData,
  icon,
  tooltip,
  format = "number",
  variant = "default",
}: KPITrendCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-500/30 bg-green-500/5";
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/5";
      case "danger":
        return "border-destructive/30 bg-destructive/5";
      default:
        return "";
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val;
    
    switch (format) {
      case "currency":
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
      case "percent":
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('fr-FR');
    }
  };

  const chartData = sparklineData?.map((value, index) => ({ value, index })) || [];
  const sparklineColor = isPositive ? "hsl(var(--chart-3))" : isNegative ? "hsl(var(--destructive))" : "hsl(var(--primary))";

  return (
    <Card className={cn("relative overflow-hidden", getVariantStyles())}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{formatValue(value)}</p>
              {icon && <span className="text-muted-foreground">{icon}</span>}
            </div>
            
            {change !== undefined && (
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs gap-1",
                    isPositive && "bg-green-500/10 text-green-700 border-green-500/30",
                    isNegative && "bg-destructive/10 text-destructive border-destructive/30"
                  )}
                >
                  {isPositive && <TrendingUp className="w-3 h-3" />}
                  {isNegative && <TrendingDown className="w-3 h-3" />}
                  {isNeutral && <Minus className="w-3 h-3" />}
                  {isPositive && "+"}
                  {change.toFixed(1)}%
                </Badge>
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              </div>
            )}

            {previousValue !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                Précédent: {formatValue(previousValue)}
              </p>
            )}
          </div>

          {sparklineData && sparklineData.length > 1 && (
            <div className="w-24 h-12 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={sparklineColor}
                    fill={sparklineColor}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
