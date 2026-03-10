/**
 * Testimonials Section - Premium visual design with factual use cases
 * Compliant with Zero Fake Data policy — no stars, no fake names
 */
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Building2, Rocket, Briefcase, Bot, LayoutGrid, Zap } from "lucide-react";

const metrics = [
  { icon: Bot, key: "metric1" },
  { icon: LayoutGrid, key: "metric2" },
  { icon: Zap, key: "metric3" },
] as const;

const testimonials = [
  {
    key: "t1",
    Icon: Building2,
    resultKey: "result1",
    gradient: "from-primary/20 to-accent/20",
    iconColor: "text-primary",
  },
  {
    key: "t2",
    Icon: Rocket,
    resultKey: "result2",
    gradient: "from-chart-3/20 to-primary/20",
    iconColor: "text-chart-3",
  },
  {
    key: "t3",
    Icon: Briefcase,
    resultKey: "result3",
    gradient: "from-accent/20 to-chart-5/20",
    iconColor: "text-accent",
  },
] as const;

export function Testimonials() {
  const { t } = useTranslation();

  return (
    <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden" id="testimonials">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("landing.testimonials.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("landing.testimonials.subtitle")}
          </p>
        </div>

        {/* Factual platform metrics */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {metrics.map(({ icon: MetricIcon, key }) => (
            <div
              key={key}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/60 backdrop-blur-sm"
            >
              <MetricIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {t(`landing.testimonials.${key}`)}
              </span>
            </div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map(({ key, Icon, resultKey, gradient, iconColor }) => (
            <Card
              key={key}
              variant="glass"
              className="relative hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                {/* Badge */}
                <div className="mb-4">
                  <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/50">
                    {t("landing.testimonials.badge")}
                  </Badge>
                </div>

                {/* Quote */}
                <div className="relative flex-1 mb-5">
                  <Quote className="absolute -top-1 -left-1 w-6 h-6 text-primary/20" aria-hidden="true" />
                  <blockquote className="pl-6 text-sm text-muted-foreground leading-relaxed">
                    {t(`landing.testimonials.${key}.quote`)}
                  </blockquote>
                </div>

                {/* Key result highlight */}
                <div className="mb-5 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/10 text-center">
                  <p className="text-lg font-bold gradient-text">
                    {t(`landing.testimonials.${resultKey}.value`)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(`landing.testimonials.${resultKey}.label`)}
                  </p>
                </div>

                {/* Sector label (no personal names) */}
                <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                  <div className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{t(`landing.testimonials.${key}.sector`)}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t(`landing.testimonials.${key}.context`)}
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