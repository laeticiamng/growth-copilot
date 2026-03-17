import { useTranslation } from "react-i18next";
import { useLaunchOS } from "@/hooks/useLaunchOS";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Check, X, AlertTriangle, Clock, Zap } from "lucide-react";
import type { DecisionActionLog } from "@/lib/launch-os/types";

const getActionLabels = (t: (key: string, fallback: string) => string): Record<string, string> => ({
  pause_creative: t('launchOS.actions.pauseCreative', 'Mettre en pause la créa'),
  boost_creative: t('launchOS.actions.boostCreative', 'Booster la créa'),
  change_angle: t('launchOS.actions.changeAngle', 'Changer l\'angle'),
  change_landing: t('launchOS.actions.changeLanding', 'Changer la landing'),
  retarget_warm: t('launchOS.actions.retargetWarm', 'Recibler l\'audience tiède'),
  extend_campaign: t('launchOS.actions.extendCampaign', 'Prolonger la campagne'),
  change_cta: t('launchOS.actions.changeCta', 'Changer le CTA'),
  switch_hook: t('launchOS.actions.switchHook', 'Changer l\'accroche'),
  reallocate_budget: t('launchOS.actions.reallocateBudget', 'Réallouer le budget'),
  scale_channel: t('launchOS.actions.scaleChannel', 'Augmenter le canal'),
  pause_channel: t('launchOS.actions.pauseChannel', 'Mettre en pause le canal'),
});

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  recommended: { color: 'bg-amber-500', icon: AlertTriangle },
  approved: { color: 'bg-blue-500', icon: Check },
  executed: { color: 'bg-green-500', icon: Zap },
  rejected: { color: 'bg-red-500', icon: X },
};

export default function DecisionCenter() {
  const { t } = useTranslation();
  const { decisionActions, decisionRules, approveAction, rejectAction } = useLaunchOS();
  const actionLabels = getActionLabels(t);

  const pendingActions = decisionActions.filter(a => a.status === 'recommended');
  const pastActions = decisionActions.filter(a => a.status !== 'recommended');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Brain className="w-6 h-6 text-amber-500" />
          {t("launchOS.decisionCenter", "Centre de décisions")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("launchOS.decisionCenterDesc", "Recommandations IA et décisions automatisées")}
        </p>
      </div>

      {/* Pending Decisions */}
      {pendingActions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {t("launchOS.pendingReview", "En attente de revue")} ({pendingActions.length})
          </h2>
          <div className="space-y-3">
            {pendingActions.map(action => (
              <ActionCard key={action.id} action={action} onApprove={approveAction} onReject={rejectAction} />
            ))}
          </div>
        </div>
      )}

      {pendingActions.length === 0 && (
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Check className="w-10 h-10 text-green-500/30 mb-4" />
            <h3 className="font-semibold mb-2">{t("launchOS.allClear", "Tout est en ordre")}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t("launchOS.allClearDesc", "Aucune décision en attente. Le moteur de décision générera des recommandations à mesure que vos campagnes avancent.")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Active Rules */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t("launchOS.activeRules", "Règles actives")} ({decisionRules.length})</h2>
        {decisionRules.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {decisionRules.map(rule => (
              <Card key={rule.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{rule.name}</CardTitle>
                    <Badge variant={rule.is_auto_execute ? 'default' : 'outline'} className="text-xs">
                      {rule.is_auto_execute ? t("launchOS.auto", "Auto") : t("launchOS.manual", "Manuel")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{rule.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {actionLabels[rule.action] || rule.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {t("launchOS.priority", "Priorité")} : {rule.priority}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("launchOS.noRules", "Aucune règle configurée. Les règles par défaut seront créées au lancement d'un projet.")}
          </p>
        )}
      </div>

      {/* History */}
      {pastActions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">{t("launchOS.history", "Historique")}</h2>
          <div className="space-y-2">
            {pastActions.slice(0, 20).map(action => {
              const config = statusConfig[action.status] || statusConfig.recommended;
              const StatusIcon = config.icon;
              return (
                <div key={action.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <StatusIcon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{action.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(action.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={`${config.color} text-white text-xs`}>
                    {action.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ action, onApprove, onReject }: {
  action: DecisionActionLog;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}) {
  return (
    <Card className="border-amber-500/30">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {actionLabels[action.action] || action.action}
              </Badge>
            </div>
            <p className="text-sm">{action.reason}</p>
            {action.context && (
              <p className="text-xs text-muted-foreground mt-1">
                {t("launchOS.metric", "Métrique")} : {(action.context as Record<string, number>).metric_value?.toFixed(2)} | {t("launchOS.threshold", "Seuil")} : {(action.context as Record<string, number>).threshold}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onReject(action.id)} className="text-red-500">
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => onApprove(action.id)}>
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
