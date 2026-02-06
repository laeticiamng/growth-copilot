import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Calendar,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Download,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useSocial } from "@/hooks/useSocial";
import { useSites } from "@/hooks/useSites";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/loading-state";
import { RepurposeEngine } from "@/components/social/RepurposeEngine";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { ModuleEmptyState, NoSiteEmptyState } from "@/components/ui/module-empty-state";
import { MetaMetricsWidget } from "@/components/integrations";

const platformIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
};

export default function Social() {
  const { t, i18n } = useTranslation();
  const locale = getIntlLocale(i18n.language);
  const { currentSite } = useSites();
  const { currentWorkspace } = useWorkspace();
  const { accounts, posts, loading, createPost, updatePost, deletePost, publishPost, refetch } = useSocial();
  
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [postForm, setPostForm] = useState({ content: "", platforms: [] as string[], type: "Post", scheduled_for: "" });
  const [aiPrompt, setAIPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
 
   // Real-time subscription for social posts
   useRealtimeSubscription(
     `social-posts-${currentWorkspace?.id}`,
     {
       table: 'social_posts',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     () => refetch(),
     !!currentWorkspace?.id
   );

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error(t("modules.social.describeContentType"));
      return;
    }
    
    // Get current workspace from site
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error(t("modules.social.pleaseLogin"));
      return;
    }

     // Use currentWorkspace directly
     if (!currentWorkspace?.id) {
      toast.error(t("modules.social.workspaceNotFound"));
      return;
    }

    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
           workspace_id: currentWorkspace.id,
          agent_name: "social-generator",
          purpose: "copywriting",
          input: {
            system_prompt: "Tu es un expert en création de contenu pour les réseaux sociaux. Génère du contenu engageant, adapté à chaque plateforme.",
            user_prompt: aiPrompt,
            context: {
              platforms: postForm.platforms.length > 0 ? postForm.platforms : ["Instagram", "LinkedIn"],
            }
          }
        },
      });
      
      if (error) throw error;
      
      if (data?.success && data?.artifact) {
        const generatedContent = data.artifact.summary || "";
        setPostForm(prev => ({ ...prev, content: generatedContent }));
        setShowAIDialog(false);
        setShowPostDialog(true);
        toast.success(t("modules.social.contentGenerated"));
      } else {
        toast.error(data?.error || t("modules.social.generationError"));
      }
    } catch (err) {
      console.error("AI generation error:", err);
      toast.error(t("modules.social.connectionError"));
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postForm.content) {
      toast.error(t("modules.social.contentRequired"));
      return;
    }
    setSubmitting(true);
    const { error } = await createPost({
      content: postForm.content,
      platforms: postForm.platforms,
      type: postForm.type,
      scheduled_for: postForm.scheduled_for || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(t("modules.social.creationError"));
    } else {
      toast.success(t("modules.social.postCreated"));
      setShowPostDialog(false);
      setPostForm({ content: "", platforms: [], type: "Post", scheduled_for: "" });
    }
  };

  const handlePublish = async (postId: string) => {
    const { error } = await publishPost(postId);
    if (error) {
      toast.error(t("modules.social.publishError"));
    } else {
      toast.success(t("modules.social.postPublished"));
    }
  };

  const handleExportCalendar = () => {
    const icalContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Growth OS//Social Calendar//FR",
      ...posts
        .filter(p => p.scheduled_for)
        .map(p => {
          const date = new Date(p.scheduled_for!);
          const dateStr = date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
          return [
            "BEGIN:VEVENT",
            `DTSTART:${dateStr}`,
            `SUMMARY:${p.content.slice(0, 50)}...`,
            `DESCRIPTION:${p.content}`,
            "END:VEVENT",
          ].join("\n");
        }),
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([icalContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "social-calendar.ics";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("modules.social.calendarExported"));
  };

  const handleExportCSV = () => {
    const headers = ["Contenu", "Plateformes", "Date planifiée", "Statut", "Type"];
    const rows = posts.map(p => [
      `"${p.content.replace(/"/g, '""')}"`,
      p.platforms.join(";"),
      p.scheduled_for || "",
      p.status,
      p.type,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "social-posts.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("modules.social.csvExported"));
  };

  const togglePlatform = (platform: string) => {
    setPostForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  // Empty state - no site selected
  if (!currentSite) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t("modules.social.title")}</h1>
          <p className="text-muted-foreground">{t("modules.social.subtitle")}</p>
        </div>
        <ModuleEmptyState
          icon={Instagram}
          moduleName="Social"
          description={t("modules.social.emptyDesc")}
          features={t("modules.social.emptyFeatures").split(",")}
          primaryAction={{
            label: t("modules.social.manageSites"),
            href: "/dashboard/sites",
          }}
        />
      </div>
    );
  }

  // Empty state - no accounts connected
  const hasConnectedAccounts = accounts.some(a => a.connected);
  if (!hasConnectedAccounts && posts.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t("modules.social.title")}</h1>
          <p className="text-muted-foreground">{t("modules.social.subtitle")}</p>
        </div>
        <ModuleEmptyState
          icon={Instagram}
          moduleName="Social"
          description={t("modules.social.emptyConnectDesc")}
          features={["Instagram", "LinkedIn", "Facebook", "Twitter"]}
          primaryAction={{
            label: t("modules.social.connectNetworks"),
            href: "/dashboard/integrations",
          }}
          secondaryAction={{
            label: t("modules.social.createManualPost"),
            onClick: () => setShowPostDialog(true),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("modules.social.title")}</h1>
          <p className="text-muted-foreground">
            {t("modules.social.subtitle")}
          </p>
          {!currentSite && <p className="text-sm text-muted-foreground mt-1">{t("modules.social.selectSiteWarning")}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCalendar}>
            <Download className="w-4 h-4 mr-2" />
            {t("modules.social.exportICal")}
          </Button>
          <Button variant="hero" onClick={() => setShowPostDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("modules.social.newPost")}
          </Button>
        </div>
      </div>

      {/* Connected accounts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {accounts.map((account, i) => {
          const Icon = platformIcons[account.platform.toLowerCase()] || Instagram;
          return (
            <Card key={i} variant={account.connected ? "feature" : "default"} className={!account.connected ? "opacity-60" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${account.connected ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`w-5 h-5 ${account.connected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-medium">{account.platform}</p>
                    {account.connected ? (
                      <p className="text-sm text-muted-foreground">
                        {account.handle || account.followers?.toLocaleString() + " followers"}
                      </p>
                    ) : (
                      <Button variant="link" className="p-0 h-auto text-sm">{t("modules.social.authorizeAccess")}</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">{t("modules.social.calendar")}</TabsTrigger>
          <TabsTrigger value="repurpose">{t("modules.social.repurpose")}</TabsTrigger>
          <TabsTrigger value="performance">{t("modules.social.performance")}</TabsTrigger>
          <TabsTrigger value="export">{t("modules.social.exportTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {t("modules.social.plannedPosts")}
                  </CardTitle>
                  <CardDescription>
                    {t("modules.social.postsPlanned", { count: posts.filter(p => p.status === 'scheduled').length })}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowAIDialog(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("modules.social.generateWithAI")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">{t("modules.social.noPlannedPosts")}</p>
                  <p className="text-sm mt-1">{t("modules.social.createFirstPost")}</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="flex-shrink-0 mt-1">
                      {post.status === "scheduled" ? (
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      ) : post.status === "published" ? (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {post.platforms.map((p) => (
                          <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                        ))}
                        <Badge variant="secondary" className="text-xs">{post.type}</Badge>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {post.scheduled_for && (
                        <p className="text-sm font-medium">
                          {new Date(post.scheduled_for).toLocaleDateString(locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      <Badge variant={post.status === "scheduled" ? "gradient" : post.status === "published" ? "success" : "outline"} className="mt-1">
                        {post.status === "scheduled" ? t("modules.social.scheduled") : post.status === "published" ? t("modules.social.published") : t("modules.social.draft")}
                      </Badge>
                      {post.status === "draft" && (
                        <Button variant="ghost" size="sm" className="mt-2" onClick={() => handlePublish(post.id)}>
                          {t("modules.social.publish")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repurpose" className="space-y-6">
          {currentWorkspace?.id ? (
            <RepurposeEngine workspaceId={currentWorkspace.id} />
          ) : (
            <Card variant="feature">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  {t("modules.social.selectWorkspace")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Meta/Instagram Metrics Widget */}
          <MetaMetricsWidget />
          
          <Card variant="feature">
            <CardHeader>
              <CardTitle>{t("modules.social.recentPerformance")}</CardTitle>
              <CardDescription>{t("modules.social.engagementOnPosts")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.filter(p => p.status === 'published').length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">{t("modules.social.noPublishedPosts")}</p>
                    <p className="text-sm mt-1">{t("modules.social.statsAfterPublish")}</p>
                  </div>
                ) : (
                  posts.filter(p => p.status === 'published').map((post) => (
                    <div key={post.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{post.content.slice(0, 50)}...</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          {post.reach?.toLocaleString() || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-pink-500" />
                          {post.likes || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 text-primary" />
                          {post.comments || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-4 h-4 text-green-500" />
                          {post.shares || '—'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>{t("modules.social.exportChecklists")}</CardTitle>
              <CardDescription>
                {t("modules.social.exportChecklistsDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                {t("modules.social.exportCSV")}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleExportCalendar}>
                <Calendar className="w-4 h-4 mr-2" />
                {t("modules.social.exportICalBtn")}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                {t("modules.social.downloadAssets")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Post Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("modules.social.newPost")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{t("modules.social.content")}</label>
              <Textarea
                placeholder={t("modules.social.yourContent")}
                value={postForm.content}
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("modules.social.platforms")}</label>
              <div className="flex gap-2 mt-2">
                {["Instagram", "Facebook", "LinkedIn", "Twitter"].map((platform) => (
                  <Button
                    key={platform}
                    type="button"
                    variant={postForm.platforms.includes(platform) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePlatform(platform)}
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t("modules.social.postType")}</label>
                <Input
                  placeholder="Post, Carrousel, Reel..."
                  value={postForm.type}
                  onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("modules.social.scheduledDate")}</label>
                <Input
                  type="datetime-local"
                  value={postForm.scheduled_for}
                  onChange={(e) => setPostForm({ ...postForm, scheduled_for: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setShowPostDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="button" onClick={handleCreatePost} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t("modules.social.generateWithAI")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{t("modules.social.describeYourPost")}</label>
              <Textarea
                placeholder={t("modules.social.describeYourPostPlaceholder")}
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("modules.social.targetPlatforms")}</label>
              <div className="flex gap-2 mt-2">
                {["Instagram", "Facebook", "LinkedIn", "Twitter"].map((platform) => (
                  <Button
                    key={platform}
                    type="button"
                    variant={postForm.platforms.includes(platform) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePlatform(platform)}
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowAIDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleGenerateAI} disabled={generatingAI}>
              {generatingAI && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("modules.social.generate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}