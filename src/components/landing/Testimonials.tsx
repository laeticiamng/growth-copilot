/**
 * Testimonials Section - Social proof with customer quotes
 */
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

// Simple StarRating component without ref forwarding to avoid React warning
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted"
        }`}
        aria-hidden="true"
      />
    ))}
  </div>
);

export function Testimonials() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const testimonialsFr = [
    {
      name: "Laurent Moreau",
      role: "Directeur Marketing",
      company: "TechFlow (52 employés)",
      initials: "LM",
      quote:
        "Growth OS a remplacé notre agence SEO et notre freelance ads. Résultat : -40% de budget, +65% de leads qualifiés en 3 mois.",
      rating: 5,
    },
    {
      name: "Sophie Bertrand",
      role: "Fondatrice & CEO",
      company: "Startup SaaS B2B",
      initials: "SB",
      quote:
        "En tant que fondatrice solo, je n'avais pas le temps de gérer le marketing. Maintenant, 39 agents s'en occupent pendant que je développe le produit.",
      rating: 5,
    },
    {
      name: "Marc Dubois",
      role: "Consultant Digital",
      company: "Freelance",
      initials: "MD",
      quote:
        "J'utilise Growth OS pour mes clients. Les rapports automatiques et l'audit SEO me font gagner 10h par semaine. ROI immédiat.",
      rating: 5,
    },
  ];

  const testimonialsEn = [
    {
      name: "Laurent Moreau",
      role: "Marketing Director",
      company: "TechFlow (52 employees)",
      initials: "LM",
      quote:
        "Growth OS replaced our SEO agency and freelance ads manager. Result: -40% budget, +65% qualified leads in 3 months.",
      rating: 5,
    },
    {
      name: "Sophie Bertrand",
      role: "Founder & CEO",
      company: "B2B SaaS Startup",
      initials: "SB",
      quote:
        "As a solo founder, I didn't have time to manage marketing. Now, 39 agents handle it while I focus on the product.",
      rating: 5,
    },
    {
      name: "Marc Dubois",
      role: "Digital Consultant",
      company: "Freelance",
      initials: "MD",
      quote:
        "I use Growth OS for my clients. The automatic reports and SEO audit save me 10 hours per week. Immediate ROI.",
      rating: 5,
    },
  ];

  const testimonials = isEn ? testimonialsEn : testimonialsFr;

  const title = isEn ? "They trust Growth OS" : "Ils font confiance à Growth OS";
  const subtitle = isEn 
    ? "SMBs, startups, and consultants use Growth OS to automate their growth"
    : "PME, startups et consultants utilisent Growth OS pour automatiser leur croissance";

  return (
    <section className="py-20 bg-card/30" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="bg-card border-border/50 hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-6">
                <StarRating rating={testimonial.rating} />
                
                <blockquote className="mt-4 mb-6 text-muted-foreground">
                  "{testimonial.quote}"
                </blockquote>

                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
