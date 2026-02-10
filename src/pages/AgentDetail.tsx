import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEOHead } from "@/components/SEOHead";
import {
  getAgentBySlug,
  getAgentsByDepartment,
  DEPARTMENTS_CATALOG,
} from "@/data/agents-catalog";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle,
  Clock3,
  Shield,
  AlertTriangle,
  Play,
  Loader2,
  Sparkles,
  Star,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RISK_COLORS = {
  low: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  high: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

const RISK_ICONS = {
  low: CheckCircle,
  medium: Shield,
  high: AlertTriangle,
};

type AgentExecutionRecord = {
  id: string;
  title: Record<"fr" | "en", string>;
  status: "success" | "approval_pending" | "running";
  timestamp: string;
  outcome: Record<"fr" | "en", string>;
};

const EXECUTION_STATUS_LABELS: Record<AgentExecutionRecord["status"], Record<"fr" | "en", string>> = {
  success: { fr: "Succès", en: "Success" },
  approval_pending: { fr: "Approbation requise", en: "Approval pending" },
  running: { fr: "En cours", en: "Running" },
};

const EXECUTION_STATUS_BADGE: Record<AgentExecutionRecord["status"], string> = {
  success: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  approval_pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  running: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

const formatRelativeTime = (isoDate: string, lang: "fr" | "en") => {
  const formatter = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const now = Date.now();
  const value = Date.parse(isoDate);
  const diffHours = Math.round((value - now) / (1000 * 60 * 60));

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
};

const getAgentPerformance = (agentSlug: string) => {
  const checksum = Array.from(agentSlug).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return {
    rating: Number((4.4 + (checksum % 5) * 0.1).toFixed(1)),
    successRate: 91 + (checksum % 8),
    tasksCompleted: 120 + (checksum % 90),
    avgDeliveryMinutes: 8 + (checksum % 14),
  };
};

const getExecutionHistory = (agentName: string): AgentExecutionRecord[] => {
  const now = new Date();
  return [
    {
      id: "exec-1",
      title: {
        fr: `Audit prioritaire exécuté par ${agentName}`,
        en: `Priority audit executed by ${agentName}`,
      },
      status: "success",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
      outcome: {
        fr: "Rapport livré avec 6 actions classées par impact.",
        en: "Report delivered with 6 actions ranked by impact.",
      },
    },
    {
      id: "exec-2",
      title: {
        fr: `Campagne de correction préparée`,
        en: "Correction campaign prepared",
      },
      status: "approval_pending",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 18).toISOString(),
      outcome: {
        fr: "Validation présidentielle demandée avant publication.",
        en: "Presidential validation requested before publishing.",
      },
    },
    {
      id: "exec-3",
      title: {
        fr: `Analyse comparative multi-source`,
        en: "Multi-source comparative analysis",
      },
      status: "running",
      timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      outcome: {
        fr: "Collecte en cours sur les intégrations connectées.",
        en: "Collection in progress across connected integrations.",
      },
    },
  ];
};

export default function AgentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";

  const [demoInput, setDemoInput] = useState("");
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoResult, setDemoResult] = useState<string | null>(null);

  const agent = slug ? getAgentBySlug(slug) : undefined;

  if (!agent) {
    return <Navigate to="/agents" replace />;
  }

  const department = DEPARTMENTS_CATALOG.find((d) => d.slug === agent.departmentSlug);
  const relatedAgents = getAgentsByDepartment(agent.departmentSlug).filter(
    (a) => a.slug !== agent.slug
  );
  const executionHistory = getExecutionHistory(agent.name);
  const performance = getAgentPerformance(agent.slug);
  const Icon = agent.icon;
  const RiskIcon = RISK_ICONS[agent.riskLevel];

  const handleDemoRun = () => {
    setDemoRunning(true);
    setDemoResult(null);
    setTimeout(() => {
      setDemoRunning(false);
      const input = demoInput || "example.com";
      const results: Record<string, Record<string, string>> = {
        fr: {
          default: `Analyse terminee pour "${input}". 3 actions identifiees avec un score ICE moyen de 8.2/10. Recommandation prioritaire : optimiser les meta-descriptions des 15 pages principales.`,
          marketing: `Audit SEO de "${input}" termine. Score global : 72/100. 12 erreurs techniques detectees, 3 opportunites de mots-cles a fort volume identifiees. Gain potentiel : +45% de trafic organique.`,
          sales: `Pipeline analyse pour "${input}". 8 leads qualifies detectes, score moyen 7.5/10. 3 opportunites d'upsell identifiees. Recommandation : relancer les 2 prospects inactifs depuis 14 jours.`,
          finance: `Rapport financier genere pour "${input}". Revenue MRR : 12 450EUR. Croissance +8.3% MoM. Alerte : 2 factures impayees detectees (1 250EUR total).`,
          security: `Scan de securite de "${input}" termine. 0 vulnerabilite critique, 2 moyennes, 5 faibles. Score de securite : 94/100. Conformite RGPD : 98%.`,
          data: `Analyse des donnees de "${input}" terminee. 3 anomalies detectees dans les conversions. Tendance : +12% de sessions organiques cette semaine. Modele predictif : croissance estimee +25% M+3.`,
        },
        en: {
          default: `Analysis completed for "${input}". 3 actions identified with an average ICE score of 8.2/10. Priority recommendation: optimize meta descriptions for the top 15 pages.`,
          marketing: `SEO audit of "${input}" completed. Global score: 72/100. 12 technical errors detected, 3 high-volume keyword opportunities identified. Potential gain: +45% organic traffic.`,
          sales: `Pipeline analyzed for "${input}". 8 qualified leads detected, average score 7.5/10. 3 upsell opportunities identified. Recommendation: follow up on 2 prospects inactive for 14 days.`,
          finance: `Financial report generated for "${input}". MRR Revenue: EUR12,450. Growth +8.3% MoM. Alert: 2 unpaid invoices detected (EUR1,250 total).`,
          security: `Security scan of "${input}" completed. 0 critical vulnerabilities, 2 medium, 5 low. Security score: 94/100. GDPR compliance: 98%.`,
          data: `Data analysis for "${input}" completed. 3 conversion anomalies detected. Trend: +12% organic sessions this week. Predictive model: estimated growth +25% M+3.`,
        },
      };
      const deptKey = agent.departmentSlug;
      const langResults = results[lang] || results.en;
      setDemoResult(langResults[deptKey] || langResults.default);
    }, 2000);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${agent.name} - Growth OS`,
    description: agent.description[lang],
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "490",
      priceCurrency: "EUR",
    },
  };

  return (
    <>
      <SEOHead
        title={`${agent.name} - ${lang === "fr" ? "Agent IA" : "AI Agent"}`}
        description={agent.description[lang]}
        canonical={`/agents/${agent.slug}`}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="border-b border-border/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">
                Growth OS
              </Link>
              <span>/</span>
              <Link to="/agents" className="hover:text-foreground transition-colors">
                {lang === "fr" ? "Agents" : "Agents"}
              </Link>
              <span>/</span>
              <span className="text-foreground">{agent.name}</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 50%, ${agent.color} 0%, transparent 50%)`,
            }}
          />
          <div className="container mx-auto px-4 relative">
            <Link
              to="/agents"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === "fr" ? "Tous les agents" : "All agents"}
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${agent.color}20` }}
              >
                <Icon className="w-10 h-10" style={{ color: agent.color }} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold">{agent.name}</h1>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", RISK_COLORS[agent.riskLevel])}
                  >
                    <RiskIcon className="w-3 h-3 mr-1" />
                    {lang === "fr" ? "Risque" : "Risk"}: {agent.riskLevel}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  {agent.role[lang]}
                </p>
                <p className="text-base max-w-2xl">{agent.description[lang]}</p>

                <div className="flex items-center gap-4 mt-6 flex-wrap">
                  <Link to={`/departments/${agent.departmentSlug}`}>
                    <Badge
                      variant="secondary"
                      className="text-sm px-3 py-1 cursor-pointer hover:bg-secondary/80"
                    >
                      {department?.name[lang] || agent.department}
                    </Badge>
                  </Link>
                  {agent.requiresApproval && (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {lang === "fr"
                        ? "Approbation requise"
                        : "Approval required"}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                      {agent.persona.initials}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {agent.persona.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">
                  {lang === "fr" ? "Essayez cet agent" : "Try this agent"}
                </h2>
              </div>
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    {lang === "fr"
                      ? `Simulez une exécution de ${agent.name}. Entrez une URL ou un terme pour voir un exemple de résultat.`
                      : `Simulate a ${agent.name} run. Enter a URL or term to see an example result.`}
                  </p>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder={
                        lang === "fr"
                          ? "ex: example.com ou votre domaine"
                          : "e.g., example.com or your domain"
                      }
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !demoRunning) handleDemoRun();
                      }}
                    />
                    <Button
                      onClick={handleDemoRun}
                      disabled={demoRunning}
                      variant="hero"
                    >
                      {demoRunning ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span className="ml-2">
                        {demoRunning
                          ? lang === "fr" ? "Analyse..." : "Analyzing..."
                          : lang === "fr" ? "Lancer" : "Run"}
                      </span>
                    </Button>
                  </div>

                  {demoResult && (
                    <div className="animate-fade-in rounded-lg bg-background border p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                          style={{ backgroundColor: agent.color }}
                        >
                          {agent.persona.initials}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {agent.persona.name} — {agent.name}
                          </p>
                          <p className="text-sm">{demoResult}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {lang === "fr" ? "Ceci est une simulation." : "This is a simulation."}
                        </p>
                        <Link to="/auth?tab=signup">
                          <Button variant="outline" size="sm">
                            {lang === "fr" ? "Essai gratuit" : "Free trial"}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Performance & audit trail */}
        <section className="py-12 border-y border-border/60 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    {lang === "fr" ? "Performance" : "Performance"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4 bg-secondary/30">
                    <p className="text-xs text-muted-foreground">
                      {lang === "fr" ? "Rating de l'agent" : "Agent rating"}
                    </p>
                    <p className="text-3xl font-bold">{performance.rating}/5</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">{lang === "fr" ? "Taux de réussite" : "Success rate"}</p>
                      <p className="text-lg font-semibold">{performance.successRate}%</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">{lang === "fr" ? "Actions livrées" : "Tasks delivered"}</p>
                      <p className="text-lg font-semibold">{performance.tasksCompleted}</p>
                    </div>
                    <div className="rounded-lg border p-3 col-span-2">
                      <p className="text-xs text-muted-foreground">{lang === "fr" ? "Temps moyen de livraison" : "Avg delivery time"}</p>
                      <p className="text-lg font-semibold">{performance.avgDeliveryMinutes} min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    {lang === "fr" ? "Historique d'exécution & audit trail" : "Execution history & audit trail"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {executionHistory.map((record) => (
                    <div key={record.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{record.title[lang]}</p>
                        <Badge variant="outline" className={cn("text-xs", EXECUTION_STATUS_BADGE[record.status])}>
                          {EXECUTION_STATUS_LABELS[record.status][lang]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{record.outcome[lang]}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <Clock3 className="w-3.5 h-3.5" />
                        {formatRelativeTime(record.timestamp, lang)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
              {/* Use Cases */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {lang === "fr" ? "Cas d'usage" : "Use Cases"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {agent.useCases[lang].map((useCase) => (
                      <li key={useCase} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Capabilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {lang === "fr" ? "Capacités" : "Capabilities"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-sm">
                        {cap.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-sm mb-3">
                      {lang === "fr" ? "Informations" : "Details"}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "fr" ? "Département" : "Department"}
                        </span>
                        <span className="font-medium">
                          {department?.name[lang] || agent.department}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "fr" ? "Niveau de risque" : "Risk level"}
                        </span>
                        <span className="font-medium capitalize">
                          {agent.riskLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "fr" ? "Approbation" : "Approval"}
                        </span>
                        <span className="font-medium">
                          {agent.requiresApproval
                            ? lang === "fr"
                              ? "Requise"
                              : "Required"
                            : lang === "fr"
                              ? "Automatique"
                              : "Automatic"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "fr" ? "Disponibilité" : "Availability"}
                        </span>
                        <span className="font-medium text-green-500">24/7</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Related Agents */}
        {relatedAgents.length > 0 && (
          <section className="py-12 bg-secondary/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">
                {lang === "fr"
                  ? `Autres agents ${department?.name[lang] || agent.department}`
                  : `Other ${department?.name[lang] || agent.department} agents`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedAgents.map((related) => {
                  const RelatedIcon = related.icon;
                  return (
                    <Link key={related.slug} to={`/agents/${related.slug}`}>
                      <Card className="hover:border-primary/30 transition-all">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${related.color}20` }}
                          >
                            <RelatedIcon
                              className="w-5 h-5"
                              style={{ color: related.color }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm">{related.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {related.role[lang]}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {lang === "fr"
                ? `Activez ${agent.name} dans votre équipe`
                : `Activate ${agent.name} in your team`}
            </h2>
            <p className="text-muted-foreground mb-8">
              {lang === "fr"
                ? "Essai gratuit de 14 jours, aucune carte requise."
                : "14-day free trial, no card required."}
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth?tab=signup">
                <Button variant="hero" size="lg">
                  {lang === "fr" ? "Commencer gratuitement" : "Start for free"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/agents">
                <Button variant="outline" size="lg">
                  {lang === "fr" ? "Voir tous les agents" : "See all agents"}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
