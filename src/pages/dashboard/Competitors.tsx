import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Target,
  FileText,
  Link,
  Eye,
  RefreshCw,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

const competitors = [
  {
    name: "Concurrent A",
    url: "concurrent-a.fr",
    lastAnalyzed: "Il y a 2 jours",
    domainAuthority: 45,
    organicKeywords: 1250,
    traffic: "25K",
    trend: "up",
  },
  {
    name: "Concurrent B",
    url: "concurrent-b.com",
    lastAnalyzed: "Il y a 5 jours",
    domainAuthority: 52,
    organicKeywords: 2100,
    traffic: "42K",
    trend: "up",
  },
  {
    name: "Concurrent C",
    url: "concurrent-c.fr",
    lastAnalyzed: "Il y a 1 semaine",
    domainAuthority: 38,
    organicKeywords: 890,
    traffic: "18K",
    trend: "down",
  },
];

const keywordGaps = [
  { keyword: "audit seo gratuit", competitorRank: 3, yourRank: 0, volume: 2400, difficulty: 45 },
  { keyword: "agence seo lyon", competitorRank: 5, yourRank: 0, volume: 1800, difficulty: 52 },
  { keyword: "prix référencement", competitorRank: 2, yourRank: 18, volume: 1200, difficulty: 38 },
  { keyword: "consultant seo freelance", competitorRank: 4, yourRank: 22, volume: 880, difficulty: 35 },
];

const contentGaps = [
  { topic: "Guide complet E-commerce SEO", competitors: 3, youHave: false, priority: "high" },
  { topic: "Templates audits SEO", competitors: 2, youHave: false, priority: "high" },
  { topic: "Case studies clients", competitors: 3, youHave: true, priority: "medium" },
  { topic: "Calculateur ROI SEO", competitors: 2, youHave: false, priority: "medium" },
];

export default function Competitors() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Veille concurrentielle</h1>
          <p className="text-muted-foreground">
            Analysez vos concurrents et identifiez les opportunités
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter concurrent
          </Button>
        </div>
      </div>

      {/* Compliance notice */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Analyse éthique uniquement</p>
              <p className="text-xs text-muted-foreground">
                Crawl public safe • Pas de copie de contenu • Insights pour inspiration uniquement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitors grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {competitors.map((comp, i) => (
          <Card key={i} variant="feature">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{comp.name}</h3>
                  <p className="text-sm text-muted-foreground">{comp.url}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">DA</p>
                  <p className="font-bold text-lg">{comp.domainAuthority}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Keywords</p>
                  <p className="font-bold text-lg">{comp.organicKeywords.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trafic</p>
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-lg">{comp.traffic}</p>
                    {comp.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Analysé</p>
                  <p className="text-sm">{comp.lastAnalyzed}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Analyser
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="keywords" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keywords">
            <Target className="w-4 h-4 mr-2" />
            Keyword gaps
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="w-4 h-4 mr-2" />
            Content gaps
          </TabsTrigger>
          <TabsTrigger value="backlinks">
            <Link className="w-4 h-4 mr-2" />
            Backlinks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Opportunités mots-clés</CardTitle>
                  <CardDescription>
                    Mots-clés sur lesquels vos concurrents se positionnent mais pas vous
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer briefs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Mot-clé</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Concurrent</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Vous</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Volume</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Difficulté</th>
                      <th className="text-center py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywordGaps.map((kw, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/50">
                        <td className="py-3 px-2 font-medium">{kw.keyword}</td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="gradient">#{kw.competitorRank}</Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          {kw.yourRank === 0 ? (
                            <Badge variant="outline">—</Badge>
                          ) : (
                            <Badge variant="secondary">#{kw.yourRank}</Badge>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right text-muted-foreground">
                          {kw.volume.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={kw.difficulty} className="w-12 h-1.5" />
                            <span className="text-xs">{kw.difficulty}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Button variant="ghost" size="sm">
                            <Plus className="w-4 h-4" />
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

        <TabsContent value="content" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>Opportunités contenu</CardTitle>
              <CardDescription>
                Contenus que vos concurrents ont et que vous n'avez pas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {contentGaps.map((gap, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{gap.topic}</p>
                      {gap.youHave ? (
                        <Badge variant="secondary">Vous l'avez</Badge>
                      ) : (
                        <Badge variant={gap.priority === "high" ? "destructive" : "outline"}>
                          {gap.priority === "high" ? "Prioritaire" : "Moyen"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {gap.competitors} concurrent(s) ont ce contenu
                    </p>
                  </div>
                  {!gap.youHave && (
                    <Button variant="outline" size="sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Créer brief
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backlinks" className="space-y-6">
          <Card variant="feature">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-2">Analyse backlinks</p>
                <p className="text-sm">
                  Comparez les profils de backlinks pour identifier des opportunités
                </p>
                <Button variant="outline" className="mt-4">
                  <Search className="w-4 h-4 mr-2" />
                  Lancer l'analyse
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
