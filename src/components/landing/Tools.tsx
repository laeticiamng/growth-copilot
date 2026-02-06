import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function Tools() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const toolsFr = [
    {
      name: "Google Search Console",
      description: "Données SEO officielles et performance organique",
      category: "SEO",
      required: true,
    },
    {
      name: "Google Analytics 4",
      description: "Tracking comportement et conversions",
      category: "Analytics",
      required: true,
    },
    {
      name: "Google Ads",
      description: "Campagnes publicitaires Search et Display",
      category: "Ads",
      required: false,
    },
    {
      name: "Google Business Profile",
      description: "Fiche établissement et avis locaux",
      category: "Local",
      required: false,
    },
    {
      name: "Meta Business Suite",
      description: "Instagram, Facebook, et publicités sociales",
      category: "Social",
      required: false,
    },
    {
      name: "WordPress / Shopify",
      description: "CMS connecté pour corrections automatiques",
      category: "CMS",
      required: false,
    },
  ];

  const toolsEn = [
    {
      name: "Google Search Console",
      description: "Official SEO data and organic performance",
      category: "SEO",
      required: true,
    },
    {
      name: "Google Analytics 4",
      description: "Behavior tracking and conversions",
      category: "Analytics",
      required: true,
    },
    {
      name: "Google Ads",
      description: "Search and Display advertising campaigns",
      category: "Ads",
      required: false,
    },
    {
      name: "Google Business Profile",
      description: "Business listing and local reviews",
      category: "Local",
      required: false,
    },
    {
      name: "Meta Business Suite",
      description: "Instagram, Facebook, and social ads",
      category: "Social",
      required: false,
    },
    {
      name: "WordPress / Shopify",
      description: "Connected CMS for automatic fixes",
      category: "CMS",
      required: false,
    },
  ];

  const tools = isEn ? toolsEn : toolsFr;
  const recommendedLabel = isEn ? "Recommended" : "Recommandé";
  const seeAllLabel = isEn ? "See all integrations" : "Voir toutes les intégrations";

  return (
    <section id="tools" className="py-24 bg-secondary/30 relative scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            {t("landing.footer.integrations")}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t("landing.tools.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("landing.tools.subtitle")}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tools.map((tool, index) => (
            <Card
              key={tool.name}
              variant="feature"
              className="group fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-xl font-bold text-primary">
                    {tool.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-2">
                    {tool.required && (
                      <Badge variant="success" className="text-xs">
                        {recommendedLabel}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {tool.category}
                    </Badge>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tool.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/dashboard/integrations">
            <Button variant="outline" size="lg">
              {seeAllLabel}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
