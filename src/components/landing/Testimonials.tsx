/**
 * Testimonials Section - Social proof with customer quotes
 */
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const TESTIMONIALS = [
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-20 bg-card/30" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ils font confiance à Growth OS
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            PME, startups et consultants utilisent Growth OS pour automatiser leur croissance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map((testimonial) => (
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
