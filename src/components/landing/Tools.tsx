import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, Zap, Link2, ArrowRight, LineChart,
  Search, BarChart3, Target, MapPin, Share2, Code, 
  CheckCircle2, type LucideIcon 
} from "lucide-react";
import { Link } from "react-router-dom";

export function Tools() {
  const { t } = useTranslation();

  const steps: { titleKey: string; descKey: string; icon: LucideIcon; badge: string }[] = [
    { titleKey: "landing.tools.step1Title", descKey: "landing.tools.step1Desc", icon: Globe, badge: "1" },
    { titleKey: "landing.tools.step2Title", descKey: "landing.tools.step2Desc", icon: Zap, badge: "2" },
    { titleKey: "landing.tools.step3Title", descKey: "landing.tools.step3Desc", icon: Link2, badge: "3" },
    { titleKey: "landing.tools.step4Title", descKey: "landing.tools.step4Desc", icon: LineChart, badge: "4" },
  ];

  const integrations: { nameKey: string; descKey: string; category: string; icon: LucideIcon; phase: "instant" | "oauth" }[] = [
    { nameKey: "landing.tools.integrations.seoTech", descKey: "landing.tools.seoTech", category: "SEO", icon: Search, phase: "instant" },
    { nameKey: "landing.tools.integrations.contentBranding", descKey: "landing.tools.contentBranding", category: "Content", icon: Code, phase: "instant" },
    { nameKey: "landing.tools.integrations.gsc", descKey: "landing.tools.gsc", category: "SEO", icon: Search, phase: "oauth" },
    { nameKey: "landing.tools.integrations.ga4", descKey: "landing.tools.ga4", category: "Analytics", icon: BarChart3, phase: "oauth" },
    { nameKey: "landing.tools.integrations.googleAds", descKey: "landing.tools.googleAds", category: "Ads", icon: Target, phase: "oauth" },
    { nameKey: "landing.tools.integrations.gbp", descKey: "landing.tools.gbp", category: "Local", icon: MapPin, phase: "oauth" },
    { nameKey: "landing.tools.integrations.meta", descKey: "landing.tools.meta", category: "Social", icon: Share2, phase: "oauth" },
    { nameKey: "landing.tools.integrations.cms", descKey: "landing.tools.cms", category: "CMS", icon: Code, phase: "oauth" },
  ];

  const instantIntegrations = integrations.filter(i => i.phase === "instant");
  const oauthIntegrations = integrations.filter(i => i.phase === "oauth");

  return (
    <section id="tools" className="py-24 bg-secondary/30 relative scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            {t("landing.tools.badge")}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t("landing.tools.title")}</h2>
          <p className="text-lg text-muted-foreground">{t("landing.tools.subtitle")}</p>
        </div>

        {/* 3-step progressive journey */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card variant="feature" className="group fade-in-up h-full" style={{ animationDelay: `${index * 0.15}s` }}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <Badge variant="outline" className="mb-3">{t("landing.tools.stepLabel")} {step.badge}</Badge>
                  <h3 className="text-lg font-semibold mb-2">{t(step.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(step.descKey)}</p>
                </CardContent>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-primary/40" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Instant analysis (no OAuth) */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-chart-3" />
            <h3 className="text-lg font-semibold">{t("landing.tools.instantTitle")}</h3>
            <Badge variant="success" className="text-xs">{t("landing.tools.noAccountNeeded")}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {instantIntegrations.map((tool) => (
              <Card key={tool.nameKey} variant="feature" className="group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                    <tool.icon className="w-5 h-5 text-chart-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{t(tool.nameKey)}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-chart-3" />
                    </div>
                    <p className="text-xs text-muted-foreground">{t(tool.descKey)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* OAuth integrations */}
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{t("landing.tools.oauthTitle")}</h3>
            <Badge variant="secondary" className="text-xs">{t("landing.tools.oneClick")}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {oauthIntegrations.map((tool) => (
              <Card key={tool.nameKey} variant="feature" className="group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <tool.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{t(tool.nameKey)}</h4>
                      <Badge variant="outline" className="text-[10px]">{tool.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t(tool.descKey)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/auth?tab=signup">
            <Button variant="outline" size="lg">
              {t("landing.tools.startNow")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
