import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Search, 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  Lock,
  FileText,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

// OAuth Client Configuration - À remplacer par vos vraies valeurs
const OAUTH_CONFIG = {
  appName: "Growth OS",
  companyName: "EmotionsCare Sasu",
  clientId: "VOTRE_CLIENT_ID.apps.googleusercontent.com", // Remplacez par votre vrai Client ID
  redirectUri: "https://goiklfzouhshghsvpxjo.supabase.co/functions/v1/oauth-callback",
  privacyUrl: "https://agent-growth-automator.lovable.app/privacy",
  termsUrl: "https://agent-growth-automator.lovable.app/terms",
};

const SCOPES = [
  {
    name: "Google Analytics Data API",
    scope: "analytics.readonly",
    icon: BarChart3,
    sensitivity: "Sensible",
    usage: "Lecture seule des données Analytics (trafic, comportement utilisateur, conversions) pour générer des rapports de performance automatisés.",
    dataAccessed: ["Sessions", "Pages vues", "Taux de rebond", "Conversions", "Sources de trafic"],
    features: ["Tableaux de bord KPI", "Rapports hebdomadaires", "Alertes de performance"],
  },
  {
    name: "Search Console API",
    scope: "webmasters.readonly",
    icon: Search,
    sensitivity: "Sensible",
    usage: "Lecture seule des données SEO (positions, clics, impressions) pour optimiser le référencement naturel.",
    dataAccessed: ["Requêtes de recherche", "Positions moyennes", "CTR", "Impressions", "Pages indexées"],
    features: ["Suivi des positions", "Analyse des mots-clés", "Détection des opportunités SEO"],
  },
];

const DEMO_STEPS = [
  {
    step: 1,
    title: "L'utilisateur accède à la page Intégrations",
    description: "Depuis le tableau de bord, l'utilisateur navigue vers la section Intégrations pour connecter ses comptes Google.",
  },
  {
    step: 2,
    title: "Clic sur 'Autoriser l'accès' Google",
    description: "L'utilisateur clique sur le bouton pour initier le flux OAuth avec Google.",
  },
  {
    step: 3,
    title: "Écran de consentement Google",
    description: "Google affiche l'écran de consentement montrant les permissions demandées (Analytics + Search Console en lecture seule).",
  },
  {
    step: 4,
    title: "Autorisation par l'utilisateur",
    description: "L'utilisateur accepte les permissions. Les tokens sont stockés de manière sécurisée (chiffrement AES-256).",
  },
  {
    step: 5,
    title: "Synchronisation des données",
    description: "Les données sont synchronisées et affichées dans les tableaux de bord de l'application.",
  },
];

export default function DemoOAuth() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with App Identity */}
      <header className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{OAUTH_CONFIG.appName}</h1>
              <p className="text-muted-foreground">par {OAUTH_CONFIG.companyName}</p>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Informations OAuth Client
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nom de l'application</p>
                <p className="font-mono font-semibold">{OAUTH_CONFIG.appName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Client ID OAuth</p>
                <p className="font-mono text-xs break-all bg-muted p-2 rounded">{OAUTH_CONFIG.clientId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">URI de redirection</p>
                <p className="font-mono text-xs break-all bg-muted p-2 rounded">{OAUTH_CONFIG.redirectUri}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pages légales</p>
                <div className="flex gap-2 mt-1">
                  <a href={OAUTH_CONFIG.privacyUrl} target="_blank" rel="noopener" className="text-primary hover:underline">
                    Politique de confidentialité
                  </a>
                  <span>•</span>
                  <a href={OAUTH_CONFIG.termsUrl} target="_blank" rel="noopener" className="text-primary hover:underline">
                    CGU
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Section 1: Scopes demandés */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            Niveaux d'accès (Scopes) demandés
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {SCOPES.map((scope) => {
              const Icon = scope.icon;
              return (
                <Card key={scope.scope} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{scope.name}</CardTitle>
                          <code className="text-xs text-muted-foreground">{scope.scope}</code>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                        {scope.sensitivity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Utilisation dans l'application
                      </h4>
                      <p className="text-sm text-muted-foreground">{scope.usage}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Données accédées (lecture seule)</h4>
                      <div className="flex flex-wrap gap-1">
                        {scope.dataAccessed.map((data) => (
                          <Badge key={data} variant="secondary" className="text-xs">
                            {data}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Fonctionnalités activées</h4>
                      <ul className="space-y-1">
                        {scope.features.map((feature) => (
                          <li key={feature} className="text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Section 2: Flux OAuth */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Processus d'authentification OAuth
          </h2>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {DEMO_STEPS.map((step, index) => (
                  <div 
                    key={step.step}
                    className={`flex gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
                      currentStep === index ? "bg-primary/10 border-2 border-primary" : "bg-muted/50 hover:bg-muted"
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep === index ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
                    }`}>
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {index < DEMO_STEPS.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-muted-foreground self-center" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Sécurité */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Mesures de sécurité
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-500" />
                  Chiffrement AES-256
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tous les tokens OAuth sont chiffrés avec AES-GCM 256 bits avant stockage en base de données.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Accès en lecture seule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nous demandons uniquement des scopes "readonly". Aucune modification de vos données Google.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  Conformité RGPD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Export et suppression des données sur demande. Politique de confidentialité transparente.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 4: Démonstration des fonctionnalités */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Utilisation des données dans l'application
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Tableau de bord Analytics
                </CardTitle>
                <CardDescription>
                  Données Google Analytics affichées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Sessions (7j)</span>
                    <span className="font-semibold">12,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Taux de rebond</span>
                    <span className="font-semibold">42.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Conversions</span>
                    <span className="font-semibold">234</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Ces données sont récupérées via l'API Analytics en lecture seule pour afficher les KPIs.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-500" />
                  Tableau de bord SEO
                </CardTitle>
                <CardDescription>
                  Données Search Console affichées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Clics (7j)</span>
                    <span className="font-semibold">8,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Impressions</span>
                    <span className="font-semibold">156,789</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Position moyenne</span>
                    <span className="font-semibold">12.4</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Ces données sont récupérées via l'API Search Console pour le suivi des positions SEO.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-muted-foreground">
          <p>© 2025 {OAUTH_CONFIG.companyName} - {OAUTH_CONFIG.appName}</p>
          <p className="mt-2">
            Contact : m.laeticia@hotmail.fr | 
            <a href={OAUTH_CONFIG.privacyUrl} className="text-primary hover:underline ml-2">Confidentialité</a> | 
            <a href={OAUTH_CONFIG.termsUrl} className="text-primary hover:underline ml-2">CGU</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
