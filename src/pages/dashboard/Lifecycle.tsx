import { useState } from "react";
 import { useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  Plus,
  Sparkles,
  Loader2,
  Trash2,
  Kanban,
  List,
  Mic,
} from "lucide-react";
import { useLifecycle } from "@/hooks/useLifecycle";
import { LoadingState } from "@/components/ui/loading-state";
import { PipelineKanban } from "@/components/lifecycle/PipelineKanban";
import { SalesScriptGenerator } from "@/components/sales/SalesScriptGenerator";
import { toast } from "sonner";
 import { useWorkspace } from "@/hooks/useWorkspace";
 import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

export default function Lifecycle() {
  const { leads, deals, stages, loading, createLead, deleteLead, updateLead, updateDealStage, createDeal, refetch } = useLifecycle();
   const { currentWorkspace } = useWorkspace();
  
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [pipelineView, setPipelineView] = useState<"kanban" | "grid">("kanban");
  const [leadForm, setLeadForm] = useState({ name: "", email: "", company: "", phone: "", source: "direct" });
  const [dealForm, setDealForm] = useState({ title: "", lead_id: "", value: 0 });
  const [submitting, setSubmitting] = useState(false);
 
   // Real-time subscriptions for CRM data
   const handleRealtimeUpdate = useCallback(() => {
     refetch();
   }, [refetch]);
 
   useRealtimeSubscription(
     `lifecycle-leads-${currentWorkspace?.id}`,
     {
       table: 'leads',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     handleRealtimeUpdate,
     !!currentWorkspace?.id
   );
 
   useRealtimeSubscription(
     `lifecycle-deals-${currentWorkspace?.id}`,
     {
       table: 'deals',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     handleRealtimeUpdate,
     !!currentWorkspace?.id
   );

  // Calculate pipeline stages from deals
  const pipelineData = stages.length > 0 ? stages.map(stage => {
    const stageDeals = deals.filter(d => d.stage_id === stage.id);
    return {
      name: stage.name,
      count: stageDeals.length,
      value: `€${stageDeals.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString()}`,
      color: stage.color || "bg-primary",
    };
  }) : [
    { name: "Nouveaux", count: leads.filter(l => l.status === 'new').length, value: "€0", color: "bg-blue-500" },
    { name: "Contactés", count: leads.filter(l => l.status === 'contacted').length, value: "€0", color: "bg-yellow-500" },
    { name: "Qualifiés", count: leads.filter(l => l.status === 'qualified').length, value: "€0", color: "bg-orange-500" },
    { name: "Gagnés", count: leads.filter(l => l.status === 'converted').length, value: "€0", color: "bg-green-500" },
  ];

  // Calculate metrics
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified' || l.status === 'converted').length;
  const closedDeals = deals.filter(d => d.won === true).length;
  const totalDealValue = deals.filter(d => d.won === true).reduce((sum, d) => sum + (d.value || 0), 0);

  const salesMetrics = [
    { label: "Total Leads", value: totalLeads.toString() },
    { label: "Qualifiés", value: qualifiedLeads.toString() },
    { label: "Deals gagnés", value: closedDeals.toString() },
    { label: "Valeur totale", value: `€${totalDealValue.toLocaleString()}` },
  ];

  const handleCreateLead = async () => {
    if (!leadForm.name || !leadForm.email) {
      toast.error("Nom et email requis");
      return;
    }
    setSubmitting(true);
    const { error } = await createLead(leadForm);
    setSubmitting(false);
    if (error) {
      toast.error("Erreur lors de la création");
    } else {
      toast.success("Lead créé");
      setShowLeadDialog(false);
      setLeadForm({ name: "", email: "", company: "", phone: "", source: "direct" });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    const { error } = await deleteLead(leadId);
    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Lead supprimé");
    }
  };

  const handleMoveDeal = async (dealId: string, newStageId: string) => {
    const { error } = await updateDealStage(dealId, newStageId);
    if (error) {
      toast.error("Erreur lors du déplacement");
    }
  };

  const handleAddDeal = (stageId: string) => {
    setSelectedStageId(stageId);
    setDealForm({ title: "", lead_id: "", value: 0 });
    setShowDealDialog(true);
  };

  const handleCreateDeal = async () => {
    if (!dealForm.title || !dealForm.lead_id) {
      toast.error("Titre et lead requis");
      return;
    }
    setSubmitting(true);
    const { error } = await createDeal({
      title: dealForm.title,
      lead_id: dealForm.lead_id,
      stage_id: selectedStageId,
      value: dealForm.value || null,
      probability: 50,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erreur lors de la création");
    } else {
      toast.success("Deal créé");
      setShowDealDialog(false);
      setDealForm({ title: "", lead_id: "", value: 0 });
    }
  };

  if (loading) {
    return <LoadingState message="Chargement des données CRM..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold flex items-center gap-2">
             Lifecycle & CRM
             <span className="relative w-2 h-2 bg-primary rounded-full animate-pulse" />
           </h1>
          <p className="text-muted-foreground">
            Pipeline de vente et automatisations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Workflows
          </Button>
          <Button variant="hero" onClick={() => setShowLeadDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau lead
          </Button>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {salesMetrics.map((metric, i) => (
          <Card key={i} variant="kpi">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-bold mt-1">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="scripts">Scripts vente</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pipeline de vente</CardTitle>
                  <CardDescription>
                    {deals.length} opportunités • Drag & drop pour déplacer
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={pipelineView === "kanban" ? "secondary" : "ghost"} 
                    size="sm"
                    onClick={() => setPipelineView("kanban")}
                  >
                    <Kanban className="w-4 h-4 mr-1" />
                    Kanban
                  </Button>
                  <Button 
                    variant={pipelineView === "grid" ? "secondary" : "ghost"} 
                    size="sm"
                    onClick={() => setPipelineView("grid")}
                  >
                    <List className="w-4 h-4 mr-1" />
                    Grille
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {pipelineView === "kanban" ? (
                <PipelineKanban
                  stages={stages.map(s => ({
                    id: s.id,
                    name: s.name,
                    position: s.position,
                    color: s.color,
                  }))}
                  deals={deals.map(d => ({
                    id: d.id,
                    title: d.title,
                    lead_id: d.lead_id,
                    stage_id: d.stage_id,
                    value: d.value,
                    probability: d.probability,
                  }))}
                  leads={leads.map(l => ({
                    id: l.id,
                    name: l.name,
                    company: l.company,
                    email: l.email,
                    phone: l.phone,
                    status: l.status,
                    score: l.score,
                  }))}
                  onMoveCard={handleMoveDeal}
                  onAddDeal={handleAddDeal}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {pipelineData.map((stage, i) => (
                    <div key={i} className="text-center">
                      <div className={`h-24 rounded-lg ${stage.color} bg-opacity-20 flex flex-col items-center justify-center p-2`}>
                        <span className="text-2xl font-bold">{stage.count}</span>
                        <span className="text-xs text-muted-foreground">{stage.value}</span>
                      </div>
                      <p className="text-xs font-medium mt-2">{stage.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Leads</CardTitle>
                  <CardDescription>{leads.length} leads au total</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowLeadDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {leads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Aucun lead</p>
                  <p className="text-sm mt-1">Créez votre premier lead</p>
                </div>
              ) : (
                leads.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium">
                      {lead.name[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{lead.name}</p>
                        <Badge
                          variant={
                            lead.status === "new"
                              ? "gradient"
                              : lead.status === "qualified"
                              ? "secondary"
                              : lead.status === "converted"
                              ? "success"
                              : "outline"
                          }
                        >
                          {lead.status === "new" ? "Nouveau" : lead.status === "qualified" ? "Qualifié" : lead.status === "converted" ? "Converti" : lead.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{lead.company || lead.email} • {lead.source}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" title="Email">
                        <Mail className="w-4 h-4" />
                      </Button>
                      {lead.phone && (
                        <Button variant="ghost" size="sm" title="Téléphone">
                          <Phone className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive" 
                        onClick={() => handleDeleteLead(lead.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-6">
          <SalesScriptGenerator />
        </TabsContent>
      </Tabs>

      {/* Create Lead Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nom *</label>
              <Input 
                placeholder="Jean Dupont"
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input 
                type="email"
                placeholder="jean@example.com"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Entreprise</label>
                <Input 
                  placeholder="Acme Inc"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <Input 
                  placeholder="+33 6 12 34 56 78"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLeadDialog(false)}>Annuler</Button>
            <Button onClick={handleCreateLead} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Deal Dialog */}
      <Dialog open={showDealDialog} onOpenChange={setShowDealDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Titre *</label>
              <Input 
                placeholder="Contrat annuel..."
                value={dealForm.title}
                onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Lead associé *</label>
              <Select 
                value={dealForm.lead_id} 
                onValueChange={(value) => setDealForm({ ...dealForm, lead_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} {lead.company ? `(${lead.company})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Valeur estimée (€)</label>
              <Input 
                type="number"
                placeholder="10000"
                value={dealForm.value || ""}
                onChange={(e) => setDealForm({ ...dealForm, value: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDealDialog(false)}>Annuler</Button>
            <Button onClick={handleCreateDeal} disabled={submitting || leads.length === 0}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer le deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
