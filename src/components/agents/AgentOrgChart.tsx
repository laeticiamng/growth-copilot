import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Brain, 
  Search, 
  FileText, 
  BarChart3, 
  Target, 
  Share2, 
  Eye, 
  Shield, 
  CheckCircle, 
  Zap,
  PenTool,
  Activity,
  Users,
  TrendingUp,
  Building2,
  Briefcase,
  Scale,
  Database,
  Headphones,
  Lock,
  Package,
  Code,
  ChevronDown,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// Department configuration with colors and icons
const DEPARTMENTS = {
  direction: {
    name: "Direction",
    icon: Sparkles,
    color: "from-violet-600 to-purple-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800",
  },
  marketing: {
    name: "Marketing",
    icon: Target,
    color: "from-emerald-600 to-green-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  sales: {
    name: "Ventes",
    icon: Briefcase,
    color: "from-amber-600 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  finance: {
    name: "Finance",
    icon: BarChart3,
    color: "from-blue-600 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  security: {
    name: "Sécurité",
    icon: Shield,
    color: "from-red-600 to-rose-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
  },
  product: {
    name: "Produit",
    icon: Package,
    color: "from-pink-600 to-fuchsia-500",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200 dark:border-pink-800",
  },
  engineering: {
    name: "Engineering",
    icon: Code,
    color: "from-slate-600 to-gray-500",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    borderColor: "border-slate-200 dark:border-slate-800",
  },
  data: {
    name: "Data & Analytics",
    icon: Database,
    color: "from-indigo-600 to-blue-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
  },
  support: {
    name: "Support",
    icon: Headphones,
    color: "from-teal-600 to-cyan-500",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-200 dark:border-teal-800",
  },
  governance: {
    name: "Governance",
    icon: Scale,
    color: "from-yellow-600 to-amber-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  hr: {
    name: "Ressources Humaines",
    icon: Users,
    color: "from-lime-600 to-green-500",
    bgColor: "bg-lime-50 dark:bg-lime-950/30",
    borderColor: "border-lime-200 dark:border-lime-800",
  },
  legal: {
    name: "Juridique",
    icon: FileText,
    color: "from-stone-600 to-neutral-500",
    bgColor: "bg-stone-50 dark:bg-stone-950/30",
    borderColor: "border-stone-200 dark:border-stone-800",
  },
};

// Agent data structure
interface AgentData {
  id: string;
  name: string;
  role: string;
  department: keyof typeof DEPARTMENTS;
  specialty: string;
  icon: React.ComponentType<{ className?: string }>;
  isLeader?: boolean;
}

// Full team of 39 AI agents
const AI_TEAM: AgentData[] = [
  // Direction (2)
  { id: "cgo", name: "Sophie Marchand", role: "Chief Growth Officer", department: "direction", specialty: "Orchestration & Stratégie", icon: Brain, isLeader: true },
  { id: "qco", name: "Jean-Michel Fournier", role: "Quality & Compliance Officer", department: "direction", specialty: "Contrôle Qualité", icon: Shield, isLeader: true },
  
  // Marketing (5)
  { id: "tech_auditor", name: "Emma Lefebvre", role: "SEO Tech Lead", department: "marketing", specialty: "SEO Technique", icon: Search, isLeader: true },
  { id: "keyword_strategist", name: "Thomas Duval", role: "Content Strategist", department: "marketing", specialty: "Stratégie de contenu", icon: Target },
  { id: "content_builder", name: "Léa Fontaine", role: "Copywriter", department: "marketing", specialty: "Copywriting", icon: PenTool },
  { id: "local_optimizer", name: "Antoine Girard", role: "Local SEO Specialist", department: "marketing", specialty: "SEO Local", icon: Target },
  { id: "social_manager", name: "Camille Rousseau", role: "Social Media Manager", department: "marketing", specialty: "Réseaux Sociaux", icon: Share2 },
  
  // Sales (4)
  { id: "offer_architect", name: "David Petit", role: "Sales Director", department: "sales", specialty: "Offres commerciales", icon: Zap, isLeader: true },
  { id: "sales_accelerator", name: "Nicolas Bernard", role: "Sales Representative", department: "sales", specialty: "Ventes", icon: Zap },
  { id: "lifecycle_manager", name: "Claire Dubois", role: "Marketing Automation", department: "sales", specialty: "Automation", icon: Activity },
  { id: "deal_closer", name: "Alexandre Martin", role: "Account Executive", department: "sales", specialty: "Closing", icon: Zap },
  
  // Finance (3)
  { id: "revenue_analyst", name: "Mathilde Legrand", role: "CFO", department: "finance", specialty: "Analyse Revenus", icon: BarChart3, isLeader: true },
  { id: "budget_optimizer", name: "François Mercier", role: "Financial Analyst", department: "finance", specialty: "Budget", icon: BarChart3 },
  { id: "billing_manager", name: "Aurélie Chevalier", role: "Billing Specialist", department: "finance", specialty: "Facturation", icon: FileText },
  
  // Security (3)
  { id: "security_auditor", name: "Julien Moreau", role: "CISO", department: "security", specialty: "Audit Sécurité", icon: Shield, isLeader: true },
  { id: "access_controller", name: "Nathalie Vincent", role: "Access Manager", department: "security", specialty: "Contrôle d'accès", icon: Lock },
  { id: "threat_monitor", name: "Sébastien Blanc", role: "Security Analyst", department: "security", specialty: "Surveillance", icon: Eye },
  
  // Product (4)
  { id: "feature_analyst", name: "Marie Leclerc", role: "Product Manager", department: "product", specialty: "Analyse Produit", icon: Search, isLeader: true },
  { id: "ux_optimizer", name: "Caroline Roux", role: "UX Designer", department: "product", specialty: "UX Design", icon: PenTool },
  { id: "roadmap_planner", name: "Pierre-Antoine Faure", role: "Product Owner", department: "product", specialty: "Roadmap", icon: Target },
  { id: "backlog_manager", name: "Stéphane Garnier", role: "Scrum Master", department: "product", specialty: "Backlog", icon: FileText },
  
  // Engineering (5)
  { id: "code_reviewer", name: "Maxime Perrin", role: "Tech Lead", department: "engineering", specialty: "Code Review", icon: Code, isLeader: true },
  { id: "performance_engineer", name: "Olivier Bonnet", role: "Performance Engineer", department: "engineering", specialty: "Performance", icon: Zap },
  { id: "devops_agent", name: "Laurent Muller", role: "DevOps Engineer", department: "engineering", specialty: "DevOps", icon: Activity },
  { id: "api_integrator", name: "Romain Simon", role: "Integration Specialist", department: "engineering", specialty: "Intégrations", icon: Share2 },
  { id: "testing_agent", name: "Élodie Michel", role: "QA Engineer", department: "engineering", specialty: "Tests", icon: CheckCircle },
  
  // Data (4)
  { id: "analytics_detective", name: "Lucas Bernier", role: "Head of Data", department: "data", specialty: "Analytics", icon: BarChart3, isLeader: true },
  { id: "data_engineer", name: "Damien Lefèvre", role: "Data Engineer", department: "data", specialty: "Data Engineering", icon: Database },
  { id: "ml_trainer", name: "Sarah Dupont", role: "ML Engineer", department: "data", specialty: "Machine Learning", icon: Bot },
  { id: "reporting_agent", name: "Benjamin Giraud", role: "BI Analyst", department: "data", specialty: "Reporting", icon: FileText },
  
  // Support (3)
  { id: "reputation_guardian", name: "Marine Leroy", role: "Support Lead", department: "support", specialty: "E-réputation", icon: Shield, isLeader: true },
  { id: "ticket_handler", name: "Virginie Morel", role: "Support Agent", department: "support", specialty: "Support", icon: Headphones },
  { id: "knowledge_manager", name: "Christophe Dumas", role: "Knowledge Manager", department: "support", specialty: "Knowledge Base", icon: FileText },
  
  // Governance (3)
  { id: "compliance_auditor", name: "Isabelle Lambert", role: "Compliance Officer", department: "governance", specialty: "Conformité", icon: Scale, isLeader: true },
  { id: "policy_enforcer", name: "Philippe Durand", role: "Policy Manager", department: "governance", specialty: "Politiques", icon: Shield },
  { id: "risk_assessor", name: "Catherine Renard", role: "Risk Analyst", department: "governance", specialty: "Risques", icon: Eye },
  
  // HR (2)
  { id: "recruitment_agent", name: "Sandrine Petit", role: "HR Director", department: "hr", specialty: "Recrutement", icon: Users, isLeader: true },
  { id: "employee_experience", name: "Fabrice Leroux", role: "People Partner", department: "hr", specialty: "Expérience Collaborateur", icon: Users },
  
  // Legal (1)
  { id: "contract_analyzer", name: "Me Véronique Roche", role: "General Counsel", department: "legal", specialty: "Contrats", icon: FileText, isLeader: true },
];

// Agent Card Component
function AgentCard({ agent, compact = false }: { agent: AgentData; compact?: boolean }) {
  const dept = DEPARTMENTS[agent.department];
  const Icon = agent.icon;
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer",
              "hover:shadow-md hover:scale-[1.02]",
              dept.bgColor,
              dept.borderColor
            )}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0",
                dept.color
              )}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{agent.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{agent.specialty}</p>
              </div>
              {agent.isLeader && (
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">{agent.name}</p>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
              <Badge variant="outline" className="text-xs">{agent.specialty}</Badge>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn(
      "relative p-4 rounded-xl border-2 transition-all",
      "hover:shadow-lg hover:scale-[1.02] cursor-pointer",
      dept.bgColor,
      dept.borderColor,
      agent.isLeader && "ring-2 ring-amber-400 ring-offset-2"
    )}>
      {agent.isLeader && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md shrink-0",
          dept.color
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm truncate">{agent.name}</h4>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
          <Badge variant="secondary" className="text-[10px] mt-2">
            {agent.specialty}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// Department Section Component
function DepartmentSection({ 
  deptKey, 
  agents, 
  expanded, 
  onToggle 
}: { 
  deptKey: keyof typeof DEPARTMENTS; 
  agents: AgentData[]; 
  expanded: boolean; 
  onToggle: () => void;
}) {
  const dept = DEPARTMENTS[deptKey];
  const DeptIcon = dept.icon;
  const leader = agents.find(a => a.isLeader);
  const members = agents.filter(a => !a.isLeader);

  return (
    <div className={cn(
      "rounded-2xl border-2 transition-all overflow-hidden",
      dept.bgColor,
      dept.borderColor
    )}>
      {/* Department Header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-3 p-4 transition-colors",
          "hover:bg-black/5 dark:hover:bg-white/5"
        )}
      >
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md",
          dept.color
        )}>
          <DeptIcon className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 text-left">
          <h3 className="font-bold text-sm">{dept.name}</h3>
          <p className="text-xs text-muted-foreground">{agents.length} agent{agents.length > 1 ? 's' : ''}</p>
        </div>
        
        <Badge variant="outline" className="mr-2">
          {agents.length}
        </Badge>
        
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      
      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Leader */}
          {leader && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                Responsable
              </p>
              <AgentCard agent={leader} />
            </div>
          )}
          
          {/* Team Members */}
          {members.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                Équipe ({members.length})
              </p>
              <div className="grid gap-2">
                {members.map(agent => (
                  <AgentCard key={agent.id} agent={agent} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main Org Chart Component
export function AgentOrgChart() {
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set(['direction', 'marketing', 'sales']));
  
  // Group agents by department
  const agentsByDept = useMemo(() => {
    const grouped: Record<string, AgentData[]> = {};
    AI_TEAM.forEach(agent => {
      if (!grouped[agent.department]) {
        grouped[agent.department] = [];
      }
      grouped[agent.department].push(agent);
    });
    return grouped;
  }, []);

  const toggleDept = (dept: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(dept)) {
        next.delete(dept);
      } else {
        next.add(dept);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedDepts(new Set(Object.keys(DEPARTMENTS)));
  };

  const collapseAll = () => {
    setExpandedDepts(new Set());
  };

  // Get direction members for the top section
  const direction = agentsByDept['direction'] || [];
  const departments = Object.keys(DEPARTMENTS).filter(d => d !== 'direction') as (keyof typeof DEPARTMENTS)[];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Organigramme IA
            </CardTitle>
            <CardDescription>
              {AI_TEAM.length} agents • {Object.keys(DEPARTMENTS).length} départements
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Tout déplier
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Tout replier
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Direction - Top Level */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <Badge variant="default" className="bg-gradient-to-r from-violet-600 to-purple-500">
              <Sparkles className="w-3 h-3 mr-1" />
              Direction
            </Badge>
          </div>
          
          <div className="flex justify-center gap-6 flex-wrap">
            {direction.map(agent => (
              <div key={agent.id} className="w-64">
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>
          
          {/* Connector Line */}
          <div className="flex justify-center mt-6">
            <div className="w-px h-8 bg-border" />
          </div>
          <div className="flex justify-center">
            <div className="w-3/4 h-px bg-border" />
          </div>
        </div>
        
        {/* Departments Grid */}
        <ScrollArea className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {departments.map(deptKey => {
              const agents = agentsByDept[deptKey] || [];
              if (agents.length === 0) return null;
              
              return (
                <DepartmentSection
                  key={deptKey}
                  deptKey={deptKey}
                  agents={agents}
                  expanded={expandedDepts.has(deptKey)}
                  onToggle={() => toggleDept(deptKey)}
                />
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-primary">{AI_TEAM.length}</p>
              <p className="text-xs text-muted-foreground">Agents IA</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-emerald-500">{Object.keys(DEPARTMENTS).length}</p>
              <p className="text-xs text-muted-foreground">Départements</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-amber-500">{AI_TEAM.filter(a => a.isLeader).length}</p>
              <p className="text-xs text-muted-foreground">Responsables</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-green-500">24/7</p>
              <p className="text-xs text-muted-foreground">Disponibilité</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
