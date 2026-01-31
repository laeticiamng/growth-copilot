import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, Bot, Calendar, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { useState } from "react";
import { toast } from "sonner";

export default function Reports() {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [generating, setGenerating] = useState(false);

  // Fetch monthly reports from database
  const { data: reports, isLoading: reportsLoading, refetch } = useQuery({
    queryKey: ['monthly-reports', currentWorkspace?.id, currentSite?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id || !currentSite?.id) return [];
      
      const { data, error } = await supabase
        .from('monthly_reports')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('site_id', currentSite.id)
        .order('month', { ascending: false })
        .limit(12);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id && !!currentSite?.id,
  });

  // Fetch recent audit trail actions
  const { data: auditTrail, isLoading: auditLoading } = useQuery({
    queryKey: ['audit-trail', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      
      const { data, error } = await supabase
        .from('action_log')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('actor_type', 'agent')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id,
  });

  // Fetch KPI trend (last 30 days conversions)
  const { data: kpiTrend } = useQuery({
    queryKey: ['kpi-trend', currentWorkspace?.id, currentSite?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id || !currentSite?.id) return null;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const { data: current } = await supabase
        .from('kpis_daily')
        .select('total_conversions')
        .eq('site_id', currentSite.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      const { data: previous } = await supabase
        .from('kpis_daily')
        .select('total_conversions')
        .eq('site_id', currentSite.id)
        .gte('date', sixtyDaysAgo.toISOString().split('T')[0])
        .lt('date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      const currentSum = (current || []).reduce((sum, k) => sum + (k.total_conversions || 0), 0);
      const previousSum = (previous || []).reduce((sum, k) => sum + (k.total_conversions || 0), 0);
      
      if (previousSum === 0) return null;
      
      return {
        change: ((currentSum - previousSum) / previousSum * 100).toFixed(0),
        currentSum,
        previousSum,
      };
    },
    enabled: !!currentWorkspace?.id && !!currentSite?.id,
  });

  const handleGenerateReport = async () => {
    if (!currentWorkspace?.id || !currentSite?.id) {
      toast.error("Veuillez sélectionner un site");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          workspace_id: currentWorkspace.id,
          site_id: currentSite.id,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Rapport généré avec succès");
        refetch();
      } else {
        toast.error(data?.error || "Erreur lors de la génération");
      }
    } catch (err) {
      console.error('Report generation error:', err);
      toast.error("Erreur lors de la génération du rapport");
    } finally {
      setGenerating(false);
    }
  };

  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Il y a moins d'une heure";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Hier";
    return `Il y a ${diffDays} jours`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">Audit trail et rapports mensuels</p>
        </div>
        <Button 
          variant="hero" 
          onClick={handleGenerateReport}
          disabled={generating || !currentSite}
        >
          {generating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Générer rapport PDF
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card variant="feature" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Rapports mensuels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : reports && reports.length > 0 ? (
              reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-medium capitalize">{formatMonth(report.month)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="gradient">Prêt</Badge>
                    {report.pdf_url && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(report.pdf_url, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Aucun rapport disponible</p>
                <p className="text-sm mt-1">Générez votre premier rapport mensuel</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="feature">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Audit Trail
            </CardTitle>
            <CardDescription>Dernières actions IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {auditLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : auditTrail && auditTrail.length > 0 ? (
              auditTrail.slice(0, 5).map((action) => (
                <div key={action.id} className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-sm font-medium">{action.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.actor_id || 'Agent'} • {formatTimeAgo(action.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune action enregistrée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {kpiTrend && Number(kpiTrend.change) !== 0 && (
        <Card variant="gradient">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8" />
              <div>
                <p className="font-bold text-lg">
                  {Number(kpiTrend.change) > 0 ? '+' : ''}{kpiTrend.change}% de conversions ce mois
                </p>
                <p className="text-sm opacity-80">Comparé au mois précédent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}