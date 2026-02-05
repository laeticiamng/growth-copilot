import { LucideIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExternalLink, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ModuleEmptyStateProps {
  icon: LucideIcon;
  moduleName: string;
  title?: string;
  description: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  features?: string[];
  docUrl?: string;
  className?: string;
}

export function ModuleEmptyState({
  icon: Icon,
  moduleName,
  title,
  description,
  primaryAction,
  secondaryAction,
  features,
  docUrl = "https://docs.agent-growth-automator.lovable.app",
  className,
}: ModuleEmptyStateProps) {
  return (
    <Card className={cn("border-dashed border-2 border-primary/20", className)}>
      <CardContent className="flex flex-col items-center justify-center text-center py-16 px-8 min-h-[400px]">
        {/* Icon - 64px avec cercle gradient */}
        <div className="rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 p-5 mb-6">
          <Icon className="w-16 h-16 text-primary" />
        </div>
        
        {/* Title - Heading 2 style */}
        <h2 className="text-2xl font-bold mb-3 tracking-tight">
          {title || `Votre module ${moduleName} est prêt`}
        </h2>
        
        {/* Description */}
        <p className="text-muted-foreground max-w-lg mb-6 text-base leading-relaxed">
          {description}
        </p>
        
        {/* Features list avec check icons */}
        {features && features.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-md">
            {features.map((feature, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-sm font-medium text-foreground"
              >
                <Check className="w-3.5 h-3.5 text-primary" />
                {feature}
              </span>
            ))}
          </div>
        )}
        
        {/* Actions - Bouton primaire gradient + secondaire outline */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {primaryAction && (
            primaryAction.href ? (
              <Button variant="hero" size="lg" asChild>
                <Link to={primaryAction.href}>
                  {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
                  {primaryAction.label}
                </Link>
              </Button>
            ) : (
              <Button variant="hero" size="lg" onClick={primaryAction.onClick}>
                {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
                {primaryAction.label}
              </Button>
            )
          )}
          
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" size="lg" asChild>
                <Link to={secondaryAction.href}>
                  {secondaryAction.label}
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="lg" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
        
        {/* Documentation link */}
        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 mt-8 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Consulter la documentation
          <ExternalLink className="w-3 h-3" />
        </a>
      </CardContent>
    </Card>
  );
}

interface NoSiteEmptyStateProps {
  moduleName: string;
  icon: LucideIcon;
}

export function NoSiteEmptyState({ moduleName, icon: Icon }: NoSiteEmptyStateProps) {
  return (
    <ModuleEmptyState
      icon={Icon}
      moduleName={moduleName}
      title="Site requis"
      description={`Pour utiliser le module ${moduleName}, vous devez d'abord configurer un site. Ajoutez un site pour commencer à collecter des données et profiter de toutes les fonctionnalités.`}
      primaryAction={{
        label: "Gérer mes sites",
        href: "/dashboard/sites",
      }}
    />
  );
}

interface NoIntegrationEmptyStateProps {
  moduleName: string;
  icon: LucideIcon;
  integrationName: string;
  integrationDescription?: string;
}

export function NoIntegrationEmptyState({
  moduleName,
  icon: Icon,
  integrationName,
  integrationDescription,
}: NoIntegrationEmptyStateProps) {
  return (
    <ModuleEmptyState
      icon={Icon}
      moduleName={moduleName}
      title={`Connectez ${integrationName}`}
      description={integrationDescription || `Autorisez l'accès à ${integrationName} pour activer toutes les fonctionnalités du module ${moduleName} et voir vos vraies données.`}
      primaryAction={{
        label: `Connecter ${integrationName}`,
        href: "/dashboard/integrations",
      }}
      secondaryAction={{
        label: "Comment ça marche ?",
        href: "/dashboard/guide",
      }}
    />
  );
}

interface NoDataEmptyStateProps {
  moduleName: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  description?: string;
}

export function NoDataEmptyState({
  moduleName,
  icon: Icon,
  actionLabel = "Lancer la première analyse",
  onAction,
  description,
}: NoDataEmptyStateProps) {
  return (
    <ModuleEmptyState
      icon={Icon}
      moduleName={moduleName}
      description={description || `Aucune donnée dans le module ${moduleName}. Lancez votre première action pour commencer à voir des résultats.`}
      primaryAction={onAction ? {
        label: actionLabel,
        onClick: onAction,
      } : undefined}
    />
  );
}
