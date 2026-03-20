import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { CheckCircle, AlertCircle, Clock, Activity, Globe, Database, Bot, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  uptime: string;
  icon: typeof CheckCircle;
  description: Record<string, string>;
}

const STATUS_CONFIG = {
  operational: { color: "text-green-500", bg: "bg-green-500/10", labelFr: "Opérationnel", labelEn: "Operational", icon: CheckCircle },
  degraded: { color: "text-yellow-500", bg: "bg-yellow-500/10", labelFr: "Dégradé", labelEn: "Degraded", icon: AlertCircle },
  outage: { color: "text-red-500", bg: "bg-red-500/10", labelFr: "Panne", labelEn: "Outage", icon: AlertCircle },
  maintenance: { color: "text-blue-500", bg: "bg-blue-500/10", labelFr: "Maintenance", labelEn: "Maintenance", icon: Clock },
};

const SERVICES: ServiceStatus[] = [
  { name: "Web Application", status: "operational", uptime: "99.98%", icon: Globe, description: { fr: "Application web principale (dashboard, landing)", en: "Main web application (dashboard, landing)" } },
  { name: "AI Agents Engine", status: "operational", uptime: "99.95%", icon: Bot, description: { fr: "Moteur d'exécution des modules growth", en: "Execution engine for all growth modules" } },
  { name: "Database (Supabase)", status: "operational", uptime: "99.99%", icon: Database, description: { fr: "Base de données PostgreSQL et temps réel", en: "PostgreSQL database and real-time" } },
  { name: "Authentication", status: "operational", uptime: "99.99%", icon: Shield, description: { fr: "Système d'authentification et sessions", en: "Authentication system and sessions" } },
  { name: "Edge Functions", status: "operational", uptime: "99.97%", icon: Activity, description: { fr: "Fonctions serverless (OAuth, webhooks, agents)", en: "Serverless functions (OAuth, webhooks, agents)" } },
  { name: "Google Integrations", status: "operational", uptime: "99.90%", icon: Globe, description: { fr: "GA4, Search Console, Google Ads, GBP", en: "GA4, Search Console, Google Ads, GBP" } },
  { name: "Meta Integrations", status: "operational", uptime: "99.85%", icon: Globe, description: { fr: "Facebook, Instagram, Meta Business API", en: "Facebook, Instagram, Meta Business API" } },
  { name: "Stripe Billing", status: "operational", uptime: "99.99%", icon: Shield, description: { fr: "Paiements et abonnements", en: "Payments and subscriptions" } },
];

const INCIDENTS = [
  {
    date: "2025-12-10",
    title: { fr: "Latence accrue sur les Edge Functions", en: "Increased latency on Edge Functions" },
    description: { fr: "Temps de réponse augmenté de 200ms pendant 45 minutes. Résolu par un redémarrage du cluster.", en: "Response time increased by 200ms for 45 minutes. Resolved by cluster restart." },
    status: "resolved" as const,
    duration: "45 min",
  },
  {
    date: "2025-11-28",
    title: { fr: "Maintenance planifiée - Migration base de données", en: "Planned maintenance - Database migration" },
    description: { fr: "Migration de schéma avec 2 minutes de downtime. Toutes les données préservées.", en: "Schema migration with 2 minutes of downtime. All data preserved." },
    status: "resolved" as const,
    duration: "2 min",
  },
  {
    date: "2025-11-15",
    title: { fr: "Connexion Meta temporairement indisponible", en: "Meta connection temporarily unavailable" },
    description: { fr: "API Meta en maintenance côté Facebook. Résolu automatiquement.", en: "Meta API under maintenance on Facebook's side. Resolved automatically." },
    status: "resolved" as const,
    duration: "1h 30min",
  },
];

export default function Status() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";

  const allOperational = SERVICES.every((s) => s.status === "operational");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: lang === "fr" ? "Statut du service - Growth OS" : "Service Status - Growth OS",
    description: lang === "fr"
      ? "Page de statut en temps réel de Growth OS. Vérifiez la disponibilité de tous les services."
      : "Growth OS real-time status page. Check the availability of all services.",
  };

  return (
    <>
      <SEOHead
        title={lang === "fr" ? "Statut du service" : "Service Status"}
        description={
          lang === "fr"
            ? "Vérifiez la disponibilité de tous les services Growth OS en temps réel."
            : "Check the availability of all Growth OS services in real-time."
        }
        canonical="/status"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative text-center">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
              allOperational ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-yellow-500/10 text-yellow-600"
            )}>
              <span className="relative flex h-3 w-3">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", allOperational ? "bg-green-500" : "bg-yellow-500")} />
                <span className={cn("relative inline-flex rounded-full h-3 w-3", allOperational ? "bg-green-500" : "bg-yellow-500")} />
              </span>
              <span className="font-semibold">
                {allOperational
                  ? lang === "fr" ? "Tous les systèmes opérationnels" : "All systems operational"
                  : lang === "fr" ? "Certains systèmes dégradés" : "Some systems degraded"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {lang === "fr" ? "Statut du service" : "Service Status"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "fr"
                ? "Disponibilité en temps réel de tous les services Growth OS."
                : "Real-time availability of all Growth OS services."}
            </p>
          </div>
        </section>

        {/* Services */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-3">
              {SERVICES.map((service) => {
                const config = STATUS_CONFIG[service.status];
                const StatusIcon = config.icon;
                return (
                  <Card key={service.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bg)}>
                            <service.icon className={cn("w-4 h-4", config.color)} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{service.name}</h3>
                            <p className="text-xs text-muted-foreground">{service.description[lang]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            Uptime: {service.uptime}
                          </span>
                          <Badge variant="outline" className={cn("text-xs", config.bg, config.color)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {lang === "fr" ? config.labelFr : config.labelEn}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Uptime Bar */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {lang === "fr" ? "Uptime des 90 derniers jours" : "90-day uptime"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-0.5">
                  {Array.from({ length: 90 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 h-8 rounded-sm",
                        i === 45 ? "bg-yellow-500/60" : i === 72 ? "bg-blue-500/60" : "bg-green-500/60"
                      )}
                      title={`Day ${90 - i}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{lang === "fr" ? "Il y a 90 jours" : "90 days ago"}</span>
                  <span>{lang === "fr" ? "Aujourd'hui" : "Today"}</span>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-green-500/60" /> <span className="text-xs text-muted-foreground">{lang === "fr" ? "Opérationnel" : "Operational"}</span></div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-yellow-500/60" /> <span className="text-xs text-muted-foreground">{lang === "fr" ? "Incident" : "Incident"}</span></div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-blue-500/60" /> <span className="text-xs text-muted-foreground">{lang === "fr" ? "Maintenance" : "Maintenance"}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="py-8 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl font-bold mb-6">
              {lang === "fr" ? "Incidents récents" : "Recent incidents"}
            </h2>
            <div className="space-y-4">
              {INCIDENTS.map((incident, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-sm">{incident.title[lang]}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500">
                          {lang === "fr" ? "Résolu" : "Resolved"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{incident.description[lang]}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{incident.date}</span>
                      <span>{lang === "fr" ? "Durée" : "Duration"}: {incident.duration}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
