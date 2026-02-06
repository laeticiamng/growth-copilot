import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/usePagination";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Loader2,
  Filter,
  Brain,
  DollarSign,
  Timer,
  Hash,
  Eye,
  Rss,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { format } from "date-fns";
import { getDateLocale } from "@/lib/date-locale";
import { useTranslation } from "react-i18next";

interface ActionLog {
  id: string;
  actor_type: string;
  actor_id: string | null;
  action_type: string;
  action_category: string | null;
  description: string;
  details: Record<string, unknown> | null;
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
  provider_name: string | null;
  model_name: string | null;
  ai_request_id: string | null;
  created_at: string;
}

interface AIRequest {
  id: string;
  agent_name: string;
  purpose: string;
  provider_name: string;
  model_name: string;
  input_json: Record<string, unknown>;
  output_json: Record<string, unknown> | null;
  status: string;
  error_message: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  cost_estimate: number | null;
  duration_ms: number | null;
  created_at: string;
}

const Logs = () => {
  const { t, i18n } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [aiRequests, setAiRequests] = useState<AIRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<AIRequest | null>(null);

  const fetchLogs = async () => {
    if (!currentWorkspace) return;
    
    setLoading(true);
    
    const [actionLogsRes, agentRunsRes, aiRequestsRes] = await Promise.all([
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
      supabase
        .from('ai_requests')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    if (actionLogsRes.data) setActionLogs(actionLogsRes.data as ActionLog[]);
    if (agentRunsRes.data) setAgentRuns(agentRunsRes.data as AgentRun[]);
    if (aiRequestsRes.data) setAiRequests(aiRequestsRes.data as AIRequest[]);
    
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

  const filteredAiRequests = aiRequests.filter(req => {
    const matchesSearch = 
      req.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.model_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Succès</Badge>;
      case "failed":
      case "error":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Erreur</Badge>;
      case "running":
        return <Badge variant="agent"><Loader2 className="w-3 h-3 mr-1 animate-spin" />En cours</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case "retry":
        return <Badge variant="warning"><RefreshCcw className="w-3 h-3 mr-1" />Retry</Badge>;
      case "fallback":
        return <Badge variant="outline"><Zap className="w-3 h-3 mr-1" />Fallback</Badge>;
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

  // Real data only - no demo fallback (Zero Fake Data policy)
  const displayActionLogs = filteredActionLogs;
  const displayAgentRuns = filteredAgentRuns;
  const displayAiRequests = filteredAiRequests;

  // Pagination for each tab
  const aiPagination = usePagination(displayAiRequests, { initialPageSize: 10 });
  const agentPagination = usePagination(displayAgentRuns, { initialPageSize: 10 });
  const actionPagination = usePagination(displayActionLogs, { initialPageSize: 10 });

  // Calculate totals for AI requests
  const totalTokens = displayAiRequests.reduce((sum, r) => sum + (r.tokens_in || 0) + (r.tokens_out || 0), 0);
  const totalCost = displayAiRequests.reduce((sum, r) => sum + (r.cost_estimate || 0), 0);
  const successRate = displayAiRequests.length > 0 
    ? (displayAiRequests.filter(r => r.status === 'success').length / displayAiRequests.length * 100).toFixed(0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs & Activité</h1>
          <p className="text-muted-foreground">
            Audit trail complet : actions utilisateurs, runs agents et requêtes IA.
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{displayAiRequests.length}</p>
                <p className="text-xs text-muted-foreground">Requêtes IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Hash className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Tokens utilisés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <DollarSign className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalCost.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Coût estimé</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <CheckCircle className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{successRate}%</p>
                <p className="text-xs text-muted-foreground">Taux de succès</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                <SelectItem value="success">Succès</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="running">En cours</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="error">Erreur</SelectItem>
                <SelectItem value="failed">Échec</SelectItem>
                <SelectItem value="retry">Retry</SelectItem>
                <SelectItem value="fallback">Fallback</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="feed" className="w-full">
        <TabsList>
          <TabsTrigger value="feed" className="gap-2">
            <Rss className="w-4 h-4" />
            Fil d'activité
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Brain className="w-4 h-4" />
            AI Requests
            <Badge variant="secondary" className="ml-1">{displayAiRequests.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2">
            <Bot className="w-4 h-4" />
            Agent Runs
            <Badge variant="secondary" className="ml-1">{displayAgentRuns.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <Activity className="w-4 h-4" />
            Action Log
            <Badge variant="secondary" className="ml-1">{displayActionLogs.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Activity Feed Tab (New!) */}
        <TabsContent value="feed" className="mt-4">
          <ActivityFeed showFilters={true} showLoadMore={true} limit={20} />
        </TabsContent>

        {/* AI Requests Tab */}
        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Requêtes AI Gateway
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {aiPagination.paginatedData.map((req) => (
                    <div 
                      key={req.id} 
                      className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="p-2 rounded-lg gradient-bg">
                        <Brain className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold">{req.agent_name}</span>
                          <Badge variant="outline" className="text-xs">{req.purpose}</Badge>
                          {getStatusBadge(req.status)}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            {req.model_name}
                          </span>
                          {req.tokens_in && req.tokens_out && (
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {req.tokens_in} → {req.tokens_out} tokens
                            </span>
                          )}
                          {req.duration_ms && (
                            <span className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {(req.duration_ms / 1000).toFixed(2)}s
                            </span>
                          )}
                          {req.cost_estimate && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${req.cost_estimate.toFixed(6)}
                            </span>
                          )}
                        </div>
                        {req.error_message && (
                          <p className="text-sm text-destructive mt-1">{req.error_message}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(req.created_at), "dd MMM HH:mm", { locale: getDateLocale(i18n.language) })}
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedRequest(req)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Brain className="w-5 h-5" />
                                Détails requête: {req.agent_name}
                              </DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh]">
                              <div className="space-y-4 p-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Provider</p>
                                    <p>{req.provider_name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Modèle</p>
                                    <p>{req.model_name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Purpose</p>
                                    <p>{req.purpose}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    {getStatusBadge(req.status)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tokens In/Out</p>
                                    <p>{req.tokens_in} / {req.tokens_out}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Coût</p>
                                    <p>${(req.cost_estimate || 0).toFixed(6)}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Input</p>
                                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-[200px]">
                                    {JSON.stringify(req.input_json, null, 2)}
                                  </pre>
                                </div>
                                
                                {req.output_json && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Output</p>
                                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-[200px]">
                                      {JSON.stringify(req.output_json, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                
                                {req.error_message && (
                                  <div>
                                    <p className="text-sm font-medium text-destructive mb-2">Error</p>
                                    <p className="text-destructive">{req.error_message}</p>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!loading && aiPagination.totalPages > 1 && (
                <div className="mt-4">
                  <DataTablePagination
                    currentPage={aiPagination.currentPage}
                    totalPages={aiPagination.totalPages}
                    onPageChange={aiPagination.goToPage}
                    hasNextPage={aiPagination.hasNextPage}
                    hasPreviousPage={aiPagination.hasPreviousPage}
                    pageSize={aiPagination.pageSize}
                    onPageSizeChange={aiPagination.setPageSize}
                    pageSizeOptions={aiPagination.pageSizeOptions}
                    totalItems={aiPagination.totalItems}
                    startIndex={aiPagination.startIndex}
                    endIndex={aiPagination.endIndex}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Runs Tab */}
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
                  {agentPagination.paginatedData.map((run) => (
                    <div 
                      key={run.id} 
                      className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="p-2 rounded-lg gradient-bg">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold capitalize">
                            {run.agent_type.replace(/_/g, ' ')}
                          </span>
                          {getStatusBadge(run.status)}
                          {run.provider_name && (
                            <Badge variant="outline" className="text-xs">
                              {run.provider_name}/{run.model_name?.split('/').pop()}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {run.duration_ms && (
                            <span className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {(run.duration_ms / 1000).toFixed(1)}s
                            </span>
                          )}
                          {run.cost_estimate && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${run.cost_estimate.toFixed(4)}
                            </span>
                          )}
                        </div>
                        {run.error_message && (
                          <p className="text-sm text-destructive mt-1">{run.error_message}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(run.created_at), "dd MMM HH:mm", { locale: getDateLocale(i18n.language) })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!loading && agentPagination.totalPages > 1 && (
                <div className="mt-4">
                  <DataTablePagination
                    currentPage={agentPagination.currentPage}
                    totalPages={agentPagination.totalPages}
                    onPageChange={agentPagination.goToPage}
                    hasNextPage={agentPagination.hasNextPage}
                    hasPreviousPage={agentPagination.hasPreviousPage}
                    pageSize={agentPagination.pageSize}
                    onPageSizeChange={agentPagination.setPageSize}
                    pageSizeOptions={agentPagination.pageSizeOptions}
                    totalItems={agentPagination.totalItems}
                    startIndex={agentPagination.startIndex}
                    endIndex={agentPagination.endIndex}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Log Tab */}
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
                  {actionPagination.paginatedData.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="p-2 rounded-full bg-background">
                        {getActorIcon(log.actor_type, log.is_automated)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                        {log.details && log.action_type === 'AI_RUN' && (
                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                            {(log.details as Record<string, unknown>).model && (
                              <span>Model: {String((log.details as Record<string, unknown>).model)}</span>
                            )}
                            {(log.details as Record<string, unknown>).tokens_in && (
                              <span>Tokens: {String((log.details as Record<string, unknown>).tokens_in)}/{String((log.details as Record<string, unknown>).tokens_out)}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "dd MMM HH:mm", { locale: getDateLocale(i18n.language) })}
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
              {!loading && actionPagination.totalPages > 1 && (
                <div className="mt-4">
                  <DataTablePagination
                    currentPage={actionPagination.currentPage}
                    totalPages={actionPagination.totalPages}
                    onPageChange={actionPagination.goToPage}
                    hasNextPage={actionPagination.hasNextPage}
                    hasPreviousPage={actionPagination.hasPreviousPage}
                    pageSize={actionPagination.pageSize}
                    onPageSizeChange={actionPagination.setPageSize}
                    pageSizeOptions={actionPagination.pageSizeOptions}
                    totalItems={actionPagination.totalItems}
                    startIndex={actionPagination.startIndex}
                    endIndex={actionPagination.endIndex}
                  />
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
