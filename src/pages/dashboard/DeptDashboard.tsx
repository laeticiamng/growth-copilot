/**
 * P1 — Vue Département /dashboard/dept/:slug
 * Liste agents, tâches en cours, métriques département, formulaire nouvelle tâche
 */
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DEPARTMENTS_CATALOG,
} from "@/data/agents-catalog";
import {
  getMockTasksForDepartment,
  getMockMetricsForDepartment,
} from "@/data/mock-dashboard";
import { toast } from "sonner";

const statusConfig = {
  in_progress: {
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
  review: {
    label: { fr: "En revue", en: "In review" },
    color: "bg-violet-500/10 text-violet-500",
    icon: <MessageSquare className="w-3 h-3" />,
  },
};

const priorityConfig = {
  urgent: { label: { fr: "Urgent", en: "Urgent" }, color: "bg-red-500/10 text-red-500 border-red-500/20" },
  high: { label: { fr: "Haute", en: "High" }, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  normal: { label: { fr: "Normale", en: "Normal" }, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  low: { label: { fr: "Basse", en: "Low" }, color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
};

export default function DeptDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAgent, setNewTaskAgent] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("normal");

  const department = getDepartmentBySlug(slug || "");
  const agents = getAgentsByDepartment(slug || "");
  const tasks = getMockTasksForDepartment(slug || "");
  const metrics = getMockMetricsForDepartment(slug || "");

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

  const DeptIcon = department.icon;

  const handleCreateTask = () => {
    if (!newTaskTitle.trim() || !newTaskAgent) return;
    toast.success(
      lang === "fr"
        ? `Tâche créée : ${newTaskTitle}`
        : `Task created: ${newTaskTitle}`
    );
    setNewTaskTitle("");
    setNewTaskAgent("");
    setNewTaskPriority("normal");
    setNewTaskOpen(false);
  };

  const getAgentForTask = (agentSlug: string) => agents.find((a) => a.slug === agentSlug);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
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
      <div className={cn("grid gap-4", metrics.length <= 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4")}>
        {metrics.map((metric) => (
          <Card key={metric.label[lang]}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{metric.label[lang]}</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-xl font-bold">{metric.value}</span>
                <span
                  className={cn(
                    "text-xs font-medium flex items-center gap-0.5",
                    metric.positive ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {metric.positive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <span className="w-3 h-3" />
                  )}
                  {metric.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              const agentTasks = tasks.filter((t) => t.agentSlug === agent.slug);
              const activeTasks = agentTasks.filter((t) => t.status === "in_progress" || t.status === "review");
              return (
                <Link
                  key={agent.slug}
                  to={`/dashboard/agent/${agent.slug}`}
                  className="group"
                >
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
                      {activeTasks.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {activeTasks.length} {lang === "fr" ? "tâche(s)" : "task(s)"}
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

      {/* Tasks by Agent */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {lang === "fr" ? "Tâches en cours" : "Current Tasks"}
            <Badge variant="secondary" className="ml-2">{tasks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks.map((task) => {
            const agent = getAgentForTask(task.agentSlug);
            const status = statusConfig[task.status];
            const priority = priorityConfig[task.priority];
            return (
              <div
                key={task.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20 border border-border/50"
              >
                {agent && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.persona.initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title[lang]}</p>
                  {agent && (
                    <p className="text-xs text-muted-foreground">{agent.persona.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className={cn("text-[10px]", priority.color)}>
                    {priority.label[lang]}
                  </Badge>
                  <Badge variant="outline" className={cn("text-[10px] flex items-center gap-1", status.color)}>
                    {status.icon}
                    {status.label[lang]}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{task.dueDate}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        &copy; 2026 EmotionsCare SASU — {lang === "fr" ? "Tous droits réservés" : "All rights reserved"}
      </p>
    </div>
  );
}
