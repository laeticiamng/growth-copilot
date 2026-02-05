import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  BarChart3, HeadphonesIcon, Settings, ArrowLeft, CreditCard, Gift
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Step types - extended for payment
type OnboardingStep = "url" | "plan" | "services" | "objectives" | "payment" | "summary";

// Plan types - now includes starter
type PlanType = "starter" | "full" | "alacarte";

// Service definitions matching database catalog
const SERVICE_CATALOG = [
  { id: "marketing", name: "Marketing", icon: TrendingUp, description: "SEO, Contenu, Ads, Social", color: "text-blue-500" },
  { id: "sales", name: "Commercial", icon: Briefcase, description: "Pipeline, Outreach, CRM", color: "text-green-500" },
  { id: "finance", name: "Finance", icon: BarChart3, description: "ROI, Budget, Reporting", color: "text-yellow-500" },
  { id: "security", name: "Sécurité", icon: Shield, description: "Accès, Compliance, Audit", color: "text-red-500" },
  { id: "product", name: "Produit", icon: Puzzle, description: "Roadmap, OKRs, Priorités", color: "text-purple-500" },
  { id: "engineering", name: "Ingénierie", icon: Code, description: "Delivery, QA, Releases", color: "text-orange-500" },
  { id: "data", name: "Data", icon: BarChart3, description: "Analytics, Cohorts, Funnels", color: "text-cyan-500" },
  { id: "support", name: "Support", icon: HeadphonesIcon, description: "Tickets, Knowledge Base", color: "text-pink-500" },
  { id: "governance", name: "Gouvernance", icon: Settings, description: "IT, Policies, Access", color: "text-gray-500" },
];

// Pricing
const PRICING = {
  starter: 490,
  full: 9000,
  department: 1900,
};

// Objectives options
const OBJECTIVES = [
  { id: "traffic", label: "Augmenter le trafic organique", icon: "📈" },
  { id: "leads", label: "Générer des leads qualifiés", icon: "🎯" },
  { id: "brand", label: "Développer la notoriété", icon: "⭐" },
  { id: "local", label: "Dominer le marché local", icon: "📍" },
  { id: "ecommerce", label: "Booster les ventes e-commerce", icon: "🛒" },
  { id: "content", label: "Créer du contenu de qualité", icon: "✍️" },
];

// URL validation
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.includes(".");
  } catch {
    return false;
  }
};

// Extract domain name
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

// Generate slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
};

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const { workspaces } = useWorkspace();
  const navigate = useNavigate();

  // Form state
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

  // Check for checkout success/cancel in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    
    if (checkoutStatus === "success") {
      setStep("summary");
      toast.success("Paiement confirmé ! Votre workspace est en cours de création...");
      // Clear the URL params
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => navigate("/dashboard"), 3000);
    } else if (checkoutStatus === "cancelled") {
      toast.error("Paiement annulé. Vous pouvez réessayer.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [navigate]);

  // Auto-detect info from URL
  useEffect(() => {
    if (isValidUrl(siteUrl) && siteUrl.length > 5) {
      const name = extractDomainName(siteUrl);
      setDetectedInfo({ name });
      if (!siteName) setSiteName(name);
    } else {
      setDetectedInfo(null);
    }
  }, [siteUrl]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Calculate progress
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

  // Calculate total price
  const getTotalPrice = () => {
    if (planType === "starter") return PRICING.starter;
    if (planType === "full") return PRICING.full;
    return selectedServices.length * PRICING.department;
  };

  // Toggle service selection
  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Toggle objective
  const toggleObjective = (id: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  // Navigation handlers
  const handleUrlNext = () => {
    if (!isValidUrl(siteUrl)) {
      toast.error("Veuillez entrer une URL valide");
      return;
    }
    setStep("plan");
  };

  const handlePlanNext = () => {
    if (planType === "starter") {
      // Starter plan = 1 department (marketing by default)
      setSelectedServices(["marketing"]);
      setStep("objectives");
    } else if (planType === "full") {
      setSelectedServices(SERVICE_CATALOG.map(s => s.id));
      setStep("objectives"); // Skip service selection for full plan
    } else {
      setStep("services");
    }
  };

  const handleServicesNext = () => {
    if (selectedServices.length === 0) {
      toast.error("Sélectionnez au moins un service");
      return;
    }
    setStep("objectives");
  };

  const handleObjectivesNext = () => {
    setStep("payment");
  };

  // Handle payment - redirect to Stripe Checkout
  const handlePayment = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const workspaceName = siteName || detectedInfo?.name || "Mon Workspace";
      const formattedUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
      const slug = generateSlug(workspaceName);

      // Call stripe-checkout edge function with onboarding data
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          plan_type: planType === "full" ? "full_company" : "department",
          departments: planType === "alacarte" ? selectedServices : [],
          use_trial: useTrial,
          // Pass onboarding data to be stored in metadata
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
      if (!data?.url) throw new Error("Impossible de créer la session de paiement");

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création du paiement");
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
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg gradient-bg">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">Growth OS</span>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto w-full px-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Configuration</span>
          <span className="text-sm font-medium">{getProgress()}%</span>
        </div>
        <Progress value={getProgress()} className="h-2" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-6 pb-12">
        <div className="w-full max-w-2xl">
          
          {/* Step 1: URL */}
          {step === "url" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Quel est votre site ?</CardTitle>
                <CardDescription className="text-base">
                  Entrez l'URL de votre site web.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-base">URL du site</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="exemple.com"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    onBlur={() => setUrlTouched(true)}
                    className="h-12 text-lg"
                    autoFocus
                  />
                  {urlTouched && siteUrl && !isValidUrl(siteUrl) && (
                    <p className="text-sm text-destructive">Veuillez entrer une URL valide</p>
                  )}
                </div>

                {detectedInfo && (
                  <div className="p-4 rounded-lg bg-chart-3/10 border border-chart-3/30 space-y-3">
                    <div className="flex items-center gap-2 text-chart-3">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">Détection automatique</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Nom :</span>
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
                  Continuer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {workspaces.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    Vous avez déjà {workspaces.length} workspace(s).{" "}
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="text-primary hover:underline"
                    >
                      Aller au dashboard
                    </button>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Plan Selection */}
          {step === "plan" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Choisissez votre formule</CardTitle>
                <CardDescription className="text-base">
                  Tous les plans incluent <strong>14 jours d'essai gratuit</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {/* Starter */}
                  <button
                    onClick={() => setPlanType("starter")}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                      planType === "starter"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="p-3 rounded-lg bg-chart-3/20">
                      <Gift className="w-6 h-6 text-chart-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">Starter</span>
                        <Badge variant="outline" className="text-chart-3 border-chart-3">14 jours gratuits</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        1 département • 50 exécutions/mois • Idéal pour débuter
                      </p>
                      <p className="text-lg font-bold mt-2">{PRICING.starter.toLocaleString()} €<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
                    </div>
                    {planType === "starter" && (
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    )}
                  </button>

                  {/* Full Company */}
                  <button
                    onClick={() => setPlanType("full")}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                      planType === "full"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-accent">
                      <Crown className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">Full Company</span>
                        <Badge variant="gradient">Recommandé</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tous les départements activés. L'entreprise digitale complète.
                      </p>
                      <p className="text-lg font-bold mt-2">{PRICING.full.toLocaleString()} €<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
                    </div>
                    {planType === "full" && (
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    )}
                  </button>

                  {/* À la carte */}
                  <button
                    onClick={() => setPlanType("alacarte")}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                      planType === "alacarte"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="p-3 rounded-lg bg-secondary">
                      <Puzzle className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-lg">À la carte</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choisissez uniquement les départements dont vous avez besoin.
                      </p>
                      <p className="text-lg font-bold mt-2">{PRICING.department.toLocaleString()} €<span className="text-sm font-normal text-muted-foreground">/dépt/mois</span></p>
                    </div>
                    {planType === "alacarte" && (
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    )}
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("url")} className="flex-1 h-12">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button onClick={handlePlanNext} className="flex-1 h-12">
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Service Selection (only for à la carte) */}
          {step === "services" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Puzzle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Choisissez vos services</CardTitle>
                <CardDescription className="text-base">
                  Activez les départements dont vous avez besoin
                </CardDescription>
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
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
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
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button onClick={handleServicesNext} className="flex-1 h-12" disabled={selectedServices.length === 0}>
                    Continuer ({selectedServices.length} sélectionné{selectedServices.length > 1 ? "s" : ""})
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Objectives */}
          {step === "objectives" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Quels sont vos objectifs ?</CardTitle>
                <CardDescription className="text-base">
                  Sélectionnez vos priorités (optionnel)
                </CardDescription>
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
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button onClick={handleObjectivesNext} className="flex-1 h-12">
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Payment */}
          {step === "payment" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Récapitulatif & Paiement</CardTitle>
                <CardDescription className="text-base">
                  Vérifiez votre commande et finalisez l'activation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order summary */}
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
                          <span>Full Company</span>
                        </div>
                        <span className="font-bold">{PRICING.full.toLocaleString()} €/mois</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          {selectedServices.length} département{selectedServices.length > 1 ? "s" : ""} sélectionné{selectedServices.length > 1 ? "s" : ""} :
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
                    <span>Total mensuel</span>
                    <span className="text-primary">{getTotalPrice().toLocaleString()} €/mois</span>
                  </div>
                </div>

                {/* Trial option */}
                <button
                  onClick={() => setUseTrial(!useTrial)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all ${
                    useTrial
                      ? "border-chart-3 bg-chart-3/10"
                      : "border-border hover:border-chart-3/50"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${useTrial ? "bg-chart-3/20" : "bg-muted"}`}>
                    <Gift className={`w-5 h-5 ${useTrial ? "text-chart-3" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Essai gratuit 14 jours</span>
                      {useTrial && <Badge variant="secondary" className="bg-chart-3/20 text-chart-3">Activé</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Testez toutes les fonctionnalités sans engagement. Annulez à tout moment.
                    </p>
                  </div>
                  {useTrial && <CheckCircle2 className="w-5 h-5 text-chart-3 flex-shrink-0" />}
                </button>

                {/* Payment buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("objectives")} className="flex-1 h-12">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button 
                    onClick={handlePayment} 
                    className="flex-1 h-12" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirection...
                      </>
                    ) : useTrial ? (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Démarrer l'essai gratuit
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payer et activer
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Paiement sécurisé par Stripe. {useTrial ? "Vous ne serez pas débité avant la fin de l'essai." : "Facturé mensuellement."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Summary */}
          {step === "summary" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-chart-3/20 w-fit mb-4">
                  <CheckCircle2 className="w-8 h-8 text-chart-3" />
                </div>
                <CardTitle className="text-2xl">Parfait !</CardTitle>
                <CardDescription className="text-base">
                  Votre workspace est en cours de création...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <Badge variant="gradient" className="text-sm">
                  {planType === "full" ? "Full Company" : `${selectedServices.length} services activés`}
                </Badge>
                <p className="text-muted-foreground">Redirection vers votre tableau de bord...</p>
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
