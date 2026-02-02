import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────
// Types - Meta Ads
// ─────────────────────────────────────────────────────────────

interface MetaAdAccount {
  id: string;
  account_id: string;
  account_name: string | null;
  currency: string | null;
  timezone: string | null;
  business_id: string | null;
  account_status: number | null;
  spend_cap: number | null;
  amount_spent: number | null;
}

interface MetaCampaign {
  id: string;
  campaign_id: string;
  ad_account_id: string;
  name: string;
  effective_status: string | null;
  objective: string | null;
  daily_budget: number | null;
  lifetime_budget: number | null;
}

interface MetaAdset {
  id: string;
  adset_id: string;
  campaign_id: string;
  name: string;
  effective_status: string | null;
  optimization_goal: string | null;
  billing_event: string | null;
  bid_amount: number | null;
  targeting: Record<string, unknown> | null;
}

interface MetaAd {
  id: string;
  ad_id: string;
  adset_id: string;
  name: string;
  effective_status: string | null;
  creative_id: string | null;
  preview_url: string | null;
}

interface MetaInsight {
  id: string;
  ad_account_id: string;
  campaign_id: string | null;
  adset_id: string | null;
  ad_id: string | null;
  date: string | null;
  level: string | null;
  impressions: number | null;
  clicks: number | null;
  spend: number | null;
  reach: number | null;
  frequency: number | null;
  cpc: number | null;
  cpm: number | null;
  ctr: number | null;
  conversions: number | null;
  conversion_value: number | null;
  cost_per_conversion: number | null;
  roas: number | null;
}

// ─────────────────────────────────────────────────────────────
// Types - Meta IG
// ─────────────────────────────────────────────────────────────

interface MetaIGAccount {
  id: string;
  ig_user_id: string;
  username: string | null;
  name: string | null;
  profile_picture_url: string | null;
  followers_count: number | null;
  follows_count: number | null;
  media_count: number | null;
  biography: string | null;
  website: string | null;
  is_business_account: boolean | null;
}

interface MetaIGMedia {
  id: string;
  media_id: string;
  media_type: string | null;
  caption: string | null;
  permalink: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  timestamp: string | null;
  like_count: number | null;
  comments_count: number | null;
  engagement: number | null;
  reach: number | null;
  impressions: number | null;
}

interface MetaIGStory {
  id: string;
  media_id: string;
  media_type: string | null;
  media_url: string | null;
  expires_at: string | null;
  impressions: number | null;
  reach: number | null;
  replies: number | null;
  exits: number | null;
}

// ─────────────────────────────────────────────────────────────
// Types - CAPI
// ─────────────────────────────────────────────────────────────

interface CAPIEvent {
  event_name: string;
  event_time: number;
  user_data: {
    em?: string; // hashed email
    ph?: string; // hashed phone
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_ids?: string[];
    content_type?: string;
  };
  event_source_url?: string;
  action_source: 'website' | 'app' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
}

// ─────────────────────────────────────────────────────────────
// Types - Messaging
// ─────────────────────────────────────────────────────────────

interface MetaConversation {
  id: string;
  platform: 'messenger' | 'whatsapp' | 'instagram_dm';
  participant_id: string;
  participant_name: string | null;
  last_message_at: string | null;
  unread_count: number | null;
  status: string | null;
}

interface MetaMessage {
  id: string;
  conversation_id: string;
  message_id: string;
  direction: string | null;
  content: string | null;
  message_type: string | null;
  created_at: string | null;
  status: string | null;
}

// ─────────────────────────────────────────────────────────────
// Types - Webhooks
// ─────────────────────────────────────────────────────────────

interface MetaWebhookEvent {
  id: string;
  event_type: string;
  object_type: string;
  object_id: string | null;
  payload: Record<string, unknown> | null;
  received_at: string | null;
  processed: boolean | null;
}

// ─────────────────────────────────────────────────────────────
// Module Status
// ─────────────────────────────────────────────────────────────

interface MetaModuleStatus {
  ads: { connected: boolean; lastSync: string | null; accountCount: number };
  capi: { configured: boolean; pixelId: string | null; eventsToday: number };
  instagram: { connected: boolean; lastSync: string | null; accountCount: number };
  messaging: { connected: boolean; conversationCount: number; unreadCount: number };
  webhooks: { configured: boolean; eventsToday: number };
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

interface MetaContextType {
  // Module status
  moduleStatus: MetaModuleStatus;
  loading: boolean;
  
  // Ads
  adAccounts: MetaAdAccount[];
  campaigns: MetaCampaign[];
  adsets: MetaAdset[];
  ads: MetaAd[];
  insights: MetaInsight[];
  
  // Instagram
  igAccounts: MetaIGAccount[];
  igMedia: MetaIGMedia[];
  igStories: MetaIGStory[];
  
  // Messaging
  conversations: MetaConversation[];
  messages: MetaMessage[];
  
  // Webhooks
  webhookEvents: MetaWebhookEvent[];
  
  // Actions
  refetch: () => Promise<void>;
  syncAds: () => Promise<{ success: boolean; error?: string }>;
  syncInstagram: () => Promise<{ success: boolean; error?: string }>;
  sendCAPIEvent: (event: CAPIEvent) => Promise<{ success: boolean; error?: string }>;
  getConversationMessages: (conversationId: string) => Promise<MetaMessage[]>;
}

const MetaContext = createContext<MetaContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function MetaProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  
  // State
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [adsets, setAdsets] = useState<MetaAdset[]>([]);
  const [ads, setAds] = useState<MetaAd[]>([]);
  const [insights, setInsights] = useState<MetaInsight[]>([]);
  
  const [igAccounts, setIgAccounts] = useState<MetaIGAccount[]>([]);
  const [igMedia, setIgMedia] = useState<MetaIGMedia[]>([]);
  const [igStories, setIgStories] = useState<MetaIGStory[]>([]);
  
  const [conversations, setConversations] = useState<MetaConversation[]>([]);
  const [messages, setMessages] = useState<MetaMessage[]>([]);
  
  const [webhookEvents, setWebhookEvents] = useState<MetaWebhookEvent[]>([]);
  
  const [moduleStatus, setModuleStatus] = useState<MetaModuleStatus>({
    ads: { connected: false, lastSync: null, accountCount: 0 },
    capi: { configured: false, pixelId: null, eventsToday: 0 },
    instagram: { connected: false, lastSync: null, accountCount: 0 },
    messaging: { connected: false, conversationCount: 0, unreadCount: 0 },
    webhooks: { configured: false, eventsToday: 0 },
  });

  const fetchMeta = useCallback(async () => {
    if (!currentWorkspace) {
      setAdAccounts([]);
      setCampaigns([]);
      setAdsets([]);
      setAds([]);
      setInsights([]);
      setIgAccounts([]);
      setIgMedia([]);
      setIgStories([]);
      setConversations([]);
      setMessages([]);
      setWebhookEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch all Meta data in parallel
      const [
        adAccountsRes,
        campaignsRes,
        adsetsRes,
        adsRes,
        insightsRes,
        igAccountsRes,
        igMediaRes,
        conversationsRes,
        webhookEventsRes,
        capiEventsRes,
      ] = await Promise.all([
        supabase.from('meta_ad_accounts').select('*').eq('workspace_id', currentWorkspace.id),
        supabase.from('meta_campaigns').select('*').eq('workspace_id', currentWorkspace.id).order('created_at', { ascending: false }),
        supabase.from('meta_adsets').select('*').eq('workspace_id', currentWorkspace.id),
        supabase.from('meta_ads').select('*').eq('workspace_id', currentWorkspace.id),
        supabase.from('meta_insights').select('*').eq('workspace_id', currentWorkspace.id).order('date', { ascending: false }).limit(100),
        supabase.from('meta_ig_accounts').select('*').eq('workspace_id', currentWorkspace.id),
        supabase.from('meta_ig_media').select('*').eq('workspace_id', currentWorkspace.id).order('timestamp', { ascending: false }).limit(50),
        supabase.from('meta_conversations').select('*').eq('workspace_id', currentWorkspace.id).order('last_message_at', { ascending: false }),
        supabase.from('meta_webhook_events').select('*').eq('workspace_id', currentWorkspace.id).order('received_at', { ascending: false }).limit(50),
        supabase.from('meta_capi_events').select('id').eq('workspace_id', currentWorkspace.id).gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      ]);

      // Set state
      setAdAccounts((adAccountsRes.data || []) as unknown as MetaAdAccount[]);
      setCampaigns((campaignsRes.data || []) as unknown as MetaCampaign[]);
      setAdsets((adsetsRes.data || []) as unknown as MetaAdset[]);
      setAds((adsRes.data || []) as unknown as MetaAd[]);
      setInsights((insightsRes.data || []) as unknown as MetaInsight[]);
      setIgAccounts((igAccountsRes.data || []) as unknown as MetaIGAccount[]);
      setIgMedia((igMediaRes.data || []) as unknown as MetaIGMedia[]);
      setIgStories([]); // Stories table not yet created
      setConversations((conversationsRes.data || []) as unknown as MetaConversation[]);
      setWebhookEvents((webhookEventsRes.data || []) as unknown as MetaWebhookEvent[])

      // Calculate module status
      const todayEvents = webhookEventsRes.data?.filter(e => 
        new Date(e.received_at).toDateString() === new Date().toDateString()
      ).length || 0;
      
      const unreadCount = (conversationsRes.data || []).reduce((sum, c) => sum + (c.unread_count || 0), 0);

      setModuleStatus({
        ads: {
          connected: (adAccountsRes.data?.length || 0) > 0,
          lastSync: adAccountsRes.data?.[0]?.updated_at || null,
          accountCount: adAccountsRes.data?.length || 0,
        },
        capi: {
          configured: true, // Always configured via edge function
          pixelId: adAccountsRes.data?.[0]?.account_id || null,
          eventsToday: capiEventsRes.data?.length || 0,
        },
        instagram: {
          connected: (igAccountsRes.data?.length || 0) > 0,
          lastSync: igAccountsRes.data?.[0]?.updated_at || null,
          accountCount: igAccountsRes.data?.length || 0,
        },
        messaging: {
          connected: (conversationsRes.data?.length || 0) > 0,
          conversationCount: conversationsRes.data?.length || 0,
          unreadCount,
        },
        webhooks: {
          configured: true, // Always configured
          eventsToday: todayEvents,
        },
      });

    } catch (error) {
      console.error('Error fetching Meta data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  // ─────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────

  const syncAds = async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentWorkspace) {
      return { success: false, error: 'No workspace selected' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('sync-meta-ads', {
        body: { workspace_id: currentWorkspace.id },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Meta Ads synchronisées');
        await fetchMeta();
        return { success: true };
      }

      return { success: false, error: data?.error || 'Sync failed' };
    } catch (error) {
      console.error('Sync Meta Ads error:', error);
      return { success: false, error: String(error) };
    }
  };

  const syncInstagram = async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentWorkspace) {
      return { success: false, error: 'No workspace selected' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('meta-ig-sync', {
        body: { workspace_id: currentWorkspace.id },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Instagram synchronisé');
        await fetchMeta();
        return { success: true };
      }

      return { success: false, error: data?.error || 'Sync failed' };
    } catch (error) {
      console.error('Sync Instagram error:', error);
      return { success: false, error: String(error) };
    }
  };

  const sendCAPIEvent = async (event: CAPIEvent): Promise<{ success: boolean; error?: string }> => {
    if (!currentWorkspace) {
      return { success: false, error: 'No workspace selected' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('meta-capi', {
        body: { 
          workspace_id: currentWorkspace.id,
          events: [event],
        },
      });

      if (error) throw error;

      return data?.success ? { success: true } : { success: false, error: data?.error };
    } catch (error) {
      console.error('CAPI event error:', error);
      return { success: false, error: String(error) };
    }
  };

  const getConversationMessages = async (conversationId: string): Promise<MetaMessage[]> => {
    if (!currentWorkspace) return [];

    const { data } = await supabase
      .from('meta_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    const msgs = (data || []) as unknown as MetaMessage[];
    setMessages(msgs);
    return msgs;
  };

  return (
    <MetaContext.Provider value={{
      moduleStatus,
      loading,
      adAccounts,
      campaigns,
      adsets,
      ads,
      insights,
      igAccounts,
      igMedia,
      igStories,
      conversations,
      messages,
      webhookEvents,
      refetch: fetchMeta,
      syncAds,
      syncInstagram,
      sendCAPIEvent,
      getConversationMessages,
    }}>
      {children}
    </MetaContext.Provider>
  );
}

export function useMeta() {
  const context = useContext(MetaContext);
  if (context === undefined) {
    throw new Error('useMeta must be used within a MetaProvider');
  }
  return context;
}

// Export types for agents
export type { 
  MetaAdAccount, 
  MetaCampaign, 
  MetaAdset, 
  MetaAd, 
  MetaInsight,
  MetaIGAccount,
  MetaIGMedia,
  MetaIGStory,
  CAPIEvent,
  MetaConversation,
  MetaMessage,
  MetaWebhookEvent,
  MetaModuleStatus,
};
