import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Target,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Calendar,
  Eye,
} from "lucide-react";

const keywords = [
  { keyword: "agence seo paris", volume: 2400, position: 8, change: +3, intent: "commercial" },
  { keyword: "audit seo gratuit", volume: 1900, position: 12, change: -2, intent: "transactional" },
  { keyword: "consultant seo", volume: 3200, position: 15, change: +5, intent: "commercial" },
  { keyword: "référencement naturel", volume: 4500, position: 22, change: +1, intent: "info" },
  { keyword: "prix seo", volume: 880, position: 6, change: +2, intent: "transactional" },
];

const clusters = [
  { name: "Services SEO", keywords: 24, volume: 12400, status: "mapped" },
  { name: "Audit & Diagnostic", keywords: 18, volume: 8200, status: "partial" },
  { name: "Local SEO", keywords: 15, volume: 5600, status: "new" },
  { name: "E-commerce SEO", keywords: 12, volume: 4100, status: "mapped" },
];

const contentPlan = [
  {
    id: 1,
    title: "Guide complet du SEO en 2026",
    keyword: "guide seo",
    status: "draft",
    wordCount: 3200,
    assignee: "IA",
  },
  {
    id: 2,
    title: "Comment choisir son agence SEO",
    keyword: "agence seo paris",
    status: "review",
    wordCount: 2100,
    assignee: "IA",
  },
  {
    id: 3,
    title: "Audit SEO : méthodologie complète",
    keyword: "audit seo",
    status: "published",
    wordCount: 2800,
    assignee: "Humain",
  },
];

const refreshOpportunities = [
  { page: "/blog/seo-2024", impressions: -35, lastUpdate: "8 mois", action: "Mise à jour urgente" },
  { page: "/services/audit", impressions: -22, lastUpdate: "6 mois", action: "Refresh recommandé" },
  { page: "/guide/local-seo", impressions: -15, lastUpdate: "4 mois", action: "À surveiller" },
];

export default function Content() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contenu & Mots-clés</h1>
          <p className="text-muted-foreground">
            Stratégie de contenu et opportunités SEO
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync GSC
          </Button>
          <Button variant="hero">
            <Sparkles className="w-4 h-4 mr-2" />
            Générer brief
          </Button>
        </div>
      </div>

      <Tabs defaultValue="keywords" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keywords">Mots-clés</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="refresh">Refresh</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-6">
          {/* Stats */}
          <div className="grid sm:grid-cols-4 gap-4">
            <Card variant="kpi">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Mots-clés suivis</p>
                <p className="text-3xl font-bold">247</p>
                <p className="text-xs text-green-500 mt-1">+12 ce mois</p>
              </CardContent>
            </Card>
            <Card variant="kpi">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Top 10</p>
                <p className="text-3xl font-bold">38</p>
                <p className="text-xs text-green-500 mt-1">+5 ce mois</p>
              </CardContent>
            </Card>
            <Card variant="kpi">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Volume total</p>
                <p className="text-3xl font-bold">45.2K</p>
                <p className="text-xs text-muted-foreground mt-1">/mois</p>
              </CardContent>
            </Card>
            <Card variant="kpi">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Opportunités</p>
                <p className="text-3xl font-bold">23</p>
                <p className="text-xs text-primary mt-1">Quick wins</p>
              </CardContent>
            </Card>
          </div>

          {/* Keywords table */}
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mots-clés principaux</CardTitle>
                <Button variant="ghost" size="sm">
                  Voir tout
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Mot-clé</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Volume</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Position</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Évolution</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Intent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywords.map((kw, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/50">
                        <td className="py-3 px-2">
                          <span className="font-medium">{kw.keyword}</span>
                        </td>
                        <td className="py-3 px-2 text-right text-muted-foreground">
                          {kw.volume.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Badge variant={kw.position <= 10 ? "gradient" : "secondary"}>
                            #{kw.position}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={`flex items-center justify-end gap-1 ${
                            kw.change > 0 ? "text-green-500" : "text-destructive"
                          }`}>
                            {kw.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {Math.abs(kw.change)}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {kw.intent}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {clusters.map((cluster, i) => (
              <Card key={i} variant="feature" className="hover:border-primary/50 cursor-pointer transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant={
                        cluster.status === "mapped"
                          ? "gradient"
                          : cluster.status === "partial"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {cluster.status === "mapped" ? "Mappé" : cluster.status === "partial" ? "Partiel" : "Nouveau"}
                    </Badge>
                    <Target className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{cluster.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cluster.keywords} mots-clés • {cluster.volume.toLocaleString()} vol.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plan de contenu</CardTitle>
                  <CardDescription>Articles en cours et planifiés</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau brief
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {contentPlan.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
                >
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{content.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Cible : "{content.keyword}" • {content.wordCount} mots
                    </p>
                  </div>
                  <Badge
                    variant={
                      content.status === "published"
                        ? "gradient"
                        : content.status === "review"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {content.status === "published" ? "Publié" : content.status === "review" ? "Relecture" : "Brouillon"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {content.assignee}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refresh" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Pages à rafraîchir
              </CardTitle>
              <CardDescription>
                Contenu qui perd en visibilité et nécessite une mise à jour
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {refreshOpportunities.map((page, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{page.page}</p>
                    <p className="text-sm text-muted-foreground">
                      Dernière MAJ : {page.lastUpdate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-destructive font-medium">{page.impressions}%</p>
                    <p className="text-xs text-muted-foreground">impressions</p>
                  </div>
                  <Badge
                    variant={
                      page.impressions < -30 ? "destructive" : page.impressions < -20 ? "secondary" : "outline"
                    }
                  >
                    {page.action}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
