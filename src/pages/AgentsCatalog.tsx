import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEOHead } from "@/components/SEOHead";
import { AGENTS_CATALOG, DEPARTMENTS_CATALOG } from "@/data/agents-catalog";
import { Search, Bot, ArrowRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const RISK_COLORS = {
  low: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  high: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function AgentsCatalog() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const filteredAgents = useMemo(() => {
    return AGENTS_CATALOG.filter((agent) => {
      const matchesSearch =
        !searchQuery ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.capabilities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDepartment =
        !selectedDepartment || agent.departmentSlug === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [searchQuery, selectedDepartment, lang]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: lang === "fr" ? "39 Agents IA - Growth OS" : "39 AI Agents - Growth OS",
    description:
      lang === "fr"
        ? "Découvrez les 39 agents IA de Growth OS répartis dans 11 départements pour automatiser votre croissance."
        : "Discover Growth OS's 39 AI agents across 11 departments to automate your growth.",
    numberOfItems: 39,
  };

  return (
    <>
      <SEOHead
        title={lang === "fr" ? "39 Agents IA" : "39 AI Agents"}
        description={
          lang === "fr"
            ? "Découvrez les 39 agents IA de Growth OS répartis dans 11 départements."
            : "Discover Growth OS's 39 AI agents across 11 departments."
        }
        canonical="/agents"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="agent" className="mb-4">
                <Bot className="w-3 h-3 mr-1" />
                {lang === "fr" ? "39 Agents IA" : "39 AI Agents"}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {lang === "fr" ? "Votre équipe IA " : "Your AI team "}
                <span className="gradient-text">
                  {lang === "fr" ? "complète" : "complete"}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {lang === "fr"
                  ? "39 agents spécialisés répartis dans 11 départements. Chaque agent a un rôle précis, des cas d'usage concrets et travaille 24/7."
                  : "39 specialized agents across 11 departments. Each agent has a precise role, concrete use cases, and works 24/7."}
              </p>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="py-6 border-b border-border/50 sticky top-0 z-30 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={
                    lang === "fr"
                      ? "Rechercher un agent, fonctionnalité..."
                      : "Search an agent, feature..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Button
                  variant={selectedDepartment === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDepartment(null)}
                >
                  {lang === "fr" ? "Tous" : "All"} ({AGENTS_CATALOG.length})
                </Button>
                {DEPARTMENTS_CATALOG.map((dept) => (
                  <Button
                    key={dept.slug}
                    variant={selectedDepartment === dept.slug ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSelectedDepartment(
                        selectedDepartment === dept.slug ? null : dept.slug
                      )
                    }
                  >
                    {dept.name[lang]} ({dept.agentCount})
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Agents Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <p className="text-sm text-muted-foreground mb-6">
              {filteredAgents.length}{" "}
              {lang === "fr" ? "agents trouvés" : "agents found"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent, index) => {
                const Icon = agent.icon;
                return (
                  <Link
                    key={agent.slug}
                    to={`/agents/${agent.slug}`}
                    className="group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="h-full overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 animate-fade-in-up">
                      <div
                        className="h-1.5 bg-gradient-to-r"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${agent.color}, ${agent.color}80)`,
                        }}
                      />
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${agent.color}20` }}
                          >
                            <Icon
                              className="w-6 h-6"
                              style={{ color: agent.color }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                              {agent.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {agent.role[lang]}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {DEPARTMENTS_CATALOG.find(
                              (d) => d.slug === agent.departmentSlug
                            )?.name[lang] || agent.department}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", RISK_COLORS[agent.riskLevel])}
                          >
                            {lang === "fr" ? "Risque" : "Risk"}: {agent.riskLevel}
                          </Badge>
                          {agent.requiresApproval && (
                            <Badge variant="secondary" className="text-xs">
                              {lang === "fr" ? "Approbation" : "Approval"}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {agent.description[lang]}
                        </p>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {agent.persona.initials}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {agent.persona.name}
                          </span>
                          <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {filteredAgents.length === 0 && (
              <div className="text-center py-16">
                <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {lang === "fr" ? "Aucun agent trouvé" : "No agents found"}
                </h3>
                <p className="text-muted-foreground">
                  {lang === "fr"
                    ? "Essayez de modifier vos critères de recherche."
                    : "Try adjusting your search criteria."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {lang === "fr"
                ? "Prêt à activer votre équipe IA ?"
                : "Ready to activate your AI team?"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {lang === "fr"
                ? "Commencez votre essai gratuit de 14 jours et accédez à tous les agents."
                : "Start your 14-day free trial and access all agents."}
            </p>
            <Link to="/auth?tab=signup">
              <Button variant="hero" size="lg">
                {lang === "fr" ? "Essai gratuit 14 jours" : "14-day free trial"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
