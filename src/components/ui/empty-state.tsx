import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8" : "py-12"
      )}>
        <div className={cn(
          "rounded-full bg-primary/10 mb-4",
          compact ? "p-3" : "p-4"
        )}>
          <Icon className={cn("text-primary", compact ? "w-6 h-6" : "w-8 h-8")} />
        </div>
        <h3 className={cn("font-semibold mb-2", compact ? "text-base" : "text-lg")}>{title}</h3>
        <p className={cn("text-muted-foreground max-w-md", compact ? "text-sm mb-4" : "mb-6")}>{description}</p>
        <div className="flex items-center gap-3">
          {action && (
            <Button onClick={action.onClick} variant="hero">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface NoDataRowProps {
  icon: LucideIcon;
  message: string;
  subMessage?: string;
  className?: string;
}

export function NoDataRow({ icon: Icon, message, subMessage, className }: NoDataRowProps) {
  return (
    <div className={cn("text-center py-12 text-muted-foreground", className)}>
      <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p className="font-medium">{message}</p>
      {subMessage && <p className="text-sm mt-1">{subMessage}</p>}
    </div>
  );
}

interface ConnectionRequiredProps {
  provider: string;
  icon: LucideIcon;
  onConnect?: () => void;
  description?: string;
}

export function ConnectionRequired({ provider, icon: Icon, onConnect, description }: ConnectionRequiredProps) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardContent className="flex items-center gap-4 py-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Autorisation requise</p>
          <p className="text-sm text-muted-foreground">
            {description || `Autorisez l'accès à ${provider} pour activer ces fonctionnalités`}
          </p>
        </div>
        {onConnect && (
          <Button size="sm" onClick={onConnect}>
            Autoriser
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface SiteRequiredProps {
  onNavigate: () => void;
  message?: string;
}

export function SiteRequired({ onNavigate, message }: SiteRequiredProps) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardContent className="flex items-center gap-4 py-4">
        <p className="flex-1 text-sm">
          <span className="font-medium">Site requis.</span>{" "}
          {message || "Sélectionnez ou créez un site pour accéder à ces données."}
        </p>
        <Button size="sm" onClick={onNavigate}>
          Gérer les sites
        </Button>
      </CardContent>
    </Card>
  );
}

interface DataLoadingErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function DataLoadingError({ message, onRetry }: DataLoadingErrorProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex items-center gap-4 py-4">
        <p className="flex-1 text-sm text-destructive">
          {message || "Erreur lors du chargement des données"}
        </p>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Réessayer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface DemoModeBannerProps {
  message?: string;
}

export function DemoModeBanner({ message }: DemoModeBannerProps) {
  return (
    <div className="text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg border border-border/50">
      ⚠️ {message || "Autorisez l'accès à vos outils pour voir vos vraies données"}
    </div>
  );
}
