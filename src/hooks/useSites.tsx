import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';

export interface Site {
  id: string;
  workspace_id: string;
  url: string;
  name: string | null;
  sector: string | null;
  geographic_zone: string | null;
  language: string | null;
  objectives: string[] | null;
  business_type: string | null;
  cms_type: string | null;
  cms_access_level: string | null;
  tracking_status: string | null;
  is_active: boolean | null;
  last_crawl_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface SitesContextType {
  sites: Site[];
  currentSite: Site | null;
  setCurrentSite: (site: Site | null) => void;
  loading: boolean;
  createSite: (data: Partial<Site>) => Promise<{ error: Error | null; site: Site | null }>;
  updateSite: (id: string, data: Partial<Site>) => Promise<{ error: Error | null }>;
  deleteSite: (id: string) => Promise<{ error: Error | null }>;
  refetch: () => void;
}

const SitesContext = createContext<SitesContextType | undefined>(undefined);

export function SitesProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [sites, setSites] = useState<Site[]>([]);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSites = async () => {
    if (!currentWorkspace) {
      setSites([]);
      setCurrentSite(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('workspace_id', currentWorkspace.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sites:', error);
      setLoading(false);
      return;
    }

    const sitesData = data || [];
    setSites(sitesData as Site[]);
    
    // Auto-select first active site if none selected
    if (sitesData.length > 0 && !currentSite) {
      const activeSite = sitesData.find(s => s.is_active) || sitesData[0];
      setCurrentSite(activeSite as Site);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchSites();
  }, [currentWorkspace]);

  const createSite = async (data: Partial<Site>) => {
    if (!currentWorkspace) return { error: new Error('No workspace selected'), site: null };

    const { data: newSite, error } = await supabase
      .from('sites')
      .insert({
        workspace_id: currentWorkspace.id,
        url: data.url || '',
        name: data.name,
        sector: data.sector,
        geographic_zone: data.geographic_zone,
        language: data.language || 'fr',
        objectives: data.objectives,
        business_type: data.business_type,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return { error: error as Error, site: null };
    }

    const site = newSite as Site;
    setSites(prev => [site, ...prev]);
    setCurrentSite(site);
    
    return { error: null, site };
  };

  const updateSite = async (id: string, data: Partial<Site>) => {
    const { error } = await supabase
      .from('sites')
      .update(data)
      .eq('id', id);

    if (error) {
      return { error: error as Error };
    }

    setSites(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    if (currentSite?.id === id) {
      setCurrentSite({ ...currentSite, ...data });
    }
    
    return { error: null };
  };

  const deleteSite = async (id: string) => {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error as Error };
    }

    setSites(prev => prev.filter(s => s.id !== id));
    if (currentSite?.id === id) {
      setCurrentSite(sites.find(s => s.id !== id) || null);
    }
    
    return { error: null };
  };

  return (
    <SitesContext.Provider value={{ 
      sites, 
      currentSite, 
      setCurrentSite, 
      loading, 
      createSite,
      updateSite,
      deleteSite,
      refetch: fetchSites 
    }}>
      {children}
    </SitesContext.Provider>
  );
}

export function useSites() {
  const context = useContext(SitesContext);
  if (context === undefined) {
    throw new Error('useSites must be used within a SitesProvider');
  }
  return context;
}
