/**
 * ROI Calculator Component
 * Agent: François Martin (Finance Analyst)
 * Calculates: ROI, cost per lead, executive commentary
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Loader2, 
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Download,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/useWorkspace";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface CostsForm {
  growthOS: number;
  adsSpend: number;
  tools: number;
  humanHours: number;
  hourlyRate: number;
}

interface ResultsForm {
  leadsGenerated: number;
  conversions: number;
  revenueAttributable: number;
}

interface ExecutiveCommentary {
  summary: string;
  highlights: string[];
  recommendations: string[];
}

export function ROICalculator() {
  const { currentWorkspace } = useWorkspace();
  const [costs, setCosts] = useState<CostsForm>({
    growthOS: 490,
    adsSpend: 0,
    tools: 0,
    humanHours: 0,
    hourlyRate: 45,
  });
  const [results, setResults] = useState<ResultsForm>({
    leadsGenerated: 0,
    conversions: 0,
    revenueAttributable: 0,
  });
  const [generating, setGenerating] = useState(false);
  const [commentary, setCommentary] = useState<ExecutiveCommentary | null>(null);

  // Calculations
  const calculations = useMemo(() => {
    const totalCosts = costs.growthOS + costs.adsSpend + costs.tools + (costs.humanHours * costs.hourlyRate);
    const costPerLead = results.leadsGenerated > 0 ? totalCosts / results.leadsGenerated : 0;
    const costPerAcquisition = results.conversions > 0 ? totalCosts / results.conversions : 0;
    const roi = totalCosts > 0 ? ((results.revenueAttributable - totalCosts) / totalCosts) * 100 : 0;
    const humanEquivalentCost = 4500 * 3; // 3 FTE equivalent at avg French salary
    const savingsVsTraditional = humanEquivalentCost - totalCosts;
    
    return {
      totalCosts,
      costPerLead,
      costPerAcquisition,
      roi,
      humanEquivalentCost,
      savingsVsTraditional,
    };
  }, [costs, results]);

  // Mock chart data
  const chartData = useMemo(() => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
    return months.map((month, i) => ({
      month,
      roi: Math.max(0, calculations.roi * (0.5 + i * 0.1)),
      leads: Math.round(results.leadsGenerated * (0.7 + i * 0.06)),
    }));
  }, [calculations.roi, results.leadsGenerated]);

  const handleGenerateCommentary = async () => {
    if (!currentWorkspace) {
      toast.error("Aucun workspace sélectionné");
      return;
    }

    setGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Veuillez vous connecter");
        setGenerating(false);
        return;
      }

      const systemPrompt = `Tu es François Martin, directeur financier avec 20 ans d'expérience en analyse ROI et performance marketing. Tu fournis des analyses concises et actionnables.

MISSION : Générer un commentaire exécutif sur la performance ROI.

Tu dois retourner un JSON avec cette structure exacte :
{
  "summary": "Résumé",
  "actions": [],
  "risks": [],
  "dependencies": [],
  "metrics_to_watch": ["ROI", "CAC", "LTV"],
  "requires_approval": false,
  "executive_commentary": {
    "summary": "Commentaire exécutif de 3-5 lignes analysant la performance",
    "highlights": ["Point fort 1", "Point fort 2"],
    "recommendations": ["Recommandation 1", "Recommandation 2"]
  }
}

RÈGLES :
- Le résumé doit être concis (3-5 lignes max)
- Inclure des données chiffrées quand pertinent
- Les recommandations doivent être actionnables`;

      const userPrompt = `Analyse ces métriques de performance :

COÛTS MENSUELS :
- Abonnement Growth OS : ${costs.growthOS}€
- Budget publicitaire : ${costs.adsSpend}€
- Outils tiers : ${costs.tools}€
- Temps humain : ${costs.humanHours}h × ${costs.hourlyRate}€/h = ${costs.humanHours * costs.hourlyRate}€
- TOTAL : ${calculations.totalCosts}€

RÉSULTATS :
- Leads générés : ${results.leadsGenerated}
- Conversions : ${results.conversions}
- Revenu attribuable : ${results.revenueAttributable}€

MÉTRIQUES CALCULÉES :
- Coût par lead : ${calculations.costPerLead.toFixed(2)}€
- Coût par acquisition : ${calculations.costPerAcquisition.toFixed(2)}€
- ROI : ${calculations.roi.toFixed(1)}%
- Économies vs équipe traditionnelle : ${calculations.savingsVsTraditional}€

Génère un commentaire exécutif avec des insights et recommandations.`;

      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          workspace_id: currentWorkspace.id,
          agent_name: "finance_analyst",
          purpose: "analysis",
          input: {
            system_prompt: systemPrompt,
            user_prompt: userPrompt,
            context: {
              costs,
              results,
              calculations,
            }
          }
        }
      });

      if (error) throw error;

      if (data?.success && data?.artifact?.executive_commentary) {
        setCommentary(data.artifact.executive_commentary as ExecutiveCommentary);
        toast.success("Analyse générée !");
      } else {
        throw new Error(data?.error || "Erreur lors de la génération");
      }
    } catch (err) {
      console.error("Commentary generation error:", err);
      toast.error("Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    toast.info("Export PDF en cours de développement");
    // TODO: Call generate-report edge function
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="kpi" className={calculations.roi >= 0 ? "border-primary/30" : "border-destructive/30"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              {calculations.roi >= 0 ? (
                <TrendingUp className="w-4 h-4 text-primary" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className="text-sm text-muted-foreground">ROI Mensuel</span>
            </div>
            <p className={`text-3xl font-bold ${calculations.roi >= 0 ? "text-primary" : "text-destructive"}`}>
              {calculations.roi >= 0 ? "+" : ""}{calculations.roi.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card variant="kpi">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Coût / Lead</span>
            </div>
            <p className="text-3xl font-bold">
              {calculations.costPerLead > 0 ? `${calculations.costPerLead.toFixed(0)}€` : "—"}
            </p>
          </CardContent>
        </Card>

        <Card variant="kpi">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Coût / Acquisition</span>
            </div>
            <p className="text-3xl font-bold">
              {calculations.costPerAcquisition > 0 ? `${calculations.costPerAcquisition.toFixed(0)}€` : "—"}
            </p>
          </CardContent>
        </Card>

        <Card variant="kpi" className={calculations.savingsVsTraditional > 0 ? "border-primary/30" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Économies</span>
            </div>
            <p className={`text-3xl font-bold ${calculations.savingsVsTraditional > 0 ? "text-primary" : ""}`}>
              {calculations.savingsVsTraditional > 0 ? "+" : ""}{calculations.savingsVsTraditional.toLocaleString()}€
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Costs Form */}
        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Coûts mensuels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Abonnement Growth OS (€)</Label>
                <Input
                  type="number"
                  value={costs.growthOS}
                  onChange={(e) => setCosts(prev => ({ ...prev, growthOS: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Budget Ads (€)</Label>
                <Input
                  type="number"
                  value={costs.adsSpend}
                  onChange={(e) => setCosts(prev => ({ ...prev, adsSpend: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Outils tiers (€)</Label>
                <Input
                  type="number"
                  value={costs.tools}
                  onChange={(e) => setCosts(prev => ({ ...prev, tools: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Heures humaines</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={costs.humanHours}
                    onChange={(e) => setCosts(prev => ({ ...prev, humanHours: Number(e.target.value) }))}
                    placeholder="Heures"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={costs.hourlyRate}
                    onChange={(e) => setCosts(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                    placeholder="€/h"
                    className="w-20"
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total mensuel</span>
                <span className="text-2xl font-bold">{calculations.totalCosts.toLocaleString()}€</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Form */}
        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Résultats mensuels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Leads générés</Label>
                <Input
                  type="number"
                  value={results.leadsGenerated}
                  onChange={(e) => setResults(prev => ({ ...prev, leadsGenerated: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Conversions (clients)</Label>
                <Input
                  type="number"
                  value={results.conversions}
                  onChange={(e) => setResults(prev => ({ ...prev, conversions: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Revenu attribuable (€)</Label>
                <Input
                  type="number"
                  value={results.revenueAttributable}
                  onChange={(e) => setResults(prev => ({ ...prev, revenueAttributable: Number(e.target.value) }))}
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="hero" 
                onClick={handleGenerateCommentary}
                disabled={generating}
                className="flex-1"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Analyse IA
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {results.leadsGenerated > 0 && (
        <Card variant="feature">
          <CardHeader>
            <CardTitle>Évolution projetée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="roi" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)" 
                    name="ROI (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Commentary */}
      {commentary && (
        <Card variant="feature" className="border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Analyse Exécutive</CardTitle>
                <CardDescription>Agent François Martin — Finance Analyst</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg leading-relaxed">{commentary.summary}</p>
            
            {commentary.highlights?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Points forts</h4>
                <ul className="space-y-1">
                  {commentary.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {commentary.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recommandations</h4>
                <ul className="space-y-1">
                  {commentary.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
