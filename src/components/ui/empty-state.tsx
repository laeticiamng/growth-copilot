import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-primary/10 mb-4">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>
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
}

export function NoDataRow({ icon: Icon, message, subMessage }: NoDataRowProps) {
  return (
    <div className="text-center py-12 text-muted-foreground">
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
}

export function ConnectionRequired({ provider, icon: Icon, onConnect }: ConnectionRequiredProps) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardContent className="flex items-center gap-4 py-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Connexion requise</p>
          <p className="text-sm text-muted-foreground">
            Connectez votre compte {provider} pour accéder à ces fonctionnalités
          </p>
        </div>
        {onConnect && (
          <Button size="sm" onClick={onConnect}>
            Connecter
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface SiteRequiredProps {
  onNavigate: () => void;
}

export function SiteRequired({ onNavigate }: SiteRequiredProps) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardContent className="flex items-center gap-4 py-4">
        <p className="flex-1 text-sm">
          <span className="font-medium">Site requis.</span>{" "}
          Sélectionnez ou créez un site pour accéder à ces données.
        </p>
        <Button size="sm" onClick={onNavigate}>
          Gérer les sites
        </Button>
      </CardContent>
    </Card>
  );
}
