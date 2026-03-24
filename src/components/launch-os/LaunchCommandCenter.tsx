import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Rocket, CheckCircle2, Clock, AlertTriangle, XCircle,
  Activity, Shield, Eye, BarChart3, Users, Zap,
  FileCheck, Video, Megaphone, Target, ArrowRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  LAUNCH_PIPELINE,
  getStageProgress,
  LAUNCH_AGENTS,
  APPROVAL_POLICIES,
  computeApprovalSummary,
  computeOutputQualityMetrics,
  type LaunchStage,
  type EvidenceLevel,
  type ApprovalCheckpoint,
  type LaunchStageResult,
} from '@/lib/launch-os';

// ─── Evidence Level Badge ────────────────────────────────────────────────────

function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const config = {
    VERIFIED: { color: 'bg-green-500/10 text-green-700 border-green-200', label: 'Verified' },
    DERIVED: { color: 'bg-orange-500/10 text-orange-700 border-orange-200', label: 'Derived' },
    TEMPLATE: { color: 'bg-red-500/10 text-red-700 border-red-200', label: 'Template' },
  };
  const c = config[level];
  return <Badge variant="outline" className={c.color}>{c.label}</Badge>;
}

// ─── Stage Status Icon ───────────────────────────────────────────────────────

function StageStatusIcon({ status }: { status: 'completed' | 'current' | 'pending' | 'blocked' }) {
  switch (status) {
    case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'current': return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
    case 'blocked': return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface LaunchCommandCenterProps {
  projectId?: string;
  currentStage?: LaunchStage;
  completedStages?: LaunchStage[];
  stageResults?: LaunchStageResult[];
  approvalCheckpoints?: ApprovalCheckpoint[];
  overallEvidenceLevel?: EvidenceLevel;
  onStageClick?: (stage: LaunchStage) => void;
}

export function LaunchCommandCenter({
  currentStage = 'intake',
  completedStages = [],
  stageResults = [],
  approvalCheckpoints = [],
  overallEvidenceLevel = 'TEMPLATE',
  onStageClick,
}: LaunchCommandCenterProps) {
  const { t } = useTranslation();
  const progress = getStageProgress(completedStages);
  const approvalSummary = computeApprovalSummary(approvalCheckpoints);
  const outputQuality = computeOutputQualityMetrics(stageResults);

  // ─── Stage Timeline ──────────────────────────────────────────────────────

  const getStageStatus = (stage: LaunchStage): 'completed' | 'current' | 'pending' | 'blocked' => {
    if (completedStages.includes(stage)) return 'completed';
    if (stage === currentStage) return 'current';
    const checkpoint = approvalCheckpoints.find(
      c => c.status === 'pending' && LAUNCH_PIPELINE.find(s => s.stage === stage)?.approval_checkpoint === c.checkpoint_type
    );
    if (checkpoint) return 'blocked';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6" />
            Launch Command Center
          </h2>
          <p className="text-muted-foreground mt-1">
            Orchestration end-to-end du lancement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EvidenceBadge level={overallEvidenceLevel} />
          <Badge variant="outline" className="text-sm">
            {progress}% complete
          </Badge>
        </div>
      </div>

      {/* ─── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{progress}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
            <Progress value={progress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Approvals Pending</p>
                <p className="text-2xl font-bold">{approvalSummary.pending}</p>
              </div>
              <Shield className={`h-8 w-8 opacity-50 ${approvalSummary.blocking_count > 0 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
            {approvalSummary.blocking_count > 0 && (
              <p className="text-xs text-red-600 mt-1">{approvalSummary.blocking_count} blocking</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Output Quality</p>
                <p className="text-2xl font-bold">{outputQuality.quality_score}</p>
              </div>
              <Eye className={`h-8 w-8 opacity-50 ${outputQuality.quality_score >= 60 ? 'text-green-500' : outputQuality.quality_score >= 30 ? 'text-orange-500' : 'text-red-500'}`} />
            </div>
            <div className="flex gap-1 mt-1">
              <span className="text-xs text-green-600">{outputQuality.verified_count}V</span>
              <span className="text-xs text-orange-600">{outputQuality.derived_count}D</span>
              <span className="text-xs text-red-600">{outputQuality.template_count}T</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Agents Active</p>
                <p className="text-2xl font-bold">{LAUNCH_AGENTS.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {LAUNCH_AGENTS.filter(a => a.human_approval_required).length} requiring approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Stage Timeline ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Launch Timeline</CardTitle>
          <CardDescription>14 stages de l'intake au rapport final</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {LAUNCH_PIPELINE.map((stage, index) => {
              const status = getStageStatus(stage.stage);
              const stageResult = stageResults.find(r => r.stage === stage.stage);

              return (
                <div
                  key={stage.stage}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    status === 'current' ? 'bg-blue-50 dark:bg-blue-950/30' :
                    status === 'blocked' ? 'bg-red-50 dark:bg-red-950/30' :
                    status === 'completed' ? 'bg-green-50/50 dark:bg-green-950/20' :
                    'hover:bg-muted/50'
                  }`}
                  onClick={() => onStageClick?.(stage.stage)}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-mono">
                    {stage.order}
                  </div>
                  <StageStatusIcon status={status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{stage.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{stage.description.slice(0, 80)}...</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {stageResult && (
                      <EvidenceBadge level={stageResult.evidence_level} />
                    )}
                    {stage.approval_checkpoint && (
                      <Shield className="h-3.5 w-3.5 text-amber-500" />
                    )}
                    {stage.can_skip && (
                      <Badge variant="outline" className="text-[10px]">skip</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Bottom Grid: Approvals + Connectors + Next Actions ──────────── */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Approval Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Approval Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Approved</span>
              <span className="text-green-600 font-medium">{approvalSummary.approved}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pending</span>
              <span className={`font-medium ${approvalSummary.pending > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>{approvalSummary.pending}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rejected</span>
              <span className={`font-medium ${approvalSummary.rejected > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{approvalSummary.rejected}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expired</span>
              <span className={`font-medium ${approvalSummary.expired > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{approvalSummary.expired}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Blocking</span>
              <span className={`font-bold ${approvalSummary.blocking_count > 0 ? 'text-red-600' : 'text-green-600'}`}>{approvalSummary.blocking_count}</span>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Confidence */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Evidence Confidence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600">Verified</span>
                <span>{outputQuality.verified_count}/{outputQuality.total_outputs}</span>
              </div>
              <Progress value={outputQuality.verified_ratio * 100} className="h-1.5 [&>div]:bg-green-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-orange-600">Derived</span>
                <span>{outputQuality.derived_count}/{outputQuality.total_outputs}</span>
              </div>
              <Progress value={(outputQuality.derived_count / Math.max(outputQuality.total_outputs, 1)) * 100} className="h-1.5 [&>div]:bg-orange-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-600">Template</span>
                <span>{outputQuality.template_count}/{outputQuality.total_outputs}</span>
              </div>
              <Progress value={outputQuality.template_ratio * 100} className="h-1.5 [&>div]:bg-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* Critical Blockers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Blockers & Next Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvalSummary.blocking_count === 0 && outputQuality.template_ratio < 0.5 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-green-600 font-medium">No critical blockers</p>
              </div>
            ) : (
              <div className="space-y-2">
                {approvalSummary.blocking_count > 0 && (
                  <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-red-700">{approvalSummary.blocking_count} approval(s) blocking</p>
                      <p className="text-xs text-red-600">Review and approve to continue</p>
                    </div>
                  </div>
                )}
                {outputQuality.template_ratio >= 0.5 && (
                  <div className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-orange-700">High TEMPLATE ratio ({Math.round(outputQuality.template_ratio * 100)}%)</p>
                      <p className="text-xs text-orange-600">Connect data sources for verified outputs</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
