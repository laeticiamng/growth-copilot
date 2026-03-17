import { LucideIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExternalLink, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  docUrl = "https://docs.agent-growth-automator.com",
  className,
}: ModuleEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <Card className={cn("border-dashed border-2 border-primary/20", className)}>
      <CardContent className="flex flex-col items-center justify-center text-center py-16 px-8 min-h-[400px]">
        {/* Icon - 64px avec cercle gradient */}
        <div className="rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 p-5 mb-6">
          <Icon className="w-16 h-16 text-primary" />
        </div>
        
        {/* Title - Heading 2 style */}
        <h2 className="text-2xl font-bold mb-3 tracking-tight">
          {title || t("components.moduleEmptyState.moduleReady", { module: moduleName })}
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
          {t("components.moduleEmptyState.viewDocs", "View documentation")}
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
  const { t } = useTranslation();
  return (
    <ModuleEmptyState
      icon={Icon}
      moduleName={moduleName}
      title={t("components.moduleEmptyState.siteRequired", "Site required")}
      description={t("components.moduleEmptyState.siteRequiredDesc", { module: moduleName })}
      primaryAction={{
        label: t("components.moduleEmptyState.manageSites", "Manage my sites"),
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
  const { t } = useTranslation();
  return (
    <ModuleEmptyState
      icon={Icon}
      moduleName={moduleName}
      title={t("components.moduleEmptyState.connectIntegration", { name: integrationName })}
      description={integrationDescription || t("components.moduleEmptyState.connectIntegrationDesc", { name: integrationName, module: moduleName })}
      primaryAction={{
        label: t("components.moduleEmptyState.connectAction", { name: integrationName }),
        href: "/dashboard/integrations",
      }}
      secondaryAction={{
        label: t("components.moduleEmptyState.howItWorks", "How does it work?"),
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
  actionLabel,
  onAction,
  description,
}: NoDataEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <ModuleEmptyState
      icon={Icon}
      moduleName={moduleName}
      description={description || t("components.moduleEmptyState.noDataDesc", { module: moduleName })}
      primaryAction={onAction ? {
        label: actionLabel || t("components.moduleEmptyState.runFirstAnalysis", "Run first analysis"),
        onClick: onAction,
      } : undefined}
    />
  );
}
