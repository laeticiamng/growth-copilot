import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Shield, Zap, Eye, Bot,
  History, Loader2, Play, FileText, Split, Download, MessageSquare,
} from "lucide-react";
import { useApprovals } from "@/hooks/useApprovals";
import { LoadingState } from "@/components/ui/loading-state";
import { PermissionGuard, RequirePermission } from "@/components/auth/PermissionGuard";
import { toast } from "sonner";

interface ApprovalPreview {
  videos: Array<{ format: string; url: string }>;
  thumbnails: Array<{ url: string; variant: number }>;
  copyPack?: {
    hooks: string[];
    headlines: string[];
    ctas: string[];
  };
  diff?: {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  };
}

export default function ApprovalsV2() {
  const { t, i18n } = useTranslation();
  const locale = getIntlLocale(i18n.language);
  const { pendingApprovals, recentDecisions, autopilotSettings, loading, approveAction, rejectAction, updateAutopilotSettings } = useApprovals();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);
  const [partialDecisions, setPartialDecisions] = useState<Record<string, Record<string, 'approved' | 'rejected' | 'pending'>>>({});
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleApprove = async (id: string, isPartial = false) => {
    setProcessingId(id);
    if (isPartial && partialDecisions[id]) { /* partial approval logic */ }
    const { error } = await approveAction(id);
    setProcessingId(null);
    if (error) {
      toast.error(t("approvalsV2Page.approvalError"));
    } else {
      toast.success(isPartial ? t("approvalsV2Page.partialApproval") : t("approvalsV2Page.actionApproved"));
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error(t("approvalsV2Page.rejectionReasonRequired"));
      return;
    }
    setProcessingId(id);
    const { error } = await rejectAction(id, rejectionReason);
    setProcessingId(null);
    setShowRejectDialog(false);
    setRejectionReason("");
    if (error) {
      toast.error(t("approvalsV2Page.rejectionError"));
    } else {
      toast.success(t("approvalsV2Page.actionRejected"));
    }
  };

  const handlePartialDecision = (approvalId: string, variantKey: string, decision: 'approved' | 'rejected') => {
    setPartialDecisions(prev => ({
      ...prev,
      [approvalId]: { ...(prev[approvalId] || {}), [variantKey]: decision }
    }));
  };

  const displayPending = pendingApprovals.map(a => {
    const actionData = a.action_data as Record<string, unknown>;
    const previewUrls = (actionData.preview_urls || {}) as ApprovalPreview;
    return {
      id: a.id, agent: a.agent_type, action: a.action_type, riskLevel: a.risk_level,
      createdAt: a.created_at ? new Date(a.created_at).toLocaleDateString(locale) : t("common.noData"),
      expiresIn: a.expires_at ? `${Math.ceil((new Date(a.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d` : '7d',
      details: actionData, preview: previewUrls,
      variantId: (actionData as Record<string, unknown>).variant_id as string | undefined,
      slaHours: (actionData as Record<string, unknown>).sla_hours as number || 24,
    };
  });

  const displayRecent = recentDecisions.map(d => ({
    id: d.id, agent: d.agent_type, action: d.action_type,
    decision: d.status === 'approved' ? 'approved' : 'rejected',
    decidedAt: d.reviewed_at ? new Date(d.reviewed_at).toLocaleDateString(locale) : t("common.noData"),
    autoApproved: d.auto_approved || false, reason: d.rejection_reason,
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
      case "low": return <Badge variant="secondary" className="text-green-600 bg-green-500/10">{t("approvalsV2Page.riskLow")}</Badge>;
      case "medium": return <Badge variant="secondary" className="text-yellow-600 bg-yellow-500/10">{t("approvalsV2Page.riskMedium")}</Badge>;
      case "high": return <Badge variant="secondary" className="text-orange-600 bg-orange-500/10">{t("approvalsV2Page.riskHigh")}</Badge>;
      case "critical": return <Badge variant="destructive">{t("approvalsV2Page.riskCritical")}</Badge>;
      default: return <Badge variant="outline">{level}</Badge>;
    }
  };

  const renderPreviewPanel = (item: typeof displayPending[0]) => {
    if (!item.preview) return null;
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            {t("approvalsV2Page.preview")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{t("approvalsV2Page.previewTitle", { action: item.action })}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh]">
            <div className="space-y-6 pr-4">
              {/* Videos */}
              {item.preview.videos && item.preview.videos.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    {t("approvalsV2Page.videos")} ({item.preview.videos.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {item.preview.videos.map((video, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
                          <video src={video.url} controls className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{video.format}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-500" onClick={() => handlePartialDecision(item.id, `video_${idx}`, 'approved')}>
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => handlePartialDecision(item.id, `video_${idx}`, 'rejected')}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {partialDecisions[item.id]?.[`video_${idx}`] && (
                          <Badge variant={partialDecisions[item.id][`video_${idx}`] === 'approved' ? 'secondary' : 'destructive'}>
                            {partialDecisions[item.id][`video_${idx}`] === 'approved' ? t("approvalsV2Page.approved") : t("approvalsV2Page.rejected")}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Thumbnails */}
              {item.preview.thumbnails && item.preview.thumbnails.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">{t("approvalsV2Page.thumbnails")} ({item.preview.thumbnails.length})</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {item.preview.thumbnails.map((thumb, idx) => (
                      <div key={idx} className="space-y-1">
                        <img src={thumb.url} alt={`Thumbnail ${idx + 1}`} className="w-full aspect-video object-cover rounded-lg" />
                        <span className="text-xs text-muted-foreground">{t("approvalsV2Page.variant")} {thumb.variant}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Copy Pack */}
              {item.preview.copyPack && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Copy Pack</h4>
                  <div className="space-y-4">
                    {item.preview.copyPack.hooks && (<div><span className="text-sm font-medium text-muted-foreground">Hooks:</span><div className="flex flex-wrap gap-2 mt-1">{item.preview.copyPack.hooks.map((hook, idx) => (<Badge key={idx} variant="outline">{hook}</Badge>))}</div></div>)}
                    {item.preview.copyPack.headlines && (<div><span className="text-sm font-medium text-muted-foreground">Headlines:</span><div className="flex flex-wrap gap-2 mt-1">{item.preview.copyPack.headlines.map((h, idx) => (<Badge key={idx} variant="secondary">{h}</Badge>))}</div></div>)}
                    {item.preview.copyPack.ctas && (<div><span className="text-sm font-medium text-muted-foreground">CTAs:</span><div className="flex flex-wrap gap-2 mt-1">{item.preview.copyPack.ctas.map((cta, idx) => (<Badge key={idx} variant="gradient">{cta}</Badge>))}</div></div>)}
                  </div>
                </div>
              )}
              {/* Diff */}
              {item.preview.diff && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2"><Split className="w-4 h-4" /> {t("approvalsV2Page.proposedChanges")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <span className="text-xs font-medium text-red-500">{t("approvalsV2Page.before")}</span>
                      <pre className="mt-2 text-xs overflow-x-auto">{JSON.stringify(item.preview.diff.before, null, 2)}</pre>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <span className="text-xs font-medium text-green-500">{t("approvalsV2Page.after")}</span>
                      <pre className="mt-2 text-xs overflow-x-auto">{JSON.stringify(item.preview.diff.after, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}
              {/* QCO Issues */}
              {item.details.qco_issues && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-orange-500"><AlertTriangle className="w-4 h-4" /> {t("approvalsV2Page.detectedRisks")}</h4>
                  <div className="space-y-2">{(item.details.qco_issues as string[]).map((issue, idx) => (<div key={idx} className="p-2 rounded bg-orange-500/10 text-sm">{issue}</div>))}</div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />{t("approvalsV2Page.exportBtn")}</Button>
            <Button variant="outline" size="sm" className="text-orange-500"><MessageSquare className="w-4 h-4 mr-1" />{t("approvalsV2Page.requestChanges")}</Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setShowRejectDialog(true)}><XCircle className="w-4 h-4 mr-1" />{t("approvalsV2Page.reject")}</Button>
            <Button variant="hero" size="sm" onClick={() => handleApprove(item.id, Object.keys(partialDecisions[item.id] || {}).length > 0)}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {Object.keys(partialDecisions[item.id] || {}).length > 0 ? t("approvalsV2Page.partialApprovalBtn") : t("approvalsV2Page.approveAll")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <PermissionGuard permission="approve_actions">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t("approvalsV2Page.title")}</h1>
            <p className="text-muted-foreground">{t("approvalsV2Page.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="gradient" className="px-3 py-1"><Shield className="w-4 h-4 mr-1" />{t("approvalsV2Page.enterprise")}</Badge>
          </div>
        </div>

        {pendingApprovals.length > 0 && (
          <Card variant="gradient">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{t("approvalsV2Page.pendingActions", { count: pendingApprovals.length })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2"><Clock className="w-4 h-4" />{t("approvalsV2Page.pendingTab")} ({pendingApprovals.length})</TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2"><History className="w-4 h-4" />{t("approvalsV2Page.historyTab")}</TabsTrigger>
            <TabsTrigger value="autopilot" className="flex items-center gap-2"><Bot className="w-4 h-4" />{t("approvalsV2Page.autopilotTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <LoadingState message={t("approvalsV2Page.loadingApprovals")} />
            ) : displayPending.length === 0 ? (
              <Card variant="feature">
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500/50" />
                  <h3 className="font-medium mb-2">{t("approvalsV2Page.noActionsPending")}</h3>
                  <p className="text-sm text-muted-foreground">{t("approvalsV2Page.allProcessed")}</p>
                </CardContent>
              </Card>
            ) : (
              displayPending.map((item) => (
                <Card key={item.id} variant="feature">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${item.riskLevel === "low" ? "bg-green-500/10" : item.riskLevel === "medium" ? "bg-yellow-500/10" : "bg-orange-500/10"}`}>
                        <Bot className={`w-5 h-5 ${item.riskLevel === "low" ? "text-green-500" : item.riskLevel === "medium" ? "text-yellow-500" : "text-orange-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.action}</span>
                          {getRiskBadge(item.riskLevel)}
                          {item.variantId && <Badge variant="outline" className="text-xs">{t("approvalsV2Page.variant")} A/B</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t("approvalsV2Page.by")} {item.agent} • {item.createdAt} • {t("approvalsV2Page.expiresIn")} {item.expiresIn} • {t("approvalsV2Page.sla")}: {item.slaHours}h
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(item.details || {}).slice(0, 3).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">{key}: {String(value).substring(0, 20)}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderPreviewPanel(item)}
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setSelectedApproval(item.id); setShowRejectDialog(true); }} disabled={processingId === item.id}>
                          <XCircle className="w-4 h-4 mr-1" />{t("approvalsV2Page.reject")}
                        </Button>
                        <Button variant="hero" size="sm" onClick={() => handleApprove(item.id)} disabled={processingId === item.id}>
                          {processingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" />{t("approvalsV2Page.approve")}</>}
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
                <CardTitle>{t("approvalsV2Page.recentDecisions")}</CardTitle>
                <CardDescription>{t("approvalsV2Page.historyDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayRecent.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t("approvalsV2Page.noDecisions")}</p>
                  </div>
                ) : (
                  displayRecent.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                      {item.decision === "approved" ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-muted-foreground">{item.agent}</p>
                        {item.reason && <p className="text-xs text-orange-500 mt-1">{t("approvalsV2Page.reason")}: {item.reason}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.autoApproved && <Badge variant="secondary" className="text-xs"><Zap className="w-3 h-3 mr-1" /> Auto</Badge>}
                        <span className="text-xs text-muted-foreground">{item.decidedAt}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="autopilot" className="space-y-6">
            <RequirePermission permission="manage_policies">
              <Card variant="feature">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5" />{t("approvalsV2Page.autopilotMode")}</CardTitle>
                      <CardDescription>{t("approvalsV2Page.autopilotDesc")}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-yellow-600"><AlertTriangle className="w-3 h-3 mr-1" />{t("approvalsV2Page.offByDefault")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-center gap-2 text-yellow-600 mb-2"><AlertTriangle className="w-5 h-5" /><span className="font-medium">{t("approvalsV2Page.policiesV2")}</span></div>
                    <p className="text-sm text-muted-foreground">{t("approvalsV2Page.policiesDesc")}</p>
                  </div>
                  <div className="space-y-3 mt-6">
                    {autopilotRules.map((rule, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={async (checked) => {
                              const currentActions = autopilotSettings?.allowed_actions || [];
                              const newActions = checked ? [...currentActions, rule.actionKey] : currentActions.filter(a => a !== rule.actionKey);
                              const { error } = await updateAutopilotSettings({ allowed_actions: newActions });
                              if (error) { toast.error(t("approvalsV2Page.updateError")); } else { toast.success(`${rule.name} ${checked ? '✓' : '✗'}`); }
                            }}
                            disabled={rule.riskLevel === 'high'}
                          />
                          <div>
                            <p className="font-medium">{rule.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getRiskBadge(rule.riskLevel)}
                              {rule.riskLevel === 'high' && <span className="text-xs text-muted-foreground">{t("approvalsV2Page.policyApprovalRequired")}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-border mt-6">
                    <h4 className="font-medium mb-3">{t("approvalsV2Page.securityLimits")}</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <p className="text-sm text-muted-foreground">{t("approvalsV2Page.maxActionsWeek")}</p>
                        <p className="font-bold text-lg">{autopilotSettings?.max_actions_per_week || 10}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <p className="text-sm text-muted-foreground">{t("approvalsV2Page.maxBudgetDay")}</p>
                        <p className="font-bold text-lg">
                          {autopilotSettings?.max_daily_budget && autopilotSettings.max_daily_budget > 0 ? `€${autopilotSettings.max_daily_budget}` : `€0 (${t("approvalsV2Page.disabled")})`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RequirePermission>
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("approvalsV2Page.rejectAction")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("approvalsV2Page.rejectionReasonLabel")}</label>
                <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder={t("approvalsV2Page.rejectionPlaceholder")} className="mt-1" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>{t("common.cancel")}</Button>
                <Button variant="destructive" onClick={() => selectedApproval && handleReject(selectedApproval)} disabled={!rejectionReason.trim() || processingId !== null}>{t("approvalsV2Page.confirmRejection")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
