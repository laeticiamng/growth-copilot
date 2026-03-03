import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Briefcase, Building2, ArrowRight,
  Bot, Users, Clock, BarChart3, Check
} from "lucide-react";

const USE_CASES = [
  {
    key: "startup",
    icon: TrendingUp,
    plan: "Starter",
    price: "490",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    metrics: [
      { key: "agents", value: "11" },
      { key: "depts", value: "11 (lite)" },
      { key: "runs", value: "50/mo" },
    ],
  },
  {
    key: "smb",
    icon: Briefcase,
    plan: "À la carte",
    price: "1 900",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    metrics: [
      { key: "agents", value: "3-5/dept" },
      { key: "depts", value: "2-4" },
      { key: "runs", value: "500/dept" },
    ],
  },
  {
    key: "enterprise",
    icon: Building2,
    plan: "Full Company",
    price: "9 000",
    color: "text-primary",
    bgColor: "bg-primary/10",
    metrics: [
      { key: "agents", value: "39" },
      { key: "depts", value: "11" },
      { key: "runs", value: "∞" },
    ],
  },
];

const BEFORE_AFTER = [
  { key: "contentCreation" },
  { key: "seoAudit" },
  { key: "adManagement" },
  { key: "reporting" },
];

export default function UseCases() {
  const { t } = useTranslation();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("pages.useCases.seoTitle"),
    description: t("pages.useCases.seoDescription"),
  };

  return (
    <>
      <SEOHead
        title={t("pages.useCases.seoTitle")}
        description={t("pages.useCases.seoDescription")}
        canonical="/use-cases"
        structuredData={structuredData}
      />
      <Navbar />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 pt-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative text-center">
            <Badge variant="agent" className="mb-4">
              {t("pages.useCases.badge")}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("pages.useCases.heroTitle")}{" "}
              <span className="gradient-text">
                {t("pages.useCases.heroHighlight")}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("pages.useCases.heroSubtitle")}
            </p>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {USE_CASES.map((uc) => {
                const Icon = uc.icon;
                return (
                  <Card key={uc.key} className="relative overflow-hidden">
                    <CardContent className="p-8">
                      <div className={`p-3 rounded-xl ${uc.bgColor} w-fit mb-6`}>
                        <Icon className={`w-8 h-8 ${uc.color}`} />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">
                        {t(`pages.useCases.cases.${uc.key}.title`)}
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        {t(`pages.useCases.cases.${uc.key}.description`)}
                      </p>

                      {/* Challenge & Solution */}
                      <div className="space-y-4 mb-6">
                        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                          <p className="text-sm font-semibold text-destructive mb-1">
                            {t("pages.useCases.challenge")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t(`pages.useCases.cases.${uc.key}.challenge`)}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">
                            {t("pages.useCases.solution")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t(`pages.useCases.cases.${uc.key}.solution`)}
                          </p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {uc.metrics.map((m) => (
                          <div key={m.key} className="text-center p-3 rounded-lg bg-secondary/50">
                            <p className="text-lg font-bold">{m.value}</p>
                            <p className="text-xs text-muted-foreground">
                              {t(`pages.useCases.metrics.${m.key}`)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Plan */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 mb-6">
                        <span className="text-sm font-medium">{uc.plan}</span>
                        <span className="text-sm font-bold">{uc.price}€/{t("landing.pricing.month")}</span>
                      </div>

                      <Link to="/auth?tab=signup">
                        <Button className="w-full" variant={uc.key === "enterprise" ? "hero" : "outline"} size="lg">
                          {t("pages.useCases.startTrial")}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Before / After Comparison */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="agent" className="mb-4">
                <BarChart3 className="w-3 h-3 mr-1" />
                {t("pages.useCases.comparisonBadge")}
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                {t("pages.useCases.comparisonTitle")}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t("pages.useCases.comparisonSubtitle")}
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {BEFORE_AFTER.map((item) => (
                <Card key={item.key}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">
                      {t(`pages.useCases.comparison.${item.key}.task`)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-destructive" />
                          <span className="text-sm font-semibold text-destructive">
                            {t("pages.useCases.humanTeam")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {t(`pages.useCases.comparison.${item.key}.humanTime`)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t(`pages.useCases.comparison.${item.key}.humanCost`)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            Growth OS
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {t(`pages.useCases.comparison.${item.key}.aiTime`)}
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
                          {t(`pages.useCases.comparison.${item.key}.aiSaving`)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-8">
              {t("pages.useCases.comparisonDisclaimer")}
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("pages.useCases.ctaTitle")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {t("pages.useCases.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?tab=signup">
                <Button variant="hero" size="lg">
                  {t("pages.useCases.startTrial")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg">
                  {t("pages.useCases.seePricing")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
