import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, CheckCircle2, AlertCircle, Clock, TestTube2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ESGSection {
  code: string;
  title: string;
  status: "complete" | "partial" | "missing";
  completeness: number;
}

const ESG_SECTIONS: ESGSection[] = [
  { code: "E1", title: "Changement climatique", status: "complete", completeness: 95 },
  { code: "E2", title: "Pollution", status: "partial", completeness: 60 },
  { code: "E3", title: "Eau & ressources marines", status: "partial", completeness: 45 },
  { code: "E4", title: "Biodiversité & écosystèmes", status: "missing", completeness: 10 },
  { code: "E5", title: "Économie circulaire", status: "partial", completeness: 55 },
  { code: "S1", title: "Effectifs propres", status: "complete", completeness: 90 },
  { code: "S2", title: "Travailleurs de la chaîne de valeur", status: "partial", completeness: 40 },
  { code: "S3", title: "Communautés affectées", status: "missing", completeness: 5 },
  { code: "S4", title: "Consommateurs & utilisateurs", status: "partial", completeness: 50 },
  { code: "G1", title: "Gouvernance d'entreprise", status: "complete", completeness: 85 },
  { code: "G2", title: "Gestion des risques", status: "partial", completeness: 65 },
];

const statusIcons = {
  complete: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  partial: <Clock className="h-4 w-4 text-amber-400" />,
  missing: <AlertCircle className="h-4 w-4 text-red-400" />,
};

export function ESGReportGenerator() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("q4-2025");

  const avgCompleteness = Math.round(ESG_SECTIONS.reduce((s, sec) => s + sec.completeness, 0) / ESG_SECTIONS.length);

  const handleExport = () => {
    toast({ title: t("common.comingSoon"), description: t("eco.exportPDFComingSoon") });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs border-amber-500/30 text-amber-500">
            <TestTube2 className="h-3 w-3" />
            {t("common.demoData", "Demo data")}
          </Badge>
          <h3 className="text-lg font-semibold">{t("eco.esgTitle")}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t("eco.esgDesc")}</p>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="q4-2025">Q4 2025</SelectItem>
              <SelectItem value="q1-2026">Q1 2026</SelectItem>
              <SelectItem value="annual-2025">Annuel 2025</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700">
            <FileDown className="h-4 w-4 mr-2" />
            {t("eco.exportPDF")}
          </Button>
        </div>
      </div>

      {/* Overall completeness */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t("eco.csrdCompleteness")}</span>
            <span className="text-sm font-bold text-emerald-400">{avgCompleteness}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700" style={{ width: `${avgCompleteness}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Sections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ESG_SECTIONS.map(section => (
          <Card key={section.code} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {statusIcons[section.status]}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">{section.code}</Badge>
                    <span className="text-sm font-medium truncate">{section.title}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${section.completeness}%`,
                        background: section.completeness > 80 ? "hsl(142 76% 45%)" : section.completeness > 40 ? "hsl(45 93% 58%)" : "hsl(0 84% 60%)",
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{section.completeness}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
