import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataLoadingError, EmptyState, SiteRequired } from "@/components/ui/empty-state";
import { Leaf, BarChart3, TreePine, FileText, Award, Activity, Sparkles, Database } from "lucide-react";
import { CarbonSankeyDiagram, GreenRoadmap, ESGReportGenerator, SubsidyMatcher, GreenKPIDashboard } from "@/components/eco";
import { SEOHead } from "@/components/SEOHead";
import { useEco } from "@/hooks/useEco";
import { useNavigate } from "react-router-dom";

export default function EcoTransition() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    currentWorkspace,
    currentSite,
    emissions,
    roadmapActions,
    subsidyProjects,
    monthlyMetrics,
    reportingSnapshots,
    loading,
    error,
    refetch,
    createEmission,
    createRoadmapAction,
    createSubsidyProject,
    createMetric,
    createReport,
  } = useEco();

  const summary = useMemo(() => ({
    emissions: emissions.reduce((sum, item) => sum + Number(item.annual_emissions_tco2e || 0), 0),
    roadmap: roadmapActions.reduce((sum, item) => sum + Number(item.co2_reduction_tco2e || 0), 0),
    funding: subsidyProjects.reduce((sum, item) => sum + Number(item.amount_eur || 0), 0),
    csrd: reportingSnapshots[0]?.csrd_completeness_pct ?? 0,
  }), [emissions, roadmapActions, subsidyProjects, reportingSnapshots]);

  const isFr = i18n.language.startsWith("fr");

  return (
    <>
      <SEOHead title={t("eco.pageTitle")} description={t("eco.pageDesc")} />
      <div className="space-y-6">
        <Card className="overflow-hidden border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_28%)] shadow-[0_30px_120px_-60px_rgba(16,185,129,0.6)]">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <Badge variant="outline" className="w-fit border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> {isFr ? "Éco cockpit premium 2026" : "Premium 2026 eco cockpit"}
              </Badge>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <Leaf className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{t("eco.title")}</h1>
                  <p className="text-sm text-muted-foreground">{t("eco.subtitle")}</p>
                </div>
              </div>
              <p className="max-w-3xl text-sm text-muted-foreground">
                {isFr
                  ? "Audit utilisateur appliqué : les onglets Éco s’appuient désormais sur des données réelles workspace/site, sans seed ni contenu démonstratif."
                  : "User-side audit applied: Eco tabs now rely on real workspace/site data, with no seeded or demo content."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: isFr ? "Émissions suivies" : "Tracked emissions", value: `${summary.emissions.toFixed(1)} tCO₂e` },
                { label: isFr ? "Réduction roadmap" : "Roadmap reduction", value: `-${summary.roadmap.toFixed(1)} t` },
                { label: isFr ? "Financement pipeline" : "Funding pipeline", value: `${summary.funding.toLocaleString(i18n.language)} €` },
                { label: isFr ? "Complétude CSRD" : "CSRD completeness", value: `${summary.csrd}%` },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-background/60 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {!currentWorkspace ? (
          <EmptyState
            icon={Database}
            title={isFr ? "Créez un workspace pour activer le module Éco" : "Create a workspace to enable the Eco module"}
            description={isFr ? "Toutes les données Éco sont maintenant stockées par workspace avec isolation RLS." : "All Eco data is now stored per workspace with RLS isolation."}
            action={{ label: isFr ? "Configurer le workspace" : "Set up workspace", onClick: () => navigate("/dashboard/setup") }}
          />
        ) : !currentSite ? (
          <SiteRequired onNavigate={() => navigate("/dashboard/sites")} />
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-40 rounded-3xl border border-white/10 bg-secondary/30 animate-pulse" />
            <div className="h-40 rounded-3xl border border-white/10 bg-secondary/30 animate-pulse" />
          </div>
        ) : error ? (
          <DataLoadingError message={String(error)} onRetry={() => refetch()} />
        ) : (
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

            <TabsContent value="carbon">
              <CarbonSankeyDiagram emissionSources={emissions} onCreateSource={(payload) => createEmission.mutateAsync(payload)} isSaving={createEmission.isPending} />
            </TabsContent>
            <TabsContent value="roadmap">
              <GreenRoadmap actions={roadmapActions} onCreateAction={(payload) => createRoadmapAction.mutateAsync(payload)} isSaving={createRoadmapAction.isPending} />
            </TabsContent>
            <TabsContent value="esg">
              <ESGReportGenerator snapshots={reportingSnapshots} onCreateSnapshot={(payload) => createReport.mutateAsync(payload)} isSaving={createReport.isPending} />
            </TabsContent>
            <TabsContent value="subsidies">
              <SubsidyMatcher projects={subsidyProjects} onCreateProject={(payload) => createSubsidyProject.mutateAsync(payload)} isSaving={createSubsidyProject.isPending} />
            </TabsContent>
            <TabsContent value="kpis">
              <GreenKPIDashboard metrics={monthlyMetrics} onCreateMetric={(payload) => createMetric.mutateAsync(payload)} isSaving={createMetric.isPending} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
