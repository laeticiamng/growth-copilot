import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';

interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  source: string | null;
  status: string;
  value: number | null;
  last_activity: string | null;
}

interface Deal {
  id: string;
  title: string;
  lead_id: string;
  stage_id: string | null;
  value: number | null;
  probability: number | null;
  expected_close_date: string | null;
  won: boolean | null;
}

interface PipelineStage {
  id: string;
  name: string;
  position: number;
  color: string;
}

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  emails_count: number;
  open_rate: number | null;
  click_rate: number | null;
  status: string;
}

interface LifecycleContextType {
  leads: Lead[];
  deals: Deal[];
  stages: PipelineStage[];
  workflows: Workflow[];
  loading: boolean;
  refetch: () => void;
  createLead: (data: Partial<Lead>) => Promise<{ error: Error | null; lead: Lead | null }>;
  updateLead: (leadId: string, data: Partial<Lead>) => Promise<{ error: Error | null }>;
  createDeal: (data: Partial<Deal>) => Promise<{ error: Error | null; deal: Deal | null }>;
  updateDealStage: (dealId: string, stageId: string) => Promise<{ error: Error | null }>;
}

const LifecycleContext = createContext<LifecycleContextType | undefined>(undefined);

export function LifecycleProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLifecycle = async () => {
    if (!currentWorkspace) {
      setLeads([]);
      setDeals([]);
      setStages([]);
      setWorkflows([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [leadsRes, dealsRes, stagesRes] = await Promise.all([
      supabase.from('leads').select('*').eq('workspace_id', currentWorkspace.id).order('created_at', { ascending: false }),
      supabase.from('deals').select('*').eq('workspace_id', currentWorkspace.id).order('created_at', { ascending: false }),
      supabase.from('pipeline_stages').select('*').eq('workspace_id', currentWorkspace.id).order('position', { ascending: true }),
    ]);

    setLeads((leadsRes.data || []).map(l => ({
      id: l.id,
      name: l.name || '',
      company: l.company,
      email: l.email || '',
      phone: l.phone,
      source: l.source,
      status: l.status || 'new',
      value: null,
      last_activity: l.updated_at,
    })));

    setDeals((dealsRes.data || []).map(d => ({
      id: d.id,
      title: d.title,
      lead_id: d.lead_id,
      stage_id: d.stage_id,
      value: d.value,
      probability: d.probability,
      expected_close_date: d.expected_close_date,
      won: d.won,
    })));

    setStages((stagesRes.data || []).map(s => ({
      id: s.id,
      name: s.name,
      position: s.position || 0,
      color: s.color || 'bg-primary',
    })));

    // Demo workflows
    setWorkflows([
      { id: '1', name: 'Welcome Sequence', trigger: 'Nouveau lead', emails_count: 5, open_rate: 45, click_rate: 12, status: 'active' },
      { id: '2', name: 'Nurture - Non qualifiés', trigger: 'Lead froid 7j', emails_count: 8, open_rate: 32, click_rate: 8, status: 'active' },
      { id: '3', name: 'Follow-up RDV', trigger: 'Après RDV', emails_count: 3, open_rate: 58, click_rate: 22, status: 'active' },
    ]);

    setLoading(false);
  };

  useEffect(() => {
    fetchLifecycle();
  }, [currentWorkspace]);

  const createLead = async (data: Partial<Lead>) => {
    if (!currentWorkspace) {
      return { error: new Error('No workspace selected'), lead: null };
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name: data.name || '',
        email: data.email || '',
        company: data.company || '',
        phone: data.phone || '',
        source: data.source || 'direct',
        status: 'new' as const,
        workspace_id: currentWorkspace.id,
      })
      .select()
      .single();

    if (!error) fetchLifecycle();
    
    return { 
      error: error as Error | null, 
      lead: lead ? {
        id: lead.id,
        name: lead.name || '',
        company: lead.company,
        email: lead.email || '',
        phone: lead.phone,
        source: lead.source,
        status: lead.status || 'new',
        value: null,
        last_activity: lead.updated_at,
      } : null 
    };
  };

  const updateLead = async (leadId: string, data: Partial<Lead>) => {
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.company) updateData.company = data.company;
    if (data.phone) updateData.phone = data.phone;

    const { error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', leadId);

    if (!error) fetchLifecycle();
    return { error: error as Error | null };
  };

  const createDeal = async (data: Partial<Deal>) => {
    if (!currentWorkspace) {
      return { error: new Error('No workspace selected'), deal: null };
    }

    const { data: deal, error } = await supabase
      .from('deals')
      .insert({
        title: data.title,
        lead_id: data.lead_id,
        stage_id: data.stage_id,
        value: data.value,
        probability: data.probability,
        workspace_id: currentWorkspace.id,
      })
      .select()
      .single();

    if (!error) fetchLifecycle();
    
    return { 
      error: error as Error | null, 
      deal: deal ? {
        id: deal.id,
        title: deal.title,
        lead_id: deal.lead_id,
        stage_id: deal.stage_id,
        value: deal.value,
        probability: deal.probability,
        expected_close_date: deal.expected_close_date,
        won: deal.won,
      } : null 
    };
  };

  const updateDealStage = async (dealId: string, stageId: string) => {
    const { error } = await supabase
      .from('deals')
      .update({ stage_id: stageId })
      .eq('id', dealId);

    if (!error) fetchLifecycle();
    return { error: error as Error | null };
  };

  return (
    <LifecycleContext.Provider value={{
      leads,
      deals,
      stages,
      workflows,
      loading,
      refetch: fetchLifecycle,
      createLead,
      updateLead,
      createDeal,
      updateDealStage,
    }}>
      {children}
    </LifecycleContext.Provider>
  );
}

export function useLifecycle() {
  const context = useContext(LifecycleContext);
  if (context === undefined) {
    throw new Error('useLifecycle must be used within a LifecycleProvider');
  }
  return context;
}