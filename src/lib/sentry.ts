// Sentry Error Monitoring Configuration
// Initializes Sentry with privacy-first settings (no PII)

import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

// Check if Sentry should be initialized
export const isSentryEnabled = !!SENTRY_DSN;

/**
 * Initialize Sentry with privacy-conscious settings
 * - No emails or PII in events
 * - Low sample rates to avoid performance impact
 * - Environment-aware configuration
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    if (import.meta.env.DEV) {
      console.info("[Sentry] DSN not configured - monitoring disabled in development");
    }
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env.PROD ? "production" : "development",
      release: `growth-os@${import.meta.env.VITE_APP_VERSION || "1.0.0"}`,
      
      // Performance monitoring - 10% sample rate
      tracesSampleRate: 0.1,
      
      // Session replay for errors - 10% sample rate
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.1,
      
      // Privacy: scrub sensitive data before sending
      beforeSend(event) {
        // Remove any email addresses from the event
        if (event.user?.email) {
          delete event.user.email;
        }
        
        // Scrub emails from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((crumb) => {
            if (crumb.data) {
              const data = { ...crumb.data };
              // Remove email fields
              delete data.email;
              delete data.user_email;
              // Remove tokens
              delete data.token;
              delete data.access_token;
              delete data.refresh_token;
              crumb.data = data;
            }
            return crumb;
          });
        }
        
        // Scrub emails from exception messages
        if (event.exception?.values) {
          event.exception.values = event.exception.values.map((ex) => {
            if (ex.value) {
              // Replace email patterns with [REDACTED]
              ex.value = ex.value.replace(
                /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
                "[EMAIL_REDACTED]"
              );
            }
            return ex;
          });
        }
        
        return event;
      },
      
      // Ignore specific errors
      ignoreErrors: [
        // Network errors that are expected
        "Failed to fetch",
        "NetworkError",
        "Load failed",
        // Auth redirects (normal flow)
        "AuthSessionMissingError",
        // Browser extensions
        "ResizeObserver loop limit exceeded",
      ],
      
      // Limit breadcrumbs for performance
      maxBreadcrumbs: 50,
      
      // Attach stack traces to all events
      attachStacktrace: true,
    });

    console.info("[Sentry] Initialized successfully");
  } catch (error) {
    console.warn("[Sentry] Failed to initialize:", error);
  }
}

/**
 * Set the current user for Sentry (ID only, no PII)
 */
export function setSentryUser(userId: string | null): void {
  if (!isSentryEnabled) return;
  
  if (userId) {
    Sentry.setUser({ id: userId });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Capture an exception with optional context
 */
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>
): string | undefined {
  if (!isSentryEnabled) {
    console.error("[Error]", error);
    return undefined;
  }
  
  return Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message with optional level
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info"
): void {
  if (!isSentryEnabled) {
    console.log(`[${level}]`, message);
    return;
  }
  
  Sentry.captureMessage(message, level);
}

/**
 * Add a breadcrumb for navigation or actions
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  if (!isSentryEnabled) return;
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Set a tag for filtering in Sentry
 */
export function setTag(key: string, value: string): void {
  if (!isSentryEnabled) return;
  Sentry.setTag(key, value);
}

// Re-export Sentry for advanced usage
export { Sentry };
