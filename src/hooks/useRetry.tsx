import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

interface RetryState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  attempt: number;
}

/**
 * Hook for retrying failed async operations with configurable backoff
 */
export function useRetry<T>() {
  const [state, setState] = useState<RetryState<T>>({
    data: null,
    error: null,
    loading: false,
    attempt: 0,
  });

  const execute = useCallback(async (
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T | null> => {
    const {
      maxRetries = 3,
      delayMs = 1000,
      backoff = 'exponential',
      onRetry,
    } = options;

    setState(prev => ({ ...prev, loading: true, error: null, attempt: 0 }));

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setState(prev => ({ ...prev, attempt }));
        const result = await fn();
        setState({ data: result, error: null, loading: false, attempt });
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          onRetry?.(attempt + 1, lastError);
          
          const delay = backoff === 'exponential'
            ? delayMs * Math.pow(2, attempt)
            : delayMs * (attempt + 1);
            
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    setState({ data: null, error: lastError, loading: false, attempt: maxRetries });
    return null;
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false, attempt: 0 });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Utility function for one-off retry operations
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = 'exponential',
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        onRetry?.(attempt + 1, lastError);
        
        const delay = backoff === 'exponential'
          ? delayMs * Math.pow(2, attempt)
          : delayMs * (attempt + 1);
          
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
