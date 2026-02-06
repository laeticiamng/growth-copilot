/**
 * Workspace Settings Page
 * Manage company info, team, integrations, billing, and danger zone
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Building2,
  Users,
  Plug,
  CreditCard,
  Trash2,
  Save,
  Loader2,
  Mail,
  UserPlus,
  ExternalLink,
  X,
  AlertTriangle,
  Unplug,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePermissions } from "@/hooks/usePermissions";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function Settings() {
  const { t } = useTranslation();
  const { currentWorkspace, refetch: refetchWorkspaces } = useWorkspace();
  const { isAtLeastRole } = usePermissions();
  const { invitations, sendInvitation, cancelInvitation } = useTeamInvitations();
  
  // Dynamic industries based on translation
  const industries = [
    { value: "ecommerce", label: t("settings.industries.ecommerce") },
    { value: "saas", label: t("settings.industries.saas") },
    { value: "agency", label: t("settings.industries.agency") },
    { value: "consulting", label: t("settings.industries.consulting") },
    { value: "healthcare", label: t("settings.industries.healthcare") },
    { value: "finance", label: t("settings.industries.finance") },
    { value: "education", label: t("settings.industries.education") },
    { value: "real_estate", label: t("settings.industries.realEstate") },
    { value: "other", label: t("settings.industries.other") },
  ];
  
  // Dynamic roles based on translation
  const roles = [
    { value: "owner", label: t("settings.roles.owner"), description: t("settings.roles.ownerDesc") },
    { value: "admin", label: t("settings.roles.admin"), description: t("settings.roles.adminDesc") },
    { value: "manager", label: t("settings.roles.manager"), description: t("settings.roles.managerDesc") },
    { value: "analyst", label: t("settings.roles.analyst"), description: t("settings.roles.analystDesc") },
    { value: "viewer", label: t("settings.roles.viewer"), description: t("settings.roles.viewerDesc") },
  ];
  
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState(currentWorkspace?.name || "");
  const [companyUrl, setCompanyUrl] = useState("");
  const [industry, setIndustry] = useState("other");
  
  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("analyst");
  const [inviting, setInviting] = useState(false);
  
  // Delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Fetch team members
  const { data: teamMembers = [], refetch: refetchTeam } = useQuery({
    queryKey: ["team-members", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("workspace_id", currentWorkspace.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id,
  });

  // Fetch connected integrations
  const { data: integrations = [], refetch: refetchIntegrations } = useQuery({
    queryKey: ["integrations", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("workspace_id", currentWorkspace.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id,
  });

  const handleSaveCompany = async () => {
    if (!currentWorkspace?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("workspaces")
        .update({ name: companyName })
        .eq("id", currentWorkspace.id);
      
      if (error) throw error;
      
      toast.success(t("settings.toast.infoUpdated"));
      refetchWorkspaces();
    } catch (err) {
      console.error(err);
      toast.error(t("settings.toast.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole) return;
    
    setInviting(true);
    try {
      await sendInvitation(inviteEmail, inviteRole as "admin" | "manager" | "analyst" | "viewer");
      setInviteEmail("");
      setInviteOpen(false);
      toast.success(t("settings.toast.inviteSent", { email: inviteEmail }));
    } catch (err) {
      console.error(err);
      toast.error(t("settings.toast.inviteError"));
    } finally {
      setInviting(false);
    }
  };

  const handleDisconnectIntegration = async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from("integrations")
        .update({ status: "disconnected" })
        .eq("id", integrationId);
      
      if (error) throw error;
      
      toast.success(t("settings.toast.integrationDisconnected"));
      refetchIntegrations();
    } catch (err) {
      console.error(err);
      toast.error(t("settings.toast.disconnectError"));
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace?.id || deleteConfirmation !== currentWorkspace.name) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", currentWorkspace.id);
      
      if (error) throw error;
      
      toast.success(t("settings.toast.workspaceDeleted"));
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      toast.error(t("settings.toast.deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  const openStripePortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("stripe-customer-portal", {
        body: { workspace_id: currentWorkspace?.id },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error(err);
      toast.error(t("settings.toast.portalError"));
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("settings.selectWorkspace")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t("settings.tabs.company")}</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">{t("settings.tabs.team")}</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="w-4 h-4" />
            <span className="hidden sm:inline">{t("settings.tabs.integrations")}</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">{t("settings.tabs.billing")}</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-2 text-destructive">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t("settings.tabs.danger")}</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.company.title")}</CardTitle>
              <CardDescription>
                {t("settings.company.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">{t("settings.company.nameLabel")}</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t("settings.company.namePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyUrl">{t("settings.company.urlLabel")}</Label>
                <Input
                  id="companyUrl"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">{t("settings.company.industryLabel")}</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.company.selectIndustry")} />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveCompany} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {t("settings.save")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("settings.team.title")}</CardTitle>
                <CardDescription>
                  {t("settings.team.description")}
                </CardDescription>
              </div>
              {isAtLeastRole("admin") && (
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t("settings.team.invite")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("settings.team.inviteTitle")}</DialogTitle>
                      <DialogDescription>
                        {t("settings.team.inviteDescription")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="inviteEmail">{t("settings.team.emailLabel")}</Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="collegue@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inviteRole">{t("settings.team.roleLabel")}</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.filter(r => r.value !== "owner").map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                <div>
                                  <p className="font-medium">{role.label}</p>
                                  <p className="text-xs text-muted-foreground">{role.description}</p>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteOpen(false)}>
                        {t("common.cancel")}
                      </Button>
                      <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
                        {inviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                        {t("settings.team.send")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{member.user_id}</p>
                      <Badge variant="secondary" className="mt-1">{member.role}</Badge>
                    </div>
                  </div>
                ))}
                {teamMembers.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4">{t("settings.team.noMembers")}</p>
                )}
              </div>
              
              {invitations.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-medium mb-3">{t("settings.team.pendingInvitations")}</p>
                    <div className="space-y-2">
                      {invitations.filter(i => i.status === "pending").map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between p-2 rounded bg-secondary/50">
                          <div>
                            <p className="text-sm">{inv.email}</p>
                            <Badge variant="outline" className="mt-1">{inv.role}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelInvitation(inv.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.integrations.title")}</CardTitle>
              <CardDescription>
                {t("settings.integrations.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary">
                        <Plug className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{integration.provider.replace("_", " ")}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={integration.status === "active" ? "default" : "secondary"}>
                            {integration.status === "active" ? t("settings.integrations.connected") : t("settings.integrations.disconnected")}
                          </Badge>
                          {integration.last_sync_at && (
                            <span className="text-xs text-muted-foreground">
                              {t("settings.integrations.lastSync")}: {new Date(integration.last_sync_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {integration.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnectIntegration(integration.id)}
                      >
                        <Unplug className="w-4 h-4 mr-2" />
                        {t("settings.integrations.disconnect")}
                      </Button>
                    )}
                  </div>
                ))}
                {integrations.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4">{t("settings.integrations.noIntegrations")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.billing.title")}</CardTitle>
              <CardDescription>
                {t("settings.billing.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("settings.billing.currentPlan")}</p>
                    <p className="text-2xl font-bold mt-1 capitalize">{currentWorkspace.plan || "Trial"}</p>
                  </div>
                  <Badge variant="default">{t("settings.billing.active")}</Badge>
                </div>
              </div>
              
              <Button onClick={openStripePortal} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                {t("settings.billing.openPortal")}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                {t("settings.billing.portalDescription")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="mt-6">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {t("settings.danger.title")}
              </CardTitle>
              <CardDescription>
                {t("settings.danger.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <h4 className="font-medium text-destructive mb-2">{t("settings.danger.deleteWorkspace")}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("settings.danger.deleteWarning")}
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={!isAtLeastRole("owner")}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t("settings.danger.deleteButton")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("settings.danger.confirmTitle")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("settings.danger.confirmDescription")}
                        <br /><br />
                        {t("settings.danger.typeToConfirm", { name: currentWorkspace.name })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder={currentWorkspace.name}
                      className="my-4"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteWorkspace}
                        disabled={deleteConfirmation !== currentWorkspace.name || deleting}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {t("settings.danger.confirmDelete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                {!isAtLeastRole("owner") && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("settings.danger.ownerOnly")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
