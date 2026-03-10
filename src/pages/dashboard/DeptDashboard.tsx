/**
 * P1 — Vue Département /dashboard/dept/:slug
 * Real data from agent_runs + ops_metrics_daily
 */
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDepartmentBySlug,
  getAgentsByDepartment,
} from "@/data/agents-catalog";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";

const statusConfig: Record<string, { label: Record<string, string>; color: string; icon: React.ReactNode }> = {
  running: {
    label: { fr: "En cours", en: "In progress" },
    color: "bg-blue-500/10 text-blue-500",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  completed: {
    label: { fr: "Terminé", en: "Completed" },
    color: "bg-emerald-500/10 text-emerald-500",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  pending: {
    label: { fr: "En attente", en: "Pending" },
    color: "bg-gray-500/10 text-gray-500",
    icon: <Clock className="w-3 h-3" />,
  },
  failed: {
    label: { fr: "Échoué", en: "Failed" },
    color: "bg-red-500/10 text-red-500",
    icon: <MessageSquare className="w-3 h-3" />,
  },
};

function useDeptRuns(workspaceId: string | undefined, agentTypes: string[]) {
  return useQuery({
    queryKey: ["dept-runs", workspaceId, agentTypes],
    queryFn: async () => {
      if (!workspaceId || agentTypes.length === 0) return [];
      const { data, error } = await supabase
        .from("agent_runs")
        .select("id, agent_type, status, created_at, completed_at, duration_ms")
        .eq("workspace_id", workspaceId)
        .in("agent_type", agentTypes as any)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!workspaceId && agentTypes.length > 0,
    staleTime: 30_000,
  });
}

function useDeptMetrics(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["dept-metrics", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data, error } = await supabase
        .from("ops_metrics_daily")
        .select("*")
        .eq("workspace_id", workspaceId)
        .gte("date", sevenDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!workspaceId,
    staleTime: 60_000,
  });
}

// Map agent capabilities to agent_type enum values
const AGENT_TYPE_MAP: Record<string, string> = {
  "seo-tech-auditor": "tech_auditor",
  "keyword-strategist": "keyword_strategist",
  "content-builder": "content_builder",
  "social-media-manager": "social_manager",
  "offer-architect": "offer_architect",
  "sales-accelerator": "sales_ops",
  "lifecycle-manager": "lifecycle_manager",
  "deal-closer": "sales_ops",
  "revenue-analyst": "analytics_guardian",
  "budget-optimizer": "analytics_guardian",
  "billing-manager": "analytics_guardian",
  "security-auditor": "tech_auditor",
  "access-controller": "tech_auditor",
  "threat-monitor": "tech_auditor",
  "feature-analyst": "analytics_guardian",
  "ux-optimizer": "cro_optimizer",
  "roadmap-planner": "analytics_guardian",
  "backlog-manager": "analytics_guardian",
  "code-reviewer": "tech_auditor",
  "performance-engineer": "tech_auditor",
  "devops-agent": "tech_auditor",
  "api-integrator": "tech_auditor",
  "analytics-guardian": "analytics_guardian",
  "data-engineer": "analytics_guardian",
  "ml-trainer": "analytics_guardian",
  "reporting-agent": "analytics_guardian",
  "reputation-guardian": "reputation_manager",
  "ticket-handler": "reputation_manager",
  "knowledge-manager": "content_builder",
  "compliance-auditor": "quality_compliance",
  "policy-enforcer": "quality_compliance",
  "risk-assessor": "quality_compliance",
  "recruitment-agent": "analytics_guardian",
  "employee-experience": "analytics_guardian",
  "training-coach": "analytics_guardian",
  "performance-manager": "analytics_guardian",
  "contract-analyzer": "analytics_guardian",
  "ip-specialist": "analytics_guardian",
  "regulatory-advisor": "analytics_guardian",
};

export default function DeptDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const { currentWorkspace } = useWorkspace();
  const wsId = currentWorkspace?.id;
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAgent, setNewTaskAgent] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("normal");

  const department = getDepartmentBySlug(slug || "");
  const agents = getAgentsByDepartment(slug || "");

  // Get unique agent_type values for this department
  const agentTypes = [...new Set(agents.map(a => AGENT_TYPE_MAP[a.slug]).filter(Boolean))];

  const { data: runs = [], isLoading: runsLoading } = useDeptRuns(wsId, agentTypes);
  const { data: metricsData, isLoading: metricsLoading } = useDeptMetrics(wsId);

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Bot className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          {lang === "fr" ? "Département introuvable" : "Department not found"}
        </h2>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {lang === "fr" ? "Retour au dashboard" : "Back to dashboard"}
          </Button>
        </Link>
      </div>
    );
  }

  // Compute metrics from ops_metrics_daily
  const computedMetrics = (() => {
    if (!metricsData || metricsData.length === 0) return [];
    const total = metricsData.reduce((acc: any, d: any) => ({
      runs: acc.runs + (d.agent_runs_total || 0),
      success: acc.success + (d.agent_runs_success || 0),
      failed: acc.failed + (d.agent_runs_failed || 0),
      cost: acc.cost + (d.total_cost_usd || 0),
    }), { runs: 0, success: 0, failed: 0, cost: 0 });

    const successRate = total.runs > 0 ? Math.round((total.success / total.runs) * 100) : 0;

    return [
      { label: { fr: "Runs (7j)", en: "Runs (7d)" }, value: String(total.runs), change: "", positive: true },
      { label: { fr: "Taux de succès", en: "Success rate" }, value: `${successRate}%`, change: "", positive: successRate >= 80 },
      { label: { fr: "Échecs", en: "Failures" }, value: String(total.failed), change: "", positive: total.failed === 0 },
      { label: { fr: "Coût IA", en: "AI Cost" }, value: `$${total.cost.toFixed(2)}`, change: "", positive: true },
    ];
  })();

  const DeptIcon = department.icon;

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !newTaskAgent || !wsId) return;
    const agentType = AGENT_TYPE_MAP[newTaskAgent];
    if (!agentType) {
      toast.error(lang === "fr" ? "Type d'agent non mappé" : "Agent type not mapped");
      return;
    }
    const { error } = await supabase.from("agent_runs").insert({
      workspace_id: wsId,
      agent_type: agentType as any,
      status: "pending",
      inputs: { title: newTaskTitle, priority: newTaskPriority },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === "fr" ? `Tâche créée : ${newTaskTitle}` : `Task created: ${newTaskTitle}`);
    }
    setNewTaskTitle("");
    setNewTaskAgent("");
    setNewTaskPriority("normal");
    setNewTaskOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${department.color}20` }}
          >
            <DeptIcon className="w-6 h-6" style={{ color: department.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {department.name[lang]}
            </h1>
            <p className="text-muted-foreground text-sm">
              {department.description[lang]}
            </p>
          </div>
        </div>
        <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {lang === "fr" ? "Nouvelle tâche" : "New Task"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {lang === "fr" ? "Créer une nouvelle tâche" : "Create a new task"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {lang === "fr" ? "Titre de la tâche" : "Task title"}
                </label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={lang === "fr" ? "Ex: Audit SEO du nouveau blog" : "Ex: SEO audit of new blog"}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {lang === "fr" ? "Agent assigné" : "Assigned agent"}
                </label>
                <Select value={newTaskAgent} onValueChange={setNewTaskAgent}>
                  <SelectTrigger>
                    <SelectValue placeholder={lang === "fr" ? "Choisir un agent" : "Choose an agent"} />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.slug} value={agent.slug}>
                        {agent.persona.name} — {agent.role[lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {lang === "fr" ? "Priorité" : "Priority"}
                </label>
                <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">{lang === "fr" ? "Urgent" : "Urgent"}</SelectItem>
                    <SelectItem value="high">{lang === "fr" ? "Haute" : "High"}</SelectItem>
                    <SelectItem value="normal">{lang === "fr" ? "Normale" : "Normal"}</SelectItem>
                    <SelectItem value="low">{lang === "fr" ? "Basse" : "Low"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreateTask} disabled={!newTaskTitle.trim() || !newTaskAgent}>
                {lang === "fr" ? "Créer la tâche" : "Create task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Department Metrics */}
      {metricsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : computedMetrics.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {computedMetrics.map((metric) => (
            <Card key={metric.label[lang]}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{metric.label[lang]}</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-xl font-bold">{metric.value}</span>
                  {metric.change && (
                    <span className={cn("text-xs font-medium", metric.positive ? "text-emerald-500" : "text-red-500")}>
                      {metric.positive && <ArrowUpRight className="w-3 h-3 inline" />}
                      {metric.change}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">
          {lang === "fr" ? "Aucune métrique disponible — lancez des agents pour générer des données." : "No metrics available — run agents to generate data."}
        </CardContent></Card>
      )}

      {/* Agents List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {lang === "fr" ? "Agents du département" : "Department Agents"}
            <Badge variant="secondary" className="ml-2">{agents.length}</Badge>
          </CardTitle>
          <CardDescription>
            {lang === "fr"
              ? "Cliquez sur un agent pour discuter avec lui"
              : "Click an agent to chat with them"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {agents.map((agent) => {
              const agentType = AGENT_TYPE_MAP[agent.slug];
              const agentRuns = runs.filter((r: any) => r.agent_type === agentType);
              const activeRuns = agentRuns.filter((r: any) => r.status === "running" || r.status === "pending");
              return (
                <Link key={agent.slug} to={`/dashboard/agent/${agent.slug}`} className="group">
                  <div className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 bg-secondary/20 hover:bg-secondary/40">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: agent.color }}
                      >
                        {agent.persona.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {agent.persona.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {agent.role[lang]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-muted-foreground">
                          {lang === "fr" ? "Actif" : "Active"}
                        </span>
                      </div>
                      {activeRuns.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {activeRuns.length} {lang === "fr" ? "tâche(s)" : "task(s)"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Runs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {lang === "fr" ? "Exécutions récentes" : "Recent Runs"}
            <Badge variant="secondary" className="ml-2">{runs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {runsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
          ) : runs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {lang === "fr" ? "Aucune exécution récente" : "No recent runs"}
            </p>
          ) : (
            runs.map((run: any) => {
              const agent = agents.find(a => AGENT_TYPE_MAP[a.slug] === run.agent_type);
              const status = statusConfig[run.status] || statusConfig.pending;
              const createdDate = new Date(run.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" });
              return (
                <div key={run.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20 border border-border/50">
                  {agent && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: agent.color }}
                    >
                      {agent.persona.initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {run.agent_type.replace(/_/g, " ")}
                    </p>
                    {agent && <p className="text-xs text-muted-foreground">{agent.persona.name}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className={cn("text-[10px] flex items-center gap-1", status.color)}>
                      {status.icon}
                      {status.label[lang]}
                    </Badge>
                    {run.duration_ms && (
                      <span className="text-[10px] text-muted-foreground">{(run.duration_ms / 1000).toFixed(1)}s</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{createdDate}</span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        &copy; 2026 Growth OS — {lang === "fr" ? "Tous droits réservés" : "All rights reserved"}
      </p>
    </div>
  );
}
