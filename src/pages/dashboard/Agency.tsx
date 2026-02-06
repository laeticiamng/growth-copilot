import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Building2,
  Users,
  Plus,
  Settings,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Mail,
  Calendar,
  Loader2,
  Trash2,
} from "lucide-react";
import { useAgency } from "@/hooks/useAgency";
import { LoadingState } from "@/components/ui/loading-state";
import { toast } from "sonner";
import { getIntlLocale } from "@/lib/date-locale";

export default function Agency() {
  const { t, i18n } = useTranslation();
  const { clients, metrics, tasks, team, loading, isAgency, addClient, removeClient, inviteTeamMember } = useAgency();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", slug: "" });
  const [inviteForm, setInviteForm] = useState({ email: "", role: "consultant" });
  const [submitting, setSubmitting] = useState(false);

  const handleAddClient = async () => {
    if (!clientForm.name || !clientForm.slug) {
      toast.error(t("modules.agency.nameSlugRequired"));
      return;
    }
    setSubmitting(true);
    const { error } = await addClient(clientForm.name, clientForm.slug);
    setSubmitting(false);
    if (error) {
      toast.error(t("modules.agency.addClientError"));
    } else {
      toast.success(t("modules.agency.clientAdded"));
      setShowAddDialog(false);
      setClientForm({ name: "", slug: "" });
    }
  };

  const handleRemoveClient = async (clientId: string, clientName: string) => {
    if (!confirm(t("modules.agency.confirmDelete", { name: clientName }))) return;
    const { error } = await removeClient(clientId);
    if (error) {
      toast.error(t("modules.agency.deleteError"));
    } else {
      toast.success(t("modules.agency.clientDeleted"));
    }
  };

  const handleInvite = async () => {
    if (!inviteForm.email) {
      toast.error(t("modules.agency.emailRequired"));
      return;
    }
    setSubmitting(true);
    const { error } = await inviteTeamMember(inviteForm.email, inviteForm.role);
    setSubmitting(false);
    if (error) {
      toast.error(t("modules.agency.inviteError"));
    } else {
      toast.success(t("modules.agency.inviteSent"));
      setShowInviteDialog(false);
      setInviteForm({ email: "", role: "consultant" });
    }
  };

  if (loading) {
    return <LoadingState message={t("modules.agency.loading")} />;
  }

  if (!isAgency) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t("modules.agency.title")}</h1>
          <p className="text-muted-foreground">{t("modules.agency.subtitle")}</p>
        </div>
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">{t("modules.agency.notActivated")}</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {t("modules.agency.notActivatedDesc")}
            </p>
            <Button variant="gradient">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t("modules.agency.upgradePlan")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const agencyMetrics = [
    { label: t("modules.agency.activeClients"), value: metrics.total_clients.toString(), change: t("modules.agency.changeThisMonth", { count: metrics.change_clients }) },
    { label: t("modules.agency.managedSites"), value: metrics.total_sites.toString(), change: t("modules.agency.changeThisMonth", { count: metrics.change_sites }) },
    { label: t("modules.agency.avgHealthScore"), value: `${metrics.avg_health_score}%`, change: `+${metrics.change_health}%` },
    { label: t("modules.agency.totalMRR"), value: `€${metrics.total_mrr.toLocaleString()}`, change: `+${metrics.change_mrr}%` },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("modules.agency.title")}</h1>
          <p className="text-muted-foreground">
            {t("modules.agency.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            {t("modules.agency.globalReport")}
          </Button>
          <Button variant="hero" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("modules.agency.newClient")}
          </Button>
        </div>
      </div>

      {/* Agency metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {agencyMetrics.map((metric, i) => (
          <Card key={i} variant="kpi">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-bold mt-1">{metric.value}</p>
              <p className="text-xs text-chart-3 mt-1">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending tasks */}
      {tasks.length > 0 && (
        <Card className="border-chart-4/30 bg-chart-4/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-chart-4" />
              {t("modules.agency.pendingActions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div>
                    <span className="font-medium">{task.client_name}</span>
                    <span className="text-muted-foreground"> — {task.task}</span>
                  </div>
                  <Badge variant={task.priority === "urgent" ? "destructive" : "outline"}>
                    {task.due_in}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList>
          <TabsTrigger value="clients">
            <Building2 className="w-4 h-4 mr-2" />
            {t("modules.agency.clients")}
          </TabsTrigger>
          <TabsTrigger value="quotas">
            <BarChart3 className="w-4 h-4 mr-2" />
            {t("modules.agency.quotas")}
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="w-4 h-4 mr-2" />
            {t("modules.agency.team")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          {clients.length === 0 ? (
            <Card variant="feature">
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium mb-2">{t("modules.agency.noClient")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("modules.agency.noClientDesc")}
                </p>
                <Button variant="outline" onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("modules.agency.addClient")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            clients.map((client) => (
              <Card key={client.id} variant="feature">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {client.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{client.name}</h3>
                        <Badge variant="secondary">{client.plan}</Badge>
                        {client.issues_count > 5 && (
                          <Badge variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {client.issues_count} issues
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {client.sites_count} site(s) • {t("modules.agency.lastActivity")}: {client.last_activity ? new Date(client.last_activity).toLocaleDateString(getIntlLocale(i18n.language)) : t("modules.agency.recent")}
                      </p>
                    </div>
                    <div className="text-center px-4">
                      <div className="flex items-center gap-1 justify-center">
                        <span className={`text-xl font-bold ${client.health_score >= 80 ? 'text-chart-3' : client.health_score >= 60 ? 'text-chart-4' : 'text-destructive'}`}>
                          {client.health_score}%
                        </span>
                        {client.trend === "up" ? (
                          <TrendingUp className="w-4 h-4 text-chart-3" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-chart-4" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{t("modules.agency.healthScore")}</p>
                    </div>
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Tokens</span>
                        <span>{Math.round(client.tokens_used / 1000)}K / {Math.round(client.tokens_limit / 1000)}K</span>
                      </div>
                      <Progress value={(client.tokens_used / client.tokens_limit) * 100} className="h-1.5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        {t("common.view")}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleRemoveClient(client.id, client.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="quotas" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>{t("modules.agency.globalConsumption")}</CardTitle>
              <CardDescription>{t("modules.agency.resourceUsage")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">{t("modules.agency.aiTokensMonth")}</p>
                  <p className="text-2xl font-bold">
                    {(clients.reduce((sum, c) => sum + c.tokens_used, 0) / 1000000).toFixed(2)}M
                  </p>
                  <Progress 
                    value={clients.reduce((sum, c) => sum + c.tokens_used, 0) / clients.reduce((sum, c) => sum + c.tokens_limit, 1) * 100} 
                    className="h-1.5 mt-2" 
                  />
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">{t("modules.agency.activeSites")}</p>
                  <p className="text-2xl font-bold">{metrics.total_sites}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">{t("modules.agency.pendingIssues")}</p>
                  <p className="text-2xl font-bold">{clients.reduce((sum, c) => sum + c.issues_count, 0)}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">{t("modules.agency.clients")}</p>
                  <p className="text-2xl font-bold">{metrics.total_clients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("modules.agency.agencyTeam")}</CardTitle>
                  <CardDescription>{t("modules.agency.manageAccess")}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowInviteDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("modules.agency.invite")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium">
                      {member.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge variant="secondary">{member.role}</Badge>
                    <span className="text-sm text-muted-foreground">{member.clients_count} {t("modules.agency.clients").toLowerCase()}</span>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Client Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.agency.addClient")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{t("modules.agency.clientName")}</label>
              <Input 
                placeholder="Ex: Tech Solutions"
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("modules.agency.slugLabel")}</label>
              <Input 
                placeholder="Ex: tech-solutions"
                value={clientForm.slug}
                onChange={(e) => setClientForm({ ...clientForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleAddClient} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              {t("modules.agency.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Team Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.agency.inviteMember")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email"
                placeholder="membre@agence.fr"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("modules.agency.role")}</label>
              <select 
                className="w-full mt-1 p-2 rounded-md border border-input bg-background"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              >
                <option value="consultant">Consultant</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleInvite} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              {t("modules.agency.sendInvitation")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
