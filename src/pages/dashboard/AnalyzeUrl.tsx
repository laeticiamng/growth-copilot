/**
 * P2 — Analyse URL /dashboard/analyze
 * Formulaire « Collez votre URL », faux audit avec barre de progression, résultats mockés
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3,
  FileText,
  Shield,
  Gauge,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_ANALYSIS_RESULT } from "@/data/mock-dashboard";

type AnalysisPhase = "idle" | "crawling" | "analyzing" | "scoring" | "done";

const PHASES: { key: AnalysisPhase; label: Record<string, string>; duration: number }[] = [
  { key: "crawling", label: { fr: "Crawl du site en cours...", en: "Crawling site..." }, duration: 1000 },
  { key: "analyzing", label: { fr: "Analyse du contenu et de la structure...", en: "Analyzing content and structure..." }, duration: 1200 },
  { key: "scoring", label: { fr: "Calcul des scores et recommandations...", en: "Calculating scores and recommendations..." }, duration: 800 },
];

function ScoreCircle({ score, label, size = "lg" }: { score: number; label: string; size?: "sm" | "lg" }) {
  const radius = size === "lg" ? 54 : 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";
  const strokeColor =
    score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-amber-500" : "stroke-red-500";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg
          className={cn("transform -rotate-90", size === "lg" ? "w-32 h-32" : "w-20 h-20")}
        >
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={size === "lg" ? 8 : 6}
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            className={strokeColor}
            strokeWidth={size === "lg" ? 8 : 6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold",
            color,
            size === "lg" ? "text-3xl" : "text-lg"
          )}
        >
          {score}
        </div>
      </div>
      <span className={cn("font-medium", size === "lg" ? "text-sm" : "text-xs")}>{label}</span>
    </div>
  );
}

export default function AnalyzeUrl() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const isValidUrl = (str: string) => {
    try {
      const parsed = new URL(str.startsWith("http") ? str : `https://${str}`);
      return parsed.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const startAnalysis = () => {
    if (!isValidUrl(url)) return;
    setShowResults(false);
    setProgress(0);

    let currentPhase = 0;
    const totalDuration = PHASES.reduce((sum, p) => sum + p.duration, 0);

    setPhase(PHASES[0].key);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, totalDuration / 50);

    let elapsed = 0;
    PHASES.forEach((p, i) => {
      elapsed += p.duration;
      setTimeout(() => {
        if (i < PHASES.length - 1) {
          setPhase(PHASES[i + 1].key);
        }
      }, elapsed);
    });

    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setPhase("done");
      setShowResults(true);
    }, totalDuration + 200);
  };

  const reset = () => {
    setPhase("idle");
    setProgress(0);
    setShowResults(false);
    setUrl("");
  };

  const result = MOCK_ANALYSIS_RESULT;

  const statusIcon = (status: "good" | "warning" | "error") => {
    switch (status) {
      case "good": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "error": return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const priorityBadge = (priority: "high" | "medium" | "low") => {
    const config = {
      high: { label: lang === "fr" ? "Haute" : "High", class: "bg-red-500/10 text-red-500 border-red-500/20" },
      medium: { label: lang === "fr" ? "Moyenne" : "Medium", class: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      low: { label: lang === "fr" ? "Basse" : "Low", class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    };
    return <Badge variant="outline" className={cn("text-[10px]", config[priority].class)}>{config[priority].label}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          {lang === "fr" ? "Analyse de site" : "Site Analysis"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "fr"
            ? "Obtenez un audit SEO complet de votre site en quelques secondes"
            : "Get a complete SEO audit of your site in seconds"}
        </p>
      </div>

      {/* URL Input */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startAnalysis()}
                placeholder={lang === "fr" ? "Collez votre URL ici..." : "Paste your URL here..."}
                className="pl-10"
                disabled={phase !== "idle" && phase !== "done"}
              />
            </div>
            {showResults ? (
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {lang === "fr" ? "Nouvelle analyse" : "New analysis"}
              </Button>
            ) : (
              <Button
                onClick={startAnalysis}
                disabled={!isValidUrl(url) || (phase !== "idle" && phase !== "done")}
              >
                <Search className="w-4 h-4 mr-2" />
                {lang === "fr" ? "Analyser" : "Analyze"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {phase !== "idle" && !showResults && (
        <Card className="animate-fade-in">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-medium">
                {PHASES.find((p) => p.key === phase)?.label[lang] || "..."}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{lang === "fr" ? "Audit en cours" : "Audit in progress"}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {showResults && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Score Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                {lang === "fr" ? "Scores de votre site" : "Your Site Scores"}
              </CardTitle>
              <CardDescription>
                {url}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-around flex-wrap gap-6">
                <ScoreCircle score={result.seoScore} label={lang === "fr" ? "SEO Technique" : "Technical SEO"} />
                <ScoreCircle score={result.contentScore} label={lang === "fr" ? "Contenu" : "Content"} />
                <ScoreCircle score={result.speedScore} label={lang === "fr" ? "Vitesse" : "Speed"} />
                <ScoreCircle score={result.technicalScore} label={lang === "fr" ? "Technique" : "Technical"} />
              </div>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                {lang === "fr" ? "Métriques détaillées" : "Detailed Metrics"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {result.metrics.map((metric) => (
                  <div
                    key={metric.label[lang]}
                    className="p-3 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {statusIcon(metric.status)}
                      <span className="text-xs text-muted-foreground">{metric.label[lang]}</span>
                    </div>
                    <span className="text-lg font-bold">{metric.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {lang === "fr" ? "Recommandations prioritaires" : "Priority Recommendations"}
              </CardTitle>
              <CardDescription>
                {lang === "fr"
                  ? `${result.recommendations.length} actions identifiées pour améliorer votre site`
                  : `${result.recommendations.length} actions identified to improve your site`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/50"
                >
                  <span className="text-xs font-bold text-muted-foreground w-6 text-center pt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{rec.text[lang]}</p>
                  </div>
                  {priorityBadge(rec.priority)}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold mb-2">
                {lang === "fr"
                  ? "Prêt à corriger ces problèmes automatiquement ?"
                  : "Ready to fix these issues automatically?"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {lang === "fr"
                  ? "Nos 39 agents IA peuvent exécuter ces recommandations pour vous."
                  : "Our 39 AI agents can execute these recommendations for you."}
              </p>
              <Button>
                <Zap className="w-4 h-4 mr-2" />
                {lang === "fr" ? "Activer les agents" : "Activate agents"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        &copy; 2026 EmotionsCare SASU — {lang === "fr" ? "Tous droits réservés" : "All rights reserved"}
      </p>
    </div>
  );
}
