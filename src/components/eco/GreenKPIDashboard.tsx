import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Plus, Sparkles, Sun, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import type { EcoMonthlyMetric } from "@/hooks/useEco";

interface GreenKPIDashboardProps {
  metrics: EcoMonthlyMetric[];
  onCreateMetric: (payload: {
    month: string;
    energy_kwh: number | null;
    waste_recycled_pct: number | null;
    renewable_energy_pct: number | null;
    carbon_intensity_g_per_eur: number | null;
  }) => Promise<unknown>;
  isSaving?: boolean;
}

function MetricCard({ title, value, suffix, color, icon: Icon }: { title: string; value: number; suffix: string; color: string; icon: React.ElementType }) {
  return (
    <Card className="border-white/10 bg-background/70">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color }}>{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{suffix}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-background/60 p-3">
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GreenKPIDashboard({ metrics, onCreateMetric, isSaving = false }: GreenKPIDashboardProps) {
  const { i18n } = useTranslation();
  const [form, setForm] = useState({ month: "", energy_kwh: "", waste_recycled_pct: "", renewable_energy_pct: "", carbon_intensity_g_per_eur: "" });

  const copy = useMemo(() => {
    const fr = i18n.language.startsWith("fr");
    return {
      title: fr ? "KPIs environnementaux" : "Environmental KPIs",
      desc: fr ? "Courbes réelles, sans seed artificiel : importez vos valeurs mensuelles." : "Real charts with no seeded data: log your monthly values.",
      add: fr ? "Ajouter un mois" : "Add month",
      emptyTitle: fr ? "Aucune métrique mensuelle" : "No monthly metric yet",
      emptyDesc: fr ? "Enregistrez vos données énergie, recyclage et intensité carbone pour débloquer les tendances." : "Store your energy, recycling and carbon intensity data to unlock trend views.",
      saved: fr ? "Métrique mensuelle enregistrée" : "Monthly metric saved",
      error: fr ? "Impossible d’enregistrer la métrique" : "Unable to save metric",
    };
  }, [i18n.language]);

  const sortedMetrics = useMemo(() => [...metrics].sort((a, b) => a.month.localeCompare(b.month)), [metrics]);
  const latest = sortedMetrics[sortedMetrics.length - 1];

  const chartData = sortedMetrics.map((item) => ({
    month: new Date(item.month).toLocaleDateString(i18n.language, { month: "short", year: "2-digit" }),
    energy: Number(item.energy_kwh || 0),
    waste: Number(item.waste_recycled_pct || 0),
    renewable: Number(item.renewable_energy_pct || 0),
    intensity: Number(item.carbon_intensity_g_per_eur || 0),
  }));

  const handleSubmit = async () => {
    if (!form.month) {
      toast.error(copy.error);
      return;
    }

    try {
      await onCreateMetric({
        month: form.month,
        energy_kwh: form.energy_kwh ? Number(form.energy_kwh) : null,
        waste_recycled_pct: form.waste_recycled_pct ? Number(form.waste_recycled_pct) : null,
        renewable_energy_pct: form.renewable_energy_pct ? Number(form.renewable_energy_pct) : null,
        carbon_intensity_g_per_eur: form.carbon_intensity_g_per_eur ? Number(form.carbon_intensity_g_per_eur) : null,
      });
      setForm({ month: "", energy_kwh: "", waste_recycled_pct: "", renewable_energy_pct: "", carbon_intensity_g_per_eur: "" });
      toast.success(copy.saved);
    } catch (error) {
      console.error(error);
      toast.error(copy.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-emerald-500/20 bg-gradient-to-br from-cyan-500/10 via-background to-emerald-500/10 shadow-[0_25px_90px_-55px_rgba(34,211,238,0.55)]">
          <CardHeader>
            <Badge variant="outline" className="mb-3 w-fit border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> live KPI stream
            </Badge>
            <CardTitle>{copy.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{copy.desc}</p>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <EmptyState icon={BarChart3} title={copy.emptyTitle} description={copy.emptyDesc} compact />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard title="Énergie" value={Number(latest?.energy_kwh || 0)} suffix="kWh" color="hsl(45 93% 58%)" icon={Zap} />
                  <MetricCard title="Recyclage" value={Number(latest?.waste_recycled_pct || 0)} suffix="%" color="hsl(142 76% 45%)" icon={Trash2} />
                  <MetricCard title="Renouvelable" value={Number(latest?.renewable_energy_pct || 0)} suffix="%" color="hsl(187 85% 53%)" icon={Sun} />
                  <MetricCard title="Intensité carbone" value={Number(latest?.carbon_intensity_g_per_eur || 0)} suffix="gCO₂/€" color="hsl(262 83% 65%)" icon={BarChart3} />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-white/10 bg-background/55">
                    <CardHeader><CardTitle className="text-base">Énergie & intensité</CardTitle></CardHeader>
                    <CardContent className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip />
                          <Area type="monotone" dataKey="energy" stroke="hsl(45 93% 58%)" fill="hsl(45 93% 58% / 0.16)" strokeWidth={2} />
                          <Area type="monotone" dataKey="intensity" stroke="hsl(262 83% 65%)" fill="hsl(262 83% 65% / 0.16)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card className="border-white/10 bg-background/55">
                    <CardHeader><CardTitle className="text-base">Recyclage & renouvelable</CardTitle></CardHeader>
                    <CardContent className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip />
                          <Area type="monotone" dataKey="waste" stroke="hsl(142 76% 45%)" fill="hsl(142 76% 45% / 0.16)" strokeWidth={2} />
                          <Area type="monotone" dataKey="renewable" stroke="hsl(187 85% 53%)" fill="hsl(187 85% 53% / 0.16)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-background/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-4 w-4 text-cyan-400" /> {copy.add}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mois</Label>
              <Input type="month" value={form.month} onChange={(e) => setForm((prev) => ({ ...prev, month: `${e.target.value}-01` }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Énergie kWh</Label><Input type="number" min="0" step="0.01" value={form.energy_kwh} onChange={(e) => setForm((prev) => ({ ...prev, energy_kwh: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Recyclage %</Label><Input type="number" min="0" max="100" step="0.01" value={form.waste_recycled_pct} onChange={(e) => setForm((prev) => ({ ...prev, waste_recycled_pct: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Énergie renouvelable %</Label><Input type="number" min="0" max="100" step="0.01" value={form.renewable_energy_pct} onChange={(e) => setForm((prev) => ({ ...prev, renewable_energy_pct: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Intensité carbone gCO₂/€</Label><Input type="number" min="0" step="0.01" value={form.carbon_intensity_g_per_eur} onChange={(e) => setForm((prev) => ({ ...prev, carbon_intensity_g_per_eur: e.target.value }))} /></div>
            </div>
            <Button onClick={handleSubmit} disabled={isSaving} className="w-full"><Plus className="mr-2 h-4 w-4" /> {copy.add}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
