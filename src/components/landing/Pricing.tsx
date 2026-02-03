import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, ArrowRight, Crown, Puzzle, TrendingUp, Briefcase, BarChart3, 
  Shield, Code, HeadphonesIcon, Settings, Sparkles, Users, Bot
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Service modules with detailed AI employee roster
const SERVICE_MODULES = [
  { 
    id: "marketing", 
    name: "Marketing", 
    icon: TrendingUp, 
    price: "1 900", 
    color: "text-blue-500",
    employees: 5,
    roles: ["Directeur Marketing IA", "SEO Strategist", "Content Manager", "Ads Optimizer", "Social Media Manager"]
  },
  { 
    id: "sales", 
    name: "Commercial", 
    icon: Briefcase, 
    price: "1 900", 
    color: "text-green-500",
    employees: 4,
    roles: ["Directeur Commercial IA", "Lead Qualifier", "Sales Closer", "Account Manager"]
  },
  { 
    id: "finance", 
    name: "Finance", 
    icon: BarChart3, 
    price: "1 900", 
    color: "text-yellow-500",
    employees: 3,
    roles: ["DAF IA", "Comptable Analytique", "Contrôleur de Gestion"]
  },
  { 
    id: "security", 
    name: "Sécurité", 
    icon: Shield, 
    price: "1 900", 
    color: "text-red-500",
    employees: 3,
    roles: ["RSSI IA", "Compliance Officer", "Auditeur Sécurité"]
  },
  { 
    id: "product", 
    name: "Produit", 
    icon: Puzzle, 
    price: "1 900", 
    color: "text-purple-500",
    employees: 4,
    roles: ["CPO IA", "Product Manager", "UX Researcher", "Product Analyst"]
  },
  { 
    id: "engineering", 
    name: "Ingénierie", 
    icon: Code, 
    price: "1 900", 
    color: "text-orange-500",
    employees: 5,
    roles: ["CTO IA", "Lead Developer", "DevOps Engineer", "QA Specialist", "Technical Writer"]
  },
  { 
    id: "data", 
    name: "Data", 
    icon: BarChart3, 
    price: "1 900", 
    color: "text-cyan-500",
    employees: 4,
    roles: ["CDO IA", "Data Engineer", "Data Analyst", "ML Engineer"]
  },
  { 
    id: "support", 
    name: "Support", 
    icon: HeadphonesIcon, 
    price: "1 900", 
    color: "text-pink-500",
    employees: 3,
    roles: ["Head of Support IA", "Customer Success Manager", "Technical Support"]
  },
  { 
    id: "governance", 
    name: "Gouvernance", 
    icon: Settings, 
    price: "1 900", 
    color: "text-gray-500",
    employees: 3,
    roles: ["Chief of Staff IA", "Project Manager", "Operations Analyst"]
  },
];

// Calculate totals
const TOTAL_EMPLOYEES = SERVICE_MODULES.reduce((sum, s) => sum + s.employees, 0);
const TOTAL_SEPARATE_PRICE = SERVICE_MODULES.length * 1900;

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
            {isEn ? "Your AI Workforce, Ready to Deploy" : "Votre équipe IA, prête à déployer"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isEn 
              ? `${TOTAL_EMPLOYEES} AI employees across 9 departments. Premium expertise, instant deployment.`
              : `${TOTAL_EMPLOYEES} employés IA répartis dans 9 départements. Expertise premium, déploiement instantané.`
            }
          </p>
        </div>

        {/* Main Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          
          {/* Full Company Plan */}
          <Card variant="gradient" className="relative overflow-hidden border-2 border-primary/30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
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
                  ? "The complete AI enterprise. All departments, all employees."
                  : "L'entreprise IA complète. Tous les départements, tous les employés."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <span className="text-5xl font-bold">9 000€</span>
                <span className="text-muted-foreground">/{isEn ? "month" : "mois"}</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="secondary" className="text-sm">
                  <Users className="w-3 h-3 mr-1" />
                  {TOTAL_EMPLOYEES} {isEn ? "AI Employees" : "Employés IA"}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {isEn ? "9 Departments" : "9 Départements"}
                </Badge>
              </div>

              <p className="text-sm text-green-600 dark:text-green-400 mb-6">
                {isEn 
                  ? `Save ${(TOTAL_SEPARATE_PRICE - 9000).toLocaleString()}€/month vs à la carte`
                  : `Économisez ${(TOTAL_SEPARATE_PRICE - 9000).toLocaleString()}€/mois vs à la carte`
                }
              </p>

              {/* Employee Grid by Department */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {SERVICE_MODULES.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div 
                      key={service.id}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <Icon className={cn("w-4 h-4", service.color)} />
                      <span className="text-xs font-medium">{service.name}</span>
                      <span className="text-xs text-muted-foreground">{service.employees} <Bot className="w-3 h-3 inline" /></span>
                    </div>
                  );
                })}
              </div>

              <ul className="space-y-2 mb-8 text-left">
                {[
                  isEn ? `${TOTAL_EMPLOYEES} AI employees included` : `${TOTAL_EMPLOYEES} employés IA inclus`,
                  isEn ? "All 9 departments" : "Les 9 départements",
                  isEn ? "Unlimited sites & projects" : "Sites & projets illimités",
                  isEn ? "Full automation & autopilot" : "Automatisation complète & autopilot",
                  isEn ? "Executive voice briefings" : "Briefs exécutifs vocaux",
                  isEn ? "Dedicated success manager" : "Success manager dédié",
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
                  {isEn ? "Deploy Full Company" : "Déployer Full Company"}
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
                  ? "Choose only the departments you need. Scale as you grow."
                  : "Choisissez uniquement les départements dont vous avez besoin. Évoluez selon votre croissance."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <span className="text-5xl font-bold">1 900€</span>
                <span className="text-muted-foreground">/{isEn ? "dept/month" : "dept/mois"}</span>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                {isEn 
                  ? "3-5 AI employees per department. Core OS always included free."
                  : "3-5 employés IA par département. Core OS toujours inclus gratuitement."
                }
              </p>

              {/* Department List with Employee Details */}
              <div className="space-y-2 mb-6 max-h-80 overflow-y-auto pr-2">
                {SERVICE_MODULES.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div 
                      key={service.id}
                      className="group p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-1.5 rounded-lg bg-background", service.color)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-medium text-sm">{service.name}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Bot className="w-3 h-3" />
                              <span>{service.employees} {isEn ? "employees" : "employés"}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-bold">{service.price}€</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {service.roles.map((role) => (
                          <Badge 
                            key={role} 
                            variant="outline" 
                            className="text-[10px] px-1.5 py-0 opacity-70 group-hover:opacity-100 transition-opacity"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link to="/onboarding">
                <Button variant="outline" className="w-full" size="lg">
                  {isEn ? "Build Your Team" : "Composer votre équipe"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Core OS Note */}
        <div className="max-w-4xl mx-auto">
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
                      ? "Workspace, RBAC, Approval Gate, Audit Log, AI Scheduler, Voice Commands, and Integrations Hub come with every plan."
                      : "Workspace, RBAC, Approbations, Audit Log, Planificateur IA, Commandes vocales et Hub d'intégrations inclus avec chaque formule."
                    }
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm px-3">
                  {isEn ? "Free Forever" : "Gratuit à vie"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ROI Calculator Teaser */}
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            {isEn 
              ? `A traditional team of ${TOTAL_EMPLOYEES} employees costs ~${(TOTAL_EMPLOYEES * 4500).toLocaleString()}€/month. You save ${((TOTAL_EMPLOYEES * 4500) - 9000).toLocaleString()}€/month.`
              : `Une équipe traditionnelle de ${TOTAL_EMPLOYEES} employés coûte ~${(TOTAL_EMPLOYEES * 4500).toLocaleString()}€/mois. Vous économisez ${((TOTAL_EMPLOYEES * 4500) - 9000).toLocaleString()}€/mois.`
            }
          </p>
          <p className="text-xs text-muted-foreground">
            {isEn 
              ? "Based on average French salary cost of 4,500€/month per employee including charges."
              : "Basé sur un coût salarial moyen français de 4 500€/mois par employé charges comprises."
            }
          </p>
        </div>
      </div>
    </section>
  );
}
