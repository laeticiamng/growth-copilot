import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Monitor, BarChart3, MessageSquare } from "lucide-react";
import previewCockpit from "@/assets/preview-cockpit.jpg";
import previewAgents from "@/assets/preview-agents.jpg";
import previewReports from "@/assets/preview-reports.jpg";

const previews = [
  { key: "cockpit", icon: Monitor, image: previewCockpit },
  { key: "agents", icon: MessageSquare, image: previewAgents },
  { key: "reports", icon: BarChart3, image: previewReports },
] as const;

export function ProductPreview() {
  const { t } = useTranslation();

  return (
    <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden" id="product-preview">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {previews.map(({ key, icon: Icon, image }) => (
            <Card
              key={key}
              className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <div className="aspect-video bg-gradient-to-br from-muted/80 to-muted overflow-hidden">
                <img
                  src={image}
                  alt={t(`landing.productPreview.${key}.title`)}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">
                    {t(`landing.productPreview.${key}.title`)}
                  </h3>
                </div>
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
