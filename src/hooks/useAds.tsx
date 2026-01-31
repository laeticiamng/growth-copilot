import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';

interface AdsAccount {
  id: string;
  account_id: string;
  account_name: string | null;
  currency: string | null;
  is_active: boolean | null;
  budget_limit_daily: number | null;
  budget_limit_monthly: number | null;
}

interface Campaign {
  id: string;
  name: string;
  campaign_id: string | null;
  campaign_type: string | null;
  status: string | null;
  budget_daily: number | null;
  target_cpa: number | null;
  target_roas: number | null;
  strategy: string | null;
  impressions_30d: number | null;
  clicks_30d: number | null;
  cost_30d: number | null;
  conversions_30d: number | null;
}

interface AdGroup {
  id: string;
  name: string;
  campaign_id: string;
  status: string | null;
}

interface AdsKeyword {
  id: string;
  keyword: string;
  adgroup_id: string;
  match_type: string | null;
  status: string | null;
  max_cpc: number | null;
  quality_score: number | null;
}

interface AdsNegative {
  id: string;
  keyword: string;
  level: string | null;
  match_type: string | null;
  campaign_id: string | null;
  adgroup_id: string | null;
  created_at: string | null;
}

interface AdsContextType {
  accounts: AdsAccount[];
  currentAccount: AdsAccount | null;
  campaigns: Campaign[];
  adGroups: AdGroup[];
  keywords: AdsKeyword[];
  negatives: AdsNegative[];
  loading: boolean;
  refetch: () => void;
  setCurrentAccount: (account: AdsAccount | null) => void;
  createCampaign: (data: Partial<Campaign>) => Promise<{ error: Error | null }>;
  updateCampaign: (campaignId: string, data: Partial<Campaign>) => Promise<{ error: Error | null }>;
  updateCampaignStatus: (campaignId: string, status: string) => Promise<{ error: Error | null }>;
  addNegativeKeyword: (keyword: string, matchType: string, campaignId?: string) => Promise<{ error: Error | null }>;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export function AdsProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [accounts, setAccounts] = useState<AdsAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<AdsAccount | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adGroups, setAdGroups] = useState<AdGroup[]>([]);
  const [keywords, setKeywords] = useState<AdsKeyword[]>([]);
  const [negatives, setNegatives] = useState<AdsNegative[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    if (!currentWorkspace) {
      setAccounts([]);
      setCurrentAccount(null);
      setCampaigns([]);
      setAdGroups([]);
      setKeywords([]);
      setNegatives([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [accountsRes, negativesRes] = await Promise.all([
      supabase.from('ads_accounts').select('*').eq('workspace_id', currentWorkspace.id),
      supabase.from('ads_negatives').select('*').eq('workspace_id', currentWorkspace.id).order('created_at', { ascending: false }),
    ]);

    const adsAccounts = (accountsRes.data || []) as AdsAccount[];
    setAccounts(adsAccounts);
    setNegatives((negativesRes.data || []) as AdsNegative[]);

    if (adsAccounts.length > 0 && !currentAccount) {
      setCurrentAccount(adsAccounts[0]);
    }

    if (currentAccount) {
      const [campaignsRes, adGroupsRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('ads_account_id', currentAccount.id).order('cost_30d', { ascending: false }),
        supabase.from('adgroups').select('*').eq('workspace_id', currentWorkspace.id),
      ]);

      setCampaigns((campaignsRes.data || []) as Campaign[]);
      setAdGroups((adGroupsRes.data || []) as AdGroup[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, [currentWorkspace, currentAccount?.id]);

  const createCampaign = async (data: Partial<Campaign>) => {
    if (!currentWorkspace || !currentAccount) {
      return { error: new Error('No workspace or account selected') };
    }

    const insertData = {
      name: data.name || 'New Campaign',
      workspace_id: currentWorkspace.id,
      ads_account_id: currentAccount.id,
      budget_daily: data.budget_daily,
      strategy: data.strategy,
      campaign_type: data.campaign_type,
      status: 'draft',
    };

    const { error } = await supabase.from('campaigns').insert(insertData);

    if (!error) fetchAds();
    return { error: error as Error | null };
  };

  const updateCampaign = async (campaignId: string, data: Partial<Campaign>) => {
    const { error } = await supabase
      .from('campaigns')
      .update(data)
      .eq('id', campaignId);

    if (!error) fetchAds();
    return { error: error as Error | null };
  };

  useEffect(() => {
    fetchAds();
  }, [currentWorkspace, currentAccount?.id]);

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    return updateCampaign(campaignId, { status });
  };

  const addNegativeKeyword = async (keyword: string, matchType: string = 'exact', campaignId?: string) => {
    if (!currentWorkspace) {
      return { error: new Error('No workspace selected') };
    }

    const { error } = await supabase.from('ads_negatives').insert({
      keyword,
      match_type: matchType,
      level: campaignId ? 'campaign' : 'account',
      workspace_id: currentWorkspace.id,
      campaign_id: campaignId || null,
    });

    if (!error) fetchAds();
    return { error: error as Error | null };
  };

  return (
    <AdsContext.Provider value={{
      accounts,
      currentAccount,
      campaigns,
      adGroups,
      keywords,
      negatives,
      loading,
      refetch: fetchAds,
      setCurrentAccount,
      createCampaign,
      updateCampaign,
      updateCampaignStatus,
      addNegativeKeyword,
    }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdsContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
}
