import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLaunchOS } from "@/hooks/useLaunchOS";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Rocket, Plus, BarChart3, Zap, Brain, Target,
  Music, Globe, AlertTriangle, CheckCircle2, Clock, Pause, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { useExperienceScene } from "@/experience/runtime/ExperienceProvider";
import { getLaunchCategory } from "@/lib/launch-os/types";
import type { LaunchProject, LaunchStatus } from "@/lib/launch-os/types";

const getStatusConfig = (t: (key: string, fallback: string) => string): Record<LaunchStatus, { label: string; color: string; icon: typeof Clock }> => ({
  draft: { label: t('launchOS.status.draft', 'Brouillon'), color: 'bg-slate-500', icon: Clock },
  readiness_check: { label: t('launchOS.status.readinessCheck', 'Vérification'), color: 'bg-amber-500', icon: AlertTriangle },
  ready_to_launch: { label: t('launchOS.status.ready', 'Prêt'), color: 'bg-green-500', icon: CheckCircle2 },
  pre_launch: { label: t('launchOS.status.preLaunch', 'Pré-lancement'), color: 'bg-blue-500', icon: Rocket },
  launching: { label: t('launchOS.status.launching', 'En cours'), color: 'bg-purple-500', icon: Zap },
  post_launch: { label: t('launchOS.status.postLaunch', 'Post-lancement'), color: 'bg-indigo-500', icon: BarChart3 },
  completed: { label: t('launchOS.status.completed', 'Terminé'), color: 'bg-emerald-500', icon: CheckCircle2 },
  paused: { label: t('launchOS.status.paused', 'En pause'), color: 'bg-orange-500', icon: Pause },
  cancelled: { label: t('launchOS.status.cancelled', 'Annulé'), color: 'bg-red-500', icon: AlertTriangle },
});

export default function LaunchOSHome() {
  useExperienceScene({ sceneId: "launch-orbit", mode: "ambient", intensity: 2, mood: "focused" });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { projects, setCurrentProject, decisionActions, campaignMemories, loading } = useLaunchOS();
  const statusConfig = getStatusConfig(t);

  const activeProjects = projects.filter(p => !['completed', 'cancelled'].includes(p.status));
  const completedProjects = projects.filter(p => p.status === 'completed');
  const pendingActions = decisionActions.filter(a => a.status === 'recommended');

  // Stats
  const totalLaunches = projects.length;
  const activeLaunches = activeProjects.length;
  const avgScore = projects.filter(p => p.readiness_score != null).reduce((acc, p) => acc + (p.readiness_score || 0), 0) / Math.max(1, projects.filter(p => p.readiness_score != null).length);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 experience-stage">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Rocket className="w-6 h-6 text-primary-foreground" />
            </div>
            Launch OS
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("launchOS.description", "Orchestrez vos lancements avec précision")}
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/launch-os/new')} size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          {t("launchOS.newLaunch", "Nouveau lancement")}
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="experience-panel">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("launchOS.totalLaunches", "Total lancements")}</p>
                <p className="text-3xl font-bold">{totalLaunches}</p>
              </div>
              <Rocket className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="experience-panel">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("launchOS.active", "Actifs")}</p>
                <p className="text-3xl font-bold">{activeLaunches}</p>
              </div>
              <Zap className="w-8 h-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="experience-panel">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("launchOS.avgReadiness", "Score moyen")}</p>
                <p className="text-3xl font-bold">{avgScore > 0 ? `${Math.round(avgScore)}` : '—'}</p>
              </div>
              <Target className="w-8 h-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="experience-panel">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("launchOS.pendingActions", "Actions en attente")}</p>
                <p className="text-3xl font-bold">{pendingActions.length}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions Alert */}
      {pendingActions.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5 experience-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t("launchOS.decisionsPending", "{{count}} décision(s) en attente", { count: pendingActions.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingActions.slice(0, 3).map(action => (
                <div key={action.id} className="flex items-center justify-between p-2 rounded-lg bg-background">
                  <span className="text-sm">{action.reason}</span>
                  <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/launch-os/decisions')}>
                    {t("launchOS.review", "Examiner")}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Projects */}
      {activeProjects.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("launchOS.activeLaunches", "Lancements actifs")}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => {
                  setCurrentProject(project);
                  navigate('/dashboard/launch-os/project');
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-dashed experience-panel">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Rocket className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("launchOS.emptyTitle", "Lancez quelque chose de grand")}</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {t("launchOS.emptyDescription", "Créez votre premier projet de lancement. Sortie musicale, produit SaaS, ou campagne de marque — nous orchestrons chaque étape.")}
            </p>
            <Button onClick={() => navigate('/dashboard/launch-os/new')} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              {t("launchOS.createFirst", "Créer votre premier lancement")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Access */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("launchOS.creativeLab", "Labo Créatif"), icon: Zap, path: '/dashboard/launch-os/creatives', color: 'text-purple-500' },
          { label: t("launchOS.videoStudio", "Studio Vidéo"), icon: Music, path: '/dashboard/launch-os/videos', color: 'text-pink-500' },
          { label: t("launchOS.signalCenter", "Centre de signaux"), icon: BarChart3, path: '/dashboard/launch-os/signals', color: 'text-blue-500' },
          { label: t("launchOS.decisionCenter", "Centre de décisions"), icon: Brain, path: '/dashboard/launch-os/decisions', color: 'text-amber-500' },
        ].map(item => (
          <Card
            key={item.path}
            className="cursor-pointer hover:border-primary/30 transition-all hover:shadow-sm group"
            onClick={() => navigate(item.path)}
          >
            <CardContent className="flex flex-col items-center justify-center py-6">
              <item.icon className={`w-8 h-8 mb-2 ${item.color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm font-medium">{item.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign Memory */}
      {campaignMemories.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            {t("launchOS.campaignIntelligence", "Intelligence de campagne")}
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {campaignMemories.slice(0, 3).flatMap(m => {
                  const learnings = m.learnings as Array<{ insight: string; confidence: number; category: string }>;
                  return Array.isArray(learnings) ? learnings : [];
                }).slice(0, 5).map((learning, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm">{learning.insight}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("launchOS.confidence", "Confiance")} : {Math.round(learning.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">{t("launchOS.completed", "Terminés")}</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {completedProjects.slice(0, 6).map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                compact
                onClick={() => {
                  setCurrentProject(project);
                  navigate('/dashboard/launch-os/project');
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Project Card ───────────────────────────────────────────────────────────

function ProjectCard({ project, onClick, compact }: { project: LaunchProject; onClick: () => void; compact?: boolean }) {
  const config = statusConfig[project.status];
  const StatusIcon = config.icon;
  const isMusic = getLaunchCategory(project.launch_type) === 'music';

  return (
    <Card
      className="cursor-pointer hover:border-primary/30 transition-all hover:shadow-sm"
      onClick={onClick}
    >
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMusic ? <Music className="w-4 h-4 text-pink-500" /> : <Globe className="w-4 h-4 text-blue-500" />}
            <Badge variant="outline" className="text-xs">{project.launch_type.replace(/_/g, ' ')}</Badge>
          </div>
          <Badge className={`${config.color} text-white text-xs`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        <CardTitle className={compact ? 'text-sm' : 'text-base'}>{project.name}</CardTitle>
        {!compact && project.launch_date && (
          <CardDescription>
            Launch: {format(new Date(project.launch_date), 'MMM d, yyyy')}
          </CardDescription>
        )}
      </CardHeader>
      {!compact && (
        <CardContent>
          {project.readiness_score != null && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Readiness</span>
                <span className="font-medium">{project.readiness_score}/100</span>
              </div>
              <Progress value={project.readiness_score} className="h-2" />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
