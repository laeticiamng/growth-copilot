import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, X, Minus, Zap } from "lucide-react";

const rows = [
  "availability",
  "deployTime",
  "monthlyCost",
  "scalability",
  "consistency",
  "auditTrail",
  "departments",
] as const;

function CellIcon({ value }: { value: "yes" | "no" | "partial" }) {
  if (value === "yes") return <Check className="w-4 h-4 text-chart-3 mx-auto" />;
  if (value === "no") return <X className="w-4 h-4 text-destructive mx-auto" />;
  return <Minus className="w-4 h-4 text-muted-foreground mx-auto" />;
}

export function ComparisonTable() {
  const { t } = useTranslation();

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-secondary/30 relative" id="comparison">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            {t("landing.comparison.badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("landing.comparison.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("landing.comparison.subtitle")}
          </p>
        </div>

        <Card className="max-w-4xl mx-auto overflow-hidden border-border/50">
          <div className="overflow-x-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 sm:p-3 md:p-4 font-medium text-muted-foreground">
                    {t("landing.comparison.criteria")}
                  </th>
                  <th className="p-2 sm:p-3 md:p-4 text-center font-semibold bg-primary/5 border-x border-primary/10">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="w-4 h-4 text-primary" />
                      Growth OS
                    </div>
                  </th>
                  <th className="p-2 sm:p-3 md:p-4 text-center font-medium">
                    {t("landing.comparison.agency")}
                  </th>
                  <th className="p-2 sm:p-3 md:p-4 text-center font-medium">
                    {t("landing.comparison.inHouse")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row} className="border-b border-border/50 last:border-0">
                    <td className="p-2 sm:p-3 md:p-4 font-medium">{t(`landing.comparison.rows.${row}.label`)}</td>
                    <td className="p-2 sm:p-3 md:p-4 text-center bg-primary/5 border-x border-primary/10 font-medium text-primary">
                      {t(`landing.comparison.rows.${row}.growthOS`)}
                    </td>
                    <td className="p-2 sm:p-3 md:p-4 text-center text-muted-foreground">
                      {t(`landing.comparison.rows.${row}.agency`)}
                    </td>
                    <td className="p-2 sm:p-3 md:p-4 text-center text-muted-foreground">
                      {t(`landing.comparison.rows.${row}.inHouse`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  );
}
