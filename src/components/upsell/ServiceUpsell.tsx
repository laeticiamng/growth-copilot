import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, ArrowRight, Crown, TrendingUp, Briefcase, BarChart3, 
  Shield, Puzzle, Code, HeadphonesIcon, Settings, Sparkles 
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ServiceUpsellProps {
  serviceSlug: string;
  serviceName: string;
  description: string;
  features?: string[];
  price?: string;
}

const SERVICE_ICONS: Record<string, React.ElementType> = {
  marketing: TrendingUp,
  sales: Briefcase,
  finance: BarChart3,
  security: Shield,
  product: Puzzle,
  engineering: Code,
  data: BarChart3,
  support: HeadphonesIcon,
  governance: Settings,
};

const SERVICE_COLORS: Record<string, string> = {
  marketing: "text-blue-500",
  sales: "text-green-500",
  finance: "text-yellow-500",
  security: "text-red-500",
  product: "text-purple-500",
  engineering: "text-orange-500",
  data: "text-cyan-500",
  support: "text-pink-500",
  governance: "text-gray-500",
  hr: "text-indigo-500",
  legal: "text-slate-500",
};

export function ServiceUpsell({ 
  serviceSlug, 
  serviceName, 
  description,
  features = [],
  price = "1 900"
}: ServiceUpsellProps) {
  const Icon = SERVICE_ICONS[serviceSlug] || Puzzle;
  const color = SERVICE_COLORS[serviceSlug] || "text-muted-foreground";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <Card variant="feature" className="max-w-lg w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto p-4 rounded-2xl bg-secondary/80 w-fit mb-4 relative">
            <Icon className={cn("w-10 h-10", color)} />
            <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-background border border-border">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">{serviceName}</CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {features.length > 0 && (
            <div className="space-y-2 text-left">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">
              Activez ce service pour
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold">{price}€</span>
              <span className="text-muted-foreground">/mois</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link to="/dashboard/billing">
              <Button variant="hero" className="w-full" size="lg">
                Activer {serviceName}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">ou</span>
            </div>

            <Link to="/dashboard/billing">
              <Button variant="outline" className="w-full">
                <Crown className="w-4 h-4 mr-2" />
                Passer à Full Company
                <Badge variant="gradient" className="ml-2 text-xs">-20%</Badge>
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Pas d'engagement. Annulez à tout moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick upsell banner for locked sections
export function ServiceLockedBanner({ 
  serviceName, 
  serviceSlug 
}: { 
  serviceName: string; 
  serviceSlug: string;
}) {
  const Icon = SERVICE_ICONS[serviceSlug] || Puzzle;
  const color = SERVICE_COLORS[serviceSlug] || "text-muted-foreground";

  return (
    <div className="p-4 rounded-xl bg-secondary/50 border border-dashed border-border flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-background", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-sm">
            <Lock className="w-3 h-3 inline mr-1" />
            {serviceName} non activé
          </p>
          <p className="text-xs text-muted-foreground">
            Activez ce service pour accéder à cette fonctionnalité
          </p>
        </div>
      </div>
      <Link to="/dashboard/billing">
        <Button size="sm" variant="outline">
          Activer
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </Link>
    </div>
  );
}
