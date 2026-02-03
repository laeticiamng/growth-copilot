import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Briefcase, BarChart3, Shield, Puzzle, 
  Code, HeadphonesIcon, Settings, ArrowRight, CheckCircle2,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const DEPARTMENTS = [
  { 
    id: "marketing", 
    icon: TrendingUp, 
    color: "text-blue-500", 
    bgColor: "bg-blue-500/10",
    nameEn: "Marketing",
    nameFr: "Marketing",
    descEn: "SEO, Content, Ads, Social Media, CRO",
    descFr: "SEO, Contenu, Ads, Réseaux sociaux, CRO",
    price: 49,
    features: ["SEO Audit", "Content Calendar", "Ad Optimization", "Social Distribution"]
  },
  { 
    id: "sales", 
    icon: Briefcase, 
    color: "text-green-500", 
    bgColor: "bg-green-500/10",
    nameEn: "Sales",
    nameFr: "Commercial",
    descEn: "Pipeline, Outreach, CRM, Lead Scoring",
    descFr: "Pipeline, Prospection, CRM, Lead Scoring",
    price: 39,
    features: ["Pipeline Review", "Outreach Sequences", "Lead Qualification"]
  },
  { 
    id: "finance", 
    icon: BarChart3, 
    color: "text-yellow-500", 
    bgColor: "bg-yellow-500/10",
    nameEn: "Finance",
    nameFr: "Finance",
    descEn: "ROI Tracking, Budget Alerts, Reporting",
    descFr: "Suivi ROI, Alertes budget, Reporting",
    price: 29,
    features: ["ROI Summaries", "Budget Alerts", "Monthly Reports"]
  },
  { 
    id: "security", 
    icon: Shield, 
    color: "text-red-500", 
    bgColor: "bg-red-500/10",
    nameEn: "Security",
    nameFr: "Sécurité",
    descEn: "Access Review, Compliance, Audit Logs",
    descFr: "Revue des accès, Conformité, Audit logs",
    price: 29,
    features: ["Access Review", "Secrets Hygiene", "Compliance Checks"]
  },
  { 
    id: "product", 
    icon: Puzzle, 
    color: "text-purple-500", 
    bgColor: "bg-purple-500/10",
    nameEn: "Product",
    nameFr: "Produit",
    descEn: "Roadmap, OKRs, Prioritization",
    descFr: "Roadmap, OKRs, Priorisation",
    price: 39,
    features: ["Roadmap Planning", "OKR Drafts", "Priority Scoring"]
  },
  { 
    id: "engineering", 
    icon: Code, 
    color: "text-orange-500", 
    bgColor: "bg-orange-500/10",
    nameEn: "Engineering",
    nameFr: "Ingénierie",
    descEn: "Release Gates, QA, Delivery Health",
    descFr: "Release Gates, QA, Santé delivery",
    price: 39,
    features: ["Release Gates", "QA Summaries", "Delivery Reports"]
  },
  { 
    id: "data", 
    icon: BarChart3, 
    color: "text-cyan-500", 
    bgColor: "bg-cyan-500/10",
    nameEn: "Data",
    nameFr: "Data",
    descEn: "Analytics, Funnels, Cohorts",
    descFr: "Analytics, Funnels, Cohortes",
    price: 29,
    features: ["Funnel Diagnostics", "Cohort Analysis", "Tracking Setup"]
  },
  { 
    id: "support", 
    icon: HeadphonesIcon, 
    color: "text-pink-500", 
    bgColor: "bg-pink-500/10",
    nameEn: "Support",
    nameFr: "Support",
    descEn: "Tickets, Knowledge Base, Reviews",
    descFr: "Tickets, Base de connaissances, Avis",
    price: 29,
    features: ["Ticket Triage", "KB Updates", "Review Management"]
  },
  { 
    id: "governance", 
    icon: Settings, 
    color: "text-gray-500", 
    bgColor: "bg-gray-500/10",
    nameEn: "Governance",
    nameFr: "Gouvernance",
    descEn: "Policies, IT Hygiene, Access Control",
    descFr: "Politiques, Hygiène IT, Contrôle d'accès",
    price: 19,
    features: ["Policy Management", "IT Hygiene", "Access Governance"]
  },
];

export function Services() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const totalPrice = DEPARTMENTS.reduce((sum, d) => sum + d.price, 0);

  return (
    <section id="departments" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            <Building2 className="w-3 h-3 mr-1" />
            {isEn ? "Modular Departments" : "Départements modulaires"}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {isEn ? "Your company, your way" : "Votre entreprise, à votre façon"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isEn 
              ? "Choose the Full Company for everything, or select only the departments you need. Core OS is always included."
              : "Choisissez Full Company pour tout avoir, ou sélectionnez uniquement les départements dont vous avez besoin. Le Core OS est toujours inclus."
            }
          </p>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {DEPARTMENTS.map((dept, index) => {
            const Icon = dept.icon;
            return (
              <Card 
                key={dept.id}
                variant="feature"
                className="group fade-in-up hover:border-primary/30 transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-xl", dept.bgColor)}>
                      <Icon className={cn("w-6 h-6", dept.color)} />
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {dept.price}€/mo
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {isEn ? dept.nameEn : dept.nameFr}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isEn ? dept.descEn : dept.descFr}
                  </p>
                  
                  <div className="space-y-1">
                    {dept.features.slice(0, 3).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Core OS Highlight */}
        <Card variant="gradient" className="max-w-3xl mx-auto border-2 border-primary/20 mb-12">
          <CardContent className="p-6 text-center">
            <Badge variant="gradient" className="mb-4">
              {isEn ? "Always Included" : "Toujours inclus"}
            </Badge>
            <h3 className="text-xl font-bold mb-2">Core OS</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isEn 
                ? "Workspace, RBAC, Approval Gate, Audit Logs, Scheduler, Integrations Center — included with every plan at no extra cost."
                : "Workspace, RBAC, Approbations, Audit Logs, Planificateur, Centre d'intégrations — inclus avec chaque formule sans frais supplémentaires."
              }
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              {["Workspace", "RBAC", "Approvals", "Audit Log", "Scheduler", "Integrations"].map((item) => (
                <span key={item} className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {isEn 
              ? `All 9 departments separately: ${totalPrice}€/mo — or get Full Company for just 299€/mo`
              : `Les 9 départements séparément : ${totalPrice}€/mois — ou optez pour Full Company à seulement 299€/mois`
            }
          </p>
          <Link to="/onboarding">
            <Button variant="hero" size="lg">
              {isEn ? "Build Your Package" : "Composer votre offre"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
