import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Monitor, BarChart3, MessageSquare } from "lucide-react";

const previews = [
  { key: "cockpit", icon: Monitor },
  { key: "agents", icon: MessageSquare },
  { key: "reports", icon: BarChart3 },
] as const;

export function ProductPreview() {
  const { t } = useTranslation();

  return (
    <section className="py-20 relative overflow-hidden" id="product-preview">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            {t("landing.productPreview.badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("landing.productPreview.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("landing.productPreview.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {previews.map(({ key, icon: Icon }) => (
            <Card
              key={key}
              className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              {/* Placeholder for real screenshot */}
              <div className="aspect-video bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium px-4">
                    {t(`landing.productPreview.${key}.placeholder`)}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1">
                  {t(`landing.productPreview.${key}.title`)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(`landing.productPreview.${key}.description`)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
