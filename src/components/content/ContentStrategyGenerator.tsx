/**
 * Content Strategy Generator Component
 * Agent: Thomas Laurent (Content Strategist)
 * Generates: Content plan, Brief, and Draft from a keyword/topic
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  FileText, 
  Copy, 
  Download, 
  Loader2, 
  CheckCircle,
  Target,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import ReactMarkdown from "react-markdown";

interface ContentPlanItem {
  title: string;
  angle: string;
  keyword: string;
  estimated_volume: number;
  priority: "high" | "medium" | "low";
}

interface ContentBrief {
  h1: string;
  meta_description: string;
  structure: {
    tag: string;
    text: string;
  }[];
  key_points: string[];
  cta: string;
  target_length: number;
}

interface ContentDraft {
  title: string;
  content: string;
  word_count: number;
}

interface ContentStrategyResult {
  plan: ContentPlanItem[];
  brief: ContentBrief;
  draft: ContentDraft;
}

export function ContentStrategyGenerator() {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [keyword, setKeyword] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<ContentStrategyResult | null>(null);
  const [activeTab, setActiveTab] = useState("plan");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      toast.error("Veuillez saisir un mot-clé ou sujet");
      return;
    }

    if (!currentWorkspace) {
      toast.error("Aucun workspace sélectionné");
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Veuillez vous connecter");
        setGenerating(false);
        return;
      }

      const systemPrompt = `Tu es Thomas Laurent, Content Strategist senior avec 12 ans d'expérience en stratégie éditoriale et SEO. Tu maîtrises les méthodologies des Grandes Écoles (HEC) et appliques une rigueur statistique dans tes analyses.

MISSION : Générer une stratégie de contenu complète pour le mot-clé/sujet fourni.

Tu dois retourner un JSON avec cette structure exacte :
{
  "summary": "Résumé de la stratégie (1-2 phrases)",
  "actions": [],
  "risks": [],
  "dependencies": [],
  "metrics_to_watch": ["organic_traffic", "keyword_rankings", "time_on_page"],
  "requires_approval": false,
  "content_strategy": {
    "plan": [
      {
        "title": "Titre de l'article",
        "angle": "Angle éditorial unique",
        "keyword": "mot-clé cible",
        "estimated_volume": 1500,
        "priority": "high"
      }
    ],
    "brief": {
      "h1": "Titre H1 optimisé SEO",
      "meta_description": "Meta description de 155 caractères max",
      "structure": [
        {"tag": "H2", "text": "Titre de section"},
        {"tag": "H3", "text": "Sous-section"}
      ],
      "key_points": ["Point clé 1", "Point clé 2"],
      "cta": "Call-to-action recommandé",
      "target_length": 2000
    },
    "draft": {
      "title": "Titre de l'article",
      "content": "Contenu complet en markdown avec H2, H3, paragraphes, listes...",
      "word_count": 2000
    }
  }
}

RÈGLES :
- Génère exactement 5 articles dans le plan
- Le brief concerne le premier article du plan
- Le draft est un article complet de 1500-2500 mots en français
- Optimise pour le SEO (mots-clés, structure, lisibilité)
- Adopte un ton professionnel mais accessible
- Inclus des données chiffrées quand pertinent`;

      const userPrompt = `Génère une stratégie de contenu complète pour ce mot-clé/sujet : "${keyword}"
      
${currentSite ? `Contexte du site :
- URL : ${currentSite.url}
- Nom : ${currentSite.name}
- Secteur : ${currentSite.sector || "Non spécifié"}` : ""}

Génère :
1. Un plan de 5 articles avec titres, angles, mots-clés cibles et volumes estimés
2. Un brief détaillé pour le premier article (structure H1/H2/H3, points clés, CTA)
3. Un draft complet de l'article en markdown (1500-2500 mots)`;

      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          workspace_id: currentWorkspace.id,
          agent_name: "content_strategist",
          purpose: "copywriting",
          input: {
            system_prompt: systemPrompt,
            user_prompt: userPrompt,
            context: {
              keyword,
              site_url: currentSite?.url,
              site_name: currentSite?.name,
              sector: currentSite?.sector,
            }
          }
        }
      });

      if (error) throw error;

      if (data?.success && data?.artifact?.content_strategy) {
        const strategy = data.artifact.content_strategy as ContentStrategyResult;
        setResult(strategy);
        toast.success("Stratégie de contenu générée avec succès !");
        
        // Save to content_briefs table
        if (currentSite) {
          const briefContent = JSON.parse(JSON.stringify({
            plan: strategy.plan,
            brief: strategy.brief,
            draft: strategy.draft,
          }));
          
          await supabase.from("content_briefs").insert([{
            workspace_id: currentWorkspace.id,
            site_id: currentSite.id,
            title: strategy.brief.h1 || `Brief: ${keyword}`,
            target_keyword: keyword,
            word_count_target: strategy.brief.target_length,
            brief_content: briefContent,
            status: "draft" as const,
          }]);
        }
      } else {
        throw new Error(data?.error || "Erreur lors de la génération");
      }
    } catch (err) {
      console.error("Content strategy generation error:", err);
      toast.error("Erreur lors de la génération de la stratégie");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!result?.draft?.content) return;
    navigator.clipboard.writeText(result.draft.content);
    setCopied(true);
    toast.success("Markdown copié dans le presse-papier");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportDocx = () => {
    if (!result?.draft) return;
    
    // Create a simple HTML document that can be opened in Word
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${result.draft.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 24px; color: #333; }
    h2 { font-size: 20px; color: #444; margin-top: 24px; }
    h3 { font-size: 16px; color: #555; margin-top: 16px; }
    p { line-height: 1.6; color: #333; }
    ul, ol { margin: 16px 0; padding-left: 24px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <h1>${result.draft.title}</h1>
  ${result.draft.content.replace(/\n/g, '<br>')}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.draft.title.replace(/[^a-z0-9]/gi, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Document exporté");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Générateur de Stratégie de Contenu</CardTitle>
            <CardDescription>
              Agent Thomas Laurent — Content Strategist
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="flex gap-3">
          <Input
            placeholder="Entrez un mot-clé ou sujet (ex: marketing automation B2B)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !generating && handleGenerate()}
            className="flex-1"
            disabled={generating}
          />
          <Button 
            variant="hero" 
            onClick={handleGenerate} 
            disabled={generating || !keyword.trim()}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Générer
              </>
            )}
          </Button>
        </div>

        {/* Loading State */}
        {generating && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-medium">Thomas Laurent analyse votre sujet...</p>
              <p className="text-sm text-muted-foreground">
                Création du plan de contenu, du brief et du draft
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && !generating && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="plan" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Plan de contenu
              </TabsTrigger>
              <TabsTrigger value="brief" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Brief
              </TabsTrigger>
              <TabsTrigger value="draft" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Draft
              </TabsTrigger>
            </TabsList>

            {/* Content Plan Tab */}
            <TabsContent value="plan" className="space-y-4">
              <div className="grid gap-4">
                {result.plan?.map((item, index) => (
                  <Card key={index} variant="feature" className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                          <h4 className="font-semibold">{item.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.angle}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">
                            <Target className="w-3 h-3 mr-1" />
                            {item.keyword}
                          </Badge>
                          <Badge variant="outline">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {item.estimated_volume?.toLocaleString() || 0} vol/mois
                          </Badge>
                          <Badge variant={getPriorityColor(item.priority)}>
                            {item.priority === "high" ? "Priorité haute" : 
                             item.priority === "medium" ? "Priorité moyenne" : "Priorité basse"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Brief Tab */}
            <TabsContent value="brief" className="space-y-4">
              <Card variant="feature" className="p-6 space-y-6">
                {/* H1 */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Titre H1</h4>
                  <p className="text-lg font-semibold">{result.brief?.h1}</p>
                </div>

                {/* Meta Description */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Meta Description</h4>
                  <p className="text-sm bg-secondary/50 p-3 rounded-lg">
                    {result.brief?.meta_description}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({result.brief?.meta_description?.length || 0} caractères)
                    </span>
                  </p>
                </div>

                {/* Structure */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Structure</h4>
                  <div className="space-y-2">
                    {result.brief?.structure?.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {item.tag}
                        </Badge>
                        <span className="text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Points */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Points clés à couvrir</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.brief?.key_points?.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>

                {/* CTA & Target Length */}
                <div className="flex gap-6">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">CTA recommandé</h4>
                    <p className="text-sm bg-primary/10 p-3 rounded-lg">{result.brief?.cta}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Longueur cible</h4>
                    <p className="text-2xl font-bold">{result.brief?.target_length?.toLocaleString()} mots</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Draft Tab */}
            <TabsContent value="draft" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="gradient">
                    {result.draft?.word_count?.toLocaleString() || 0} mots
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Article généré par IA
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copier Markdown
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportDocx}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter .doc
                  </Button>
                </div>
              </div>

              <Card variant="feature" className="p-6">
                <article className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{result.draft?.content || ""}</ReactMarkdown>
                </article>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {!result && !generating && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Entrez un mot-clé ou sujet pour générer votre stratégie de contenu</p>
            <p className="text-sm mt-2">
              Thomas Laurent créera un plan de 5 articles, un brief détaillé et un draft complet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
