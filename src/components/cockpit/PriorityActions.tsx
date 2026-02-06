import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowRight, Clock, Zap, AlertTriangle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface PriorityAction {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  iceScore: number;
  effort: string;
  link: string;
  actionLabel: string;
  service?: string;
}

interface PriorityActionsProps {
  actions: PriorityAction[];
  loading?: boolean;
  maxItems?: number;
}

const priorityConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    badge: "destructive" as const,
  },
  high: {
    icon: Zap,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    badge: "secondary" as const,
  },
  medium: {
    icon: Info,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    badge: "secondary" as const,
  },
  low: {
    icon: Info,
    color: "text-muted-foreground",
    bg: "bg-secondary",
    border: "border-border",
    badge: "outline" as const,
  },
};

export function PriorityActions({ actions, loading, maxItems = 5 }: PriorityActionsProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const displayedActions = actions.slice(0, maxItems);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t("cockpit.priorities")}</CardTitle>
          <Badge variant="gradient">Top {displayedActions.length}</Badge>
        </div>
        <CardDescription className="text-xs">{t("cockpit.rankedByIce")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        {displayedActions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t("cockpit.noPriorityAction")}</p>
          </div>
        ) : (
          displayedActions.map((action, index) => {
            const config = priorityConfig[action.priority];
            return (
              <div
                key={action.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border transition-all hover:shadow-sm",
                  config.border,
                  config.bg
                )}
              >
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                      action.priority === "critical"
                        ? "bg-destructive/20 text-destructive"
                        : action.priority === "high"
                        ? "bg-warning/20 text-warning"
                        : "bg-primary/20 text-primary"
                    )}
                  >
                    {action.iceScore}
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase">ICE</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-muted-foreground/50">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {action.effort}
                      </Badge>
                      {action.service && (
                        <Badge variant="secondary" className="text-xs">
                          {action.service}
                        </Badge>
                      )}
                    </div>
                    <Button size="sm" asChild>
                      <Link to={action.link}>
                        {action.actionLabel}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
