import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type { ReactNode } from "react";

/**
 * Non-blocking guard: logs a warning if Supabase env vars are missing
 * but always renders children. ProtectedRoute handles auth redirection.
 */
export function EnvGuard({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured) {
    console.warn(
      '[Growth OS] Supabase environment variables are missing. ' +
      'Backend features will be unavailable. ' +
      'In Lovable Cloud, these are injected automatically.'
    );
  }

  return <>{children}</>;
}
