/**
 * Shared logging utilities for edge functions
 * Structured logging with context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  function_name?: string;
  workspace_id?: string;
  user_id?: string;
  request_id?: string;
  [key: string]: unknown;
}

/**
 * Create a structured logger for an edge function
 */
export function createLogger(functionName: string) {
  const requestId = crypto.randomUUID();

  const log = (level: LogLevel, message: string, context: LogContext = {}) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      function: functionName,
      request_id: requestId,
      message,
      ...context,
    };

    const formatted = JSON.stringify(entry);

    switch (level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }

    return entry;
  };

  return {
    requestId,
    debug: (message: string, context?: LogContext) => log('debug', message, context),
    info: (message: string, context?: LogContext) => log('info', message, context),
    warn: (message: string, context?: LogContext) => log('warn', message, context),
    error: (message: string, context?: LogContext) => log('error', message, context),
    
    /**
     * Log function start
     */
    start: (context?: LogContext) => {
      return log('info', 'Function invoked', { ...context, event: 'start' });
    },

    /**
     * Log successful completion
     */
    success: (duration_ms: number, context?: LogContext) => {
      return log('info', 'Function completed successfully', { 
        ...context, 
        event: 'success',
        duration_ms,
      });
    },

    /**
     * Log error with stack trace
     */
    exception: (error: Error | unknown, context?: LogContext) => {
      const errorContext = error instanceof Error 
        ? { error_name: error.name, error_message: error.message, stack: error.stack }
        : { error_message: String(error) };
      
      return log('error', 'Function failed with exception', { 
        ...context, 
        ...errorContext,
        event: 'exception',
      });
    },
  };
}

/**
 * Measure execution time
 */
export function measureTime<T>(
  fn: () => T | Promise<T>,
  logger: ReturnType<typeof createLogger>,
  label: string
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  
  return Promise.resolve(fn())
    .then(result => {
      const durationMs = Math.round(performance.now() - start);
      logger.debug(`${label} completed`, { duration_ms: durationMs });
      return { result, durationMs };
    })
    .catch(error => {
      const durationMs = Math.round(performance.now() - start);
      logger.error(`${label} failed`, { duration_ms: durationMs, error: String(error) });
      throw error;
    });
}
