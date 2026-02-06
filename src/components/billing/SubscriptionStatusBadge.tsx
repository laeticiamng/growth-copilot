import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useTranslation } from "react-i18next";

interface SubscriptionStatusBadgeProps {
  compact?: boolean;
  className?: string;
}

export function SubscriptionStatusBadge({ compact = false, className }: SubscriptionStatusBadgeProps) {
  const { t } = useTranslation();
  const { subscription, isLoading, isActive, isTrialing, isPastDue, isCancelled, trialDaysRemaining } = useSubscriptionStatus();

  if (isLoading) {
    return (
      <Badge variant="outline" className={cn("gap-1", className)}>
        <Loader2 className="w-3 h-3 animate-spin" />
        {!compact && <span>{t("common.loading")}</span>}
      </Badge>
    );
  }

  if (!subscription || subscription.plan === "free") {
    return null;
  }

  if (isActive) {
    return (
      <Badge variant="success" className={cn("gap-1", className)}>
        <CheckCircle2 className="w-3 h-3" />
        {!compact && <span>{t("components.subscription.active")}</span>}
      </Badge>
    );
  }

  if (isTrialing) {
    return (
      <Badge variant="secondary" className={cn("gap-1", className)}>
        <Clock className="w-3 h-3" />
        {!compact ? <span>{t("components.subscription.trial")} • {trialDaysRemaining}{t("components.subscription.daysShort")}</span> : <span>{trialDaysRemaining}{t("components.subscription.daysShort")}</span>}
      </Badge>
    );
  }

  if (isPastDue) {
    return (
      <Badge variant="warning" className={cn("gap-1", className)}>
        <AlertCircle className="w-3 h-3" />
        {!compact && <span>{t("components.subscription.pastDue")}</span>}
      </Badge>
    );
  }

  if (isCancelled) {
    return (
      <Badge variant="destructive" className={cn("gap-1", className)}>
        <XCircle className="w-3 h-3" />
        {!compact && <span>{t("components.subscription.cancelled")}</span>}
      </Badge>
    );
  }

  return null;
}
