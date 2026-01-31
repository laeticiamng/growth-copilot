import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";

const adMetrics = [
  { label: "Dépenses", value: "€2,847", budget: 3500, change: "-12%", icon: DollarSign },
  { label: "Conversions", value: "89", target: 100, change: "+24%", icon: Target },
  { label: "Clics", value: "3,421", change: "+8%", icon: MousePointer },
  { label: "Impressions", value: "45.2K", change: "+15%", icon: Eye },
];

const campaigns = [
  {
    id: 1,
    name: "Brand - Exact",
    type: "Search",
    status: "active",
    budget: 500,
    spent: 423,
    clicks: 1245,
    conversions: 45,
    cpa: 9.4,
    roas: 4.2,
  },
  {
    id: 2,
    name: "Non-Brand - Services",
    type: "Search",
    status: "active",
    budget: 1500,
    spent: 1287,
    clicks: 1876,
    conversions: 32,
    cpa: 40.2,
    roas: 2.1,
  },
  {
    id: 3,
    name: "Local - Paris",
    type: "Search",
    status: "paused",
    budget: 800,
    spent: 654,
    clicks: 543,
    conversions: 12,
    cpa: 54.5,
    roas: 1.5,
  },
  {
    id: 4,
    name: "Retargeting - Visiteurs",
    type: "Display",
    status: "active",
    budget: 400,
    spent: 312,
    clicks: 234,
    conversions: 8,
    cpa: 39.0,
    roas: 3.8,
  },
];

const negativeKeywords = [
  { keyword: "gratuit", level: "compte", added: "Il y a 2 jours" },
  { keyword: "emploi", level: "compte", added: "Il y a 1 semaine" },
  { keyword: "stage", level: "campagne", added: "Il y a 3 jours" },
];

const alerts = [
  { type: "warning", message: "Budget quotidien atteint sur 'Non-Brand - Services'", action: "Augmenter" },
  { type: "info", message: "5 nouveaux termes de recherche à analyser", action: "Voir" },
  { type: "error", message: "CPA > target sur campagne 'Local - Paris'", action: "Optimiser" },
];

export default function Ads() {
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
          <Button variant="hero">
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
                {metric.budget && (
                  <div className="mt-2">
                    <Progress value={(parseFloat(metric.value.replace(/[€,]/g, '')) / metric.budget) * 100} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">sur €{metric.budget}</p>
                  </div>
                )}
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
                <Badge variant="secondary">{campaigns.filter(c => c.status === 'active').length} actives</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Campagne</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Budget</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Clics</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Conv.</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">CPA</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">ROAS</th>
                      <th className="text-center py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
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
                          <span className={campaign.cpa > 45 ? 'text-destructive' : ''}>€{campaign.cpa}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={campaign.roas >= 3 ? 'text-green-500' : campaign.roas < 2 ? 'text-destructive' : ''}>
                            {campaign.roas}x
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Button variant="ghost" size="sm">
                            {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords">
          <Card variant="feature">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                Analyse des mots-clés et termes de recherche
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negatives">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mots-clés négatifs</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {negativeKeywords.map((neg, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <span className="font-medium">"{neg.keyword}"</span>
                    <Badge variant="outline" className="ml-2 text-xs">{neg.level}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{neg.added}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safeguards">
          <Card variant="feature">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
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
