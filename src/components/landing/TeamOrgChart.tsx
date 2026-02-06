import { useTranslation } from "react-i18next";
import { Bot, Brain, Search, FileText, BarChart3, Megaphone, Shield, Zap, PenTool, Target, Share2, Music, Eye, CheckCircle, Users, Building2, Briefcase, Code, HeadphonesIcon, Database, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Department data uses lang-keyed objects instead of isEn ternary
interface Employee { name: string; role: string; description: Record<string, string>; }
interface Department { id: string; name: Record<string, string>; color: string; icon: any; employees: Employee[]; }

const DEPARTMENTS: Department[] = [
  {
    id: "direction", name: { en: "Leadership", fr: "Direction" }, color: "from-primary to-primary/60", icon: Brain,
    employees: [
      { name: "Sophie Marchand", role: "Chief Growth Officer", description: { en: "Orchestrates all agents and prioritizes actions by business impact (ICE)", fr: "Orchestre tous les agents et priorise les actions selon l'impact business (ICE)" } },
      { name: "Jean-Michel Fournier", role: "Quality & Compliance Officer", description: { en: "Validates each deliverable to ensure ethical and technical compliance", fr: "Valide chaque livrable pour assurer la conformité éthique et technique" } },
    ]
  },
  {
    id: "marketing", name: { en: "Marketing", fr: "Marketing" }, color: "from-blue-500 to-blue-400", icon: Megaphone,
    employees: [
      { name: "Lucas Bernier", role: "Analytics Guardian", description: { en: "Syncs GSC/GA4, monitors KPIs and generates reports", fr: "Synchronise GSC/GA4, surveille les KPIs et génère les rapports" } },
      { name: "Emma Lefebvre", role: "SEO Tech Auditor", description: { en: "Crawls sites, identifies technical errors and generates fixes", fr: "Crawle le site, identifie les erreurs techniques et génère les correctifs" } },
      { name: "Thomas Duval", role: "Content Strategist", description: { en: "Analyzes keywords, creates clusters and plans editorial calendar", fr: "Analyse les mots-clés, crée les clusters et planifie le calendrier éditorial" } },
      { name: "Léa Fontaine", role: "Copywriting Agent", description: { en: "Writes conversion-first copy with AIDA/PAS frameworks", fr: "Rédige les textes conversion-first avec frameworks AIDA/PAS" } },
      { name: "Marc Rousseau", role: "Ads Optimizer", description: { en: "Optimizes SEA/YouTube campaigns with budget control", fr: "Optimise les campagnes SEA/YouTube avec contrôle budget" } },
    ]
  },
  {
    id: "commercial", name: { en: "Sales", fr: "Commercial" }, color: "from-green-500 to-green-400", icon: Briefcase,
    employees: [
      { name: "Alexandre Petit", role: "AI Sales Director", description: { en: "Defines sales strategy and drives performance", fr: "Définit la stratégie commerciale et pilote la performance" } },
      { name: "Marie Laurent", role: "Lead Qualifier", description: { en: "Qualifies inbound leads and prioritizes opportunities", fr: "Qualifie les leads entrants et priorise les opportunités" } },
      { name: "Julien Morel", role: "Sales Closer", description: { en: "Guides prospects through to signature", fr: "Accompagne les prospects jusqu'à la signature" } },
      { name: "Camille Roux", role: "Account Manager", description: { en: "Retains clients and detects upsell opportunities", fr: "Fidélise les clients et détecte les opportunités d'upsell" } },
    ]
  },
  {
    id: "finance", name: { en: "Finance", fr: "Finance" }, color: "from-yellow-500 to-yellow-400", icon: BarChart3,
    employees: [
      { name: "François Martin", role: "AI CFO", description: { en: "Oversees financial health and forecasting", fr: "Supervise la santé financière et les prévisions" } },
      { name: "Isabelle Durand", role: "Cost Accountant", description: { en: "Analyzes costs and project profitability", fr: "Analyse les coûts et la rentabilité par projet" } },
      { name: "Paul Leroy", role: "Controller", description: { en: "Manages budgets and variance analysis", fr: "Pilote les budgets et les écarts" } },
    ]
  },
  {
    id: "security", name: { en: "Security", fr: "Sécurité" }, color: "from-red-500 to-red-400", icon: Shield,
    employees: [
      { name: "Pierre Lambert", role: "AI CISO", description: { en: "Ensures system and data security", fr: "Garantit la sécurité des systèmes et des données" } },
      { name: "Claire Dubois", role: "Compliance Officer", description: { en: "Ensures GDPR and regulatory compliance", fr: "Veille à la conformité RGPD et réglementaire" } },
      { name: "Nicolas Bernard", role: "Security Auditor", description: { en: "Audits and strengthens security processes", fr: "Audite et renforce les processus de sécurité" } },
    ]
  },
  {
    id: "product", name: { en: "Product", fr: "Produit" }, color: "from-purple-500 to-purple-400", icon: Target,
    employees: [
      { name: "Amélie Girard", role: "AI CPO", description: { en: "Defines product vision and strategic roadmap", fr: "Définit la vision produit et la roadmap stratégique" } },
      { name: "Vincent Mercier", role: "Product Manager", description: { en: "Manages backlog and prioritizes features", fr: "Gère le backlog et priorise les fonctionnalités" } },
      { name: "Laura Simon", role: "UX Researcher", description: { en: "Analyzes user behavior and optimizes experience", fr: "Analyse les comportements utilisateurs et optimise l'expérience" } },
      { name: "Maxime Faure", role: "Product Analyst", description: { en: "Measures feature adoption and impact", fr: "Mesure l'adoption et l'impact des features" } },
    ]
  },
  {
    id: "engineering", name: { en: "Engineering", fr: "Ingénierie" }, color: "from-orange-500 to-orange-400", icon: Code,
    employees: [
      { name: "Antoine Legrand", role: "AI CTO", description: { en: "Defines technical architecture and standards", fr: "Définit l'architecture technique et les standards" } },
      { name: "Sophie Blanc", role: "Lead Developer", description: { en: "Oversees development and code reviews", fr: "Supervise le développement et les revues de code" } },
      { name: "Romain Fournier", role: "DevOps Engineer", description: { en: "Automates deployments and monitors infrastructure", fr: "Automatise les déploiements et surveille l'infrastructure" } },
      { name: "Élise Perrin", role: "QA Specialist", description: { en: "Ensures quality and automated testing", fr: "Assure la qualité et les tests automatisés" } },
      { name: "Thibault Robert", role: "Technical Writer", description: { en: "Documents APIs and technical processes", fr: "Documente les APIs et les processus techniques" } },
    ]
  },
  {
    id: "data", name: { en: "Data", fr: "Data" }, color: "from-cyan-500 to-cyan-400", icon: Database,
    employees: [
      { name: "Chloé Martin", role: "AI CDO", description: { en: "Defines data strategy and governance", fr: "Définit la stratégie data et la gouvernance" } },
      { name: "Hugo Dupont", role: "Data Engineer", description: { en: "Builds pipelines and data infrastructure", fr: "Construit les pipelines et l'infrastructure data" } },
      { name: "Julie Moreau", role: "Data Analyst", description: { en: "Analyzes data and generates business insights", fr: "Analyse les données et génère les insights business" } },
      { name: "Lucas André", role: "ML Engineer", description: { en: "Develops and deploys predictive models", fr: "Développe et déploie les modèles prédictifs" } },
    ]
  },
  {
    id: "support", name: { en: "Support", fr: "Support" }, color: "from-pink-500 to-pink-400", icon: HeadphonesIcon,
    employees: [
      { name: "Marine Chevalier", role: "AI Head of Support", description: { en: "Drives customer experience and satisfaction", fr: "Pilote l'expérience client et la satisfaction" } },
      { name: "Thomas Gérard", role: "Customer Success Manager", description: { en: "Helps clients achieve their goals", fr: "Accompagne les clients vers leurs objectifs" } },
      { name: "Sarah Lemoine", role: "Technical Support", description: { en: "Resolves technical issues in real-time", fr: "Résout les problèmes techniques en temps réel" } },
    ]
  },
  {
    id: "governance", name: { en: "Governance", fr: "Gouvernance" }, color: "from-gray-500 to-gray-400", icon: Settings,
    employees: [
      { name: "Philippe Renaud", role: "AI Chief of Staff", description: { en: "Coordinates cross-functional operations", fr: "Coordonne les opérations transverses" } },
      { name: "Nathalie Vincent", role: "Project Manager", description: { en: "Manages strategic projects and deadlines", fr: "Gère les projets stratégiques et les deadlines" } },
      { name: "David Gauthier", role: "Operations Analyst", description: { en: "Optimizes processes and operational performance", fr: "Optimise les processus et la performance opérationnelle" } },
    ]
  },
  {
    id: "hr", name: { en: "HR", fr: "RH" }, color: "from-indigo-500 to-indigo-400", icon: Users,
    employees: [
      { name: "Céline Hervé", role: "AI HR Director", description: { en: "Leads HR strategy and talent development", fr: "Pilote la stratégie RH et le développement des talents" } },
      { name: "Aurélien Brun", role: "Talent Manager", description: { en: "Manages recruitment and onboarding", fr: "Gère le recrutement et l'onboarding" } },
    ]
  },
  {
    id: "legal", name: { en: "Legal", fr: "Juridique" }, color: "from-slate-500 to-slate-400", icon: Shield,
    employees: [
      { name: "Margaux Picard", role: "AI Legal Director", description: { en: "Oversees contracts and legal compliance", fr: "Supervise les contrats et la conformité légale" } },
    ]
  },
];

export function TeamOrgChart() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  
  const totalEmployees = DEPARTMENTS.reduce((sum, dept) => sum + dept.employees.length, 0);
  const totalDepartments = DEPARTMENTS.filter(d => d.id !== "direction").length;

  const leadership = DEPARTMENTS.find(d => d.id === "direction");
  const otherDepartments = DEPARTMENTS.filter(d => d.id !== "direction");

  return (
    <section id="services" className="py-20 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4"><Bot className="w-3 h-3 mr-1" />{t("landing.orgChart.team")}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("landing.orgChart.title")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-4">
            {t("landing.orgChart.subtitle", { total: totalEmployees, depts: totalDepartments })}
          </p>
          <Badge variant="gradient" className="text-sm px-4 py-1.5">{t("landing.orgChart.pricing")}</Badge>
        </div>

        {leadership && (
          <div className="flex justify-center mb-8">
            <div className="flex flex-col md:flex-row gap-4 max-w-3xl w-full">
              {leadership.employees.map((employee, index) => (
                <Card key={employee.name} className="flex-1 relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${leadership.color} flex items-center justify-center flex-shrink-0`}>
                        <Brain className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-base">{employee.name}</h3>
                          <Badge variant="gradient" className="text-xs">
                            {index === 0 ? t("landing.orgChart.ceoLabel") : t("landing.orgChart.qualityLabel")}
                          </Badge>
                        </div>
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">{employee.role}</span>
                        <p className="text-muted-foreground text-sm mt-2">{employee.description[lang] || employee.description.en}</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {otherDepartments.map((dept) => {
            const Icon = dept.icon;
            return (
              <Card key={dept.id} className="overflow-hidden hover:border-primary/30 transition-colors">
                <div className={`h-1.5 bg-gradient-to-r ${dept.color}`} />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${dept.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{dept.name[lang] || dept.name.en}</h3>
                        <span className="text-xs text-muted-foreground">{dept.employees.length} {t("landing.orgChart.employeesLabel")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {dept.employees.map((emp) => (
                      <div key={emp.name} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{emp.name}</p>
                          <span className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">{emp.role}</span>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{emp.description[lang] || emp.description.en}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: "24/7", label: t("landing.orgChart.availability") },
            { value: String(totalEmployees), label: t("landing.orgChart.aiEmployees") },
            { value: "< 5s", label: t("landing.orgChart.responseTime") },
            { value: `${((totalEmployees * 4500) - 9000).toLocaleString()}€`, label: t("landing.orgChart.savings") },
          ].map((stat) => (
            <Card key={stat.label} className="text-center p-4">
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6 max-w-2xl mx-auto">
          {t("landing.orgChart.costComparison", { total: totalEmployees, cost: (totalEmployees * 4500).toLocaleString(), savings: ((totalEmployees * 4500) - 9000).toLocaleString() })}
        </p>
      </div>
    </section>
  );
}
