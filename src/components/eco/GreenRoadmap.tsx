import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Euro, Plus, Sparkles, TreePine, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import type { EcoRoadmapAction } from "@/hooks/useEco";

interface GreenRoadmapProps {
  actions: EcoRoadmapAction[];
  onCreateAction: (payload: {
    title: string;
    target_year: number;
    status: "planned" | "in_progress" | "completed";
    co2_reduction_tco2e: number | null;
    budget_eur: number | null;
    roi_percent: number | null;
    owner_name: string | null;
    funding_sources: string[] | null;
    notes: string | null;
  }) => Promise<unknown>;
  isSaving?: boolean;
}

const STATUS_TONE = {
  planned: "bg-slate-500/10 text-slate-300 border-slate-400/20",
  in_progress: "bg-amber-500/10 text-amber-300 border-amber-400/20",
  completed: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
};

export function GreenRoadmap({ actions, onCreateAction, isSaving = false }: GreenRoadmapProps) {
  const { i18n } = useTranslation();
  const [form, setForm] = useState({
    title: "",
    target_year: String(new Date().getFullYear()),
    status: "planned",
    co2_reduction_tco2e: "",
    budget_eur: "",
    roi_percent: "",
    owner_name: "",
    funding_sources: "",
    notes: "",
  });

  const copy = useMemo(() => {
    const fr = i18n.language.startsWith("fr");
    return {
      title: fr ? "Roadmap de décarbonation" : "Decarbonization roadmap",
      desc: fr ? "Priorisation intelligente par impact, coût et horizon de livraison." : "Smart prioritization by impact, cost and delivery horizon.",
      emptyTitle: fr ? "Aucune action de transition enregistrée" : "No transition action yet",
      emptyDesc: fr ? "Créez vos vraies actions pour piloter le plan sur 12, 24 et 36 mois." : "Create real actions to manage your 12, 24 and 36 month plan.",
      add: fr ? "Ajouter une action" : "Add action",
      year: fr ? "Année cible" : "Target year",
      owner: fr ? "Responsable" : "Owner",
      roi: fr ? "ROI %" : "ROI %",
      reduction: fr ? "Réduction tCO₂e" : "Reduction tCO₂e",
      budget: fr ? "Budget €" : "Budget €",
      funds: fr ? "Financements (séparés par virgule)" : "Funding sources (comma separated)",
      notes: fr ? "Notes d’exécution" : "Execution notes",
      statuses: {
        planned: fr ? "Planifiée" : "Planned",
        in_progress: fr ? "En cours" : "In progress",
        completed: fr ? "Terminée" : "Completed",
      },
      saved: fr ? "Action roadmap enregistrée" : "Roadmap action saved",
      saveError: fr ? "Impossible d’ajouter l’action" : "Unable to save action",
      projectedImpact: fr ? "Impact projeté" : "Projected impact",
      annualBudget: fr ? "Budget suivi" : "Tracked budget",
      sorted: fr ? "Tri intelligent : d’abord les gains rapides, puis les gros chantiers." : "Smart sorting: quick wins first, then major initiatives.",
    };
  }, [i18n.language]);

  const groupedActions = useMemo(() => {
    return [...actions].sort((a, b) => {
      if (a.status !== b.status) {
        const order = { in_progress: 0, planned: 1, completed: 2 };
        return order[a.status] - order[b.status];
      }
      return (Number(b.roi_percent || 0) + Number(b.co2_reduction_tco2e || 0)) - (Number(a.roi_percent || 0) + Number(a.co2_reduction_tco2e || 0));
    });
  }, [actions]);

  const totalReduction = actions.reduce((sum, action) => sum + Number(action.co2_reduction_tco2e || 0), 0);
  const totalBudget = actions.reduce((sum, action) => sum + Number(action.budget_eur || 0), 0);

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error(copy.saveError);
      return;
    }

    try {
      await onCreateAction({
        title: form.title,
        target_year: Number(form.target_year),
        status: form.status as "planned" | "in_progress" | "completed",
        co2_reduction_tco2e: form.co2_reduction_tco2e ? Number(form.co2_reduction_tco2e) : null,
        budget_eur: form.budget_eur ? Number(form.budget_eur) : null,
        roi_percent: form.roi_percent ? Number(form.roi_percent) : null,
        owner_name: form.owner_name || null,
        funding_sources: form.funding_sources ? form.funding_sources.split(",").map((item) => item.trim()).filter(Boolean) : null,
        notes: form.notes || null,
      });
      setForm({ title: "", target_year: String(new Date().getFullYear()), status: "planned", co2_reduction_tco2e: "", budget_eur: "", roi_percent: "", owner_name: "", funding_sources: "", notes: "" });
      toast.success(copy.saved);
    } catch (error) {
      console.error(error);
      toast.error(copy.saveError);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-lime-500/5 shadow-[0_25px_90px_-50px_rgba(16,185,129,0.6)]">
          <CardHeader>
            <Badge variant="outline" className="mb-3 w-fit border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> smart roadmap
            </Badge>
            <CardTitle>{copy.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{copy.desc}</p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-background/60 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{copy.projectedImpact}</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">-{totalReduction.toFixed(1)} t</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-background/60 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{copy.annualBudget}</p>
              <p className="mt-2 text-2xl font-semibold">{totalBudget.toLocaleString(i18n.language)} €</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-background/60 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{copy.sorted}</p>
              <p className="mt-2 text-sm text-muted-foreground">{actions.length} action(s) orchestrée(s)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-background/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-4 w-4 text-emerald-400" /> {copy.add}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Récupération chaleur, flotte EV, achats verts..." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{copy.year}</Label>
                <Input type="number" value={form.target_year} onChange={(e) => setForm((prev) => ({ ...prev, target_year: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">{copy.statuses.planned}</SelectItem>
                    <SelectItem value="in_progress">{copy.statuses.in_progress}</SelectItem>
                    <SelectItem value="completed">{copy.statuses.completed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{copy.reduction}</Label>
                <Input type="number" min="0" step="0.01" value={form.co2_reduction_tco2e} onChange={(e) => setForm((prev) => ({ ...prev, co2_reduction_tco2e: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{copy.budget}</Label>
                <Input type="number" min="0" step="0.01" value={form.budget_eur} onChange={(e) => setForm((prev) => ({ ...prev, budget_eur: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{copy.roi}</Label>
                <Input type="number" step="0.01" value={form.roi_percent} onChange={(e) => setForm((prev) => ({ ...prev, roi_percent: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{copy.owner}</Label>
                <Input value={form.owner_name} onChange={(e) => setForm((prev) => ({ ...prev, owner_name: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{copy.funds}</Label>
              <Input value={form.funding_sources} onChange={(e) => setForm((prev) => ({ ...prev, funding_sources: e.target.value }))} placeholder="ADEME, CEE, Région..." />
            </div>
            <div className="space-y-2">
              <Label>{copy.notes}</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={3} />
            </div>
            <Button onClick={handleSubmit} disabled={isSaving} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> {copy.add}
            </Button>
          </CardContent>
        </Card>
      </div>

      {groupedActions.length === 0 ? (
        <EmptyState icon={TreePine} title={copy.emptyTitle} description={copy.emptyDesc} compact />
      ) : (
        <div className="grid gap-3">
          {groupedActions.map((action) => (
            <Card key={action.id} className="border-white/10 bg-background/70 transition-transform hover:-translate-y-0.5 hover:border-emerald-400/30">
              <CardContent className="grid gap-4 p-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className={STATUS_TONE[action.status]} variant="outline">{copy.statuses[action.status]}</Badge>
                    <Badge variant="outline"><Calendar className="mr-1 h-3 w-3" /> {action.target_year}</Badge>
                    {action.owner_name && <Badge variant="secondary">{action.owner_name}</Badge>}
                  </div>
                  <h4 className="font-medium">{action.title}</h4>
                  {action.notes && <p className="mt-2 text-sm text-muted-foreground">{action.notes}</p>}
                  {!!action.funding_sources?.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {action.funding_sources.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}
                    </div>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-secondary/40 p-3">
                    <p className="text-xs text-muted-foreground">CO₂</p>
                    <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-emerald-300"><TrendingDown className="h-4 w-4" /> -{Number(action.co2_reduction_tco2e || 0).toFixed(1)} t</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-secondary/40 p-3">
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="mt-1 flex items-center gap-1 text-lg font-semibold"><Euro className="h-4 w-4" /> {Number(action.budget_eur || 0).toLocaleString(i18n.language)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-secondary/40 p-3">
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-300">{Number(action.roi_percent || 0).toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
