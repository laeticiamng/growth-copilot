import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useToast } from './use-toast';
import type {
  LaunchProject,
  LaunchType,
  LaunchStatus,
  LaunchConfig,
  ReadinessScore,
  CreativeVariant,
  VideoConcept,
  DistributionRun,
  SignalEvent,
  DecisionRule,
  DecisionActionLog,
  CampaignMemory,
} from '@/lib/launch-os/types';
import type {
  LaunchStage,
  EvidenceLevel,
  ApprovalCheckpoint,
  LaunchRun,
  LaunchInsight,
} from '@/lib/launch-os/launch-entities';
import {
  LAUNCH_PIPELINE,
  getNextStage,
  getStageProgress,
  validateStageInputs,
} from '@/lib/launch-os/orchestration-pipeline';
import {
  createCheckpoint as createApprovalCheckpoint,
  getApprovalPoliciesForStage,
} from '@/lib/launch-os/approval-governance';

// ─── Context Types ──────────────────────────────────────────────────────────

interface LaunchOSContextType {
  // Projects
  projects: LaunchProject[];
  currentProject: LaunchProject | null;
  setCurrentProject: (project: LaunchProject | null) => void;
  createProject: (name: string, launchType: LaunchType, inputUrl?: string) => Promise<LaunchProject | null>;
  updateProject: (id: string, updates: Partial<LaunchProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Readiness
  readinessScores: ReadinessScore[];
  scoreReadiness: (projectId: string) => Promise<ReadinessScore | null>;

  // Creatives
  creativeVariants: CreativeVariant[];
  generateCreatives: (projectId: string, formats: string[]) => Promise<void>;

  // Video Concepts
  videoConcepts: VideoConcept[];
  generateVideoConcepts: (projectId: string) => Promise<void>;

  // Distribution
  distributionRuns: DistributionRun[];

  // Signals
  signalEvents: SignalEvent[];

  // Decisions
  decisionRules: DecisionRule[];
  decisionActions: DecisionActionLog[];
  evaluateDecisions: (projectId: string) => Promise<void>;
  approveAction: (actionId: string) => Promise<void>;
  rejectAction: (actionId: string) => Promise<void>;

  // Campaign Memory
  campaignMemories: CampaignMemory[];

  // ─── Launch OS Hardening ─────────────────────────────────────────────────

  // Pipeline orchestration
  currentStage: LaunchStage;
  completedStages: LaunchStage[];
  stageProgress: number;
  advanceStage: (projectId: string) => Promise<void>;

  // Approval checkpoints
  approvalCheckpoints: ApprovalCheckpoint[];
  submitForApproval: (projectId: string, entityId: string, entityType: string, checkpointType: string) => Promise<void>;
  approveCheckpoint: (checkpointId: string) => Promise<void>;
  rejectCheckpoint: (checkpointId: string, reason: string) => Promise<void>;

  // Launch runs
  launchRuns: LaunchRun[];
  startLaunchRun: (projectId: string) => Promise<void>;

  // Insights
  launchInsights: LaunchInsight[];

  // State
  loading: boolean;
  refetch: () => void;
}

const LaunchOSContext = createContext<LaunchOSContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────────────

export function LaunchOSProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();

  const [projects, setProjects] = useState<LaunchProject[]>([]);
  const [currentProject, setCurrentProject] = useState<LaunchProject | null>(null);
  const [readinessScores, setReadinessScores] = useState<ReadinessScore[]>([]);
  const [creativeVariants, setCreativeVariants] = useState<CreativeVariant[]>([]);
  const [videoConcepts, setVideoConcepts] = useState<VideoConcept[]>([]);
  const [distributionRuns, setDistributionRuns] = useState<DistributionRun[]>([]);
  const [signalEvents, setSignalEvents] = useState<SignalEvent[]>([]);
  const [decisionRules, setDecisionRules] = useState<DecisionRule[]>([]);
  const [decisionActions, setDecisionActions] = useState<DecisionActionLog[]>([]);
  const [campaignMemories, setCampaignMemories] = useState<CampaignMemory[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Launch OS Hardening State ────────────────────────────────────────────
  const [currentStage, setCurrentStage] = useState<LaunchStage>('intake');
  const [completedStages, setCompletedStages] = useState<LaunchStage[]>([]);
  const [approvalCheckpoints, setApprovalCheckpoints] = useState<ApprovalCheckpoint[]>([]);
  const [launchRuns, setLaunchRuns] = useState<LaunchRun[]>([]);
  const [launchInsights, setLaunchInsights] = useState<LaunchInsight[]>([]);
  const stageProgress = getStageProgress(completedStages);

  // ─── Fetch Projects ───────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    if (!currentWorkspace) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('launch_projects')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProjects(data as unknown as LaunchProject[]);
      }

      // Fetch decision rules
      const { data: rules } = await supabase
        .from('launch_decision_rules')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);
      if (rules) setDecisionRules(rules as unknown as DecisionRule[]);

      // Fetch campaign memories
      const { data: memories } = await supabase
        .from('launch_campaign_memories')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });
      if (memories) setCampaignMemories(memories as unknown as CampaignMemory[]);
    } catch (err) {
      console.warn('[useLaunchOS] Fetch error:', err);
    }
    setLoading(false);
  }, [currentWorkspace]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Fetch Project Details ────────────────────────────────────────────────

  useEffect(() => {
    if (!currentProject) {
      setReadinessScores([]);
      setCreativeVariants([]);
      setVideoConcepts([]);
      setDistributionRuns([]);
      setSignalEvents([]);
      setDecisionActions([]);
      setApprovalCheckpoints([]);
      setLaunchRuns([]);
      setLaunchInsights([]);
      setCurrentStage('intake');
      setCompletedStages([]);
      return;
    }

    const fetchProjectDetails = async () => {
      const projectId = currentProject.id;

      const [scoresRes, creativesRes, videosRes, distRes, signalsRes, actionsRes, checkpointsRes, runsRes, insightsRes] = await Promise.all([
        supabase.from('launch_readiness_scores').select('*').eq('launch_project_id', projectId).order('scored_at', { ascending: false }),
        supabase.from('launch_creative_variants').select('*').eq('launch_project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('launch_video_concepts').select('*').eq('launch_project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('launch_distribution_runs').select('*').eq('launch_project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('launch_signal_events').select('*').eq('launch_project_id', projectId).order('created_at', { ascending: false }).limit(500),
        supabase.from('launch_decision_actions').select('*').eq('launch_project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('launch_approval_checkpoints' as any).select('*').eq('launch_project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('launch_runs' as any).select('*').eq('launch_project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('launch_insights' as any).select('*').eq('launch_project_id', projectId).order('created_at', { ascending: false }).limit(50),
      ]);

      if (scoresRes.data) setReadinessScores(scoresRes.data as unknown as ReadinessScore[]);
      if (creativesRes.data) setCreativeVariants(creativesRes.data as unknown as CreativeVariant[]);
      if (videosRes.data) setVideoConcepts(videosRes.data as unknown as VideoConcept[]);
      if (distRes.data) setDistributionRuns(distRes.data as unknown as DistributionRun[]);
      if (signalsRes.data) setSignalEvents(signalsRes.data as unknown as SignalEvent[]);
      if (actionsRes.data) setDecisionActions(actionsRes.data as unknown as DecisionActionLog[]);
      if (checkpointsRes.data) setApprovalCheckpoints(checkpointsRes.data as unknown as ApprovalCheckpoint[]);
      if (runsRes.data) setLaunchRuns(runsRes.data as unknown as LaunchRun[]);
      if (insightsRes.data) setLaunchInsights(insightsRes.data as unknown as LaunchInsight[]);

      // Sync current stage from project data
      const projectStage = (currentProject as any).current_stage as LaunchStage | undefined;
      if (projectStage) setCurrentStage(projectStage);
    };

    fetchProjectDetails();
  }, [currentProject]);

  // ─── CRUD Operations ──────────────────────────────────────────────────────

  const createProject = async (
    name: string,
    launchType: LaunchType,
    inputUrl?: string
  ): Promise<LaunchProject | null> => {
    if (!currentWorkspace) return null;

    const { data, error } = await supabase
      .from('launch_projects')
      .insert({
        workspace_id: currentWorkspace.id,
        name,
        launch_type: launchType,
        input_url: inputUrl || null,
        status: 'draft',
      } as Record<string, unknown>)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to create launch project', variant: 'destructive' });
      return null;
    }

    const project = data as unknown as LaunchProject;
    setProjects(prev => [project, ...prev]);
    toast({ title: 'Launch Project Created', description: `"${name}" is ready to configure` });
    return project;
  };

  const updateProject = async (id: string, updates: Partial<LaunchProject>) => {
    const { error } = await supabase
      .from('launch_projects')
      .update(updates as Record<string, unknown>)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update project', variant: 'destructive' });
    } else {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      if (currentProject?.id === id) {
        setCurrentProject({ ...currentProject, ...updates } as LaunchProject);
      }
    }
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('launch_projects').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    } else {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProject?.id === id) setCurrentProject(null);
      toast({ title: 'Deleted', description: 'Launch project removed' });
    }
  };

  // ─── AI-Powered Actions ───────────────────────────────────────────────────

  const scoreReadiness = async (projectId: string): Promise<ReadinessScore | null> => {
    if (!currentWorkspace) return null;

    try {
      const response = await supabase.functions.invoke('launch-readiness-score', {
        body: { launch_project_id: projectId, workspace_id: currentWorkspace.id },
      });

      if (response.error) throw new Error(response.error.message);

      const score = response.data?.score as ReadinessScore;
      if (score) {
        setReadinessScores(prev => [score, ...prev]);
        // Update project with latest score
        await updateProject(projectId, {
          readiness_score: score.overall_score,
          readiness_status: score.status,
          status: 'readiness_check',
        });
      }
      toast({ title: 'Readiness Scored', description: `Score: ${score?.overall_score}/100` });
      return score;
    } catch {
      toast({ title: 'Error', description: 'Failed to score readiness', variant: 'destructive' });
      return null;
    }
  };

  const generateCreatives = async (projectId: string, formats: string[]) => {
    if (!currentWorkspace) return;

    try {
      const response = await supabase.functions.invoke('creative-factory', {
        body: { launch_project_id: projectId, workspace_id: currentWorkspace.id, formats },
      });

      if (response.error) throw new Error(response.error.message);

      const newVariants = response.data?.variants as CreativeVariant[] || [];
      setCreativeVariants(prev => [...newVariants, ...prev]);
      toast({ title: 'Creatives Generated', description: `${newVariants.length} variants created` });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate creatives', variant: 'destructive' });
    }
  };

  const generateVideoConcepts = async (projectId: string) => {
    if (!currentWorkspace) return;

    try {
      const response = await supabase.functions.invoke('video-concept-factory', {
        body: { launch_project_id: projectId, workspace_id: currentWorkspace.id },
      });

      if (response.error) throw new Error(response.error.message);

      const newConcepts = response.data?.concepts as VideoConcept[] || [];
      setVideoConcepts(prev => [...newConcepts, ...prev]);
      toast({ title: 'Video Concepts Generated', description: `${newConcepts.length} concepts created` });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate video concepts', variant: 'destructive' });
    }
  };

  const evaluateDecisions = async (projectId: string) => {
    if (!currentWorkspace) return;

    try {
      const response = await supabase.functions.invoke('decision-engine', {
        body: { launch_project_id: projectId, workspace_id: currentWorkspace.id },
      });

      if (response.error) throw new Error(response.error.message);

      const newActions = response.data?.actions as DecisionActionLog[] || [];
      setDecisionActions(prev => [...newActions, ...prev]);
      if (newActions.length > 0) {
        toast({ title: 'Decisions Evaluated', description: `${newActions.length} recommendations` });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to evaluate decisions', variant: 'destructive' });
    }
  };

  const approveAction = async (actionId: string) => {
    const { error } = await supabase
      .from('launch_decision_actions')
      .update({ status: 'approved', approved_by: (await supabase.auth.getUser()).data.user?.id })
      .eq('id', actionId);

    if (!error) {
      setDecisionActions(prev => prev.map(a => a.id === actionId ? { ...a, status: 'approved' as const } : a));
      toast({ title: 'Action Approved' });
    }
  };

  const rejectAction = async (actionId: string) => {
    const { error } = await supabase
      .from('launch_decision_actions')
      .update({ status: 'rejected' })
      .eq('id', actionId);

    if (!error) {
      setDecisionActions(prev => prev.map(a => a.id === actionId ? { ...a, status: 'rejected' as const } : a));
      toast({ title: 'Action Rejected' });
    }
  };

  // ─── Launch OS Hardening Functions ────────────────────────────────────────

  const advanceStage = async (projectId: string) => {
    const next = getNextStage(currentStage);
    if (!next) {
      toast({ title: 'Lancement termine', description: 'Toutes les etapes sont completees' });
      return;
    }

    // Check if approval is needed before advancing
    const policies = getApprovalPoliciesForStage(currentStage);
    const pendingApprovals = approvalCheckpoints.filter(
      c => c.status === 'pending' && policies.some(p => p.checkpoint_type === c.checkpoint_type)
    );
    if (pendingApprovals.length > 0) {
      toast({ title: 'Approbation requise', description: 'Des approbations sont en attente pour cette etape', variant: 'destructive' });
      return;
    }

    setCompletedStages(prev => [...prev, currentStage]);
    setCurrentStage(next);
    await updateProject(projectId, { current_stage: next } as any);
    toast({ title: 'Etape avancee', description: `Passage a: ${next.replace(/_/g, ' ')}` });
  };

  const submitForApproval = async (projectId: string, entityId: string, entityType: string, checkpointType: string) => {
    try {
      const checkpoint = createApprovalCheckpoint(projectId, entityId, entityType, checkpointType as any);
      const { data, error } = await supabase
        .from('launch_approval_checkpoints' as any)
        .insert(checkpoint as any)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setApprovalCheckpoints(prev => [data as unknown as ApprovalCheckpoint, ...prev]);
        toast({ title: 'Soumis pour approbation', description: `${entityType} en attente de validation` });
      }
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de soumettre pour approbation', variant: 'destructive' });
    }
  };

  const approveCheckpoint = async (checkpointId: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { error } = await supabase
      .from('launch_approval_checkpoints' as any)
      .update({ status: 'approved', approved_by: userId, approved_at: new Date().toISOString() } as any)
      .eq('id', checkpointId);

    if (!error) {
      setApprovalCheckpoints(prev => prev.map(c =>
        c.id === checkpointId ? { ...c, status: 'approved' as const, approved_by: userId || null, approved_at: new Date().toISOString() } : c
      ));
      toast({ title: 'Approuve' });
    }
  };

  const rejectCheckpoint = async (checkpointId: string, reason: string) => {
    const { error } = await supabase
      .from('launch_approval_checkpoints' as any)
      .update({ status: 'rejected', rejection_reason: reason } as any)
      .eq('id', checkpointId);

    if (!error) {
      setApprovalCheckpoints(prev => prev.map(c =>
        c.id === checkpointId ? { ...c, status: 'rejected' as const, rejection_reason: reason } : c
      ));
      toast({ title: 'Rejete' });
    }
  };

  const startLaunchRun = async (projectId: string) => {
    if (!currentWorkspace) return;
    try {
      const allStages = LAUNCH_PIPELINE.map(s => s.stage);
      const { data, error } = await supabase
        .from('launch_runs' as any)
        .insert({
          launch_project_id: projectId,
          run_number: launchRuns.length + 1,
          current_stage: 'intake',
          stages_completed: [],
          stages_remaining: allStages,
          status: 'running',
          triggered_by: (await supabase.auth.getUser()).data.user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setLaunchRuns(prev => [data as unknown as LaunchRun, ...prev]);
        setCurrentStage('intake');
        setCompletedStages([]);
        await updateProject(projectId, { current_stage: 'intake', status: 'readiness_check' } as any);
        toast({ title: 'Launch Run demarre', description: 'L orchestration a commence' });
      }
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de demarrer le launch run', variant: 'destructive' });
    }
  };

  // ─── Provider ─────────────────────────────────────────────────────────────

  return (
    <LaunchOSContext.Provider value={{
      projects,
      currentProject,
      setCurrentProject,
      createProject,
      updateProject,
      deleteProject,
      readinessScores,
      scoreReadiness,
      creativeVariants,
      generateCreatives,
      videoConcepts,
      generateVideoConcepts,
      distributionRuns,
      signalEvents,
      decisionRules,
      decisionActions,
      evaluateDecisions,
      approveAction,
      rejectAction,
      campaignMemories,
      // Launch OS Hardening
      currentStage,
      completedStages,
      stageProgress,
      advanceStage,
      approvalCheckpoints,
      submitForApproval,
      approveCheckpoint,
      rejectCheckpoint,
      launchRuns,
      startLaunchRun,
      launchInsights,
      loading,
      refetch: fetchAll,
    }}>
      {children}
    </LaunchOSContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useLaunchOS() {
  const context = useContext(LaunchOSContext);
  if (context === undefined) {
    throw new Error('useLaunchOS must be used within a LaunchOSProvider');
  }
  return context;
}
