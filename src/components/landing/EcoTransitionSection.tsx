import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Leaf,
  BarChart3,
  FileText,
  Coins,
  Gauge,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ECO_FEATURES = [
  {
    id: "carbon",
    icon: BarChart3,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "roadmap",
    icon: Leaf,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "esg",
    icon: FileText,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
  },
  {
    id: "subsidies",
    icon: Coins,
    color: "text-lime-500",
    bgColor: "bg-lime-500/10",
  },
  {
    id: "kpi",
    icon: Gauge,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
] as const;

export function EcoTransitionSection() {
  const { t } = useTranslation();

  return (
    <section id="eco" className="py-12 sm:py-16 md:py-24 relative overflow-hidden scroll-mt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4 gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            <Leaf className="w-3 h-3" />
            {t("landing.eco.badge")}
          </Badge>
          <Badge variant="outline" className="mb-4 ml-2 text-xs border-amber-500/30 text-amber-500">
            {t("common.beta", "Beta")}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t("landing.eco.heading")}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("landing.eco.subheading")}
          </p>
        </div>

        {/* 5 feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {ECO_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                variant="feature"
                className={cn(
                  "group hover:border-emerald-500/30 transition-all duration-300",
                  index >= 3 && "lg:col-span-1",
                  // Center the last 2 cards on large screens (offset into middle of 3-col grid)
                  index === 3 && "sm:col-start-1 lg:col-start-1",
                  index === 4 && "sm:col-start-2 lg:col-start-2"
                )}
              >
                <CardContent className="pt-6">
                  <div className={cn("p-3 rounded-xl w-fit mb-4", feature.bgColor)}>
                    <Icon className={cn("w-6 h-6", feature.color)} />
                  </div>
                  <h3 className="font-bold mb-2">
                    {t(`landing.eco.feature.${feature.id}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`landing.eco.feature.${feature.id}.desc`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/auth?tab=signup">
            <Button variant="hero" size="lg" className="gap-2">
              <Sparkles className="w-4 h-4" />
              {t("landing.eco.cta")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-3">
            {t("landing.eco.ctaSub")}
          </p>
        </div>
      </div>
    </section>
  );
}
