import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Truck, ShoppingCart, Monitor, Trash2, Factory, Link2 } from "lucide-react";

interface EmissionCategory {
  id: string;
  label: string;
  scope: 1 | 2 | 3;
  value: number;
  percent: number;
  icon: React.ElementType;
  color: string;
}

const DEMO_EMISSIONS: EmissionCategory[] = [
  { id: "heating", label: "Chauffage & climatisation", scope: 1, value: 68, percent: 15, icon: Factory, color: "hsl(0 70% 55%)" },
  { id: "fleet", label: "Flotte véhicules", scope: 1, value: 45, percent: 10, icon: Truck, color: "hsl(25 80% 55%)" },
  { id: "electricity", label: "Électricité", scope: 2, value: 54, percent: 12, icon: Zap, color: "hsl(45 90% 50%)" },
  { id: "transport", label: "Transport marchandises", scope: 3, value: 99, percent: 22, icon: Truck, color: "hsl(200 70% 50%)" },
  { id: "purchases", label: "Achats & fournitures", scope: 3, value: 86, percent: 19, icon: ShoppingCart, color: "hsl(262 70% 60%)" },
  { id: "digital", label: "Infrastructure digitale", scope: 3, value: 50, percent: 11, icon: Monitor, color: "hsl(187 85% 53%)" },
  { id: "waste", label: "Déchets", scope: 3, value: 32, percent: 7, icon: Trash2, color: "hsl(142 60% 45%)" },
  { id: "commute", label: "Déplacements employés", scope: 3, value: 18, percent: 4, icon: Truck, color: "hsl(330 60% 55%)" },
];

const TOTAL_EMISSIONS = DEMO_EMISSIONS.reduce((s, e) => s + e.value, 0);

const CONNECTORS = [
  { name: "Pennylane", connected: false },
  { name: "Sage", connected: false },
  { name: "QuickBooks", connected: false },
];

export function CarbonSankeyDiagram() {
  const { t } = useTranslation();
  const [connectors, setConnectors] = useState(CONNECTORS);

  const scopeGroups = [
    { scope: 1, label: "Scope 1 — Émissions directes", color: "hsl(0 70% 55%)" },
    { scope: 2, label: "Scope 2 — Énergie indirecte", color: "hsl(45 90% 50%)" },
    { scope: 3, label: "Scope 3 — Chaîne de valeur", color: "hsl(200 70% 50%)" },
  ];

  const toggleConnector = (idx: number) => {
    setConnectors(prev => prev.map((c, i) => i === idx ? { ...c, connected: !c.connected } : c));
  };

  return (
    <div className="space-y-6">
      {/* Connector Panel */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4 text-emerald-500" />
            {t("eco.connectors")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {connectors.map((c, i) => (
              <Button
                key={c.name}
                variant={c.connected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleConnector(i)}
                className={c.connected ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
              >
                {c.name}
                {c.connected && <Badge variant="success" className="ml-2 text-[10px]">Connecté</Badge>}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("eco.connectorsDesc")}
          </p>
        </CardContent>
      </Card>

      {/* Total */}
      <div className="text-center">
        <p className="text-4xl font-bold text-emerald-400">{TOTAL_EMISSIONS} <span className="text-lg text-muted-foreground">tCO₂e/an</span></p>
        <p className="text-sm text-muted-foreground mt-1">{t("eco.totalEmissions")}</p>
      </div>

      {/* Sankey-style visualization */}
      <div className="space-y-4">
        {scopeGroups.map(sg => {
          const items = DEMO_EMISSIONS.filter(e => e.scope === sg.scope);
          const scopeTotal = items.reduce((s, e) => s + e.value, 0);
          return (
            <Card key={sg.scope} className="border-border bg-card overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{sg.label}</CardTitle>
                  <span className="text-sm font-bold" style={{ color: sg.color }}>{scopeTotal} tCO₂e</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="group">
                      <div className="flex items-center gap-3 mb-1">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.value} tCO₂e</span>
                        <Badge variant="outline" className="text-[10px] min-w-[40px] justify-center">{item.percent}%</Badge>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${item.percent}%`,
                            background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                            animation: `sankey-flow-${idx} 1.5s ease-out`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <style>{`
        @keyframes sankey-flow-0 { from { width: 0; } }
        @keyframes sankey-flow-1 { from { width: 0; } }
        @keyframes sankey-flow-2 { from { width: 0; } }
        @keyframes sankey-flow-3 { from { width: 0; } }
        @keyframes sankey-flow-4 { from { width: 0; } }
        @keyframes sankey-flow-5 { from { width: 0; } }
        @keyframes sankey-flow-6 { from { width: 0; } }
        @keyframes sankey-flow-7 { from { width: 0; } }
      `}</style>
    </div>
  );
}
