import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  FileText,
  Mail,
  Megaphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface PendingApproval {
  id: string;
  title: string;
  description: string;
  actionType: string;
  riskLevel: "low" | "medium" | "high";
  createdAt: string;
  agentType?: string;
}

interface ApprovalsWidgetProps {
  approvals: PendingApproval[];
  loading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const actionTypeIcons: Record<string, React.ElementType> = {
  content_publish: FileText,
  email_send: Mail,
  ad_change: Megaphone,
  default: AlertTriangle,
};

export function ApprovalsWidget({
  approvals,
  loading,
  onApprove,
  onReject,
}: ApprovalsWidgetProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            {t("cockpit.pendingApproval")}
          </CardTitle>
          {approvals.length > 0 && (
            <Badge variant="secondary" className="bg-warning/20 text-warning">
              {approvals.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {approvals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-chart-3/50" />
            <p className="text-sm">{t("cockpit.noActionPending")}</p>
            <p className="text-xs mt-1">{t("cockpit.youAreUpToDate")}</p>
          </div>
        ) : (
          <>
            {approvals.slice(0, 3).map((approval) => {
              const Icon = actionTypeIcons[approval.actionType] || actionTypeIcons.default;
              return (
                <div
                  key={approval.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border",
                    approval.riskLevel === "high"
                      ? "border-destructive/30 bg-destructive/5"
                      : approval.riskLevel === "medium"
                      ? "border-warning/30 bg-warning/5"
                      : "border-border bg-secondary/30"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      approval.riskLevel === "high"
                        ? "bg-destructive/10"
                        : approval.riskLevel === "medium"
                        ? "bg-warning/10"
                        : "bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        approval.riskLevel === "high"
                          ? "text-destructive"
                          : approval.riskLevel === "medium"
                          ? "text-warning"
                          : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{approval.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {approval.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {onApprove && onReject ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => onReject(approval.id)}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            {t("cockpit.reject")}
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => onApprove(approval.id)}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t("cockpit.approve")}
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                          <Link to={`/dashboard/approvals?id=${approval.id}`}>
                            {t("cockpit.viewDetails")}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {approvals.length > 3 && (
              <Button variant="ghost" className="w-full" asChild>
                <Link to="/dashboard/approvals">
                  {t("cockpit.viewOthers", { count: approvals.length - 3 })}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
