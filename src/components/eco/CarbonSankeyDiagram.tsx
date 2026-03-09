import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Truck, ShoppingCart, Monitor, Trash2, Factory, Link2, TestTube2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EmissionCategory {
  id: string;
  labelKey: string;
  scope: 1 | 2 | 3;
  value: number;
  percent: number;
  icon: React.ElementType;
  color: string;
}

const DEMO_EMISSIONS: EmissionCategory[] = [
  { id: "heating", labelKey: "eco.catHeating", scope: 1, value: 68, percent: 15, icon: Factory, color: "hsl(0 70% 55%)" },
  { id: "fleet", labelKey: "eco.catFleet", scope: 1, value: 45, percent: 10, icon: Truck, color: "hsl(25 80% 55%)" },
  { id: "electricity", labelKey: "eco.catElectricity", scope: 2, value: 54, percent: 12, icon: Zap, color: "hsl(45 90% 50%)" },
  { id: "transport", labelKey: "eco.catTransport", scope: 3, value: 99, percent: 22, icon: Truck, color: "hsl(200 70% 50%)" },
  { id: "purchases", labelKey: "eco.catPurchases", scope: 3, value: 86, percent: 19, icon: ShoppingCart, color: "hsl(262 70% 60%)" },
  { id: "digital", labelKey: "eco.catDigital", scope: 3, value: 50, percent: 11, icon: Monitor, color: "hsl(187 85% 53%)" },
  { id: "waste", labelKey: "eco.catWaste", scope: 3, value: 32, percent: 7, icon: Trash2, color: "hsl(142 60% 45%)" },
  { id: "commute", labelKey: "eco.catCommute", scope: 3, value: 18, percent: 4, icon: Truck, color: "hsl(330 60% 55%)" },
];

const TOTAL_EMISSIONS = DEMO_EMISSIONS.reduce((s, e) => s + e.value, 0);

const CONNECTORS = [
  { name: "Pennylane" },
  { name: "Sage" },
  { name: "QuickBooks" },
];

export function CarbonSankeyDiagram() {
  const { t } = useTranslation();

  const scopeGroups = [
    { scope: 1, label: t("eco.scope1"), color: "hsl(0 70% 55%)" },
    { scope: 2, label: t("eco.scope2"), color: "hsl(45 90% 50%)" },
    { scope: 3, label: t("eco.scope3"), color: "hsl(200 70% 50%)" },
  ];

  const handleConnector = () => {
    const { toast } = require("@/hooks/use-toast");
    toast({ title: t("common.comingSoon"), description: t("eco.connectorComingSoon") });
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
            {CONNECTORS.map((c) => (
              <Button
                key={c.name}
                variant="outline"
                size="sm"
                onClick={handleConnector}
              >
                {c.name}
                <Badge variant="outline" className="ml-2 text-[10px]">{t("common.comingSoon")}</Badge>
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
                        <span className="text-sm flex-1">{t(item.labelKey)}</span>
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
