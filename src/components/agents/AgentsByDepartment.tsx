import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Zap,
  PenTool,
  Activity,
  Users,
  Building2,
  Briefcase,
  DollarSign,
  Lock,
  Package,
  Code2,
  Database,
  HeadphonesIcon,
  Scale,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Department configuration with icons and colors
const DEPARTMENTS = {
  direction: {
    name: 'Direction',
    icon: Building2,
    color: 'from-primary to-primary/60',
    description: 'Orchestration et supervision stratégique',
    agents: ['chief_growth_officer', 'quality_compliance'],
  },
  marketing: {
    name: 'Marketing',
    icon: Target,
    color: 'from-chart-3 to-chart-3/60',
    description: 'SEO, contenu, social media et publicité',
    agents: ['tech_auditor', 'keyword_strategist', 'content_builder', 'local_optimizer', 'social_manager', 'ads_optimizer', 'cro_specialist', 'competitive_watcher'],
  },
  sales: {
    name: 'Sales',
    icon: Briefcase,
    color: 'from-chart-5 to-chart-5/60',
    description: 'Pipeline commercial et closing',
    agents: ['offer_architect', 'sales_accelerator', 'lifecycle_manager', 'deal_closer'],
  },
  finance: {
    name: 'Finance',
    icon: DollarSign,
    color: 'from-amber-500 to-amber-500/60',
    description: 'Revenus, budgets et facturation',
    agents: ['revenue_analyst', 'budget_optimizer', 'billing_manager'],
  },
  security: {
    name: 'Security',
    icon: Lock,
    color: 'from-red-500 to-red-500/60',
    description: 'Audit, contrôle d\'accès et surveillance',
    agents: ['security_auditor', 'access_controller', 'threat_monitor'],
  },
  product: {
    name: 'Product',
    icon: Package,
    color: 'from-purple-500 to-purple-500/60',
    description: 'Roadmap, UX et backlog',
    agents: ['feature_analyst', 'ux_optimizer', 'roadmap_planner', 'backlog_manager'],
  },
  engineering: {
    name: 'Engineering',
    icon: Code2,
    color: 'from-blue-500 to-blue-500/60',
    description: 'Code, performance et DevOps',
    agents: ['code_reviewer', 'performance_engineer', 'devops_agent', 'api_integrator', 'testing_agent'],
  },
  data: {
    name: 'Data',
    icon: Database,
    color: 'from-cyan-500 to-cyan-500/60',
    description: 'Analytics, ML et reporting',
    agents: ['analytics_detective', 'data_engineer', 'ml_trainer', 'reporting_agent'],
  },
  support: {
    name: 'Support',
    icon: HeadphonesIcon,
    color: 'from-green-500 to-green-500/60',
    description: 'Réputation, tickets et knowledge',
    agents: ['reputation_guardian', 'ticket_handler', 'knowledge_manager'],
  },
  governance: {
    name: 'Governance',
    icon: Shield,
    color: 'from-slate-500 to-slate-500/60',
    description: 'Conformité, politiques et risques',
    agents: ['compliance_auditor', 'policy_enforcer', 'risk_assessor'],
  },
  hr: {
    name: 'HR',
    icon: UserCheck,
    color: 'from-pink-500 to-pink-500/60',
    description: 'Recrutement et expérience collaborateur',
    agents: ['recruitment_agent', 'employee_experience'],
  },
  legal: {
    name: 'Legal',
    icon: Scale,
    color: 'from-indigo-500 to-indigo-500/60',
    description: 'Analyse de contrats',
    agents: ['contract_analyzer'],
  },
} as const;

// Agent personas
const AGENT_PERSONAS: Record<string, {
  name: string;
  specialty: string;
  greeting: string;
}> = {
  chief_growth_officer: { name: 'Sophie Marchand', specialty: 'Orchestration & Stratégie', greeting: 'Je coordonne tous les agents pour maximiser votre croissance.' },
  quality_compliance: { name: 'Jean-Michel Fournier', specialty: 'Contrôle Qualité', greeting: 'Je valide chaque action pour garantir conformité et éthique.' },
  tech_auditor: { name: 'Emma Lefebvre', specialty: 'SEO Technique', greeting: 'J\'analyse votre site pour détecter les problèmes techniques.' },
  keyword_strategist: { name: 'Thomas Duval', specialty: 'Stratégie de contenu', greeting: 'Je recherche les meilleures opportunités de mots-clés.' },
  content_builder: { name: 'Léa Fontaine', specialty: 'Copywriting', greeting: 'Je rédige du contenu optimisé pour la conversion.' },
  local_optimizer: { name: 'Antoine Girard', specialty: 'SEO Local', greeting: 'J\'optimise votre présence locale et Google Business.' },
  social_manager: { name: 'Camille Rousseau', specialty: 'Réseaux Sociaux', greeting: 'Je planifie et optimise votre présence sociale.' },
  offer_architect: { name: 'David Petit', specialty: 'Offres commerciales', greeting: 'Je conçois des offres irrésistibles.' },
  sales_accelerator: { name: 'Nicolas Bernard', specialty: 'Ventes', greeting: 'J\'accélère votre pipeline commercial.' },
  lifecycle_manager: { name: 'Claire Dubois', specialty: 'Automation', greeting: 'J\'automatise vos séquences email et nurturing.' },
  deal_closer: { name: 'Alexandre Martin', specialty: 'Closing', greeting: 'J\'optimise vos processus de closing.' },
  revenue_analyst: { name: 'Mathilde Legrand', specialty: 'Analyse Revenus', greeting: 'J\'analyse les revenus et prévois les tendances.' },
  budget_optimizer: { name: 'François Mercier', specialty: 'Budget', greeting: 'J\'optimise l\'allocation budgétaire.' },
  billing_manager: { name: 'Aurélie Chevalier', specialty: 'Facturation', greeting: 'Je gère la facturation automatisée.' },
  security_auditor: { name: 'Julien Moreau', specialty: 'Audit Sécurité', greeting: 'J\'audite la sécurité de vos systèmes.' },
  access_controller: { name: 'Nathalie Vincent', specialty: 'Contrôle d\'accès', greeting: 'Je gère les permissions utilisateurs.' },
  threat_monitor: { name: 'Sébastien Blanc', specialty: 'Surveillance', greeting: 'Je surveille les menaces en temps réel.' },
  feature_analyst: { name: 'Marie Leclerc', specialty: 'Analyse Produit', greeting: 'J\'analyse les demandes de fonctionnalités.' },
  ux_optimizer: { name: 'Caroline Roux', specialty: 'UX Design', greeting: 'J\'optimise l\'expérience utilisateur.' },
  roadmap_planner: { name: 'Pierre-Antoine Faure', specialty: 'Roadmap', greeting: 'Je planifie la roadmap produit.' },
  backlog_manager: { name: 'Stéphane Garnier', specialty: 'Backlog', greeting: 'J\'organise et priorise le backlog.' },
  code_reviewer: { name: 'Maxime Perrin', specialty: 'Code Review', greeting: 'Je revois le code automatiquement.' },
  performance_engineer: { name: 'Olivier Bonnet', specialty: 'Performance', greeting: 'J\'optimise les performances applicatives.' },
  devops_agent: { name: 'Laurent Muller', specialty: 'DevOps', greeting: 'J\'automatise le déploiement.' },
  api_integrator: { name: 'Romain Simon', specialty: 'Intégrations', greeting: 'J\'intègre les APIs externes.' },
  testing_agent: { name: 'Élodie Michel', specialty: 'Tests', greeting: 'Je génère et exécute les tests.' },
  analytics_detective: { name: 'Lucas Bernier', specialty: 'Analytics', greeting: 'Je surveille vos KPIs et détecte les anomalies.' },
  data_engineer: { name: 'Damien Lefèvre', specialty: 'Data Engineering', greeting: 'Je construis les pipelines de données.' },
  ml_trainer: { name: 'Sarah Dupont', specialty: 'Machine Learning', greeting: 'J\'entraîne les modèles de ML.' },
  reporting_agent: { name: 'Benjamin Giraud', specialty: 'Reporting', greeting: 'Je génère des rapports automatisés.' },
  reputation_guardian: { name: 'Marine Leroy', specialty: 'E-réputation', greeting: 'Je surveille et protège votre réputation.' },
  ticket_handler: { name: 'Virginie Morel', specialty: 'Support', greeting: 'Je traite et priorise les tickets.' },
  knowledge_manager: { name: 'Christophe Dumas', specialty: 'Knowledge Base', greeting: 'Je maintiens la base de connaissances.' },
  compliance_auditor: { name: 'Isabelle Lambert', specialty: 'Conformité', greeting: 'J\'audite la conformité réglementaire.' },
  policy_enforcer: { name: 'Philippe Durand', specialty: 'Politiques', greeting: 'J\'applique les règles de l\'organisation.' },
  risk_assessor: { name: 'Catherine Renard', specialty: 'Risques', greeting: 'J\'évalue et quantifie les risques.' },
  recruitment_agent: { name: 'Sandrine Petit', specialty: 'Recrutement', greeting: 'J\'automatise le processus de recrutement.' },
  employee_experience: { name: 'Fabrice Leroux', specialty: 'Expérience Collaborateur', greeting: 'J\'optimise l\'engagement des équipes.' },
  contract_analyzer: { name: 'Maître Véronique Roche', specialty: 'Contrats', greeting: 'J\'analyse les contrats et détecte les risques.' },
  ads_optimizer: { name: 'Marc Rousseau', specialty: 'Publicité', greeting: 'J\'optimise vos campagnes publicitaires.' },
  cro_specialist: { name: 'Julie Martin', specialty: 'Conversion', greeting: 'J\'améliore vos taux de conversion.' },
  competitive_watcher: { name: 'Paul Moreau', specialty: 'Veille concurrentielle', greeting: 'J\'analyse vos concurrents.' },
};

// Agent icon mapping
const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  chief_growth_officer: Brain,
  quality_compliance: Shield,
  tech_auditor: Search,
  keyword_strategist: Target,
  content_builder: PenTool,
  local_optimizer: Target,
  social_manager: Share2,
  offer_architect: Zap,
  sales_accelerator: Zap,
  lifecycle_manager: Activity,
  deal_closer: Zap,
  revenue_analyst: BarChart3,
  budget_optimizer: BarChart3,
  billing_manager: FileText,
  security_auditor: Shield,
  access_controller: Shield,
  threat_monitor: Eye,
  feature_analyst: Search,
  ux_optimizer: PenTool,
  roadmap_planner: Target,
  backlog_manager: FileText,
  code_reviewer: Search,
  performance_engineer: Zap,
  devops_agent: Activity,
  api_integrator: Share2,
  testing_agent: Shield,
  analytics_detective: BarChart3,
  data_engineer: Activity,
  ml_trainer: Bot,
  reporting_agent: FileText,
  reputation_guardian: Shield,
  ticket_handler: FileText,
  knowledge_manager: FileText,
  compliance_auditor: Shield,
  policy_enforcer: Shield,
  risk_assessor: Eye,
  recruitment_agent: Users,
  employee_experience: Users,
  contract_analyzer: FileText,
  ads_optimizer: Target,
  cro_specialist: BarChart3,
  competitive_watcher: Eye,
};

interface AgentStats {
  type: string;
  total_runs: number;
  success_runs: number;
}

interface AgentsByDepartmentProps {
  agentStats: AgentStats[];
}

interface DepartmentSectionProps {
  departmentKey: string;
  department: typeof DEPARTMENTS[keyof typeof DEPARTMENTS];
  agentStats: AgentStats[];
  defaultOpen?: boolean;
}

function DepartmentSection({ departmentKey, department, agentStats, defaultOpen = false }: DepartmentSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const DeptIcon = department.icon;
  
  const departmentStats = useMemo(() => {
    let totalRuns = 0;
    let successRuns = 0;
    department.agents.forEach(agentId => {
      const stats = agentStats.find(s => s.type === agentId);
      if (stats) {
        totalRuns += stats.total_runs;
        successRuns += stats.success_runs;
      }
    });
    return { totalRuns, successRuns };
  }, [department.agents, agentStats]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        "transition-all duration-200",
        isOpen && "ring-1 ring-primary/20"
      )}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                  department.color
                )}>
                  <DeptIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {department.name}
                    <Badge variant="secondary" className="text-xs">
                      {department.agents.length} agents
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {department.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {departmentStats.totalRuns > 0 && (
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{departmentStats.totalRuns} exécutions</p>
                    <p className="text-xs text-muted-foreground">
                      {departmentStats.successRuns > 0 
                        ? `${Math.round((departmentStats.successRuns / departmentStats.totalRuns) * 100)}% succès`
                        : 'En attente'}
                    </p>
                  </div>
                )}
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {department.agents.map(agentId => {
                const persona = AGENT_PERSONAS[agentId];
                const AgentIcon = AGENT_ICONS[agentId] || Bot;
                const stats = agentStats.find(s => s.type === agentId);
                
                if (!persona) return null;
                
                return (
                  <div 
                    key={agentId}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                      department.color
                    )}>
                      <AgentIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{persona.name}</h4>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-3/75 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-3" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Disponible 24/7</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {persona.specialty}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {persona.greeting}
                      </p>
                      {stats && stats.total_runs > 0 && (
                        <p className="text-xs text-primary mt-2">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {stats.total_runs} exécution{stats.total_runs > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function AgentsByDepartment({ agentStats }: AgentsByDepartmentProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Organisation par département</h2>
          <p className="text-sm text-muted-foreground">
            Cliquez sur un département pour voir ses agents
          </p>
        </div>
        <Badge variant="outline">
          {Object.keys(DEPARTMENTS).length} départements
        </Badge>
      </div>
      
      {Object.entries(DEPARTMENTS).map(([key, dept], index) => (
        <DepartmentSection
          key={key}
          departmentKey={key}
          department={dept}
          agentStats={agentStats}
          defaultOpen={index === 0} // Open first department by default
        />
      ))}
    </div>
  );
}
