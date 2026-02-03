import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, ArrowRight, Crown, Puzzle, TrendingUp, Briefcase, BarChart3, 
  Shield, Code, HeadphonesIcon, Settings, Sparkles 
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Service modules for à la carte display
const SERVICE_MODULES = [
  { id: "marketing", name: "Marketing", icon: TrendingUp, price: "49", color: "text-blue-500" },
  { id: "sales", name: "Commercial", icon: Briefcase, price: "39", color: "text-green-500" },
  { id: "finance", name: "Finance", icon: BarChart3, price: "29", color: "text-yellow-500" },
  { id: "security", name: "Sécurité", icon: Shield, price: "29", color: "text-red-500" },
  { id: "product", name: "Produit", icon: Puzzle, price: "39", color: "text-purple-500" },
  { id: "engineering", name: "Ingénierie", icon: Code, price: "39", color: "text-orange-500" },
  { id: "data", name: "Data", icon: BarChart3, price: "29", color: "text-cyan-500" },
  { id: "support", name: "Support", icon: HeadphonesIcon, price: "29", color: "text-pink-500" },
  { id: "governance", name: "Gouvernance", icon: Settings, price: "19", color: "text-gray-500" },
];

export function Pricing() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return (
    <section id="pricing" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            {t("landing.navbar.pricing")}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {isEn ? "Your Digital Company, Your Way" : "Votre entreprise digitale, à votre image"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isEn 
              ? "Choose the full package or only the departments you need. Premium competence, simple pricing."
              : "Choisissez le package complet ou uniquement les départements dont vous avez besoin. Compétence premium, tarification simple."
            }
          </p>
        </div>

        {/* Main Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          
          {/* Full Company Plan */}
          <Card variant="gradient" className="relative overflow-hidden border-2 border-primary/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge variant="gradient" className="px-4 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                {isEn ? "Best Value" : "Meilleur rapport qualité-prix"}
              </Badge>
            </div>
            <CardHeader className="text-center pt-10 pb-2">
              <div className="mx-auto p-3 rounded-xl bg-gradient-to-br from-primary to-accent w-fit mb-4">
                <Crown className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Full Company</CardTitle>
              <CardDescription className="text-base">
                {isEn 
                  ? "The complete digital enterprise. All departments included."
                  : "L'entreprise digitale complète. Tous les départements inclus."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-5xl font-bold">299€</span>
                <span className="text-muted-foreground">/{isEn ? "month" : "mois"}</span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {isEn ? "Instead of 301€ separately" : "Au lieu de 301€ séparément"}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {SERVICE_MODULES.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div 
                      key={service.id}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/5"
                    >
                      <Icon className={cn("w-4 h-4", service.color)} />
                      <span className="text-xs font-medium">{service.name}</span>
                    </div>
                  );
                })}
              </div>

              <ul className="space-y-2 mb-8 text-left">
                {[
                  isEn ? "All 9 departments" : "Les 9 départements",
                  isEn ? "Unlimited sites" : "Sites illimités",
                  isEn ? "Full automation" : "Automatisation complète",
                  isEn ? "Executive briefs" : "Briefs exécutifs",
                  isEn ? "Priority support" : "Support prioritaire",
                  isEn ? "White-label reports" : "Rapports marque blanche",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/onboarding">
                <Button variant="hero" className="w-full" size="lg">
                  {isEn ? "Start Full Company" : "Démarrer Full Company"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* À la carte Plan */}
          <Card variant="feature" className="relative">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-xl bg-secondary w-fit mb-4">
                <Puzzle className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">À la carte</CardTitle>
              <CardDescription className="text-base">
                {isEn 
                  ? "Choose only the departments you need."
                  : "Choisissez uniquement les départements dont vous avez besoin."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-3xl font-bold text-muted-foreground">{isEn ? "From " : "À partir de "}</span>
                <span className="text-5xl font-bold">19€</span>
                <span className="text-muted-foreground">/{isEn ? "dept/month" : "dept/mois"}</span>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                {isEn 
                  ? "Combine departments as needed. Core OS always included."
                  : "Combinez les départements selon vos besoins. Core OS toujours inclus."
                }
              </p>

              <div className="space-y-2 mb-8">
                {SERVICE_MODULES.slice(0, 5).map((service) => {
                  const Icon = service.icon;
                  return (
                    <div 
                      key={service.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-1.5 rounded-lg bg-background", service.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">{service.name}</span>
                      </div>
                      <span className="text-sm font-bold">{service.price}€</span>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground pt-2">
                  +4 {isEn ? "more departments available" : "autres départements disponibles"}
                </p>
              </div>

              <Link to="/onboarding">
                <Button variant="outline" className="w-full" size="lg">
                  {isEn ? "Build Your Package" : "Composer votre offre"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Core OS Note */}
        <div className="max-w-3xl mx-auto">
          <Card variant="feature" className="border-dashed">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Core OS {isEn ? "Always Included" : "toujours inclus"}</p>
                  <p className="text-sm text-muted-foreground">
                    {isEn 
                      ? "Workspace, RBAC, Approval Gate, Audit Log, Scheduler, and Integrations Center come with every plan."
                      : "Workspace, RBAC, Approbations, Audit Log, Planificateur et Centre d'intégrations inclus avec chaque formule."
                    }
                  </p>
                </div>
                <Badge variant="secondary">{isEn ? "Free" : "Gratuit"}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
