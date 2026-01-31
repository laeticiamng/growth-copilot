import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  ArrowLeft, 
  Globe, 
  Link as LinkIcon,
  Key,
  Target,
  Check,
  Loader2,
  MapPin,
  Building,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const steps = [
  { id: 1, title: "Ton site", icon: Globe },
  { id: 2, title: "Connexions", icon: LinkIcon },
  { id: 3, title: "Accès CMS", icon: Key },
  { id: 4, title: "Objectifs", icon: Target },
];

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get("url") || "";
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    url: initialUrl,
    sector: "",
    location: "",
    language: "fr",
    gsc: false,
    ga4: false,
    gads: false,
    gbp: false,
    meta: false,
    cmsType: "",
    goals: [] as string[],
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / 4) * 100;

  const sectors = [
    "E-commerce", "SaaS / Tech", "Agence / Services", "Restaurant / Local",
    "Immobilier", "Santé", "Formation", "Autre"
  ];

  const goals = [
    "Plus de trafic SEO", "Plus de leads", "Plus de ventes",
    "Meilleure visibilité locale", "Optimiser mes Ads", "Améliorer mes conversions"
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${currentStep >= step.id 
                    ? "gradient-bg text-primary-foreground" 
                    : "bg-secondary text-muted-foreground"
                  }
                `}>
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {step.id < 4 && (
                  <div className={`
                    hidden sm:block w-16 h-0.5 mx-2 transition-all
                    ${currentStep > step.id ? "bg-primary" : "bg-border"}
                  `} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Card */}
        <Card variant="elevated" className="overflow-hidden">
          <CardHeader className="text-center pb-2">
            <Badge variant="agent" className="mx-auto mb-2">
              Étape {currentStep} sur 4
            </Badge>
            <CardTitle className="text-2xl">
              {currentStep === 1 && "Parle-nous de ton site"}
              {currentStep === 2 && "Connecte tes outils"}
              {currentStep === 3 && "Accès à ton CMS"}
              {currentStep === 4 && "Tes objectifs"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "On a besoin de quelques infos pour personnaliser ton audit."}
              {currentStep === 2 && "Plus tu connectes d'outils, plus on peut optimiser."}
              {currentStep === 3 && "Pour appliquer les corrections automatiquement (optionnel)."}
              {currentStep === 4 && "Qu'est-ce qui compte le plus pour toi ?"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Step 1: Site Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">URL de ton site</label>
                  <input
                    type="url"
                    placeholder="https://tonsite.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Secteur d'activité</label>
                  <div className="grid grid-cols-2 gap-2">
                    {sectors.map((sector) => (
                      <button
                        key={sector}
                        onClick={() => setFormData({ ...formData, sector })}
                        className={`
                          p-3 rounded-lg border text-sm text-left transition-all
                          ${formData.sector === sector 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-border hover:border-primary/50"
                          }
                        `}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Zone géographique
                    </label>
                    <input
                      type="text"
                      placeholder="France, Paris..."
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Building className="w-4 h-4" /> Langue
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="fr">Français</option>
                      <option value="en">Anglais</option>
                      <option value="es">Espagnol</option>
                      <option value="de">Allemand</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Integrations */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {[
                  { key: "gsc", name: "Google Search Console", desc: "Données SEO officielles", recommended: true },
                  { key: "ga4", name: "Google Analytics 4", desc: "Tracking et conversions", recommended: true },
                  { key: "gads", name: "Google Ads", desc: "Campagnes publicitaires", recommended: false },
                  { key: "gbp", name: "Google Business Profile", desc: "Fiche locale et avis", recommended: false },
                  { key: "meta", name: "Meta (Facebook/Instagram)", desc: "Social et publicités", recommended: false },
                ].map((integration) => (
                  <button
                    key={integration.key}
                    onClick={() => setFormData({ 
                      ...formData, 
                      [integration.key]: !formData[integration.key as keyof typeof formData] 
                    })}
                    className={`
                      w-full p-4 rounded-lg border text-left transition-all flex items-center justify-between
                      ${formData[integration.key as keyof typeof formData]
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                      }
                    `}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{integration.name}</span>
                        {integration.recommended && (
                          <Badge variant="success" className="text-xs">Recommandé</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{integration.desc}</p>
                    </div>
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${formData[integration.key as keyof typeof formData]
                        ? "border-primary bg-primary text-primary-foreground" 
                        : "border-border"
                      }
                    `}>
                      {formData[integration.key as keyof typeof formData] && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
                <p className="text-sm text-muted-foreground text-center pt-4">
                  Connexion OAuth sécurisée. Tes données restent les tiennes.
                </p>
              </div>
            )}

            {/* Step 3: CMS Access */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {[
                  { key: "wordpress", name: "WordPress", desc: "Corrections SEO automatiques" },
                  { key: "shopify", name: "Shopify", desc: "Optimisation e-commerce" },
                  { key: "webflow", name: "Webflow", desc: "Modifications design" },
                  { key: "none", name: "Pas de CMS connecté", desc: "Mode instructions & patchs" },
                ].map((cms) => (
                  <button
                    key={cms.key}
                    onClick={() => setFormData({ ...formData, cmsType: cms.key })}
                    className={`
                      w-full p-4 rounded-lg border text-left transition-all flex items-center justify-between
                      ${formData.cmsType === cms.key
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                      }
                    `}
                  >
                    <div>
                      <span className="font-medium">{cms.name}</span>
                      <p className="text-sm text-muted-foreground">{cms.desc}</p>
                    </div>
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${formData.cmsType === cms.key
                        ? "border-primary bg-primary text-primary-foreground" 
                        : "border-border"
                      }
                    `}>
                      {formData.cmsType === cms.key && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Goals */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {goals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => {
                        const newGoals = formData.goals.includes(goal)
                          ? formData.goals.filter((g) => g !== goal)
                          : [...formData.goals, goal];
                        setFormData({ ...formData, goals: newGoals });
                      }}
                      className={`
                        p-4 rounded-lg border text-left transition-all
                        ${formData.goals.includes(goal)
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-border hover:border-primary/50"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                          ${formData.goals.includes(goal)
                            ? "border-primary bg-primary text-primary-foreground" 
                            : "border-border"
                          }
                        `}>
                          {formData.goals.includes(goal) && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-sm font-medium">{goal}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center pt-4">
                  Sélectionne un ou plusieurs objectifs prioritaires.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              {currentStep > 1 ? (
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              ) : (
                <Link to="/">
                  <Button variant="ghost">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Accueil
                  </Button>
                </Link>
              )}
              
              <Button 
                variant="gradient" 
                onClick={handleNext}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : currentStep === 4 ? (
                  <>
                    Lancer l'audit
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
