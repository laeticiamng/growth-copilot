import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, ExternalLink, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { EcoSubsidyProject } from "@/hooks/useEco";

interface SubsidyMatcherProps {
  projects: EcoSubsidyProject[];
  onCreateProject: (payload: {
    program_name: string;
    provider: string;
    amount_eur: number | null;
    deadline: string | null;
    eligibility_score: number | null;
    status: "identified" | "drafting" | "submitted" | "won" | "rejected";
    source_url: string | null;
    tags: string[] | null;
  }) => Promise<unknown>;
  isSaving?: boolean;
}

const STATUS_STYLE = {
  identified: "border-slate-500/20 bg-slate-500/10 text-slate-300",
  drafting: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  submitted: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  won: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  rejected: "border-rose-500/20 bg-rose-500/10 text-rose-300",
};

export function SubsidyMatcher({ projects, onCreateProject, isSaving = false }: SubsidyMatcherProps) {
  const { i18n } = useTranslation();
  const [form, setForm] = useState({
    program_name: "",
    provider: "",
    amount_eur: "",
    deadline: "",
    eligibility_score: "",
    status: "identified",
    source_url: "",
    tags: "",
  });

  const copy = useMemo(() => {
    const fr = i18n.language.startsWith("fr");
    return {
      title: fr ? "Pipeline de subventions" : "Subsidy pipeline",
      desc: fr ? "Remplacez les listes statiques par vos vrais dossiers, échéances et statuts." : "Replace static lists with your real funding opportunities, deadlines and statuses.",
      add: fr ? "Ajouter une opportunité" : "Add opportunity",
      emptyTitle: fr ? "Aucun dossier de financement" : "No funding opportunity yet",
      emptyDesc: fr ? "Ajoutez les aides réellement détectées pour prioriser les dossiers à soumettre." : "Add the real funding opportunities you identified to prioritize submissions.",
      statuses: {
        identified: fr ? "Identifiée" : "Identified",
        drafting: fr ? "Montage" : "Drafting",
        submitted: fr ? "Soumise" : "Submitted",
        won: fr ? "Obtenue" : "Won",
        rejected: fr ? "Refusée" : "Rejected",
      },
      saved: fr ? "Opportunité enregistrée" : "Opportunity saved",
      error: fr ? "Impossible d’enregistrer l’opportunité" : "Unable to save opportunity",
      moneyTracked: fr ? "Montant suivi" : "Tracked budget",
      ready: fr ? "Échéances actives" : "Active deadlines",
    };
  }, [i18n.language]);

  const totalTracked = projects.reduce((sum, item) => sum + Number(item.amount_eur || 0), 0);
  const activeDeadlines = projects.filter((item) => item.deadline && ["identified", "drafting", "submitted"].includes(item.status)).length;

  const handleSubmit = async () => {
    if (!form.program_name || !form.provider) {
      toast.error(copy.error);
      return;
    }

    try {
      await onCreateProject({
        program_name: form.program_name,
        provider: form.provider,
        amount_eur: form.amount_eur ? Number(form.amount_eur) : null,
        deadline: form.deadline || null,
        eligibility_score: form.eligibility_score ? Number(form.eligibility_score) : null,
        status: form.status as "identified" | "drafting" | "submitted" | "won" | "rejected",
        source_url: form.source_url || null,
        tags: form.tags ? form.tags.split(",").map((item) => item.trim()).filter(Boolean) : null,
      });
      setForm({ program_name: "", provider: "", amount_eur: "", deadline: "", eligibility_score: "", status: "identified", source_url: "", tags: "" });
      toast.success(copy.saved);
    } catch (error) {
      console.error(error);
      toast.error(copy.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-yellow-500/5 shadow-[0_25px_90px_-50px_rgba(234,179,8,0.45)]">
          <CardHeader>
            <Badge variant="outline" className="mb-3 w-fit border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> live funding matcher
            </Badge>
            <CardTitle>{copy.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{copy.desc}</p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-background/60 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{copy.moneyTracked}</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">{totalTracked.toLocaleString(i18n.language)} €</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-background/60 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{copy.ready}</p>
              <p className="mt-2 text-2xl font-semibold">{activeDeadlines}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-background/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-4 w-4 text-emerald-400" /> {copy.add}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Programme</Label>
                <Input value={form.program_name} onChange={(e) => setForm((prev) => ({ ...prev, program_name: e.target.value }))} placeholder="ADEME Tremplin, BPI, Région..." />
              </div>
              <div className="space-y-2">
                <Label>Organisme</Label>
                <Input value={form.provider} onChange={(e) => setForm((prev) => ({ ...prev, provider: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(copy.statuses).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Montant €</Label>
                <Input type="number" min="0" step="0.01" value={form.amount_eur} onChange={(e) => setForm((prev) => ({ ...prev, amount_eur: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Score d’éligibilité</Label>
                <Input type="number" min="0" max="100" value={form.eligibility_score} onChange={(e) => setForm((prev) => ({ ...prev, eligibility_score: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" value={form.deadline} onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>URL source</Label>
                <Input type="url" value={form.source_url} onChange={(e) => setForm((prev) => ({ ...prev, source_url: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Tags</Label>
                <Input value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} placeholder="énergie, mobilité, immobilier..." />
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={isSaving} className="w-full"><Plus className="mr-2 h-4 w-4" /> {copy.add}</Button>
          </CardContent>
        </Card>
      </div>

      {projects.length === 0 ? (
        <EmptyState icon={Award} title={copy.emptyTitle} description={copy.emptyDesc} compact />
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Card key={project.id} className="border-white/10 bg-background/70 transition-transform hover:-translate-y-0.5 hover:border-emerald-400/30">
              <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className={STATUS_STYLE[project.status]} variant="outline">{copy.statuses[project.status]}</Badge>
                    <Badge variant="secondary">{project.provider}</Badge>
                    {project.deadline && <Badge variant="outline">{new Date(project.deadline).toLocaleDateString(i18n.language)}</Badge>}
                  </div>
                  <h4 className="font-medium">{project.program_name}</h4>
                  {!!project.tags?.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-emerald-300">{Number(project.amount_eur || 0).toLocaleString(i18n.language)} €</p>
                  {project.eligibility_score !== null && project.eligibility_score !== undefined && (
                    <p className="text-xs text-muted-foreground">Score {project.eligibility_score}%</p>
                  )}
                  {project.source_url && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => window.open(project.source_url || "", "_blank", "noopener,noreferrer")}>
                      <ExternalLink className="mr-2 h-3.5 w-3.5" /> Ouvrir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
