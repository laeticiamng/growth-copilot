import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  effectiveType: string | null; // '4g', '3g', '2g', 'slow-2g'
  downlink: number | null; // Mbps
  rtt: number | null; // Round trip time in ms
}

/**
 * Hook for monitoring network connectivity status
 * Provides online/offline detection and connection quality info
 */
export function useNetworkStatus(showToasts: boolean = true): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    effectiveType: null,
    downlink: null,
    rtt: null,
  });

  const updateNetworkInfo = useCallback(() => {
    // @ts-expect-error - Network Information API not fully typed
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      setStatus(prev => ({
        ...prev,
        effectiveType: connection.effectiveType || null,
        downlink: connection.downlink || null,
        rtt: connection.rtt || null,
      }));
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => {
        if (prev.wasOffline && showToasts) {
          toast.success('Connexion rétablie', {
            description: 'Vous êtes de nouveau en ligne',
          });
        }
        return { ...prev, isOnline: true };
      });
      updateNetworkInfo();
    };

    const handleOffline = () => {
      setStatus(prev => {
        if (showToasts) {
          toast.error('Connexion perdue', {
            description: 'Vérifiez votre connexion internet',
            duration: Infinity,
            id: 'offline-toast',
          });
        }
        return { ...prev, isOnline: false, wasOffline: true };
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen to connection changes
    // @ts-expect-error - Network Information API not fully typed
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    // Initial check
    updateNetworkInfo();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [showToasts, updateNetworkInfo]);

  return status;
}

/**
 * Hook to wrap async operations with offline detection
 */
export function useOnlineAction<T extends (...args: unknown[]) => Promise<unknown>>(
  action: T,
  offlineMessage: string = 'Cette action nécessite une connexion internet'
): T {
  const { isOnline } = useNetworkStatus(false);

  const wrappedAction = useCallback(
    (async (...args: Parameters<T>) => {
      if (!isOnline) {
        toast.error('Hors ligne', { description: offlineMessage });
        throw new Error('Offline');
      }
      return action(...args);
    }) as T,
    [isOnline, action, offlineMessage]
  );

  return wrappedAction;
}
