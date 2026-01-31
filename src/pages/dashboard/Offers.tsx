import { useState } from "react";
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
  Package,
  Plus,
  Sparkles,
  Check,
  Edit,
  Eye,
  TrendingUp,
  Loader2,
  Trash2,
} from "lucide-react";
import { useOffers, CreateOfferData } from "@/hooks/useOffers";
import { useSites } from "@/hooks/useSites";
import { LoadingState } from "@/components/ui/loading-state";
import { toast } from "sonner";

export default function Offers() {
  const { currentSite } = useSites();
  const { offers, loading, createOffer, updateOffer, deleteOffer, toggleActive } = useOffers();
  
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showUSPDialog, setShowUSPDialog] = useState(false);
  const [showObjectionDialog, setShowObjectionDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<string | null>(null);
  
  const [offerForm, setOfferForm] = useState<CreateOfferData>({
    name: "",
    tier: "standard",
    price: 0,
    price_period: "/mois",
    features: [],
    benefits: [],
    guarantees: [],
    objections_answers: {},
  });
  const [featureInput, setFeatureInput] = useState("");
  const [objectionInput, setObjectionInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generatingObjections, setGeneratingObjections] = useState(false);

  // Demo fallback if no offers exist
  const displayOffers = offers.length > 0 ? offers : [
    {
      id: "demo-1",
      workspace_id: "",
      site_id: null,
      name: "Starter",
      tier: "starter",
      price: 490,
      price_period: "/mois",
      features: ["Audit SEO complet", "Suivi 50 mots-clés", "Rapport mensuel", "Support email"],
      benefits: [],
      guarantees: [],
      objections_answers: {},
      is_active: true,
      created_at: null,
      updated_at: null,
    },
    {
      id: "demo-2",
      workspace_id: "",
      site_id: null,
      name: "Growth",
      tier: "growth",
      price: 990,
      price_period: "/mois",
      features: ["Tout Starter +", "Stratégie contenu", "Google Ads inclus", "Local SEO", "CRO mensuel", "Support prioritaire"],
      benefits: [],
      guarantees: [],
      objections_answers: {},
      is_active: true,
      created_at: null,
      updated_at: null,
    },
    {
      id: "demo-3",
      workspace_id: "",
      site_id: null,
      name: "Scale",
      tier: "premium",
      price: 2490,
      price_period: "/mois",
      features: ["Tout Growth +", "Multi-sites illimité", "Équipe dédiée", "Stratégie sur-mesure", "Reporting avancé", "SLA garanti"],
      benefits: [],
      guarantees: [],
      objections_answers: {},
      is_active: true,
      created_at: null,
      updated_at: null,
    },
  ];

  // Extract USP and objections from first offer if available
  const usp = offers.length > 0 && offers[0].benefits.length > 0 
    ? offers[0].benefits 
    : [
        "ROI moyen de 340% sur 12 mois",
        "Équipe d'experts certifiés Google",
        "Technologie propriétaire d'audit",
        "Accompagnement personnalisé",
      ];

  const objections = offers.length > 0 && Object.keys(offers[0].objections_answers).length > 0
    ? Object.entries(offers[0].objections_answers).map(([objection, response]) => ({ objection, response }))
    : [
        { objection: "C'est trop cher", response: "Notre ROI moyen est de 340%. C'est un investissement, pas une dépense." },
        { objection: "Je peux le faire moi-même", response: "Le temps passé a un coût. Nos experts font en 1h ce qui prend 10h en interne." },
        { objection: "Pas de résultats garantis", response: "On ne promet pas #1 Google, mais on garantit un process rigoureux et de la transparence." },
      ];

  const guarantees = offers.length > 0 && offers[0].guarantees.length > 0
    ? offers[0].guarantees.map(g => ({ title: g, description: "" }))
    : [
        { title: "Satisfait ou remboursé", description: "30 jours pour tester sans risque" },
        { title: "Sans engagement", description: "Résiliable à tout moment" },
        { title: "Transparence totale", description: "Accès complet aux données et actions" },
      ];

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setOfferForm({ ...offerForm, features: [...offerForm.features, featureInput.trim()] });
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setOfferForm({
      ...offerForm,
      features: offerForm.features.filter((_, i) => i !== index),
    });
  };

  const handleGenerateObjections = async () => {
    if (!objectionInput.trim()) {
      toast.error("Décrivez votre offre ou service pour générer les objections");
      return;
    }
    setGeneratingObjections(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-gateway`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          purpose: "copywriting",
          agent_name: "objection-handler",
          input: {
            task: "generate_objection_responses",
            service_description: objectionInput,
            existing_objections: objections.map(o => o.objection),
          },
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const generated = data.output?.objections || [];
        if (generated.length > 0) {
          toast.success(`${generated.length} objections générées`);
          // Would update in DB via updateOffer if we had a selected offer
        } else {
          toast.info("Aucune nouvelle objection générée");
        }
      } else {
        toast.error("Erreur lors de la génération");
      }
    } catch (err) {
      console.error("AI generation error:", err);
      toast.error("Erreur de connexion");
    } finally {
      setGeneratingObjections(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!offerForm.name || offerForm.price <= 0) {
      toast.error("Nom et prix requis");
      return;
    }
    setSubmitting(true);
    const result = await createOffer(offerForm);
    setSubmitting(false);
    if (result) {
      setShowOfferDialog(false);
      setOfferForm({
        name: "",
        tier: "standard",
        price: 0,
        price_period: "/mois",
        features: [],
        benefits: [],
        guarantees: [],
        objections_answers: {},
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (offerId.startsWith("demo-")) {
      toast.info("Les offres de démo ne peuvent pas être supprimées");
      return;
    }
    await deleteOffer(offerId);
  };

  const handleToggleActive = async (offerId: string) => {
    if (offerId.startsWith("demo-")) {
      toast.info("Les offres de démo ne peuvent pas être modifiées");
      return;
    }
    await toggleActive(offerId);
  };

  const openEditDialog = (offer: typeof displayOffers[0]) => {
    if (offer.id.startsWith("demo-")) {
      toast.info("Créez une vraie offre pour la modifier");
      return;
    }
    setEditingOffer(offer.id);
    setOfferForm({
      name: offer.name,
      tier: offer.tier,
      price: offer.price,
      price_period: offer.price_period,
      features: offer.features,
      benefits: offer.benefits || [],
      guarantees: offer.guarantees || [],
      objections_answers: offer.objections_answers || {},
    });
    setShowOfferDialog(true);
  };

  if (loading) {
    return <LoadingState message="Chargement des offres..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Offer Lab</h1>
          <p className="text-muted-foreground">
            Packaging, pricing et pages de vente
          </p>
          {!currentSite && <p className="text-sm text-muted-foreground mt-1">⚠️ Mode démo</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Prévisualiser
          </Button>
          <Button variant="hero" onClick={() => {
            setEditingOffer(null);
            setOfferForm({
              name: "",
              tier: "standard",
              price: 0,
              price_period: "/mois",
              features: [],
              benefits: [],
              guarantees: [],
              objections_answers: {},
            });
            setShowOfferDialog(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle offre
          </Button>
        </div>
      </div>

      <Tabs defaultValue="offers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="offers">Offres</TabsTrigger>
          <TabsTrigger value="usp">Proposition valeur</TabsTrigger>
          <TabsTrigger value="objections">Objections</TabsTrigger>
          <TabsTrigger value="guarantees">Garanties</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {displayOffers.map((offer, index) => {
              const isPopular = offer.tier === "growth" || index === 1;
              const isDemo = offer.id.startsWith("demo-");
              
              return (
                <Card
                  key={offer.id}
                  variant={isPopular ? "gradient" : "feature"}
                  className={`${isPopular ? "scale-105 z-10" : ""} ${!offer.is_active ? "opacity-60" : ""}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="gradient">Le plus populaire</Badge>
                    </div>
                  )}
                  {isDemo && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-xs">Démo</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{offer.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{offer.price}€</span>
                      <span className="text-muted-foreground">{offer.price_period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {offer.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>Statut</span>
                      <Badge variant={offer.is_active ? "success" : "secondary"}>
                        {offer.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant={isPopular ? "secondary" : "outline"} 
                        className="flex-1"
                        onClick={() => openEditDialog(offer)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                      {!isDemo && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteOffer(offer.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="usp" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>Proposition de valeur unique</CardTitle>
              <CardDescription>
                Ce qui vous différencie de la concurrence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {usp.map((point, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{point}</span>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un point
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="objections" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>Objections & Réponses</CardTitle>
              <CardDescription>
                Préparez les réponses aux freins clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {objections.map((obj, i) => (
                <div key={i} className="p-4 rounded-lg bg-secondary/50">
                  <p className="font-medium text-destructive mb-2">"{obj.objection}"</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-medium">→</span> {obj.response}
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-border space-y-3">
                <Input
                  placeholder="Décrivez votre service (ex: agence SEO premium...)"
                  value={objectionInput}
                  onChange={(e) => setObjectionInput(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleGenerateObjections}
                  disabled={generatingObjections}
                >
                  {generatingObjections ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Générer des réponses IA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guarantees" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>Garanties</CardTitle>
              <CardDescription>
                Réduisez le risque perçu par vos prospects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guarantees.map((g, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{g.title}</p>
                    {g.description && (
                      <p className="text-sm text-muted-foreground">{g.description}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingOffer ? "Modifier l'offre" : "Nouvelle offre"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="text-sm font-medium">Nom de l'offre *</label>
              <Input 
                placeholder="Ex: Starter, Growth, Enterprise..."
                value={offerForm.name}
                onChange={(e) => setOfferForm({ ...offerForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prix *</label>
                <Input 
                  type="number"
                  placeholder="490"
                  value={offerForm.price || ""}
                  onChange={(e) => setOfferForm({ ...offerForm, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Période</label>
                <Input 
                  placeholder="/mois"
                  value={offerForm.price_period}
                  onChange={(e) => setOfferForm({ ...offerForm, price_period: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Tier</label>
              <div className="flex gap-2 mt-1">
                {["starter", "standard", "growth", "premium"].map((tier) => (
                  <Button
                    key={tier}
                    type="button"
                    variant={offerForm.tier === tier ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOfferForm({ ...offerForm, tier })}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Fonctionnalités</label>
              <div className="flex gap-2 mt-1">
                <Input 
                  placeholder="Ajouter une fonctionnalité..."
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                />
                <Button type="button" variant="outline" onClick={handleAddFeature}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {offerForm.features.map((feature, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveFeature(i)}>
                    {feature} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowOfferDialog(false)}>Annuler</Button>
            <Button onClick={handleCreateOffer} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingOffer ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
