import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Search, BarChart3, Target, MapPin, Share2, Code, type LucideIcon } from "lucide-react";

export function Tools() {
  const { t } = useTranslation();

  const tools: { name: string; descKey: string; category: string; required: boolean; icon: LucideIcon }[] = [
    { name: "Google Search Console", descKey: "landing.tools.gsc", category: "SEO", required: true, icon: Search },
    { name: "Google Analytics 4", descKey: "landing.tools.ga4", category: "Analytics", required: true, icon: BarChart3 },
    { name: "Google Ads", descKey: "landing.tools.googleAds", category: "Ads", required: false, icon: Target },
    { name: "Google Business Profile", descKey: "landing.tools.gbp", category: "Local", required: false, icon: MapPin },
    { name: "Meta Business Suite", descKey: "landing.tools.meta", category: "Social", required: false, icon: Share2 },
    { name: "WordPress / Shopify", descKey: "landing.tools.cms", category: "CMS", required: false, icon: Code },
  ];

  return (
    <section id="tools" className="py-24 bg-secondary/30 relative scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            {t("landing.footer.integrations")}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t("landing.tools.title")}</h2>
          <p className="text-lg text-muted-foreground">{t("landing.tools.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tools.map((tool, index) => (
            <Card key={tool.name} variant="feature" className="group fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <tool.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    {tool.required && (
                      <Badge variant="success" className="text-xs">{t("landing.tools.recommended")}</Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">{tool.category}</Badge>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{t(tool.descKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/dashboard/integrations">
            <Button variant="outline" size="lg">
              {t("landing.tools.seeAll")}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
