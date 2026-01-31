import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Types matching actual DB schema
export interface Offer {
  id: string;
  workspace_id: string;
  site_id: string | null;
  name: string;
  tier: string;
  price: number;
  price_period: string;
  features: string[];
  benefits: string[];
  guarantees: string[];
  objections_answers: Record<string, string>;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateOfferData {
  name: string;
  tier: string;
  price: number;
  price_period: string;
  features: string[];
  benefits?: string[];
  guarantees?: string[];
  objections_answers?: Record<string, string>;
}

interface OffersContextType {
  offers: Offer[];
  loading: boolean;
  createOffer: (data: CreateOfferData) => Promise<Offer | null>;
  updateOffer: (id: string, data: Partial<CreateOfferData>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  refreshOffers: () => Promise<void>;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

// Helper to safely parse JSON arrays
const parseJsonArray = (value: Json | null): string[] => {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  return [];
};

// Helper to safely parse JSON object
const parseJsonObject = (value: Json | null): Record<string, string> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === 'string') {
        result[k] = v;
      }
    }
    return result;
  }
  return {};
};

export function OffersProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOffers = async () => {
    if (!currentWorkspace?.id) {
      setOffers([]);
      return;
    }

    setLoading(true);
    try {
      const query = supabase
        .from('offers')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (currentSite?.id) {
        query.eq('site_id', currentSite.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching offers:', error);
        return;
      }

      // Map database response to our interface
      const typedOffers: Offer[] = (data || []).map((row) => ({
        id: row.id,
        workspace_id: row.workspace_id,
        site_id: row.site_id,
        name: row.name,
        tier: row.tier || 'standard',
        price: row.price || 0,
        price_period: row.price_period || '/mois',
        features: parseJsonArray(row.features),
        benefits: parseJsonArray(row.benefits),
        guarantees: parseJsonArray(row.guarantees),
        objections_answers: parseJsonObject(row.objections_answers),
        is_active: row.is_active ?? true,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      setOffers(typedOffers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [currentWorkspace?.id, currentSite?.id]);

  const createOffer = async (data: CreateOfferData): Promise<Offer | null> => {
    if (!currentWorkspace?.id) {
      toast.error('Workspace non sélectionné');
      return null;
    }

    const { data: newOffer, error } = await supabase
      .from('offers')
      .insert({
        workspace_id: currentWorkspace.id,
        site_id: currentSite?.id || null,
        name: data.name,
        tier: data.tier,
        price: data.price,
        price_period: data.price_period,
        features: data.features as unknown as Json,
        benefits: (data.benefits || []) as unknown as Json,
        guarantees: (data.guarantees || []) as unknown as Json,
        objections_answers: (data.objections_answers || {}) as unknown as Json,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast.error('Erreur lors de la création');
      console.error('Create offer error:', error);
      return null;
    }

    toast.success('Offre créée avec succès');
    await fetchOffers();
    
    // Map response to our type
    return {
      id: newOffer.id,
      workspace_id: newOffer.workspace_id,
      site_id: newOffer.site_id,
      name: newOffer.name,
      tier: newOffer.tier || 'standard',
      price: newOffer.price || 0,
      price_period: newOffer.price_period || '/mois',
      features: parseJsonArray(newOffer.features),
      benefits: parseJsonArray(newOffer.benefits),
      guarantees: parseJsonArray(newOffer.guarantees),
      objections_answers: parseJsonObject(newOffer.objections_answers),
      is_active: newOffer.is_active ?? true,
      created_at: newOffer.created_at,
      updated_at: newOffer.updated_at,
    };
  };

  const updateOffer = async (id: string, data: Partial<CreateOfferData>) => {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.tier !== undefined) updateData.tier = data.tier;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.price_period !== undefined) updateData.price_period = data.price_period;
    if (data.features !== undefined) updateData.features = data.features as unknown as Json;
    if (data.benefits !== undefined) updateData.benefits = data.benefits as unknown as Json;
    if (data.guarantees !== undefined) updateData.guarantees = data.guarantees as unknown as Json;
    if (data.objections_answers !== undefined) updateData.objections_answers = data.objections_answers as unknown as Json;

    const { error } = await supabase
      .from('offers')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
      throw error;
    }

    toast.success('Offre mise à jour');
    await fetchOffers();
  };

  const deleteOffer = async (id: string) => {
    const { error } = await supabase.from('offers').delete().eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
      throw error;
    }

    toast.success('Offre supprimée');
    await fetchOffers();
  };

  const toggleActive = async (id: string) => {
    const offer = offers.find(o => o.id === id);
    if (!offer) return;

    const { error } = await supabase
      .from('offers')
      .update({ is_active: !offer.is_active })
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la modification');
      throw error;
    }

    toast.success(offer.is_active ? 'Offre désactivée' : 'Offre activée');
    await fetchOffers();
  };

  return (
    <OffersContext.Provider value={{
      offers,
      loading,
      createOffer,
      updateOffer,
      deleteOffer,
      toggleActive,
      refreshOffers: fetchOffers,
    }}>
      {children}
    </OffersContext.Provider>
  );
}

export function useOffers() {
  const context = useContext(OffersContext);
  if (context === undefined) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
}
