import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Plus, Sparkles, FileText, Video, Mic, Image, Loader2, CheckCircle2, Copy, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface RepurposeSource {
  id: string;
  title: string;
  type: "blog" | "video" | "podcast" | "whitepaper";
  content: string;
  createdAt: Date;
}

interface GeneratedContent {
  id: string;
  platform: string;
  type: string;
  content: string;
  status: "pending" | "approved" | "scheduled";
}

const sourceTypeIcons = {
  blog: FileText,
  video: Video,
  podcast: Mic,
  whitepaper: FileText,
};

const platformOutputs = {
  instagram: ["Carrousel", "Reel", "Story", "Post"],
  linkedin: ["Article", "Post court", "Carrousel"],
  twitter: ["Thread", "Tweet unique", "Citation"],
  tiktok: ["Short", "Voiceover"],
};

export function RepurposeEngine({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation();
  const [sources, setSources] = useState<RepurposeSource[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState<RepurposeSource | null>(null);
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [newSource, setNewSource] = useState({
    title: "",
    type: "blog" as const,
    content: "",
  });

  const [generateOptions, setGenerateOptions] = useState({
    platforms: [] as string[],
    outputTypes: [] as string[],
  });

  const handleAddSource = () => {
    if (!newSource.title || !newSource.content) {
      toast.error(t("components.repurpose.titleContentRequired"));
      return;
    }

    const source: RepurposeSource = {
      id: crypto.randomUUID(),
      title: newSource.title,
      type: newSource.type,
      content: newSource.content,
      createdAt: new Date(),
    };

    setSources(prev => [...prev, source]);
    setNewSource({ title: "", type: "blog", content: "" });
    setShowAddDialog(false);
    toast.success(t("components.repurpose.sourceAdded"));
  };

  const handleGenerate = async () => {
    if (!selectedSource) return;
    if (generateOptions.platforms.length === 0) {
      toast.error(t("components.repurpose.selectPlatform"));
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      const results: GeneratedContent[] = [];
      const totalPlatforms = generateOptions.platforms.length;
      
      for (let i = 0; i < totalPlatforms; i++) {
        const platform = generateOptions.platforms[i];
        setProgress(((i + 0.5) / totalPlatforms) * 100);

        const { data, error } = await supabase.functions.invoke("ai-gateway", {
          body: {
            workspace_id: workspaceId,
            agent_name: "repurpose-engine",
            purpose: "copywriting",
            input: {
              system_prompt: `Tu es un expert en création de contenu pour les réseaux sociaux. 
Tu dois transformer un contenu long en plusieurs micro-contenus adaptés à ${platform}.
Génère du contenu engageant, avec les bons formats et longueurs pour chaque plateforme.
Réponds en JSON avec un array "contents" contenant des objets {type, content}.`,
              user_prompt: `Transforme ce contenu en posts ${platform}:\n\n${selectedSource.content.slice(0, 3000)}`,
              context: {
                source_title: selectedSource.title,
                source_type: selectedSource.type,
                target_platform: platform,
              }
            }
          },
        });

        if (!error && data?.success && data?.artifact) {
          const contents = data.artifact.contents || [{ type: "Post", content: data.artifact.summary }];
          contents.forEach((c: { type: string; content: string }) => {
            results.push({
              id: crypto.randomUUID(),
              platform,
              type: c.type || "Post",
              content: c.content || "",
              status: "pending",
            });
          });
        }

        setProgress(((i + 1) / totalPlatforms) * 100);
      }

      setGeneratedContents(results);
      setShowGenerateDialog(false);
      toast.success(t("components.repurpose.contentsGenerated", { count: results.length }));
    } catch (err) {
      console.error("Generation error:", err);
      toast.error(t("components.repurpose.generationError"));
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  const handleApprove = (id: string) => {
    setGeneratedContents(prev =>
      prev.map(c => c.id === id ? { ...c, status: "approved" as const } : c)
    );
    toast.success(t("components.repurpose.approved"));
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(t("components.repurpose.copied"));
  };

  const togglePlatform = (platform: string) => {
    setGenerateOptions(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Sources */}
      <Card variant="feature">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Repurpose Engine
              </CardTitle>
              <CardDescription>{t("components.repurpose.subtitle")}</CardDescription>
            </div>
            <Button variant="hero" size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("components.repurpose.addSource")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sources.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">{t("components.repurpose.noSource")}</p>
              <p className="text-sm mt-1">{t("components.repurpose.noSourceDesc")}</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t("components.repurpose.addSource")}
              </Button>
            </div>
          ) : (
            sources.map((source) => {
              const Icon = sourceTypeIcons[source.type];
              return (
                <div key={source.id} className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{source.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {source.content.slice(0, 150)}...
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {source.type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => {
                        setSelectedSource(source);
                        setShowGenerateDialog(true);
                      }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t("components.repurpose.generate")}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Generated Contents */}
      {generatedContents.length > 0 && (
        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {t("components.repurpose.generatedContents")}
              <Badge variant="gradient" className="ml-2">{generatedContents.length}</Badge>
            </CardTitle>
            <CardDescription>{t("components.repurpose.approveAndSchedule")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedContents.map((content) => (
              <div key={content.id} className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{content.platform}</Badge>
                    <Badge variant="secondary">{content.type}</Badge>
                  </div>
                  <Badge
                    variant={
                      content.status === "approved"
                        ? "success"
                        : content.status === "scheduled"
                        ? "gradient"
                        : "outline"
                    }
                  >
                    {content.status === "approved"
                      ? t("components.repurpose.statusApproved")
                      : content.status === "scheduled"
                      ? t("components.repurpose.statusScheduled")
                      : t("components.repurpose.statusPending")}
                  </Badge>
                </div>
                <p className="text-sm whitespace-pre-wrap">{content.content}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(content.content)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {t("components.repurpose.copy")}
                  </Button>
                  {content.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(content.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {t("components.repurpose.approve")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Source Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("components.repurpose.addSourceTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("components.repurpose.sourceTitle")}</label>
              <Input
                value={newSource.title}
                onChange={(e) => setNewSource(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t("components.repurpose.sourceTitlePlaceholder")}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={newSource.type}
                onValueChange={(value) => setNewSource(prev => ({ ...prev, type: value as typeof newSource.type }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">{t("components.repurpose.typeBlog")}</SelectItem>
                  <SelectItem value="video">{t("components.repurpose.typeVideo")}</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="whitepaper">{t("components.repurpose.typeWhitepaper")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("components.repurpose.contentLabel")}</label>
              <Textarea
                value={newSource.content}
                onChange={(e) => setNewSource(prev => ({ ...prev, content: e.target.value }))}
                placeholder={t("components.repurpose.contentPlaceholder")}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="hero" onClick={handleAddSource}>
              {t("components.repurpose.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("components.repurpose.generateMicroContents")}</DialogTitle>
          </DialogHeader>
          {generating ? (
            <div className="py-8 space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
              <p className="text-center text-muted-foreground">
                {t("components.repurpose.generatingProgress")}
              </p>
              <Progress value={progress} className="w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Source</label>
                <p className="text-muted-foreground">{selectedSource?.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t("components.repurpose.targetPlatforms")}</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(platformOutputs).map((platform) => (
                    <Badge
                      key={platform}
                      variant={generateOptions.platforms.includes(platform) ? "gradient" : "outline"}
                      className="cursor-pointer"
                      onClick={() => togglePlatform(platform)}
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)} disabled={generating}>
              {t("common.cancel")}
            </Button>
            <Button variant="hero" onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("components.repurpose.generatingProgress")}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("components.repurpose.generate")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
