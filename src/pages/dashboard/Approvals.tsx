import { useState } from "react";
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
    if (error) toast.error("Unable to approve this action.");
    else toast.success("Action approved.");
  };

  const handleReject = async () => {
    if (!rejectingId || !reason.trim()) return;
    setProcessingId(rejectingId);
    const { error } = await rejectAction(rejectingId, reason);
    setProcessingId(null);
    if (error) toast.error("Unable to reject this action.");
    else toast.success("Action rejected.");
    setRejectingId(null);
    setReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <Badge variant="agent" className="mb-3">Approvals</Badge>
          <h1 className="text-3xl font-bold">Review sensitive actions before execution</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            Approval gates remain central to the product story: recommendations may be fast, but high-impact actions still route through human validation, evidence and auditability.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="px-3 py-1">{pendingApprovals.length} pending</Badge>
          <Badge variant="outline" className="px-3 py-1">{recentDecisions.length} recent decisions</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Pending actions</CardTitle>
            <p className="text-3xl font-bold">{pendingApprovals.length}</p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Actions currently waiting for an explicit review.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Latest evidence bundle</CardTitle>
            <p className="text-xl font-bold">{latestEvidence?.title ?? "Not available yet"}</p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Use evidence bundles to understand the “why” before acting.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Audit trail events</CardTitle>
            <p className="text-3xl font-bold">{entries.length}</p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Traceability stays visible when decisions are approved or rejected.</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Pending queue</CardTitle>
            <CardDescription>These are the actions that require human approval before execution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading approvals…</p>
            ) : pendingApprovals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                No pending approvals right now.
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
                    <p className="text-sm text-muted-foreground">Created {item.created_at ? new Date(item.created_at).toLocaleString() : "n/a"}</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.action_data || {}).map(([key, value]) => (
                        <Badge key={key} variant="outline">{key}: {String(value)}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => { setRejectingId(item.id); setReason(""); }} disabled={processingId === item.id}>
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button onClick={() => handleApprove(item.id)} disabled={processingId === item.id}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
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
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Approval standard</CardTitle>
              <CardDescription>Use a consistent review checklist to keep governance lightweight but credible.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-xl border border-border/60 p-4">1. Confirm the signal is real and supported by connected data.</div>
              <div className="rounded-xl border border-border/60 p-4">2. Check the evidence bundle and limits of confidence.</div>
              <div className="rounded-xl border border-border/60 p-4">3. Validate owner, scope, expected impact and rollback logic.</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Recent decisions</CardTitle>
              <CardDescription>Latest reviewed actions for visibility and follow-up.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentDecisions.slice(0, 5).map((decision) => (
                <div key={decision.id} className="rounded-xl border border-border/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{decision.action_type.replace(/_/g, " ")}</p>
                    <Badge variant={decision.status === "approved" ? "success" : "destructive"}>{decision.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Reviewed {decision.reviewed_at ? new Date(decision.reviewed_at).toLocaleString() : "n/a"}</p>
                </div>
              ))}
              {recentDecisions.length === 0 && <p className="text-sm text-muted-foreground">No reviewed actions yet.</p>}
            </CardContent>
          </Card>

          <Link to="/dashboard/outcomes">
            <Button variant="outline" className="w-full">
              Review outcome tracking
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {rejectingId && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Reject action</CardTitle>
            <CardDescription>Capture the reason so the decision remains auditable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why this action is rejected or needs rework."
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject} disabled={!reason.trim() || processingId === rejectingId}>
                Confirm rejection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
