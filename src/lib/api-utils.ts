import { supabase } from "@/integrations/supabase/client";

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

interface ApiResult<T> {
  data: T | null;
  error: Error | null;
  attempts: number;
}

/**
 * Execute a Supabase query with automatic retry logic
 */
export async function withRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: unknown }>,
  options: RetryOptions = {}
): Promise<ApiResult<T>> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error | null = null;
  let attempts = 0;

  for (let i = 0; i <= maxRetries; i++) {
    attempts++;
    try {
      const result = await queryFn();
      
      if (result.error) {
        throw result.error;
      }
      
      return { data: result.data, error: null, attempts };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain errors
      if (isNonRetryableError(lastError)) {
        break;
      }
      
      if (i < maxRetries) {
        const delay = backoff ? delayMs * Math.pow(2, i) : delayMs;
        onRetry?.(i + 1, lastError);
        await sleep(delay);
      }
    }
  }

  return { data: null, error: lastError, attempts };
}

/**
 * Execute a Supabase edge function with retry logic
 */
export async function invokeWithRetry<T>(
  functionName: string,
  body: Record<string, unknown>,
  options: RetryOptions = {}
): Promise<ApiResult<T>> {
  return withRetry<T>(
    async () => {
      const result = await supabase.functions.invoke(functionName, { body });
      if (result.error) {
        throw result.error;
      }
      return { data: result.data as T, error: null };
    },
    options
  );
}

/**
 * Check if an error should not be retried
 */
function isNonRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('not found') ||
    message.includes('validation') ||
    message.includes('invalid')
  );
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Error logger that logs to console in dev and could send to monitoring in prod
 */
export function logError(
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  const logData = {
    context,
    message: errorObj.message,
    stack: errorObj.stack,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  console.error(`[Error: ${context}]`, logData);

  // In production, could send to monitoring service
  if (import.meta.env.PROD) {
    // Could integrate with Sentry, LogRocket, etc.
    // sendToMonitoring(logData);
  }
}

/**
 * Create a user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return "Problème de connexion. Vérifiez votre réseau et réessayez.";
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return "Session expirée. Veuillez vous reconnecter.";
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return "Vous n'avez pas les permissions nécessaires.";
    }
    if (message.includes('not found') || message.includes('404')) {
      return "La ressource demandée n'existe pas.";
    }
    if (message.includes('timeout')) {
      return "La requête a pris trop de temps. Réessayez.";
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return "Les données saisies sont invalides.";
    }
    if (message.includes('conflict') || message.includes('duplicate')) {
      return "Cette ressource existe déjà.";
    }
  }
  
  return "Une erreur inattendue s'est produite. Réessayez plus tard.";
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Create an offline-aware wrapper for API calls
 */
export async function withOfflineCheck<T>(
  fn: () => Promise<T>,
  offlineMessage = "Vous êtes hors ligne. Connectez-vous pour continuer."
): Promise<T> {
  if (!isOnline()) {
    throw new Error(offlineMessage);
  }
  return fn();
}
