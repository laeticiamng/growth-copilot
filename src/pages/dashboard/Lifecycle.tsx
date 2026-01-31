import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Users,
  Phone,
  Calendar,
  ArrowRight,
  Plus,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const pipelineStages = [
  { name: "Nouveaux", count: 23, value: "€34,500", color: "bg-blue-500" },
  { name: "Contactés", count: 18, value: "€27,000", color: "bg-yellow-500" },
  { name: "Qualifiés", count: 12, value: "€24,000", color: "bg-orange-500" },
  { name: "Proposition", count: 8, value: "€19,200", color: "bg-purple-500" },
  { name: "Négociation", count: 5, value: "€15,000", color: "bg-primary" },
  { name: "Gagnés", count: 3, value: "€8,700", color: "bg-green-500" },
];

const leads = [
  {
    id: 1,
    name: "Marie Dupont",
    company: "Tech Solutions",
    email: "marie@techsolutions.fr",
    source: "Formulaire",
    status: "new",
    value: "€3,000",
    lastActivity: "Il y a 2h",
  },
  {
    id: 2,
    name: "Pierre Martin",
    company: "Digital Agency",
    email: "pierre@digitalagency.com",
    source: "Google Ads",
    status: "qualified",
    value: "€5,500",
    lastActivity: "Il y a 1 jour",
  },
  {
    id: 3,
    name: "Sophie Bernard",
    company: "E-commerce Plus",
    email: "sophie@ecomplus.fr",
    source: "Referral",
    status: "proposal",
    value: "€8,000",
    lastActivity: "Il y a 3h",
  },
];

const workflows = [
  {
    name: "Welcome Sequence",
    trigger: "Nouveau lead",
    emails: 5,
    openRate: 45,
    clickRate: 12,
    status: "active",
  },
  {
    name: "Nurture - Non qualifiés",
    trigger: "Lead froid 7j",
    emails: 8,
    openRate: 32,
    clickRate: 8,
    status: "active",
  },
  {
    name: "Follow-up RDV",
    trigger: "Après RDV",
    emails: 3,
    openRate: 58,
    clickRate: 22,
    status: "active",
  },
];

const salesMetrics = [
  { label: "Taux RDV", value: "32%", change: "+5%" },
  { label: "Taux closing", value: "28%", change: "+3%" },
  { label: "Délai moyen", value: "18j", change: "-4j" },
  { label: "CAC", value: "€420", change: "-12%" },
];

export default function Lifecycle() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lifecycle & CRM</h1>
          <p className="text-muted-foreground">
            Pipeline de vente et automatisations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Workflows
          </Button>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau lead
          </Button>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid sm:grid-cols-4 gap-4">
        {salesMetrics.map((metric, i) => (
          <Card key={i} variant="kpi">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-bold mt-1">{metric.value}</p>
              <p className="text-xs text-green-500 mt-1">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="scripts">Scripts vente</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          {/* Pipeline visualization */}
          <Card variant="feature">
            <CardHeader>
              <CardTitle>Pipeline de vente</CardTitle>
              <CardDescription>
                Valeur totale : €128,400 • {pipelineStages.reduce((a, b) => a + b.count, 0)} opportunités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {pipelineStages.map((stage, i) => (
                  <div key={i} className="text-center">
                    <div className={`h-24 rounded-lg ${stage.color} bg-opacity-20 flex flex-col items-center justify-center p-2`}>
                      <span className="text-2xl font-bold">{stage.count}</span>
                      <span className="text-xs text-muted-foreground">{stage.value}</span>
                    </div>
                    <p className="text-xs font-medium mt-2">{stage.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Leads récents</CardTitle>
                  <CardDescription>Gérez vos opportunités</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Voir tout
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium">
                    {lead.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{lead.name}</p>
                      <Badge
                        variant={
                          lead.status === "new"
                            ? "gradient"
                            : lead.status === "qualified"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {lead.status === "new" ? "Nouveau" : lead.status === "qualified" ? "Qualifié" : "Proposition"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{lead.company} • {lead.source}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">{lead.value}</p>
                    <p className="text-xs text-muted-foreground">{lead.lastActivity}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Workflows email</CardTitle>
                  <CardDescription>Automatisations actives</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau workflow
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {workflows.map((wf, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{wf.name}</p>
                      <Badge variant="gradient" className="text-xs">Actif</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Trigger : {wf.trigger} • {wf.emails} emails
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Open:</span> {wf.openRate}%
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Click:</span> {wf.clickRate}%
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Sales Copilot
              </CardTitle>
              <CardDescription>
                Scripts d'appel et réponses aux objections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="font-medium mb-2">Script découverte</p>
                <p className="text-sm text-muted-foreground">
                  Introduction, questions de qualification, présentation offre adaptée...
                </p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Voir le script
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="font-medium mb-2">Script closing</p>
                <p className="text-sm text-muted-foreground">
                  Récap bénéfices, traitement objections, call-to-action...
                </p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Voir le script
                </Button>
              </div>
              <Button variant="outline" className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Générer un script personnalisé
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
