import { useState } from "react";
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
  MapPin,
  Star,
  Phone,
  Navigation,
  Eye,
  MessageSquare,
  Calendar,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Loader2,
  Bot,
} from "lucide-react";
import { useLocalSEO } from "@/hooks/useLocalSEO";
import { useSites } from "@/hooks/useSites";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function LocalSEO() {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const { 
    profiles, 
    posts, 
    loading, 
    syncing, 
    syncGBP, 
    createPost, 
    refetch 
  } = useLocalSEO();
  
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<{author: string; comment: string} | null>(null);
  const [postForm, setPostForm] = useState({ title: "", content: "", post_type: "update" });
  const [replyText, setReplyText] = useState("");
  const [generatingReply, setGeneratingReply] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);

  const currentProfile = profiles[0]; // First profile for current site
  const gbpScore = currentProfile?.audit_score || 0;
  const hasProfile = !!currentProfile;

  const gbpMetrics = [
    { label: "Note moyenne", value: currentProfile?.rating_avg?.toFixed(1) || "-", icon: Star },
    { label: "Avis", value: currentProfile?.reviews_count?.toString() || "0", icon: MessageSquare },
    { label: "Photos", value: currentProfile?.photos_count?.toString() || "0", icon: Eye },
    { label: "Catégories", value: (currentProfile?.categories as string[])?.length?.toString() || "0", icon: MapPin },
  ];

  // Real scheduled posts from database only
  const scheduledPosts = posts.filter(p => p.status === 'scheduled').map(p => ({
    title: p.title || 'Sans titre',
    type: p.post_type || 'Update',
    scheduledFor: p.scheduled_at ? new Date(p.scheduled_at).toLocaleDateString('fr') : 'Non planifié',
  }));

  // GBP audit tasks - empty by default, would come from database in production
  const gbpTasks: Array<{ task: string; status: string; priority: string }> = [];

  const handleSyncGBP = async () => {
    const { error } = await syncGBP();
    if (error) {
      toast.error("Erreur de synchronisation GBP");
    } else {
      toast.success("Données GBP synchronisées");
    }
  };

  const handleCreatePost = async () => {
    if (!postForm.title || !postForm.content) {
      toast.error("Titre et contenu requis");
      return;
    }
    setSubmittingPost(true);
    const { error } = await createPost(postForm);
    setSubmittingPost(false);
    if (error) {
      toast.error("Erreur lors de la création du post");
    } else {
      toast.success("Post créé avec succès");
      setShowPostDialog(false);
      setPostForm({ title: "", content: "", post_type: "update" });
    }
  };

  const handleGenerateAIReply = async () => {
    if (!selectedReview) return;
    
    // Use workspace from context
    if (!currentWorkspace) {
      toast.error("Workspace non trouvé");
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
            context: {
              author: selectedReview.author,
              review: selectedReview.comment,
            }
          }
        }
      });

      if (error) throw error;
      
      if (data?.success && data?.artifact?.summary) {
        setReplyText(data.artifact.summary);
        toast.success("Réponse générée par l'IA");
      } else {
        // Fallback if no structured response
        setReplyText(`Merci ${selectedReview.author} pour votre retour. Nous prenons note de vos commentaires et restons à votre disposition.`);
        toast.info("Réponse par défaut générée");
      }
    } catch (error) {
      console.error("AI reply error:", error);
      toast.error("Erreur lors de la génération");
      // Fallback response
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
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Local SEO</h1>
          <p className="text-muted-foreground">
            Google Business Profile & présence locale
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSyncGBP} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sync...' : 'Sync GBP'}
          </Button>
          <Button variant="hero" onClick={() => setShowPostDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau post
          </Button>
        </div>
      </div>

      {/* Score + Metrics */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card variant="gradient" className="lg:col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  strokeWidth="8"
                  fill="none"
                  className="stroke-background/30"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${gbpScore * 2.51} 251`}
                  className="stroke-primary-foreground"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{gbpScore}</span>
              </div>
            </div>
            <p className="font-medium">Score GBP</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-sm">
                {currentProfile?.rating_avg?.toFixed(1) || "-"} ({currentProfile?.reviews_count || 0} avis)
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 grid sm:grid-cols-4 gap-4">
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
          <TabsTrigger value="reviews">Avis</TabsTrigger>
          <TabsTrigger value="posts">Posts GBP</TabsTrigger>
          <TabsTrigger value="audit">Audit fiche</TabsTrigger>
          <TabsTrigger value="faq">FAQ Engine</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card variant="feature">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Avis récents</CardTitle>
                      <CardDescription>Gérer et répondre aux avis clients</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!hasProfile ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Aucun profil GBP configuré</p>
                      <p className="text-sm mt-1">Autorisez l'accès à Google Business Profile pour voir vos avis.</p>
                      <Button variant="outline" className="mt-4" onClick={handleSyncGBP}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Synchroniser GBP
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Aucun avis synchronisé</p>
                      <p className="text-sm mt-1">Les avis de votre fiche GBP apparaîtront ici après synchronisation.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card variant="feature">
                <CardHeader>
                  <CardTitle className="text-base">Demander un avis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer par email
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Envoyer par SMS
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    QR Code avis
                  </Button>
                </CardContent>
              </Card>

              <Card variant="feature">
                <CardHeader>
                  <CardTitle className="text-base">Stats avis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasProfile && currentProfile?.reviews_count ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total avis</span>
                        <span className="font-medium">{currentProfile.reviews_count}</span>
                      </div>
                      <Progress value={currentProfile.rating_avg ? (currentProfile.rating_avg / 5) * 100 : 0} className="h-2" />
                      <div className="flex items-center justify-between text-sm mt-4">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4 text-chart-3" />
                          Note moyenne
                        </span>
                        <span>{currentProfile.rating_avg?.toFixed(1) || "-"}/5</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">Aucune statistique disponible</p>
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
                  <CardTitle>Posts planifiés</CardTitle>
                  <CardDescription>Publications Google Business Profile</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledPosts.map((post, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {post.type} • {post.scheduledFor}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">Modifier</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>Audit de la fiche</CardTitle>
              <CardDescription>Optimisations recommandées pour votre fiche GBP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {gbpTasks.length > 0 ? (
                gbpTasks.map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      {task.status === "done" ? (
                        <CheckCircle2 className="w-5 h-5 text-chart-3" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                      )}
                      <span className={task.status === "done" ? "line-through text-muted-foreground" : ""}>
                        {task.task}
                      </span>
                    </div>
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "destructive"
                          : task.priority === "medium"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {task.priority === "high" ? "Prioritaire" : task.priority === "medium" ? "Moyen" : "Faible"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Aucune tâche d'optimisation</p>
                  <p className="text-xs mt-1">Synchronisez votre fiche GBP pour obtenir des recommandations.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>FAQ Engine</CardTitle>
              <CardDescription>
                Gérez vos FAQ site + suggestions de posts GBP pour répondre aux questions fréquentes
                <br />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Note : L'API Q&A Google Business Profile est discontinuée depuis Nov 2025
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ajoutez vos FAQ pour générer du contenu optimisé</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
