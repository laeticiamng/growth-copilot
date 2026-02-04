import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SectionHeaderProps {
  emoji?: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  helpText?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive" | "gradient";
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function SectionHeader({
  emoji,
  icon,
  title,
  subtitle,
  description,
  helpText,
  badge,
  badgeVariant = "secondary",
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icon or Emoji */}
          {emoji && <span className="text-2xl">{emoji}</span>}
          {icon && <div className="text-primary">{icon}</div>}
          
          {/* Title & Badge */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {badge && (
              <Badge variant={badgeVariant as any} className="text-xs">
                {badge}
              </Badge>
            )}
            {helpText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="focus:outline-none">
                      <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-sm">{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        {action && (
          action.href ? (
            <Link to={action.href}>
              <Button variant="outline" size="sm">
                {action.label}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )
        )}
      </div>
      
      {/* Subtitle & Description */}
      {(subtitle || description) && (
        <div className="space-y-0.5">
          {subtitle && (
            <p className="text-base font-medium text-muted-foreground">{subtitle}</p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Page header variant with consistent styling
export function PageHeader({
  emoji,
  title,
  description,
  children,
  className,
}: {
  emoji?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2", className)}>
      <div className="flex items-center gap-3">
        {emoji && <span className="text-3xl">{emoji}</span>}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
