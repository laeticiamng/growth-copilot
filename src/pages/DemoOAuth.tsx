import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Play,
  MousePointer,
  LogIn,
  Database,
  LineChart,
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
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    shortScope: "analytics.readonly",
    icon: BarChart3,
    sensitivity: "Sensible (Sensitive)",
    usage: "Lecture seule des métriques de trafic et conversions pour générer des rapports automatisés.",
    usageEn: "Read-only access to traffic and conversion metrics for automated reporting.",
    justification: "Nécessaire pour afficher les KPIs de performance (sessions, taux de rebond, conversions) dans le tableau de bord. Sans cet accès, l'utilisateur ne pourrait pas visualiser ses données Analytics dans l'application.",
    justificationEn: "Required to display performance KPIs (sessions, bounce rate, conversions) in the dashboard. Without this access, users cannot view their Analytics data in the application.",
    dataAccessed: [
      "Sessions", 
      "Pages vues (Page views)", 
      "Taux de rebond (Bounce rate)", 
      "Conversions", 
      "Sources de trafic (Traffic sources)"
    ],
    features: [
      "Tableaux de bord KPI (KPI Dashboards)",
      "Rapports hebdomadaires (Weekly Reports)", 
      "Alertes de performance (Performance Alerts)"
    ],
  },
  {
    name: "Search Console API",
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    shortScope: "webmasters.readonly",
    icon: Search,
    sensitivity: "Sensible (Sensitive)",
    usage: "Lecture seule des données SEO pour optimiser le référencement naturel.",
    usageEn: "Read-only SEO data to optimize organic search rankings.",
    justification: "Nécessaire pour récupérer les positions de recherche, les requêtes et le CTR. Ces données permettent d'identifier les opportunités d'amélioration SEO et de suivre la visibilité organique du site.",
    justificationEn: "Required to retrieve search positions, queries, and CTR. This data helps identify SEO improvement opportunities and track the site's organic visibility.",
    dataAccessed: [
      "Requêtes de recherche (Search queries)", 
      "Positions moyennes (Average positions)", 
      "CTR", 
      "Impressions", 
      "Pages indexées (Indexed pages)"
    ],
    features: [
      "Suivi des positions (Rank tracking)",
      "Analyse des mots-clés (Keyword analysis)", 
      "Détection des opportunités SEO (SEO opportunity detection)"
    ],
  },
];

// Scopes that we DO NOT request
const NOT_REQUESTED_SCOPES = [
  { scope: "bigquery", reason: "Non utilisé - Growth OS n'accède pas à BigQuery (Not used - Growth OS does not access BigQuery)" },
  { scope: "cloud-platform", reason: "Non utilisé - Aucune ressource Cloud Platform nécessaire (Not used - No Cloud Platform resources needed)" },
  { scope: "devstorage", reason: "Non utilisé - Pas d'accès au Cloud Storage (Not used - No Cloud Storage access)" },
];

const DEMO_STEPS = [
  {
    step: 1,
    title: "Accès à la page Intégrations",
    titleEn: "Access to Integrations page",
    description: "L'utilisateur connecté navigue vers la section Intégrations depuis le menu principal.",
    descriptionEn: "The logged-in user navigates to the Integrations section from the main menu.",
    icon: MousePointer,
  },
  {
    step: 2,
    title: "Clic sur 'Autoriser l'accès Google'",
    titleEn: "Click on 'Authorize Google Access'",
    description: "L'utilisateur clique sur le bouton pour initier le flux OAuth avec Google.",
    descriptionEn: "User clicks the button to initiate the OAuth flow with Google.",
    icon: Play,
  },
  {
    step: 3,
    title: "Écran de consentement Google",
    titleEn: "Google Consent Screen",
    description: "Google affiche les permissions demandées : Analytics et Search Console en lecture seule.",
    descriptionEn: "Google displays the requested permissions: Analytics and Search Console read-only access.",
    icon: LogIn,
  },
  {
    step: 4,
    title: "Autorisation par l'utilisateur",
    titleEn: "User Authorization",
    description: "L'utilisateur accepte. Les tokens sont chiffrés (AES-256) et stockés de manière sécurisée.",
    descriptionEn: "User accepts. Tokens are encrypted (AES-256) and stored securely.",
    icon: Lock,
  },
  {
    step: 5,
    title: "Synchronisation et affichage des données",
    titleEn: "Data Sync and Display",
    description: "Les données sont synchronisées et affichées dans les tableaux de bord de l'application.",
    descriptionEn: "Data is synced and displayed in the application dashboards.",
    icon: Database,
  },
];

export default function DemoOAuth() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Application Identity */}
      <header className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-6 py-8">
          {/* Step indicator */}
          <div className="mb-6 p-3 bg-primary text-primary-foreground rounded-lg text-center">
            <p className="text-lg font-bold">
              📹 ÉTAPE 1/4 : IDENTITÉ DE L'APPLICATION (Step 1/4: Application Identity)
            </p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{OAUTH_CONFIG.appName}</h1>
              <p className="text-muted-foreground">par (by) {OAUTH_CONFIG.companyName}</p>
            </div>
          </div>
          
          <Card className="border-2 border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Informations du Client OAuth (OAuth Client Information)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs mb-1">Nom de l'application (Application Name)</p>
                  <p className="font-bold text-lg">{OAUTH_CONFIG.appName}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs mb-1">Société (Company)</p>
                  <p className="font-bold">{OAUTH_CONFIG.companyName}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg md:col-span-2">
                  <p className="text-muted-foreground text-xs mb-1">Client ID OAuth</p>
                  <p className="font-mono text-sm break-all bg-background p-2 rounded border">{OAUTH_CONFIG.clientId}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs mb-1">URI de redirection (Redirect URI)</p>
                  <p className="font-mono text-xs break-all">{OAUTH_CONFIG.redirectUri}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs mb-1">Pages légales (Legal Pages)</p>
                  <div className="flex gap-4 mt-1">
                    <a href={OAUTH_CONFIG.privacyUrl} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">
                      🔒 Confidentialité (Privacy)
                    </a>
                    <a href={OAUTH_CONFIG.termsUrl} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">
                      📄 CGU (Terms)
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-10">
        {/* Section 2: Scopes demandés */}
        <section>
          <div className="mb-6 p-3 bg-primary text-primary-foreground rounded-lg text-center">
            <p className="text-lg font-bold">
              📹 ÉTAPE 2/4 : NIVEAUX D'ACCÈS DEMANDÉS (Step 2/4: Requested Access Levels)
            </p>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            Scopes OAuth demandés (Requested OAuth Scopes)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {SCOPES.map((scope) => {
              const Icon = scope.icon;
              return (
                <Card key={scope.scope} className="border-2 border-primary/50">
                  <CardHeader className="bg-primary/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{scope.name}</CardTitle>
                          <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{scope.scope}</code>
                        </div>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/50">
                        {scope.sensitivity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {/* Justification détaillée */}
                    <div className="p-3 bg-primary/10 rounded-lg border-2 border-primary/30">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        ✅ Justification détaillée (Detailed Justification)
                      </h4>
                      <p className="text-sm font-medium">{scope.justification}</p>
                      <p className="text-xs text-muted-foreground italic mt-1">({scope.justificationEn})</p>
                    </div>
                    
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" />
                        Utilisation (Usage)
                      </h4>
                      <p className="text-sm">{scope.usage}</p>
                      <p className="text-xs text-muted-foreground italic">({scope.usageEn})</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        📊 Données accédées - LECTURE SEULE (Data Accessed - READ ONLY)
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {scope.dataAccessed.map((data) => (
                          <Badge key={data} variant="secondary" className="text-xs">
                            {data}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        ⚡ Fonctionnalités activées (Enabled Features)
                      </h4>
                      <ul className="space-y-1">
                        {scope.features.map((feature) => (
                          <li key={feature} className="text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
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
          
          <Card className="mt-6 border-2 border-primary bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-center font-semibold text-lg">
                ⚠️ AUCUNE MODIFICATION DE DONNÉES - LECTURE SEULE UNIQUEMENT ⚠️
              </p>
              <p className="text-center text-muted-foreground">
                (NO DATA MODIFICATION - READ-ONLY ACCESS ONLY)
              </p>
            </CardContent>
          </Card>

          {/* Scopes NON demandés - Clarification importante */}
          <Card className="mt-6 border-2 border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="w-5 h-5" />
                ❌ Scopes NON demandés par Growth OS (Scopes NOT requested by Growth OS)
              </CardTitle>
              <CardDescription>
                Notre application n'utilise PAS et ne demande PAS les scopes suivants :
                <br />
                <span className="italic">(Our application does NOT use and does NOT request the following scopes:)</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {NOT_REQUESTED_SCOPES.map((item) => (
                  <div key={item.scope} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                    <Badge variant="destructive" className="text-xs">❌</Badge>
                    <div>
                      <code className="text-sm font-mono">{item.scope}</code>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                <p className="text-sm font-medium text-center">
                  ⚠️ Si ces scopes apparaissent dans l'écran de consentement Google, c'est une erreur de configuration dans la Google Cloud Console qui doit être corrigée.
                </p>
                <p className="text-xs text-muted-foreground text-center italic mt-1">
                  (If these scopes appear in the Google consent screen, it's a configuration error in the Google Cloud Console that must be fixed.)
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Flux OAuth */}
        <section>
          <div className="mb-6 p-3 bg-primary text-primary-foreground rounded-lg text-center">
            <p className="text-lg font-bold">
              📹 ÉTAPE 3/4 : PROCESSUS D'AUTHENTIFICATION (Step 3/4: Authentication Process)
            </p>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Flux OAuth utilisateur (User OAuth Flow)
          </h2>
          
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {DEMO_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div 
                      key={step.step}
                      className={`flex gap-4 p-4 rounded-lg transition-colors cursor-pointer border-2 ${
                        currentStep === index 
                          ? "bg-primary/10 border-primary" 
                          : "bg-muted/30 border-transparent hover:bg-muted/50"
                      }`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        currentStep === index 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}>
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-5 h-5 ${currentStep === index ? "text-primary" : "text-muted-foreground"}`} />
                          <h4 className="font-semibold">{step.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">({step.titleEn})</p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        <p className="text-xs text-muted-foreground italic">({step.descriptionEn})</p>
                      </div>
                      {index < DEMO_STEPS.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-muted-foreground self-center" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 4: Utilisation des données */}
        <section>
          <div className="mb-6 p-3 bg-primary text-primary-foreground rounded-lg text-center">
            <p className="text-lg font-bold">
              📹 ÉTAPE 4/4 : UTILISATION DES DONNÉES (Step 4/4: Data Usage)
            </p>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Comment les données sont utilisées (How Data is Used)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-500/50">
              <CardHeader className="bg-blue-500/10">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Tableau de bord Analytics (Analytics Dashboard)
                </CardTitle>
                <CardDescription>
                  Données Google Analytics affichées (Google Analytics data displayed)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">Sessions (7 jours / 7 days)</span>
                    <span className="font-bold text-lg">12,450</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">Taux de rebond (Bounce rate)</span>
                    <span className="font-bold text-lg">42.3%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">Conversions</span>
                    <span className="font-bold text-lg">234</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 p-2 bg-blue-500/10 rounded">
                  📊 Ces données sont récupérées via l'API Analytics pour afficher les KPIs de performance.
                  <br/>
                  <span className="italic">(This data is retrieved via the Analytics API to display performance KPIs.)</span>
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-green-500/50">
              <CardHeader className="bg-green-500/10">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-500" />
                  Tableau de bord SEO (SEO Dashboard)
                </CardTitle>
                <CardDescription>
                  Données Search Console affichées (Search Console data displayed)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">Clics (7 jours / 7 days)</span>
                    <span className="font-bold text-lg">8,234</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">Impressions</span>
                    <span className="font-bold text-lg">156,789</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">Position moyenne (Avg. position)</span>
                    <span className="font-bold text-lg">12.4</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 p-2 bg-green-500/10 rounded">
                  🔍 Ces données sont récupérées via l'API Search Console pour le suivi SEO.
                  <br/>
                  <span className="italic">(This data is retrieved via the Search Console API for SEO tracking.)</span>
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Agents IA */}
          <Card className="mt-6 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary" />
                Agents IA automatisés (Automated AI Agents)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="font-bold">📊 Agent Analytics</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Génère des rapports hebdomadaires automatiques
                    <br/>
                    <span className="italic text-xs">(Generates automatic weekly reports)</span>
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="font-bold">🔍 Agent SEO</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Détecte les opportunités de mots-clés
                    <br/>
                    <span className="italic text-xs">(Detects keyword opportunities)</span>
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="font-bold">🚨 Agent Alertes</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Notifie en cas de chute de trafic
                    <br/>
                    <span className="italic text-xs">(Notifies on traffic drops)</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section Sécurité */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Mesures de sécurité (Security Measures)
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Chiffrement AES-256
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tous les tokens OAuth sont chiffrés avec AES-GCM 256 bits.
                  <br/>
                  <span className="italic text-xs">(All OAuth tokens are encrypted with AES-GCM 256-bit.)</span>
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Lecture seule (Read-only)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Aucune modification des données Google. Scopes "readonly" uniquement.
                  <br/>
                  <span className="italic text-xs">(No Google data modification. Read-only scopes only.)</span>
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Conformité RGPD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Export et suppression des données sur demande.
                  <br/>
                  <span className="italic text-xs">(Data export and deletion on request. GDPR compliant.)</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t">
          <div className="p-4 bg-muted rounded-lg inline-block">
            <p className="font-bold text-lg">© 2025 {OAUTH_CONFIG.companyName}</p>
            <p className="text-muted-foreground">{OAUTH_CONFIG.appName}</p>
            <p className="text-sm mt-2">
              📧 Contact : m.laeticia@hotmail.fr
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <a href={OAUTH_CONFIG.privacyUrl} className="text-primary hover:underline text-sm">
                🔒 Politique de confidentialité (Privacy Policy)
              </a>
              <a href={OAUTH_CONFIG.termsUrl} className="text-primary hover:underline text-sm">
                📄 CGU (Terms of Service)
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
