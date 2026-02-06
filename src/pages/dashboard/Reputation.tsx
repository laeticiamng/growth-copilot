import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Star, MessageSquare, Send, ThumbsUp, AlertTriangle, Loader2, Mail, Sparkles } from "lucide-react";
import { useReputation, Review } from "@/hooks/useReputation";
import { useLocalSEO } from "@/hooks/useLocalSEO";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { ModuleEmptyState } from "@/components/ui/module-empty-state";

export default function Reputation() {
  const { i18n } = useTranslation();
  const locale = getIntlLocale(i18n.language);
  const { reviews, stats, loading, sendReviewRequest, respondToReview } = useReputation();
  const { profiles } = useLocalSEO();
  const { currentWorkspace } = useWorkspace();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");
  const [requestForm, setRequestForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
 
   // Real-time subscription for reviews
   const handleRealtimeUpdate = useCallback(() => {
     // Reviews will auto-refresh via hook
   }, []);
 
   useRealtimeSubscription(
     `reputation-${currentWorkspace?.id}`,
     {
       table: 'reviews',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     handleRealtimeUpdate,
     !!currentWorkspace?.id
   );

  const handleSendRequest = async () => {
    if (!requestForm.name.trim() || !requestForm.email.trim()) return;
    
    // Get first GBP profile if available
    const defaultProfileId = profiles[0]?.id;
    if (!defaultProfileId) {
      return;
    }
    
    setSubmitting(true);
    try {
      await sendReviewRequest({
        ...requestForm,
        gbp_profile_id: defaultProfileId,
      });
      setRequestForm({ name: "", email: "", phone: "" });
      setRequestDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedReview || !responseText.trim()) return;
    
    setSubmitting(true);
    try {
      await respondToReview(selectedReview.id, responseText);
      setResponseText("");
      setSelectedReview(null);
      setResponseDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const openResponseDialog = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.reply || "");
    setResponseDialogOpen(true);
  };

  const handleGenerateAIResponse = async () => {
    if (!selectedReview || !currentWorkspace) return;
    
    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          workspace_id: currentWorkspace.id,
          agent_name: "review_responder",
          purpose: "copywriting",
          input: {
            system_prompt: "Tu es un expert en gestion de la réputation. Génère une réponse professionnelle, empathique et concise (max 3 phrases) à cet avis client. La réponse doit être en français, personnalisée et montrer que tu as bien compris le feedback.",
            user_prompt: `Génère une réponse à cet avis client:\n\nAuteur: ${selectedReview.author_name || 'Client'}\nNote: ${selectedReview.rating}/5 étoiles\nCommentaire: "${selectedReview.comment || 'Pas de commentaire'}"`,
            context: {
              rating: selectedReview.rating,
              is_negative: selectedReview.rating <= 2,
            }
          }
        }
      });

      if (error) throw error;
      
      if (data?.success && data?.artifact?.summary) {
        setResponseText(data.artifact.summary);
        toast.success("Réponse générée par l'IA");
      } else {
        // Fallback response based on rating
        const fallback = selectedReview.rating >= 4
          ? `Merci beaucoup ${selectedReview.author_name || ''} pour votre retour positif ! Nous sommes ravis que vous soyez satisfait. À très bientôt !`
          : `Merci ${selectedReview.author_name || ''} pour votre retour. Nous prenons vos remarques très au sérieux et restons à votre disposition pour améliorer votre expérience.`;
        setResponseText(fallback);
        toast.info("Réponse par défaut générée");
      }
    } catch (error) {
      console.error("AI response error:", error);
      toast.error("Erreur lors de la génération");
    } finally {
      setGeneratingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state - no reviews and no profiles
  const hasData = reviews.length > 0 || stats.totalReviews > 0;
  if (!hasData && profiles.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Réputation</h1>
          <p className="text-muted-foreground">Avis clients et preuve sociale</p>
        </div>
        <ModuleEmptyState
          icon={Star}
          moduleName="Réputation"
          description="Gérez votre réputation en ligne : collectez des avis, répondez aux clients et améliorez votre note moyenne. L'IA génère des réponses personnalisées à vos avis."
          features={["Collecte d'avis", "Réponses IA", "Suivi de note", "Alertes négatifs"]}
          primaryAction={{
            label: "Configurer Google Business",
            href: "/dashboard/local",
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Réputation</h1>
          <p className="text-muted-foreground">Avis clients et preuve sociale</p>
        </div>
        
        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" disabled={profiles.length === 0}>
              <Send className="w-4 h-4 mr-2" />
              Demander un avis
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Demander un avis client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nom du client</Label>
                <Input
                  id="name"
                  placeholder="Jean Dupont"
                  value={requestForm.name}
                  onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={requestForm.email}
                  onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                <Input
                  id="phone"
                  placeholder="+33 6 12 34 56 78"
                  value={requestForm.phone}
                  onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSendRequest} disabled={submitting || !requestForm.name || !requestForm.email}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                Envoyer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="kpi">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Note moyenne</p>
            <p className="text-3xl font-bold flex items-center gap-2">
              {stats.averageRating || "-"} 
              <Star className="w-5 h-5 fill-primary text-primary" />
            </p>
          </CardContent>
        </Card>
        <Card variant="kpi">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total avis</p>
            <p className="text-3xl font-bold">{stats.totalReviews}</p>
          </CardContent>
        </Card>
        <Card variant="kpi">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Taux réponse</p>
            <p className="text-3xl font-bold">{stats.responseRate}%</p>
          </CardContent>
        </Card>
        <Card variant="kpi">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ce mois</p>
            <p className="text-3xl font-bold text-primary">+{stats.thisMonthCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* No GBP Profile Warning */}
      {profiles.length === 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <p className="text-sm">
              Configurez un profil Google Business dans <strong>Local SEO</strong> pour activer les demandes d'avis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pending Responses Alert */}
      {stats.pendingResponses > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <p className="text-sm">
              <strong>{stats.pendingResponses} avis négatif(s)</strong> sans réponse. Répondez rapidement pour montrer votre engagement.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card variant="feature">
        <CardHeader>
          <CardTitle>Avis récents</CardTitle>
          <CardDescription>
            {reviews.length > 0 
              ? `${reviews.length} avis au total` 
              : "Aucun avis pour l'instant"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun avis encore</p>
              <p className="text-sm">Les avis de vos clients apparaîtront ici.</p>
            </div>
          ) : (
            reviews.slice(0, 10).map((review) => {
              const isUrgent = review.rating <= 2 && !review.reply;
              const hasResponse = !!review.reply;

              return (
                <div 
                  key={review.id} 
                  className={`p-4 rounded-lg ${
                    isUrgent 
                      ? "bg-destructive/10 border border-destructive/30" 
                      : "bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.author_name || "Client"}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, j) => (
                          <Star 
                            key={j} 
                            className={`w-4 h-4 ${
                              j < review.rating 
                                ? "fill-primary text-primary" 
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {hasResponse ? (
                      <Badge variant="secondary">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Répondu
                      </Badge>
                    ) : isUrgent ? (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Urgent
                      </Badge>
                    ) : null}
                  </div>
                  
                  <p className="text-sm mb-2">{review.comment || <em className="text-muted-foreground">Pas de commentaire</em>}</p>
                  
                  {review.reply && (
                    <div className="mt-3 p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                      <p className="text-xs text-muted-foreground mb-1">Votre réponse :</p>
                      <p className="text-sm">{review.reply}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      {review.review_date 
                        ? new Date(review.review_date).toLocaleDateString(locale) 
                        : "Date inconnue"}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openResponseDialog(review)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {hasResponse ? "Modifier" : "Répondre"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Répondre à {selectedReview?.author_name || "l'avis"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedReview && (
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star 
                      key={j} 
                      className={`w-4 h-4 ${
                        j < selectedReview.rating 
                          ? "fill-primary text-primary" 
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm">{selectedReview.comment}</p>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="response">Votre réponse</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleGenerateAIResponse}
                  disabled={generatingAI}
                >
                  {generatingAI ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Générer avec IA
                </Button>
              </div>
              <Textarea
                id="response"
                placeholder="Merci pour votre retour..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleRespond} disabled={submitting || !responseText.trim()}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Publier la réponse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
