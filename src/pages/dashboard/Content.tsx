import { useState } from "react";
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
  Target,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { useSites } from "@/hooks/useSites";
import { LoadingState } from "@/components/ui/loading-state";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Content() {
  const { currentSite } = useSites();
  const { keywords, clusters, briefs, loading, refetch } = useContent();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await refetch();
    setSyncing(false);
  };

  // Real data only - no demo fallback (Zero Fake Data policy)
  const displayKeywords = keywords.slice(0, 5).map(k => ({
    keyword: k.keyword,
    volume: k.search_volume || 0,
    position: Math.round(k.position_avg || 0),
    change: 0, // Would need historical data to calculate
    intent: k.intent || 'info',
  }));

  const displayClusters = clusters.map(c => ({
    name: c.name,
    keywords: c.keywords_count || 0,
    volume: c.total_volume || 0,
    status: c.main_intent || 'new',
  }));

  const displayBriefs = briefs.map(b => ({
    id: b.id,
    title: b.title,
    keyword: b.target_keyword || '',
    status: b.status || 'draft',
    wordCount: b.word_count_target || 0,
  }));

  if (loading) {
    return <LoadingState message="Chargement du contenu..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contenu & Mots-clés</h1>
          <p className="text-muted-foreground">Stratégie de contenu et opportunités SEO</p>
          {!currentSite && <p className="text-sm text-muted-foreground mt-1">⚠️ Sélectionnez un site pour voir vos données</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync GSC
          </Button>
          <Button 
            variant="hero"
            onClick={async () => {
              if (!currentSite) {
                toast.error("Sélectionnez un site d'abord");
                return;
              }
              setSyncing(true);
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                  toast.error("Veuillez vous connecter");
                  setSyncing(false);
                  return;
                }
                
                const { data, error } = await supabase.functions.invoke("ai-gateway", {
                  body: {
                    workspace_id: currentSite.workspace_id,
                    agent_name: "content_strategist",
                    purpose: "copywriting",
                    input: {
                      system_prompt: "Tu es un stratège de contenu SEO. Génère un brief de contenu détaillé en français avec un format JSON structuré.",
                      user_prompt: `Génère un brief pour un article optimisé SEO pour le site ${currentSite.url}. Inclus: titre, H2s suggérés, mots-clés cibles, longueur recommandée.`,
                      context: {
                        site_url: currentSite.url,
                        site_name: currentSite.name,
                        sector: currentSite.sector,
                      }
                    }
                  }
                });
                if (error) throw error;
                if (data?.success) {
                  toast.success("Brief généré avec succès");
                  refetch();
                } else {
                  toast.error(data?.error || "Erreur lors de la génération");
                }
              } catch (err) {
                console.error("Brief generation error:", err);
                toast.error("Erreur lors de la génération du brief");
              } finally {
                setSyncing(false);
              }
            }}
            disabled={syncing || !currentSite}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Générer brief
          </Button>
        </div>
      </div>

      <Tabs defaultValue="keywords" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="keywords">Mots-clés</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card variant="kpi"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Mots-clés suivis</p><p className="text-3xl font-bold">{keywords.length || 0}</p></CardContent></Card>
            <Card variant="kpi"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Top 10</p><p className="text-3xl font-bold">{keywords.filter(k => (k.position_avg || 0) <= 10).length}</p></CardContent></Card>
            <Card variant="kpi"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Volume total</p><p className="text-3xl font-bold">{keywords.reduce((sum, k) => sum + (k.search_volume || 0), 0).toLocaleString()}</p></CardContent></Card>
            <Card variant="kpi"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Opportunités</p><p className="text-3xl font-bold">{keywords.filter(k => (k.position_avg || 0) > 10 && (k.position_avg || 0) <= 30).length}</p></CardContent></Card>
          </div>

          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mots-clés principaux</CardTitle>
                <Button variant="ghost" size="sm">Voir tout<ArrowRight className="w-4 h-4 ml-1" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Mot-clé</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Volume</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Position</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Évolution</th>
                  </tr>
                </thead>
                <tbody>
                  {displayKeywords.map((kw, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/50">
                      <td className="py-3 px-2 font-medium">{kw.keyword}</td>
                      <td className="py-3 px-2 text-right text-muted-foreground">{kw.volume.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right"><Badge variant={kw.position <= 10 ? "gradient" : "secondary"}>#{kw.position}</Badge></td>
                      <td className="py-3 px-2 text-right">
                        <span className={`flex items-center justify-end gap-1 ${kw.change > 0 ? "text-green-500" : "text-destructive"}`}>
                          {kw.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {Math.abs(kw.change)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {displayClusters.map((cluster, i) => (
              <Card key={i} variant="feature" className="hover:border-primary/50 cursor-pointer transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={cluster.status === "mapped" ? "gradient" : "secondary"}>
                      {cluster.status === "mapped" ? "Mappé" : "Nouveau"}
                    </Badge>
                    <Target className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{cluster.name}</h3>
                  <p className="text-sm text-muted-foreground">{cluster.keywords} mots-clés • {cluster.volume.toLocaleString()} vol.</p>
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
                <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Nouveau brief</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {displayBriefs.map((content) => (
                <div key={content.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{content.title}</p>
                    <p className="text-sm text-muted-foreground">Cible : "{content.keyword}" • {content.wordCount} mots</p>
                  </div>
                  <Badge variant={content.status === "published" ? "gradient" : "outline"}>
                    {content.status === "published" ? "Publié" : "Brouillon"}
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
