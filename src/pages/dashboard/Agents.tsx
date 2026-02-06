import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, Brain, Search, FileText, BarChart3, Target, Share2, Music, Eye, Shield, 
  CheckCircle, Zap, PenTool, Activity, Clock, AlertTriangle, PlayCircle, XCircle, TrendingUp, Users
} from 'lucide-react';
import { format } from 'date-fns';
import { getDateLocale } from '@/lib/date-locale';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { AGENT_DEFINITIONS, type AgentDefinition } from '@/lib/agents/agent-registry';
import type { AgentType } from '@/lib/agents/types';
import { AgentOrgChart } from '@/components/agents/AgentOrgChart';
import { AgentsByDepartment } from '@/components/agents/AgentsByDepartment';
import { DepartmentHeadDashboard } from '@/components/agents/DepartmentHeadDashboard';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

// Agent personas with human names and avatars - 39 agents total
const AGENT_PERSONAS: Record<string, {
  name: string;
  avatar?: string;
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

const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  chief_growth_officer: Brain, quality_compliance: Shield,
  tech_auditor: Search, keyword_strategist: Target, content_builder: PenTool, local_optimizer: Target, social_manager: Share2,
  offer_architect: Zap, sales_accelerator: Zap, lifecycle_manager: Activity, deal_closer: Zap,
  revenue_analyst: BarChart3, budget_optimizer: BarChart3, billing_manager: FileText,
  security_auditor: Shield, access_controller: Shield, threat_monitor: Eye,
  feature_analyst: Search, ux_optimizer: PenTool, roadmap_planner: Target, backlog_manager: FileText,
  code_reviewer: Search, performance_engineer: Zap, devops_agent: Activity, api_integrator: Share2, testing_agent: CheckCircle,
  analytics_detective: BarChart3, data_engineer: Activity, ml_trainer: Bot, reporting_agent: FileText,
  reputation_guardian: Shield, ticket_handler: FileText, knowledge_manager: FileText,
  compliance_auditor: Shield, policy_enforcer: Shield, risk_assessor: Eye,
  recruitment_agent: Users, employee_experience: Users,
  contract_analyzer: FileText,
  ads_optimizer: Target, cro_specialist: TrendingUp, competitive_watcher: Eye,
};

interface AgentRun { id: string; agent_type: string; status: string; started_at: string | null; completed_at: string | null; duration_ms: number | null; error_message: string | null; created_at: string; }
interface AgentStats { type: string; total_runs: number; success_runs: number; failed_runs: number; avg_duration_ms: number; last_run_at: string | null; }

export default function Agents() {
  const { t, i18n } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState('heads');
  const [recentRuns, setRecentRuns] = useState<AgentRun[]>([]);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgentData = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    try {
      const { data: runs } = await supabase
        .from('agent_runs')
        .select('id, agent_type, status, started_at, completed_at, duration_ms, error_message, created_at')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setRecentRuns(runs || []);
      const stats: Record<string, AgentStats> = {};
      (runs || []).forEach(run => {
        if (!stats[run.agent_type]) {
          stats[run.agent_type] = { type: run.agent_type, total_runs: 0, success_runs: 0, failed_runs: 0, avg_duration_ms: 0, last_run_at: null };
        }
        const s = stats[run.agent_type];
        s.total_runs++;
        if (run.status === 'completed') s.success_runs++;
        if (run.status === 'failed') s.failed_runs++;
        if (run.duration_ms) { s.avg_duration_ms = (s.avg_duration_ms * (s.total_runs - 1) + run.duration_ms) / s.total_runs; }
        if (!s.last_run_at || run.created_at > s.last_run_at) { s.last_run_at = run.created_at; }
      });
      setAgentStats(Object.values(stats));
    } catch (err) { console.error('Failed to fetch agent data:', err); }
    finally { setLoading(false); }
  }, [currentWorkspace?.id]);

  useEffect(() => { fetchAgentData(); }, [fetchAgentData]);

  useRealtimeSubscription(
    `agents-runs-${currentWorkspace?.id}`,
    { table: 'agent_runs', filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined },
    () => fetchAgentData(),
    !!currentWorkspace?.id
  );

  const agentsWithStats = useMemo(() => {
    return Object.entries(AGENT_DEFINITIONS).map(([type, definition]) => {
      const stats = agentStats.find(s => s.type === type);
      const persona = AGENT_PERSONAS[type];
      return { ...definition, persona, stats: stats || { type, total_runs: 0, success_runs: 0, failed_runs: 0, avg_duration_ms: 0, last_run_at: null } };
    });
  }, [agentStats]);

  const totalRuns = agentStats.reduce((sum, s) => sum + s.total_runs, 0);
  const totalSuccess = agentStats.reduce((sum, s) => sum + s.success_runs, 0);
  const successRate = totalRuns > 0 ? ((totalSuccess / totalRuns) * 100).toFixed(1) : '100';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-chart-3" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'running': return <PlayCircle className="h-4 w-4 text-primary animate-pulse" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      orchestration: 'from-primary to-primary/60', seo: 'from-chart-3 to-chart-3/60',
      content: 'from-accent to-accent/60', ads: 'from-chart-4 to-chart-4/60',
      social: 'from-chart-1 to-chart-1/60', analytics: 'from-chart-1 to-chart-1/60',
      sales: 'from-chart-5 to-chart-5/60', automation: 'from-chart-5 to-chart-5/60',
    };
    return colors[category] || 'from-muted to-muted/60';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🤖</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {t("agentsPage.title")}
            <span className="relative w-2 h-2 bg-primary rounded-full animate-pulse" />
          </h1>
          <p className="text-muted-foreground">{t("agentsPage.subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("agentsPage.running")}</CardTitle>
            <div className="relative">
              {recentRuns.some(r => r.status === 'running') && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
              )}
              <PlayCircle className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{recentRuns.filter(r => r.status === 'running').length}</div>
            <p className="text-xs text-muted-foreground">{t("agentsPage.activeExecutions")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{t("agentsPage.activeAgents")}</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">39</div><p className="text-xs text-muted-foreground">{t("agentsPage.directionAndAgents")}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{t("agentsPage.totalExecutions")}</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalRuns}</div><p className="text-xs text-muted-foreground">{t("agentsPage.allAgents")}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{t("agentsPage.successRate")}</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{successRate}%</div><Progress value={Number(successRate)} className="h-2 mt-2" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{t("agentsPage.availability")}</CardTitle><CheckCircle className="h-4 w-4 text-chart-3" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-chart-3">24/7</div><p className="text-xs text-muted-foreground">{t("agentsPage.alwaysAvailable")}</p></CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="heads">{t("agentsPage.departmentHeads")}</TabsTrigger>
          <TabsTrigger value="departments">{t("agentsPage.teams")}</TabsTrigger>
          <TabsTrigger value="orgchart">{t("agentsPage.orgChart")}</TabsTrigger>
          <TabsTrigger value="activity">{t("agentsPage.recentActivity")}</TabsTrigger>
        </TabsList>

        <TabsContent value="heads" className="space-y-4"><DepartmentHeadDashboard /></TabsContent>
        <TabsContent value="departments" className="space-y-4"><AgentsByDepartment agentStats={agentStats} /></TabsContent>
        <TabsContent value="orgchart" className="space-y-4"><AgentOrgChart /></TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>{t("agentsPage.recentAgentActivity")}</CardTitle>
              <CardDescription>{t("agentsPage.last50Executions")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">{t("agentsPage.loadingText")}</div>
                  ) : recentRuns.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t("agentsPage.noRecentExecutions")}</p>
                      <p className="text-sm">{t("agentsPage.noRecentDesc")}</p>
                    </div>
                  ) : (
                    recentRuns.map((run) => {
                      const agent = AGENT_DEFINITIONS[run.agent_type as AgentType];
                      const persona = AGENT_PERSONAS[run.agent_type];
                      const Icon = AGENT_ICONS[run.agent_type] || Bot;
                      return (
                        <div key={run.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getCategoryColor(agent?.category || 'orchestration')} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{persona?.name || agent?.name || run.agent_type}</span>
                              {getStatusIcon(run.status)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {run.started_at ? format(new Date(run.started_at), 'dd/MM/yyyy HH:mm', { locale: getDateLocale(i18n.language) }) : format(new Date(run.created_at), 'dd/MM/yyyy HH:mm', { locale: getDateLocale(i18n.language) })}
                              {run.duration_ms && ` • ${(run.duration_ms / 1000).toFixed(1)}s`}
                            </p>
                            {run.error_message && <p className="text-xs text-destructive truncate mt-1">{run.error_message}</p>}
                          </div>
                          <Badge variant={run.status === 'completed' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}>{run.status}</Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
