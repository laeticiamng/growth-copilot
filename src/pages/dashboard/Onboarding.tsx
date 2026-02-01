import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  Globe,
  Palette,
  Link,
  Target,
  FileText,
  Bot,
  Shield,
  Rocket,
  ExternalLink,
} from "lucide-react";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: "done" | "pending" | "current";
  link: string;
  stepNumber: number;
}

const setupSteps: SetupStep[] = [
  {
    id: "site",
    stepNumber: 1,
    title: "Ajouter votre site",
    description: "Renseignez l'URL de votre site pour commencer l'analyse",
    status: "done",
    link: "/dashboard/sites",
  },
  {
    id: "brand",
    stepNumber: 2,
    title: "Configurer le Brand Kit",
    description: "Ton de voix, couleurs, USP, audience cible",
    status: "done",
    link: "/dashboard/brand-kit",
  },
  {
    id: "integrations",
    stepNumber: 3,
    title: "Connecter GSC & GA4",
    description: "Synchronisez vos données Google pour des insights précis",
    status: "current",
    link: "/dashboard/integrations",
  },
  {
    id: "crawl",
    stepNumber: 4,
    title: "Lancer le premier audit",
    description: "Crawl technique + audit SEO complet",
    status: "pending",
    link: "/dashboard/seo",
  },
  {
    id: "content",
    stepNumber: 5,
    title: "Importer vos mots-clés",
    description: "Depuis GSC ou manuellement",
    status: "pending",
    link: "/dashboard/content",
  },
];

const modules = [
  { 
    name: "SEO Technique", 
    icon: Globe, 
    status: "ready",
    description: "Crawl, audit, corrections automatiques" 
  },
  { 
    name: "Contenu & Keywords", 
    icon: FileText, 
    status: "ready",
    description: "Clusters, briefs, drafts, calendrier" 
  },
  { 
    name: "Local SEO", 
    icon: Target, 
    status: "ready",
    description: "GBP, avis, posts locaux" 
  },
  { 
    name: "Google Ads", 
    icon: Zap, 
    status: "integration_required",
    description: "Requiert connexion Ads" 
  },
  { 
    name: "Social", 
    icon: Link, 
    status: "integration_required",
    description: "Requiert connexion Meta" 
  },
  { 
    name: "CRO", 
    icon: Target, 
    status: "ready",
    description: "Audits pages, tests, backlog" 
  },
  { 
    name: "Lifecycle", 
    icon: Bot, 
    status: "ready",
    description: "CRM, workflows, emails" 
  },
];

const limits = [
  { name: "GBP Q&A API", issue: "Discontinuée (Nov 2025)", workaround: "FAQ Engine + posts manuels" },
  { name: "Instagram Publishing", issue: "Permissions variables", workaround: "Export assets + calendrier" },
  { name: "Google Ads Write", issue: "API réservée MCC", workaround: "Recommandations + exports" },
];

export default function OnboardingGuide() {
  const completedSteps = setupSteps.filter(s => s.status === "done").length;
  const currentStepIndex = setupSteps.findIndex(s => s.status === "current");
  const progress = (completedSteps / setupSteps.length) * 100;

  return (
    <div className="space-y-8">
      {/* Skip to main content for accessibility */}
      <a href="#setup-steps" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
        Passer au contenu principal
      </a>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Guide de démarrage</h1>
          <p className="text-muted-foreground">
            Configurez votre workspace pour des résultats optimaux
          </p>
        </div>
        <Badge variant="gradient" className="px-3 py-1">
          <Rocket className="w-4 h-4 mr-1" />
          {completedSteps}/{setupSteps.length} étapes
        </Badge>
      </div>

      {/* Progress */}
      <Card variant="gradient">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Progression setup</span>
            <span className="text-sm">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Setup steps - now with clickable stepper */}
      <Card variant="feature" id="setup-steps">
        <CardHeader>
          <CardTitle>Étapes de configuration</CardTitle>
          <CardDescription>Complétez ces étapes pour activer toutes les fonctionnalités</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Visual stepper */}
          <div className="flex items-center justify-between mb-6 px-2">
            {setupSteps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <a
                  href={step.link}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all text-sm font-semibold",
                    step.status === "done" 
                      ? "bg-chart-3 text-white hover:bg-chart-3/90 cursor-pointer" 
                      : step.status === "current"
                        ? "gradient-bg text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                        : "bg-secondary text-muted-foreground cursor-pointer hover:bg-secondary/80"
                  )}
                  aria-label={`Étape ${step.stepNumber}: ${step.title} - ${step.status === "done" ? "Terminée" : step.status === "current" ? "En cours" : "À faire"}`}
                  aria-current={step.status === "current" ? "step" : undefined}
                >
                  {step.status === "done" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.stepNumber
                  )}
                </a>
                {i < setupSteps.length - 1 && (
                  <div className={cn(
                    "hidden sm:block w-12 md:w-20 h-0.5 mx-1",
                    step.status === "done" ? "bg-chart-3" : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>
          
          {/* Step cards */}
          <div className="space-y-3">
            {setupSteps.map((step) => (
              <a 
                key={step.id}
                href={step.link}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-all group",
                  step.status === "done" 
                    ? "bg-chart-3/10 hover:bg-chart-3/15" 
                    : step.status === "current"
                      ? "bg-primary/10 border-2 border-primary/30 hover:border-primary/50"
                      : "bg-secondary/50 hover:bg-secondary/80"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold",
                  step.status === "done" 
                    ? "bg-chart-3 text-white" 
                    : step.status === "current"
                      ? "gradient-bg text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                )}>
                  {step.status === "done" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    step.stepNumber
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium",
                    step.status === "done" && "text-muted-foreground"
                  )}>
                    {step.title}
                    {step.status === "current" && (
                      <Badge variant="gradient" className="ml-2 text-xs">En cours</Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <ArrowRight className={cn(
                  "w-5 h-5 transition-transform group-hover:translate-x-1",
                  step.status === "done" ? "text-chart-3" : "text-muted-foreground"
                )} />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modules status */}
      <Card variant="feature">
        <CardHeader>
          <CardTitle>Modules disponibles</CardTitle>
          <CardDescription>État des fonctionnalités selon votre configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <div 
                  key={i} 
                  className={`p-4 rounded-lg ${
                    mod.status === "ready" ? "bg-green-500/10 border border-green-500/30" : 
                    "bg-secondary/50 border border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${mod.status === "ready" ? "text-green-500" : "text-muted-foreground"}`} />
                    <span className="font-medium">{mod.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{mod.description}</p>
                  <Badge 
                    variant={mod.status === "ready" ? "secondary" : "outline"} 
                    className="mt-2 text-xs"
                  >
                    {mod.status === "ready" ? "Prêt" : "Intégration requise"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Known limitations */}
      <Card variant="feature">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Limitations connues
          </CardTitle>
          <CardDescription>
            Certaines APIs ont des restrictions - voici les workarounds intégrés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {limits.map((limit, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{limit.name}</p>
                  <Badge variant="outline" className="text-xs text-warning">
                    {limit.issue}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="text-primary font-medium">Solution :</span> {limit.workaround}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Help links */}
      <Card variant="feature">
        <CardHeader>
          <CardTitle>Ressources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">Documentation</p>
                <p className="text-xs text-muted-foreground">Guides complets</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">API Reference</p>
                <p className="text-xs text-muted-foreground">Pour intégrations</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">Support</p>
                <p className="text-xs text-muted-foreground">Besoin d'aide ?</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
