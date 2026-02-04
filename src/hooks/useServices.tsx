import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useAuth } from './useAuth';

// Service definition from catalog
export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  is_core: boolean;
  display_order: number;
  features: string[];
}

// Workspace service entitlement
export interface WorkspaceService {
  id: string;
  workspace_id: string;
  service_id: string;
  enabled: boolean;
  enabled_at: string;
  expires_at: string | null;
  config: Record<string, unknown>;
}

// Subscription info
export interface Subscription {
  id: string;
  workspace_id: string;
  plan: 'free' | 'starter' | 'growth' | 'agency' | 'founder' | 'full_company';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'inactive';
  trial_ends_at: string | null;
  is_full_company: boolean;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
}

interface ServicesContextType {
  // Catalog (all available services)
  catalog: Service[];
  catalogLoading: boolean;
  
  // Enabled services for current workspace
  enabledServices: Service[];
  enabledSlugs: Set<string>;
  servicesLoading: boolean;
  
  // Subscription
  subscription: Subscription | null;
  subscriptionLoading: boolean;
  isFullCompany: boolean;
  
  // Check functions
  hasService: (slug: string) => boolean;
  isServiceEnabled: (slug: string) => boolean;
  
  // Actions
  enableService: (serviceId: string) => Promise<{ error: Error | null }>;
  disableService: (serviceId: string) => Promise<{ error: Error | null }>;
  refetch: () => void;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  
  const [catalog, setCatalog] = useState<Service[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  
  const [workspaceServices, setWorkspaceServices] = useState<WorkspaceService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Fetch catalog (public, once)
  useEffect(() => {
    const fetchCatalog = async () => {
      setCatalogLoading(true);
      const { data, error } = await supabase
        .from('services_catalog')
        .select('*')
        .order('display_order');
      
      if (error) {
        console.error('Error fetching services catalog:', error);
      } else {
        setCatalog((data || []).map(s => ({
          ...s,
          features: Array.isArray(s.features) ? s.features : []
        })) as Service[]);
      }
      setCatalogLoading(false);
    };
    
    fetchCatalog();
  }, []);

  // Fetch workspace services
  const fetchWorkspaceServices = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setWorkspaceServices([]);
      setServicesLoading(false);
      return;
    }
    
    setServicesLoading(true);
    const { data, error } = await supabase
      .from('workspace_services')
      .select('*')
      .eq('workspace_id', currentWorkspace.id)
      .eq('enabled', true);
    
    if (error) {
      console.error('Error fetching workspace services:', error);
    } else {
      setWorkspaceServices((data || []) as WorkspaceService[]);
    }
    setServicesLoading(false);
  }, [currentWorkspace?.id]);

  // Fetch subscription
  const fetchSubscription = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setSubscription(null);
      setSubscriptionLoading(false);
      return;
    }
    
    setSubscriptionLoading(true);
    const { data, error } = await supabase
      .from('workspace_subscriptions')
      .select('*')
      .eq('workspace_id', currentWorkspace.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching subscription:', error);
    }
    setSubscription(data as Subscription | null);
    setSubscriptionLoading(false);
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchWorkspaceServices();
    fetchSubscription();
  }, [fetchWorkspaceServices, fetchSubscription]);

  // Compute enabled services with full details
  const enabledServiceIds = new Set(workspaceServices.map(ws => ws.service_id));
  const enabledServices = catalog.filter(s => s.is_core || enabledServiceIds.has(s.id));
  const enabledSlugs = new Set(enabledServices.map(s => s.slug));
  
  // Check functions
  const hasService = useCallback((slug: string) => {
    // Core services are always available
    const service = catalog.find(s => s.slug === slug);
    if (service?.is_core) return true;
    return enabledSlugs.has(slug);
  }, [catalog, enabledSlugs]);

  const isServiceEnabled = hasService;

  // Is full company plan (includes founder)
  const isFullCompany = subscription?.is_full_company || subscription?.plan === 'founder' || false;

  // Enable a service
  const enableService = async (serviceId: string) => {
    if (!currentWorkspace?.id || !user?.id) {
      return { error: new Error('No workspace or user') };
    }
    
    const { error } = await supabase
      .from('workspace_services')
      .upsert({
        workspace_id: currentWorkspace.id,
        service_id: serviceId,
        enabled: true,
        enabled_by: user.id,
        enabled_at: new Date().toISOString()
      }, { onConflict: 'workspace_id,service_id' });
    
    if (error) {
      return { error: error as Error };
    }
    
    await fetchWorkspaceServices();
    return { error: null };
  };

  // Disable a service
  const disableService = async (serviceId: string) => {
    if (!currentWorkspace?.id) {
      return { error: new Error('No workspace') };
    }
    
    const { error } = await supabase
      .from('workspace_services')
      .update({ enabled: false })
      .eq('workspace_id', currentWorkspace.id)
      .eq('service_id', serviceId);
    
    if (error) {
      return { error: error as Error };
    }
    
    await fetchWorkspaceServices();
    return { error: null };
  };

  const refetch = () => {
    fetchWorkspaceServices();
    fetchSubscription();
  };

  return (
    <ServicesContext.Provider value={{
      catalog,
      catalogLoading,
      enabledServices,
      enabledSlugs,
      servicesLoading,
      subscription,
      subscriptionLoading,
      isFullCompany,
      hasService,
      isServiceEnabled,
      enableService,
      disableService,
      refetch
    }}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}

// Mapping service slugs to dashboard routes
export const SERVICE_ROUTES: Record<string, string[]> = {
  'core-os': [
    '/dashboard',
    '/dashboard/sites',
    '/dashboard/connections',
    '/dashboard/approvals',
    '/dashboard/logs',
    '/dashboard/billing',
    '/dashboard/guide'
  ],
  'marketing': [
    '/dashboard/seo',
    '/dashboard/content',
    '/dashboard/local',
    '/dashboard/ads',
    '/dashboard/social',
    '/dashboard/cro',
    '/dashboard/brand-kit',
    '/dashboard/media',
    '/dashboard/competitors'
  ],
  'sales': [
    '/dashboard/lifecycle',
    '/dashboard/offers'
  ],
  'finance': [
    '/dashboard/reports'
  ],
  'security': [
    '/dashboard/diagnostics',
    '/dashboard/ops'
  ],
  'product': [],
  'engineering': [],
  'data': [
    '/dashboard/reports'
  ],
  'support': [
    '/dashboard/reputation'
  ],
  'governance': [
    '/dashboard/integrations',
    '/dashboard/automations',
    '/dashboard/agency'
  ],
  'hr': [
    '/dashboard/hr'
  ],
  'legal': [
    '/dashboard/legal'
  ]
};

// Get required service for a route
export function getRouteService(path: string): string | null {
  for (const [service, routes] of Object.entries(SERVICE_ROUTES)) {
    if (routes.includes(path)) {
      return service;
    }
  }
  return null;
}
