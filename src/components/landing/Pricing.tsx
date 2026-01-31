import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Pricing() {
  const { t } = useTranslation();

  const plans = [
    {
      nameKey: "starter",
      price: "49",
      features: [
        "1 site web",
        "Audit SEO technique",
        "Suivi mots-clés (50)",
        "Rapports mensuels",
        "Support email",
      ],
      featuresEn: [
        "1 website",
        "Technical SEO audit",
        "Keyword tracking (50)",
        "Monthly reports",
        "Email support",
      ],
      popular: false,
    },
    {
      nameKey: "growth",
      price: "149",
      features: [
        "Jusqu'à 3 sites",
        "SEO + Local + CRO",
        "Suivi mots-clés (500)",
        "Agents IA actifs",
        "Google Ads intégré",
        "Rapports hebdo",
        "Support prioritaire",
      ],
      featuresEn: [
        "Up to 3 sites",
        "SEO + Local + CRO",
        "Keyword tracking (500)",
        "Active AI agents",
        "Google Ads integrated",
        "Weekly reports",
        "Priority support",
      ],
      popular: true,
    },
    {
      nameKey: "scale",
      price: "399",
      features: [
        "Sites illimités",
        "Tous les modules",
        "Autopilot complet",
        "API & webhooks",
        "White-label",
        "Onboarding dédié",
        "SLA garanti",
      ],
      featuresEn: [
        "Unlimited sites",
        "All modules",
        "Full autopilot",
        "API & webhooks",
        "White-label",
        "Dedicated onboarding",
        "Guaranteed SLA",
      ],
      popular: false,
    },
  ];

  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return (
    <section id="pricing" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            {t("landing.navbar.pricing")}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t("landing.pricing.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("landing.pricing.subtitle")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.nameKey}
              variant={plan.popular ? "gradient" : "feature"}
              className={`relative fade-in-up ${plan.popular ? "scale-105 z-10" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="gradient" className="px-4 py-1">
                    {t("landing.pricing.popular")}
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{t(`landing.pricing.${plan.nameKey}.name`)}</CardTitle>
                <p className="text-sm text-muted-foreground">{t(`landing.pricing.${plan.nameKey}.description`)}</p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">{t("landing.pricing.perMonth")}</span>
                </div>

                <ul className="space-y-3 mb-8 text-left">
                  {(isEn ? plan.featuresEn : plan.features).map((feature) => (
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
                    {t("landing.pricing.cta")}
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
