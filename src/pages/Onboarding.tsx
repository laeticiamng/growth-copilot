import { useState, useEffect } from "react";
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
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const { user, loading: authLoading } = useAuth();
  const { workspaces } = useWorkspace();
  const navigate = useNavigate();

  // Translations - including HR and Legal for 11 departments total
  const txt = {
    marketing: isEn ? "Marketing" : "Marketing",
    marketingDesc: isEn ? "SEO, Content, Ads, Social" : "SEO, Contenu, Ads, Social",
    sales: isEn ? "Sales" : "Commercial",
    salesDesc: isEn ? "Pipeline, Outreach, CRM" : "Pipeline, Outreach, CRM",
    finance: isEn ? "Finance" : "Finance",
    financeDesc: isEn ? "ROI, Budget, Reporting" : "ROI, Budget, Reporting",
    security: isEn ? "Security" : "Sécurité",
    securityDesc: isEn ? "Access, Compliance, Audit" : "Accès, Compliance, Audit",
    product: isEn ? "Product" : "Produit",
    productDesc: isEn ? "Roadmap, OKRs, Priorities" : "Roadmap, OKRs, Priorités",
    engineering: isEn ? "Engineering" : "Ingénierie",
    engineeringDesc: isEn ? "Delivery, QA, Releases" : "Delivery, QA, Releases",
    data: isEn ? "Data" : "Data",
    dataDesc: isEn ? "Analytics, Cohorts, Funnels" : "Analytics, Cohorts, Funnels",
    support: isEn ? "Support" : "Support",
    supportDesc: isEn ? "Tickets, Knowledge Base" : "Tickets, Knowledge Base",
    governance: isEn ? "Governance" : "Gouvernance",
    governanceDesc: isEn ? "IT, Policies, Access" : "IT, Policies, Access",
    hr: isEn ? "Human Resources" : "Ressources Humaines",
    hrDesc: isEn ? "Recruiting, Onboarding, Reviews" : "Recrutement, Onboarding, Évaluations",
    legal: isEn ? "Legal" : "Juridique",
    legalDesc: isEn ? "Contracts, Compliance, GDPR" : "Contrats, Conformité, RGPD",
    traffic: isEn ? "Increase organic traffic" : "Augmenter le trafic organique",
    leads: isEn ? "Generate qualified leads" : "Générer des leads qualifiés",
    brand: isEn ? "Develop brand awareness" : "Développer la notoriété",
    local: isEn ? "Dominate local market" : "Dominer le marché local",
    ecommerce: isEn ? "Boost e-commerce sales" : "Booster les ventes e-commerce",
    content: isEn ? "Create quality content" : "Créer du contenu de qualité",
    paymentConfirmed: isEn ? "Payment confirmed! Your workspace is being created..." : "Paiement confirmé ! Votre workspace est en cours de création...",
    paymentCancelled: isEn ? "Payment cancelled. You can try again." : "Paiement annulé. Vous pouvez réessayer.",
    enterValidUrl: isEn ? "Please enter a valid URL" : "Veuillez entrer une URL valide",
    selectService: isEn ? "Select at least one service" : "Sélectionnez au moins un service",
    paymentError: isEn ? "Unable to create payment session" : "Impossible de créer la session de paiement",
    whatIsYourSite: isEn ? "What is your website?" : "Quel est votre site ?",
    enterUrl: isEn ? "Enter your website URL." : "Entrez l'URL de votre site web.",
    siteUrl: isEn ? "Site URL" : "URL du site",
    autoDetect: isEn ? "Auto-detection" : "Détection automatique",
    name: isEn ? "Name:" : "Nom :",
    continue: isEn ? "Continue" : "Continuer",
    goToDashboard: isEn ? "Go to dashboard" : "Aller au dashboard",
    existingWorkspaces: isEn ? `You already have ${workspaces?.length} workspace(s).` : `Vous avez déjà ${workspaces?.length} workspace(s).`,
    choosePlan: isEn ? "Choose your plan" : "Choisissez votre formule",
    allPlansInclude: isEn ? "All plans include 14 days free trial" : "Tous les plans incluent 14 jours d'essai gratuit",
    freeTrial: isEn ? "14 days free" : "14 jours gratuits",
    starter: "Starter",
    starterDesc: isEn ? "1 department • 50 runs/month • Ideal to start" : "1 département • 50 exécutions/mois • Idéal pour débuter",
    fullCompany: "Full Company",
    fullDesc: isEn ? "All departments activated. The complete digital company." : "Tous les départements activés. L'entreprise digitale complète.",
    recommended: isEn ? "Recommended" : "Recommandé",
    alacarte: isEn ? "À la carte" : "À la carte",
    alacarteDesc: isEn ? "Choose only the departments you need." : "Choisissez uniquement les départements dont vous avez besoin.",
    perDeptMonth: isEn ? "/dept/month" : "/dépt/mois",
    perMonth: isEn ? "/month" : "/mois",
    back: isEn ? "Back" : "Retour",
    chooseServices: isEn ? "Choose your services" : "Choisissez vos services",
    activateDepts: isEn ? "Activate the departments you need" : "Activez les départements dont vous avez besoin",
    selected: isEn ? "selected" : "sélectionné",
    objectives: isEn ? "What are your objectives?" : "Quels sont vos objectifs ?",
    selectPriorities: isEn ? "Select your priorities (optional)" : "Sélectionnez vos priorités (optionnel)",
    summaryPayment: isEn ? "Summary & Payment" : "Récapitulatif & Paiement",
    verifyOrder: isEn ? "Verify your order and finalize activation" : "Vérifiez votre commande et finalisez l'activation",
    deptsSelected: isEn ? "departments selected:" : "départements sélectionnés :",
    deptSelected: isEn ? "department selected:" : "département sélectionné :",
    monthlyTotal: isEn ? "Monthly total" : "Total mensuel",
    freeTrialOption: isEn ? "14 days free trial" : "Essai gratuit 14 jours",
    activated: isEn ? "Activated" : "Activé",
    trialDesc: isEn ? "Test all features without commitment. Cancel anytime." : "Testez toutes les fonctionnalités sans engagement. Annulez à tout moment.",
    startFreeTrial: isEn ? "Start free trial" : "Démarrer l'essai gratuit",
    payAndActivate: isEn ? "Pay and activate" : "Payer et activer",
    redirecting: isEn ? "Redirecting..." : "Redirection...",
    securePayment: isEn ? "Secure payment by Stripe." : "Paiement sécurisé par Stripe.",
    notChargedUntil: isEn ? "You won't be charged until the trial ends." : "Vous ne serez pas débité avant la fin de l'essai.",
    billedMonthly: isEn ? "Billed monthly." : "Facturé mensuellement.",
    perfect: isEn ? "Perfect!" : "Parfait !",
    creatingWorkspace: isEn ? "Your workspace is being created..." : "Votre workspace est en cours de création...",
    servicesActivated: isEn ? "services activated" : "services activés",
    redirectingToDashboard: isEn ? "Redirecting to your dashboard..." : "Redirection vers votre tableau de bord...",
  };

  const SERVICE_CATALOG = [
    { id: "marketing", name: txt.marketing, icon: TrendingUp, description: txt.marketingDesc, color: "text-blue-500" },
    { id: "sales", name: txt.sales, icon: Briefcase, description: txt.salesDesc, color: "text-green-500" },
    { id: "finance", name: txt.finance, icon: BarChart3, description: txt.financeDesc, color: "text-yellow-500" },
    { id: "security", name: txt.security, icon: Shield, description: txt.securityDesc, color: "text-red-500" },
    { id: "product", name: txt.product, icon: Puzzle, description: txt.productDesc, color: "text-purple-500" },
    { id: "engineering", name: txt.engineering, icon: Code, description: txt.engineeringDesc, color: "text-orange-500" },
    { id: "data", name: txt.data, icon: BarChart3, description: txt.dataDesc, color: "text-cyan-500" },
    { id: "support", name: txt.support, icon: HeadphonesIcon, description: txt.supportDesc, color: "text-pink-500" },
    { id: "governance", name: txt.governance, icon: Settings, description: txt.governanceDesc, color: "text-gray-500" },
    { id: "hr", name: txt.hr, icon: Users, description: txt.hrDesc, color: "text-emerald-500" },
    { id: "legal", name: txt.legal, icon: Scale, description: txt.legalDesc, color: "text-indigo-500" },
  ];

  const OBJECTIVES = [
    { id: "traffic", label: txt.traffic, icon: "📈" },
    { id: "leads", label: txt.leads, icon: "🎯" },
    { id: "brand", label: txt.brand, icon: "⭐" },
    { id: "local", label: txt.local, icon: "📍" },
    { id: "ecommerce", label: txt.ecommerce, icon: "🛒" },
    { id: "content", label: txt.content, icon: "✍️" },
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    
    if (checkoutStatus === "success") {
      setStep("summary");
      toast.success(txt.paymentConfirmed);
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => navigate("/dashboard"), 3000);
    } else if (checkoutStatus === "cancelled") {
      toast.error(txt.paymentCancelled);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [navigate]);

  useEffect(() => {
    if (isValidUrl(siteUrl) && siteUrl.length > 5) {
      const name = extractDomainName(siteUrl);
      setDetectedInfo({ name });
      if (!siteName) setSiteName(name);
    } else {
      setDetectedInfo(null);
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
      toast.error(txt.enterValidUrl);
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
      toast.error(txt.selectService);
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
      if (!data?.url) throw new Error(txt.paymentError);

      window.location.href = data.url;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : txt.paymentError);
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
          <span className="text-sm text-muted-foreground">{isEn ? "Configuration" : "Configuration"}</span>
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
                <CardTitle className="text-2xl">{txt.whatIsYourSite}</CardTitle>
                <CardDescription className="text-base">{txt.enterUrl}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-base">{txt.siteUrl}</Label>
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
                    <p className="text-sm text-destructive">{txt.enterValidUrl}</p>
                  )}
                </div>

                {detectedInfo && (
                  <div className="p-4 rounded-lg bg-chart-3/10 border border-chart-3/30 space-y-3">
                    <div className="flex items-center gap-2 text-chart-3">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">{txt.autoDetect}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{txt.name}</span>
                      <Input
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="h-8 flex-1"
                        placeholder={detectedInfo.name}
                      />
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleUrlNext} 
                  className="w-full h-12 text-base"
                  disabled={!isValidUrl(siteUrl)}
                >
                  {txt.continue}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {workspaces && workspaces.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    {txt.existingWorkspaces}{" "}
                    <button onClick={() => navigate("/dashboard")} className="text-primary hover:underline">
                      {txt.goToDashboard}
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
                <CardTitle className="text-2xl">{txt.choosePlan}</CardTitle>
                <CardDescription className="text-base">
                  <strong>{txt.allPlansInclude}</strong>
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
                        <span className="font-bold text-lg">{txt.starter}</span>
                        <Badge variant="outline" className="text-chart-3 border-chart-3">{txt.freeTrial}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{txt.starterDesc}</p>
                      <p className="text-lg font-bold mt-2">{PRICING.starter.toLocaleString()} €<span className="text-sm font-normal text-muted-foreground">{txt.perMonth}</span></p>
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
                        <span className="font-bold text-lg">{txt.fullCompany}</span>
                        <Badge variant="gradient">{txt.recommended}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{txt.fullDesc}</p>
                      <p className="text-lg font-bold mt-2">{PRICING.full.toLocaleString()} €<span className="text-sm font-normal text-muted-foreground">{txt.perMonth}</span></p>
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
                      <span className="font-bold text-lg">{txt.alacarte}</span>
                      <p className="text-sm text-muted-foreground mt-1">{txt.alacarteDesc}</p>
                      <p className="text-lg font-bold mt-2">{PRICING.department.toLocaleString()} €<span className="text-sm font-normal text-muted-foreground">{txt.perDeptMonth}</span></p>
                    </div>
                    {planType === "alacarte" && <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />}
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("url")} className="flex-1 h-12">
                    <ArrowLeft className="w-4 h-4 mr-2" />{txt.back}
                  </Button>
                  <Button onClick={handlePlanNext} className="flex-1 h-12">
                    {txt.continue}<ArrowRight className="w-4 h-4 ml-2" />
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
                <CardTitle className="text-2xl">{txt.chooseServices}</CardTitle>
                <CardDescription className="text-base">{txt.activateDepts}</CardDescription>
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
                    <ArrowLeft className="w-4 h-4 mr-2" />{txt.back}
                  </Button>
                  <Button onClick={handleServicesNext} className="flex-1 h-12" disabled={selectedServices.length === 0}>
                    {txt.continue} ({selectedServices.length} {txt.selected}{selectedServices.length > 1 ? "s" : ""})
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
                <CardTitle className="text-2xl">{txt.objectives}</CardTitle>
                <CardDescription className="text-base">{txt.selectPriorities}</CardDescription>
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
                    <ArrowLeft className="w-4 h-4 mr-2" />{txt.back}
                  </Button>
                  <Button onClick={handleObjectivesNext} className="flex-1 h-12">
                    {txt.continue}<ArrowRight className="w-4 h-4 ml-2" />
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
                <CardTitle className="text-2xl">{txt.summaryPayment}</CardTitle>
                <CardDescription className="text-base">{txt.verifyOrder}</CardDescription>
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
                          <span>{txt.fullCompany}</span>
                        </div>
                        <span className="font-bold">{PRICING.full.toLocaleString()} €{txt.perMonth}</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          {selectedServices.length} {selectedServices.length > 1 ? txt.deptsSelected : txt.deptSelected}
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
                    <span>{txt.monthlyTotal}</span>
                    <span className="text-primary">{getTotalPrice().toLocaleString()} €{txt.perMonth}</span>
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
                      <span className="font-medium">{txt.freeTrialOption}</span>
                      {useTrial && <Badge variant="secondary" className="bg-chart-3/20 text-chart-3">{txt.activated}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{txt.trialDesc}</p>
                  </div>
                  {useTrial && <CheckCircle2 className="w-5 h-5 text-chart-3 flex-shrink-0" />}
                </button>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("objectives")} className="flex-1 h-12">
                    <ArrowLeft className="w-4 h-4 mr-2" />{txt.back}
                  </Button>
                  <Button 
                    onClick={handlePayment} 
                    className="flex-1 h-12" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{txt.redirecting}</>
                    ) : useTrial ? (
                      <><Gift className="w-4 h-4 mr-2" />{txt.startFreeTrial}</>
                    ) : (
                      <><CreditCard className="w-4 h-4 mr-2" />{txt.payAndActivate}</>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  {txt.securePayment} {useTrial ? txt.notChargedUntil : txt.billedMonthly}
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
                <CardTitle className="text-2xl">{txt.perfect}</CardTitle>
                <CardDescription className="text-base">{txt.creatingWorkspace}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <Badge variant="gradient" className="text-sm">
                  {planType === "full" ? txt.fullCompany : `${selectedServices.length} ${txt.servicesActivated}`}
                </Badge>
                <p className="text-muted-foreground">{txt.redirectingToDashboard}</p>
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
