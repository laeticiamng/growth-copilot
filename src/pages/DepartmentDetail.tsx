import { useParams, Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import {
  getDepartmentBySlug,
  getAgentsByDepartment,
  DEPARTMENTS_CATALOG,
} from "@/data/agents-catalog";
import { ArrowLeft, ArrowRight, Bot, CheckCircle, Users, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DepartmentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";

  const department = slug ? getDepartmentBySlug(slug) : undefined;
  const agents = slug ? getAgentsByDepartment(slug) : [];

  if (!department) {
    return <Navigate to="/agents" replace />;
  }

  const DeptIcon = department.icon;
  const otherDepartments = DEPARTMENTS_CATALOG.filter((d) => d.slug !== slug);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${department.name[lang]} - Growth OS`,
    description: department.description[lang],
  };

  return (
    <>
      <SEOHead
        title={`${department.name[lang]} - ${lang === "fr" ? "Département" : "Department"}`}
        description={department.description[lang]}
        canonical={`/departments/${department.slug}`}
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
              <span className="text-foreground">{department.name[lang]}</span>
            </div>
          </div>
        </div>

        {/* Hero with Metric */}
        <section className="py-20 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 50%, ${department.color} 0%, transparent 50%)`,
            }}
          />
          <div className="container mx-auto px-4 relative">
            <Link
              to="/agents"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === "fr" ? "Tous les départements" : "All departments"}
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div
                className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
                  department.gradientFrom,
                  department.gradientTo
                )}
              >
                <DeptIcon className="w-10 h-10 text-primary-foreground" />
              </div>

              <div className="flex-1">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {department.name[lang]}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                  {department.description[lang]}
                </p>

                {/* Hero Metric */}
                <div
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border-2 mb-6"
                  style={{ borderColor: `${department.color}40`, backgroundColor: `${department.color}08` }}
                >
                  <Zap className="w-5 h-5" style={{ color: department.color }} />
                  <span className="text-lg font-bold" style={{ color: department.color }}>
                    {department.heroMetric[lang]}
                  </span>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <Bot className="w-3 h-3 mr-1" />
                    {department.agentCount}{" "}
                    {lang === "fr" ? "agents IA" : "AI agents"}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Users className="w-3 h-3 mr-1" />
                    {lang === "fr" ? "Disponible 24/7" : "Available 24/7"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">
              {lang === "fr" ? "Fonctionnalités clés" : "Key Features"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
              {department.features[lang].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 p-4 rounded-lg bg-background border"
                >
                  <CheckCircle
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: department.color }}
                  />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Diagram */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-2">
              {lang === "fr" ? "Workflow automatisé" : "Automated Workflow"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {lang === "fr"
                ? "Comment les agents collaborent pour produire des résultats."
                : "How agents collaborate to deliver results."}
            </p>

            <div className="max-w-4xl mx-auto">
              {/* SVG Workflow */}
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {department.workflow.map((step, index) => (
                    <div key={index} className="relative">
                      <div className="flex flex-col items-center text-center">
                        {/* Step circle */}
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white mb-3 relative z-10"
                          style={{ backgroundColor: department.color }}
                        >
                          {index + 1}
                        </div>

                        {/* Arrow between steps (hidden on mobile, hidden for last item) */}
                        {index < department.workflow.length - 1 && (
                          <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] z-0">
                            <div className="flex items-center">
                              <div
                                className="flex-1 h-0.5"
                                style={{ backgroundColor: `${department.color}40` }}
                              />
                              <ChevronRight
                                className="w-4 h-4 -ml-1 flex-shrink-0"
                                style={{ color: `${department.color}60` }}
                              />
                            </div>
                          </div>
                        )}

                        <h4 className="font-bold text-sm mb-1">{step.label[lang]}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.description[lang]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-2">
              {lang === "fr" ? "Intégrations supportées" : "Supported Integrations"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {lang === "fr"
                ? "Connectez vos outils existants en quelques clics."
                : "Connect your existing tools in a few clicks."}
            </p>
            <div className="flex flex-wrap gap-3">
              {department.integrations.map((integration) => (
                <div
                  key={integration}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-background border hover:border-primary/30 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: department.color }}
                  >
                    {integration.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{integration}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Agents in Department */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-2">
              {lang === "fr"
                ? `Les agents du département ${department.name[lang]}`
                : `${department.name[lang]} department agents`}
            </h2>
            <p className="text-muted-foreground mb-8">
              {lang === "fr"
                ? `${agents.length} agents spécialisés travaillent ensemble pour vous.`
                : `${agents.length} specialized agents working together for you.`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agents.map((agent, index) => {
                const AgentIcon = agent.icon;
                return (
                  <Link
                    key={agent.slug}
                    to={`/agents/${agent.slug}`}
                    className="group"
                  >
                    <Card className="h-full overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${agent.color}20` }}
                          >
                            <AgentIcon
                              className="w-7 h-7"
                              style={{ color: agent.color }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                                {agent.name}
                              </h3>
                              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {agent.role[lang]} — {agent.persona.name}
                            </p>
                            <p className="text-sm text-muted-foreground mb-3">
                              {agent.description[lang]}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {agent.useCases[lang].slice(0, 3).map((uc) => (
                                <Badge
                                  key={uc}
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {uc}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Other Departments */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">
              {lang === "fr" ? "Autres départements" : "Other departments"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {otherDepartments.map((dept) => {
                const OtherIcon = dept.icon;
                return (
                  <Link key={dept.slug} to={`/departments/${dept.slug}`}>
                    <Card className="hover:border-primary/30 transition-all text-center p-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 bg-gradient-to-br",
                          dept.gradientFrom,
                          dept.gradientTo
                        )}
                      >
                        <OtherIcon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <p className="text-xs font-medium">{dept.name[lang]}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {dept.agentCount} agents
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {lang === "fr"
                ? `Activez le département ${department.name[lang]}`
                : `Activate the ${department.name[lang]} department`}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {lang === "fr"
                ? "Essai gratuit 14 jours, aucune carte bancaire requise."
                : "14-day free trial, no credit card required."}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/auth?tab=signup">
                <Button variant="hero" size="lg">
                  {lang === "fr" ? "Essai gratuit 14 jours" : "14-day free trial"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg">
                  {lang === "fr" ? "Voir les tarifs" : "View pricing"}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
