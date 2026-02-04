import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Loader2,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  MousePointer,
  Eye,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CROSuggestion {
  id: string;
  category: "cta" | "form" | "layout" | "copy" | "trust" | "speed";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  iceScore: number;
  status: "pending" | "implemented" | "dismissed";
}

const categoryIcons = {
  cta: MousePointer,
  form: Target,
  layout: Eye,
  copy: TrendingUp,
  trust: CheckCircle2,
  speed: Clock,
};

const categoryLabels = {
  cta: "Call-to-Action",
  form: "Formulaire",
  layout: "Layout",
  copy: "Copywriting",
  trust: "Confiance",
  speed: "Performance",
};

export function CROSuggestionsAI({ workspaceId, pageUrl }: { workspaceId: string; pageUrl?: string }) {
  const [url, setUrl] = useState(pageUrl || "");
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<CROSuggestion[]>([]);
  const [progress, setProgress] = useState(0);

  const analyzeUrl = async () => {
    if (!url) {
      toast.error("Entrez une URL à analyser");
      return;
    }

    setAnalyzing(true);
    setProgress(0);
    setSuggestions([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          workspace_id: workspaceId,
          agent_name: "cro-analyzer",
          purpose: "analysis",
          input: {
            system_prompt: `Tu es un expert en optimisation de conversion (CRO). 
Analyse l'URL fournie et génère des suggestions d'optimisation concrètes.
Catégorise chaque suggestion parmi: cta, form, layout, copy, trust, speed.
Évalue l'impact (high/medium/low) et l'effort (high/medium/low).
Réponds en JSON avec un array "suggestions" contenant des objets {category, title, description, impact, effort}.`,
            user_prompt: `Analyse cette page et génère des suggestions CRO: ${url}`,
            context: { url }
          }
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!error && data?.success && data?.artifact) {
        const rawSuggestions = data.artifact.suggestions || [];
        const formattedSuggestions: CROSuggestion[] = rawSuggestions.map((s: {
          category?: string;
          title?: string;
          description?: string;
          impact?: string;
          effort?: string;
        }, i: number) => {
          const impact = s.impact === "high" ? 90 : s.impact === "medium" ? 60 : 30;
          const confidence = 70;
          const effort = s.effort === "low" ? 90 : s.effort === "medium" ? 60 : 30;
          const iceScore = Math.round((impact * confidence * effort) / 10000);

          return {
            id: crypto.randomUUID(),
            category: (s.category || "copy") as CROSuggestion["category"],
            title: s.title || `Suggestion ${i + 1}`,
            description: s.description || "",
            impact: (s.impact || "medium") as CROSuggestion["impact"],
            effort: (s.effort || "medium") as CROSuggestion["effort"],
            iceScore,
            status: "pending" as const,
          };
        });

        // Sort by ICE score
        formattedSuggestions.sort((a, b) => b.iceScore - a.iceScore);
        setSuggestions(formattedSuggestions);
        toast.success(`${formattedSuggestions.length} suggestions générées`);
      } else {
        toast.error("Erreur lors de l'analyse");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Erreur de connexion");
    } finally {
      setAnalyzing(false);
      setProgress(0);
    }
  };

  const updateStatus = (id: string, status: CROSuggestion["status"]) => {
    setSuggestions(prev =>
      prev.map(s => s.id === id ? { ...s, status } : s)
    );
    toast.success(status === "implemented" ? "Marqué comme implémenté" : "Suggestion ignorée");
  };

  const impactColors = {
    high: "text-green-500",
    medium: "text-amber-500",
    low: "text-muted-foreground",
  };

  const effortColors = {
    low: "text-green-500",
    medium: "text-amber-500",
    high: "text-red-500",
  };

  return (
    <Card variant="feature">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Suggestions IA d'optimisation
        </CardTitle>
        <CardDescription>
          Analyse automatique des opportunités CRO
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Input */}
        <div className="flex gap-2">
          <Input
            placeholder="https://votre-site.com/page"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={analyzing}
          />
          <Button variant="hero" onClick={analyzeUrl} disabled={analyzing}>
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyse...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyser
              </>
            )}
          </Button>
        </div>

        {/* Progress */}
        {analyzing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              Analyse en cours...
            </p>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {suggestions.filter(s => s.status === "pending").length} suggestions à traiter
              </p>
              <Badge variant="gradient">
                Triées par score ICE
              </Badge>
            </div>

            {suggestions.map((suggestion) => {
              const Icon = categoryIcons[suggestion.category];
              return (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg bg-secondary/50 ${
                    suggestion.status !== "pending" ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{suggestion.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[suggestion.category]}
                        </Badge>
                        {suggestion.status === "implemented" && (
                          <Badge variant="success" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Fait
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Impact:</span>
                          <span className={`text-xs font-medium ${impactColors[suggestion.impact]}`}>
                            {suggestion.impact === "high" ? "Élevé" : suggestion.impact === "medium" ? "Moyen" : "Faible"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Effort:</span>
                          <span className={`text-xs font-medium ${effortColors[suggestion.effort]}`}>
                            {suggestion.effort === "low" ? "Faible" : suggestion.effort === "medium" ? "Moyen" : "Élevé"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Score ICE:</span>
                          <span className="text-xs font-medium text-primary">
                            {suggestion.iceScore}
                          </span>
                        </div>
                      </div>
                    </div>
                    {suggestion.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(suggestion.id, "dismissed")}
                        >
                          Ignorer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(suggestion.id, "implemented")}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Fait
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!analyzing && suggestions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Aucune analyse</p>
            <p className="text-sm mt-1">Entrez une URL pour obtenir des suggestions d'optimisation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
