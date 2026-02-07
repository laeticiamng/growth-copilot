import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Rocket, Clock, CheckCircle2, Circle, Vote, Calendar, Tag, MessageSquare, Lock } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

type Status = "done" | "in_progress" | "planned" | "considering";

interface RoadmapItem {
  title: string;
  description: string;
  status: Status;
  quarter?: string;
  votes?: number;
  tags?: string[];
}

export default function Roadmap() {
  const { t } = useTranslation();

  const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ElementType }> = {
    done: { label: t("pages.roadmap.completed"), color: "bg-green-500", icon: CheckCircle2 },
    in_progress: { label: t("pages.roadmap.inProgress"), color: "bg-blue-500", icon: Clock },
    planned: { label: t("pages.roadmap.planned"), color: "bg-yellow-500", icon: Circle },
    considering: { label: t("pages.roadmap.underReview"), color: "bg-gray-400", icon: Vote },
  };

  const ROADMAP_ITEMS: Record<string, RoadmapItem[]> = {
    "Q1 2026": [
      { title: t("pages.roadmap.items.evidenceBundles"), description: t("pages.roadmap.items.evidenceBundlesDesc"), status: "done", tags: ["Core OS"] },
      { title: t("pages.roadmap.items.voiceCommands"), description: t("pages.roadmap.items.voiceCommandsDesc"), status: "done", tags: ["UX"] },
      { title: t("pages.roadmap.items.hrLegalModules"), description: t("pages.roadmap.items.hrLegalModulesDesc"), status: "done", tags: [t("pages.roadmap.tags.product")] },
      { title: t("pages.roadmap.items.serviceCatalog"), description: t("pages.roadmap.items.serviceCatalogDesc"), status: "done", tags: [t("pages.roadmap.tags.product")] },
      { title: t("pages.roadmap.items.demoMode"), description: t("pages.roadmap.items.demoModeDesc"), status: "done", tags: ["UX"] },
      { title: t("pages.roadmap.items.aiCostDashboard"), description: t("pages.roadmap.items.aiCostDashboardDesc"), status: "done", tags: ["Ops"] },
    ],
    "Q2 2026": [
      { title: t("pages.roadmap.items.salesforce"), description: t("pages.roadmap.items.salesforceDesc"), status: "planned", tags: [t("pages.roadmap.tags.integration")], votes: 45 },
      { title: t("pages.roadmap.items.hubspot"), description: t("pages.roadmap.items.hubspotDesc"), status: "planned", tags: [t("pages.roadmap.tags.integration")], votes: 38 },
      { title: t("pages.roadmap.items.slackNotifications"), description: t("pages.roadmap.items.slackNotificationsDesc"), status: "in_progress", tags: [t("pages.roadmap.tags.integration")], votes: 67 },
      { title: t("pages.roadmap.items.mobileApp"), description: t("pages.roadmap.items.mobileAppDesc"), status: "planned", tags: ["UX"], votes: 89 },
      { title: t("pages.roadmap.items.mfa"), description: t("pages.roadmap.items.mfaDesc"), status: "planned", tags: [t("pages.roadmap.tags.security")], votes: 52 },
      { title: t("pages.roadmap.items.apiV2"), description: t("pages.roadmap.items.apiV2Desc"), status: "in_progress", tags: [t("pages.roadmap.tags.product")], votes: 34 },
    ],
    "Q3 2026": [
      { title: t("pages.roadmap.items.shopify"), description: t("pages.roadmap.items.shopifyDesc"), status: "planned", tags: [t("pages.roadmap.tags.integration")], votes: 23 },
      { title: t("pages.roadmap.items.customDashboards"), description: t("pages.roadmap.items.customDashboardsDesc"), status: "planned", tags: ["UX"], votes: 56 },
      { title: t("pages.roadmap.items.whiteLabel"), description: t("pages.roadmap.items.whiteLabelDesc"), status: "considering", tags: [t("pages.roadmap.tags.product")], votes: 41 },
      { title: t("pages.roadmap.items.aiTraining"), description: t("pages.roadmap.items.aiTrainingDesc"), status: "considering", tags: [t("pages.roadmap.tags.ai")], votes: 78 },
    ],
    [t("pages.roadmap.future")]: [
      { title: t("pages.roadmap.items.linkedin"), description: t("pages.roadmap.items.linkedinDesc"), status: "considering", tags: [t("pages.roadmap.tags.integration")], votes: 112 },
      { title: t("pages.roadmap.items.tiktokAds"), description: t("pages.roadmap.items.tiktokAdsDesc"), status: "considering", tags: [t("pages.roadmap.tags.integration")], votes: 67 },
      { title: t("pages.roadmap.items.selfHosted"), description: t("pages.roadmap.items.selfHostedDesc"), status: "considering", tags: [t("pages.roadmap.tags.product")], votes: 34 },
      { title: t("pages.roadmap.items.soc2"), description: t("pages.roadmap.items.soc2Desc"), status: "planned", tags: [t("pages.roadmap.tags.security")], votes: 29 },
    ],
  };

  function StatusBadge({ status }: { status: Status }) {
    const config = STATUS_CONFIG[status];
    return (<Badge variant="outline" className="gap-1"><span className={`w-2 h-2 rounded-full ${config.color}`} />{config.label}</Badge>);
  }

  const allItems = Object.values(ROADMAP_ITEMS).flat();
  const doneCount = allItems.filter(i => i.status === "done").length;
  const inProgressCount = allItems.filter(i => i.status === "in_progress").length;
  const plannedCount = allItems.filter(i => i.status === "planned").length;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Roadmap" description={t("pages.roadmap.seoDescription")} canonical="/roadmap" />
      <Navbar />
      <div className="container max-w-5xl py-12 px-4 pt-24">
        <header className="mb-12">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-4"><Rocket className="w-10 h-10 text-primary" />{t("pages.roadmap.publicRoadmap")}</h1>
          <p className="text-xl text-muted-foreground">{t("pages.roadmap.subtitle")}</p>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[{ val: doneCount, label: t("pages.roadmap.completed"), color: "text-green-600" }, { val: inProgressCount, label: t("pages.roadmap.inProgress"), color: "text-blue-600" }, { val: plannedCount, label: t("pages.roadmap.planned"), color: "text-yellow-600" }, { val: allItems.length, label: t("pages.roadmap.total"), color: "" }].map(s => (
            <Card key={s.label}><CardContent className="pt-6 text-center"><p className={`text-3xl font-bold ${s.color}`}>{s.val}</p><p className="text-sm text-muted-foreground">{s.label}</p></CardContent></Card>
          ))}
        </div>
        <div className="space-y-8">
          {Object.entries(ROADMAP_ITEMS).map(([quarter, items]) => (
            <Card key={quarter}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />{quarter}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Progress value={(items.filter(i => i.status === "done").length / items.length) * 100} className="w-24" />
                    <span className="text-sm text-muted-foreground">{items.filter(i => i.status === "done").length}/{items.length}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {items.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${item.status === "done" ? "bg-green-500/5 border-green-500/20" : item.status === "in_progress" ? "bg-blue-500/5 border-blue-500/20" : "bg-secondary/50 border-border"}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{item.title}</h4>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">{item.tags?.map(tag => (<Badge key={tag} variant="secondary" className="text-xs"><Tag className="w-2.5 h-2.5 mr-1" />{tag}</Badge>))}</div>
                        {item.votes && (<span className="text-sm text-muted-foreground flex items-center gap-1"><Vote className="w-3.5 h-3.5" />{item.votes}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div><h3 className="font-semibold text-lg">{t("pages.roadmap.haveIdea")}</h3><p className="text-sm text-muted-foreground">{t("pages.roadmap.suggestFeature")}</p></div>
              <Button variant="hero" asChild><Link to="/contact"><MessageSquare className="w-4 h-4 mr-2" />{t("pages.roadmap.suggestIdea")}</Link></Button>
            </div>
          </CardContent>
        </Card>
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/dashboard/status" className="text-primary hover:underline flex items-center gap-1"><Lock className="w-3.5 h-3.5" />{t("pages.roadmap.implementationStatus")}</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
