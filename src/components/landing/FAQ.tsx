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
      question: "Qu'est-ce que la 'Portable Company' ?",
      answer: "C'est une entreprise digitale complète que vous pouvez 'porter' avec vous. 11 départements spécialisés (Marketing, Commercial, Finance, Sécurité...) travaillent en coulisses pour vous livrer des outputs professionnels. Vous n'avez qu'à valider les décisions clés.",
    },
    {
      question: "Quelle est la différence entre Full Company et À la carte ?",
      answer: "Full Company vous donne accès aux 11 départements pour 9 000€/mois. À la carte vous permet de choisir uniquement les départements dont vous avez besoin (à partir de 1 900€/mois par département). Le Core OS (Workspace, Approbations, Audit) est toujours inclus.",
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Nous utilisons OAuth pour les connexions (Google, Meta), vos tokens sont chiffrés, et nous ne stockons jamais vos mots de passe. Conformité RGPD garantie avec export et suppression sur demande. Chaque action est consignée dans un audit log immuable.",
    },
    {
      question: "Comment fonctionne le système d'approbation ?",
      answer: "Toute action à risque (publication, modification de budget, envoi d'emails) passe par votre inbox d'approbations. Vous voyez exactement ce qui sera fait, le niveau de risque, et vous validez ou refusez en un clic. Rien n'est exécuté sans votre accord explicite.",
    },
    {
      question: "Dois-je configurer des outils techniques ?",
      answer: "Non. Tout est géré en coulisses. Vous répondez à quelques questions business simples, vous autorisez l'accès à vos comptes (Google, Meta) si souhaité, et c'est tout. Aucun jargon technique, aucune configuration complexe.",
    },
    {
      question: "Qu'est-ce que le 'Premium Competence Standard' ?",
      answer: "C'est notre engagement qualité. Chaque output est structuré, basé sur des données concrètes, et prêt pour la décision. Pas de suppositions : si une information manque, on vous le dit clairement et on vous demande le minimum nécessaire.",
    },
    {
      question: "Puis-je annuler à tout moment ?",
      answer: "Oui, sans engagement. Vous pouvez annuler votre abonnement à tout moment depuis votre dashboard. Vos données restent accessibles pendant 30 jours après annulation.",
    },
  ];

  const faqsEn = [
    {
      question: "What is the 'Portable Company'?",
      answer: "It's a complete digital company you can 'carry' with you. 11 specialized departments (Marketing, Sales, Finance, Security...) work behind the scenes to deliver professional outputs. You just validate key decisions.",
    },
    {
      question: "What's the difference between Full Company and À la carte?",
      answer: "Full Company gives you access to all 11 departments for €9,000/month. À la carte lets you choose only the departments you need (starting at €1,900/month per department). Core OS (Workspace, Approvals, Audit) is always included.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use OAuth for connections (Google, Meta), your tokens are encrypted, and we never store your passwords. GDPR compliance guaranteed with export and deletion on request. Every action is logged in an immutable audit log.",
    },
    {
      question: "How does the approval system work?",
      answer: "Any risky action (publishing, budget changes, sending emails) goes through your approvals inbox. You see exactly what will be done, the risk level, and you validate or reject with one click. Nothing is executed without your explicit agreement.",
    },
    {
      question: "Do I need to configure technical tools?",
      answer: "No. Everything is managed behind the scenes. You answer a few simple business questions, authorize access to your accounts (Google, Meta) if desired, and that's it. No technical jargon, no complex setup.",
    },
    {
      question: "What is the 'Premium Competence Standard'?",
      answer: "It's our quality commitment. Every output is structured, based on concrete data, and ready for decision-making. No guessing: if information is missing, we tell you clearly and ask for the minimum required.",
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
