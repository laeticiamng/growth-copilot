import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const tools = [
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

export function Tools() {
  return (
    <section id="tools" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            Intégrations
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Connecte tes outils,{" "}
            <span className="gradient-text">on fait le reste</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            OAuth sécurisé. Tes données restent les tiennes. 
            On se connecte juste pour analyser et optimiser.
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
                        Recommandé
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
          <Button variant="outline" size="lg">
            Voir toutes les intégrations
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
