/**
 * Ads Optimizer Component
 * Agent: Marc Rousseau (Ads Optimization Manager)
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Loader2, CheckCircle, Target, DollarSign, Ban, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useTranslation } from "react-i18next";

interface AdVariant {
  headline: string;
  charCount: number;
}

interface DescriptionVariant {
  text: string;
  charCount: number;
}

interface AdsOptimizerResult {
  titles: AdVariant[];
  descriptions: DescriptionVariant[];
  negative_keywords: string[];
  budget_recommendation: {
    daily: number;
    monthly: number;
    reasoning: string;
  };
}

export function AdsOptimizer() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const [formData, setFormData] = useState({
    product: "",
    budget: "",
    audience: "",
    objective: "conversions"
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AdsOptimizerResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!formData.product.trim()) {
      toast.error(t("components.adsOptimizer.describeProduct"));
      return;
    }

    if (!currentWorkspace) {
      toast.error(t("components.adsOptimizer.noWorkspace"));
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t("components.adsOptimizer.pleaseLogin"));
        setGenerating(false);
        return;
      }

      const systemPrompt = `Tu es Marc Rousseau, expert Google Ads avec 15 ans d'expérience en acquisition payante. Tu maîtrises les méthodologies des cabinets de conseil (McKinsey, BCG) et appliques une rigueur statistique dans tes recommandations.

MISSION : Générer des variantes d'annonces Google Ads optimisées.

Tu dois retourner un JSON avec cette structure exacte :
{
  "summary": "Résumé de l'optimisation (1-2 phrases)",
  "actions": [],
  "risks": [],
  "dependencies": [],
  "metrics_to_watch": ["CTR", "CPC", "conversions", "quality_score"],
  "requires_approval": false,
  "ads_optimization": {
    "titles": [
      {"headline": "Titre 30 caractères max", "charCount": 25}
    ],
    "descriptions": [
      {"text": "Description 90 caractères max", "charCount": 85}
    ],
    "negative_keywords": ["mot-clé à exclure 1", "mot-clé à exclure 2"],
    "budget_recommendation": {
      "daily": 50,
      "monthly": 1500,
      "reasoning": "Explication du budget recommandé"
    }
  }
}

RÈGLES :
- Génère exactement 3 titres (30 caractères max chacun)
- Génère exactement 2 descriptions (90 caractères max chacune)
- Propose 5-8 mots-clés négatifs pertinents
- Le budget doit être basé sur l'objectif et l'audience
- Tous les textes doivent être en français
- Utilise des CTA puissants et des bénéfices client`;

      const userPrompt = `Génère des variantes d'annonces Google Ads pour :

Produit/Service : ${formData.product}
Budget mensuel disponible : ${formData.budget || "Non spécifié"}€
Audience cible : ${formData.audience || "Non spécifiée"}
Objectif : ${formData.objective === "conversions" ? "Maximiser les conversions" : formData.objective === "traffic" ? "Maximiser le trafic" : "Notoriété de marque"}`;

      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          workspace_id: currentWorkspace.id,
          agent_name: "ads_optimizer",
          purpose: "copywriting",
          input: {
            system_prompt: systemPrompt,
            user_prompt: userPrompt,
            context: {
              product: formData.product,
              budget: formData.budget,
              audience: formData.audience,
              objective: formData.objective,
            }
          }
        }
      });

      if (error) throw error;

      if (data?.success && data?.artifact?.ads_optimization) {
        setResult(data.artifact.ads_optimization as AdsOptimizerResult);
        toast.success(t("components.adsOptimizer.generated"));
      } else {
        throw new Error(data?.error || t("components.adsOptimizer.generationError"));
      }
    } catch (err) {
      console.error("Ads optimization error:", err);
      toast.error(t("components.adsOptimizer.generationError"));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success(t("components.adsOptimizer.copied"));
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>{t("components.adsOptimizer.title")}</CardTitle>
            <CardDescription>
              Agent Marc Rousseau — Ads Optimization Manager
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product">{t("components.adsOptimizer.product")} *</Label>
            <Textarea
              id="product"
              placeholder={t("components.adsOptimizer.productPlaceholder")}
              value={formData.product}
              onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget">{t("components.adsOptimizer.monthlyBudget")}</Label>
              <Input
                id="budget"
                type="number"
                placeholder="ex: 1500"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">{t("components.adsOptimizer.targetAudience")}</Label>
              <Input
                id="audience"
                placeholder={t("components.adsOptimizer.audiencePlaceholder")}
                value={formData.audience}
                onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={formData.objective}
            onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
          >
            <option value="conversions">{t("components.adsOptimizer.objConversions")}</option>
            <option value="traffic">{t("components.adsOptimizer.objTraffic")}</option>
            <option value="awareness">{t("components.adsOptimizer.objAwareness")}</option>
          </select>
          <Button 
            variant="hero" 
            onClick={handleGenerate} 
            disabled={generating || !formData.product.trim()}
            className="flex-1"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("components.adsOptimizer.generating")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t("components.adsOptimizer.generateAds")}
              </>
            )}
          </Button>
        </div>

        {/* Loading State */}
        {generating && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground">{t("components.adsOptimizer.optimizing")}</p>
          </div>
        )}

        {/* Results */}
        {result && !generating && (
          <div className="space-y-6">
            {/* Titles */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                {t("components.adsOptimizer.titles")}
              </h4>
              <div className="grid gap-2">
                {result.titles?.map((title, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex-1">
                      <p className="font-medium">{title.headline}</p>
                      <p className="text-xs text-muted-foreground">{title.charCount}/30 {t("components.adsOptimizer.chars")}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopy(title.headline, `title-${i}`)}
                    >
                      {copiedIndex === `title-${i}` ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" />
                {t("components.adsOptimizer.descriptions")}
              </h4>
              <div className="grid gap-2">
                {result.descriptions?.map((desc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex-1">
                      <p className="text-sm">{desc.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{desc.charCount}/90 {t("components.adsOptimizer.chars")}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopy(desc.text, `desc-${i}`)}
                    >
                      {copiedIndex === `desc-${i}` ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Negative Keywords */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Ban className="w-4 h-4 text-destructive" />
                {t("components.adsOptimizer.negativeKeywords")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.negative_keywords?.map((kw, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => handleCopy(kw, `neg-${i}`)}
                  >
                    {copiedIndex === `neg-${i}` ? <CheckCircle className="w-3 h-3 mr-1" /> : null}
                    -{kw}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Budget Recommendation */}
            {result.budget_recommendation && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-primary" />
                  {t("components.adsOptimizer.budgetRecommendation")}
                </h4>
                <div className="grid sm:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("components.adsOptimizer.dailyBudget")}</p>
                    <p className="text-xl font-bold">{result.budget_recommendation.daily}€/{t("components.adsOptimizer.day")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("components.adsOptimizer.monthlyBudgetLabel")}</p>
                    <p className="text-xl font-bold text-primary">{result.budget_recommendation.monthly}€/{t("components.adsOptimizer.month")}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{result.budget_recommendation.reasoning}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
