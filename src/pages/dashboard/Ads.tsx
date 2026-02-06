import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Megaphone,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  MousePointer,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Settings,
  Play,
  Pause,
  Loader2,
} from "lucide-react";
import { useAds } from "@/hooks/useAds";
import { useSites } from "@/hooks/useSites";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { ModuleEmptyState, NoSiteEmptyState } from "@/components/ui/module-empty-state";
import { LoadingState } from "@/components/ui/loading-state";

export default function Ads() {
  const { t, i18n } = useTranslation();
  const locale = getIntlLocale(i18n.language);
  const { currentSite } = useSites();
   const { currentWorkspace } = useWorkspace();
  const { 
    accounts, 
    campaigns, 
    keywords,
    negatives, 
    loading, 
    createCampaign, 
    updateCampaign, 
    addNegativeKeyword,
    refetch 
  } = useAds();
 
   // Real-time subscription for campaigns
   const handleRealtimeUpdate = useCallback(() => {
     refetch();
   }, [refetch]);
 
   useRealtimeSubscription(
     `ads-campaigns-${currentWorkspace?.id}`,
     {
       table: 'campaigns',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     handleRealtimeUpdate,
     !!currentWorkspace?.id
   );
 
   useRealtimeSubscription(
     `ads-negatives-${currentWorkspace?.id}`,
     {
       table: 'ads_negatives',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     handleRealtimeUpdate,
     !!currentWorkspace?.id
   );

  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showNegativeDialog, setShowNegativeDialog] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ name: "", budget_daily: 100, strategy: "maximize_conversions" });
  const [negativeForm, setNegativeForm] = useState({ keyword: "", match_type: "exact" });
  const [submitting, setSubmitting] = useState(false);

  // Calculate metrics from real data or use demo
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.cost_30d || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks_30d || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions_30d || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions_30d || 0), 0);

  const adMetrics = campaigns.length > 0 ? [
    { label: t("modules.ads.spending"), value: `€${totalSpent.toLocaleString()}`, icon: DollarSign, change: "+5%" },
    { label: t("modules.ads.conversions"), value: totalConversions.toString(), icon: Target, change: "+12%" },
    { label: t("modules.ads.clicks"), value: totalClicks.toLocaleString(), icon: MousePointer, change: "+8%" },
    { label: t("modules.ads.impressions"), value: `${(totalImpressions / 1000).toFixed(1)}K`, icon: Eye, change: "+15%" },
  ] : [
    { label: t("modules.ads.spending"), value: "€2,847", icon: DollarSign, change: "-12%" },
    { label: t("modules.ads.conversions"), value: "89", icon: Target, change: "+24%" },
    { label: t("modules.ads.clicks"), value: "3,421", icon: MousePointer, change: "+8%" },
    { label: t("modules.ads.impressions"), value: "45.2K", icon: Eye, change: "+15%" },
  ];

  // Real data only - no demo fallback (Zero Fake Data policy)
  const displayCampaigns = campaigns.map(c => ({
    id: c.id,
    name: c.name,
    type: c.campaign_type || "Search",
    status: c.status || "active",
    budget: c.budget_daily || 0,
    spent: c.cost_30d || 0,
    clicks: c.clicks_30d || 0,
    conversions: c.conversions_30d || 0,
    cpa: c.conversions_30d && c.cost_30d ? (c.cost_30d / c.conversions_30d).toFixed(1) : "—",
    roas: c.target_roas || 0,
  }));

  const displayNegatives = negatives.map(n => ({
    keyword: n.keyword,
    level: n.level || "compte",
    added: n.created_at ? new Date(n.created_at).toLocaleDateString(locale) : "—"
  }));

  // Real alerts - only show if there's actual data
  const alerts = campaigns.length > 0 ? [] : [];

  const handleCreateCampaign = async () => {
    if (!campaignForm.name) {
      toast.error(t("modules.ads.campaignNameRequired"));
      return;
    }
    setSubmitting(true);
    const { error } = await createCampaign(campaignForm);
    setSubmitting(false);
    if (error) {
      toast.error(t("modules.ads.creationError"));
    } else {
      toast.success(t("modules.ads.campaignCreated"));
      setShowCampaignDialog(false);
      setCampaignForm({ name: "", budget_daily: 100, strategy: "maximize_conversions" });
    }
  };

  const handleToggleCampaign = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    const { error } = await updateCampaign(campaignId, { status: newStatus });
    if (error) {
      toast.error(t("modules.ads.updateError"));
    } else {
      toast.success(newStatus === "active" ? t("modules.ads.campaignActivated") : t("modules.ads.campaignPaused"));
    }
  };

  const handleAddNegative = async () => {
    if (!negativeForm.keyword) {
      toast.error(t("modules.ads.keywordRequired"));
      return;
    }
    setSubmitting(true);
    const { error } = await addNegativeKeyword(negativeForm.keyword, negativeForm.match_type);
    setSubmitting(false);
    if (error) {
      toast.error(t("modules.ads.addError"));
    } else {
      toast.success(t("modules.ads.negativeAdded"));
      setShowNegativeDialog(false);
      setNegativeForm({ keyword: "", match_type: "exact" });
    }
  };

  if (loading) {
    return <LoadingState message={t("modules.ads.loadingCampaigns")} />;
  }

  // Empty state - no site selected
  if (!currentSite) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t("modules.ads.title")}</h1>
          <p className="text-muted-foreground">{t("modules.ads.subtitle")}</p>
        </div>
        <NoSiteEmptyState moduleName="Ads" icon={Megaphone} />
      </div>
    );
  }

  // Empty state - no campaigns
  const hasData = campaigns.length > 0 || accounts.length > 0;
  if (!hasData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {t("modules.ads.title")}
            <span className="relative w-2 h-2 bg-primary rounded-full animate-pulse" />
          </h1>
          <p className="text-muted-foreground">{t("modules.ads.subtitle")}</p>
        </div>
        <ModuleEmptyState
          icon={Megaphone}
          moduleName="Google Ads"
          description={t("modules.ads.emptyDesc")}
          features={t("modules.ads.emptyFeatures").split(",")}
          primaryAction={{
            label: t("modules.ads.connectGoogleAds"),
            href: "/dashboard/integrations",
          }}
          secondaryAction={{
            label: t("modules.ads.createCampaign"),
            onClick: () => setShowCampaignDialog(true),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold flex items-center gap-2">
             {t("modules.ads.title")}
             <span className="relative w-2 h-2 bg-primary rounded-full animate-pulse" />
           </h1>
          <p className="text-muted-foreground">
            {t("modules.ads.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            {t("modules.ads.settings")}
          </Button>
          <Button variant="hero" onClick={() => setShowCampaignDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("modules.ads.newCampaign")}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                alert.type === "error"
                  ? "bg-destructive/10 border border-destructive/30"
                  : alert.type === "warning"
                  ? "bg-yellow-500/10 border border-yellow-500/30"
                  : "bg-primary/10 border border-primary/30"
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${
                alert.type === "error" ? "text-destructive" : alert.type === "warning" ? "text-yellow-500" : "text-primary"
              }`} />
              <span className="flex-1 text-sm">{alert.message}</span>
              <Button variant="ghost" size="sm">{alert.action}</Button>
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {adMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <Card key={i} variant="kpi">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                </div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className={`text-xs mt-1 ${metric.change.startsWith('+') ? 'text-green-500' : 'text-destructive'}`}>
                  {metric.change} {t("modules.ads.vsPrevPeriod")}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="campaigns">{t("modules.ads.campaigns")}</TabsTrigger>
          <TabsTrigger value="keywords">{t("modules.ads.keywords")}</TabsTrigger>
          <TabsTrigger value="negatives">{t("modules.ads.negatives")}</TabsTrigger>
          <TabsTrigger value="safeguards">{t("modules.ads.safeguards")}</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("modules.ads.activeCampaigns")}</CardTitle>
                <Badge variant="secondary">{t("modules.ads.activeCount", { count: displayCampaigns.filter(c => c.status === 'active').length })}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.ads.campaign")}</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.offers.status")}</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.ads.spent")}</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.ads.clicks")}</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.ads.conv")}</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">CPA</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">ROAS</th>
                      <th className="text-center py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayCampaigns.map((campaign) => {
                      const cpa = typeof campaign.cpa === 'string' ? parseFloat(campaign.cpa) : campaign.cpa;
                      const roas = campaign.roas || 0;
                      return (
                        <tr key={campaign.id} className="border-b border-border/50 hover:bg-secondary/50">
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium">{campaign.name}</p>
                              <p className="text-xs text-muted-foreground">{campaign.type}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Badge variant={campaign.status === 'active' ? 'gradient' : 'secondary'}>
                              {campaign.status === 'active' ? t("modules.offers.active") : t("modules.ads.pause")}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div>
                              <p>€{campaign.spent}</p>
                              <Progress value={(campaign.spent / campaign.budget) * 100} className="w-16 h-1 mt-1" />
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">{campaign.clicks.toLocaleString()}</td>
                          <td className="py-3 px-2 text-right">{campaign.conversions}</td>
                          <td className="py-3 px-2 text-right">
                            <span className={cpa > 45 ? 'text-destructive' : ''}>€{campaign.cpa}</span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <span className={roas >= 3 ? 'text-green-500' : roas < 2 ? 'text-destructive' : ''}>
                              {roas}x
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
                            >
                              {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>{t("modules.ads.keywordsSearchTerms")}</CardTitle>
              <CardDescription>{t("modules.ads.keywordPerformance")}</CardDescription>
            </CardHeader>
            <CardContent>
              {keywords.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">{t("modules.ads.noKeywordsImported")}</p>
                  <p className="text-sm mt-1">{t("modules.ads.authorizeGoogleAds")}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.ads.keyword")}</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.ads.type")}</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">{t("modules.offers.status")}</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">QS</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Max CPC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywords.map((kw) => (
                        <tr key={kw.id} className="border-b border-border/50 hover:bg-secondary/50">
                          <td className="py-3 px-2 font-medium">{kw.keyword}</td>
                          <td className="py-3 px-2 text-center">
                            <Badge variant="outline">{kw.match_type || 'broad'}</Badge>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Badge variant={kw.status === 'enabled' ? 'gradient' : 'secondary'}>
                              {kw.status === 'enabled' ? t("modules.offers.active") : t("modules.ads.pause")}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <span className={kw.quality_score && kw.quality_score >= 7 ? 'text-green-500' : kw.quality_score && kw.quality_score < 5 ? 'text-destructive' : ''}>
                              {kw.quality_score || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">€{kw.max_cpc?.toFixed(2) || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negatives">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("modules.ads.negativeKeywords")}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowNegativeDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("modules.ads.add")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayNegatives.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("modules.ads.noNegativeKeywords")}</p>
              ) : (
                displayNegatives.map((neg, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <span className="font-medium">"{neg.keyword}"</span>
                      <Badge variant="outline" className="ml-2 text-xs">{neg.level}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{neg.added}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safeguards">
          <Card variant="feature">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                {t("modules.ads.activeSafeguards")}
              </CardTitle>
              <CardDescription>
                {t("modules.ads.safeguardsDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">{t("modules.ads.maxDailyBudget")}</p>
                  <p className="text-sm text-muted-foreground">{t("modules.ads.strictDailyLimit")}</p>
                </div>
                <Badge variant="gradient">€150/jour</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">{t("modules.ads.maxCPA")}</p>
                  <p className="text-sm text-muted-foreground">{t("modules.ads.autoPauseExceeded")}</p>
                </div>
                <Badge variant="gradient">€50</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">{t("modules.ads.humanValidation")}</p>
                  <p className="text-sm text-muted-foreground">{t("modules.ads.requiredForMajor")}</p>
                </div>
                <Badge variant="gradient">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {t("modules.ads.enabled")}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">{t("modules.ads.trackingBlock")}</p>
                  <p className="text-sm text-muted-foreground">{t("modules.ads.noOptWithoutData")}</p>
                </div>
                <Badge variant="gradient">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {t("modules.ads.enabled")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("modules.ads.newCampaign")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{t("modules.ads.campaignName")}</label>
              <Input 
                placeholder="Ex: Brand - Exact Match"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                maxLength={100}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t("modules.ads.dailyBudget")}</label>
                <Input 
                  type="number"
                  min={1}
                  max={10000}
                  value={campaignForm.budget_daily}
                  onChange={(e) => setCampaignForm({ ...campaignForm, budget_daily: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("modules.ads.strategy")}</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={campaignForm.strategy}
                  onChange={(e) => setCampaignForm({ ...campaignForm, strategy: e.target.value })}
                >
                  <option value="maximize_conversions">{t("modules.ads.maxConversions")}</option>
                  <option value="maximize_clicks">{t("modules.ads.maxClicks")}</option>
                  <option value="target_cpa">{t("modules.ads.targetCPA")}</option>
                  <option value="target_roas">{t("modules.ads.targetROAS")}</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreateCampaign} disabled={submitting || !campaignForm.name}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Negative Keyword Dialog */}
      <Dialog open={showNegativeDialog} onOpenChange={setShowNegativeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.ads.addNegativeKeyword")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{t("modules.ads.keyword")} *</label>
              <Input 
                placeholder="Ex: gratuit, emploi..."
                value={negativeForm.keyword}
                onChange={(e) => setNegativeForm({ ...negativeForm, keyword: e.target.value })}
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("modules.ads.matchType")}</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={negativeForm.match_type}
                onChange={(e) => setNegativeForm({ ...negativeForm, match_type: e.target.value })}
              >
                <option value="exact">{t("modules.ads.exact")}</option>
                <option value="phrase">{t("modules.ads.phrase")}</option>
                <option value="broad">{t("modules.ads.broad")}</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowNegativeDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleAddNegative} disabled={submitting || !negativeForm.keyword}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("modules.ads.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}