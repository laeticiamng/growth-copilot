import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    description: "Pour les indépendants et petits sites",
    price: "49",
    period: "/mois",
    features: [
      "1 site web",
      "Audit SEO technique",
      "Suivi mots-clés (50)",
      "Rapports mensuels",
      "Support email",
    ],
    cta: "Commencer",
    popular: false,
  },
  {
    name: "Growth",
    description: "Pour les entreprises en croissance",
    price: "149",
    period: "/mois",
    features: [
      "Jusqu'à 3 sites",
      "SEO + Local + CRO",
      "Suivi mots-clés (500)",
      "Agents IA actifs",
      "Google Ads intégré",
      "Rapports hebdo",
      "Support prioritaire",
    ],
    cta: "Essai gratuit",
    popular: true,
  },
  {
    name: "Scale",
    description: "Pour les agences et grandes équipes",
    price: "399",
    period: "/mois",
    features: [
      "Sites illimités",
      "Tous les modules",
      "Autopilot complet",
      "API & webhooks",
      "White-label",
      "Onboarding dédié",
      "SLA garanti",
    ],
    cta: "Contacter",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            Tarifs
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Investis dans ta{" "}
            <span className="gradient-text">croissance</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Pas de frais cachés. Pas d'engagement. Résultats mesurables ou remboursé.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              variant={plan.popular ? "gradient" : "feature"}
              className={`relative fade-in-up ${plan.popular ? "scale-105 z-10" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="gradient" className="px-4 py-1">
                    Le plus populaire
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/onboarding">
                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    className="w-full"
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
