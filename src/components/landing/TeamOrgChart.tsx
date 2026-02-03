import { useTranslation } from "react-i18next";
import { Bot, Brain, Search, FileText, BarChart3, Megaphone, Shield, Zap, PenTool, Target, Share2, Music, Eye, CheckCircle, Users, Building2, Briefcase, Code, HeadphonesIcon, Database, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Department structure with employees by department
const DEPARTMENTS_FR = [
  {
    id: "direction",
    name: "Direction",
    color: "from-primary to-primary/60",
    icon: Brain,
    employees: [
      { name: "Sophie Marchand", role: "Chief Growth Officer", description: "Orchestre tous les agents et priorise les actions selon l'impact business (ICE)" },
    ]
  },
  {
    id: "marketing",
    name: "Marketing",
    color: "from-blue-500 to-blue-400",
    icon: Megaphone,
    employees: [
      { name: "Lucas Bernier", role: "Analytics Guardian", description: "Synchronise GSC/GA4, surveille les KPIs et génère les rapports" },
      { name: "Emma Lefebvre", role: "SEO Tech Auditor", description: "Crawle le site, identifie les erreurs techniques et génère les correctifs" },
      { name: "Thomas Duval", role: "Content Strategist", description: "Analyse les mots-clés, crée les clusters et planifie le calendrier éditorial" },
      { name: "Léa Fontaine", role: "Copywriting Agent", description: "Rédige les textes conversion-first avec frameworks AIDA/PAS" },
      { name: "Marc Rousseau", role: "Ads Optimizer", description: "Optimise les campagnes SEA/YouTube avec contrôle budget" },
    ]
  },
  {
    id: "commercial",
    name: "Commercial",
    color: "from-green-500 to-green-400",
    icon: Briefcase,
    employees: [
      { name: "Alexandre Petit", role: "Directeur Commercial IA", description: "Définit la stratégie commerciale et pilote la performance" },
      { name: "Marie Laurent", role: "Lead Qualifier", description: "Qualifie les leads entrants et priorise les opportunités" },
      { name: "Julien Morel", role: "Sales Closer", description: "Accompagne les prospects jusqu'à la signature" },
      { name: "Camille Roux", role: "Account Manager", description: "Fidélise les clients et détecte les opportunités d'upsell" },
    ]
  },
  {
    id: "finance",
    name: "Finance",
    color: "from-yellow-500 to-yellow-400",
    icon: BarChart3,
    employees: [
      { name: "François Martin", role: "DAF IA", description: "Supervise la santé financière et les prévisions" },
      { name: "Isabelle Durand", role: "Comptable Analytique", description: "Analyse les coûts et la rentabilité par projet" },
      { name: "Paul Leroy", role: "Contrôleur de Gestion", description: "Pilote les budgets et les écarts" },
    ]
  },
  {
    id: "security",
    name: "Sécurité",
    color: "from-red-500 to-red-400",
    icon: Shield,
    employees: [
      { name: "Pierre Lambert", role: "RSSI IA", description: "Garantit la sécurité des systèmes et des données" },
      { name: "Claire Dubois", role: "Compliance Officer", description: "Veille à la conformité RGPD et réglementaire" },
      { name: "Nicolas Bernard", role: "Auditeur Sécurité", description: "Audite et renforce les processus de sécurité" },
    ]
  },
  {
    id: "product",
    name: "Produit",
    color: "from-purple-500 to-purple-400",
    icon: Target,
    employees: [
      { name: "Amélie Girard", role: "CPO IA", description: "Définit la vision produit et la roadmap stratégique" },
      { name: "Vincent Mercier", role: "Product Manager", description: "Gère le backlog et priorise les fonctionnalités" },
      { name: "Laura Simon", role: "UX Researcher", description: "Analyse les comportements utilisateurs et optimise l'expérience" },
      { name: "Maxime Faure", role: "Product Analyst", description: "Mesure l'adoption et l'impact des features" },
    ]
  },
  {
    id: "engineering",
    name: "Ingénierie",
    color: "from-orange-500 to-orange-400",
    icon: Code,
    employees: [
      { name: "Antoine Legrand", role: "CTO IA", description: "Définit l'architecture technique et les standards" },
      { name: "Sophie Blanc", role: "Lead Developer", description: "Supervise le développement et les revues de code" },
      { name: "Romain Fournier", role: "DevOps Engineer", description: "Automatise les déploiements et surveille l'infrastructure" },
      { name: "Élise Perrin", role: "QA Specialist", description: "Assure la qualité et les tests automatisés" },
      { name: "Thibault Robert", role: "Technical Writer", description: "Documente les APIs et les processus techniques" },
    ]
  },
  {
    id: "data",
    name: "Data",
    color: "from-cyan-500 to-cyan-400",
    icon: Database,
    employees: [
      { name: "Chloé Martin", role: "CDO IA", description: "Définit la stratégie data et la gouvernance" },
      { name: "Hugo Dupont", role: "Data Engineer", description: "Construit les pipelines et l'infrastructure data" },
      { name: "Julie Moreau", role: "Data Analyst", description: "Analyse les données et génère les insights business" },
      { name: "Lucas André", role: "ML Engineer", description: "Développe et déploie les modèles prédictifs" },
    ]
  },
  {
    id: "support",
    name: "Support",
    color: "from-pink-500 to-pink-400",
    icon: HeadphonesIcon,
    employees: [
      { name: "Marine Chevalier", role: "Head of Support IA", description: "Pilote l'expérience client et la satisfaction" },
      { name: "Thomas Gérard", role: "Customer Success Manager", description: "Accompagne les clients vers leurs objectifs" },
      { name: "Sarah Lemoine", role: "Technical Support", description: "Résout les problèmes techniques en temps réel" },
    ]
  },
  {
    id: "governance",
    name: "Gouvernance",
    color: "from-gray-500 to-gray-400",
    icon: Settings,
    employees: [
      { name: "Philippe Renaud", role: "Chief of Staff IA", description: "Coordonne les opérations transverses" },
      { name: "Nathalie Vincent", role: "Project Manager", description: "Gère les projets stratégiques et les deadlines" },
      { name: "David Gauthier", role: "Operations Analyst", description: "Optimise les processus et la performance opérationnelle" },
    ]
  },
];

const DEPARTMENTS_EN = [
  {
    id: "direction",
    name: "Leadership",
    color: "from-primary to-primary/60",
    icon: Brain,
    employees: [
      { name: "Sophie Marchand", role: "Chief Growth Officer", description: "Orchestrates all agents and prioritizes actions by business impact (ICE)" },
    ]
  },
  {
    id: "marketing",
    name: "Marketing",
    color: "from-blue-500 to-blue-400",
    icon: Megaphone,
    employees: [
      { name: "Lucas Bernier", role: "Analytics Guardian", description: "Syncs GSC/GA4, monitors KPIs and generates reports" },
      { name: "Emma Lefebvre", role: "SEO Tech Auditor", description: "Crawls sites, identifies technical errors and generates fixes" },
      { name: "Thomas Duval", role: "Content Strategist", description: "Analyzes keywords, creates clusters and plans editorial calendar" },
      { name: "Léa Fontaine", role: "Copywriting Agent", description: "Writes conversion-first copy with AIDA/PAS frameworks" },
      { name: "Marc Rousseau", role: "Ads Optimizer", description: "Optimizes SEA/YouTube campaigns with budget control" },
    ]
  },
  {
    id: "commercial",
    name: "Sales",
    color: "from-green-500 to-green-400",
    icon: Briefcase,
    employees: [
      { name: "Alexandre Petit", role: "AI Sales Director", description: "Defines sales strategy and drives performance" },
      { name: "Marie Laurent", role: "Lead Qualifier", description: "Qualifies inbound leads and prioritizes opportunities" },
      { name: "Julien Morel", role: "Sales Closer", description: "Guides prospects through to signature" },
      { name: "Camille Roux", role: "Account Manager", description: "Retains clients and detects upsell opportunities" },
    ]
  },
  {
    id: "finance",
    name: "Finance",
    color: "from-yellow-500 to-yellow-400",
    icon: BarChart3,
    employees: [
      { name: "François Martin", role: "AI CFO", description: "Oversees financial health and forecasting" },
      { name: "Isabelle Durand", role: "Cost Accountant", description: "Analyzes costs and project profitability" },
      { name: "Paul Leroy", role: "Controller", description: "Manages budgets and variance analysis" },
    ]
  },
  {
    id: "security",
    name: "Security",
    color: "from-red-500 to-red-400",
    icon: Shield,
    employees: [
      { name: "Pierre Lambert", role: "AI CISO", description: "Ensures system and data security" },
      { name: "Claire Dubois", role: "Compliance Officer", description: "Ensures GDPR and regulatory compliance" },
      { name: "Nicolas Bernard", role: "Security Auditor", description: "Audits and strengthens security processes" },
    ]
  },
  {
    id: "product",
    name: "Product",
    color: "from-purple-500 to-purple-400",
    icon: Target,
    employees: [
      { name: "Amélie Girard", role: "AI CPO", description: "Defines product vision and strategic roadmap" },
      { name: "Vincent Mercier", role: "Product Manager", description: "Manages backlog and prioritizes features" },
      { name: "Laura Simon", role: "UX Researcher", description: "Analyzes user behavior and optimizes experience" },
      { name: "Maxime Faure", role: "Product Analyst", description: "Measures feature adoption and impact" },
    ]
  },
  {
    id: "engineering",
    name: "Engineering",
    color: "from-orange-500 to-orange-400",
    icon: Code,
    employees: [
      { name: "Antoine Legrand", role: "AI CTO", description: "Defines technical architecture and standards" },
      { name: "Sophie Blanc", role: "Lead Developer", description: "Oversees development and code reviews" },
      { name: "Romain Fournier", role: "DevOps Engineer", description: "Automates deployments and monitors infrastructure" },
      { name: "Élise Perrin", role: "QA Specialist", description: "Ensures quality and automated testing" },
      { name: "Thibault Robert", role: "Technical Writer", description: "Documents APIs and technical processes" },
    ]
  },
  {
    id: "data",
    name: "Data",
    color: "from-cyan-500 to-cyan-400",
    icon: Database,
    employees: [
      { name: "Chloé Martin", role: "AI CDO", description: "Defines data strategy and governance" },
      { name: "Hugo Dupont", role: "Data Engineer", description: "Builds pipelines and data infrastructure" },
      { name: "Julie Moreau", role: "Data Analyst", description: "Analyzes data and generates business insights" },
      { name: "Lucas André", role: "ML Engineer", description: "Develops and deploys predictive models" },
    ]
  },
  {
    id: "support",
    name: "Support",
    color: "from-pink-500 to-pink-400",
    icon: HeadphonesIcon,
    employees: [
      { name: "Marine Chevalier", role: "AI Head of Support", description: "Drives customer experience and satisfaction" },
      { name: "Thomas Gérard", role: "Customer Success Manager", description: "Helps clients achieve their goals" },
      { name: "Sarah Lemoine", role: "Technical Support", description: "Resolves technical issues in real-time" },
    ]
  },
  {
    id: "governance",
    name: "Governance",
    color: "from-gray-500 to-gray-400",
    icon: Settings,
    employees: [
      { name: "Philippe Renaud", role: "AI Chief of Staff", description: "Coordinates cross-functional operations" },
      { name: "Nathalie Vincent", role: "Project Manager", description: "Manages strategic projects and deadlines" },
      { name: "David Gauthier", role: "Operations Analyst", description: "Optimizes processes and operational performance" },
    ]
  },
];

export function TeamOrgChart() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";
  
  const departments = isEn ? DEPARTMENTS_EN : DEPARTMENTS_FR;
  const totalEmployees = departments.reduce((sum, dept) => sum + dept.employees.length, 0);
  const totalDepartments = departments.length;

  const labels = isEn 
    ? { 
        team: "AI Workforce", 
        title: "Your Complete AI Team", 
        subtitle: `${totalEmployees} premium AI employees across ${totalDepartments} departments. Enterprise-grade expertise, instant deployment.`,
        pricing: "Full Company: 9,000€/month • Per Department: 1,900€/month",
        availability: "Availability", 
        employees: "AI Employees", 
        responseTime: "Response time", 
        savings: "Monthly Savings",
        perEmployee: "per employee/month",
        vsTrad: "vs traditional team"
      }
    : { 
        team: "Équipe IA", 
        title: "Votre équipe IA complète", 
        subtitle: `${totalEmployees} employés IA premium répartis dans ${totalDepartments} départements. Expertise entreprise, déploiement instantané.`,
        pricing: "Full Company : 9 000€/mois • Par département : 1 900€/mois",
        availability: "Disponibilité", 
        employees: "Employés IA", 
        responseTime: "Temps de réponse", 
        savings: "Économies mensuelles",
        perEmployee: "par employé/mois",
        vsTrad: "vs équipe traditionnelle"
      };

  // Separate leadership from other departments
  const leadership = departments.find(d => d.id === "direction");
  const otherDepartments = departments.filter(d => d.id !== "direction");

  return (
    <section id="services" className="py-20 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Bot className="w-3 h-3 mr-1" />
            {labels.team}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {labels.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-4">
            {labels.subtitle}
          </p>
          <Badge variant="gradient" className="text-sm px-4 py-1.5">
            {labels.pricing}
          </Badge>
        </div>

        {/* Leadership - Sophie */}
        {leadership && (
          <div className="flex justify-center mb-8">
            <Card className="max-w-lg w-full relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${leadership.color} flex items-center justify-center flex-shrink-0`}>
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{leadership.employees[0].name}</h3>
                      <Badge variant="gradient" className="text-xs">{isEn ? "CEO of your AI" : "PDG de votre IA"}</Badge>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                      {leadership.employees[0].role}
                    </span>
                    <p className="text-muted-foreground text-sm mt-2">
                      {leadership.employees[0].description}
                    </p>
                  </div>
                </div>
                {/* Pulse animation */}
                <div className="absolute top-4 right-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Connection line */}
        <div className="hidden md:block w-px h-8 bg-border mx-auto" />

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherDepartments.map((dept) => {
            const Icon = dept.icon;
            return (
              <Card key={dept.id} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-5">
                  {/* Department Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${dept.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{dept.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {dept.employees.length} {isEn ? "employees" : "employés"}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      1 900€
                    </Badge>
                  </div>

                  {/* Employees List */}
                  <div className="space-y-3">
                    {dept.employees.map((employee, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${dept.color} flex items-center justify-center flex-shrink-0 text-white text-xs font-medium`}>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.role}</p>
                        </div>
                        {/* Active indicator */}
                        <span className="relative flex h-2 w-2 mt-1">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-r ${dept.color} opacity-75`} />
                          <span className={`relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r ${dept.color}`} />
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { value: "24/7", label: labels.availability },
            { value: totalEmployees.toString(), label: labels.employees },
            { value: "<1s", label: labels.responseTime },
            { value: `${((totalEmployees * 4500) - 9000).toLocaleString()}€`, label: labels.savings },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-4 rounded-lg bg-background/50 border border-border/50"
            >
              <div className="text-2xl md:text-3xl font-bold text-gradient">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              {i === 3 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {labels.vsTrad}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cost comparison note */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            {isEn 
              ? `A traditional team of ${totalEmployees} employees costs ~${(totalEmployees * 4500).toLocaleString()}€/month. With Full Company at 9,000€/month, you save ${((totalEmployees * 4500) - 9000).toLocaleString()}€/month.`
              : `Une équipe traditionnelle de ${totalEmployees} employés coûte ~${(totalEmployees * 4500).toLocaleString()}€/mois. Avec Full Company à 9 000€/mois, vous économisez ${((totalEmployees * 4500) - 9000).toLocaleString()}€/mois.`
            }
          </p>
        </div>
      </div>
    </section>
  );
}
