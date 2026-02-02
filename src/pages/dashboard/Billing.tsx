import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Check, 
  Zap, 
  Building2, 
  Rocket,
  Crown,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Info,
  ShieldAlert,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  icon: React.ElementType;
  features: string[];
  quotas: {
    sites: number;
    crawls: number;
    agentRuns: number;
  };
  popular?: boolean;
  description: string;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "pour toujours",
    icon: Zap,
    description: "Pour découvrir la plateforme",
    features: [
      "1 site",
      "10 crawls/mois",
      "Audit SEO basique",
      "Dashboard KPIs",
      "Mode demo complet",
    ],
    quotas: { sites: 1, crawls: 10, agentRuns: 50 },
  },
  {
    id: "starter",
    name: "Starter",
    price: 49,
    period: "/mois",
    icon: Rocket,
    description: "Pour les indépendants",
    features: [
      "2 sites",
      "100 crawls/mois",
      "GSC & GA4 intégrés",
      "Rapports PDF",
      "Keywords tracking",
      "Support email",
    ],
    quotas: { sites: 2, crawls: 100, agentRuns: 200 },
  },
  {
    id: "growth",
    name: "Growth",
    price: 149,
    period: "/mois",
    icon: Crown,
    popular: true,
    description: "Pour les équipes en croissance",
    features: [
      "5 sites",
      "500 crawls/mois",
      "Tous modules actifs",
      "Google Ads intégré",
      "GBP & Local SEO",
      "CRO Autopilot",
      "Lifecycle & CRM",
      "Support prioritaire",
    ],
    quotas: { sites: 5, crawls: 500, agentRuns: 1000 },
  },
  {
    id: "agency",
    name: "Agency",
    price: 399,
    period: "/mois",
    icon: Building2,
    description: "Pour les agences",
    features: [
      "Clients illimités",
      "2000 crawls/mois",
      "Multi-établissements",
      "White-label exports",
      "API access",
      "Autopilot complet",
      "Account manager dédié",
      "SLA garanti",
    ],
    quotas: { sites: -1, crawls: 2000, agentRuns: 5000 },
  },
];

// Helper to calculate usage percentage with color coding
const getUsageStatus = (used: number, total: number) => {
  if (total === -1) return { percent: 0, status: "unlimited" as const };
  const percent = (used / total) * 100;
  if (percent >= 90) return { percent, status: "critical" as const };
  if (percent >= 70) return { percent, status: "warning" as const };
  return { percent, status: "normal" as const };
};

const UsageBar = ({ 
  label, 
  used, 
  total, 
  tooltip 
}: { 
  label: string; 
  used: number; 
  total: number; 
  tooltip?: string;
}) => {
  const { percent, status } = getUsageStatus(used, total);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5">
          {label}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" aria-label="Plus d'informations" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </span>
        <span className={`font-medium ${status === "critical" ? "text-destructive" : status === "warning" ? "text-amber-500" : ""}`}>
          {used} / {total === -1 ? "∞" : total}
        </span>
      </div>
      <div className="relative">
        <Progress 
          value={percent} 
          className={`h-2.5 ${status === "critical" ? "[&>div]:bg-destructive" : status === "warning" ? "[&>div]:bg-amber-500" : ""}`}
          aria-label={`${label}: ${used} sur ${total === -1 ? "illimité" : total}`}
        />
        {status === "critical" && (
          <TrendingUp className="absolute -right-1 -top-1 w-3.5 h-3.5 text-destructive animate-pulse" aria-hidden="true" />
        )}
      </div>
    </div>
  );
};

const Billing = () => {
  const { currentWorkspace } = useWorkspace();
  const { isAtLeastRole } = usePermissions();
  const [currentPlan] = useState("free");
  
  // Demo usage data
  const usage = {
    sites: 1,
    crawls: 7,
    agentRuns: 23,
  };

  const currentPlanData = plans.find(p => p.id === currentPlan) || plans[0];
  const canManageBilling = isAtLeastRole('owner');

  return (
    <PermissionGuard 
      permission="manage_billing" 
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ShieldAlert className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
          <p className="text-muted-foreground max-w-md">
            Seuls les propriétaires du workspace peuvent accéder aux informations de facturation. 
            Contactez le propriétaire pour gérer l'abonnement.
          </p>
        </div>
      }
    >
    <div className="space-y-8">
      {/* Header with better hierarchy */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground mt-1">
          Gérez votre abonnement et consultez votre utilisation.
        </p>
      </header>

      {/* Stripe integration notice */}
      <Card className="border-primary/50 bg-primary/5" role="alert" aria-live="polite">
        <CardContent className="flex items-start gap-4 py-4">
          <div className="p-2 rounded-full bg-primary/10 mt-0.5" aria-hidden="true">
            <AlertCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Intégration Stripe en cours</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Les paiements réels seront activés prochainement. Pour l'instant, vous êtes sur le plan <strong>Free</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Plan & Usage - Better visual separation */}
      <section aria-labelledby="current-plan-heading">
        <h2 id="current-plan-heading" className="sr-only">Votre plan actuel</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card variant="gradient" className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <currentPlanData.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Plan {currentPlanData.name}
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                      {currentPlanData.price === 0 ? "Gratuit" : `€${currentPlanData.price}${currentPlanData.period}`}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="success" className="text-sm px-3 py-1">
                  <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" aria-hidden="true" />
                  Actif
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3">
                <UsageBar 
                  label="Sites" 
                  used={usage.sites} 
                  total={currentPlanData.quotas.sites}
                  tooltip="Nombre de sites que vous pouvez connecter"
                />
                <UsageBar 
                  label="Crawls ce mois" 
                  used={usage.crawls} 
                  total={currentPlanData.quotas.crawls}
                  tooltip="Nombre d'audits SEO automatiques par mois"
                />
                <UsageBar 
                  label="Agent Runs" 
                  used={usage.agentRuns} 
                  total={currentPlanData.quotas.agentRuns}
                  tooltip="Exécutions d'agents IA pour l'automatisation"
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="feature">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5" aria-hidden="true" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/50 text-center border border-dashed border-border">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" aria-hidden="true" />
                <p className="text-sm text-muted-foreground mb-3">Aucune carte enregistrée</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <Button variant="outline" size="sm" disabled aria-describedby="card-disabled-reason">
                          <CreditCard className="w-4 h-4 mr-2" aria-hidden="true" />
                          Ajouter une carte
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent id="card-disabled-reason">
                      <p>Disponible prochainement</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 inline-flex items-center justify-center rounded bg-primary/10" aria-hidden="true">
                  🔒
                </span>
                Paiements sécurisés via Stripe
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Plans Grid - Better hierarchy and spacing */}
      <section aria-labelledby="all-plans-heading">
        <div className="flex items-center justify-between mb-6">
          <h2 id="all-plans-heading" className="text-xl font-semibold">Tous les plans</h2>
          <p className="text-sm text-muted-foreground hidden sm:block">Choisissez le plan adapté à vos besoins</p>
        </div>
        
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.id === currentPlan;
            
            return (
              <Card 
                key={plan.id} 
                variant={plan.popular ? "gradient" : "feature"}
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                } ${plan.popular ? "scale-[1.02] z-10" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-md" variant="default">
                    ⭐ Populaire
                  </Badge>
                )}
                <CardHeader className="text-center pb-2 pt-6">
                  <div 
                    className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-transform hover:scale-110 ${
                      plan.popular ? 'gradient-bg shadow-lg' : 'bg-secondary'
                    }`}
                    aria-hidden="true"
                  >
                    <Icon className={`w-7 h-7 ${plan.popular ? 'text-primary-foreground' : 'text-foreground'}`} />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                  <div className="text-3xl font-bold mt-3">
                    {plan.price === 0 ? (
                      "Gratuit"
                    ) : (
                      <>
                        €{plan.price}
                        <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2.5" role="list" aria-label={`Fonctionnalités du plan ${plan.name}`}>
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="w-full" tabIndex={isCurrent ? 0 : -1}>
                          <Button 
                            className="w-full" 
                            variant={isCurrent ? "outline" : plan.popular ? "gradient" : "default"}
                            disabled={isCurrent}
                            aria-label={isCurrent ? `${plan.name} - Plan actuel` : `Choisir le plan ${plan.name}`}
                          >
                            {isCurrent ? (
                              <>
                                <Check className="w-4 h-4 mr-1.5" aria-hidden="true" />
                                Plan actuel
                              </>
                            ) : (
                              "Choisir ce plan"
                            )}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {isCurrent && (
                        <TooltipContent>
                          <p>Vous êtes actuellement sur ce plan</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Invoice History - Better empty state */}
      <section aria-labelledby="invoices-heading">
        <Card variant="feature">
          <CardHeader>
            <CardTitle id="invoices-heading">Historique des factures</CardTitle>
            <CardDescription>Téléchargez vos factures passées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10 px-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary/50 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-muted-foreground/50" aria-hidden="true" />
              </div>
              <p className="font-medium text-foreground mb-1">Aucune facture pour l'instant</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Les factures apparaîtront ici après votre premier paiement. Vous pourrez les télécharger au format PDF.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
    </PermissionGuard>
  );
};

export default Billing;
