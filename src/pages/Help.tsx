import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEOHead } from "@/components/SEOHead";
import {
  Search, ChevronDown, ChevronUp, BookOpen,
  HelpCircle, MessageCircle, ArrowRight, Bot
} from "lucide-react";

interface HelpArticle {
  id: string;
  category: string;
  question: Record<string, string>;
  answer: Record<string, string>;
}

const HELP_CATEGORIES = [
  { id: "getting-started", labelFr: "Premiers pas", labelEn: "Getting Started", icon: BookOpen },
  { id: "agents", labelFr: "Agents IA", labelEn: "AI Agents", icon: Bot },
  { id: "billing", labelFr: "Facturation", labelEn: "Billing", icon: HelpCircle },
  { id: "integrations", labelFr: "Intégrations", labelEn: "Integrations", icon: HelpCircle },
  { id: "security", labelFr: "Sécurité", labelEn: "Security", icon: HelpCircle },
  { id: "troubleshooting", labelFr: "Dépannage", labelEn: "Troubleshooting", icon: HelpCircle },
];

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "1", category: "getting-started",
    question: { fr: "Comment créer mon compte Growth OS ?", en: "How do I create my Growth OS account?" },
    answer: { fr: "Rendez-vous sur la page de connexion et cliquez sur 'Créer un compte'. Renseignez votre email et mot de passe, puis suivez le guide d'onboarding pour configurer votre workspace.", en: "Go to the login page and click 'Create account'. Enter your email and password, then follow the onboarding guide to set up your workspace." },
  },
  {
    id: "2", category: "getting-started",
    question: { fr: "Comment lancer mon premier audit SEO ?", en: "How do I launch my first SEO audit?" },
    answer: { fr: "Depuis la page d'accueil, collez votre URL dans le champ d'analyse. L'agent Tech SEO Auditor analysera votre site en quelques secondes et génèrera un rapport complet.", en: "From the homepage, paste your URL in the analysis field. The Tech SEO Auditor agent will analyze your site in seconds and generate a complete report." },
  },
  {
    id: "3", category: "getting-started",
    question: { fr: "Quelle est la durée de l'essai gratuit ?", en: "How long is the free trial?" },
    answer: { fr: "L'essai gratuit dure 14 jours et inclut l'accès complet à tous les agents et départements. Aucune carte bancaire n'est requise.", en: "The free trial lasts 14 days and includes full access to all agents and departments. No credit card required." },
  },
  {
    id: "4", category: "agents",
    question: { fr: "Combien d'agents IA sont disponibles ?", en: "How many AI agents are available?" },
    answer: { fr: "Growth OS dispose de des modules growth connectés couvrant Marketing, Commercial, Finance, Sécurité et plus.", en: "Growth OS has connected growth modules covering Marketing, Sales, Finance, Security and more." },
  },
  {
    id: "5", category: "agents",
    question: { fr: "Comment fonctionne le système d'approbation ?", en: "How does the approval system work?" },
    answer: { fr: "Certains agents nécessitent votre approbation avant d'exécuter des actions à risque. Vous recevrez une notification et pourrez approuver ou rejeter l'action depuis votre dashboard.", en: "Some agents require your approval before executing risky actions. You'll receive a notification and can approve or reject the action from your dashboard." },
  },
  {
    id: "6", category: "agents",
    question: { fr: "Comment sont priorisées les recommandations ?", en: "How are recommendations prioritized?" },
    answer: { fr: "Chaque recommandation est classée selon trois critères : son impact potentiel sur votre activité, le niveau de confiance dans le résultat attendu, et la facilité de mise en œuvre. Ce système de scoring permet de vous concentrer sur les actions les plus rentables en premier.", en: "Each recommendation is ranked based on three criteria: its potential impact on your business, the confidence level in the expected result, and the ease of implementation. This scoring system helps you focus on the most valuable actions first." },
  },
  {
    id: "7", category: "billing",
    question: { fr: "Quels sont les plans disponibles ?", en: "What plans are available?" },
    answer: { fr: "3 plans : Solo à 490€/mois (1 workspace, signaux connectés), À la carte à 1 900€/département/mois, et Scale sur devis (gouvernance avancée, monitoring cross-canal).", en: "3 plans: Solo at €490/month (1 workspace, connected signals), À la carte at €1,900/department/month, and Scale on request (advanced governance, cross-channel monitoring)." },
  },
  {
    id: "8", category: "billing",
    question: { fr: "Comment changer de plan ?", en: "How do I change plans?" },
    answer: { fr: "Rendez-vous dans Dashboard > Facturation. Vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement.", en: "Go to Dashboard > Billing. You can upgrade or downgrade your plan at any time. The change takes effect immediately." },
  },
  {
    id: "9", category: "integrations",
    question: { fr: "Quelles intégrations sont disponibles ?", en: "What integrations are available?" },
    answer: { fr: "Growth OS s'intègre avec Google Analytics 4, Google Search Console, Google Ads, Google Business Profile, Meta Business API (Facebook/Instagram), et votre CMS.", en: "Growth OS integrates with Google Analytics 4, Google Search Console, Google Ads, Google Business Profile, Meta Business API (Facebook/Instagram), and your CMS." },
  },
  {
    id: "10", category: "integrations",
    question: { fr: "Comment connecter Google Analytics ?", en: "How do I connect Google Analytics?" },
    answer: { fr: "Depuis Dashboard > Intégrations, cliquez sur 'Connecter Google Analytics'. Autorisez l'accès via OAuth et sélectionnez la propriété à surveiller.", en: "From Dashboard > Integrations, click 'Connect Google Analytics'. Authorize access via OAuth and select the property to monitor." },
  },
  {
    id: "11", category: "security",
    question: { fr: "Mes données sont-elles sécurisées ?", en: "Is my data secure?" },
    answer: { fr: "Oui. Growth OS utilise le chiffrement AES-256, est hébergé en Europe, conforme RGPD, avec un audit trail complet et un RBAC à 5 niveaux. SOC 2 en cours.", en: "Yes. Growth OS uses AES-256 encryption, is hosted in Europe, GDPR compliant, with complete audit trail and 5-level RBAC. SOC 2 in progress." },
  },
  {
    id: "12", category: "security",
    question: { fr: "Comment fonctionne le RBAC ?", en: "How does RBAC work?" },
    answer: { fr: "5 niveaux : Owner (accès total), Admin (gestion), Editor (modification), Viewer (lecture seule), Guest (accès limité). Chaque rôle a des permissions spécifiques.", en: "5 levels: Owner (full access), Admin (management), Editor (modification), Viewer (read-only), Guest (limited access). Each role has specific permissions." },
  },
  {
    id: "13", category: "troubleshooting",
    question: { fr: "Un agent ne fonctionne pas, que faire ?", en: "An agent isn't working, what should I do?" },
    answer: { fr: "Vérifiez d'abord que le service associé est activé dans votre plan. Ensuite, consultez Dashboard > Diagnostics pour voir l'état de l'agent. Si le problème persiste, contactez le support.", en: "First check that the associated service is enabled in your plan. Then check Dashboard > Diagnostics to see the agent status. If the problem persists, contact support." },
  },
  {
    id: "14", category: "troubleshooting",
    question: { fr: "L'application est lente, comment résoudre ?", en: "The app is slow, how to fix?" },
    answer: { fr: "Videz le cache de votre navigateur, vérifiez votre connexion internet, et assurez-vous d'utiliser un navigateur moderne (Chrome, Firefox, Safari, Edge).", en: "Clear your browser cache, check your internet connection, and make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)." },
  },
];

export default function Help() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    return HELP_ARTICLES.filter((article) => {
      const matchesSearch =
        !searchQuery ||
        article.question[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.answer[lang].toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, lang]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HELP_ARTICLES.map((article) => ({
      "@type": "Question",
      name: article.question[lang],
      acceptedAnswer: { "@type": "Answer", text: article.answer[lang] },
    })),
  };

  return (
    <>
      <SEOHead
        title={lang === "fr" ? "Centre d'aide" : "Help Center"}
        description={
          lang === "fr"
            ? "Base de connaissances Growth OS. Trouvez des réponses à vos questions."
            : "Growth OS knowledge base. Find answers to your questions."
        }
        canonical="/help"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative text-center">
            <Badge variant="agent" className="mb-4">
              <HelpCircle className="w-3 h-3 mr-1" />
              {lang === "fr" ? "Centre d'aide" : "Help Center"}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {lang === "fr" ? "Comment pouvons-nous " : "How can we "}
              <span className="gradient-text">
                {lang === "fr" ? "vous aider ?" : "help you?"}
              </span>
            </h1>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={
                  lang === "fr"
                    ? "Rechercher dans la base de connaissances..."
                    : "Search the knowledge base..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                {lang === "fr" ? "Toutes les catégories" : "All categories"}
              </Button>
              {HELP_CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                >
                  {lang === "fr" ? cat.labelFr : cat.labelEn}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Articles */}
        <section className="py-8 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-3">
              {filteredArticles.map((article) => {
                const isExpanded = expandedArticle === article.id;
                const category = HELP_CATEGORIES.find((c) => c.id === article.category);
                return (
                  <Card
                    key={article.id}
                    className="cursor-pointer hover:border-primary/30 transition-all"
                    onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">
                              {lang === "fr" ? category?.labelFr : category?.labelEn}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-sm">{article.question[lang]}</h3>
                          {isExpanded && (
                            <p className="text-sm text-muted-foreground mt-3 animate-fade-in">
                              {article.answer[lang]}
                            </p>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {lang === "fr" ? "Aucun résultat" : "No results"}
                </h3>
                <p className="text-muted-foreground">
                  {lang === "fr"
                    ? "Essayez d'autres termes de recherche."
                    : "Try different search terms."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              {lang === "fr" ? "Besoin d'aide supplémentaire ?" : "Need more help?"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {lang === "fr"
                ? "Notre équipe support est disponible pour vous aider."
                : "Our support team is available to help you."}
            </p>
            <Link to="/contact">
              <Button variant="hero" size="lg">
                {lang === "fr" ? "Contacter le support" : "Contact support"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
