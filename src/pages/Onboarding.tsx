import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, CheckCircle2, Globe, Loader2, Rocket, Shield, Target, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { SiteAnalysisPreview, type SiteAnalysis } from "@/components/onboarding/SiteAnalysisPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

type ProfileId = "consultant" | "agency" | "brand";
type PlanId = "solo" | "agency" | "scale";

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.includes(".");
  } catch {
    return false;
  }
};

const extractDomainName = (url: string): string => {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const hostname = parsed.hostname.replace(/^www\./, "");
    const parts = hostname.split(".");
    const main = parts.length > 1 ? parts[parts.length - 2] : parts[0];
    return main.charAt(0).toUpperCase() + main.slice(1);
  } catch {
    return "";
  }
};

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { workspaces } = useWorkspace();

  const profiles = useMemo(() => [
    {
      id: "consultant" as const,
      title: t("onboardingFlow.consultantTitle"),
      description: t("onboardingFlow.consultantDesc"),
      icon: Target,
    },
    {
      id: "agency" as const,
      title: t("onboardingFlow.agencyTitle"),
      description: t("onboardingFlow.agencyDesc"),
      icon: Users,
    },
    {
      id: "brand" as const,
      title: t("onboardingFlow.brandTitle"),
      description: t("onboardingFlow.brandDesc"),
      icon: Building2,
    },
  ], [t]);

  const plans = useMemo(() => [
    {
      id: "solo" as const,
      title: t("onboardingFlow.soloTitle"),
      price: t("onboardingFlow.soloPrice"),
      description: t("onboardingFlow.soloDesc"),
      stripePlanType: "department",
    },
    {
      id: "agency" as const,
      title: t("onboardingFlow.agencyPlanTitle"),
      price: t("onboardingFlow.agencyPlanPrice"),
      description: t("onboardingFlow.agencyPlanDesc"),
      stripePlanType: "department",
    },
    {
      id: "scale" as const,
      title: t("onboardingFlow.scaleTitle"),
      price: t("onboardingFlow.scalePrice"),
      description: t("onboardingFlow.scaleDesc"),
      stripePlanType: "full_company",
    },
  ], [t]);

  const [siteUrl, setSiteUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [profile, setProfile] = useState<ProfileId>("agency");
  const [plan, setPlan] = useState<PlanId>("agency");
  const [notes, setNotes] = useState("");
  const [siteAnalysis, setSiteAnalysis] = useState<SiteAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (isValidUrl(siteUrl) && !siteName) {
      setSiteName(extractDomainName(siteUrl));
    }
  }, [siteName, siteUrl]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    if (checkoutStatus === "success") {
      toast.success(t("onboardingFlow.subscriptionConfirmed"));
      window.history.replaceState({}, "", window.location.pathname);
      navigate("/dashboard");
    }
    if (checkoutStatus === "cancelled") {
      toast.error(t("onboardingFlow.checkoutCancelled"));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [navigate, t]);

  const progress = useMemo(() => {
    let completed = 0;
    if (siteUrl) completed += 25;
    if (profile) completed += 25;
    if (plan) completed += 25;
    if (notes.length > 10) completed += 25;
    return completed;
  }, [notes.length, plan, profile, siteUrl]);

  const analyzeSite = async () => {
    if (!isValidUrl(siteUrl)) {
      toast.error(t("onboardingFlow.enterValidWebsite"));
      return;
    }
    setAnalysisLoading(true);
    try {
      const formattedUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
      const { data, error } = await supabase.functions.invoke("site-analyze", {
        body: { url: formattedUrl },
      });
      if (error) throw error;
      if (data?.analysis) {
        setSiteAnalysis(data.analysis);
        if (data.analysis.title && !siteName) {
          setSiteName(data.analysis.title.split(/[|\-–—]/)[0].trim());
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(t("onboardingFlow.unableToAnalyze"));
    } finally {
      setAnalysisLoading(false);
    }
  };

  const createWorkspaceDirectly = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const workspaceName = siteName || extractDomainName(siteUrl) || "Growth Workspace";
      const formattedUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
      const slug = generateSlug(workspaceName);

      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({ name: workspaceName, slug, owner_id: user.id })
        .select()
        .single();
      if (workspaceError) throw workspaceError;

      const { error: siteError } = await supabase.from("sites").insert({
        workspace_id: workspace.id,
        url: formattedUrl,
        name: workspaceName,
      });
      if (siteError) {
        console.error("Non blocking site creation error", siteError);
      }

      toast.success(t("onboardingFlow.workspaceCreated"));
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("onboardingFlow.unableToCreateWorkspace"));
    } finally {
      setSubmitting(false);
    }
  };

  const launchCheckout = async () => {
    if (!user) return;
    if (!isValidUrl(siteUrl)) {
      toast.error(t("onboardingFlow.enterValidWebsite"));
      return;
    }
    setSubmitting(true);
    try {
      const selectedPlan = plans.find((item) => item.id === plan) ?? plans[1];
      const workspaceName = siteName || extractDomainName(siteUrl) || "Growth Workspace";
      const formattedUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
      const slug = generateSlug(workspaceName);

      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          plan_type: selectedPlan.stripePlanType,
          departments: profile === "consultant" ? ["marketing"] : ["marketing", "governance"],
          use_trial: plan === "solo",
          onboarding_data: {
            site_url: formattedUrl,
            site_name: workspaceName,
            workspace_slug: slug,
            operating_model: profile,
            notes,
            plan_type: plan,
          },
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error(t("onboardingFlow.missingCheckoutUrl"));
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("onboardingFlow.unableToStartCheckout"));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg gradient-bg">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">{t("onboardingFlow.growthOs")}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <Card className="border-primary/20 bg-background/90 backdrop-blur">
            <CardHeader>
              <Badge variant="agent" className="w-fit mb-3">{t("onboardingFlow.onboardingBadge")}</Badge>
              <CardTitle className="text-3xl">{t("onboardingFlow.setupTitle")}</CardTitle>
              <CardDescription className="text-base leading-7">
                {t("onboardingFlow.setupDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">{t("onboardingFlow.setupProgress")}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="space-y-3">
                <Label htmlFor="site-url">{t("onboardingFlow.primaryWebsite")}</Label>
                <div className="flex gap-3">
                  <Input
                    id="site-url"
                    placeholder="example.com"
                    value={siteUrl}
                    onChange={(event) => setSiteUrl(event.target.value)}
                    className="h-12"
                  />
                  <Button variant="outline" className="h-12" onClick={analyzeSite} disabled={analysisLoading || !siteUrl}>
                    {analysisLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    <span className="ml-2 hidden sm:inline">{t("onboardingFlow.analyze")}</span>
                  </Button>
                </div>
                <Input
                  placeholder={t("onboardingFlow.workspaceName")}
                  value={siteName}
                  onChange={(event) => setSiteName(event.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-4">
                <Label>{t("onboardingFlow.whoIsThisFor")}</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  {profiles.map((item) => {
                    const Icon = item.icon;
                    const active = profile === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setProfile(item.id)}
                        className={`rounded-2xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary mb-3">
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className="font-semibold mb-1">{item.title}</p>
                        <p className="text-sm text-muted-foreground leading-6">{item.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <Label>{t("onboardingFlow.choosePackaging")}</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  {plans.map((item) => {
                    const active = plan === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPlan(item.id)}
                        className={`rounded-2xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <p className="font-semibold">{item.title}</p>
                          {active && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        </div>
                        <p className="text-xl font-bold mb-2">{item.price}</p>
                        <p className="text-sm text-muted-foreground leading-6">{item.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="notes">{t("onboardingFlow.primaryObjective")}</Label>
                <Textarea
                  id="notes"
                  placeholder={t("onboardingFlow.objectivePlaceholder")}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={5}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="lg" onClick={createWorkspaceDirectly} disabled={submitting || !isValidUrl(siteUrl)}>
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {t("onboardingFlow.createWorkspaceNow")}
                </Button>
                <Button variant="hero" size="lg" onClick={launchCheckout} disabled={submitting || !isValidUrl(siteUrl)}>
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {t("onboardingFlow.continueToCheckout")}
                </Button>
              </div>

              {workspaces && workspaces.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("onboardingFlow.existingWorkspaces", { count: workspaces.length })} <button onClick={() => navigate("/dashboard")} className="text-primary hover:underline">{t("onboardingFlow.existingWorkspacesCta")}</button>.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/60 bg-background/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl">{t("onboardingFlow.whatGetsActivated")}</CardTitle>
                <CardDescription>{t("onboardingFlow.whatGetsActivatedDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-primary mt-0.5" />
                  <span>{t("onboardingFlow.activationApproval")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-4 h-4 text-primary mt-0.5" />
                  <span>{t("onboardingFlow.activationEvidence")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Rocket className="w-4 h-4 text-primary mt-0.5" />
                  <span>{t("onboardingFlow.activationScheduler")}</span>
                </div>
              </CardContent>
            </Card>

            <SiteAnalysisPreview analysis={siteAnalysis} isLoading={analysisLoading} url={siteUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
