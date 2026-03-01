import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Brain,
  Search,
  Code2,
  Eye,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GEO_FEATURES = [
  {
    id: "audit",
    icon: Search,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "structured",
    icon: Code2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "optimizer",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "monitor",
    icon: Eye,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
] as const;

export function GEOSection() {
  const { t } = useTranslation();

  return (
    <section id="geo" className="py-24 relative overflow-hidden scroll-mt-20">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Alert header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="destructive" className="mb-4 gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            {t("landing.geo.badge")}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t("landing.geo.heading")}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("landing.geo.subheading")}
          </p>
        </div>

        {/* Before / After comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h3 className="font-bold text-destructive">
                  {t("landing.geo.without")}
                </h3>
              </div>
              <ul className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive mt-0.5">✗</span>
                    <span>{t(`landing.geo.withoutF${i}`)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-primary">
                  {t("landing.geo.with")}
                </h3>
              </div>
              <ul className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>{t(`landing.geo.withF${i}`)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 4 GEO tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {GEO_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                variant="feature"
                className="group hover:border-primary/30 transition-all duration-300"
              >
                <CardContent className="pt-6">
                  <div className={cn("p-3 rounded-xl w-fit mb-4", feature.bgColor)}>
                    <Icon className={cn("w-6 h-6", feature.color)} />
                  </div>
                  <h3 className="font-bold mb-2">
                    {t(`landing.geo.feature.${feature.id}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`landing.geo.feature.${feature.id}.desc`)}
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
              {t("landing.geo.cta")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-3">
            {t("landing.geo.ctaSub")}
          </p>
        </div>
      </div>
    </section>
  );
}
