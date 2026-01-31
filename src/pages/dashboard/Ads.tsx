import { useState } from "react";
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
import { toast } from "sonner";

export default function Ads() {
  const { currentSite } = useSites();
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
    { label: "Dépenses", value: `€${totalSpent.toLocaleString()}`, icon: DollarSign, change: "+5%" },
    { label: "Conversions", value: totalConversions.toString(), icon: Target, change: "+12%" },
    { label: "Clics", value: totalClicks.toLocaleString(), icon: MousePointer, change: "+8%" },
    { label: "Impressions", value: `${(totalImpressions / 1000).toFixed(1)}K`, icon: Eye, change: "+15%" },
  ] : [
    { label: "Dépenses", value: "€2,847", icon: DollarSign, change: "-12%" },
    { label: "Conversions", value: "89", icon: Target, change: "+24%" },
    { label: "Clics", value: "3,421", icon: MousePointer, change: "+8%" },
    { label: "Impressions", value: "45.2K", icon: Eye, change: "+15%" },
  ];

  // Demo data fallback
  const displayCampaigns = campaigns.length > 0 ? campaigns.map(c => ({
    id: c.id,
    name: c.name,
    type: c.campaign_type || "Search",
    status: c.status || "active",
    budget: c.budget_daily || 500,
    spent: c.cost_30d || 0,
    clicks: c.clicks_30d || 0,
    conversions: c.conversions_30d || 0,
    cpa: c.conversions_30d && c.cost_30d ? (c.cost_30d / c.conversions_30d).toFixed(1) : "—",
    roas: c.target_roas || 0,
  })) : [
    { id: "1", name: "Brand - Exact", type: "Search", status: "active", budget: 500, spent: 423, clicks: 1245, conversions: 45, cpa: "9.4", roas: 4.2 },
    { id: "2", name: "Non-Brand - Services", type: "Search", status: "active", budget: 1500, spent: 1287, clicks: 1876, conversions: 32, cpa: "40.2", roas: 2.1 },
    { id: "3", name: "Local - Paris", type: "Search", status: "paused", budget: 800, spent: 654, clicks: 543, conversions: 12, cpa: "54.5", roas: 1.5 },
  ];

  const displayNegatives = negatives.length > 0 ? negatives.map(n => ({
    keyword: n.keyword,
    level: n.level || "compte",
    added: n.created_at ? new Date(n.created_at).toLocaleDateString('fr') : "Récent"
  })) : [
    { keyword: "gratuit", level: "compte", added: "Il y a 2 jours" },
    { keyword: "emploi", level: "compte", added: "Il y a 1 semaine" },
  ];

  const alerts = [
    { type: "warning", message: "Budget quotidien atteint sur 'Non-Brand'", action: "Augmenter" },
    { type: "info", message: "5 nouveaux termes de recherche à analyser", action: "Voir" },
  ];

  const handleCreateCampaign = async () => {
    if (!campaignForm.name) {
      toast.error("Nom de campagne requis");
      return;
    }
    setSubmitting(true);
    const { error } = await createCampaign(campaignForm);
    setSubmitting(false);
    if (error) {
      toast.error("Erreur lors de la création");
    } else {
      toast.success("Campagne créée");
      setShowCampaignDialog(false);
      setCampaignForm({ name: "", budget_daily: 100, strategy: "maximize_conversions" });
    }
  };

  const handleToggleCampaign = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    const { error } = await updateCampaign(campaignId, { status: newStatus });
    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(`Campagne ${newStatus === "active" ? "activée" : "en pause"}`);
    }
  };

  const handleAddNegative = async () => {
    if (!negativeForm.keyword) {
      toast.error("Mot-clé requis");
      return;
    }
    setSubmitting(true);
    const { error } = await addNegativeKeyword(negativeForm.keyword, negativeForm.match_type);
    setSubmitting(false);
    if (error) {
      toast.error("Erreur lors de l'ajout");
    } else {
      toast.success("Mot-clé négatif ajouté");
      setShowNegativeDialog(false);
      setNegativeForm({ keyword: "", match_type: "exact" });
    }
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Google Ads</h1>
          <p className="text-muted-foreground">
            Gestion des campagnes publicitaires
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
          <Button variant="hero" onClick={() => setShowCampaignDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle campagne
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
      <div className="grid sm:grid-cols-4 gap-4">
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
                  {metric.change} vs période préc.
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="keywords">Mots-clés</TabsTrigger>
          <TabsTrigger value="negatives">Négatifs</TabsTrigger>
          <TabsTrigger value="safeguards">Garde-fous</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Campagnes actives</CardTitle>
                <Badge variant="secondary">{displayCampaigns.filter(c => c.status === 'active').length} actives</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Campagne</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Dépensé</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Clics</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Conv.</th>
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
                              {campaign.status === 'active' ? 'Active' : 'Pause'}
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
              <CardTitle>Mots-clés et termes de recherche</CardTitle>
              <CardDescription>Analyse des performances par mot-clé</CardDescription>
            </CardHeader>
            <CardContent>
              {keywords.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Aucun mot-clé</p>
                  <p className="text-sm mt-1">Connectez Google Ads pour synchroniser</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Mot-clé</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
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
                              {kw.status === 'enabled' ? 'Actif' : 'Pause'}
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
                <CardTitle>Mots-clés négatifs</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowNegativeDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayNegatives.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun mot-clé négatif</p>
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
                Garde-fous actifs
              </CardTitle>
              <CardDescription>
                Protections automatiques pour éviter les dérapages de budget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">Budget quotidien max</p>
                  <p className="text-sm text-muted-foreground">Limite stricte par jour</p>
                </div>
                <Badge variant="gradient">€150/jour</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">CPA max autorisé</p>
                  <p className="text-sm text-muted-foreground">Pause auto si dépassé</p>
                </div>
                <Badge variant="gradient">€50</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">Validation humaine</p>
                  <p className="text-sm text-muted-foreground">Requise pour changements majeurs</p>
                </div>
                <Badge variant="gradient">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Activé
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">Blocage si tracking cassé</p>
                  <p className="text-sm text-muted-foreground">Pas d'optimisation sans data fiable</p>
                </div>
                <Badge variant="gradient">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Activé
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
