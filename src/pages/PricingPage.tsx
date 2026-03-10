import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { DEPARTMENTS_CATALOG } from "@/data/agents-catalog";
import {
  Check, X, ArrowRight, Crown, Puzzle, TrendingUp,
  Sparkles, Users, Bot, Calculator, ChevronDown, ChevronUp, Settings,
  Briefcase, Target, Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_AGENTS = 39;
const TOTAL_DEPARTMENTS = 11;

const COMPARISON_KEYS = [
  { key: "aiEmployees", starter: "11 (lite)", alacarte: "3-5 / dept", full: "39" },
  { key: "departments", starter: `${TOTAL_DEPARTMENTS} (limités)`, alacarte: "Au choix", full: `${TOTAL_DEPARTMENTS} complets` },
  { key: "runs", starter: "50", alacarte: "500 / dept", full: "∞" },
  { key: "sites", starter: "1", alacarte: "3 / dept", full: "∞" },
  { key: "users", starter: "2", alacarte: "5 / dept", full: "∞" },
  { key: "approvals", starter: true, alacarte: true, full: true },
  { key: "auditLog", starter: true, alacarte: true, full: true },
  { key: "integrations", starter: "1", alacarte: true, full: true },
  { key: "cgo", starter: false, alacarte: false, full: true },
  { key: "api", starter: false, alacarte: true, full: true },
  { key: "webhooks", starter: false, alacarte: true, full: true },
  { key: "priority", starter: false, alacarte: true, full: true },
  { key: "sla", starter: false, alacarte: false, full: true },
  { key: "dedicated", starter: false, alacarte: false, full: true },
  { key: "custom", starter: false, alacarte: false, full: true },
  { key: "whitelabel", starter: false, alacarte: false, full: true },
];

export default function PricingPage() {
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [teamSize, setTeamSize] = useState([5]);

  const avgSalary = 4500;
  const equivalentCost = teamSize[0] * avgSalary;
  // Fix ROI calculator: add à la carte tier
  const deptCount = Math.min(Math.ceil(teamSize[0] / 3.5), TOTAL_DEPARTMENTS);
  const growthOsCost = teamSize[0] <= 11 
    ? 490 
    : deptCount <= 4 
      ? deptCount * 1900 
      : 9000;
  const savings = equivalentCost - growthOsCost;
  const savingsPercent = Math.round((savings / equivalentCost) * 100);
  const planLabel = teamSize[0] <= 11 
    ? "Starter" 
    : deptCount <= 4 
      ? t("pages.pricingPage.alacarteLabel", { count: deptCount })
      : "Full Company";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("pages.pricingPage.seoTitle"),
    description: t("pages.pricingPage.seoDescription"),
    offers: [
      { "@type": "Offer", name: "Starter", price: "490", priceCurrency: "EUR" },
      { "@type": "Offer", name: "À la carte", price: "1900", priceCurrency: "EUR" },
      { "@type": "Offer", name: "Full Company", price: "9000", priceCurrency: "EUR" },
    ],
  };

  const faqKeys = Array.from({ length: 10 }, (_, i) => i + 1);

  // Use cases instead of fake testimonials
  const useCases = [
    { icon: TrendingUp, key: "useCase1" },
    { icon: Briefcase, key: "useCase2" },
    { icon: Lightbulb, key: "useCase3" },
  ];

  return (
    <>
      <SEOHead
        title={t("pages.pricingPage.seoTitle")}
        description={t("pages.pricingPage.seoDescription")}
        canonical="/pricing"
        structuredData={structuredData}
      />

      <Navbar />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 pt-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative text-center">
            <Badge variant="agent" className="mb-4">
              {t("pages.pricingPage.transparentPricing")}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("pages.pricingPage.heroTitle")}{" "}
              <span className="gradient-text">
                {t("pages.pricingPage.heroTitleHighlight")}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              {t("pages.pricingPage.heroSubtitle", { agents: TOTAL_AGENTS, departments: TOTAL_DEPARTMENTS })}
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
              {/* Starter */}
              <Card className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="secondary" className="px-3 py-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                    {t("landing.pricing.trialBadge")}
                  </Badge>
                </div>
                <CardHeader className="text-center pt-10 pb-2">
                  <div className="mx-auto p-3 rounded-xl bg-green-500/10 w-fit mb-4">
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription className="text-base">
                    {t("landing.pricing.starterDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-5xl font-bold">490€</span>
                    <span className="text-muted-foreground">/{t("landing.pricing.month")}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Badge variant="secondary" className="text-sm"><Bot className="w-3 h-3 mr-1" />11 agents (lite)</Badge>
                  </div>
                  <ul className="space-y-2 mb-8 text-left">
                    {[
                      t("landing.pricing.starterF1", { depts: TOTAL_DEPARTMENTS }),
                      t("landing.pricing.starterF2"),
                      t("landing.pricing.starterF3"),
                      t("landing.pricing.starterF4"),
                      t("landing.pricing.starterF5"),
                      t("landing.pricing.starterF6"),
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /><span>{f}</span></li>
                    ))}
                  </ul>
                  <Link to="/auth?tab=signup">
                    <Button variant="outline" className="w-full" size="lg">
                      {t("landing.pricing.starterCTA")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Full Company */}
              <Card className="relative border-2 border-primary/30">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="gradient" className="px-3 py-1 whitespace-nowrap text-xs">
                    <Sparkles className="w-3 h-3 mr-1 shrink-0" />
                    {t("landing.pricing.bestValue")}
                  </Badge>
                </div>
                <CardHeader className="text-center pt-10 pb-2">
                  <div className="mx-auto p-3 rounded-xl bg-gradient-to-br from-primary to-accent w-fit mb-4">
                    <Crown className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Full Company</CardTitle>
                  <CardDescription className="text-base">
                    {t("landing.pricing.fullCompanyDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-5xl font-bold">9 000€</span>
                    <span className="text-muted-foreground">/{t("landing.pricing.month")}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-sm"><Users className="w-3 h-3 mr-1" />{TOTAL_AGENTS} agents</Badge>
                    <Badge variant="outline" className="text-sm">{TOTAL_DEPARTMENTS} {t("landing.pricing.departments")}</Badge>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-6">
                    {t("landing.pricing.fullCompanySavings", { amount: (TOTAL_DEPARTMENTS * 1900 - 9000).toLocaleString() })}
                  </p>
                  <ul className="space-y-2 mb-8 text-left">
                    {[
                      t("landing.pricing.fullF1", { total: TOTAL_AGENTS }),
                      t("landing.pricing.fullF2", { depts: TOTAL_DEPARTMENTS }),
                      t("landing.pricing.fullF3"),
                      t("landing.pricing.fullF4"),
                      t("landing.pricing.fullF5"),
                      t("landing.pricing.fullF6"),
                      t("landing.pricing.fullF7"),
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary flex-shrink-0" /><span>{f}</span></li>
                    ))}
                  </ul>
                  <Link to="/auth?tab=signup">
                    <Button variant="hero" className="w-full" size="lg">
                      {t("landing.pricing.fullCTA")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* À la carte */}
              <Card className="relative">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto p-3 rounded-xl bg-secondary w-fit mb-4">
                    <Puzzle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl">À la carte</CardTitle>
                  <CardDescription className="text-base">
                    {t("landing.pricing.aLaCarteDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-5xl font-bold">1 900€</span>
                    <span className="text-muted-foreground">/{t("landing.pricing.deptMonth")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    {t("landing.pricing.aLaCarteNote")}
                  </p>
                  <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2">
                    {DEPARTMENTS_CATALOG.filter((d) => d.slug !== "direction").map((dept) => {
                      const DeptIcon = dept.icon;
                      return (
                        <div key={dept.slug} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-left">
                          <div className="flex items-center gap-2">
                            <DeptIcon className="w-4 h-4" style={{ color: dept.color }} />
                            <span className="text-xs font-medium">{dept.name[typeof dept.name === 'object' ? 'fr' : 'fr'] || dept.slug}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{dept.agentCount} agents</span>
                        </div>
                      );
                    })}
                  </div>
                  <Link to="/auth?tab=signup">
                    <Button variant="outline" className="w-full" size="lg">
                      {t("landing.pricing.buildTeam")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Core OS Note */}
            <div className="max-w-4xl mx-auto mt-8">
              <Card className="border-dashed">
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                    <div className="p-3 rounded-xl bg-primary/10"><Settings className="w-6 h-6 text-primary" /></div>
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Core OS {t("landing.pricing.coreOSAlways")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("landing.pricing.coreOSDesc")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm px-3">{t("landing.pricing.included")}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              {t("pages.pricingPage.comparisonTitle")}
            </h2>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full max-w-4xl mx-auto min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold">{t("pages.pricingPage.feature")}</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold">Starter<br /><span className="text-xs font-normal text-muted-foreground">490€</span></th>
                    <th className="text-center py-3 px-4 text-sm font-semibold">À la carte<br /><span className="text-xs font-normal text-muted-foreground">1 900€/dept</span></th>
                    <th className="text-center py-3 px-4 text-sm font-semibold bg-primary/5 rounded-t-lg">Full Company<br /><span className="text-xs font-normal text-muted-foreground">9 000€</span></th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_KEYS.map((feat, i) => (
                    <tr key={feat.key} className={cn("border-b border-border/50", i % 2 === 0 && "bg-secondary/20")}>
                      <td className="py-3 px-4 text-sm">{t(`pages.pricingPage.comparison.${feat.key}`)}</td>
                      <td className="text-center py-3 px-4">
                        {typeof feat.starter === "boolean" ? (
                          feat.starter ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        ) : (
                          <span className="text-xs">{feat.starter}</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {typeof feat.alacarte === "boolean" ? (
                          feat.alacarte ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        ) : (
                          <span className="text-xs">{feat.alacarte}</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 bg-primary/5">
                        {typeof feat.full === "boolean" ? (
                          feat.full ? <Check className="w-4 h-4 text-primary mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        ) : (
                          <span className="text-xs font-semibold">{feat.full}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <Badge variant="agent" className="mb-4">
                <Calculator className="w-3 h-3 mr-1" />
                {t("pages.pricingPage.roiCalculator")}
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                {t("pages.pricingPage.roiTitle")}
              </h2>
              <p className="text-muted-foreground">
                {t("pages.pricingPage.roiSubtitle")}
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-4 sm:p-8">
                <div className="mb-8">
                  <label className="text-sm font-medium mb-4 block">
                    {t("pages.pricingPage.teamSizeLabel", { count: teamSize[0] })}
                  </label>
                  <Slider
                    value={teamSize}
                    onValueChange={setTeamSize}
                    min={1}
                    max={39}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1</span>
                    <span>39</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-xs text-muted-foreground mb-1">{t("pages.pricingPage.humanCost")}</p>
                    <p className="text-2xl font-bold text-red-500">{equivalentCost.toLocaleString()}€<span className="text-sm font-normal">/{t("landing.pricing.month")}</span></p>
                    <p className="text-xs text-muted-foreground">{teamSize[0]} x {avgSalary.toLocaleString()}€</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                    <p className="text-xs text-muted-foreground mb-1">{t("pages.pricingPage.growthOsCost")}</p>
                    <p className="text-2xl font-bold text-green-500">{growthOsCost.toLocaleString()}€<span className="text-sm font-normal">/{t("landing.pricing.month")}</span></p>
                    <p className="text-xs text-muted-foreground">{planLabel}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-center">
                  <p className="text-sm text-muted-foreground mb-1">{t("pages.pricingPage.monthlySavings")}</p>
                  <p className="text-3xl font-bold gradient-text">{savings > 0 ? `${savings.toLocaleString()}€` : "—"}</p>
                  {savings > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t("pages.pricingPage.savingsPercent", { percent: savingsPercent })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Use Cases (replaces fake testimonials) */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              {t("pages.pricingPage.useCasesTitle")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {useCases.map((uc, i) => (
                <Card key={uc.key} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <CardContent className="p-6">
                    <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                      <uc.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{t(`pages.pricingPage.${uc.key}Title`)}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t(`pages.pricingPage.${uc.key}Desc`)}</p>
                    <Badge variant="outline" className="text-xs">
                      <Target className="w-3 h-3 mr-1" />
                      {t(`pages.pricingPage.${uc.key}Plan`)}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-6 italic">
              {t("pages.pricingPage.useCasesDisclaimer")}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-8">
              {t("pages.pricingPage.faqTitle")}
            </h2>
            <div className="space-y-3">
              {faqKeys.map((i) => (
                <Card
                  key={i}
                  className="cursor-pointer hover:border-primary/30 transition-all"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold text-sm">{t(`pages.pricingPage.faq.q${i}`)}</h3>
                      {expandedFaq === i ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    {expandedFaq === i && (
                      <p className="text-sm text-muted-foreground mt-3 animate-fade-in">
                        {t(`pages.pricingPage.faq.a${i}`)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA - No fake claims */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("pages.pricingPage.finalCtaTitle")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              {t("pages.pricingPage.finalCtaSubtitle")}
            </p>
            <Link to="/auth?tab=signup">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                {t("pages.pricingPage.finalCtaButton")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              {t("pages.pricingPage.finalCtaNote")}
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
