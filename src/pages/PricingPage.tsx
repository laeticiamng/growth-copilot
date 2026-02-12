import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SEOHead } from "@/components/SEOHead";
import { DEPARTMENTS_CATALOG } from "@/data/agents-catalog";
import {
  Check, X, ArrowRight, Crown, Puzzle, TrendingUp,
  Sparkles, Users, Bot, Calculator, Star, ChevronDown, ChevronUp, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_AGENTS = 39;
const TOTAL_DEPARTMENTS = 11;

const COMPARISON_FEATURES = [
  { key: "aiEmployees", fr: "Employés IA", en: "AI Employees", starter: "11 (lite)", alacarte: "3-5 / dept", full: "39" },
  { key: "departments", fr: "Départements", en: "Departments", starter: `${TOTAL_DEPARTMENTS} (limités)`, alacarte: "Au choix", full: `${TOTAL_DEPARTMENTS} complets` },
  { key: "runs", fr: "Exécutions / mois", en: "Runs / month", starter: "50", alacarte: "500 / dept", full: "Illimité" },
  { key: "sites", fr: "Sites", en: "Sites", starter: "1", alacarte: "3 / dept", full: "Illimité" },
  { key: "users", fr: "Utilisateurs", en: "Users", starter: "2", alacarte: "5 / dept", full: "Illimité" },
  { key: "approvals", fr: "Système d'approbation", en: "Approval system", starter: true, alacarte: true, full: true },
  { key: "auditLog", fr: "Audit trail", en: "Audit trail", starter: true, alacarte: true, full: true },
  { key: "integrations", fr: "Intégrations (Google, Meta)", en: "Integrations (Google, Meta)", starter: "1", alacarte: true, full: true },
  { key: "cgo", fr: "CGO (Chief Growth Officer)", en: "CGO (Chief Growth Officer)", starter: false, alacarte: false, full: true },
  { key: "api", fr: "Accès API", en: "API access", starter: false, alacarte: true, full: true },
  { key: "webhooks", fr: "Webhooks", en: "Webhooks", starter: false, alacarte: true, full: true },
  { key: "priority", fr: "Support prioritaire", en: "Priority support", starter: false, alacarte: true, full: true },
  { key: "sla", fr: "SLA garanti", en: "Guaranteed SLA", starter: false, alacarte: false, full: true },
  { key: "dedicated", fr: "Account manager dédié", en: "Dedicated account manager", starter: false, alacarte: false, full: true },
  { key: "custom", fr: "Agents personnalisés", en: "Custom agents", starter: false, alacarte: false, full: true },
  { key: "whitelabel", fr: "Mode agence / white-label", en: "Agency / white-label mode", starter: false, alacarte: false, full: true },
];

const PRICING_FAQ = [
  {
    q: { fr: "Puis-je essayer Growth OS gratuitement ?", en: "Can I try Growth OS for free?" },
    a: { fr: "Oui ! Nous offrons un essai gratuit de 14 jours avec accès complet à tous les agents et départements. Aucune carte bancaire requise.", en: "Yes! We offer a 14-day free trial with full access to all agents and departments. No credit card required." },
  },
  {
    q: { fr: "Puis-je changer de plan à tout moment ?", en: "Can I change plans at any time?" },
    a: { fr: "Absolument. Vous pouvez upgrader, downgrader ou modifier vos départements à tout moment. Les changements prennent effet immédiatement.", en: "Absolutely. You can upgrade, downgrade or modify your departments at any time. Changes take effect immediately." },
  },
  {
    q: { fr: "Que se passe-t-il après l'essai gratuit ?", en: "What happens after the free trial?" },
    a: { fr: "À la fin de l'essai, vous choisissez votre plan. Si vous ne souscrivez pas, votre compte reste accessible en lecture seule.", en: "At the end of the trial, you choose your plan. If you don't subscribe, your account remains accessible in read-only mode." },
  },
  {
    q: { fr: "Les prix sont-ils HT ou TTC ?", en: "Are prices tax-inclusive or exclusive?" },
    a: { fr: "Les prix affichés sont HT (hors taxes). La TVA applicable sera ajoutée lors de la facturation selon votre localisation.", en: "Displayed prices are tax-exclusive. Applicable VAT will be added during billing based on your location." },
  },
  {
    q: { fr: "Quel est le coût d'un employé humain équivalent ?", en: "What is the cost of an equivalent human employee?" },
    a: { fr: "Le salaire moyen d'un spécialiste marketing en France est d'environ 4 500€/mois. Avec Growth OS Full Company, vous obtenez 39 agents pour 9 000€/mois, soit une économie potentielle de plus de 166 500€/mois.", en: "The average salary of a marketing specialist in France is about €4,500/month. With Growth OS Full Company, you get 39 agents for €9,000/month, a potential saving of over €166,500/month." },
  },
  {
    q: { fr: "Y a-t-il un engagement minimum ?", en: "Is there a minimum commitment?" },
    a: { fr: "Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment et le service reste actif jusqu'à la fin de la période payée.", en: "No, all our plans are commitment-free. You can cancel at any time and the service remains active until the end of the paid period." },
  },
  {
    q: { fr: "Comment fonctionne le plan À la carte ?", en: "How does the À la carte plan work?" },
    a: { fr: "Vous sélectionnez les départements dont vous avez besoin. Chaque département coûte 1 900€/mois et inclut tous les agents du département.", en: "You select the departments you need. Each department costs €1,900/month and includes all department agents." },
  },
  {
    q: { fr: "Mes données sont-elles sécurisées ?", en: "Is my data secure?" },
    a: { fr: "Oui. Chiffrement AES-256, hébergement européen, conformité RGPD, audit trail complet et RBAC à 5 niveaux.", en: "Yes. AES-256 encryption, European hosting, GDPR compliance, complete audit trail and 5-level RBAC." },
  },
  {
    q: { fr: "Proposez-vous des réductions pour les startups ?", en: "Do you offer startup discounts?" },
    a: { fr: "Oui ! Contactez-nous pour notre programme startup avec jusqu'à 50% de réduction la première année.", en: "Yes! Contact us for our startup program with up to 50% discount in the first year." },
  },
  {
    q: { fr: "Les agents travaillent-ils vraiment 24/7 ?", en: "Do agents really work 24/7?" },
    a: { fr: "Oui, les agents IA sont disponibles en permanence. Ils exécutent les tâches, génèrent des rapports et envoient des alertes 24 heures sur 24, 7 jours sur 7.", en: "Yes, AI agents are available around the clock. They execute tasks, generate reports and send alerts 24/7." },
  },
];

const TESTIMONIALS = [
  {
    name: "Marie D.",
    role: { fr: "CMO, TechStartup", en: "CMO, TechStartup" },
    plan: "Full Company",
    quote: { fr: "Nos 39 agents IA couvrent 11 départements et ont généré +340% de trafic organique en 4 mois.", en: "Our 39 AI agents cover 11 departments and generated +340% organic traffic in 4 months." },
    rating: 5,
  },
  {
    name: "Laurent P.",
    role: { fr: "CEO, AgenceDigitale", en: "CEO, DigitalAgency" },
    plan: "À la carte",
    quote: { fr: "Le département Marketing seul nous a permis d'économiser 15 000€/mois en frais d'agence.", en: "The Marketing department alone saved us €15,000/month in agency fees." },
    rating: 5,
  },
  {
    name: "Sophie T.",
    role: { fr: "Fondatrice, E-commerce", en: "Founder, E-commerce" },
    plan: "Starter",
    quote: { fr: "Le plan Starter est parfait pour démarrer. L'audit SEO automatique a immédiatement identifié 47 corrections critiques.", en: "The Starter plan is perfect to get started. The automatic SEO audit immediately identified 47 critical fixes." },
    rating: 5,
  },
];

export default function PricingPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [teamSize, setTeamSize] = useState([5]);

  const avgSalary = 4500;
  const equivalentCost = teamSize[0] * avgSalary;
  const growthOsCost = teamSize[0] <= 11 ? 490 : teamSize[0] <= 20 ? 9000 : 9000;
  const savings = equivalentCost - growthOsCost;
  const savingsPercent = Math.round((savings / equivalentCost) * 100);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: lang === "fr" ? "Tarifs - Growth OS" : "Pricing - Growth OS",
    description: lang === "fr"
      ? "Plans et tarifs Growth OS : Starter 490€, À la carte 1 900€, Full Company 9 000€."
      : "Growth OS plans and pricing: Starter €490, À la carte €1,900, Full Company €9,000.",
    offers: [
      { "@type": "Offer", name: "Starter", price: "490", priceCurrency: "EUR" },
      { "@type": "Offer", name: "À la carte", price: "1900", priceCurrency: "EUR" },
      { "@type": "Offer", name: "Full Company", price: "9000", priceCurrency: "EUR" },
    ],
  };

  return (
    <>
      <SEOHead
        title={lang === "fr" ? "Tarifs" : "Pricing"}
        description={
          lang === "fr"
            ? "Plans et tarifs Growth OS. Essai gratuit 14 jours."
            : "Growth OS plans and pricing. 14-day free trial."
        }
        canonical="/pricing"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative text-center">
            <Badge variant="agent" className="mb-4">
              {lang === "fr" ? "Tarifs transparents" : "Transparent pricing"}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {lang === "fr" ? "Investissez dans votre " : "Invest in your "}
              <span className="gradient-text">
                {lang === "fr" ? "croissance" : "growth"}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              {lang === "fr"
                ? `${TOTAL_AGENTS} agents IA, ${TOTAL_DEPARTMENTS} départements. Essai gratuit 14 jours, aucune carte requise.`
                : `${TOTAL_AGENTS} AI agents, ${TOTAL_DEPARTMENTS} departments. 14-day free trial, no card required.`}
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Starter */}
              <Card className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="secondary" className="px-3 py-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                    {lang === "fr" ? "14 jours gratuits" : "14 days free"}
                  </Badge>
                </div>
                <CardHeader className="text-center pt-10 pb-2">
                  <div className="mx-auto p-3 rounded-xl bg-green-500/10 w-fit mb-4">
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription className="text-base">
                    {lang === "fr" ? "Pour démarrer avec l'IA" : "Get started with AI"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-5xl font-bold">490€</span>
                    <span className="text-muted-foreground">/{lang === "fr" ? "mois" : "month"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Badge variant="secondary" className="text-sm"><Bot className="w-3 h-3 mr-1" />11 agents (lite)</Badge>
                  </div>
                  <ul className="space-y-2 mb-8 text-left">
                    {[
                      lang === "fr" ? "11 agents (1 par département)" : "11 agents (1 per department)",
                      lang === "fr" ? "50 exécutions / mois" : "50 runs / month",
                      lang === "fr" ? "1 site" : "1 site",
                      lang === "fr" ? "2 utilisateurs" : "2 users",
                      lang === "fr" ? "Approbations & audit trail" : "Approvals & audit trail",
                      lang === "fr" ? "Support email" : "Email support",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /><span>{f}</span></li>
                    ))}
                  </ul>
                  <Link to="/auth?tab=signup">
                    <Button variant="outline" className="w-full" size="lg">
                      {lang === "fr" ? "Commencer gratuitement" : "Start for free"}
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
                    {lang === "fr" ? "Meilleur rapport qualité/prix" : "Best value"}
                  </Badge>
                </div>
                <CardHeader className="text-center pt-10 pb-2">
                  <div className="mx-auto p-3 rounded-xl bg-gradient-to-br from-primary to-accent w-fit mb-4">
                    <Crown className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Full Company</CardTitle>
                  <CardDescription className="text-base">
                    {lang === "fr" ? "L'équipe IA complète" : "The complete AI team"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-5xl font-bold">9 000€</span>
                    <span className="text-muted-foreground">/{lang === "fr" ? "mois" : "month"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-sm"><Users className="w-3 h-3 mr-1" />{TOTAL_AGENTS} agents</Badge>
                    <Badge variant="outline" className="text-sm">{TOTAL_DEPARTMENTS} {lang === "fr" ? "départements" : "departments"}</Badge>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-6">
                    {lang === "fr"
                      ? `Économisez ${(TOTAL_DEPARTMENTS * 1900 - 9000).toLocaleString()}€/mois vs À la carte`
                      : `Save €${(TOTAL_DEPARTMENTS * 1900 - 9000).toLocaleString()}/month vs À la carte`}
                  </p>
                  <ul className="space-y-2 mb-8 text-left">
                    {[
                      lang === "fr" ? `${TOTAL_AGENTS} agents IA (tous les départements)` : `${TOTAL_AGENTS} AI agents (all departments)`,
                      lang === "fr" ? "Exécutions illimitées" : "Unlimited runs",
                      lang === "fr" ? "Sites & utilisateurs illimités" : "Unlimited sites & users",
                      lang === "fr" ? "CGO + Agents personnalisés" : "CGO + Custom agents",
                      lang === "fr" ? "Accès API + Webhooks" : "API access + Webhooks",
                      lang === "fr" ? "SLA garanti + Account manager" : "Guaranteed SLA + Account manager",
                      lang === "fr" ? "Mode agence / white-label" : "Agency / white-label mode",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary flex-shrink-0" /><span>{f}</span></li>
                    ))}
                  </ul>
                  <Link to="/auth?tab=signup">
                    <Button variant="hero" className="w-full" size="lg">
                      {lang === "fr" ? "Essai gratuit 14 jours" : "14-day free trial"}
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
                    {lang === "fr" ? "Composez votre équipe" : "Build your team"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-5xl font-bold">1 900€</span>
                    <span className="text-muted-foreground">/{lang === "fr" ? "dept/mois" : "dept/month"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    {lang === "fr"
                      ? "Choisissez uniquement les départements dont vous avez besoin."
                      : "Choose only the departments you need."}
                  </p>
                  <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2">
                    {DEPARTMENTS_CATALOG.filter((d) => d.slug !== "direction").map((dept) => {
                      const DeptIcon = dept.icon;
                      return (
                        <div key={dept.slug} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-left">
                          <div className="flex items-center gap-2">
                            <DeptIcon className="w-4 h-4" style={{ color: dept.color }} />
                            <span className="text-xs font-medium">{dept.name[lang]}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{dept.agentCount} agents</span>
                        </div>
                      );
                    })}
                  </div>
                  <Link to="/auth?tab=signup">
                    <Button variant="outline" className="w-full" size="lg">
                      {lang === "fr" ? "Composer mon équipe" : "Build my team"}
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
                      <p className="font-semibold mb-1">Core OS {lang === "fr" ? "— Toujours inclus" : "— Always included"}</p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "fr"
                          ? "Workspace, RBAC, Approbations, Audit Logs, Planificateur, Centre d'intégrations — inclus avec chaque formule."
                          : "Workspace, RBAC, Approvals, Audit Logs, Scheduler, Integration Center — included with every plan."}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm px-3">{lang === "fr" ? "Inclus" : "Included"}</Badge>
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
              {lang === "fr" ? "Comparaison détaillée" : "Detailed comparison"}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full max-w-4xl mx-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold">{lang === "fr" ? "Fonctionnalité" : "Feature"}</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold">Starter<br /><span className="text-xs font-normal text-muted-foreground">490€</span></th>
                    <th className="text-center py-3 px-4 text-sm font-semibold">À la carte<br /><span className="text-xs font-normal text-muted-foreground">1 900€/dept</span></th>
                    <th className="text-center py-3 px-4 text-sm font-semibold bg-primary/5 rounded-t-lg">Full Company<br /><span className="text-xs font-normal text-muted-foreground">9 000€</span></th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((feat, i) => (
                    <tr key={feat.key} className={cn("border-b border-border/50", i % 2 === 0 && "bg-secondary/20")}>
                      <td className="py-3 px-4 text-sm">{lang === "fr" ? feat.fr : feat.en}</td>
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
                {lang === "fr" ? "Calculateur ROI" : "ROI Calculator"}
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                {lang === "fr" ? "Combien économisez-vous ?" : "How much do you save?"}
              </h2>
              <p className="text-muted-foreground">
                {lang === "fr"
                  ? "Comparez le coût d'une équipe humaine vs Growth OS."
                  : "Compare the cost of a human team vs Growth OS."}
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="mb-8">
                  <label className="text-sm font-medium mb-4 block">
                    {lang === "fr"
                      ? `Taille de l'équipe à remplacer : ${teamSize[0]} employés`
                      : `Team size to replace: ${teamSize[0]} employees`}
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

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-xs text-muted-foreground mb-1">{lang === "fr" ? "Coût équipe humaine" : "Human team cost"}</p>
                    <p className="text-2xl font-bold text-red-500">{equivalentCost.toLocaleString()}€<span className="text-sm font-normal">/{lang === "fr" ? "mois" : "mo"}</span></p>
                    <p className="text-xs text-muted-foreground">{teamSize[0]} x {avgSalary.toLocaleString()}€</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                    <p className="text-xs text-muted-foreground mb-1">{lang === "fr" ? "Coût Growth OS" : "Growth OS cost"}</p>
                    <p className="text-2xl font-bold text-green-500">{growthOsCost.toLocaleString()}€<span className="text-sm font-normal">/{lang === "fr" ? "mois" : "mo"}</span></p>
                    <p className="text-xs text-muted-foreground">{lang === "fr" ? "Tous les agents inclus" : "All agents included"}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-center">
                  <p className="text-sm text-muted-foreground mb-1">{lang === "fr" ? "Économie mensuelle" : "Monthly savings"}</p>
                  <p className="text-3xl font-bold gradient-text">{savings > 0 ? `${savings.toLocaleString()}€` : "—"}</p>
                  {savings > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {lang === "fr" ? `soit ${savingsPercent}% d'économie` : `that's ${savingsPercent}% savings`}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              {lang === "fr" ? "Ce que disent nos clients" : "What our clients say"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {TESTIMONIALS.map((testimonial, i) => (
                <Card key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: testimonial.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <p className="text-sm mb-4 italic">"{testimonial.quote[lang]}"</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role[lang]}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{testimonial.plan}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-8">
              {lang === "fr" ? "Questions fréquentes" : "Frequently asked questions"}
            </h2>
            <div className="space-y-3">
              {PRICING_FAQ.map((faq, i) => (
                <Card
                  key={i}
                  className="cursor-pointer hover:border-primary/30 transition-all"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold text-sm">{faq.q[lang]}</h3>
                      {expandedFaq === i ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    {expandedFaq === i && (
                      <p className="text-sm text-muted-foreground mt-3 animate-fade-in">
                        {faq.a[lang]}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {lang === "fr"
                ? "Prêt à transformer votre croissance ?"
                : "Ready to transform your growth?"}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              {lang === "fr"
                ? "Essai gratuit 14 jours. Aucune carte bancaire requise. Annulez à tout moment."
                : "14-day free trial. No credit card required. Cancel anytime."}
            </p>
            <Link to="/auth?tab=signup">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                {lang === "fr" ? "Commencer l'essai gratuit" : "Start free trial"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              {lang === "fr"
                ? "Rejoignez plus de 500 entreprises qui automatisent leur croissance."
                : "Join 500+ companies automating their growth."}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
