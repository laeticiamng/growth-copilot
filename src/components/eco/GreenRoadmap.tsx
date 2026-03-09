import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, TrendingDown, Euro, Award, TestTube2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface RoadmapAction {
  id: string;
  action: string;
  year: 1 | 2 | 3;
  co2Reduction: number;
  cost: number;
  subsidies: string[];
  roi: number;
  difficulty: "easy" | "medium" | "hard";
}

const DEMO_ACTIONS: RoadmapAction[] = [
  { id: "1", action: "Passage aux LED dans tous les locaux", year: 1, co2Reduction: 12, cost: 8000, subsidies: ["ADEME", "CEE"], roi: 180, difficulty: "easy" },
  { id: "2", action: "Installation de panneaux solaires (50 kWc)", year: 1, co2Reduction: 35, cost: 65000, subsidies: ["ADEME", "Région"], roi: 220, difficulty: "medium" },
  { id: "3", action: "Flotte véhicules électriques (5 véhicules)", year: 1, co2Reduction: 28, cost: 120000, subsidies: ["BPI", "Bonus écologique"], roi: 150, difficulty: "hard" },
  { id: "4", action: "Politique télétravail 3j/semaine", year: 1, co2Reduction: 15, cost: 2000, subsidies: [], roi: 750, difficulty: "easy" },
  { id: "5", action: "Optimisation chaîne logistique verte", year: 2, co2Reduction: 45, cost: 35000, subsidies: ["France 2030"], roi: 280, difficulty: "hard" },
  { id: "6", action: "Achats responsables (fournisseurs labellisés)", year: 2, co2Reduction: 22, cost: 5000, subsidies: ["ADEME"], roi: 340, difficulty: "medium" },
  { id: "7", action: "Green IT — consolidation serveurs", year: 2, co2Reduction: 18, cost: 15000, subsidies: ["France 2030"], roi: 200, difficulty: "medium" },
  { id: "8", action: "Programme zéro déchet", year: 3, co2Reduction: 10, cost: 3000, subsidies: ["ADEME"], roi: 400, difficulty: "easy" },
  { id: "9", action: "Compensation carbone résiduelle", year: 3, co2Reduction: 50, cost: 25000, subsidies: [], roi: 100, difficulty: "easy" },
];

export function GreenRoadmap() {
  const { t } = useTranslation();

  const difficultyConfig = {
    easy: { label: t("eco.difficultyEasy"), className: "bg-emerald-500/20 text-emerald-400" },
    medium: { label: t("eco.difficultyMedium"), className: "bg-amber-500/20 text-amber-400" },
    hard: { label: t("eco.difficultyHard"), className: "bg-red-500/20 text-red-400" },
  };

  const handleGenerate = () => {
    toast({ title: t("common.comingSoon"), description: t("eco.generateAIComingSoon") });
  };

  const renderActions = (year: 1 | 2 | 3) => {
    const actions = DEMO_ACTIONS.filter(a => a.year === year);
    const totalCO2 = actions.reduce((s, a) => s + a.co2Reduction, 0);
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{actions.length} actions — <span className="text-emerald-400 font-semibold">-{totalCO2} tCO₂e</span></p>
        </div>
        {actions.map(action => (
          <Card key={action.id} className="border-border bg-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-sm">{action.action}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <TrendingDown className="h-3 w-3" /> -{action.co2Reduction} tCO₂e
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Euro className="h-3 w-3" /> {action.cost.toLocaleString("fr-FR")} €
                    </span>
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      ROI {action.roi}%
                    </span>
                  </div>
                  {action.subsidies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {action.subsidies.map(s => (
                        <Badge key={s} variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                          <Award className="h-2.5 w-2.5 mr-1" />{s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Badge className={difficultyConfig[action.difficulty].className + " text-[10px]"}>
                  {difficultyConfig[action.difficulty].label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t("eco.roadmapTitle")}</h3>
          <p className="text-sm text-muted-foreground">{t("eco.roadmapDesc")}</p>
        </div>
        <Button onClick={handleGenerate} className="bg-emerald-600 hover:bg-emerald-700">
          <Sparkles className="h-4 w-4 mr-2" />
          {t("eco.generateAI")}
        </Button>
      </div>

      <Tabs defaultValue="year1">
        <TabsList>
          <TabsTrigger value="year1"><Calendar className="h-3.5 w-3.5 mr-1.5" /> {t("eco.year1")}</TabsTrigger>
          <TabsTrigger value="year2"><Calendar className="h-3.5 w-3.5 mr-1.5" /> {t("eco.year2")}</TabsTrigger>
          <TabsTrigger value="year3"><Calendar className="h-3.5 w-3.5 mr-1.5" /> {t("eco.year3")}</TabsTrigger>
        </TabsList>
        <TabsContent value="year1">{renderActions(1)}</TabsContent>
        <TabsContent value="year2">{renderActions(2)}</TabsContent>
        <TabsContent value="year3">{renderActions(3)}</TabsContent>
      </Tabs>
    </div>
  );
}
