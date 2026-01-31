import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Plus,
  Sparkles,
  Check,
  ArrowRight,
  Edit,
  Eye,
  TrendingUp,
} from "lucide-react";

const offers = [
  {
    id: 1,
    name: "Starter",
    tier: "starter",
    price: 490,
    period: "/mois",
    features: [
      "Audit SEO complet",
      "Suivi 50 mots-clés",
      "Rapport mensuel",
      "Support email",
    ],
    active: true,
    conversions: 23,
  },
  {
    id: 2,
    name: "Growth",
    tier: "growth",
    price: 990,
    period: "/mois",
    features: [
      "Tout Starter +",
      "Stratégie contenu",
      "Google Ads inclus",
      "Local SEO",
      "CRO mensuel",
      "Support prioritaire",
    ],
    active: true,
    conversions: 45,
    popular: true,
  },
  {
    id: 3,
    name: "Scale",
    tier: "premium",
    price: 2490,
    period: "/mois",
    features: [
      "Tout Growth +",
      "Multi-sites illimité",
      "Équipe dédiée",
      "Stratégie sur-mesure",
      "Reporting avancé",
      "SLA garanti",
    ],
    active: true,
    conversions: 12,
  },
];

const usp = [
  "ROI moyen de 340% sur 12 mois",
  "Équipe d'experts certifiés Google",
  "Technologie propriétaire d'audit",
  "Accompagnement personnalisé",
];

const objections = [
  {
    objection: "C'est trop cher",
    response: "Notre ROI moyen est de 340%. C'est un investissement, pas une dépense.",
  },
  {
    objection: "Je peux le faire moi-même",
    response: "Le temps passé a un coût. Nos experts font en 1h ce qui prend 10h en interne.",
  },
  {
    objection: "Pas de résultats garantis",
    response: "On ne promet pas #1 Google, mais on garantit un process rigoureux et de la transparence.",
  },
];

const guarantees = [
  { title: "Satisfait ou remboursé", description: "30 jours pour tester sans risque" },
  { title: "Sans engagement", description: "Résiliable à tout moment" },
  { title: "Transparence totale", description: "Accès complet aux données et actions" },
];

export default function Offers() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Offer Lab</h1>
          <p className="text-muted-foreground">
            Packaging, pricing et pages de vente
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Prévisualiser
          </Button>
          <Button variant="hero">
            <Sparkles className="w-4 h-4 mr-2" />
            Optimiser offres
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
            {offers.map((offer) => (
              <Card
                key={offer.id}
                variant={offer.popular ? "gradient" : "feature"}
                className={offer.popular ? "scale-105 z-10" : ""}
              >
                {offer.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="gradient">Le plus populaire</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{offer.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{offer.price}€</span>
                    <span className="text-muted-foreground">{offer.period}</span>
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
                    <span>Conversions ce mois</span>
                    <span className="flex items-center gap-1 text-green-500">
                      <TrendingUp className="w-4 h-4" />
                      {offer.conversions}
                    </span>
                  </div>
                  <Button variant={offer.popular ? "secondary" : "outline"} className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card variant="feature">
            <CardContent className="pt-6">
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Créer une nouvelle offre
              </Button>
            </CardContent>
          </Card>
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
              <Button variant="outline" className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Générer des réponses IA
              </Button>
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
                    <p className="text-sm text-muted-foreground">{g.description}</p>
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
    </div>
  );
}
