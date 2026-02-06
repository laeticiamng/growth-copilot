import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useServices } from "@/hooks/useServices";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2, ArrowRight, Crown, Rocket, ExternalLink,
  TrendingUp, Briefcase, BarChart3, Shield, Puzzle, Code,
  HeadphonesIcon, Settings,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: "done" | "pending" | "current";
  link: string;
  stepNumber: number;
}

const SERVICE_ICONS: Record<string, React.ElementType> = {
  "core-os": Settings, marketing: TrendingUp, sales: Briefcase,
  finance: BarChart3, security: Shield, product: Puzzle,
  engineering: Code, data: BarChart3, support: HeadphonesIcon, governance: Settings,
};

export default function OnboardingGuide() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const { enabledServices, isFullCompany } = useServices();

  const setupSteps: SetupStep[] = [
    { id: "site", stepNumber: 1, title: t("onboarding.step1Title"), description: t("onboarding.step1Desc"), status: currentSite ? "done" : "current", link: "/dashboard/sites" },
    { id: "brand", stepNumber: 2, title: t("onboarding.step2Title"), description: t("onboarding.step2Desc"), status: currentSite ? "current" : "pending", link: "/dashboard/brand-kit" },
    { id: "integrations", stepNumber: 3, title: t("onboarding.step3Title"), description: t("onboarding.step3Desc"), status: "pending", link: "/dashboard/integrations" },
    { id: "run", stepNumber: 4, title: t("onboarding.step4Title"), description: t("onboarding.step4Desc"), status: "pending", link: "/dashboard" },
  ];

  const completedSteps = setupSteps.filter(s => s.status === "done").length;
  const progress = (completedSteps / setupSteps.length) * 100;

  return (
    <div className="space-y-8">
      <a href="#setup-steps" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
        {t("onboarding.skipToContent")}
      </a>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("dashboard.onboarding.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.onboarding.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {isFullCompany && (
            <Badge variant="gradient" className="px-3 py-1"><Crown className="w-4 h-4 mr-1" />Full Company</Badge>
          )}
          <Badge variant="secondary" className="px-3 py-1">
            <Rocket className="w-4 h-4 mr-1" />
            {t("onboarding.stepsProgress", { done: completedSteps, total: setupSteps.length })}
          </Badge>
        </div>
      </div>

      <Card variant="gradient">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">{t("dashboard.onboarding.progress")}</span>
            <span className="text-sm">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <Card variant="feature" id="setup-steps">
        <CardHeader>
          <CardTitle>{t("dashboard.onboarding.steps")}</CardTitle>
          <CardDescription>{t("dashboard.onboarding.stepsSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6 px-2">
            {setupSteps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <a
                  href={step.link}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all text-sm font-semibold",
                    step.status === "done" ? "bg-chart-3 text-white hover:bg-chart-3/90 cursor-pointer"
                      : step.status === "current" ? "gradient-bg text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                      : "bg-secondary text-muted-foreground cursor-pointer hover:bg-secondary/80"
                  )}
                  aria-label={t("onboarding.stepAria", { num: step.stepNumber, title: step.title, status: step.status === "done" ? t("onboarding.statusDone") : step.status === "current" ? t("onboarding.statusCurrent") : t("onboarding.statusTodo") })}
                  aria-current={step.status === "current" ? "step" : undefined}
                >
                  {step.status === "done" ? <CheckCircle2 className="w-5 h-5" /> : step.stepNumber}
                </a>
                {i < setupSteps.length - 1 && (
                  <div className={cn("hidden sm:block w-12 md:w-20 h-0.5 mx-1", step.status === "done" ? "bg-chart-3" : "bg-border")} />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {setupSteps.map((step) => (
              <a key={step.id} href={step.link} className={cn(
                "flex items-center gap-4 p-4 rounded-lg transition-all group",
                step.status === "done" ? "bg-chart-3/10 hover:bg-chart-3/15"
                  : step.status === "current" ? "bg-primary/10 border-2 border-primary/30 hover:border-primary/50"
                  : "bg-secondary/50 hover:bg-secondary/80"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold",
                  step.status === "done" ? "bg-chart-3 text-white"
                    : step.status === "current" ? "gradient-bg text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {step.status === "done" ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium", step.status === "done" && "text-muted-foreground")}>
                    {step.title}
                    {step.status === "current" && <Badge variant="gradient" className="ml-2 text-xs">{t("onboarding.statusCurrent")}</Badge>}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <ArrowRight className={cn("w-5 h-5 transition-transform group-hover:translate-x-1", step.status === "done" ? "text-chart-3" : "text-muted-foreground")} />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="feature">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("onboarding.enabledServices")}</CardTitle>
              <CardDescription>{t("onboarding.enabledServicesDesc")}</CardDescription>
            </div>
            {!isFullCompany && (
              <RouterLink to="/dashboard/billing">
                <Button variant="outline" size="sm"><Crown className="w-4 h-4 mr-1" />Upgrade</Button>
              </RouterLink>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enabledServices.map((service) => {
              const Icon = SERVICE_ICONS[service.slug] || Puzzle;
              return (
                <div key={service.id} className="flex items-center gap-3 p-4 rounded-lg bg-chart-3/10 border border-chart-3/30">
                  <div className="p-2 rounded-lg bg-chart-3/20"><Icon className="w-5 h-5 text-chart-3" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{service.description}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-chart-3 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card variant="feature">
        <CardHeader>
          <CardTitle>{t("dashboard.onboarding.resources")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">{t("dashboard.onboarding.documentation")}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.onboarding.guides")}</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">{t("dashboard.onboarding.apiReference")}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.onboarding.forIntegrations")}</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">{t("dashboard.onboarding.support")}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.onboarding.needHelp")}</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
