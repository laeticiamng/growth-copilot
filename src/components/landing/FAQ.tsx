import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const faqsFr = [
    {
      question: "Comment fonctionne l'audit gratuit ?",
      answer: "Tu entres ton URL, on analyse automatiquement ton site (technique, contenu, performance, concurrence). En 2 minutes, tu reçois un rapport détaillé avec les opportunités prioritaires et un plan d'action. Aucune carte bancaire requise.",
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Nous utilisons OAuth pour les connexions (Google, Meta), tes tokens sont chiffrés, et nous ne stockons jamais tes mots de passe. Conformité RGPD garantie avec export et suppression sur demande.",
    },
    {
      question: "Qu'est-ce que le mode Autopilot ?",
      answer: "Le mode Autopilot permet aux agents IA d'exécuter automatiquement certaines actions (corrections SEO, ajustements Ads, posts locaux). Il est OFF par défaut et tu gardes toujours le contrôle avec des garde-fous stricts (budgets max, validation humaine pour actions à risque).",
    },
    {
      question: "Puis-je connecter mon CMS (WordPress, Shopify) ?",
      answer: "Oui ! Si ton CMS est connecté, nos agents peuvent appliquer automatiquement les corrections SEO techniques. Sinon, on génère des patchs et instructions à copier-coller.",
    },
    {
      question: "Garantissez-vous des résultats SEO ?",
      answer: "Non, personne ne peut garantir un ranking Google spécifique (et méfie-toi de ceux qui le promettent). Ce qu'on garantit : un processus d'optimisation continue, des actions basées sur les meilleures pratiques, et une transparence totale sur ce qui est fait et les résultats obtenus.",
    },
    {
      question: "Comment fonctionnent les agents IA ?",
      answer: "14 agents spécialisés (SEO, Ads, Local, CRO, etc.) travaillent en parallèle, orchestrés par un 'Directeur' qui priorise selon tes objectifs. Un agent Vérificateur contrôle la qualité et la conformité de chaque action avant exécution.",
    },
    {
      question: "Puis-je annuler à tout moment ?",
      answer: "Oui, sans engagement. Tu peux annuler ton abonnement à tout moment depuis ton dashboard. Tes données restent accessibles pendant 30 jours après annulation.",
    },
  ];

  const faqsEn = [
    {
      question: "How does the free audit work?",
      answer: "You enter your URL, we automatically analyze your site (technical, content, performance, competition). In 2 minutes, you receive a detailed report with priority opportunities and an action plan. No credit card required.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use OAuth for connections (Google, Meta), your tokens are encrypted, and we never store your passwords. GDPR compliance guaranteed with export and deletion on request.",
    },
    {
      question: "What is Autopilot mode?",
      answer: "Autopilot mode allows AI agents to automatically execute certain actions (SEO fixes, Ads adjustments, local posts). It's OFF by default and you always keep control with strict guardrails (max budgets, human validation for risky actions).",
    },
    {
      question: "Can I connect my CMS (WordPress, Shopify)?",
      answer: "Yes! If your CMS is connected, our agents can automatically apply technical SEO fixes. Otherwise, we generate patches and copy-paste instructions.",
    },
    {
      question: "Do you guarantee SEO results?",
      answer: "No, nobody can guarantee a specific Google ranking (and beware of those who promise it). What we guarantee: a continuous optimization process, actions based on best practices, and total transparency on what is done and results obtained.",
    },
    {
      question: "How do AI agents work?",
      answer: "14 specialized agents (SEO, Ads, Local, CRO, etc.) work in parallel, orchestrated by a 'Director' who prioritizes according to your objectives. A Verifier agent controls the quality and compliance of each action before execution.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, no commitment. You can cancel your subscription anytime from your dashboard. Your data remains accessible for 30 days after cancellation.",
    },
  ];

  const faqs = isEn ? faqsEn : faqsFr;

  return (
    <section id="faq" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            {t("landing.navbar.faq")}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t("landing.faq.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("landing.faq.subtitle")}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
