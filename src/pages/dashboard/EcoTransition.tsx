import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, BarChart3, TreePine, FileText, Award, Activity } from "lucide-react";
import { CarbonSankeyDiagram, GreenRoadmap, ESGReportGenerator, SubsidyMatcher, GreenKPIDashboard } from "@/components/eco";
import { SEOHead } from "@/components/SEOHead";

export default function EcoTransition() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead title={t("eco.pageTitle")} description={t("eco.pageDesc")} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Leaf className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("eco.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("eco.subtitle")}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="carbon" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="carbon" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> {t("eco.carbonTab")}
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="gap-1.5">
              <TreePine className="h-3.5 w-3.5" /> {t("eco.roadmapTab")}
            </TabsTrigger>
            <TabsTrigger value="esg" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> {t("eco.esgTab")}
            </TabsTrigger>
            <TabsTrigger value="subsidies" className="gap-1.5">
              <Award className="h-3.5 w-3.5" /> {t("eco.subsidiesTab")}
            </TabsTrigger>
            <TabsTrigger value="kpis" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" /> {t("eco.kpisTab")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="carbon"><CarbonSankeyDiagram /></TabsContent>
          <TabsContent value="roadmap"><GreenRoadmap /></TabsContent>
          <TabsContent value="esg"><ESGReportGenerator /></TabsContent>
          <TabsContent value="subsidies"><SubsidyMatcher /></TabsContent>
          <TabsContent value="kpis"><GreenKPIDashboard /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}
