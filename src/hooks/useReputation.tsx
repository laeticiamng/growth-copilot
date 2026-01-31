import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useSites } from './useSites';
import { toast } from 'sonner';

// Types matching actual DB schema
export interface Review {
  id: string;
  workspace_id: string;
  gbp_profile_id: string | null;
  review_id: string | null;
  author_name: string | null;
  rating: number;
  comment: string | null;
  reply: string | null;
  replied_at: string | null;
  review_date: string | null;
  sentiment: string | null;
  requires_attention: boolean;
  created_at: string | null;
}

export interface ReviewRequest {
  id: string;
  workspace_id: string;
  gbp_profile_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  channel: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  review_received: boolean;
  created_at: string | null;
}

interface ReputationStats {
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  thisMonthCount: number;
  pendingResponses: number;
}

interface ReputationContextType {
  reviews: Review[];
  reviewRequests: ReviewRequest[];
  stats: ReputationStats;
  loading: boolean;
  sendReviewRequest: (data: { name: string; email: string; phone?: string; gbp_profile_id: string }) => Promise<void>;
  respondToReview: (reviewId: string, response: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const defaultStats: ReputationStats = {
  averageRating: 0,
  totalReviews: 0,
  responseRate: 0,
  thisMonthCount: 0,
  pendingResponses: 0,
};

const ReputationContext = createContext<ReputationContextType | undefined>(undefined);

export function ReputationProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [stats, setStats] = useState<ReputationStats>(defaultStats);
  const [loading, setLoading] = useState(false);

  const calculateStats = (reviewList: Review[]): ReputationStats => {
    if (reviewList.length === 0) return defaultStats;

    const totalRating = reviewList.reduce((sum, r) => sum + (r.rating || 0), 0);
    const avgRating = totalRating / reviewList.length;

    const withResponse = reviewList.filter(r => r.reply).length;
    const responseRate = (withResponse / reviewList.length) * 100;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthReviews = reviewList.filter(r => {
      const reviewDate = r.review_date ? new Date(r.review_date) : null;
      return reviewDate && reviewDate >= thisMonth;
    }).length;

    const pendingResponses = reviewList.filter(r => !r.reply && r.rating <= 3).length;

    return {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviewList.length,
      responseRate: Math.round(responseRate),
      thisMonthCount: thisMonthReviews,
      pendingResponses,
    };
  };

  const fetchData = async () => {
    if (!currentWorkspace?.id) {
      setReviews([]);
      setReviewRequests([]);
      setStats(defaultStats);
      return;
    }

    setLoading(true);
    try {
      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('review_date', { ascending: false })
        .limit(100);
      
      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
      } else if (reviewsData) {
        setReviews(reviewsData);
        setStats(calculateStats(reviewsData));
      }

      // Fetch review requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('review_requests')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (requestsError) {
        console.error('Error fetching review requests:', requestsError);
      } else if (requestsData) {
        setReviewRequests(requestsData);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentWorkspace?.id, currentSite?.id]);

  const sendReviewRequest = async (data: { name: string; email: string; phone?: string; gbp_profile_id: string }) => {
    if (!currentWorkspace?.id) {
      toast.error('Workspace non sélectionné');
      return;
    }

    const { error } = await supabase.from('review_requests').insert({
      workspace_id: currentWorkspace.id,
      gbp_profile_id: data.gbp_profile_id,
      customer_name: data.name,
      customer_email: data.email,
      customer_phone: data.phone || null,
      channel: 'email',
      review_received: false,
    });

    if (error) {
      toast.error('Erreur lors de l\'envoi');
      throw error;
    }

    toast.success('Demande d\'avis envoyée');
    await fetchData();
  };

  const respondToReview = async (reviewId: string, response: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({ 
        reply: response, 
        replied_at: new Date().toISOString(),
        requires_attention: false
      })
      .eq('id', reviewId);

    if (error) {
      toast.error('Erreur lors de la réponse');
      throw error;
    }

    toast.success('Réponse enregistrée');
    await fetchData();
  };

  return (
    <ReputationContext.Provider value={{
      reviews,
      reviewRequests,
      stats,
      loading,
      sendReviewRequest,
      respondToReview,
      refreshData: fetchData,
    }}>
      {children}
    </ReputationContext.Provider>
  );
}

export function useReputation() {
  const context = useContext(ReputationContext);
  if (context === undefined) {
    throw new Error('useReputation must be used within a ReputationProvider');
  }
  return context;
}
