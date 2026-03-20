import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, FileText, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { EcoReportingSnapshot } from "@/hooks/useEco";

interface ESGReportGeneratorProps {
  snapshots: EcoReportingSnapshot[];
  onCreateSnapshot: (payload: {
    period_label: string;
    csrd_completeness_pct: number;
    climate_score: number;
    social_score: number;
    governance_score: number;
    notes: string | null;
  }) => Promise<unknown>;
  isSaving?: boolean;
}

export function ESGReportGenerator({ snapshots, onCreateSnapshot, isSaving = false }: ESGReportGeneratorProps) {
  const { i18n } = useTranslation();
  const [form, setForm] = useState({ period_label: "", csrd_completeness_pct: "", climate_score: "", social_score: "", governance_score: "", notes: "" });

  const copy = useMemo(() => {
    const fr = i18n.language.startsWith("fr");
    return {
      title: fr ? "Snapshots ESG / CSRD" : "ESG / CSRD snapshots",
      desc: fr ? "Capturez vos scores réels puis exportez-les en JSON pour vos équipes finance, audit ou conseil." : "Capture your real scores, then export them as JSON for finance, audit or advisory teams.",
      emptyTitle: fr ? "Aucun snapshot ESG" : "No ESG snapshot yet",
      emptyDesc: fr ? "Ajoutez au moins une période pour suivre votre maturité et préparer les exports." : "Add at least one reporting period to track maturity and prepare exports.",
      add: fr ? "Ajouter un snapshot" : "Add snapshot",
      saved: fr ? "Snapshot ESG enregistré" : "ESG snapshot saved",
      error: fr ? "Impossible d’enregistrer le snapshot" : "Unable to save snapshot",
      export: fr ? "Exporter JSON" : "Export JSON",
    };
  }, [i18n.language]);

  const latest = snapshots[0];

  const handleSubmit = async () => {
    if (!form.period_label) {
      toast.error(copy.error);
      return;
    }

    try {
      await onCreateSnapshot({
        period_label: form.period_label,
        csrd_completeness_pct: Number(form.csrd_completeness_pct || 0),
        climate_score: Number(form.climate_score || 0),
        social_score: Number(form.social_score || 0),
        governance_score: Number(form.governance_score || 0),
        notes: form.notes || null,
      });
      setForm({ period_label: "", csrd_completeness_pct: "", climate_score: "", social_score: "", governance_score: "", notes: "" });
      toast.success(copy.saved);
    } catch (error) {
      console.error(error);
      toast.error(copy.error);
    }
  };

  const handleExport = () => {
    if (snapshots.length === 0) return;
    const blob = new Blob([JSON.stringify(snapshots, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eco-esg-snapshots-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-emerald-500/20 bg-gradient-to-br from-violet-500/10 via-background to-emerald-500/5 shadow-[0_25px_90px_-55px_rgba(139,92,246,0.45)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-violet-300" /> {copy.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{copy.desc}</p>
          </CardHeader>
          <CardContent>
            {!latest ? (
              <EmptyState icon={FileText} title={copy.emptyTitle} description={copy.emptyDesc} compact />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "CSRD", value: latest.csrd_completeness_pct, color: "text-emerald-300" },
                  { label: "Climate", value: latest.climate_score, color: "text-cyan-300" },
                  { label: "Social", value: latest.social_score, color: "text-amber-300" },
                  { label: "Governance", value: latest.governance_score, color: "text-violet-300" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-background/60 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                    <p className={`mt-2 text-3xl font-semibold ${item.color}`}>{item.value}%</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-background/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">{copy.add}</CardTitle>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={snapshots.length === 0}><Download className="mr-2 h-4 w-4" /> {copy.export}</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Période</Label>
              <Input value={form.period_label} onChange={(e) => setForm((prev) => ({ ...prev, period_label: e.target.value }))} placeholder="Q1 2026 / 2026 annual" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>CSRD %</Label><Input type="number" min="0" max="100" value={form.csrd_completeness_pct} onChange={(e) => setForm((prev) => ({ ...prev, csrd_completeness_pct: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Climate %</Label><Input type="number" min="0" max="100" value={form.climate_score} onChange={(e) => setForm((prev) => ({ ...prev, climate_score: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Social %</Label><Input type="number" min="0" max="100" value={form.social_score} onChange={(e) => setForm((prev) => ({ ...prev, social_score: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Governance %</Label><Input type="number" min="0" max="100" value={form.governance_score} onChange={(e) => setForm((prev) => ({ ...prev, governance_score: e.target.value }))} /></div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>
            <Button onClick={handleSubmit} disabled={isSaving} className="w-full"><Plus className="mr-2 h-4 w-4" /> {copy.add}</Button>
          </CardContent>
        </Card>
      </div>

      {snapshots.length > 0 && (
        <div className="grid gap-3">
          {snapshots.map((snapshot) => (
            <Card key={snapshot.id} className="border-white/10 bg-background/70">
              <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{snapshot.period_label}</Badge>
                    <Badge variant="secondary">CSRD {snapshot.csrd_completeness_pct}%</Badge>
                  </div>
                  {snapshot.notes && <p className="text-sm text-muted-foreground">{snapshot.notes}</p>}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-xs text-muted-foreground">C</p><p className="font-semibold text-cyan-300">{snapshot.climate_score}%</p></div>
                  <div><p className="text-xs text-muted-foreground">S</p><p className="font-semibold text-amber-300">{snapshot.social_score}%</p></div>
                  <div><p className="text-xs text-muted-foreground">G</p><p className="font-semibold text-violet-300">{snapshot.governance_score}%</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
