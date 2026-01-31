import { Bot, Brain, Search, FileText, BarChart3, Megaphone, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const agents = [
  {
    id: "cgo",
    name: "Chief Growth Officer",
    role: "Orchestrateur Principal",
    description: "Coordonne tous les agents et priorise les actions selon l'impact business",
    icon: Brain,
    color: "from-primary to-primary/60",
    level: 0,
  },
  {
    id: "analytics",
    name: "Analytics Guardian",
    role: "Data & KPIs",
    description: "Surveille les métriques, détecte les anomalies et assure la qualité des données",
    icon: BarChart3,
    color: "from-blue-500 to-blue-400",
    level: 1,
  },
  {
    id: "seo-tech",
    name: "SEO Tech Auditor",
    role: "Audit Technique",
    description: "Crawle le site, identifie les erreurs techniques et génère les correctifs",
    icon: Search,
    color: "from-green-500 to-green-400",
    level: 1,
  },
  {
    id: "content",
    name: "Content Strategist",
    role: "Stratégie Contenu",
    description: "Analyse les mots-clés, planifie le calendrier éditorial et détecte les opportunités",
    icon: FileText,
    color: "from-purple-500 to-purple-400",
    level: 1,
  },
  {
    id: "media",
    name: "Media Promotion",
    role: "Lancement Média",
    description: "Orchestre les campagnes YouTube, Spotify et réseaux sociaux",
    icon: Megaphone,
    color: "from-orange-500 to-orange-400",
    level: 1,
  },
  {
    id: "qco",
    name: "Quality Control",
    role: "Contrôle Qualité",
    description: "Valide les outputs, vérifie la conformité brand et assure la cohérence",
    icon: Shield,
    color: "from-red-500 to-red-400",
    level: 2,
  },
  {
    id: "autopilot",
    name: "Autopilot Engine",
    role: "Exécution Auto",
    description: "Exécute les actions approuvées et gère le workflow d'approbation",
    icon: Zap,
    color: "from-yellow-500 to-yellow-400",
    level: 2,
  },
];

export function TeamOrgChart() {
  const cgo = agents.find((a) => a.level === 0)!;
  const level1 = agents.filter((a) => a.level === 1);
  const level2 = agents.filter((a) => a.level === 2);

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
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
            7 agents IA spécialisés travaillent en synergie pour optimiser votre
            croissance, 24h/24
          </p>
        </div>

        {/* Org Chart */}
        <div className="relative">
          {/* Level 0 - CGO */}
          <div className="flex justify-center mb-8">
            <AgentCard agent={cgo} isLeader />
          </div>

          {/* Connection lines from CGO to Level 1 */}
          <div className="hidden md:block absolute top-[140px] left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="hidden md:flex justify-around absolute top-[140px] left-[10%] right-[10%]">
            {level1.map((_, i) => (
              <div key={i} className="w-px h-8 bg-border" />
            ))}
          </div>

          {/* Level 1 - Main Agents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-8 md:mt-16">
            {level1.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>

          {/* Connection lines from Level 1 to Level 2 */}
          <div className="hidden md:block absolute bottom-[200px] left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Level 2 - Support Agents */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            {level2.map((agent) => (
              <AgentCard key={agent.id} agent={agent} isSupport />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { value: "24/7", label: "Disponibilité" },
            { value: "7", label: "Agents spécialisés" },
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
        isLeader ? "max-w-sm mx-auto" : isSupport ? "max-w-xs" : ""
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
