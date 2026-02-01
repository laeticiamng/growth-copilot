import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Globe, Target, Rocket, CheckCircle2, ArrowRight, Sparkles, Building2 } from "lucide-react";
import { toast } from "sonner";

// Step types
type OnboardingStep = "url" | "objectives" | "summary";

// Objectives options
const OBJECTIVES = [
  { id: "traffic", label: "Augmenter le trafic organique", icon: "📈" },
  { id: "leads", label: "Générer des leads qualifiés", icon: "🎯" },
  { id: "brand", label: "Développer la notoriété", icon: "⭐" },
  { id: "local", label: "Dominer le marché local", icon: "📍" },
  { id: "ecommerce", label: "Booster les ventes e-commerce", icon: "🛒" },
  { id: "content", label: "Créer du contenu de qualité", icon: "✍️" },
];

// URL validation regex
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.includes(".");
  } catch {
    return false;
  }
};

// Extract domain name from URL
const extractDomainName = (url: string): string => {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    // Remove www. and TLD
    const hostname = parsed.hostname.replace(/^www\./, "");
    const parts = hostname.split(".");
    // Take the main part before TLD
    const main = parts.length > 1 ? parts[parts.length - 2] : parts[0];
    // Capitalize first letter
    return main.charAt(0).toUpperCase() + main.slice(1);
  } catch {
    return "";
  }
};

// Generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
};

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const { createWorkspace, workspaces, refetch: refetchWorkspaces } = useWorkspace();
  const { createSite } = useSites();
  const navigate = useNavigate();

  // Form state
  const [step, setStep] = useState<OnboardingStep>("url");
  const [siteUrl, setSiteUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlTouched, setUrlTouched] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<{
    name: string;
    cms?: string;
    language?: string;
  } | null>(null);

  // Auto-detect info from URL
  useEffect(() => {
    if (isValidUrl(siteUrl) && siteUrl.length > 5) {
      const name = extractDomainName(siteUrl);
      setDetectedInfo({ name, cms: undefined, language: "fr" });
      if (!siteName) {
        setSiteName(name);
      }
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
  const progress = step === "url" ? 33 : step === "objectives" ? 66 : 100;

  // Toggle objective
  const toggleObjective = (id: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  // Handle URL step completion
  const handleUrlNext = () => {
    if (!isValidUrl(siteUrl)) {
      toast.error("Veuillez entrer une URL valide");
      return;
    }
    setStep("objectives");
  };

  // Handle final submission
  const handleComplete = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Use detected name or entered name
      const workspaceName = siteName || detectedInfo?.name || "Mon Workspace";
      const slug = generateSlug(workspaceName);
      
      // Format URL
      const formattedUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;

      // Step 1: Create workspace
      const { error: wsError, workspace } = await createWorkspace(workspaceName, slug);
      if (wsError || !workspace) {
        throw new Error(wsError?.message || "Échec de la création du workspace");
      }

      // Refresh workspaces to get the new one
      await refetchWorkspaces();

      // Step 2: Create site linked to workspace
      const { error: siteError } = await createSite({
        url: formattedUrl,
        name: workspaceName,
        language: detectedInfo?.language || "fr",
        objectives: selectedObjectives,
        cms_type: detectedInfo?.cms,
      });

      if (siteError) {
        console.error("Site creation error:", siteError);
        // Continue anyway - workspace was created
      }

      toast.success(`${workspaceName} créé avec succès !`);
      setStep("summary");

      // Navigate after a short delay to show summary
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
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
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
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
                  Entrez l'URL de votre site web. Nous détecterons automatiquement les informations clés.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-base">URL du site</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="exemple.com ou https://exemple.com"
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

                {/* Auto-detected info */}
                {detectedInfo && (
                  <div className="p-4 rounded-lg bg-chart-3/10 border border-chart-3/30 space-y-3">
                    <div className="flex items-center gap-2 text-chart-3">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">Informations détectées</span>
                    </div>
                    <div className="space-y-2">
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

          {/* Step 2: Objectives */}
          {step === "objectives" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Quels sont vos objectifs ?</CardTitle>
                <CardDescription className="text-base">
                  Sélectionnez vos priorités. Nos agents IA adapteront leurs recommandations.
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
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
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
                    onClick={() => setStep("url")} 
                    className="flex-1 h-12"
                  >
                    Retour
                  </Button>
                  <Button 
                    onClick={handleComplete} 
                    className="flex-1 h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        Lancer Growth OS
                        <Rocket className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Summary */}
          {step === "summary" && (
            <Card variant="gradient" className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto p-3 rounded-full bg-chart-3/20 w-fit mb-4">
                  <CheckCircle2 className="w-8 h-8 text-chart-3" />
                </div>
                <CardTitle className="text-2xl">Parfait !</CardTitle>
                <CardDescription className="text-base">
                  Votre espace <span className="font-semibold text-foreground">{siteName || detectedInfo?.name}</span> est prêt.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedObjectives.map((objId) => {
                    const obj = OBJECTIVES.find((o) => o.id === objId);
                    return obj ? (
                      <Badge key={objId} variant="secondary">
                        {obj.icon} {obj.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
                <p className="text-muted-foreground">
                  Redirection vers votre tableau de bord...
                </p>
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
