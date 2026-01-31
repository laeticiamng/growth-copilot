import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Activity, 
  Bot, 
  Search,
  RefreshCcw,
  Clock,
  User,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ActionLog {
  id: string;
  actor_type: string;
  actor_id: string | null;
  action_type: string;
  action_category: string | null;
  description: string;
  result: string | null;
  is_automated: boolean | null;
  created_at: string;
}

interface AgentRun {
  id: string;
  agent_type: string;
  status: string;
  inputs: Record<string, unknown> | null;
  outputs: Record<string, unknown> | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  cost_estimate: number | null;
  error_message: string | null;
  created_at: string;
}

const Logs = () => {
  const { currentWorkspace } = useWorkspace();
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchLogs = async () => {
    if (!currentWorkspace) return;
    
    setLoading(true);
    
    const [actionLogsRes, agentRunsRes] = await Promise.all([
      supabase
        .from('action_log')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('agent_runs')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    if (actionLogsRes.data) setActionLogs(actionLogsRes.data as ActionLog[]);
    if (agentRunsRes.data) setAgentRuns(agentRunsRes.data as AgentRun[]);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [currentWorkspace]);

  const filteredActionLogs = actionLogs.filter(log => 
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAgentRuns = agentRuns.filter(run => {
    const matchesSearch = run.agent_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Terminé</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Échec</Badge>;
      case "running":
        return <Badge variant="agent"><Loader2 className="w-3 h-3 mr-1 animate-spin" />En cours</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActorIcon = (actorType: string, isAutomated: boolean | null) => {
    if (isAutomated || actorType === "agent") {
      return <Bot className="w-4 h-4 text-primary" />;
    }
    return <User className="w-4 h-4 text-muted-foreground" />;
  };

  // Demo data if empty
  const demoActionLogs: ActionLog[] = [
    { id: "1", actor_type: "agent", actor_id: "tech_auditor", action_type: "crawl_complete", action_category: "seo", description: "Crawl terminé : 145 pages analysées, 23 issues détectées", result: "success", is_automated: true, created_at: new Date().toISOString() },
    { id: "2", actor_type: "user", actor_id: "user_123", action_type: "site_created", action_category: "config", description: "Nouveau site ajouté : example.com", result: "success", is_automated: false, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: "3", actor_type: "agent", actor_id: "content_builder", action_type: "brief_generated", action_category: "content", description: "Brief contenu généré pour 'Guide SEO 2024'", result: "success", is_automated: true, created_at: new Date(Date.now() - 7200000).toISOString() },
  ];

  const demoAgentRuns: AgentRun[] = [
    { id: "1", agent_type: "tech_auditor", status: "completed", inputs: { url: "https://example.com" }, outputs: { issues: 23, pages: 145 }, started_at: new Date(Date.now() - 60000).toISOString(), completed_at: new Date().toISOString(), duration_ms: 45000, cost_estimate: 0.02, error_message: null, created_at: new Date().toISOString() },
    { id: "2", agent_type: "keyword_strategist", status: "running", inputs: { site_id: "abc" }, outputs: null, started_at: new Date().toISOString(), completed_at: null, duration_ms: null, cost_estimate: null, error_message: null, created_at: new Date().toISOString() },
    { id: "3", agent_type: "content_builder", status: "pending", inputs: { keyword: "seo local" }, outputs: null, started_at: null, completed_at: null, duration_ms: null, cost_estimate: null, error_message: null, created_at: new Date(Date.now() - 1800000).toISOString() },
  ];

  const displayActionLogs = actionLogs.length > 0 ? filteredActionLogs : demoActionLogs;
  const displayAgentRuns = agentRuns.length > 0 ? filteredAgentRuns : demoAgentRuns;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs & Activité</h1>
          <p className="text-muted-foreground">
            Audit trail complet : actions utilisateurs et runs agents IA.
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="running">En cours</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="failed">Échec</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="actions" className="w-full">
        <TabsList>
          <TabsTrigger value="actions" className="gap-2">
            <Activity className="w-4 h-4" />
            Action Log
            <Badge variant="secondary" className="ml-1">{displayActionLogs.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2">
            <Bot className="w-4 h-4" />
            Agent Runs
            <Badge variant="secondary" className="ml-1">{displayAgentRuns.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Historique des actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {displayActionLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="p-2 rounded-full bg-background">
                        {getActorIcon(log.actor_type, log.is_automated)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.action_type}</span>
                          {log.action_category && (
                            <Badge variant="outline" className="text-xs">{log.action_category}</Badge>
                          )}
                          {log.is_automated && (
                            <Badge variant="agent" className="text-xs">
                              <Zap className="w-3 h-3 mr-1" />Auto
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{log.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "dd MMM HH:mm", { locale: fr })}
                        </p>
                        {log.result && (
                          <Badge variant={log.result === "success" ? "success" : "destructive"} className="mt-1">
                            {log.result}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Exécutions des agents IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {displayAgentRuns.map((run) => (
                    <div 
                      key={run.id} 
                      className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="p-2 rounded-lg gradient-bg">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold capitalize">
                            {run.agent_type.replace(/_/g, ' ')}
                          </span>
                          {getStatusBadge(run.status)}
                        </div>
                        {run.duration_ms && (
                          <p className="text-sm text-muted-foreground">
                            Durée: {(run.duration_ms / 1000).toFixed(1)}s
                            {run.cost_estimate && ` • Coût estimé: $${run.cost_estimate.toFixed(4)}`}
                          </p>
                        )}
                        {run.error_message && (
                          <p className="text-sm text-destructive mt-1">{run.error_message}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(run.created_at), "dd MMM HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Logs;
