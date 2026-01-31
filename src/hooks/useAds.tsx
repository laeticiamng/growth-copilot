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

interface AdsContextType {
  accounts: AdsAccount[];
  currentAccount: AdsAccount | null;
  campaigns: Campaign[];
  adGroups: AdGroup[];
  keywords: AdsKeyword[];
  loading: boolean;
  refetch: () => void;
  setCurrentAccount: (account: AdsAccount | null) => void;
  updateCampaignStatus: (campaignId: string, status: string) => Promise<{ error: Error | null }>;
  addNegativeKeyword: (keyword: string, level: string, targetId: string) => Promise<{ error: Error | null }>;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export function AdsProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [accounts, setAccounts] = useState<AdsAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<AdsAccount | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adGroups, setAdGroups] = useState<AdGroup[]>([]);
  const [keywords, setKeywords] = useState<AdsKeyword[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    if (!currentWorkspace) {
      setAccounts([]);
      setCurrentAccount(null);
      setCampaigns([]);
      setAdGroups([]);
      setKeywords([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: accountsData } = await supabase
      .from('ads_accounts')
      .select('*')
      .eq('workspace_id', currentWorkspace.id);

    const adsAccounts = (accountsData || []) as AdsAccount[];
    setAccounts(adsAccounts);

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

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    const { error } = await supabase
      .from('campaigns')
      .update({ status })
      .eq('id', campaignId);

    if (!error) fetchAds();
    return { error: error as Error | null };
  };

  const addNegativeKeyword = async (keyword: string, level: 'campaign' | 'adgroup', targetId: string) => {
    if (!currentWorkspace) {
      return { error: new Error('No workspace selected') };
    }

    const { error } = await supabase.from('ads_negatives').insert({
      keyword,
      level,
      workspace_id: currentWorkspace.id,
      campaign_id: level === 'campaign' ? targetId : undefined,
      adgroup_id: level === 'adgroup' ? targetId : undefined,
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
      loading,
      refetch: fetchAds,
      setCurrentAccount,
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
