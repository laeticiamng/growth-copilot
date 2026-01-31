import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';
import { useToast } from './use-toast';

interface CreativeJob {
  id: string;
  workspace_id: string;
  site_id: string | null;
  status: 'queued' | 'running' | 'done' | 'failed' | 'needs_manual_review';
  provider: string;
  objective: string;
  language: string;
  geo: string | null;
  style: string | null;
  duration_seconds: number;
  input_json: Record<string, unknown>;
  output_json: Record<string, unknown> | null;
  cost_estimate: number | null;
  duration_ms: number | null;
  error_message: string | null;
  qa_iterations: number;
  approval_id: string | null;
  created_at: string;
  updated_at: string;
}

interface CreativeAsset {
  id: string;
  job_id: string;
  workspace_id: string;
  asset_type: 'video_9_16' | 'video_1_1' | 'video_16_9' | 'thumbnail' | 'srt' | 'copy_pack';
  url: string | null;
  storage_path: string | null;
  meta_json: Record<string, unknown> | null;
  created_at: string;
}

interface CreateJobInput {
  site_url: string;
  offer: string;
  objective: 'lead' | 'sale' | 'booking' | 'awareness';
  language: string;
  geo?: string;
  style?: string;
  duration_seconds?: number;
  logo_url?: string;
  product_images?: string[];
}

interface ExportResult {
  job_id: string;
  generated_at: string;
  videos: Array<{ format: string; aspect_ratio: string; url: string; filename: string }>;
  thumbnails: Array<{ variant: number; url: string; filename: string }>;
  subtitles: Array<{ format: string; srt_content: string; filename: string }>;
  copy_pack: {
    hooks: string[];
    headlines: string[];
    primary_texts: string[];
    ctas: string[];
    scripts: Array<{ duration: number; script: string }>;
  };
  utm_links: Record<string, string>;
  launch_checklist: Array<{ platform: string; format: string; specs: string; ready: boolean }>;
}

interface CreativesContextType {
  jobs: CreativeJob[];
  assets: CreativeAsset[];
  loading: boolean;
  error: string | null;
  createJob: (input: CreateJobInput) => Promise<{ success: boolean; job_id?: string; error?: string }>;
  renderJob: (jobId: string) => Promise<{ success: boolean; error?: string }>;
  runQA: (jobId: string) => Promise<{ success: boolean; passed?: boolean; error?: string }>;
  exportJob: (jobId: string, includeUtm?: boolean) => Promise<{ success: boolean; export?: ExportResult; error?: string }>;
  getJobAssets: (jobId: string) => CreativeAsset[];
  refetch: () => void;
}

const CreativesContext = createContext<CreativesContextType | undefined>(undefined);

export function CreativesProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<CreativeJob[]>([]);
  const [assets, setAssets] = useState<CreativeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setJobs([]);
      setAssets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('creative_jobs')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      setJobs((jobsData || []) as unknown as CreativeJob[]);

      // Fetch assets for all jobs
      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map(j => j.id);
        const { data: assetsData, error: assetsError } = await supabase
          .from('creative_assets')
          .select('*')
          .in('job_id', jobIds);

        if (assetsError) throw assetsError;
        setAssets((assetsData || []) as unknown as CreativeAsset[]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch creative jobs';
      setError(message);
      console.error('[useCreatives] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const createJob = async (input: CreateJobInput): Promise<{ success: boolean; job_id?: string; error?: string }> => {
    if (!currentWorkspace?.id) {
      return { success: false, error: 'No workspace selected' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('creative-init', {
        body: {
          workspace_id: currentWorkspace.id,
          site_id: currentSite?.id,
          ...input
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Job créé',
          description: `Ad Pack en cours de génération (${data.job_id})`
        });
        await fetchJobs();
        return { success: true, job_id: data.job_id };
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create job';
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive'
      });
      return { success: false, error: message };
    }
  };

  const renderJob = async (jobId: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentWorkspace?.id) {
      return { success: false, error: 'No workspace selected' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('creative-render', {
        body: {
          job_id: jobId,
          workspace_id: currentWorkspace.id
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Rendu terminé',
          description: `${data.renders?.length || 0} vidéos générées`
        });
        await fetchJobs();
        return { success: true };
      } else {
        throw new Error(data?.error || 'Render failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to render job';
      toast({
        title: 'Erreur de rendu',
        description: message,
        variant: 'destructive'
      });
      return { success: false, error: message };
    }
  };

  const runQA = async (jobId: string): Promise<{ success: boolean; passed?: boolean; error?: string }> => {
    if (!currentWorkspace?.id) {
      return { success: false, error: 'No workspace selected' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('creative-qa', {
        body: {
          job_id: jobId,
          workspace_id: currentWorkspace.id
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: data.passed ? 'QA validé' : 'QA échoué',
          description: data.passed 
            ? `Score: ${data.score}/100` 
            : `${data.issues?.length || 0} problèmes détectés`,
          variant: data.passed ? 'default' : 'destructive'
        });
        await fetchJobs();
        return { success: true, passed: data.passed };
      } else {
        throw new Error(data?.error || 'QA failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run QA';
      toast({
        title: 'Erreur QA',
        description: message,
        variant: 'destructive'
      });
      return { success: false, error: message };
    }
  };

  const exportJob = async (jobId: string, includeUtm = true): Promise<{ success: boolean; export?: ExportResult; error?: string }> => {
    if (!currentWorkspace?.id) {
      return { success: false, error: 'No workspace selected' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('creative-export', {
        body: {
          job_id: jobId,
          workspace_id: currentWorkspace.id,
          include_utm: includeUtm
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Export prêt',
          description: `${data.export?.videos?.length || 0} vidéos exportées`
        });
        return { success: true, export: data.export };
      } else {
        throw new Error(data?.error || 'Export failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export job';
      toast({
        title: 'Erreur export',
        description: message,
        variant: 'destructive'
      });
      return { success: false, error: message };
    }
  };

  const getJobAssets = (jobId: string): CreativeAsset[] => {
    return assets.filter(a => a.job_id === jobId);
  };

  return (
    <CreativesContext.Provider value={{
      jobs,
      assets,
      loading,
      error,
      createJob,
      renderJob,
      runQA,
      exportJob,
      getJobAssets,
      refetch: fetchJobs
    }}>
      {children}
    </CreativesContext.Provider>
  );
}

export function useCreatives() {
  const context = useContext(CreativesContext);
  if (context === undefined) {
    throw new Error('useCreatives must be used within a CreativesProvider');
  }
  return context;
}
