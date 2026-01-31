import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  Plus,
  Settings,
  TrendingUp,
  BarChart3,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Mail,
  Calendar,
} from "lucide-react";

const clients = [
  {
    name: "Tech Solutions",
    sites: 3,
    plan: "Growth",
    healthScore: 85,
    tokensUsed: 125000,
    tokensLimit: 500000,
    issues: 4,
    lastActivity: "Il y a 2h",
    trend: "up",
  },
  {
    name: "E-commerce Plus",
    sites: 2,
    plan: "Agency",
    healthScore: 72,
    tokensUsed: 890000,
    tokensLimit: 10000000,
    issues: 12,
    lastActivity: "Il y a 1 jour",
    trend: "down",
  },
  {
    name: "Digital Agency",
    sites: 5,
    plan: "Growth",
    healthScore: 91,
    tokensUsed: 320000,
    tokensLimit: 500000,
    issues: 2,
    lastActivity: "Il y a 3h",
    trend: "up",
  },
];

const agencyMetrics = [
  { label: "Clients actifs", value: "12", change: "+2 ce mois" },
  { label: "Sites gérés", value: "34", change: "+5 ce mois" },
  { label: "Score santé moyen", value: "82%", change: "+3%" },
  { label: "MRR total", value: "€15,800", change: "+12%" },
];

const pendingTasks = [
  { client: "Tech Solutions", task: "Rapport mensuel à envoyer", dueIn: "2 jours" },
  { client: "E-commerce Plus", task: "12 issues critiques à traiter", dueIn: "Urgent" },
  { client: "Digital Agency", task: "Renouvellement contrat", dueIn: "1 semaine" },
];

export default function Agency() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mode Agence</h1>
          <p className="text-muted-foreground">
            Gérez plusieurs clients et workspaces
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Rapport global
          </Button>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Agency metrics */}
      <div className="grid sm:grid-cols-4 gap-4">
        {agencyMetrics.map((metric, i) => (
          <Card key={i} variant="kpi">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-bold mt-1">{metric.value}</p>
              <p className="text-xs text-green-500 mt-1">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending tasks */}
      {pendingTasks.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Actions en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingTasks.map((task, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div>
                    <span className="font-medium">{task.client}</span>
                    <span className="text-muted-foreground"> — {task.task}</span>
                  </div>
                  <Badge variant={task.dueIn === "Urgent" ? "destructive" : "outline"}>
                    {task.dueIn}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList>
          <TabsTrigger value="clients">
            <Building2 className="w-4 h-4 mr-2" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="quotas">
            <BarChart3 className="w-4 h-4 mr-2" />
            Quotas
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="w-4 h-4 mr-2" />
            Équipe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          {clients.map((client, i) => (
            <Card key={i} variant="feature">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {client.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{client.name}</h3>
                      <Badge variant="secondary">{client.plan}</Badge>
                      {client.issues > 5 && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {client.issues} issues
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {client.sites} site(s) • Dernière activité: {client.lastActivity}
                    </p>
                  </div>
                  <div className="text-center px-4">
                    <div className="flex items-center gap-1 justify-center">
                      <span className={`text-xl font-bold ${client.healthScore >= 80 ? 'text-green-500' : client.healthScore >= 60 ? 'text-yellow-500' : 'text-destructive'}`}>
                        {client.healthScore}%
                      </span>
                      {client.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Score santé</p>
                  </div>
                  <div className="w-32">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Tokens</span>
                      <span>{Math.round(client.tokensUsed / 1000)}K / {Math.round(client.tokensLimit / 1000)}K</span>
                    </div>
                    <Progress value={(client.tokensUsed / client.tokensLimit) * 100} className="h-1.5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Calendar className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="quotas" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>Consommation globale</CardTitle>
              <CardDescription>Usage des ressources par tous les clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">Tokens IA ce mois</p>
                  <p className="text-2xl font-bold">1.34M</p>
                  <Progress value={67} className="h-1.5 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">67% du quota</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">Crawls ce mois</p>
                  <p className="text-2xl font-bold">45</p>
                  <Progress value={45} className="h-1.5 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">45% du quota</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">Rapports générés</p>
                  <p className="text-2xl font-bold">28</p>
                  <Progress value={56} className="h-1.5 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">56% du quota</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">Agent runs</p>
                  <p className="text-2xl font-bold">312</p>
                  <Progress value={31} className="h-1.5 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">31% du quota</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Équipe agence</CardTitle>
                  <CardDescription>Gérez les accès de votre équipe</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Inviter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Vous", email: "admin@agence.fr", role: "Owner", clients: "Tous" },
                  { name: "Marie D.", email: "marie@agence.fr", role: "Manager", clients: "8" },
                  { name: "Pierre L.", email: "pierre@agence.fr", role: "Consultant", clients: "4" },
                ].map((member, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium">
                      {member.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge variant="secondary">{member.role}</Badge>
                    <span className="text-sm text-muted-foreground">{member.clients} clients</span>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
