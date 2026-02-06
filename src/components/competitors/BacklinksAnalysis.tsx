import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Link2, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Download, 
  Search, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowUpRight,
  Globe,
  Shield,
  Target
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface BacklinkData {
  domain: string;
  url: string;
  anchorText: string;
  domainAuthority: number;
  pageAuthority: number;
  isDoFollow: boolean;
  firstSeen: string;
  lastChecked: string;
  status: "active" | "lost" | "new";
}

interface BacklinkMetrics {
  totalBacklinks: number;
  referringDomains: number;
  avgDomainAuthority: number;
  doFollowRatio: number;
  newLast30Days: number;
  lostLast30Days: number;
}

interface CompetitorComparison {
  domain: string;
  backlinks: number;
  referringDomains: number;
  domainAuthority: number;
  commonBacklinks: number;
  uniqueBacklinks: number;
}

export function BacklinksAnalysis() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Demo data - in production, this would come from Ahrefs/Moz API via edge function
  const [metrics, setMetrics] = useState<BacklinkMetrics>({
    totalBacklinks: 0,
    referringDomains: 0,
    avgDomainAuthority: 0,
    doFollowRatio: 0,
    newLast30Days: 0,
    lostLast30Days: 0,
  });

  const [backlinks, setBacklinks] = useState<BacklinkData[]>([]);
  const [competitorComparison, setCompetitorComparison] = useState<CompetitorComparison[]>([]);
  const [opportunities, setOpportunities] = useState<{domain: string; da: number; type: string; reason: string}[]>([]);

  const handleAnalyze = async () => {
    if (!currentSite?.url) {
      toast.error(t("backlinksAnalysis.selectSite"));
      return;
    }

    setAnalyzing(true);
    
    try {
      // Call backlink analysis via Firecrawl or dedicated service
      const { data, error } = await supabase.functions.invoke("seo-crawler", {
        body: {
          action: "backlinks",
          url: currentSite.url,
          workspace_id: currentWorkspace?.id,
          site_id: currentSite.id,
        },
      });

      if (error) throw error;

      if (data?.backlinks) {
        setBacklinks(data.backlinks);
        setMetrics(data.metrics || metrics);
        toast.success(t("backlinksAnalysis.analysisDone"));
      }
    } catch (error) {
      console.error("[Backlinks] Analysis error:", error);
      
      // Generate sample data for demo
      generateSampleData();
      toast.info(t("backlinksAnalysis.demoMode"));
    } finally {
      setAnalyzing(false);
    }
  };

  const generateSampleData = () => {
    const sampleBacklinks: BacklinkData[] = [
      {
        domain: "blog.exemple.fr",
        url: "https://blog.exemple.fr/article-marketing",
        anchorText: "stratégie marketing",
        domainAuthority: 45,
        pageAuthority: 38,
        isDoFollow: true,
        firstSeen: "2024-01-15",
        lastChecked: new Date().toISOString(),
        status: "active",
      },
      {
        domain: "presse-economique.com",
        url: "https://presse-economique.com/startup-2024",
        anchorText: "Growth OS",
        domainAuthority: 62,
        pageAuthority: 55,
        isDoFollow: true,
        firstSeen: "2024-02-01",
        lastChecked: new Date().toISOString(),
        status: "new",
      },
      {
        domain: "annuaire-pro.fr",
        url: "https://annuaire-pro.fr/marketing",
        anchorText: "cliquez ici",
        domainAuthority: 28,
        pageAuthority: 15,
        isDoFollow: false,
        firstSeen: "2023-11-20",
        lastChecked: new Date().toISOString(),
        status: "active",
      },
    ];

    const sampleOpportunities = [
      { domain: "techcrunch.fr", da: 72, type: "Article invité", reason: "Concurrent présent, vous non" },
      { domain: "journaldunet.com", da: 68, type: "Interview", reason: "Couvre votre secteur" },
      { domain: "maddyness.com", da: 65, type: "Tribune", reason: "Accepte les experts" },
      { domain: "frenchweb.fr", da: 58, type: "Communiqué", reason: "Rubrique startup active" },
    ];

    const sampleComparison: CompetitorComparison[] = [
      { domain: "competitor1.com", backlinks: 1250, referringDomains: 180, domainAuthority: 52, commonBacklinks: 23, uniqueBacklinks: 157 },
      { domain: "competitor2.fr", backlinks: 890, referringDomains: 145, domainAuthority: 48, commonBacklinks: 18, uniqueBacklinks: 127 },
      { domain: "competitor3.io", backlinks: 2100, referringDomains: 320, domainAuthority: 61, commonBacklinks: 45, uniqueBacklinks: 275 },
    ];

    setBacklinks(sampleBacklinks);
    setOpportunities(sampleOpportunities);
    setCompetitorComparison(sampleComparison);
    setMetrics({
      totalBacklinks: 156,
      referringDomains: 42,
      avgDomainAuthority: 38,
      doFollowRatio: 72,
      newLast30Days: 8,
      lostLast30Days: 2,
    });
  };

  const handleExport = () => {
    const csvContent = [
      ["Domain", "URL", "Anchor Text", "DA", "PA", "DoFollow", "Status", "First Seen"].join(","),
      ...backlinks.map(b => [
        b.domain,
        b.url,
        `"${b.anchorText}"`,
        b.domainAuthority,
        b.pageAuthority,
        b.isDoFollow ? "Yes" : "No",
        b.status,
        b.firstSeen,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backlinks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("backlinksAnalysis.exportDownloaded"));
  };

  const filteredBacklinks = backlinks.filter(b => 
    b.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.anchorText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Backlinks</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.totalBacklinks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Domaines</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.referringDomains}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">DA Moyen</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.avgDomainAuthority}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">DoFollow</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.doFollowRatio}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Nouveaux</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">+{metrics.newLast30Days}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Perdus</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-destructive">-{metrics.lostLast30Days}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un domaine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={backlinks.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Analyser
          </Button>
        </div>
      </div>

      <Tabs defaultValue="backlinks">
        <TabsList>
          <TabsTrigger value="backlinks">Backlinks ({backlinks.length})</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunités ({opportunities.length})</TabsTrigger>
          <TabsTrigger value="comparison">Comparaison</TabsTrigger>
        </TabsList>

        <TabsContent value="backlinks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profil de backlinks</CardTitle>
              <CardDescription>
                Tous les liens pointant vers votre site
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBacklinks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Aucun backlink détecté</p>
                  <p className="text-sm mt-1">Lancez une analyse pour découvrir vos backlinks</p>
                  <Button variant="outline" className="mt-4" onClick={handleAnalyze} disabled={analyzing}>
                    {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Lancer l'analyse
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBacklinks.map((bl, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{bl.domain}</p>
                          <Badge variant={bl.status === "new" ? "success" : bl.status === "lost" ? "destructive" : "secondary"}>
                            {bl.status === "new" ? "Nouveau" : bl.status === "lost" ? "Perdu" : "Actif"}
                          </Badge>
                          {bl.isDoFollow ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">DoFollow</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">NoFollow</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          Anchor: "{bl.anchorText}"
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">DA</p>
                          <p className="font-bold">{bl.domainAuthority}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">PA</p>
                          <p className="font-bold">{bl.pageAuthority}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={bl.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Opportunités de link building
              </CardTitle>
              <CardDescription>
                Sites où vos concurrents sont présents mais pas vous
              </CardDescription>
            </CardHeader>
            <CardContent>
              {opportunities.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Lancez une analyse pour découvrir les opportunités
                </p>
              ) : (
                <div className="space-y-3">
                  {opportunities.map((opp, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{opp.domain}</p>
                          <Badge variant="gradient">DA {opp.da}</Badge>
                          <Badge variant="outline">{opp.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{opp.reason}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://${opp.domain}`} target="_blank" rel="noopener noreferrer">
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                          Visiter
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparaison concurrentielle</CardTitle>
              <CardDescription>
                Analysez votre profil de backlinks vs vos concurrents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {competitorComparison.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Ajoutez des concurrents pour comparer les profils de backlinks
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Domaine</th>
                        <th className="text-right py-3 px-2">Backlinks</th>
                        <th className="text-right py-3 px-2">Domaines</th>
                        <th className="text-right py-3 px-2">DA</th>
                        <th className="text-right py-3 px-2">Communs</th>
                        <th className="text-right py-3 px-2">Uniques</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-3 px-2 font-medium">Votre site</td>
                        <td className="py-3 px-2 text-right">{metrics.totalBacklinks}</td>
                        <td className="py-3 px-2 text-right">{metrics.referringDomains}</td>
                        <td className="py-3 px-2 text-right">{metrics.avgDomainAuthority}</td>
                        <td className="py-3 px-2 text-right">-</td>
                        <td className="py-3 px-2 text-right">-</td>
                      </tr>
                      {competitorComparison.map((comp, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-3 px-2">{comp.domain}</td>
                          <td className="py-3 px-2 text-right">{comp.backlinks.toLocaleString()}</td>
                          <td className="py-3 px-2 text-right">{comp.referringDomains}</td>
                          <td className="py-3 px-2 text-right">
                            <Badge variant={comp.domainAuthority > metrics.avgDomainAuthority ? "destructive" : "success"}>
                              {comp.domainAuthority}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-right">{comp.commonBacklinks}</td>
                          <td className="py-3 px-2 text-right text-primary font-medium">
                            {comp.uniqueBacklinks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BacklinksAnalysis;
