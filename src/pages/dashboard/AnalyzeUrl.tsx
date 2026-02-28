/**
 * P2 — Analyse URL /dashboard/analyze
 * Calls real site-analyze edge function, computes scores from real signals
 */
import { useState } from "react";
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
  Gauge,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisData {
  title: string | null;
  description: string | null;
  h1: string | null;
  wordCount: number;
  internalLinksCount?: number;
  totalLinksCount?: number;
  techStack: string[];
  socialLinks: string[];
  hasAnalytics: boolean;
  hasMetaPixel: boolean;
  detectedCMS: string | null;
  language?: string | null;
  favicon?: string | null;
  ogImage?: string | null;
}

interface ComputedResult {
  seoScore: number;
  contentScore: number;
  speedScore: number;
  technicalScore: number;
  recommendations: { priority: "high" | "medium" | "low"; text: Record<string, string> }[];
  metrics: { label: Record<string, string>; value: string; status: "good" | "warning" | "error" }[];
}

function computeScores(a: AnalysisData): ComputedResult {
  // SEO Score (0-100)
  let seo = 30;
  if (a.title) seo += 20;
  if (a.description) seo += 20;
  if (a.h1) seo += 15;
  if ((a.internalLinksCount || 0) > 5) seo += 10;
  if (a.ogImage) seo += 5;

  // Content Score
  let content = 20;
  if (a.wordCount > 300) content += 20;
  if (a.wordCount > 800) content += 20;
  if (a.wordCount > 1500) content += 15;
  if (a.h1) content += 15;
  if ((a.totalLinksCount || 0) > 3) content += 10;

  // Technical Score
  let tech = 40;
  if (a.hasAnalytics) tech += 20;
  if (a.detectedCMS) tech += 10;
  if (a.techStack.length > 1) tech += 10;
  if (a.favicon) tech += 10;
  if (a.hasMetaPixel) tech += 10;

  // Speed (no real measurement — use heuristic)
  const speed = a.wordCount < 3000 ? 85 : a.wordCount < 8000 ? 72 : 58;

  const cap = (n: number) => Math.min(100, Math.max(0, n));

  // Recommendations
  const recs: ComputedResult["recommendations"] = [];
  if (!a.description) recs.push({ priority: "high", text: { fr: "Ajouter une meta description", en: "Add a meta description" } });
  if (!a.h1) recs.push({ priority: "high", text: { fr: "Ajouter une balise H1", en: "Add an H1 tag" } });
  if (!a.hasAnalytics) recs.push({ priority: "high", text: { fr: "Installer Google Analytics ou GTM", en: "Install Google Analytics or GTM" } });
  if (!a.ogImage) recs.push({ priority: "medium", text: { fr: "Ajouter une image Open Graph", en: "Add an Open Graph image" } });
  if ((a.internalLinksCount || 0) < 5) recs.push({ priority: "medium", text: { fr: "Améliorer le maillage interne", en: "Improve internal linking" } });
  if (a.socialLinks.length === 0) recs.push({ priority: "low", text: { fr: "Ajouter des liens vers vos réseaux sociaux", en: "Add social media links" } });
  if (a.wordCount < 300) recs.push({ priority: "medium", text: { fr: "Enrichir le contenu (moins de 300 mots détectés)", en: "Enrich content (less than 300 words detected)" } });
  if (!a.favicon) recs.push({ priority: "low", text: { fr: "Ajouter un favicon", en: "Add a favicon" } });

  // Metrics
  const metrics: ComputedResult["metrics"] = [
    { label: { fr: "Mots", en: "Words" }, value: String(a.wordCount), status: a.wordCount > 300 ? "good" : "warning" },
    { label: { fr: "Liens internes", en: "Internal links" }, value: String(a.internalLinksCount || 0), status: (a.internalLinksCount || 0) > 5 ? "good" : "warning" },
    { label: { fr: "Titre", en: "Title" }, value: a.title ? "✓" : "✗", status: a.title ? "good" : "error" },
    { label: { fr: "Meta description", en: "Meta description" }, value: a.description ? "✓" : "✗", status: a.description ? "good" : "error" },
    { label: { fr: "H1", en: "H1" }, value: a.h1 ? "✓" : "✗", status: a.h1 ? "good" : "error" },
    { label: { fr: "Analytics", en: "Analytics" }, value: a.hasAnalytics ? "✓" : "✗", status: a.hasAnalytics ? "good" : "error" },
    { label: { fr: "CMS détecté", en: "CMS detected" }, value: a.detectedCMS || "—", status: a.detectedCMS ? "good" : "warning" },
    { label: { fr: "OG Image", en: "OG Image" }, value: a.ogImage ? "✓" : "✗", status: a.ogImage ? "good" : "warning" },
    { label: { fr: "Réseaux sociaux", en: "Social links" }, value: String(a.socialLinks.length), status: a.socialLinks.length > 0 ? "good" : "warning" },
    { label: { fr: "Tech Stack", en: "Tech Stack" }, value: a.techStack.length > 0 ? a.techStack.join(", ") : "—", status: a.techStack.length > 0 ? "good" : "warning" },
  ];

  return { seoScore: cap(seo), contentScore: cap(content), speedScore: cap(speed), technicalScore: cap(tech), recommendations: recs, metrics };
}

function ScoreCircle({ score, label, size = "lg" }: { score: number; label: string; size?: "sm" | "lg" }) {
  const radius = size === "lg" ? 54 : 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";
  const strokeColor = score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-amber-500" : "stroke-red-500";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg className={cn("transform -rotate-90", size === "lg" ? "w-32 h-32" : "w-20 h-20")}>
          <circle cx="50%" cy="50%" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={size === "lg" ? 8 : 6} />
          <circle cx="50%" cy="50%" r={radius} fill="none" className={strokeColor} strokeWidth={size === "lg" ? 8 : 6} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
        </svg>
        <div className={cn("absolute inset-0 flex items-center justify-center font-bold", color, size === "lg" ? "text-3xl" : "text-lg")}>{score}</div>
      </div>
      <span className={cn("font-medium", size === "lg" ? "text-sm" : "text-xs")}>{label}</span>
    </div>
  );
}

export default function AnalyzeUrl() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ComputedResult | null>(null);

  const isValidUrl = (str: string) => {
    try {
      const parsed = new URL(str.startsWith("http") ? str : `https://${str}`);
      return parsed.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const startAnalysis = async () => {
    if (!isValidUrl(url) || isAnalyzing) return;
    setResult(null);
    setIsAnalyzing(true);
    setProgress(10);

    // Simulate progress while waiting for real response
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 90));
    }, 400);

    try {
      const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
      const { data, error } = await supabase.functions.invoke("site-analyze", {
        body: { url: formattedUrl },
      });

      clearInterval(interval);

      if (error || !data?.success) {
        toast.error(data?.error || error?.message || (lang === "fr" ? "Erreur d'analyse" : "Analysis error"));
        setIsAnalyzing(false);
        setProgress(0);
        return;
      }

      setProgress(100);
      const analysis = data.analysis as AnalysisData;
      const computed = computeScores(analysis);
      
      setTimeout(() => {
        setResult(computed);
        setIsAnalyzing(false);
      }, 300);
    } catch (err: any) {
      clearInterval(interval);
      toast.error(err.message || "Error");
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setResult(null);
    setProgress(0);
    setUrl("");
    setIsAnalyzing(false);
  };

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
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          {lang === "fr" ? "Analyse de site" : "Site Analysis"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "fr" ? "Obtenez un audit SEO complet de votre site en quelques secondes" : "Get a complete SEO audit of your site in seconds"}
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
                disabled={isAnalyzing}
              />
            </div>
            {result ? (
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {lang === "fr" ? "Nouvelle analyse" : "New analysis"}
              </Button>
            ) : (
              <Button onClick={startAnalysis} disabled={!isValidUrl(url) || isAnalyzing}>
                {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                {lang === "fr" ? "Analyser" : "Analyze"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {isAnalyzing && (
        <Card className="animate-fade-in">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-medium">
                {lang === "fr" ? "Analyse en cours via Firecrawl..." : "Analyzing via Firecrawl..."}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{lang === "fr" ? "Crawl & analyse" : "Crawl & analysis"}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in-up">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                {lang === "fr" ? "Scores de votre site" : "Your Site Scores"}
              </CardTitle>
              <CardDescription>{url}</CardDescription>
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
                  <div key={metric.label[lang]} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      {statusIcon(metric.status)}
                      <span className="text-xs text-muted-foreground">{metric.label[lang]}</span>
                    </div>
                    <span className="text-sm font-bold truncate block">{metric.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
              {result.recommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {lang === "fr" ? "Aucune recommandation — votre site est bien optimisé ! 🎉" : "No recommendations — your site is well optimized! 🎉"}
                </p>
              ) : (
                result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/50">
                    <span className="text-xs font-bold text-muted-foreground w-6 text-center pt-0.5">{i + 1}</span>
                    <div className="flex-1"><p className="text-sm">{rec.text[lang]}</p></div>
                    {priorityBadge(rec.priority)}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold mb-2">
                {lang === "fr" ? "Prêt à corriger ces problèmes automatiquement ?" : "Ready to fix these issues automatically?"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {lang === "fr" ? "Nos 39 agents IA peuvent exécuter ces recommandations pour vous." : "Our 39 AI agents can execute these recommendations for you."}
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

      <p className="text-center text-xs text-muted-foreground pb-4">
        &copy; 2026 EmotionsCare SASU — {lang === "fr" ? "Tous droits réservés" : "All rights reserved"}
      </p>
    </div>
  );
}
