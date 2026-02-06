import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, Globe, Target, Rocket, CheckCircle2, ArrowRight, Sparkles, 
  Building2, Crown, Puzzle, Briefcase, TrendingUp, Shield, Code, 
  BarChart3, HeadphonesIcon, Settings, ArrowLeft, CreditCard, Gift,
  Users, Scale
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteAnalysisPreview, type SiteAnalysis } from "@/components/onboarding/SiteAnalysisPreview";

type OnboardingStep = "url" | "plan" | "services" | "objectives" | "payment" | "summary";
type PlanType = "starter" | "full" | "alacarte";

const PRICING = {
  starter: 490,
  full: 9000,
  department: 1900,
};

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

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
};

export default function Onboarding() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { workspaces } = useWorkspace();
  const navigate = useNavigate();

  const SERVICE_CATALOG = [
    { id: "marketing", name: t("onboardingFlow.marketing"), icon: TrendingUp, description: t("onboardingFlow.marketingDesc"), color: "text-blue-500" },
    { id: "sales", name: t("onboardingFlow.sales"), icon: Briefcase, description: t("onboardingFlow.salesDesc"), color: "text-green-500" },
    { id: "finance", name: t("onboardingFlow.finance"), icon: BarChart3, description: t("onboardingFlow.financeDesc"), color: "text-yellow-500" },
    { id: "security", name: t("onboardingFlow.security"), icon: Shield, description: t("onboardingFlow.securityDesc"), color: "text-red-500" },
    { id: "product", name: t("onboardingFlow.product"), icon: Puzzle, description: t("onboardingFlow.productDesc"), color: "text-purple-500" },
    { id: "engineering", name: t("onboardingFlow.engineering"), icon: Code, description: t("onboardingFlow.engineeringDesc"), color: "text-orange-500" },
    { id: "data", name: t("onboardingFlow.data"), icon: BarChart3, description: t("onboardingFlow.dataDesc"), color: "text-cyan-500" },
    { id: "support", name: t("onboardingFlow.support"), icon: HeadphonesIcon, description: t("onboardingFlow.supportDesc"), color: "text-pink-500" },
    { id: "governance", name: t("onboardingFlow.governance"), icon: Settings, description: t("onboardingFlow.governanceDesc"), color: "text-gray-500" },
    { id: "hr", name: t("onboardingFlow.hr"), icon: Users, description: t("onboardingFlow.hrDesc"), color: "text-emerald-500" },
    { id: "legal", name: t("onboardingFlow.legal"), icon: Scale, description: t("onboardingFlow.legalDesc"), color: "text-indigo-500" },
  ];

  const OBJECTIVES = [
    { id: "traffic", label: t("onboardingFlow.traffic"), icon: "📈" },
    { id: "leads", label: t("onboardingFlow.leads"), icon: "🎯" },
    { id: "brand", label: t("onboardingFlow.brand"), icon: "⭐" },
    { id: "local", label: t("onboardingFlow.local"), icon: "📍" },
    { id: "ecommerce", label: t("onboardingFlow.ecommerce"), icon: "🛒" },
    { id: "content", label: t("onboardingFlow.content"), icon: "✍️" },
  ];

  const [step, setStep] = useState<OnboardingStep>("url");
  const [siteUrl, setSiteUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [planType, setPlanType] = useState<PlanType>("starter");
  const [selectedServices, setSelectedServices] = useState<string[]>(SERVICE_CATALOG.map(s => s.id));
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlTouched, setUrlTouched] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<{ name: string } | null>(null);
  const [useTrial, setUseTrial] = useState(false);
  const [siteAnalysis, setSiteAnalysis] = useState<SiteAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTriggered, setAnalysisTriggered] = useState(false);

  const triggerSiteAnalysis = useCallback(async (url: string) => {
    if (isAnalyzing || analysisTriggered) return;
    setIsAnalyzing(true);
    setAnalysisTriggered(true);
    try {
      const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
      const { data, error } = await supabase.functions.invoke("site-analyze", {
        body: { url: formattedUrl },
      });
      if (!error && data?.success && data?.analysis) {
        setSiteAnalysis(data.analysis);
        // Auto-fill site name from page title if available
        if (data.analysis.title && !siteName) {
          const cleanTitle = data.analysis.title.split(/[|\-–—]/)[0].trim();
          if (cleanTitle.length > 2 && cleanTitle.length < 60) {
            setSiteName(cleanTitle);
          }
        }
      }
    } catch (e) {
      console.error("Site analysis failed:", e);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, analysisTriggered, siteName]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    
    if (checkoutStatus === "success") {
      setStep("summary");
      toast.success(t("onboardingFlow.paymentConfirmed"));
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => navigate("/dashboard"), 3000);
    } else if (checkoutStatus === "cancelled") {
      toast.error(t("onboardingFlow.paymentCancelled"));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [navigate, t]);

  useEffect(() => {
    if (isValidUrl(siteUrl) && siteUrl.length > 5) {
      const name = extractDomainName(siteUrl);
      setDetectedInfo({ name });
      if (!siteName) setSiteName(name);
      // Auto-trigger analysis after 1s debounce
      if (!analysisTriggered) {
        const timer = setTimeout(() => triggerSiteAnalysis(siteUrl), 1000);
        return () => clearTimeout(timer);
      }
    } else {
      setDetectedInfo(null);
      setSiteAnalysis(null);
      setAnalysisTriggered(false);
    }
  }, [siteUrl]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const getProgress = () => {
    switch (step) {
      case "url": return 16;
      case "plan": return 33;
      case "services": return 50;
      case "objectives": return 66;
      case "payment": return 83;
      case "summary": return 100;
      default: return 0;
    }
  };

  const getTotalPrice = () => {
    if (planType === "starter") return PRICING.starter;
    if (planType === "full") return PRICING.full;
    return selectedServices.length * PRICING.department;
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleObjective = (id: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleUrlNext = () => {
    if (!isValidUrl(siteUrl)) {
      toast.error(t("onboardingFlow.enterValidUrl"));
      return;
    }
    setStep("plan");
  };

  const handlePlanNext = () => {
    if (planType === "starter") {
      setSelectedServices(["marketing"]);
      setStep("objectives");
    } else if (planType === "full") {
      setSelectedServices(SERVICE_CATALOG.map(s => s.id));
      setStep("objectives");
    } else {
      setStep("services");
    }
  };

  const handleServicesNext = () => {
    if (selectedServices.length === 0) {
      toast.error(t("onboardingFlow.selectService"));
      return;
    }
    setStep("objectives");
  };

  const handleObjectivesNext = () => {
    setStep("payment");
  };

  const handlePayment = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const workspaceName = siteName || detectedInfo?.name || "Mon Workspace";
      const formattedUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
      const slug = generateSlug(workspaceName);

      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          plan_type: planType === "full" ? "full_company" : "department",
          departments: planType === "alacarte" ? selectedServices : [],
          use_trial: useTrial,
          onboarding_data: {
            site_url: formattedUrl,
            site_name: workspaceName,
            workspace_slug: slug,
            objectives: selectedObjectives,
            plan_type: planType,
            selected_services: selectedServices,
          },
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error(t("onboardingFlow.paymentError"));

      window.location.href = data.url;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : t("onboardingFlow.paymentError"));
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg gradient-bg">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">Growth OS</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto w-full px-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{t("onboardingFlow.configuration")}</span>
          <span className="text-sm font-medium">{getProgress()}%</span>
        </div>
        <Progress value={getProgress()} className="h-2" />
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pb-12">
        <div className="w-full max-w-2xl">
          
          {step === "url" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t("onboardingFlow.whatIsYourSite")}</CardTitle>
                <CardDescription className="text-base">{t("onboardingFlow.enterUrl")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-base">{t("onboardingFlow.siteUrl")}</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="example.com"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    onBlur={() => setUrlTouched(true)}
                    className="h-12 text-lg"
                    autoFocus
                  />
                  {urlTouched && siteUrl && !isValidUrl(siteUrl) && (
                    <p className="text-sm text-destructive">{t("onboardingFlow.enterValidUrl")}</p>
                  )}
                </div>

                {detectedInfo && (
                  <div className="p-4 rounded-lg bg-chart-3/10 border border-chart-3/30 space-y-3">
                    <div className="flex items-center gap-2 text-chart-3">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">{t("onboardingFlow.autoDetect")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{t("onboardingFlow.name")}</span>
                      <Input
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="h-8 flex-1"
                        placeholder={detectedInfo.name}
                      />
                    </div>
                  </div>
                )}

                <SiteAnalysisPreview 
                  analysis={siteAnalysis} 
                  isLoading={isAnalyzing} 
                  url={siteUrl} 
                />

                <Button 
                  onClick={handleUrlNext} 
                  className="w-full h-12 text-base"
                  disabled={!isValidUrl(siteUrl)}
                >
                  {t("onboardingFlow.continue")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {workspaces && workspaces.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    {t("onboardingFlow.existingWorkspaces", { count: workspaces.length })}{" "}
                    <button onClick={() => navigate("/dashboard")} className="text-primary hover:underline">
                      {t("onboardingFlow.goToDashboard")}
                    </button>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {step === "plan" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t("onboardingFlow.choosePlan")}</CardTitle>
                <CardDescription className="text-base">
                  <strong>{t("onboardingFlow.allPlansInclude")}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <button
                    onClick={() => setPlanType("starter")}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                      planType === "starter" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="p-3 rounded-lg bg-chart-3/20">
                      <Gift className="w-6 h-6 text-chart-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{t("onboardingFlow.starter")}</span>
                        <Badge variant="outline" className="text-chart-3 border-chart-3">{t("onboardingFlow.freeTrial")}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{t("onboardingFlow.starterDesc")}</p>
                      <p className="text-lg font-bold mt-2">{PRICING.starter.toLocaleString()} €<span className="text-sm font-normal text-muted-foreground">{t("onboardingFlow.perMonth")}</span></p>
                    </div>
                    {planType === "starter" && <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />}
                  </button>

                  <button
                    onClick={() => setPlanType("full")}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                      planType === "full" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-accent">
                      <Crown className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{t("onboardingFlow.fullCompany")}</span>
                        <Badge variant="gradient">{t("onboardingFlow.recommended")}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{t("onboardingFlow.fullDesc")}</p>
                      <p className="text-lg font-bold mt-2">{PRICING.full.toLocaleString()} €<span className="text-sm font-normal text-muted-foreground">{t("onboardingFlow.perMonth")}</span></p>
                    </div>
                    {planType === "full" && <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />}
                  </button>

                  <button
                    onClick={() => setPlanType("alacarte")}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                      planType === "alacarte" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="p-3 rounded-lg bg-secondary">
                      <Puzzle className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-lg">{t("onboardingFlow.alacarte")}</span>
                      <p className="text-sm text-muted-foreground mt-1">{t("onboardingFlow.alacarteDesc")}</p>
                      <p className="text-lg font-bold mt-2">{PRICING.department.toLocaleString()} €<span className="text-sm font-normal text-muted-foreground">{t("onboardingFlow.perDeptMonth")}</span></p>
                    </div>
                    {planType === "alacarte" && <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />}
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("url")} className="flex-1 h-12">
                    <ArrowLeft className="w-4 h-4 mr-2" />{t("onboardingFlow.back")}
                  </Button>
                  <Button onClick={handlePlanNext} className="flex-1 h-12">
                    {t("onboardingFlow.continue")}<ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "services" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Puzzle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t("onboardingFlow.chooseServices")}</CardTitle>
                <CardDescription className="text-base">{t("onboardingFlow.activateDepts")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICE_CATALOG.map((service) => {
                    const Icon = service.icon;
                    const isSelected = selectedServices.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/20" : "bg-muted"}`}>
                          <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : service.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{service.description}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("plan")} className="flex-1 h-12">
                    <ArrowLeft className="w-4 h-4 mr-2" />{t("onboardingFlow.back")}
                  </Button>
                  <Button onClick={handleServicesNext} className="flex-1 h-12" disabled={selectedServices.length === 0}>
                    {t("onboardingFlow.continue")} ({selectedServices.length} {t("onboardingFlow.selected")}{selectedServices.length > 1 ? "s" : ""})
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "objectives" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t("onboardingFlow.objectives")}</CardTitle>
                <CardDescription className="text-base">{t("onboardingFlow.selectPriorities")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OBJECTIVES.map((obj) => (
                    <button
                      key={obj.id}
                      onClick={() => toggleObjective(obj.id)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                        selectedObjectives.includes(obj.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-2xl">{obj.icon}</span>
                      <span className="font-medium text-sm">{obj.label}</span>
                      {selectedObjectives.includes(obj.id) && (
                        <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setStep(planType === "full" ? "plan" : "services")} 
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />{t("onboardingFlow.back")}
                  </Button>
                  <Button onClick={handleObjectivesNext} className="flex-1 h-12">
                    {t("onboardingFlow.continue")}<ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "payment" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t("onboardingFlow.summaryPayment")}</CardTitle>
                <CardDescription className="text-base">{t("onboardingFlow.verifyOrder")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{siteName || detectedInfo?.name || "Workspace"}</span>
                    </div>
                    <Badge variant="secondary">{siteUrl}</Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    {planType === "full" ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-primary" />
                          <span>{t("onboardingFlow.fullCompany")}</span>
                        </div>
                        <span className="font-bold">{PRICING.full.toLocaleString()} €{t("onboardingFlow.perMonth")}</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          {selectedServices.length} {selectedServices.length > 1 ? t("onboardingFlow.deptsSelected") : t("onboardingFlow.deptSelected")}
                        </div>
                        {selectedServices.map(serviceId => {
                          const service = SERVICE_CATALOG.find(s => s.id === serviceId);
                          return service ? (
                            <div key={serviceId} className="flex items-center justify-between text-sm">
                              <span>{service.name}</span>
                              <span>{PRICING.department.toLocaleString()} €</span>
                            </div>
                          ) : null;
                        })}
                      </>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>{t("onboardingFlow.monthlyTotal")}</span>
                    <span className="text-primary">{getTotalPrice().toLocaleString()} €{t("onboardingFlow.perMonth")}</span>
                  </div>
                </div>

                <button
                  onClick={() => setUseTrial(!useTrial)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all ${
                    useTrial ? "border-chart-3 bg-chart-3/10" : "border-border hover:border-chart-3/50"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${useTrial ? "bg-chart-3/20" : "bg-muted"}`}>
                    <Gift className={`w-5 h-5 ${useTrial ? "text-chart-3" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t("onboardingFlow.freeTrialOption")}</span>
                      {useTrial && <Badge variant="secondary" className="bg-chart-3/20 text-chart-3">{t("onboardingFlow.activated")}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{t("onboardingFlow.trialDesc")}</p>
                  </div>
                  {useTrial && <CheckCircle2 className="w-5 h-5 text-chart-3 flex-shrink-0" />}
                </button>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("objectives")} className="flex-1 h-12">
                    <ArrowLeft className="w-4 h-4 mr-2" />{t("onboardingFlow.back")}
                  </Button>
                  <Button 
                    onClick={handlePayment} 
                    className="flex-1 h-12" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("onboardingFlow.redirecting")}</>
                    ) : useTrial ? (
                      <><Gift className="w-4 h-4 mr-2" />{t("onboardingFlow.startFreeTrial")}</>
                    ) : (
                      <><CreditCard className="w-4 h-4 mr-2" />{t("onboardingFlow.payAndActivate")}</>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  {t("onboardingFlow.securePayment")} {useTrial ? t("onboardingFlow.notChargedUntil") : t("onboardingFlow.billedMonthly")}
                </p>
              </CardContent>
            </Card>
          )}

          {step === "summary" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-chart-3/20 w-fit mb-4">
                  <CheckCircle2 className="w-8 h-8 text-chart-3" />
                </div>
                <CardTitle className="text-2xl">{t("onboardingFlow.perfect")}</CardTitle>
                <CardDescription className="text-base">{t("onboardingFlow.creatingWorkspace")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <Badge variant="gradient" className="text-sm">
                  {planType === "full" ? t("onboardingFlow.fullCompany") : `${selectedServices.length} ${t("onboardingFlow.servicesActivated")}`}
                </Badge>
                <p className="text-muted-foreground">{t("onboardingFlow.redirectingToDashboard")}</p>
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
