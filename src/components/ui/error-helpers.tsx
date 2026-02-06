import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isOnline } from '@/lib/api-utils';
import { useTranslation } from 'react-i18next';

/**
 * Hook to monitor online/offline status
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}

/**
 * Generic error display component
 */
interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title,
  message,
  onRetry,
  className = "",
}: ErrorDisplayProps) {
  const { t } = useTranslation();
  const displayTitle = title || t('errors.generic', 'An error occurred');
  const displayMessage = message || t('errors.tryAgainLater', 'Please try again later.');

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="p-3 rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="font-semibold mb-2">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">{displayMessage}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('errors.tryAgain', 'Try again')}
        </Button>
      )}
    </div>
  );
}

/**
 * Empty state component
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon && (
        <div className="p-3 rounded-full bg-muted mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>
      )}
      {action}
    </div>
  );
}
