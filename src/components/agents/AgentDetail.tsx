import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  BarChart3,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AgentRun {
  id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
}

interface AgentDetailProps {
  agent: {
    type: string;
    name: string;
    description: string;
    category: string;
    persona?: {
      name: string;
      specialty: string;
      greeting: string;
    };
    stats: {
      total_runs: number;
      success_runs: number;
      failed_runs: number;
      avg_duration_ms: number;
      last_run_at: string | null;
    };
    requiresApproval?: boolean;
    riskLevel?: string;
  };
  recentRuns: AgentRun[];
  onBack: () => void;
  onLaunch: (agentType: string) => void;
  loading?: boolean;
}

export function AgentDetail({ 
  agent, 
  recentRuns, 
  onBack, 
  onLaunch,
  loading = false,
}: AgentDetailProps) {
  const successRate = agent.stats.total_runs > 0
    ? ((agent.stats.success_runs / agent.stats.total_runs) * 100).toFixed(1)
    : '100';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'running':
        return <Activity className="h-4 w-4 text-primary animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </Button>

      {/* Header */}
      <Card variant="gradient" className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">
                  {agent.persona?.name || agent.name}
                </h2>
                <Badge variant="outline">{agent.category}</Badge>
                {agent.requiresApproval && (
                  <Badge variant="secondary">Approbation requise</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {agent.persona?.greeting || agent.description}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Button onClick={() => onLaunch(agent.type)} disabled={loading}>
                  <Play className="w-4 h-4 mr-2" />
                  Lancer maintenant
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurer
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Exécutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.stats.total_runs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de succès</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{successRate}%</div>
            <Progress value={Number(successRate)} className="h-1 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Durée moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agent.stats.avg_duration_ms > 0
                ? `${(agent.stats.avg_duration_ms / 1000).toFixed(1)}s`
                : '-'
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dernière exécution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {agent.stats.last_run_at
                ? format(new Date(agent.stats.last_run_at), 'dd/MM HH:mm', { locale: fr })
                : 'Jamais'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="capabilities">Capacités</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique d'exécution</CardTitle>
              <CardDescription>Les 20 dernières exécutions de cet agent</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {recentRuns.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bot className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>Aucune exécution pour cet agent</p>
                    </div>
                  ) : (
                    recentRuns.map((run) => (
                      <div 
                        key={run.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(run.status)}
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {run.status === 'completed' ? 'Succès' : 
                               run.status === 'failed' ? 'Échec' :
                               run.status === 'running' ? 'En cours' : run.status}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(run.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(2)}s` : '-'}
                          </p>
                          {run.error_message && (
                            <p className="text-xs text-destructive truncate max-w-[200px]">
                              {run.error_message}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities">
          <Card>
            <CardHeader>
              <CardTitle>Capacités de l'agent</CardTitle>
              <CardDescription>Ce que cet agent peut faire pour vous</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-medium">{agent.persona?.specialty || agent.category}</p>
                  <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
                </div>
                {agent.riskLevel && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="font-medium text-amber-600">Niveau de risque: {agent.riskLevel}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {agent.requiresApproval 
                        ? "Les actions de cet agent nécessitent une approbation manuelle."
                        : "Cet agent peut agir de manière autonome dans les limites configurées."
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de l'agent</CardTitle>
              <CardDescription>Configuration avancée</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Les paramètres avancés seront disponibles prochainement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
