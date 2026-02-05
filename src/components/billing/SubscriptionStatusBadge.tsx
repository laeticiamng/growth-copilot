import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

interface SubscriptionStatusBadgeProps {
  compact?: boolean;
  className?: string;
}

export function SubscriptionStatusBadge({ compact = false, className }: SubscriptionStatusBadgeProps) {
  const { subscription, isLoading, isActive, isTrialing, isPastDue, isCancelled, trialDaysRemaining } = useSubscriptionStatus();

  if (isLoading) {
    return (
      <Badge variant="outline" className={cn("gap-1", className)}>
        <Loader2 className="w-3 h-3 animate-spin" />
        {!compact && <span>Chargement...</span>}
      </Badge>
    );
  }

  if (!subscription || subscription.plan === "free") {
    return null; // Don't show badge for free plans
  }

  if (isActive) {
    return (
      <Badge variant="success" className={cn("gap-1", className)}>
        <CheckCircle2 className="w-3 h-3" />
        {!compact && <span>Actif</span>}
      </Badge>
    );
  }

  if (isTrialing) {
    return (
      <Badge variant="secondary" className={cn("gap-1", className)}>
        <Clock className="w-3 h-3" />
        {!compact ? <span>Essai • {trialDaysRemaining}j</span> : <span>{trialDaysRemaining}j</span>}
      </Badge>
    );
  }

  if (isPastDue) {
    return (
      <Badge variant="warning" className={cn("gap-1", className)}>
        <AlertCircle className="w-3 h-3" />
        {!compact && <span>Paiement en retard</span>}
      </Badge>
    );
  }

  if (isCancelled) {
    return (
      <Badge variant="destructive" className={cn("gap-1", className)}>
        <XCircle className="w-3 h-3" />
        {!compact && <span>Annulé</span>}
      </Badge>
    );
  }

  return null;
}
