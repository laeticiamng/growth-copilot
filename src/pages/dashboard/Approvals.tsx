import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2, Clock, FileText, Shield, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApprovals } from "@/hooks/useApprovals";
import { useEvidenceBundles } from "@/hooks/useEvidenceBundles";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";

export default function Approvals() {
  const { t } = useTranslation();
  const { pendingApprovals, recentDecisions, loading, approveAction, rejectAction } = useApprovals();
  const { bundles } = useEvidenceBundles();
  const { entries } = useAuditLog();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const latestEvidence = bundles[0];

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const { error } = await approveAction(id);
    setProcessingId(null);
    if (error) toast.error(t("approvalsPage.approveError"));
    else toast.success(t("approvalsPage.approveSuccess"));
  };

  const handleReject = async () => {
    if (!rejectingId || !reason.trim()) return;
    setProcessingId(rejectingId);
    const { error } = await rejectAction(rejectingId, reason);
    setProcessingId(null);
    if (error) toast.error(t("approvalsPage.rejectError"));
    else toast.success(t("approvalsPage.rejectSuccess"));
    setRejectingId(null);
    setReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <Badge variant="agent" className="mb-3">{t("approvalsPage.badge")}</Badge>
          <h1 className="text-3xl font-bold">{t("approvalsPage.pageTitle")}</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            {t("approvalsPage.pageSubtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="px-3 py-1">{pendingApprovals.length} {t("approvalsPage.pending")}</Badge>
          <Badge variant="outline" className="px-3 py-1">{recentDecisions.length} {t("approvalsPage.recentDecisionsBadge")}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">{t("approvalsPage.pendingActionsCard")}</CardTitle>
            <p className="text-3xl font-bold">{pendingApprovals.length}</p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t("approvalsPage.pendingActionsDesc")}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">{t("approvalsPage.latestEvidenceBundle")}</CardTitle>
            <p className="text-xl font-bold">{latestEvidence?.title ?? t("approvalsPage.notAvailableYet")}</p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t("approvalsPage.evidenceDesc")}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">{t("approvalsPage.auditTrailEvents")}</CardTitle>
            <p className="text-3xl font-bold">{entries.length}</p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t("approvalsPage.auditTrailDesc")}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> {t("approvalsPage.pendingQueue")}</CardTitle>
            <CardDescription>{t("approvalsPage.pendingQueueDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">{t("approvalsPage.loadingApprovals")}</p>
            ) : pendingApprovals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                {t("approvalsPage.noPending")}
              </div>
            ) : pendingApprovals.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border/60 p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{item.action_type.replace(/_/g, " ")}</p>
                      <Badge variant="outline">{item.risk_level}</Badge>
                      <Badge variant="secondary">{item.agent_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("approvalsPage.created")} {item.created_at ? new Date(item.created_at).toLocaleString() : "n/a"}</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.action_data || {}).map(([key, value]) => (
                        <Badge key={key} variant="outline">{key}: {String(value)}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => { setRejectingId(item.id); setReason(""); }} disabled={processingId === item.id}>
                      <XCircle className="w-4 h-4 mr-2" /> {t("approvalsPage.reject")}
                    </Button>
                    <Button onClick={() => handleApprove(item.id)} disabled={processingId === item.id}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> {t("approvalsPage.approve")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> {t("approvalsPage.approvalStandard")}</CardTitle>
              <CardDescription>{t("approvalsPage.approvalStandardDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-xl border border-border/60 p-4">{t("approvalsPage.checklistStep1")}</div>
              <div className="rounded-xl border border-border/60 p-4">{t("approvalsPage.checklistStep2")}</div>
              <div className="rounded-xl border border-border/60 p-4">{t("approvalsPage.checklistStep3")}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> {t("approvalsPage.recentDecisionsTitle")}</CardTitle>
              <CardDescription>{t("approvalsPage.recentDecisionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentDecisions.slice(0, 5).map((decision) => (
                <div key={decision.id} className="rounded-xl border border-border/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{decision.action_type.replace(/_/g, " ")}</p>
                    <Badge variant={decision.status === "approved" ? "success" : "destructive"}>{decision.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{t("approvalsPage.reviewed")} {decision.reviewed_at ? new Date(decision.reviewed_at).toLocaleString() : "n/a"}</p>
                </div>
              ))}
              {recentDecisions.length === 0 && <p className="text-sm text-muted-foreground">{t("approvalsPage.noReviewedActions")}</p>}
            </CardContent>
          </Card>

          <Link to="/dashboard/outcomes">
            <Button variant="outline" className="w-full">
              {t("approvalsPage.reviewOutcomeTracking")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {rejectingId && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>{t("approvalsPage.rejectAction")}</CardTitle>
            <CardDescription>{t("approvalsPage.rejectActionDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("approvalsPage.rejectReason")}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRejectingId(null)}>{t("approvalsPage.cancel")}</Button>
              <Button variant="destructive" onClick={handleReject} disabled={!reason.trim() || processingId === rejectingId}>
                {t("approvalsPage.confirmRejection")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
