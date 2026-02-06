import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  MapPin, Star, Phone, Navigation, Eye, MessageSquare, Calendar, Send,
  ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle2, Plus, RefreshCw, Loader2, Bot,
} from "lucide-react";
import { useLocalSEO } from "@/hooks/useLocalSEO";
import { useSites } from "@/hooks/useSites";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ModuleEmptyState, NoSiteEmptyState } from "@/components/ui/module-empty-state";

export default function LocalSEO() {
  const { t, i18n } = useTranslation();
  const locale = getIntlLocale(i18n.language);
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const { profiles, posts, loading, syncing, syncGBP, createPost, refetch } = useLocalSEO();
  
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<{author: string; comment: string} | null>(null);
  const [postForm, setPostForm] = useState({ title: "", content: "", post_type: "update" });
  const [replyText, setReplyText] = useState("");
  const [generatingReply, setGeneratingReply] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);

  const currentProfile = profiles[0];
  const gbpScore = currentProfile?.audit_score || 0;
  const hasProfile = !!currentProfile;

  const gbpMetrics = [
    { label: t("modules.localSeo.avgRating"), value: currentProfile?.rating_avg?.toFixed(1) || "-", icon: Star },
    { label: t("modules.localSeo.reviews"), value: currentProfile?.reviews_count?.toString() || "0", icon: MessageSquare },
    { label: t("modules.localSeo.photos"), value: currentProfile?.photos_count?.toString() || "0", icon: Eye },
    { label: t("modules.localSeo.categories"), value: (currentProfile?.categories as string[])?.length?.toString() || "0", icon: MapPin },
  ];

  const scheduledPosts = posts.filter(p => p.status === 'scheduled').map(p => ({
    title: p.title || t("modules.localSeo.noTitle"),
    type: p.post_type || 'Update',
    scheduledFor: p.scheduled_at ? new Date(p.scheduled_at).toLocaleDateString(locale) : '—',
  }));

  const gbpTasks: Array<{ task: string; status: string; priority: string }> = [];

  const handleSyncGBP = async () => {
    const { error } = await syncGBP();
    if (error) {
      toast.error(t("modules.localSeo.syncError"));
    } else {
      toast.success(t("modules.localSeo.syncSuccess"));
    }
  };

  const handleCreatePost = async () => {
    if (!postForm.title || !postForm.content) {
      toast.error(t("modules.localSeo.titleAndContentRequired"));
      return;
    }
    setSubmittingPost(true);
    const { error } = await createPost(postForm);
    setSubmittingPost(false);
    if (error) {
      toast.error(t("modules.localSeo.postCreationError"));
    } else {
      toast.success(t("modules.localSeo.postCreated"));
      setShowPostDialog(false);
      setPostForm({ title: "", content: "", post_type: "update" });
    }
  };

  const handleGenerateAIReply = async () => {
    if (!selectedReview) return;
    if (!currentWorkspace) {
      toast.error(t("modules.localSeo.workspaceNotFound"));
      return;
    }
    
    setGeneratingReply(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          workspace_id: currentWorkspace.id,
          agent_name: "review_responder",
          purpose: "copywriting",
          input: {
            system_prompt: "Tu es un assistant qui génère des réponses professionnelles et empathiques aux avis clients. Réponds en français, de manière concise (max 3 phrases).",
            user_prompt: `Génère une réponse à cet avis client:\n\nAuteur: ${selectedReview.author}\nAvis: "${selectedReview.comment}"`,
            context: { author: selectedReview.author, review: selectedReview.comment }
          }
        }
      });
      if (error) throw error;
      if (data?.success && data?.artifact?.summary) {
        setReplyText(data.artifact.summary);
        toast.success(t("modules.localSeo.aiReplyGenerated"));
      } else {
        setReplyText(`Merci ${selectedReview.author} pour votre retour. Nous prenons note de vos commentaires et restons à votre disposition.`);
        toast.info(t("modules.localSeo.defaultReplyGenerated"));
      }
    } catch (error) {
      console.error("AI reply error:", error);
      toast.error(t("modules.localSeo.aiReplyError"));
      setReplyText(`Merci ${selectedReview.author} pour votre retour. Nous prenons note de vos commentaires et restons à votre disposition.`);
    } finally {
      setGeneratingReply(false);
    }
  };

  const openReplyDialog = (review: {author: string; comment: string}) => {
    setSelectedReview(review);
    setReplyText("");
    setShowReplyDialog(true);
  };

  if (!currentSite) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t("modules.localSeo.title")}</h1>
          <p className="text-muted-foreground">{t("modules.localSeo.subtitle")}</p>
        </div>
        <NoSiteEmptyState moduleName={t("nav.localSeo")} icon={MapPin} />
      </div>
    );
  }

  if (!hasProfile && profiles.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t("modules.localSeo.title")}</h1>
          <p className="text-muted-foreground">{t("modules.localSeo.subtitle")}</p>
        </div>
        <ModuleEmptyState
          icon={MapPin}
          moduleName={t("nav.localSeo")}
          description={t("modules.localSeo.emptyDesc")}
          features={t("modules.localSeo.emptyFeatures").split(",")}
          primaryAction={{ label: t("modules.localSeo.connectGBP"), href: "/dashboard/integrations" }}
          secondaryAction={{ label: t("modules.localSeo.syncGBP"), onClick: handleSyncGBP }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("modules.localSeo.title")}</h1>
          <p className="text-muted-foreground">{t("modules.localSeo.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSyncGBP} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sync...' : t("modules.localSeo.syncGBP")}
          </Button>
          <Button variant="hero" onClick={() => setShowPostDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("modules.localSeo.newPost")}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card variant="gradient" className="lg:col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" strokeWidth="8" fill="none" className="stroke-background/30" />
                <circle cx="48" cy="48" r="40" strokeWidth="8" fill="none" strokeDasharray={`${gbpScore * 2.51} 251`} className="stroke-primary-foreground" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{gbpScore}</span>
              </div>
            </div>
            <p className="font-medium">{t("modules.localSeo.gbpScore")}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-sm">
                {currentProfile?.rating_avg?.toFixed(1) || "-"} ({currentProfile?.reviews_count || 0} {t("modules.localSeo.reviews").toLowerCase()})
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {gbpMetrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <Card key={i} variant="kpi">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reviews">{t("modules.localSeo.reviewsTabs")}</TabsTrigger>
          <TabsTrigger value="posts">{t("modules.localSeo.postsTabs")}</TabsTrigger>
          <TabsTrigger value="audit">{t("modules.localSeo.auditTab")}</TabsTrigger>
          <TabsTrigger value="faq">{t("modules.localSeo.faqTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card variant="feature">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t("modules.localSeo.recentReviews")}</CardTitle>
                      <CardDescription>{t("modules.localSeo.manageReviews")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!hasProfile ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">{t("modules.localSeo.noGBPProfile")}</p>
                      <p className="text-sm mt-1">{t("modules.localSeo.authorizeGBP")}</p>
                      <Button variant="outline" className="mt-4" onClick={handleSyncGBP}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t("modules.localSeo.syncGBP")}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">{t("modules.localSeo.noSyncedReviews")}</p>
                      <p className="text-sm mt-1">{t("modules.localSeo.reviewsAfterSync")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card variant="feature">
                <CardHeader>
                  <CardTitle className="text-base">{t("modules.localSeo.requestReview")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Send className="w-4 h-4 mr-2" />
                    {t("modules.localSeo.sendByEmail")}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    {t("modules.localSeo.sendBySMS")}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {t("modules.localSeo.qrCodeReview")}
                  </Button>
                </CardContent>
              </Card>

              <Card variant="feature">
                <CardHeader>
                  <CardTitle className="text-base">{t("modules.localSeo.reviewStats")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasProfile && currentProfile?.reviews_count ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t("modules.localSeo.totalReviews")}</span>
                        <span className="font-medium">{currentProfile.reviews_count}</span>
                      </div>
                      <Progress value={currentProfile.rating_avg ? (currentProfile.rating_avg / 5) * 100 : 0} className="h-2" />
                      <div className="flex items-center justify-between text-sm mt-4">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4 text-chart-3" />
                          {t("modules.localSeo.avgScore")}
                        </span>
                        <span>{currentProfile.rating_avg?.toFixed(1) || "-"}/5</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">{t("modules.localSeo.noStatsAvailable")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("modules.localSeo.plannedPosts")}</CardTitle>
                  <CardDescription>{t("modules.localSeo.gbpPublications")}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("modules.localSeo.newPostBtn")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledPosts.map((post, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-muted-foreground">{post.type} • {post.scheduledFor}</p>
                  </div>
                  <Button variant="ghost" size="sm">{t("modules.localSeo.modifyPost")}</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>{t("modules.localSeo.profileAudit")}</CardTitle>
              <CardDescription>{t("modules.localSeo.profileAuditDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {gbpTasks.length > 0 ? (
                gbpTasks.map((task, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      {task.status === "done" ? (
                        <CheckCircle2 className="w-5 h-5 text-chart-3" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                      )}
                      <span className={task.status === "done" ? "line-through text-muted-foreground" : ""}>{task.task}</span>
                    </div>
                    <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "secondary" : "outline"}>
                      {task.priority === "high" ? t("modules.localSeo.priorityHigh") : task.priority === "medium" ? t("modules.localSeo.priorityMedium") : t("modules.localSeo.priorityLow")}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{t("modules.localSeo.noOptimizationTasks")}</p>
                  <p className="text-xs mt-1">{t("modules.localSeo.syncForRecommendations")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>{t("modules.localSeo.faqTab")}</CardTitle>
              <CardDescription>
                {t("modules.localSeo.faqEngineDesc")}
                <br />
                <span className="text-xs text-muted-foreground mt-1 block">{t("modules.localSeo.faqApiNote")}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t("modules.localSeo.addFAQContent")}</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("modules.localSeo.addFAQ")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.localSeo.newGBPPost")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("modules.localSeo.postTitle")}</label>
              <Input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} placeholder={t("modules.localSeo.postTitlePlaceholder")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("modules.localSeo.postContent")}</label>
              <Textarea value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} placeholder={t("modules.localSeo.postContentPlaceholder")} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreatePost} disabled={submittingPost}>
              {submittingPost ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t("modules.localSeo.publishPost")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("modules.localSeo.replyToReview")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedReview && (
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="font-medium text-sm">{selectedReview.author}</p>
                <p className="text-sm text-muted-foreground mt-1">"{selectedReview.comment}"</p>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t("modules.localSeo.yourResponse")}</label>
                <Button variant="ghost" size="sm" onClick={handleGenerateAIReply} disabled={generatingReply}>
                  {generatingReply ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Bot className="w-4 h-4 mr-1" />}
                  IA
                </Button>
              </div>
              <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={t("modules.localSeo.writeResponse")} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => { toast.success(t("modules.localSeo.replySent")); setShowReplyDialog(false); }}>
              {t("modules.localSeo.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
