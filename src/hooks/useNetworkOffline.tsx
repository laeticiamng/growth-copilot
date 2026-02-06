import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import i18next from 'i18next';

/**
 * Enhanced network status hook with retry logic
 */
export function useNetworkOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setRetryCount(0);
      toast.success(i18next.t("hooks.network.connectionRestored"), {
        description: i18next.t("hooks.network.connectionRestoredDesc"),
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error(i18next.t("hooks.network.connectionLost"), {
        description: i18next.t("hooks.network.connectionLostDesc"),
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retry = useCallback(async <T,>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await fn();
        setRetryCount(0);
        return result;
      } catch (error) {
        lastError = error as Error;
        setRetryCount(attempt + 1);
        
        if (attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }, []);

  return { isOnline, retryCount, retry };
}
