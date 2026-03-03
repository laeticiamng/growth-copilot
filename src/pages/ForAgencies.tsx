import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building, Users, ShieldCheck, Palette, ArrowRight,
  CheckCircle2, BarChart3, Globe, Settings, Bot, Layers
} from "lucide-react";

const AGENCY_FEATURES = [
  { key: "whiteLabel", icon: Palette },
  { key: "multiClient", icon: Users },
  { key: "approvals", icon: ShieldCheck },
  { key: "reporting", icon: BarChart3 },
  { key: "branding", icon: Globe },
  { key: "automation", icon: Settings },
];

const ROI_METRICS = [
  { key: "clientsManaged", value: "20+", icon: Users },
  { key: "timeSaved", value: "80%", icon: Bot },
  { key: "revenuePerClient", value: "3x", icon: BarChart3 },
  { key: "deployTime", value: "<24h", icon: Layers },
];

export default function ForAgencies() {
  const { t } = useTranslation();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("pages.forAgencies.seoTitle"),
    description: t("pages.forAgencies.seoDescription"),
  };

  return (
    <>
      <SEOHead
        title={t("pages.forAgencies.seoTitle")}
        description={t("pages.forAgencies.seoDescription")}
        canonical="/for-agencies"
        structuredData={structuredData}
      />
      <Navbar />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 pt-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
          <div className="container mx-auto px-4 relative text-center">
            <Badge variant="agent" className="mb-4">
              <Building className="w-3 h-3 mr-1" />
              {t("pages.forAgencies.badge")}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("pages.forAgencies.heroTitle")}{" "}
              <span className="gradient-text">
                {t("pages.forAgencies.heroHighlight")}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("pages.forAgencies.heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?tab=signup">
                <Button variant="hero" size="lg">
                  {t("pages.forAgencies.startTrial")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  {t("pages.forAgencies.contactSales")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="py-12 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {ROI_METRICS.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.key} className="text-center">
                    <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-3xl font-bold">{m.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {t(`pages.forAgencies.metrics.${m.key}`)}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              {t("pages.forAgencies.metricsDisclaimer")}
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t("pages.forAgencies.featuresTitle")}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t("pages.forAgencies.featuresSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {AGENCY_FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <Card key={feat.key} className="hover:border-primary/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {t(`pages.forAgencies.features.${feat.key}.title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t(`pages.forAgencies.features.${feat.key}.description`)}
                      </p>
                      <ul className="space-y-1">
                        {[1, 2, 3].map((i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {t(`pages.forAgencies.features.${feat.key}.point${i}`)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Before / After for Agencies */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="agent" className="mb-4">
                <BarChart3 className="w-3 h-3 mr-1" />
                {t("pages.forAgencies.comparisonBadge")}
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                {t("pages.forAgencies.comparisonTitle")}
              </h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold">
                        {t("pages.forAgencies.comparisonMetric")}
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-destructive">
                        {t("pages.forAgencies.withoutGrowthOS")}
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-green-600 dark:text-green-400 bg-primary/5 rounded-t-lg">
                        {t("pages.forAgencies.withGrowthOS")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {["onboarding", "reporting", "scaling", "margins"].map((key, i) => (
                      <tr key={key} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-secondary/20" : ""}`}>
                        <td className="py-3 px-4 text-sm font-medium">
                          {t(`pages.forAgencies.comparisonRows.${key}.label`)}
                        </td>
                        <td className="text-center py-3 px-4 text-sm text-muted-foreground">
                          {t(`pages.forAgencies.comparisonRows.${key}.without`)}
                        </td>
                        <td className="text-center py-3 px-4 text-sm font-semibold text-green-600 dark:text-green-400 bg-primary/5">
                          {t(`pages.forAgencies.comparisonRows.${key}.with`)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing for Agencies */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t("pages.forAgencies.pricingTitle")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {t("pages.forAgencies.pricingSubtitle")}
            </p>

            <Card className="max-w-md mx-auto border-2 border-primary/30">
              <CardContent className="p-8 text-center">
                <Badge variant="gradient" className="mb-4">
                  {t("pages.forAgencies.recommendedPlan")}
                </Badge>
                <h3 className="text-2xl font-bold mb-2">Full Company</h3>
                <p className="text-muted-foreground mb-4">
                  {t("pages.forAgencies.fullCompanyDesc")}
                </p>
                <div className="mb-6">
                  <span className="text-5xl font-bold">9 000€</span>
                  <span className="text-muted-foreground">/{t("landing.pricing.month")}</span>
                </div>
                <ul className="space-y-2 mb-8 text-left">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{t(`pages.forAgencies.planFeatures.f${i}`)}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth?tab=signup">
                  <Button variant="hero" className="w-full" size="lg">
                    {t("pages.forAgencies.startTrial")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground mt-6">
              {t("pages.forAgencies.customPricing")}
              {" "}
              <Link to="/contact" className="text-primary underline">
                {t("pages.forAgencies.contactUs")}
              </Link>
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
