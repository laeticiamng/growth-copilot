import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
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
    answer: "12 agents spécialisés (SEO, Ads, Local, CRO, etc.) travaillent en parallèle, orchestrés par un 'Directeur' qui priorise selon tes objectifs. Un agent Vérificateur contrôle la qualité et la conformité de chaque action avant exécution.",
  },
  {
    question: "Puis-je annuler à tout moment ?",
    answer: "Oui, sans engagement. Tu peux annuler ton abonnement à tout moment depuis ton dashboard. Tes données restent accessibles pendant 30 jours après annulation.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Questions{" "}
            <span className="gradient-text">fréquentes</span>
          </h2>
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
