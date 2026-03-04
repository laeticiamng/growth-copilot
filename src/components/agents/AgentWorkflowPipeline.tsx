import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight, CheckCircle, Clock, Play, Zap, GitBranch,
  Target, PenTool, Share2, Search, BarChart3, Shield, Bot,
  TrendingUp, Mail, Eye, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { AGENTS_CATALOG } from "@/data/agents-catalog";

// ── Pipeline Templates ──

interface PipelineStep {
  agentSlug: string;
  durationMin: number;
  output: Record<string, string>;
}

interface PipelineTemplate {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: PipelineStep[];
}

const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: "seo-content",
    name: { fr: "SEO → Contenu → Social", en: "SEO → Content → Social" },
    description: {
      fr: "Pipeline complet : audit technique, recherche de mots-clés, création de contenu et distribution sociale.",
      en: "Full pipeline: technical audit, keyword research, content creation and social distribution.",
    },
    category: "marketing",
    icon: Target,
    steps: [
      { agentSlug: "seo-tech-auditor", durationMin: 5, output: { fr: "Rapport d'audit technique", en: "Technical audit report" } },
      { agentSlug: "keyword-strategist", durationMin: 8, output: { fr: "Clusters sémantiques + brief", en: "Semantic clusters + brief" } },
      { agentSlug: "content-builder", durationMin: 15, output: { fr: "Article SEO optimisé", en: "Optimized SEO article" } },
      { agentSlug: "social-media-manager", durationMin: 5, output: { fr: "Posts sociaux planifiés", en: "Scheduled social posts" } },
    ],
  },
  {
    id: "lead-to-close",
    name: { fr: "Qualification → Nurturing → Closing", en: "Qualification → Nurturing → Closing" },
    description: {
      fr: "Pipeline commercial complet, de la qualification du lead au closing du deal.",
      en: "Full sales pipeline, from lead qualification to deal closing.",
    },
    category: "sales",
    icon: TrendingUp,
    steps: [
      { agentSlug: "lead-qualifier", durationMin: 3, output: { fr: "Score lead + qualification", en: "Lead score + qualification" } },
      { agentSlug: "offer-architect", durationMin: 10, output: { fr: "Offre personnalisée", en: "Personalized offer" } },
      { agentSlug: "lifecycle-manager", durationMin: 5, output: { fr: "Séquence email activée", en: "Email sequence activated" } },
      { agentSlug: "deal-closer", durationMin: 8, output: { fr: "Proposition finale", en: "Final proposal" } },
    ],
  },
  {
    id: "audit-compliance",
    name: { fr: "Audit → Compliance → Report", en: "Audit → Compliance → Report" },
    description: {
      fr: "Pipeline de gouvernance : audit de sécurité, vérification conformité et génération de rapport.",
      en: "Governance pipeline: security audit, compliance check and report generation.",
    },
    category: "governance",
    icon: Shield,
    steps: [
      { agentSlug: "security-auditor", durationMin: 10, output: { fr: "Vulnérabilités détectées", en: "Vulnerabilities detected" } },
      { agentSlug: "compliance-auditor", durationMin: 8, output: { fr: "Matrice de conformité", en: "Compliance matrix" } },
      { agentSlug: "risk-assessor", durationMin: 5, output: { fr: "Évaluation des risques", en: "Risk assessment" } },
      { agentSlug: "reporting-agent", durationMin: 5, output: { fr: "Rapport exécutif", en: "Executive report" } },
    ],
  },
  {
    id: "ads-optimization",
    name: { fr: "Ads → CRO → Analytics", en: "Ads → CRO → Analytics" },
    description: {
      fr: "Pipeline d'optimisation publicitaire : campagnes, conversion et mesure d'impact.",
      en: "Ads optimization pipeline: campaigns, conversion and impact measurement.",
    },
    category: "performance",
    icon: BarChart3,
    steps: [
      { agentSlug: "ads-optimizer", durationMin: 10, output: { fr: "Campagne optimisée", en: "Optimized campaign" } },
      { agentSlug: "cro-specialist", durationMin: 8, output: { fr: "A/B tests recommandés", en: "Recommended A/B tests" } },
      { agentSlug: "analytics-detective", durationMin: 5, output: { fr: "Dashboard d'impact", en: "Impact dashboard" } },
    ],
  },
  {
    id: "product-iteration",
    name: { fr: "Feature → UX → Code → Test", en: "Feature → UX → Code → Test" },
    description: {
      fr: "Pipeline produit complet : de l'analyse de feature au déploiement testé.",
      en: "Full product pipeline: from feature analysis to tested deployment.",
    },
    category: "product",
    icon: GitBranch,
    steps: [
      { agentSlug: "feature-analyst", durationMin: 8, output: { fr: "Spécification validée", en: "Validated specification" } },
      { agentSlug: "ux-optimizer", durationMin: 10, output: { fr: "Maquettes UX", en: "UX mockups" } },
      { agentSlug: "code-reviewer", durationMin: 12, output: { fr: "Code reviewé", en: "Reviewed code" } },
      { agentSlug: "testing-agent", durationMin: 5, output: { fr: "Suite de tests", en: "Test suite" } },
    ],
  },
];

// ── Timeline Step ──

function TimelineStep({
  step,
  index,
  total,
  isActive,
  isCompleted,
  onClick,
  lang,
}: {
  step: PipelineStep;
  index: number;
  total: number;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  lang: string;
}) {
  const agent = AGENTS_CATALOG.find((a) => a.slug === step.agentSlug);
  const Icon = agent?.icon || Bot;
  const l = lang.startsWith("fr") ? "fr" : "en";

  return (
    <div className="flex items-start gap-0 shrink-0">
      {/* Node */}
      <button
        onClick={onClick}
        className={cn(
          "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all min-w-[160px] max-w-[200px] cursor-pointer",
          isActive && "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-105",
          isCompleted && !isActive && "border-chart-3/50 bg-chart-3/5",
          !isActive && !isCompleted && "border-border bg-card hover:border-primary/30 hover:bg-muted/50"
        )}
      >
        {/* Step number */}
        <div
          className={cn(
            "absolute -top-3 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            isCompleted ? "bg-chart-3 text-chart-3-foreground" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : index + 1}
        </div>

        {/* Agent icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isActive ? "bg-primary/20" : isCompleted ? "bg-chart-3/20" : "bg-muted"
          )}
        >
          <Icon className={cn("w-5 h-5", isActive ? "text-primary" : isCompleted ? "text-chart-3" : "text-muted-foreground")} />
        </div>

        {/* Agent name */}
        <div className="text-center">
          <p className={cn("text-xs font-semibold leading-tight", isActive ? "text-primary" : "text-foreground")}>
            {agent?.persona.name || step.agentSlug}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{agent?.role[l] || ""}</p>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          ~{step.durationMin} min
        </div>
      </button>

      {/* Arrow connector */}
      {index < total - 1 && (
        <div className="flex items-center self-center pt-2 px-1">
          <div className={cn("h-0.5 w-6", isCompleted ? "bg-chart-3" : "bg-border")} />
          <ArrowRight className={cn("w-4 h-4 -ml-1", isCompleted ? "text-chart-3" : "text-muted-foreground")} />
        </div>
      )}
    </div>
  );
}

// ── Step Detail Panel ──

function StepDetailPanel({ step, lang }: { step: PipelineStep; lang: string }) {
  const agent = AGENTS_CATALOG.find((a) => a.slug === step.agentSlug);
  const l = lang.startsWith("fr") ? "fr" : "en";
  const Icon = agent?.icon || Bot;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h4 className="font-semibold text-foreground">{agent?.persona.name}</h4>
              <p className="text-sm text-muted-foreground">{agent?.role[l]}</p>
            </div>
            <p className="text-sm text-foreground/80">{agent?.description[l]}</p>

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                ~{step.durationMin} min
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                {step.output[l]}
              </Badge>
              {agent?.requiresApproval && (
                <Badge variant="destructive" className="text-xs">
                  {l === "fr" ? "Approbation requise" : "Approval required"}
                </Badge>
              )}
            </div>

            {agent?.useCases[l] && (
              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {l === "fr" ? "Capacités :" : "Capabilities:"}
                </p>
                <div className="flex flex-wrap gap-1">
                  {agent.useCases[l].slice(0, 4).map((uc) => (
                    <Badge key={uc} variant="outline" className="text-[10px] bg-background">
                      {uc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Pipeline Card ──

function PipelineCard({
  pipeline,
  lang,
  isSelected,
  onClick,
}: {
  pipeline: PipelineTemplate;
  lang: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const l = lang.startsWith("fr") ? "fr" : "en";
  const Icon = pipeline.icon;
  const totalDuration = pipeline.steps.reduce((s, st) => s + st.durationMin, 0);

  const categoryColors: Record<string, string> = {
    marketing: "border-chart-4/30 hover:border-chart-4/60",
    sales: "border-chart-5/30 hover:border-chart-5/60",
    governance: "border-chart-1/30 hover:border-chart-1/60",
    performance: "border-chart-2/30 hover:border-chart-2/60",
    product: "border-primary/30 hover:border-primary/60",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left w-full p-3 rounded-xl border-2 transition-all",
        categoryColors[pipeline.category] || "border-border",
        isSelected ? "ring-2 ring-primary bg-primary/5 shadow-md" : "bg-card hover:bg-muted/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{pipeline.name[l]}</p>
          <p className="text-xs text-muted-foreground">
            {pipeline.steps.length} {l === "fr" ? "étapes" : "steps"} · ~{totalDuration} min
          </p>
        </div>
      </div>

      {/* Mini agent avatars */}
      <div className="flex items-center gap-1 mt-2">
        {pipeline.steps.map((step, i) => {
          const agent = AGENTS_CATALOG.find((a) => a.slug === step.agentSlug);
          return (
            <div key={i} className="flex items-center gap-0.5">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground border">
                {agent?.persona.initials || "??"}
              </div>
              {i < pipeline.steps.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/50" />}
            </div>
          );
        })}
      </div>
    </button>
  );
}

// ── Main Component ──

export function AgentWorkflowPipeline() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const l = lang.startsWith("fr") ? "fr" : "en";

  const [selectedPipeline, setSelectedPipeline] = useState(PIPELINE_TEMPLATES[0].id);
  const [activeStep, setActiveStep] = useState(0);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const pipeline = useMemo(
    () => PIPELINE_TEMPLATES.find((p) => p.id === selectedPipeline) || PIPELINE_TEMPLATES[0],
    [selectedPipeline]
  );

  const totalDuration = pipeline.steps.reduce((s, st) => s + st.durationMin, 0);

  const handleSelectPipeline = (id: string) => {
    setSelectedPipeline(id);
    setActiveStep(0);
    setCompletedSteps([]);
    setSimulationRunning(false);
  };

  const simulateRun = () => {
    setSimulationRunning(true);
    setActiveStep(0);
    setCompletedSteps([]);
    let step = 0;
    const interval = setInterval(() => {
      setCompletedSteps((prev) => [...prev, step]);
      step++;
      if (step < pipeline.steps.length) {
        setActiveStep(step);
      } else {
        clearInterval(interval);
        setSimulationRunning(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            {l === "fr" ? "Workflows Inter-Agents" : "Inter-Agent Workflows"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {l === "fr"
              ? "Visualisez comment les agents collaborent en pipeline"
              : "Visualize how agents collaborate in pipelines"}
          </p>
        </div>
        <Button
          onClick={simulateRun}
          disabled={simulationRunning}
          size="sm"
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          {simulationRunning
            ? l === "fr" ? "Simulation..." : "Simulating..."
            : l === "fr" ? "Simuler le pipeline" : "Simulate pipeline"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Pipeline selector */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {l === "fr" ? "Pipelines disponibles" : "Available pipelines"}
          </p>
          {PIPELINE_TEMPLATES.map((p) => (
            <PipelineCard
              key={p.id}
              pipeline={p}
              lang={lang}
              isSelected={selectedPipeline === p.id}
              onClick={() => handleSelectPipeline(p.id)}
            />
          ))}
        </div>

        {/* Timeline + detail */}
        <div className="lg:col-span-3 space-y-4">
          {/* Pipeline info bar */}
          <Card className="bg-muted/30">
            <CardContent className="p-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <pipeline.icon className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">{pipeline.name[l]}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  {pipeline.steps.length} {l === "fr" ? "agents" : "agents"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{totalDuration} min
                </span>
                {completedSteps.length === pipeline.steps.length && (
                  <Badge variant="secondary" className="text-chart-3 bg-chart-3/10">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {l === "fr" ? "Complété" : "Completed"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interactive timeline */}
          <ScrollArea className="w-full">
            <div className="flex items-start gap-0 py-6 px-2 min-w-max">
              {pipeline.steps.map((step, i) => (
                <TimelineStep
                  key={`${pipeline.id}-${i}`}
                  step={step}
                  index={i}
                  total={pipeline.steps.length}
                  isActive={activeStep === i}
                  isCompleted={completedSteps.includes(i)}
                  onClick={() => {
                    setActiveStep(i);
                  }}
                  lang={lang}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-chart-3 rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps.length / pipeline.steps.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {completedSteps.length}/{pipeline.steps.length}
            </span>
          </div>

          {/* Step detail */}
          <StepDetailPanel step={pipeline.steps[activeStep]} lang={lang} />

          {/* Pipeline description */}
          <p className="text-sm text-muted-foreground italic">
            {pipeline.description[l]}
          </p>
        </div>
      </div>
    </div>
  );
}
