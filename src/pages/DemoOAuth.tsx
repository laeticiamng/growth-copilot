import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  privacyUrl: "https://www.agent-growth-automator.com/privacy",
  termsUrl: "https://www.agent-growth-automator.com/terms",
};

export default function DemoOAuth() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const SCOPES = useMemo(() => [
    {
      name: t("demoOAuth.scope1Name"),
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      shortScope: "analytics.readonly",
      icon: BarChart3,
      sensitivity: t("demoOAuth.sensitivitySensitive"),
      usage: t("demoOAuth.scope1Usage"),
      justification: t("demoOAuth.scope1Justification"),
      dataAccessed: [
        t("demoOAuth.scope1Data1"),
        t("demoOAuth.scope1Data2"),
        t("demoOAuth.scope1Data3"),
        t("demoOAuth.scope1Data4"),
        t("demoOAuth.scope1Data5"),
      ],
      features: [
        t("demoOAuth.scope1Feature1"),
        t("demoOAuth.scope1Feature2"),
        t("demoOAuth.scope1Feature3"),
      ],
    },
    {
      name: t("demoOAuth.scope2Name"),
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      shortScope: "webmasters.readonly",
      icon: Search,
      sensitivity: t("demoOAuth.sensitivitySensitive"),
      usage: t("demoOAuth.scope2Usage"),
      justification: t("demoOAuth.scope2Justification"),
      dataAccessed: [
        t("demoOAuth.scope2Data1"),
        t("demoOAuth.scope2Data2"),
        t("demoOAuth.scope2Data3"),
        t("demoOAuth.scope2Data4"),
        t("demoOAuth.scope2Data5"),
      ],
      features: [
        t("demoOAuth.scope2Feature1"),
        t("demoOAuth.scope2Feature2"),
        t("demoOAuth.scope2Feature3"),
      ],
    },
  ], [t]);

  // Scopes that we DO NOT request
  const NOT_REQUESTED_SCOPES = useMemo(() => [
    { scope: "bigquery", reason: t("demoOAuth.notRequestedBigquery") },
    { scope: "cloud-platform", reason: t("demoOAuth.notRequestedCloudPlatform") },
    { scope: "devstorage", reason: t("demoOAuth.notRequestedDevstorage") },
  ], [t]);

  const DEMO_STEPS = useMemo(() => [
    {
      step: 1,
      title: t("demoOAuth.step1Title"),
      description: t("demoOAuth.step1Desc"),
      icon: MousePointer,
    },
    {
      step: 2,
      title: t("demoOAuth.step2Title"),
      description: t("demoOAuth.step2Desc"),
      icon: Play,
    },
    {
      step: 3,
      title: t("demoOAuth.step3Title"),
      description: t("demoOAuth.step3Desc"),
      icon: LogIn,
    },
    {
      step: 4,
      title: t("demoOAuth.step4Title"),
      description: t("demoOAuth.step4Desc"),
      icon: Lock,
    },
    {
      step: 5,
      title: t("demoOAuth.step5Title"),
      description: t("demoOAuth.step5Desc"),
      icon: Database,
    },
  ], [t]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Application Identity */}
      <header className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-6 py-8">
          {/* Step indicator */}
          <div className="mb-6 p-3 bg-primary text-primary-foreground rounded-lg text-center">
            <p className="text-lg font-bold">
              {t("demoOAuth.stepIndicator1")}
            </p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{OAUTH_CONFIG.appName}</h1>
              <p className="text-muted-foreground">{t("demoOAuth.byCompany", { company: OAUTH_CONFIG.companyName })}</p>
            </div>
          </div>

          <Card className="border-2 border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {t("demoOAuth.oauthClientInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs mb-1">{t("demoOAuth.applicationName")}</p>
                  <p className="font-bold text-lg">{OAUTH_CONFIG.appName}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs mb-1">{t("demoOAuth.company")}</p>
                  <p className="font-bold">{OAUTH_CONFIG.companyName}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg md:col-span-2">
                  <p className="text-muted-foreground text-xs mb-1">{t("demoOAuth.clientIdLabel")}</p>
                  <p className="font-mono text-sm break-all bg-background p-2 rounded border">{OAUTH_CONFIG.clientId}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs mb-1">{t("demoOAuth.redirectUri")}</p>
                  <p className="font-mono text-xs break-all">{OAUTH_CONFIG.redirectUri}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs mb-1">{t("demoOAuth.legalPages")}</p>
                  <div className="flex gap-4 mt-1">
                    <a href={OAUTH_CONFIG.privacyUrl} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">
                      {t("demoOAuth.privacyLink")}
                    </a>
                    <a href={OAUTH_CONFIG.termsUrl} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">
                      {t("demoOAuth.termsLink")}
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
              {t("demoOAuth.stepIndicator2")}
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            {t("demoOAuth.requestedScopes")}
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
                        {t("demoOAuth.detailedJustification")}
                      </h4>
                      <p className="text-sm font-medium">{scope.justification}</p>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" />
                        {t("demoOAuth.usage")}
                      </h4>
                      <p className="text-sm">{scope.usage}</p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        {t("demoOAuth.dataAccessed")}
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
                        {t("demoOAuth.enabledFeatures")}
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
                {t("demoOAuth.readOnlyWarning")}
              </p>
            </CardContent>
          </Card>

          {/* Scopes NON demandés - Clarification importante */}
          <Card className="mt-6 border-2 border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="w-5 h-5" />
                {t("demoOAuth.notRequestedTitle")}
              </CardTitle>
              <CardDescription>
                {t("demoOAuth.notRequestedDescription")}
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
                  {t("demoOAuth.notRequestedWarning")}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Flux OAuth */}
        <section>
          <div className="mb-6 p-3 bg-primary text-primary-foreground rounded-lg text-center">
            <p className="text-lg font-bold">
              {t("demoOAuth.stepIndicator3")}
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            {t("demoOAuth.userOAuthFlow")}
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
                        <p className="text-sm text-muted-foreground">{step.description}</p>
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
              {t("demoOAuth.stepIndicator4")}
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            {t("demoOAuth.howDataUsed")}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-500/50">
              <CardHeader className="bg-blue-500/10">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  {t("demoOAuth.analyticsDashboard")}
                </CardTitle>
                <CardDescription>
                  {t("demoOAuth.analyticsDashboardDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">{t("demoOAuth.sessions7days")}</span>
                    <span className="font-bold text-lg">12,450</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">{t("demoOAuth.bounceRate")}</span>
                    <span className="font-bold text-lg">42.3%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">{t("demoOAuth.conversions")}</span>
                    <span className="font-bold text-lg">234</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 p-2 bg-blue-500/10 rounded">
                  {t("demoOAuth.analyticsDataNote")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500/50">
              <CardHeader className="bg-green-500/10">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-500" />
                  {t("demoOAuth.seoDashboard")}
                </CardTitle>
                <CardDescription>
                  {t("demoOAuth.seoDashboardDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">{t("demoOAuth.clicks7days")}</span>
                    <span className="font-bold text-lg">8,234</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">{t("demoOAuth.impressions")}</span>
                    <span className="font-bold text-lg">156,789</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">{t("demoOAuth.avgPosition")}</span>
                    <span className="font-bold text-lg">12.4</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 p-2 bg-green-500/10 rounded">
                  {t("demoOAuth.seoDataNote")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Agents IA */}
          <Card className="mt-6 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary" />
                {t("demoOAuth.automatedAgents")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="font-bold">{t("demoOAuth.agentAnalytics")}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("demoOAuth.agentAnalyticsDesc")}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="font-bold">{t("demoOAuth.agentSeo")}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("demoOAuth.agentSeoDesc")}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="font-bold">{t("demoOAuth.agentAlerts")}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("demoOAuth.agentAlertsDesc")}
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
            {t("demoOAuth.securityMeasures")}
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  {t("demoOAuth.encryptionTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("demoOAuth.encryptionDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  {t("demoOAuth.readOnlyTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("demoOAuth.readOnlyDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {t("demoOAuth.gdprTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("demoOAuth.gdprDesc")}
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
              {t("demoOAuth.contact")}
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <a href={OAUTH_CONFIG.privacyUrl} className="text-primary hover:underline text-sm">
                {t("demoOAuth.privacyPolicy")}
              </a>
              <a href={OAUTH_CONFIG.termsUrl} className="text-primary hover:underline text-sm">
                {t("demoOAuth.termsOfService")}
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
