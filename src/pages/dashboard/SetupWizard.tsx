import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Globe, Plug, Bot, CheckCircle2, ArrowRight, ArrowLeft,
  Rocket, Loader2, ExternalLink, Sparkles,
} from "lucide-react";

/* ─── Types ─── */
interface WizardStep {
  id: "site" | "integration" | "agent";
  title: string;
  description: string;
  icon: React.ElementType;
}

/* ─── Step 1: Site Setup ─── */
function StepSiteSetup({
  onComplete,
  isComplete,
}: {
  onComplete: () => void;
  isComplete: boolean;
}) {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { sites, createSite, loading: sitesLoading } = useSites();
  const [url, setUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isComplete) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="p-4 rounded-full bg-chart-3/20">
          <CheckCircle2 className="w-10 h-10 text-chart-3" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">{t("setupWizard.siteReady", "Site configuré !")}</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {sites[0]?.url || sites[0]?.name}
          </p>
        </div>
        <Button onClick={onComplete} className="mt-2">
          {t("setupWizard.continue", "Continuer")} <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast.error(t("setupWizard.enterUrl", "Veuillez entrer une URL"));
      return;
    }
    setSubmitting(true);
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    const { error } = await createSite({
      url: formattedUrl,
      name: siteName || new URL(formattedUrl).hostname,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("setupWizard.siteCreated", "Site ajouté !"));
      onComplete();
    }
  };

  if (sitesLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="site-url">{t("setupWizard.siteUrlLabel", "URL du site")}</Label>
          <Input
            id="site-url"
            placeholder="https://exemple.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="site-name">{t("setupWizard.siteNameLabel", "Nom (optionnel)")}</Label>
          <Input
            id="site-name"
            placeholder="Mon entreprise"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={submitting || !url.trim()} className="w-full">
        {submitting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Globe className="w-4 h-4 mr-2" />
        )}
        {t("setupWizard.addSite", "Ajouter le site")}
      </Button>
    </div>
  );
}

/* ─── Step 2: First Integration ─── */
function StepIntegration({
  onComplete,
  isComplete,
}: {
  onComplete: () => void;
  isComplete: boolean;
}) {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["wizard-integrations", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const { data } = await supabase
        .from("integrations")
        .select("id, provider, status")
        .eq("workspace_id", currentWorkspace.id)
        .eq("status", "active");
      return data || [];
    },
    enabled: !!currentWorkspace?.id,
  });

  const hasIntegration = (integrations?.length ?? 0) > 0;

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  if (isComplete || hasIntegration) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="p-4 rounded-full bg-chart-3/20">
          <CheckCircle2 className="w-10 h-10 text-chart-3" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">{t("setupWizard.integrationReady", "Intégration connectée !")}</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {integrations?.map((i) => i.provider).join(", ")}
          </p>
        </div>
        <Button onClick={onComplete} className="mt-2">
          {t("setupWizard.continue", "Continuer")} <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <p className="text-muted-foreground text-sm">
        {t("setupWizard.integrationDesc", "Connectez Google ou Meta pour synchroniser vos données automatiquement.")}
      </p>
      <div className="grid gap-3">
        <Button
          variant="outline"
          className="justify-start h-auto py-4"
          onClick={() => {
            window.location.href = "/dashboard/integrations";
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plug className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">{t("setupWizard.connectGoogle", "Connecter Google")}</p>
              <p className="text-xs text-muted-foreground">Analytics, Search Console, Ads</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
        </Button>
        <Button
          variant="outline"
          className="justify-start h-auto py-4"
          onClick={() => {
            window.location.href = "/dashboard/integrations";
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plug className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">{t("setupWizard.connectMeta", "Connecter Meta")}</p>
              <p className="text-xs text-muted-foreground">Facebook, Instagram, Ads</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
        </Button>
      </div>
      <Button variant="ghost" onClick={onComplete} className="w-full text-muted-foreground">
        {t("setupWizard.skipForNow", "Passer pour l'instant")}
      </Button>
    </div>
  );
}

/* ─── Step 3: First Agent Run ─── */
function StepAgentRun({
  onComplete,
  isComplete,
}: {
  onComplete: () => void;
  isComplete: boolean;
}) {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [launching, setLaunching] = useState(false);

  const { data: runs, isLoading } = useQuery({
    queryKey: ["wizard-agent-runs", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const { data } = await supabase
        .from("agent_runs")
        .select("id, agent_type, status")
        .eq("workspace_id", currentWorkspace.id)
        .limit(1);
      return data || [];
    },
    enabled: !!currentWorkspace?.id,
  });

  const hasRun = (runs?.length ?? 0) > 0;

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  if (isComplete || hasRun) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="p-4 rounded-full bg-chart-3/20">
          <CheckCircle2 className="w-10 h-10 text-chart-3" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">{t("setupWizard.agentReady", "Premier agent lancé !")}</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {t("setupWizard.agentReadyDesc", "Votre équipe IA est opérationnelle.")}
          </p>
        </div>
        <Button onClick={onComplete} className="mt-2">
          <Rocket className="w-4 h-4 mr-2" />
          {t("setupWizard.goToDashboard", "Aller au dashboard")}
        </Button>
      </div>
    );
  }

  const handleLaunch = async () => {
    if (!currentWorkspace?.id) return;
    setLaunching(true);
    try {
      const { error } = await supabase.functions.invoke("run-executor", {
        body: {
          run_type: "DAILY_EXECUTIVE_BRIEF",
          workspace_id: currentWorkspace.id,
          site_id: currentSite?.id,
        },
      });
      if (error) throw error;
      toast.success(t("setupWizard.agentLaunched", "Agent lancé avec succès !"));
      onComplete();
    } catch (err) {
      console.error("Agent launch error:", err);
      toast.error(t("setupWizard.agentError", "Erreur lors du lancement"));
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <p className="text-muted-foreground text-sm">
        {t("setupWizard.agentDesc", "Lancez votre premier briefing exécutif. Sophie Marchand (CGO) analysera votre situation.")}
      </p>
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="text-3xl">👩‍💼</div>
            <div>
              <p className="font-medium">Sophie Marchand</p>
              <p className="text-sm text-muted-foreground">Chief Growth Officer</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {t("setupWizard.briefingDesc", "Analyse complète de votre positionnement, opportunités de croissance et plan d'action.")}
          </p>
        </CardContent>
      </Card>
      <Button onClick={handleLaunch} disabled={launching} className="w-full">
        {launching ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        {t("setupWizard.launchBriefing", "Lancer le briefing exécutif")}
      </Button>
      <Button variant="ghost" onClick={onComplete} className="w-full text-muted-foreground">
        {t("setupWizard.skipForNow", "Passer pour l'instant")}
      </Button>
    </div>
  );
}

/* ─── Main Wizard ─── */
export default function SetupWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { sites } = useSites();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: WizardStep[] = [
    {
      id: "site",
      title: t("setupWizard.stepSite", "Ajoutez votre site"),
      description: t("setupWizard.stepSiteDesc", "L'URL de votre site pour démarrer l'analyse."),
      icon: Globe,
    },
    {
      id: "integration",
      title: t("setupWizard.stepIntegration", "Connectez vos données"),
      description: t("setupWizard.stepIntegrationDesc", "Google ou Meta pour synchroniser vos KPIs."),
      icon: Plug,
    },
    {
      id: "agent",
      title: t("setupWizard.stepAgent", "Lancez votre premier agent"),
      description: t("setupWizard.stepAgentDesc", "Votre CGO virtuelle analyse votre croissance."),
      icon: Bot,
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleStepComplete = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      navigate("/dashboard");
    }
  }, [currentStep, steps.length, navigate]);

  // Auto-advance if site already exists
  useEffect(() => {
    if (currentStep === 0 && sites.length > 0) {
      // Don't auto-advance, just show completed state
    }
  }, [sites, currentStep]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Rocket className="w-4 h-4" />
          {t("setupWizard.title", "Configuration de votre workspace")}
        </div>
        <h1 className="text-2xl font-bold">
          {currentWorkspace?.name || t("setupWizard.welcome", "Bienvenue")}
        </h1>
        <p className="text-muted-foreground">
          {t("setupWizard.subtitle", "3 étapes pour démarrer avec votre équipe IA")}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("setupWizard.step", "Étape")} {currentStep + 1}/{steps.length}
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Step indicators */}
        <div className="flex items-center justify-between px-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isDone = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <button
                key={step.id}
                onClick={() => i <= currentStep && setCurrentStep(i)}
                disabled={i > currentStep}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  i > currentStep && "opacity-40 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isDone && "bg-chart-3 text-white",
                    isCurrent && "gradient-bg text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                    !isDone && !isCurrent && "bg-secondary text-muted-foreground"
                  )}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "text-xs font-medium hidden sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const Icon = steps[currentStep].icon;
              return <Icon className="w-5 h-5 text-primary" />;
            })()}
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <StepSiteSetup
              onComplete={handleStepComplete}
              isComplete={sites.length > 0}
            />
          )}
          {currentStep === 1 && (
            <StepIntegration
              onComplete={handleStepComplete}
              isComplete={false}
            />
          )}
          {currentStep === 2 && (
            <StepAgentRun
              onComplete={handleStepComplete}
              isComplete={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("setupWizard.back", "Retour")}
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="text-muted-foreground"
        >
          {t("setupWizard.skipAll", "Passer le guide")}
        </Button>
      </div>
    </div>
  );
}
