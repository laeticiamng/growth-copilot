/**
 * Workspace Settings Page
 * Manage company info, team, integrations, billing, and danger zone
 */
import { useState } from "react";
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

const INDUSTRIES = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "saas", label: "SaaS / Logiciel" },
  { value: "agency", label: "Agence" },
  { value: "consulting", label: "Conseil" },
  { value: "healthcare", label: "Santé" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Éducation" },
  { value: "real_estate", label: "Immobilier" },
  { value: "other", label: "Autre" },
];

const ROLES = [
  { value: "owner", label: "Propriétaire", description: "Accès complet, facturation" },
  { value: "admin", label: "Admin", description: "Gestion équipe, intégrations" },
  { value: "manager", label: "Manager", description: "Gestion opérationnelle" },
  { value: "analyst", label: "Analyste", description: "Visualisation des données" },
  { value: "viewer", label: "Lecteur", description: "Lecture seule" },
];

export default function Settings() {
  const { currentWorkspace, refetch: refetchWorkspaces } = useWorkspace();
  const { isAtLeastRole } = usePermissions();
  const { invitations, sendInvitation, cancelInvitation } = useTeamInvitations();
  
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
      
      toast.success("Informations mises à jour");
      refetchWorkspaces();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la sauvegarde");
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
      toast.success(`Invitation envoyée à ${inviteEmail}`);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'envoi de l'invitation");
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
      
      toast.success("Intégration déconnectée");
      refetchIntegrations();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la déconnexion");
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
      
      toast.success("Workspace supprimé");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
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
      toast.error("Erreur lors de l'ouverture du portail");
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Sélectionnez un workspace</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de votre workspace
        </p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Entreprise</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Équipe</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="w-4 h-4" />
            <span className="hidden sm:inline">Intégrations</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Facturation</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-2 text-destructive">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Danger</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>
                Modifiez les informations de base de votre workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ma Société SAS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyUrl">URL du site principal</Label>
                <Input
                  id="companyUrl"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Secteur d'activité</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveCompany} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Membres de l'équipe</CardTitle>
                <CardDescription>
                  Gérez les accès à votre workspace
                </CardDescription>
              </div>
              {isAtLeastRole("admin") && (
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Inviter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Inviter un membre</DialogTitle>
                      <DialogDescription>
                        Envoyez une invitation par email
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="inviteEmail">Email</Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="collegue@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inviteRole">Rôle</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.filter(r => r.value !== "owner").map((role) => (
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
                        Annuler
                      </Button>
                      <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
                        {inviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                        Envoyer
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
                  <p className="text-sm text-muted-foreground py-4">Aucun membre</p>
                )}
              </div>
              
              {invitations.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-medium mb-3">Invitations en attente</p>
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
              <CardTitle>Intégrations connectées</CardTitle>
              <CardDescription>
                Gérez vos connexions aux services externes
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
                            {integration.status === "active" ? "Connecté" : "Déconnecté"}
                          </Badge>
                          {integration.last_sync_at && (
                            <span className="text-xs text-muted-foreground">
                              Dernière sync: {new Date(integration.last_sync_at).toLocaleDateString()}
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
                        Déconnecter
                      </Button>
                    )}
                  </div>
                ))}
                {integrations.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4">Aucune intégration</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Facturation</CardTitle>
              <CardDescription>
                Gérez votre abonnement et vos paiements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Plan actuel</p>
                    <p className="text-2xl font-bold mt-1 capitalize">{currentWorkspace.plan || "Trial"}</p>
                  </div>
                  <Badge variant="default">Actif</Badge>
                </div>
              </div>
              
              <Button onClick={openStripePortal} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ouvrir le portail de facturation
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Gérez vos moyens de paiement, téléchargez vos factures et modifiez votre abonnement
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
                Zone de danger
              </CardTitle>
              <CardDescription>
                Actions irréversibles sur votre workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <h4 className="font-medium text-destructive mb-2">Supprimer le workspace</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Cette action supprimera définitivement toutes les données, les sites, les rapports, et les intégrations. Cette action est irréversible.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={!isAtLeastRole("owner")}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer le workspace
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Toutes les données seront supprimées.
                        <br /><br />
                        Pour confirmer, tapez <strong>{currentWorkspace.name}</strong> ci-dessous :
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder={currentWorkspace.name}
                      className="my-4"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteWorkspace}
                        disabled={deleteConfirmation !== currentWorkspace.name || deleting}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Supprimer définitivement
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                {!isAtLeastRole("owner") && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Seul le propriétaire peut supprimer le workspace
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
