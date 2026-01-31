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
  ExternalLink,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";

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
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "pour toujours",
    icon: Zap,
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

const Billing = () => {
  const { currentWorkspace } = useWorkspace();
  const [currentPlan] = useState("free");
  
  // Demo usage data
  const usage = {
    sites: 1,
    crawls: 7,
    agentRuns: 23,
  };

  const currentPlanData = plans.find(p => p.id === currentPlan) || plans[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Gérez votre abonnement et consultez votre utilisation.
        </p>
      </div>

      {/* TODO Notice */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="flex items-center gap-4 py-4">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="font-medium">Intégration Stripe en cours</p>
            <p className="text-sm text-muted-foreground">
              Les paiements réels seront activés prochainement. Pour l'instant, vous êtes sur le plan Free.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Plan & Usage */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card variant="gradient" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <currentPlanData.icon className="w-5 h-5" />
                  Plan {currentPlanData.name}
                </CardTitle>
                <CardDescription>
                  {currentPlanData.price === 0 ? "Gratuit" : `€${currentPlanData.price}${currentPlanData.period}`}
                </CardDescription>
              </div>
              <Badge variant="success">Actif</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Sites</span>
                  <span className="font-medium">
                    {usage.sites} / {currentPlanData.quotas.sites === -1 ? "∞" : currentPlanData.quotas.sites}
                  </span>
                </div>
                <Progress 
                  value={currentPlanData.quotas.sites === -1 ? 0 : (usage.sites / currentPlanData.quotas.sites) * 100} 
                  className="h-2" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Crawls ce mois</span>
                  <span className="font-medium">{usage.crawls} / {currentPlanData.quotas.crawls}</span>
                </div>
                <Progress 
                  value={(usage.crawls / currentPlanData.quotas.crawls) * 100} 
                  className="h-2" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Agent Runs</span>
                  <span className="font-medium">{usage.agentRuns} / {currentPlanData.quotas.agentRuns}</span>
                </div>
                <Progress 
                  value={(usage.agentRuns / currentPlanData.quotas.agentRuns) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5" />
              Paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary text-center">
              <p className="text-sm text-muted-foreground mb-2">Aucune carte enregistrée</p>
              <Button variant="outline" size="sm" disabled>
                <CreditCard className="w-4 h-4 mr-2" />
                Ajouter une carte
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Paiements sécurisés via Stripe
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tous les plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.id === currentPlan;
            
            return (
              <Card 
                key={plan.id} 
                variant={plan.popular ? "gradient" : "feature"}
                className={`relative ${isCurrent ? "ring-2 ring-primary" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2" variant="default">
                    Populaire
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${plan.popular ? 'gradient-bg' : 'bg-secondary'}`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? 'text-primary-foreground' : ''}`} />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price === 0 ? "Gratuit" : `€${plan.price}`}
                    {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={isCurrent ? "outline" : plan.popular ? "gradient" : "default"}
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Plan actuel" : "Choisir ce plan"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Invoice History Placeholder */}
      <Card variant="feature">
        <CardHeader>
          <CardTitle>Historique des factures</CardTitle>
          <CardDescription>Téléchargez vos factures passées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune facture pour l'instant</p>
            <p className="text-sm">Les factures apparaîtront ici après votre premier paiement.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
