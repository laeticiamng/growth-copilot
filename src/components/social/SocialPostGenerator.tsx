/**
 * Social Post Generator Component
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Loader2, CheckCircle, Instagram, Linkedin, Twitter, Facebook, Clock, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useMeta } from "@/hooks/useMeta";
import { useTranslation } from "react-i18next";

interface PostVariant {
  content: string;
  hashtags: string[];
  charCount: number;
  platform_limit: number;
}

interface SocialResult {
  variants: PostVariant[];
  optimal_time: { day: string; time: string; reasoning: string; };
  cta: string;
}

const platforms = [
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, limit: 3000, color: "text-blue-600" },
  { id: "instagram", name: "Instagram", icon: Instagram, limit: 2200, color: "text-pink-500" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, limit: 280, color: "text-sky-500" },
  { id: "facebook", name: "Facebook", icon: Facebook, limit: 63206, color: "text-blue-500" },
];

export function SocialPostGenerator() {
  const { t } = useTranslation();
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
      toast.error(t("components.socialPost.enterTopic"));
      return;
    }
    if (!currentWorkspace) {
      toast.error(t("components.socialPost.noWorkspace"));
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t("components.socialPost.pleaseLogin"));
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
}`;

      const userPrompt = `Génère 3 variantes de posts ${currentPlatform.name} pour ce sujet :\n\n${topic}\n\nLa limite de caractères pour ${currentPlatform.name} est de ${currentPlatform.limit} caractères.`;

      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          workspace_id: currentWorkspace.id,
          agent_name: "social_media",
          purpose: "copywriting",
          input: { system_prompt: systemPrompt, user_prompt: userPrompt, context: { platform: selectedPlatform, platform_name: currentPlatform.name, char_limit: currentPlatform.limit } }
        }
      });

      if (error) throw error;

      if (data?.success && data?.artifact?.social_posts) {
        setResult(data.artifact.social_posts as SocialResult);
        toast.success(t("components.socialPost.generated"));
      } else {
        throw new Error(data?.error || t("components.socialPost.generationError"));
      }
    } catch (err) {
      console.error("Social post generation error:", err);
      toast.error(t("components.socialPost.generationError"));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (variant: PostVariant, index: number) => {
    const fullPost = `${variant.content}\n\n${variant.hashtags.map(h => `#${h}`).join(" ")}`;
    navigator.clipboard.writeText(fullPost);
    setCopiedIndex(index);
    toast.success(t("components.socialPost.copied"));
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePublishMeta = async (variant: PostVariant) => {
    if (!isMetaConnected) {
      toast.error(t("components.socialPost.connectMeta"));
      return;
    }
    toast.info(t("components.socialPost.publishInProgress"));
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
            <CardTitle>{t("components.socialPost.title")}</CardTitle>
            <CardDescription>{t("components.socialPost.subtitle")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => {
            const PIcon = platform.icon;
            return (
              <Button key={platform.id} variant={selectedPlatform === platform.id ? "default" : "outline"} onClick={() => setSelectedPlatform(platform.id)} className="flex items-center gap-2">
                <PIcon className={`w-4 h-4 ${selectedPlatform === platform.id ? "" : platform.color}`} />
                {platform.name}
              </Button>
            );
          })}
        </div>

        <div className="space-y-2">
          <Textarea placeholder={t("components.socialPost.topicPlaceholder")} value={topic} onChange={(e) => setTopic(e.target.value)} rows={4} />
          <p className="text-xs text-muted-foreground">
            {t("components.socialPost.limit")} {currentPlatform.name} : {currentPlatform.limit.toLocaleString()} {t("components.socialPost.characters")}
          </p>
        </div>

        <Button variant="hero" onClick={handleGenerate} disabled={generating || !topic.trim()} className="w-full">
          {generating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("components.socialPost.generating")}</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" />{t("components.socialPost.generateVariants")}</>
          )}
        </Button>

        {generating && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground">{t("components.socialPost.creatingPosts")}</p>
          </div>
        )}

        {result && !generating && (
          <div className="space-y-6">
            {result.optimal_time && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{t("components.socialPost.bestTime")} : {result.optimal_time.day} {t("components.socialPost.at")} {result.optimal_time.time}</p>
                  <p className="text-sm text-muted-foreground">{result.optimal_time.reasoning}</p>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {result.variants?.map((variant, i) => (
                <Card key={i} variant="feature" className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <Badge variant="secondary">{t("components.socialPost.variant")} {i + 1}</Badge>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(variant, i)}>
                          {copiedIndex === i ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        {(selectedPlatform === "instagram" || selectedPlatform === "facebook") && isMetaConnected && (
                          <Button variant="outline" size="sm" onClick={() => handlePublishMeta(variant)}>
                            <Send className="w-4 h-4 mr-1" />{t("components.socialPost.publish")}
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap">{variant.content}</p>
                    <div className="flex flex-wrap gap-1">
                      {variant.hashtags?.map((tag, j) => (
                        <Badge key={j} variant="outline" className="text-xs">#{tag}</Badge>
                      ))}
                    </div>
                    <p className={`text-xs ${variant.charCount > variant.platform_limit ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {variant.charCount}/{variant.platform_limit} {t("components.socialPost.characters")}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {result.cta && (
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm">
                  <span className="font-medium">{t("components.socialPost.recommendedCTA")} :</span> {result.cta}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
