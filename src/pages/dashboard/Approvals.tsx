import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Zap,
  Settings,
  Eye,
  Bot,
  History,
  Loader2,
} from "lucide-react";
import { useApprovals } from "@/hooks/useApprovals";
import { LoadingState } from "@/components/ui/loading-state";
import { toast } from "sonner";

export default function Approvals() {
  const { t, i18n } = useTranslation();
  const locale = getIntlLocale(i18n.language);
  const { pendingApprovals, recentDecisions, autopilotSettings, loading, approveAction, rejectAction, updateAutopilotSettings } = useApprovals();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const { error } = await approveAction(id);
    setProcessingId(null);
    if (error) {
      toast.error(t("onboardingFlow.approvalError"));
    } else {
      toast.success(t("onboardingFlow.approved"));
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectionReason.trim()) return;
    setProcessingId(rejectingId);
    const { error } = await rejectAction(rejectingId, rejectionReason);
    setProcessingId(null);
    setRejectingId(null);
    setRejectionReason("");
    if (error) {
      toast.error(t("onboardingFlow.rejectionError"));
    } else {
      toast.success(t("onboardingFlow.rejected"));
    }
  };

  const displayPending = pendingApprovals.map(a => ({
    id: a.id,
    agent: a.agent_type,
    action: a.action_type,
    riskLevel: a.risk_level,
    createdAt: a.created_at ? new Date(a.created_at).toLocaleDateString(locale) : t("common.noData"),
    expiresIn: a.expires_at ? `${Math.ceil((new Date(a.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ${t("common.days")}` : `7 ${t("common.days")}`,
    details: a.action_data as Record<string, unknown>,
  }));

  const displayRecent = recentDecisions.map(d => ({
    id: d.id,
    agent: d.agent_type,
    action: d.action_type,
    decision: d.status === 'approved' ? 'approved' : 'rejected',
    decidedAt: d.reviewed_at ? new Date(d.reviewed_at).toLocaleDateString(locale) : t("common.noData"),
    autoApproved: d.auto_approved || false,
  }));

  const autopilotRules = [
    { name: t("approvalsPage.seoFixes"), enabled: autopilotSettings?.allowed_actions?.includes('seo_fix') || false, riskLevel: "low", actionKey: "seo_fix" },
    { name: t("approvalsPage.reviewResponses"), enabled: autopilotSettings?.allowed_actions?.includes('review_response') || false, riskLevel: "low", actionKey: "review_response" },
    { name: t("approvalsPage.contentSuggestions"), enabled: autopilotSettings?.allowed_actions?.includes('content_suggestion') || false, riskLevel: "medium", actionKey: "content_suggestion" },
    { name: t("approvalsPage.adsOptimization"), enabled: autopilotSettings?.allowed_actions?.includes('ads_optimization') || false, riskLevel: "high", actionKey: "ads_optimization" },
    { name: t("approvalsPage.socialPublish"), enabled: autopilotSettings?.allowed_actions?.includes('social_publish') || false, riskLevel: "medium", actionKey: "social_publish" },
  ];

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "low":
        return <Badge variant="secondary" className="text-chart-3 bg-chart-3/10">{t("approvalsPage.riskLow")}</Badge>;
      case "medium":
        return <Badge variant="secondary" className="text-chart-4 bg-chart-4/10">{t("approvalsPage.riskMedium")}</Badge>;
      case "high":
        return <Badge variant="secondary" className="text-chart-5 bg-chart-5/10">{t("approvalsPage.riskHigh")}</Badge>;
      case "critical":
        return <Badge variant="destructive">{t("approvalsPage.riskCritical")}</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">✓</span>
          <div>
           <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
             {t("approvalsPage.title")}
             <span className="relative w-2 h-2 bg-primary rounded-full animate-pulse" />
           </h1>
            <p className="text-muted-foreground">
              {t("approvalsPage.subtitle")}
            </p>
          </div>
        </div>
        <Badge variant="gradient" className="px-3 py-1 self-start sm:self-center">
          <Shield className="w-4 h-4 mr-1" />
          {t("approvalsPage.safeByDefault")}
        </Badge>
      </div>

      {pendingApprovals.length > 0 && (
        <Card variant="gradient">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  {t("approvalsPage.pendingActions", { count: pendingApprovals.length })}
                </span>
              </div>
              <Button variant="secondary" size="sm">
                {t("approvalsPage.viewAll")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t("approvalsPage.pendingTab")} ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            {t("approvalsPage.historyTab")}
          </TabsTrigger>
          <TabsTrigger value="autopilot" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            {t("approvalsPage.autopilotTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <LoadingState message={t("approvalsPage.loadingApprovals")} />
          ) : displayPending.length === 0 ? (
            <Card variant="feature">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500/50" />
                <h3 className="font-medium mb-2">{t("approvalsPage.noActionsPending")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("approvalsPage.noActionsDesc")}
                </p>
              </CardContent>
            </Card>
          ) : (
            displayPending.map((item) => (
              <Card key={item.id} variant="feature">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      item.riskLevel === "low" ? "bg-chart-3/10" :
                      item.riskLevel === "medium" ? "bg-chart-4/10" :
                      "bg-chart-5/10"
                    }`}>
                      <Bot className={`w-5 h-5 ${
                        item.riskLevel === "low" ? "text-chart-3" :
                        item.riskLevel === "medium" ? "text-chart-4" :
                        "text-chart-5"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.action}</span>
                        {getRiskBadge(item.riskLevel)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("approvalsPage.by")} {item.agent} • {item.createdAt} • {t("approvalsPage.expiresIn")} {item.expiresIn}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(item.details || {}).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => { setRejectingId(item.id); setRejectionReason(""); }}
                        disabled={processingId === item.id}
                      >
                        {processingId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            {t("approvalsPage.reject")}
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="hero" 
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                        disabled={processingId === item.id}
                      >
                        {processingId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            {t("approvalsPage.approve")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card variant="feature">
            <CardHeader>
              <CardTitle>{t("approvalsPage.recentDecisions")}</CardTitle>
              <CardDescription>{t("approvalsPage.historyDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayRecent.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t("approvalsPage.noDecisions")}</p>
                </div>
              ) : (
                displayRecent.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                    {item.decision === "approved" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">{item.agent}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.autoApproved && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Auto
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{item.decidedAt}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="autopilot" className="space-y-6">
          <Card variant="feature">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    {t("approvalsPage.autopilotMode")}
                  </CardTitle>
                  <CardDescription>
                    {t("approvalsPage.autopilotDesc")}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-yellow-600">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {t("approvalsPage.offByDefault")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-2 text-yellow-600 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">{t("approvalsPage.secureModeActive")}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("approvalsPage.secureModeDesc")}
                </p>
              </div>

              <div className="space-y-3 mt-6">
                {autopilotRules.map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={rule.enabled} 
                        onCheckedChange={async (checked) => {
                          const currentActions = autopilotSettings?.allowed_actions || [];
                          const newActions = checked 
                            ? [...currentActions, rule.actionKey]
                            : currentActions.filter(a => a !== rule.actionKey);
                          
                          const { error } = await updateAutopilotSettings({ 
                            allowed_actions: newActions 
                          });
                          
                          if (error) {
                            toast.error(t("approvalsPage.updateError"));
                          } else {
                            toast.success(`${rule.name} ${checked ? '✓' : '✗'}`);
                          }
                        }}
                      />
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getRiskBadge(rule.riskLevel)}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border mt-6">
                <h4 className="font-medium mb-3">{t("approvalsPage.securityLimits")}</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground">{t("approvalsPage.maxActionsWeek")}</p>
                    <p className="font-bold text-lg">{autopilotSettings?.max_actions_per_week || 10}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground">{t("approvalsPage.maxBudgetDay")}</p>
                    <p className="font-bold text-lg">
                      {autopilotSettings?.max_daily_budget && autopilotSettings.max_daily_budget > 0 
                        ? `€${autopilotSettings.max_daily_budget}` 
                        : `€0 (${t("approvalsPage.disabled")})`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog - replaces window.prompt */}
      <Dialog open={!!rejectingId} onOpenChange={(open) => { if (!open) { setRejectingId(null); setRejectionReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("approvalsV2Page.rejectAction")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("approvalsV2Page.rejectionReasonLabel")}</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t("approvalsV2Page.rejectionPlaceholder")}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRejectingId(null); setRejectionReason(""); }}>
                {t("common.cancel")}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId !== null}
              >
                {t("approvalsV2Page.confirmRejection")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
