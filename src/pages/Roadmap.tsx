import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Rocket, Clock, CheckCircle2, Circle, Vote, Calendar, Tag } from "lucide-react";

type Status = "done" | "in_progress" | "planned" | "considering";

interface RoadmapItem {
  title: string;
  description: string;
  status: Status;
  quarter?: string;
  votes?: number;
  tags?: string[];
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ElementType }> = {
  done: { label: "Terminé", color: "bg-green-500", icon: CheckCircle2 },
  in_progress: { label: "En cours", color: "bg-blue-500", icon: Clock },
  planned: { label: "Planifié", color: "bg-yellow-500", icon: Circle },
  considering: { label: "À l'étude", color: "bg-gray-400", icon: Vote },
};

const ROADMAP_ITEMS: Record<string, RoadmapItem[]> = {
  "Q1 2026": [
    { title: "Evidence Bundles", description: "Traçabilité complète des décisions IA", status: "done", tags: ["Core OS"] },
    { title: "Voice Commands", description: "Contrôle vocal via ElevenLabs", status: "done", tags: ["UX"] },
    { title: "HR & Legal Modules", description: "Nouveaux départements RH et Juridique", status: "done", tags: ["Produit"] },
    { title: "Service Catalog", description: "Documentation détaillée par département", status: "done", tags: ["Produit"] },
    { title: "Mode Démo", description: "Toggle démo/production avec watermark", status: "done", tags: ["UX"] },
    { title: "Dashboard Coûts IA", description: "Suivi en temps réel des dépenses IA", status: "done", tags: ["Ops"] },
  ],
  "Q2 2026": [
    { title: "Salesforce Integration", description: "Sync bidirectionnel CRM", status: "planned", tags: ["Intégration"], votes: 45 },
    { title: "HubSpot Integration", description: "Marketing automation sync", status: "planned", tags: ["Intégration"], votes: 38 },
    { title: "Slack Notifications", description: "Alertes et commandes Slack", status: "in_progress", tags: ["Intégration"], votes: 67 },
    { title: "Mobile App (PWA)", description: "Application mobile responsive", status: "planned", tags: ["UX"], votes: 89 },
    { title: "Multi-Factor Auth", description: "2FA pour sécurité renforcée", status: "planned", tags: ["Sécurité"], votes: 52 },
    { title: "API v2", description: "API REST publique documentée", status: "in_progress", tags: ["Produit"], votes: 34 },
  ],
  "Q3 2026": [
    { title: "Shopify Integration", description: "E-commerce analytics et automation", status: "planned", tags: ["Intégration"], votes: 23 },
    { title: "Custom Dashboards", description: "Créez vos propres tableaux de bord", status: "planned", tags: ["UX"], votes: 56 },
    { title: "White Label", description: "Personnalisation marque pour agences", status: "considering", tags: ["Produit"], votes: 41 },
    { title: "AI Training", description: "Entraînement sur vos données", status: "considering", tags: ["IA"], votes: 78 },
  ],
  "Future": [
    { title: "LinkedIn Integration", description: "Gestion posts et analytics LinkedIn", status: "considering", tags: ["Intégration"], votes: 112 },
    { title: "TikTok Ads", description: "Gestion campagnes TikTok", status: "considering", tags: ["Intégration"], votes: 67 },
    { title: "Self-Hosted Version", description: "Déploiement on-premise", status: "considering", tags: ["Produit"], votes: 34 },
    { title: "SOC 2 Compliance", description: "Certification sécurité", status: "planned", tags: ["Sécurité"], votes: 29 },
  ],
};

function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className="gap-1">
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      {config.label}
    </Badge>
  );
}

export default function Roadmap() {
  const allItems = Object.values(ROADMAP_ITEMS).flat();
  const doneCount = allItems.filter(i => i.status === "done").length;
  const inProgressCount = allItems.filter(i => i.status === "in_progress").length;
  const plannedCount = allItems.filter(i => i.status === "planned").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-12 px-4">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-4">
            <Rocket className="w-10 h-10 text-primary" />
            Roadmap Publique
          </h1>
          <p className="text-xl text-muted-foreground">
            Découvrez ce qui arrive sur Growth OS et votez pour vos fonctionnalités préférées.
          </p>
        </header>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">{doneCount}</p>
              <p className="text-sm text-muted-foreground">Terminés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">En cours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-yellow-600">{plannedCount}</p>
              <p className="text-sm text-muted-foreground">Planifiés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{allItems.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {Object.entries(ROADMAP_ITEMS).map(([quarter, items]) => (
            <Card key={quarter}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {quarter}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(items.filter(i => i.status === "done").length / items.length) * 100} 
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      {items.filter(i => i.status === "done").length}/{items.length}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg border ${
                        item.status === "done" ? "bg-green-500/5 border-green-500/20" : 
                        item.status === "in_progress" ? "bg-blue-500/5 border-blue-500/20" : 
                        "bg-secondary/50 border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{item.title}</h4>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {item.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="w-2.5 h-2.5 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {item.votes && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Vote className="w-3.5 h-3.5" />
                            {item.votes}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Vous avez une idée ?</h3>
                <p className="text-sm text-muted-foreground">
                  Proposez une fonctionnalité et votez pour celles qui vous intéressent.
                </p>
              </div>
              <Button variant="hero">
                Proposer une idée
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/changelog" className="text-primary hover:underline">
            Changelog complet
          </Link>
          <span className="text-muted-foreground">•</span>
          <a href="https://github.com/your-org/growth-os/releases" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            GitHub Releases
          </a>
          <span className="text-muted-foreground">•</span>
          <Link to="/dashboard/status" className="text-primary hover:underline">
            Statut d'implémentation
          </Link>
        </div>
      </div>
    </div>
  );
}
