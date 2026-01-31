import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Search,
  MapPin,
  Target,
  Mail,
  BarChart3,
  Settings,
  Bell,
  User,
  Menu,
  X,
  ChevronRight,
  Play,
  Pause,
  Bot,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

// Demo data
const kpis = [
  { 
    label: "Trafic organique", 
    value: "12,847", 
    change: "+18.3%", 
    trend: "up",
    icon: Search,
    color: "text-chart-1"
  },
  { 
    label: "Conversions", 
    value: "324", 
    change: "+12.1%", 
    trend: "up",
    icon: Target,
    color: "text-chart-2"
  },
  { 
    label: "Leads qualifiés", 
    value: "89", 
    change: "+24.5%", 
    trend: "up",
    icon: Mail,
    color: "text-chart-3"
  },
  { 
    label: "Score SEO", 
    value: "78/100", 
    change: "+5 pts", 
    trend: "up",
    icon: BarChart3,
    color: "text-chart-4"
  },
];

const recommendations = [
  {
    id: 1,
    priority: "high",
    title: "Corriger les erreurs 404 critiques",
    description: "12 pages retournent des erreurs 404 avec du trafic entrant.",
    impact: "+800 sessions/mois",
    effort: "Faible",
    module: "SEO",
  },
  {
    id: 2,
    priority: "high",
    title: "Optimiser la page pricing",
    description: "Le taux de rebond est 40% supérieur à la moyenne.",
    impact: "+15% conversions",
    effort: "Moyen",
    module: "CRO",
  },
  {
    id: 3,
    priority: "medium",
    title: "Mettre à jour la fiche Google Business",
    description: "Description incomplète et photos datées.",
    impact: "+30% visibilité locale",
    effort: "Faible",
    module: "Local",
  },
  {
    id: 4,
    priority: "medium",
    title: "Ajouter des mots-clés négatifs aux campagnes",
    description: "23 termes non pertinents consomment du budget.",
    impact: "-15% CPC",
    effort: "Faible",
    module: "Ads",
  },
  {
    id: 5,
    priority: "low",
    title: "Créer du contenu pour 'formation growth'",
    description: "Opportunité de ranking avec faible concurrence.",
    impact: "+2,400 impressions/mois",
    effort: "Élevé",
    module: "Content",
  },
];

const agents = [
  { name: "Tech Auditor", status: "active", lastRun: "Il y a 2h", tasks: 3 },
  { name: "Keyword Strategist", status: "active", lastRun: "Il y a 1h", tasks: 5 },
  { name: "Content Builder", status: "idle", lastRun: "Il y a 4h", tasks: 0 },
  { name: "Local Manager", status: "active", lastRun: "Il y a 30min", tasks: 2 },
  { name: "Ads Manager", status: "idle", lastRun: "Il y a 3h", tasks: 0 },
  { name: "Analytics Guardian", status: "active", lastRun: "Il y a 15min", tasks: 1 },
];

const alerts = [
  { type: "warning", message: "Tracking GA4 incomplet sur 3 pages", time: "Il y a 1h" },
  { type: "success", message: "15 corrections SEO appliquées", time: "Il y a 2h" },
  { type: "warning", message: "Budget Ads à 80% de la limite", time: "Il y a 4h" },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autopilot, setAutopilot] = useState(false);

  const navItems = [
    { icon: BarChart3, label: "Dashboard", active: true },
    { icon: Search, label: "SEO" },
    { icon: MapPin, label: "Local" },
    { icon: Target, label: "Ads" },
    { icon: TrendingUp, label: "CRO" },
    { icon: Mail, label: "Lifecycle" },
    { icon: FileText, label: "Rapports" },
    { icon: Bot, label: "Agents" },
    { icon: Settings, label: "Paramètres" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200
        lg:relative lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold">Growth OS</span>
            </Link>
            <button 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${item.active 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Autopilot Toggle */}
          <div className="p-4 border-t border-border">
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Autopilot</span>
                <button
                  onClick={() => setAutopilot(!autopilot)}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors
                    ${autopilot ? "bg-primary" : "bg-secondary"}
                  `}
                >
                  <div className={`
                    absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
                    ${autopilot ? "translate-x-6" : "translate-x-0"}
                  `} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {autopilot ? "Agents actifs en mode auto" : "Mode manuel activé"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">demo-site.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="warning" className="hidden sm:flex">
                Mode démo
              </Badge>
              <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label} variant="kpi">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-secondary ${kpi.color}`}>
                      <kpi.icon className="w-5 h-5" />
                    </div>
                    <Badge 
                      variant={kpi.trend === "up" ? "success" : "error"}
                      className="text-xs"
                    >
                      {kpi.trend === "up" ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {kpi.change}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                  <div className="text-sm text-muted-foreground">{kpi.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recommendations */}
            <div className="lg:col-span-2">
              <Card variant="default">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Top 5 recommandations</CardTitle>
                  <Button variant="ghost" size="sm">
                    Voir tout
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.map((rec) => (
                    <div 
                      key={rec.id}
                      className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={
                                rec.priority === "high" ? "error" : 
                                rec.priority === "medium" ? "warning" : "secondary"
                              }
                              className="text-xs"
                            >
                              {rec.priority === "high" ? "Urgent" : 
                               rec.priority === "medium" ? "Important" : "Optionnel"}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {rec.module}
                            </Badge>
                          </div>
                          <h4 className="font-medium mb-1">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-medium text-primary">{rec.impact}</div>
                          <div className="text-xs text-muted-foreground">Effort: {rec.effort}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Alerts */}
              <Card variant="default">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Alertes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.map((alert, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {alert.type === "warning" ? (
                        <AlertTriangle className="w-5 h-5 text-agent-idle shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-agent-active shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Agents Status */}
              <Card variant="default">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Agents IA
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {agents.slice(0, 4).map((agent) => (
                    <div 
                      key={agent.name}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`
                          w-2 h-2 rounded-full
                          ${agent.status === "active" ? "bg-agent-active agent-pulse" : "bg-agent-idle"}
                        `} />
                        <span className="text-sm">{agent.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {agent.tasks > 0 && (
                          <Badge variant="agent" className="text-xs">
                            {agent.tasks} tâches
                          </Badge>
                        )}
                        {agent.status === "active" ? (
                          <Play className="w-4 h-4 text-agent-active" />
                        ) : (
                          <Pause className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    Voir tous les agents
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Search, label: "Lancer un crawl", color: "text-chart-1" },
              { icon: FileText, label: "Générer un rapport", color: "text-chart-2" },
              { icon: Target, label: "Créer une campagne", color: "text-chart-3" },
              { icon: Mail, label: "Nouvelle séquence", color: "text-chart-4" },
            ].map((action) => (
              <Button 
                key={action.label}
                variant="outline" 
                className="h-auto py-6 flex flex-col gap-2"
              >
                <action.icon className={`w-6 h-6 ${action.color}`} />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
