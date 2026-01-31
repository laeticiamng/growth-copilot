import { Bot, Brain, Search, FileText, BarChart3, Megaphone, Shield, Zap, PenTool, Target, Share2, Music, Eye, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const agents = [
  // Level 0 - Leadership
  {
    id: "cgo",
    name: "Sophie Marchand",
    role: "Chief Growth Officer",
    description: "Orchestre tous les agents et priorise les actions selon l'impact business (ICE)",
    icon: Brain,
    color: "from-primary to-primary/60",
    level: 0,
  },
  // Level 1 - Core Operations
  {
    id: "analytics",
    name: "Lucas Bernier",
    role: "Analytics Guardian",
    description: "Synchronise GSC/GA4, surveille les KPIs et génère les rapports mensuels",
    icon: BarChart3,
    color: "from-blue-500 to-blue-400",
    level: 1,
  },
  {
    id: "seo-tech",
    name: "Emma Lefebvre",
    role: "SEO Tech Auditor",
    description: "Crawle le site, identifie les erreurs techniques et génère les correctifs",
    icon: Search,
    color: "from-green-500 to-green-400",
    level: 1,
  },
  {
    id: "content",
    name: "Thomas Duval",
    role: "Content Strategist",
    description: "Analyse les mots-clés, crée les clusters et planifie le calendrier éditorial",
    icon: FileText,
    color: "from-purple-500 to-purple-400",
    level: 1,
  },
  {
    id: "copywriting",
    name: "Léa Fontaine",
    role: "Copywriting Agent",
    description: "Rédige les textes conversion-first avec frameworks AIDA/PAS",
    icon: PenTool,
    color: "from-pink-500 to-pink-400",
    level: 1,
  },
  // Level 2 - Acquisition & Distribution
  {
    id: "ads",
    name: "Marc Rousseau",
    role: "Ads Optimizer",
    description: "Optimise les campagnes SEA/YouTube avec contrôle budget et tracking",
    icon: Target,
    color: "from-amber-500 to-amber-400",
    level: 2,
  },
  {
    id: "social",
    name: "Chloé Martin",
    role: "Social Distribution",
    description: "Repurpose le contenu et planifie la distribution multi-plateforme",
    icon: Share2,
    color: "from-cyan-500 to-cyan-400",
    level: 2,
  },
  {
    id: "media",
    name: "Antoine Girard",
    role: "Media Promotion",
    description: "Orchestre les lancements YouTube/Spotify avec smart links",
    icon: Music,
    color: "from-orange-500 to-orange-400",
    level: 2,
  },
  {
    id: "competitive",
    name: "Julie Moreau",
    role: "Competitive Intel",
    description: "Analyse les concurrents et détecte les opportunités de gaps",
    icon: Eye,
    color: "from-indigo-500 to-indigo-400",
    level: 2,
  },
  // Level 3 - Quality & Control
  {
    id: "qco",
    name: "Pierre Lambert",
    role: "Quality Control",
    description: "Valide les outputs, vérifie la conformité brand et éthique",
    icon: Shield,
    color: "from-red-500 to-red-400",
    level: 3,
  },
  {
    id: "approval",
    name: "Claire Dubois",
    role: "Approval Engine",
    description: "Classe les actions : auto-safe, approval-required ou blocked",
    icon: CheckCircle,
    color: "from-emerald-500 to-emerald-400",
    level: 3,
  },
  {
    id: "supervisor",
    name: "Nicolas Bernard",
    role: "Meta-Supervisor",
    description: "Supervise les coûts, quotas et la santé système des agents",
    icon: Zap,
    color: "from-yellow-500 to-yellow-400",
    level: 3,
  },
];

export function TeamOrgChart() {
  const level0 = agents.filter((a) => a.level === 0);
  const level1 = agents.filter((a) => a.level === 1);
  const level2 = agents.filter((a) => a.level === 2);
  const level3 = agents.filter((a) => a.level === 3);

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Bot className="w-3 h-3 mr-1" />
            Équipe IA
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Votre équipe marketing{" "}
            <span className="text-gradient">100% automatisée</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            12 agents IA spécialisés travaillent en synergie pour optimiser votre
            croissance, 24h/24
          </p>
        </div>

        {/* Org Chart */}
        <div className="relative space-y-8">
          {/* Level 0 - CGO */}
          <div className="flex justify-center">
            {level0.map((agent) => (
              <AgentCard key={agent.id} agent={agent} isLeader />
            ))}
          </div>

          {/* Connection line */}
          <div className="hidden md:block w-px h-8 bg-border mx-auto" />

          {/* Level 1 - Core Operations */}
          <div>
            <div className="text-center mb-4">
              <Badge variant="secondary" className="text-xs">
                Opérations Core
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {level1.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>

          {/* Connection line */}
          <div className="hidden md:block w-px h-8 bg-border mx-auto" />

          {/* Level 2 - Acquisition & Distribution */}
          <div>
            <div className="text-center mb-4">
              <Badge variant="secondary" className="text-xs">
                Acquisition & Distribution
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {level2.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>

          {/* Connection line */}
          <div className="hidden md:block w-px h-8 bg-border mx-auto" />

          {/* Level 3 - Quality & Control */}
          <div>
            <div className="text-center mb-4">
              <Badge variant="secondary" className="text-xs">
                Qualité & Contrôle
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {level3.map((agent) => (
                <AgentCard key={agent.id} agent={agent} isSupport />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { value: "24/7", label: "Disponibilité" },
            { value: "12", label: "Agents spécialisés" },
            { value: "<1s", label: "Temps de réponse" },
            { value: "∞", label: "Scalabilité" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-4 rounded-lg bg-background/50 border border-border/50"
            >
              <div className="text-2xl md:text-3xl font-bold text-gradient">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface AgentCardProps {
  agent: (typeof agents)[0];
  isLeader?: boolean;
  isSupport?: boolean;
}

function AgentCard({ agent, isLeader, isSupport }: AgentCardProps) {
  const Icon = agent.icon;

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        isLeader ? "max-w-md mx-auto" : isSupport ? "max-w-xs flex-1" : ""
      }`}
    >
      <CardContent className={`p-4 ${isLeader ? "p-6" : ""}`}>
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center mb-3 ${
            isLeader ? "w-16 h-16 mx-auto" : ""
          }`}
        >
          <Icon className={`text-white ${isLeader ? "w-8 h-8" : "w-6 h-6"}`} />
        </div>

        {/* Content */}
        <div className={isLeader ? "text-center" : ""}>
          <h3 className={`font-semibold ${isLeader ? "text-lg" : "text-sm"}`}>
            {agent.name}
          </h3>
          <Badge
            variant="secondary"
            className="mt-1 text-xs font-normal"
          >
            {agent.role}
          </Badge>
          <p
            className={`text-muted-foreground mt-2 ${
              isLeader ? "text-sm" : "text-xs"
            } line-clamp-2`}
          >
            {agent.description}
          </p>
        </div>

        {/* Pulse animation for active state */}
        <div className="absolute top-3 right-3">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-r ${agent.color} opacity-75`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r ${agent.color}`}
            />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
