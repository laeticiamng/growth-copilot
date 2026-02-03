import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  EvidenceBundle, 
  EvidenceSource, 
  EvidenceReasoning, 
  CONFIDENCE_CONFIG, 
  SOURCE_TYPE_LABELS,
  KeyMetric 
} from "@/hooks/useEvidenceBundles";
import { 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  Shield, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Database,
  Brain,
  FileText,
  CheckCircle2
} from "lucide-react";

interface EvidenceBundleCardProps {
  bundle: EvidenceBundle;
  defaultExpanded?: boolean;
}

function MetricDisplay({ metric }: { metric: KeyMetric }) {
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
  const trendColor = metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground';

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div>
        <p className="text-sm text-muted-foreground">{metric.name}</p>
        <p className="text-lg font-semibold">
          {metric.value}{metric.unit}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {metric.change_percent !== undefined && (
          <span className={`text-sm font-medium ${trendColor}`}>
            {metric.change_percent > 0 ? '+' : ''}{metric.change_percent}%
          </span>
        )}
        <TrendIcon className={`w-4 h-4 ${trendColor}`} />
      </div>
    </div>
  );
}

function SourceCard({ source }: { source: EvidenceSource }) {
  const [isOpen, setIsOpen] = useState(false);
  const sourceConfig = SOURCE_TYPE_LABELS[source.source_type];
  const confidenceConfig = CONFIDENCE_CONFIG[source.confidence];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-lg">{sourceConfig.icon}</span>
            <div>
              <p className="font-medium text-sm">{source.source_name}</p>
              <p className="text-xs text-muted-foreground">{sourceConfig.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${confidenceConfig.color}`}>
              {confidenceConfig.icon} {confidenceConfig.label}
            </Badge>
            {source.is_verified && (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 pl-10 pr-3 pb-3">
        <div className="text-sm space-y-2">
          {source.source_url && (
            <a 
              href={source.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Voir la source
            </a>
          )}
          {source.data_snapshot_at && (
            <p className="text-muted-foreground">
              Capturé le {new Date(source.data_snapshot_at).toLocaleString('fr-FR')}
            </p>
          )}
          {source.reliability_notes && (
            <p className="text-muted-foreground italic">{source.reliability_notes}</p>
          )}
          {Object.keys(source.data_extracted).length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Données extraites
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                {JSON.stringify(source.data_extracted, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ReasoningStep({ step, index }: { step: EvidenceReasoning; index: number }) {
  const stepIcons: Record<string, React.ReactNode> = {
    observation: <Database className="w-4 h-4" />,
    analysis: <Brain className="w-4 h-4" />,
    hypothesis: <FileText className="w-4 h-4" />,
    conclusion: <CheckCircle2 className="w-4 h-4" />,
    recommendation: <TrendingUp className="w-4 h-4" />,
  };

  const stepLabels: Record<string, string> = {
    observation: 'Observation',
    analysis: 'Analyse',
    hypothesis: 'Hypothèse',
    conclusion: 'Conclusion',
    recommendation: 'Recommandation',
  };

  const confidenceConfig = CONFIDENCE_CONFIG[step.confidence];

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {stepIcons[step.step_type] || <span>{index + 1}</span>}
        </div>
        {index < 10 && <div className="w-0.5 h-full bg-border mt-2" />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{stepLabels[step.step_type]}</span>
          <Badge variant="outline" className={`text-xs ${confidenceConfig.color}`}>
            {confidenceConfig.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{step.content}</p>
        {step.alternative_interpretations && step.alternative_interpretations.length > 0 && (
          <details className="mt-2">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              Interprétations alternatives
            </summary>
            <ul className="mt-1 text-xs text-muted-foreground list-disc pl-4">
              {step.alternative_interpretations.map((alt, i) => (
                <li key={i}>{alt}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}

export function EvidenceBundleCard({ bundle, defaultExpanded = false }: EvidenceBundleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const confidenceConfig = CONFIDENCE_CONFIG[bundle.overall_confidence];

  const hasWarnings = bundle.warnings && bundle.warnings.length > 0;
  const hasLimitations = bundle.limitations && bundle.limitations.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {bundle.title}
            </CardTitle>
            {bundle.summary && (
              <CardDescription>{bundle.summary}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={confidenceConfig.color}>
              Confiance: {confidenceConfig.label}
            </Badge>
            {bundle.confidence_score !== null && bundle.confidence_score !== undefined && (
              <div className="flex items-center gap-1">
                <Progress value={bundle.confidence_score} className="w-16 h-2" />
                <span className="text-xs text-muted-foreground">{bundle.confidence_score}%</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        {bundle.key_metrics && bundle.key_metrics.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Métriques clés</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {bundle.key_metrics.map((metric, i) => (
                <MetricDisplay key={i} metric={metric} />
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {hasWarnings && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Avertissements</p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc pl-4 mt-1">
                  {bundle.warnings!.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Expandable sections */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span>Voir les détails</span>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Sources */}
            {bundle.sources && bundle.sources.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Sources ({bundle.sources.length})
                </h4>
                <div className="space-y-2">
                  {bundle.sources.map((source) => (
                    <SourceCard key={source.id} source={source} />
                  ))}
                </div>
              </div>
            )}

            {/* Reasoning */}
            {bundle.reasoning && bundle.reasoning.length > 0 && (
              <div>
                <Separator className="my-4" />
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Raisonnement IA
                </h4>
                <div className="pl-2">
                  {bundle.reasoning.map((step, i) => (
                    <ReasoningStep key={step.id} step={step} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Limitations */}
            {hasLimitations && (
              <div>
                <Separator className="my-4" />
                <h4 className="text-sm font-medium mb-2">Limitations</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  {bundle.limitations!.map((limitation, i) => (
                    <li key={i}>{limitation}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground text-right">
              Généré le {new Date(bundle.generated_at).toLocaleString('fr-FR')}
            </p>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
