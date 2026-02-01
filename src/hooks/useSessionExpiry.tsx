import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface SessionExpiryOptions {
  warningMinutes?: number;
  onExpirySoon?: () => void;
  onExpired?: () => void;
}

/**
 * Hook to monitor session expiry and show warnings
 * Default warning: 5 minutes before expiry
 */
export function useSessionExpiry(options: SessionExpiryOptions = {}) {
  const { warningMinutes = 5, onExpirySoon, onExpired } = options;
  const { session, user } = useAuth();
  const { toast } = useToast();
  const warningShownRef = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkExpiry = useCallback(() => {
    if (!session?.expires_at) return;

    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60);

    // Session already expired
    if (minutesUntilExpiry <= 0) {
      if (onExpired) {
        onExpired();
      } else {
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter pour continuer.",
          variant: "destructive",
        });
      }
      return;
    }

    // Session expiring soon
    if (minutesUntilExpiry <= warningMinutes && !warningShownRef.current) {
      warningShownRef.current = true;
      
      if (onExpirySoon) {
        onExpirySoon();
      } else {
        toast({
          title: "Session expire bientôt",
          description: `Votre session expire dans ${Math.ceil(minutesUntilExpiry)} minute(s). Sauvegardez votre travail.`,
          variant: "default",
        });
      }
    }

    // Reset warning flag if session was refreshed
    if (minutesUntilExpiry > warningMinutes) {
      warningShownRef.current = false;
    }
  }, [session?.expires_at, warningMinutes, onExpirySoon, onExpired, toast]);

  // Set up session change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'TOKEN_REFRESHED') {
        warningShownRef.current = false;
        console.log('[Session] Token refreshed, expiry warning reset');
      }
      
      if (event === 'SIGNED_OUT') {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check expiry periodically
  useEffect(() => {
    if (!user || !session) return;

    // Initial check
    checkExpiry();

    // Check every minute
    checkIntervalRef.current = setInterval(checkExpiry, 60 * 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [user, session, checkExpiry]);

  // Manual session refresh
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('[Session] Refresh failed:', error);
        return { error };
      }
      
      warningShownRef.current = false;
      console.log('[Session] Manually refreshed');
      return { data, error: null };
    } catch (err) {
      console.error('[Session] Refresh exception:', err);
      return { error: err as Error };
    }
  }, []);

  return {
    refreshSession,
    expiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : null,
    isAuthenticated: !!user,
  };
}
