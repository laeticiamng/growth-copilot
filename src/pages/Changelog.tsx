import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { Rocket, Bug, Sparkles, Wrench, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  title: Record<string, string>;
  changes: { type: "feature" | "fix" | "improvement" | "security"; text: Record<string, string> }[];
}

const TYPE_CONFIG = {
  feature: { icon: Sparkles, color: "text-blue-500", bgColor: "bg-blue-500/10", labelFr: "Nouveauté", labelEn: "Feature" },
  fix: { icon: Bug, color: "text-red-500", bgColor: "bg-red-500/10", labelFr: "Correction", labelEn: "Fix" },
  improvement: { icon: Zap, color: "text-yellow-500", bgColor: "bg-yellow-500/10", labelFr: "Amélioration", labelEn: "Improvement" },
  security: { icon: Shield, color: "text-green-500", bgColor: "bg-green-500/10", labelFr: "Sécurité", labelEn: "Security" },
};

const VERSION_COLORS = {
  major: "bg-primary/10 text-primary border-primary/20",
  minor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  patch: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.4.0",
    date: "2025-12-15",
    type: "major",
    title: { fr: "Page Agents & Départements", en: "Agents & Departments Page" },
    changes: [
      { type: "feature", text: { fr: "Page /agents avec grille interactive des 39 agents IA", en: "/agents page with interactive grid of all 39 AI agents" } },
      { type: "feature", text: { fr: "Pages /departments/[slug] pour les 11 départements", en: "/departments/[slug] pages for all 11 departments" } },
      { type: "feature", text: { fr: "Filtrage par département et recherche par nom", en: "Department filtering and name search" } },
      { type: "improvement", text: { fr: "Animations d'entrée stagger sur la grille d'agents", en: "Stagger entry animations on the agent grid" } },
    ],
  },
  {
    version: "2.3.0",
    date: "2025-12-01",
    type: "major",
    title: { fr: "Dashboard Cockpit v2", en: "Cockpit Dashboard v2" },
    changes: [
      { type: "feature", text: { fr: "Briefing quotidien par Sophie Marchand (CGO)", en: "Daily briefing by Sophie Marchand (CGO)" } },
      { type: "feature", text: { fr: "Sémaphores de santé des départements", en: "Department health semaphores" } },
      { type: "feature", text: { fr: "Assistant vocal IA intégré", en: "Built-in AI voice assistant" } },
      { type: "improvement", text: { fr: "Comparaison Month-over-Month des KPIs", en: "Month-over-Month KPI comparison" } },
      { type: "fix", text: { fr: "Correction du calcul ROI dans le widget", en: "Fixed ROI calculation in widget" } },
    ],
  },
  {
    version: "2.2.0",
    date: "2025-11-15",
    type: "minor",
    title: { fr: "Intégration Stripe & Facturation", en: "Stripe Integration & Billing" },
    changes: [
      { type: "feature", text: { fr: "Intégration Stripe pour les 3 plans (Starter, À la carte, Full Company)", en: "Stripe integration for 3 plans (Starter, À la carte, Full Company)" } },
      { type: "feature", text: { fr: "Catalogue de services avec activation/désactivation", en: "Service catalog with enable/disable" } },
      { type: "security", text: { fr: "Webhook Stripe sécurisé avec validation de signature", en: "Secured Stripe webhook with signature validation" } },
    ],
  },
  {
    version: "2.1.0",
    date: "2025-11-01",
    type: "minor",
    title: { fr: "Système d'Approbations v2", en: "Approvals System v2" },
    changes: [
      { type: "feature", text: { fr: "Nouveau système d'approbations avec workflow personnalisable", en: "New approval system with customizable workflow" } },
      { type: "improvement", text: { fr: "Niveau de risque affiché sur chaque action", en: "Risk level displayed on each action" } },
      { type: "fix", text: { fr: "Correction des notifications push sur mobile", en: "Fixed push notifications on mobile" } },
    ],
  },
  {
    version: "2.0.0",
    date: "2025-10-15",
    type: "major",
    title: { fr: "Growth OS v2 — 39 Agents IA", en: "Growth OS v2 — 39 AI Agents" },
    changes: [
      { type: "feature", text: { fr: "39 agents IA répartis dans 11 départements", en: "39 AI agents across 11 departments" } },
      { type: "feature", text: { fr: "Orchestrateur CGO avec scoring ICE", en: "CGO Orchestrator with ICE scoring" } },
      { type: "feature", text: { fr: "PWA avec support offline et notifications push", en: "PWA with offline support and push notifications" } },
      { type: "feature", text: { fr: "Multilingue : FR, EN, ES, DE", en: "Multilingual: FR, EN, ES, DE" } },
      { type: "security", text: { fr: "RBAC complet avec 5 niveaux de permissions", en: "Full RBAC with 5 permission levels" } },
      { type: "improvement", text: { fr: "Schema.org complet (Organization, SoftwareApplication, FAQPage)", en: "Complete Schema.org (Organization, SoftwareApplication, FAQPage)" } },
    ],
  },
  {
    version: "1.5.0",
    date: "2025-09-01",
    type: "minor",
    title: { fr: "Intégrations OAuth", en: "OAuth Integrations" },
    changes: [
      { type: "feature", text: { fr: "Connexion Google Analytics 4 en 1 clic", en: "1-click Google Analytics 4 connection" } },
      { type: "feature", text: { fr: "Connexion Google Search Console", en: "Google Search Console connection" } },
      { type: "feature", text: { fr: "Connexion Meta Business API", en: "Meta Business API connection" } },
      { type: "security", text: { fr: "Chiffrement des tokens avec AES-256", en: "Token encryption with AES-256" } },
    ],
  },
  {
    version: "1.0.0",
    date: "2025-07-01",
    type: "major",
    title: { fr: "Lancement de Growth OS", en: "Growth OS Launch" },
    changes: [
      { type: "feature", text: { fr: "Landing page avec audit SEO instantané", en: "Landing page with instant SEO audit" } },
      { type: "feature", text: { fr: "Système d'authentification Supabase", en: "Supabase authentication system" } },
      { type: "feature", text: { fr: "Dashboard de base avec KPIs", en: "Basic dashboard with KPIs" } },
      { type: "feature", text: { fr: "Agent Tech SEO Auditor opérationnel", en: "Operational Tech SEO Auditor agent" } },
    ],
  },
];

export default function Changelog() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: lang === "fr" ? "Changelog - Growth OS" : "Changelog - Growth OS",
    description: lang === "fr"
      ? "Historique des versions et mises à jour de Growth OS."
      : "Growth OS version history and updates.",
  };

  return (
    <>
      <SEOHead
        title="Changelog"
        description={
          lang === "fr"
            ? "Historique des versions et mises à jour de Growth OS."
            : "Growth OS version history and updates."
        }
        canonical="/changelog"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative text-center">
            <Badge variant="agent" className="mb-4">
              <Rocket className="w-3 h-3 mr-1" />
              Changelog
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {lang === "fr" ? "Quoi de " : "What's "}
              <span className="gradient-text">
                {lang === "fr" ? "neuf ?" : "new?"}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {lang === "fr"
                ? "Suivez l'évolution de Growth OS. Nouvelles fonctionnalités, améliorations et corrections."
                : "Follow Growth OS evolution. New features, improvements and fixes."}
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

              <div className="space-y-8">
                {CHANGELOG.map((entry, index) => (
                  <div key={entry.version} className="relative pl-12">
                    {/* Dot */}
                    <div className="absolute left-2.5 top-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                    <Card
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn("font-mono text-sm", VERSION_COLORS[entry.type])}
                          >
                            v{entry.version}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{entry.date}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-4">{entry.title[lang]}</h3>
                        <ul className="space-y-2">
                          {entry.changes.map((change, ci) => {
                            const config = TYPE_CONFIG[change.type];
                            const ChangeIcon = config.icon;
                            return (
                              <li key={ci} className="flex items-start gap-3">
                                <div className={cn("w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5", config.bgColor)}>
                                  <ChangeIcon className={cn("w-3.5 h-3.5", config.color)} />
                                </div>
                                <div>
                                  <Badge variant="outline" className={cn("text-[10px] px-1 py-0 mr-2", config.bgColor, config.color)}>
                                    {lang === "fr" ? config.labelFr : config.labelEn}
                                  </Badge>
                                  <span className="text-sm">{change.text[lang]}</span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
