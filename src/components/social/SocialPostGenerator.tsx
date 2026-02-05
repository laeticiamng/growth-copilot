/**
 * Social Post Generator Component
 * Agent: Social Media Manager
 * Generates: Platform-specific posts with hashtags and optimal timing
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Copy, 
  Loader2, 
  CheckCircle,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Clock,
  Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useMeta } from "@/hooks/useMeta";

interface PostVariant {
  content: string;
  hashtags: string[];
  charCount: number;
  platform_limit: number;
}

interface SocialResult {
  variants: PostVariant[];
  optimal_time: {
    day: string;
    time: string;
    reasoning: string;
  };
  cta: string;
}

const platforms = [
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, limit: 3000, color: "text-blue-600" },
  { id: "instagram", name: "Instagram", icon: Instagram, limit: 2200, color: "text-pink-500" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, limit: 280, color: "text-sky-500" },
  { id: "facebook", name: "Facebook", icon: Facebook, limit: 63206, color: "text-blue-500" },
];

export function SocialPostGenerator() {
  const { currentWorkspace } = useWorkspace();
  const metaContext = useMeta();
  const isMetaConnected = (metaContext?.adAccounts?.length || 0) > 0;
  const [selectedPlatform, setSelectedPlatform] = useState("linkedin");
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<SocialResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const currentPlatform = platforms.find(p => p.id === selectedPlatform)!;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Saisissez un sujet ou collez un article");
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

      const systemPrompt = `Tu es un expert en social media marketing. Tu crées du contenu viral et engageant adapté à chaque plateforme.

MISSION : Générer 3 variantes de posts pour ${currentPlatform.name}.

Tu dois retourner un JSON avec cette structure exacte :
{
  "summary": "Résumé (1-2 phrases)",
  "actions": [],
  "risks": [],
  "dependencies": [],
  "metrics_to_watch": ["engagement_rate", "reach", "shares"],
  "requires_approval": false,
  "social_posts": {
    "variants": [
      {
        "content": "Contenu du post sans les hashtags",
        "hashtags": ["hashtag1", "hashtag2"],
        "charCount": 150,
        "platform_limit": ${currentPlatform.limit}
      }
    ],
    "optimal_time": {
      "day": "Mardi",
      "time": "9h00",
      "reasoning": "Justification basée sur les données"
    },
    "cta": "Call-to-action recommandé"
  }
}

RÈGLES PAR PLATEFORME :
- LinkedIn : Ton professionnel, storytelling, 3-5 hashtags, 1500-2000 caractères idéal
- Instagram : Ton inspirant/lifestyle, emojis, 5-15 hashtags, structure accrocheuse
- Twitter/X : Concis, percutant, 1-3 hashtags, max 280 caractères
- Facebook : Conversationnel, questions, 1-3 hashtags, longueur variable

RÈGLES GÉNÉRALES :
- Génère exactement 3 variantes
- Adapte le ton à la plateforme
- Inclus des emojis pertinents (sauf LinkedIn si trop pro)
- Les hashtags doivent être en français ou anglais selon le contexte`;

      const userPrompt = `Génère 3 variantes de posts ${currentPlatform.name} pour ce sujet :

${topic}

La limite de caractères pour ${currentPlatform.name} est de ${currentPlatform.limit} caractères.`;

      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          workspace_id: currentWorkspace.id,
          agent_name: "social_media",
          purpose: "copywriting",
          input: {
            system_prompt: systemPrompt,
            user_prompt: userPrompt,
            context: {
              platform: selectedPlatform,
              platform_name: currentPlatform.name,
              char_limit: currentPlatform.limit,
            }
          }
        }
      });

      if (error) throw error;

      if (data?.success && data?.artifact?.social_posts) {
        setResult(data.artifact.social_posts as SocialResult);
        toast.success("Posts générés avec succès !");
      } else {
        throw new Error(data?.error || "Erreur lors de la génération");
      }
    } catch (err) {
      console.error("Social post generation error:", err);
      toast.error("Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (variant: PostVariant, index: number) => {
    const fullPost = `${variant.content}\n\n${variant.hashtags.map(h => `#${h}`).join(" ")}`;
    navigator.clipboard.writeText(fullPost);
    setCopiedIndex(index);
    toast.success("Post copié !");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePublishMeta = async (variant: PostVariant) => {
    if (!isMetaConnected) {
      toast.error("Connectez Meta Business pour publier");
      return;
    }
    
    // TODO: Implement meta-capi publishing
    toast.info("Publication en cours de développement");
  };

  const Icon = currentPlatform.icon;

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Icon className={`w-5 h-5 ${currentPlatform.color}`} />
          </div>
          <div>
            <CardTitle>Générateur de Posts Social Media</CardTitle>
            <CardDescription>
              Créez du contenu adapté à chaque plateforme
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Selector */}
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => {
            const PIcon = platform.icon;
            return (
              <Button
                key={platform.id}
                variant={selectedPlatform === platform.id ? "default" : "outline"}
                onClick={() => setSelectedPlatform(platform.id)}
                className="flex items-center gap-2"
              >
                <PIcon className={`w-4 h-4 ${selectedPlatform === platform.id ? "" : platform.color}`} />
                {platform.name}
              </Button>
            );
          })}
        </div>

        {/* Topic Input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Saisissez votre sujet ou collez un article existant..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Limite {currentPlatform.name} : {currentPlatform.limit.toLocaleString()} caractères
          </p>
        </div>

        <Button 
          variant="hero" 
          onClick={handleGenerate} 
          disabled={generating || !topic.trim()}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Générer 3 variantes
            </>
          )}
        </Button>

        {/* Loading State */}
        {generating && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Création de vos posts...</p>
          </div>
        )}

        {/* Results */}
        {result && !generating && (
          <div className="space-y-6">
            {/* Optimal Time */}
            {result.optimal_time && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">
                    Meilleur moment : {result.optimal_time.day} à {result.optimal_time.time}
                  </p>
                  <p className="text-sm text-muted-foreground">{result.optimal_time.reasoning}</p>
                </div>
              </div>
            )}

            {/* Variants */}
            <div className="grid gap-4">
              {result.variants?.map((variant, i) => (
                <Card key={i} variant="feature" className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <Badge variant="secondary">Variante {i + 1}</Badge>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCopy(variant, i)}
                        >
                          {copiedIndex === i ? (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        {(selectedPlatform === "instagram" || selectedPlatform === "facebook") && isMetaConnected && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePublishMeta(variant)}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Publier
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className="whitespace-pre-wrap">{variant.content}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {variant.hashtags?.map((tag, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className={`text-xs ${variant.charCount > variant.platform_limit ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {variant.charCount}/{variant.platform_limit} caractères
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {/* CTA Recommendation */}
            {result.cta && (
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm">
                  <span className="font-medium">CTA recommandé :</span> {result.cta}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
