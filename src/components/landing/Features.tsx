import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Target,
  TrendingUp,
  Mail,
  BarChart3,
  Users,
  Zap,
} from "lucide-react";

export function Features() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Search,
      titleKey: "seo",
      badge: "SEO",
      color: "text-chart-1",
    },
    {
      icon: MapPin,
      titleKey: "localSeo",
      badge: "Local",
      color: "text-chart-2",
    },
    {
      icon: Target,
      titleKey: "ads",
      badge: "Ads",
      color: "text-chart-3",
    },
    {
      icon: TrendingUp,
      titleKey: "cro",
      badge: "CRO",
      color: "text-chart-4",
    },
    {
      icon: Mail,
      titleKey: "content",
      badge: "Content",
      color: "text-chart-5",
    },
    {
      icon: BarChart3,
      titleKey: "social",
      badge: "Social",
      color: "text-chart-1",
    },
  ];

  return (
    <section id="features" className="py-24 relative scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            {t("landing.navbar.features")}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t("landing.features.title")}{" "}
            <span className="gradient-text">{t("landing.features.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("landing.features.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.titleKey}
              variant="feature"
              className="group fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-secondary ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {t(`landing.features.${feature.titleKey}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`landing.features.${feature.titleKey}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
