import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
  FileWarning,
  Link2,
  Gauge,
  Code,
  ArrowRight,
  Play,
} from "lucide-react";

const auditScore = 72;

const issueCategories = [
  { name: "Indexation", count: 3, severity: "high" },
  { name: "Performance", count: 8, severity: "medium" },
  { name: "Contenu", count: 12, severity: "low" },
  { name: "Liens", count: 5, severity: "medium" },
  { name: "Technique", count: 4, severity: "high" },
];

const issues = [
  {
    id: 1,
    title: "Pages non indexables",
    description: "12 pages ont des balises noindex ou sont bloquées par robots.txt",
    severity: "critical",
    category: "Indexation",
    autoFixable: false,
    impact: 90,
  },
  {
    id: 2,
    title: "Balises title dupliquées",
    description: "8 pages partagent le même title, ce qui nuit au SEO",
    severity: "high",
    category: "Contenu",
    autoFixable: true,
    impact: 75,
  },
  {
    id: 3,
    title: "Images sans attribut alt",
    description: "45 images n'ont pas d'attribut alt descriptif",
    severity: "medium",
    category: "Contenu",
    autoFixable: true,
    impact: 60,
  },
  {
    id: 4,
    title: "Liens internes cassés",
    description: "15 liens pointent vers des pages 404",
    severity: "high",
    category: "Liens",
    autoFixable: false,
    impact: 80,
  },
  {
    id: 5,
    title: "LCP trop lent",
    description: "Largest Contentful Paint à 4.2s sur mobile (objectif < 2.5s)",
    severity: "high",
    category: "Performance",
    autoFixable: false,
    impact: 85,
  },
];

const crawlStats = {
  pagesTotal: 156,
  pagesIndexed: 142,
  errors404: 12,
  redirects: 8,
  lastCrawl: "Il y a 2 heures",
};

export default function SEOTech() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">SEO Technique</h1>
          <p className="text-muted-foreground">
            Audit technique et optimisations du site
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Nouveau crawl
          </Button>
          <Button variant="hero">
            <Play className="w-4 h-4 mr-2" />
            Corriger auto
          </Button>
        </div>
      </div>

      {/* Score + Stats */}
      <div className="grid lg:grid-cols-4 gap-6">
        <Card variant="gradient" className="lg:col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  strokeWidth="12"
                  fill="none"
                  className="stroke-background/30"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${auditScore * 3.52} 352`}
                  className="stroke-primary-foreground transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{auditScore}</span>
              </div>
            </div>
            <p className="font-medium">Score SEO</p>
            <p className="text-sm opacity-80">+5 pts ce mois</p>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
          <Card variant="feature">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{crawlStats.pagesIndexed}</p>
                  <p className="text-sm text-muted-foreground">Pages indexées</p>
                </div>
              </div>
              <Progress value={(crawlStats.pagesIndexed / crawlStats.pagesTotal) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                sur {crawlStats.pagesTotal} pages totales
              </p>
            </CardContent>
          </Card>

          <Card variant="feature">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <FileWarning className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{crawlStats.errors404}</p>
                  <p className="text-sm text-muted-foreground">Erreurs 404</p>
                </div>
              </div>
              <Badge variant="destructive" className="text-xs">
                À corriger en priorité
              </Badge>
            </CardContent>
          </Card>

          <Card variant="feature">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Dernier crawl</p>
                  <p className="text-sm text-muted-foreground">{crawlStats.lastCrawl}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2">
                Voir l'historique
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Issues */}
      <Card variant="feature">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Problèmes détectés</CardTitle>
              <CardDescription>
                {issues.length} problèmes à résoudre, triés par impact
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {issueCategories.map((cat) => (
                <Badge
                  key={cat.name}
                  variant={cat.severity === "high" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {cat.name} ({cat.count})
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="critical">Critiques</TabsTrigger>
              <TabsTrigger value="fixable">Auto-corrigibles</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4 space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        issue.severity === "critical"
                          ? "text-destructive"
                          : issue.severity === "high"
                          ? "text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{issue.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {issue.category}
                      </Badge>
                      {issue.autoFixable && (
                        <Badge variant="gradient" className="text-xs">
                          Auto-corrigible
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Impact SEO</span>
                        <Progress value={issue.impact} className="w-20 h-1.5" />
                        <span className="text-xs font-medium">{issue.impact}%</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    {issue.autoFixable ? "Corriger" : "Voir"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="critical" className="mt-4">
              <p className="text-muted-foreground text-center py-8">
                Filtrer les problèmes critiques
              </p>
            </TabsContent>
            <TabsContent value="fixable" className="mt-4">
              <p className="text-muted-foreground text-center py-8">
                Afficher les problèmes auto-corrigibles
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
