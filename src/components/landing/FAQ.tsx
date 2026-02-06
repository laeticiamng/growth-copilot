import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const { t } = useTranslation();

  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"];

  return (
    <section id="faq" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">{t("landing.navbar.faq")}</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t("landing.faq.title")}</h2>
          <p className="text-lg text-muted-foreground">{t("landing.faq.subtitle")}</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqKeys.map((key, index) => (
              <AccordionItem
                key={key}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold">{t(`landing.faq.${key}.question`)}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {t(`landing.faq.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
