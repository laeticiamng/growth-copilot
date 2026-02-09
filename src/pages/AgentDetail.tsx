import { useParams, Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Shield,
  AlertTriangle,
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

export default function AgentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";

  const agent = slug ? getAgentBySlug(slug) : undefined;

  if (!agent) {
    return <Navigate to="/agents" replace />;
  }

  const department = DEPARTMENTS_CATALOG.find((d) => d.slug === agent.departmentSlug);
  const relatedAgents = getAgentsByDepartment(agent.departmentSlug).filter(
    (a) => a.slug !== agent.slug
  );
  const Icon = agent.icon;
  const RiskIcon = RISK_ICONS[agent.riskLevel];

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
