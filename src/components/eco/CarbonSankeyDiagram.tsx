import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Factory, Plus, Sparkles, Truck, Zap, Leaf, Building2 } from "lucide-react";
import { toast } from "sonner";
import type { EcoEmissionSource } from "@/hooks/useEco";

interface CarbonSankeyDiagramProps {
  emissionSources: EcoEmissionSource[];
  onCreateSource: (payload: {
    source_name: string;
    category: string;
    scope: 1 | 2 | 3;
    annual_emissions_tco2e: number;
    methodology: string | null;
  }) => Promise<unknown>;
  isSaving?: boolean;
}

const SCOPE_META = {
  1: { label: "Scope 1", color: "from-rose-500/30 to-orange-500/10", accent: "bg-rose-400", icon: Factory },
  2: { label: "Scope 2", color: "from-amber-500/30 to-yellow-500/10", accent: "bg-amber-400", icon: Zap },
  3: { label: "Scope 3", color: "from-cyan-500/30 to-blue-500/10", accent: "bg-cyan-400", icon: Truck },
} as const;

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  energie: Zap,
  transport: Truck,
  achats: Building2,
  chauffage: Factory,
};

export function CarbonSankeyDiagram({ emissionSources, onCreateSource, isSaving = false }: CarbonSankeyDiagramProps) {
  const { i18n } = useTranslation();
  const [form, setForm] = useState({
    source_name: "",
    category: "energie",
    scope: "2",
    annual_emissions_tco2e: "",
    methodology: "",
  });

  const copy = useMemo(() => {
    const fr = i18n.language.startsWith("fr");
    return {
      title: fr ? "Cartographie carbone réelle" : "Live carbon map",
      desc: fr ? "Centralisez vos postes d’émissions réels par site, scope et méthodologie." : "Track real emission sources per site, scope and methodology.",
      cta: fr ? "Ajouter une source" : "Add source",
      emptyTitle: fr ? "Aucune source carbone enregistrée" : "No carbon source recorded",
      emptyDesc: fr ? "Commencez par saisir vos postes principaux pour alimenter le cockpit, la roadmap et les rapports ESG." : "Add your main emission sources to power the cockpit, roadmap and ESG reports.",
      total: fr ? "Total annuel" : "Annual total",
      method: fr ? "Méthode" : "Method",
      source: fr ? "Source" : "Source",
      category: fr ? "Catégorie" : "Category",
      scope: fr ? "Scope" : "Scope",
      emissions: fr ? "Émissions annuelles (tCO₂e)" : "Annual emissions (tCO₂e)",
      methodology: fr ? "Méthodologie / preuve" : "Methodology / proof",
      categories: {
        energie: fr ? "Énergie" : "Energy",
        transport: fr ? "Transport" : "Transport",
        achats: fr ? "Achats" : "Purchases",
        chauffage: fr ? "Chauffage" : "Heating",
      },
      added: fr ? "Source carbone enregistrée" : "Carbon source saved",
      addError: fr ? "Impossible d’enregistrer la source" : "Unable to save source",
    };
  }, [i18n.language]);

  const totalEmissions = emissionSources.reduce((sum, item) => sum + Number(item.annual_emissions_tco2e || 0), 0);
  const scopes = [1, 2, 3].map((scope) => {
    const items = emissionSources.filter((item) => item.scope === scope);
    const total = items.reduce((sum, item) => sum + Number(item.annual_emissions_tco2e || 0), 0);
    return { scope: scope as 1 | 2 | 3, items, total };
  });

  const handleSubmit = async () => {
    if (!form.source_name || !form.annual_emissions_tco2e) {
      toast.error(copy.addError);
      return;
    }

    try {
      await onCreateSource({
        source_name: form.source_name,
        category: form.category,
        scope: Number(form.scope) as 1 | 2 | 3,
        annual_emissions_tco2e: Number(form.annual_emissions_tco2e),
        methodology: form.methodology || null,
      });
      setForm({ source_name: "", category: "energie", scope: "2", annual_emissions_tco2e: "", methodology: "" });
      toast.success(copy.added);
    } catch (error) {
      console.error(error);
      toast.error(copy.addError);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.95fr]">
        <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/12 via-background to-cyan-500/8 shadow-[0_24px_80px_-40px_rgba(16,185,129,0.55)]">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="outline" className="mb-3 border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> premium 3D carbon cockpit
                </Badge>
                <CardTitle className="text-xl">{copy.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{copy.desc}</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-background/60 px-4 py-3 text-right backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{copy.total}</p>
                <p className="text-3xl font-semibold text-emerald-300">{totalEmissions.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">tCO₂e</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {scopes.map(({ scope, total, items }) => {
              const meta = SCOPE_META[scope];
              const Icon = meta.icon;
              const width = totalEmissions > 0 ? Math.max((total / totalEmissions) * 100, 6) : 0;

              return (
                <div key={scope} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${meta.color} p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl border border-white/10 bg-background/60 p-2 backdrop-blur">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{meta.label}</p>
                        <p className="text-xs text-muted-foreground">{items.length} ligne(s)</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{total.toFixed(1)} t</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full ${meta.accent} rounded-full transition-all duration-500`} style={{ width: `${width}%` }} />
                  </div>
                  <div className="mt-3 space-y-2">
                    {items.slice(0, 3).map((item) => {
                      const ItemIcon = CATEGORY_ICONS[item.category] || Leaf;
                      return (
                        <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-background/55 px-3 py-2 backdrop-blur">
                          <div className="flex min-w-0 items-center gap-2">
                            <ItemIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate text-sm">{item.source_name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{Number(item.annual_emissions_tco2e).toFixed(1)} t</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-background/80 shadow-[0_20px_70px_-50px_rgba(34,211,238,0.65)] backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-4 w-4 text-emerald-400" /> {copy.cta}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{copy.source}</Label>
                <Input value={form.source_name} onChange={(e) => setForm((prev) => ({ ...prev, source_name: e.target.value }))} placeholder="Data center Paris / flotte / chauffage" />
              </div>
              <div className="space-y-2">
                <Label>{copy.category}</Label>
                <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(copy.categories).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{copy.scope}</Label>
                <Select value={form.scope} onValueChange={(value) => setForm((prev) => ({ ...prev, scope: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Scope 1</SelectItem>
                    <SelectItem value="2">Scope 2</SelectItem>
                    <SelectItem value="3">Scope 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{copy.emissions}</Label>
                <Input type="number" min="0" step="0.01" value={form.annual_emissions_tco2e} onChange={(e) => setForm((prev) => ({ ...prev, annual_emissions_tco2e: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{copy.methodology}</Label>
                <Input value={form.methodology} onChange={(e) => setForm((prev) => ({ ...prev, methodology: e.target.value }))} placeholder="Factures, ERP, bilan fournisseur..." />
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={isSaving} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> {copy.cta}
            </Button>
          </CardContent>
        </Card>
      </div>

      {emissionSources.length === 0 ? (
        <EmptyState icon={Leaf} title={copy.emptyTitle} description={copy.emptyDesc} compact />
      ) : (
        <div className="grid gap-3">
          {emissionSources.map((item) => {
            const ItemIcon = CATEGORY_ICONS[item.category] || Leaf;
            return (
              <Card key={item.id} className="border-white/10 bg-background/70 transition-transform hover:-translate-y-0.5 hover:border-emerald-400/30">
                <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-white/10 bg-secondary/50 p-2">
                      <ItemIcon className="h-4 w-4 text-emerald-300" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.source_name}</p>
                        <Badge variant="outline">Scope {item.scope}</Badge>
                        <Badge variant="secondary">{copy.categories[item.category as keyof typeof copy.categories] || item.category}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{copy.method}: {item.methodology || "—"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{Number(item.annual_emissions_tco2e).toFixed(2)} tCO₂e</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.updated_at).toLocaleDateString(i18n.language)}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
