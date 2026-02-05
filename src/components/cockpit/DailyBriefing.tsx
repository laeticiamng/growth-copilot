/**
 * Daily Briefing Component
 * Agent: Sophie Marchand (CGO)
 * Generates: AI-powered daily briefing based on workspace metrics
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Loader2, 
  RefreshCw,
  Calendar,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";

interface BriefingData {
  summary: string;
  priorities: string[];
  highlights: string[];
  concerns: string[];
  generated_at: string;
}

interface DailyBriefingProps {
  className?: string;
}

export function DailyBriefing({ className }: DailyBriefingProps) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load cached briefing on mount
  useEffect(() => {
    const loadCachedBriefing = async () => {
      if (!currentWorkspace?.id) {
        setLoading(false);
        return;
      }

      try {
        // Check if we have a recent briefing (last 12 hours)
        const twelveHoursAgo = new Date();
        twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

        const { data } = await supabase
          .from('agent_runs')
          .select('outputs, created_at')
          .eq('workspace_id', currentWorkspace.id)
          .eq('agent_type', 'chief_growth_officer')
          .gte('created_at', twelveHoursAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0 && data[0].outputs) {
          const outputs = data[0].outputs as Record<string, unknown>;
          if (outputs.daily_briefing) {
            setBriefing({
              ...(outputs.daily_briefing as Omit<BriefingData, 'generated_at'>),
              generated_at: data[0].created_at || new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error("Error loading cached briefing:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCachedBriefing();
  }, [currentWorkspace?.id]);

  const handleGenerateBriefing = async () => {
    if (!currentWorkspace) {
      toast.error("Aucun workspace sélectionné");
      return;
    }

    setGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Veuillez vous connecter");
        setGenerating(false);
        return;
      }

      // Fetch recent metrics for context
      const [kpisRes, runsRes, approvalsRes] = await Promise.all([
        supabase
          .from('kpis_daily')
          .select('*')
          .eq('site_id', currentSite?.id || '')
          .order('date', { ascending: false })
          .limit(7),
        supabase
          .from('agent_runs')
          .select('agent_type, status, created_at')
          .eq('workspace_id', currentWorkspace.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('approval_queue')
          .select('*')
          .eq('workspace_id', currentWorkspace.id)
          .eq('status', 'pending'),
      ]);

      const context = {
        workspace_name: currentWorkspace.name,
        site_name: currentSite?.name,
        recent_kpis: kpisRes.data?.slice(0, 3) || [],
        runs_last_24h: runsRes.data?.length || 0,
        pending_approvals: approvalsRes.data?.length || 0,
        current_date: new Date().toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
      };

      const systemPrompt = `Tu es Sophie Marchand, Directrice de la Croissance (CGO) avec 20 ans d'expérience dans le pilotage stratégique d'entreprises. Tu fournis des briefings exécutifs clairs et actionnables.

MISSION : Générer le briefing quotidien pour le dirigeant.

Tu dois retourner un JSON avec cette structure exacte :
{
  "summary": "Résumé",
  "actions": [],
  "risks": [],
  "dependencies": [],
  "metrics_to_watch": ["leads", "conversions", "roi"],
  "requires_approval": false,
  "daily_briefing": {
    "summary": "Briefing de 3-5 phrases sur la situation du jour et les priorités",
    "priorities": ["Priorité 1", "Priorité 2", "Priorité 3"],
    "highlights": ["Point positif 1", "Point positif 2"],
    "concerns": ["Point d'attention 1"]
  }
}

RÈGLES :
- Le résumé doit être concis (3-5 phrases max)
- Maximum 3 priorités actionnables
- Ton professionnel mais accessible
- Inclure des données chiffrées quand disponibles`;

      const userPrompt = `Génère le briefing du jour pour ${context.workspace_name}.

CONTEXTE :
- Site : ${context.site_name || "Non configuré"}
- Date : ${context.current_date}
- Runs IA dernières 24h : ${context.runs_last_24h}
- Approbations en attente : ${context.pending_approvals}
- KPIs récents : ${JSON.stringify(context.recent_kpis)}

Génère un briefing exécutif adapté à cette situation.`;

      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          workspace_id: currentWorkspace.id,
          agent_name: "cgo",
          purpose: "briefing",
          input: {
            system_prompt: systemPrompt,
            user_prompt: userPrompt,
            context,
          }
        }
      });

      if (error) throw error;

      if (data?.success && data?.artifact?.daily_briefing) {
        setBriefing({
          ...(data.artifact.daily_briefing as Omit<BriefingData, 'generated_at'>),
          generated_at: new Date().toISOString(),
        });
        toast.success("Briefing généré !");
      } else {
        throw new Error(data?.error || "Erreur lors de la génération");
      }
    } catch (err) {
      console.error("Briefing generation error:", err);
      toast.error("Erreur lors de la génération du briefing");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="gradient" className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Briefing du jour</CardTitle>
              <CardDescription>
                Sophie Marchand • Directrice de la Croissance
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGenerateBriefing}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : briefing ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!briefing ? (
          <div className="text-center py-6">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-primary/50" />
            <p className="text-sm text-muted-foreground mb-4">
              Aucun briefing disponible pour aujourd'hui
            </p>
            <Button 
              variant="hero" 
              onClick={handleGenerateBriefing}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer le briefing
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <p className="text-sm leading-relaxed">{briefing.summary}</p>

            {/* Priorities */}
            {briefing.priorities?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Priorités du jour</p>
                <ul className="space-y-1">
                  {briefing.priorities.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="font-bold text-primary">{i + 1}.</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Highlights & Concerns */}
            <div className="grid sm:grid-cols-2 gap-3">
              {briefing.highlights?.length > 0 && (
                <div className="p-3 rounded-lg bg-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">Points positifs</span>
                  </div>
                  <ul className="space-y-1">
                    {briefing.highlights.map((h, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {h}</li>
                    ))}
                  </ul>
                </div>
              )}
              {briefing.concerns?.length > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-xs font-medium">À surveiller</span>
                  </div>
                  <ul className="space-y-1">
                    {briefing.concerns.map((c, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Generated time */}
            <p className="text-xs text-muted-foreground text-right">
              Généré {new Date(briefing.generated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
