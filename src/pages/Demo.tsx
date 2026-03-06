import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDemoMode } from "@/hooks/useDemoMode";
import { LoadingState } from "@/components/ui/loading-state";

/**
 * /demo route — Activates demo mode and redirects to dashboard
 * Uses declarative <Navigate> to avoid race condition:
 * 1. Effect activates demo mode
 * 2. Once isDemoMode is true (context propagated), renders <Navigate>
 */
export default function Demo() {
  const { isDemoMode, activateDemo } = useDemoMode();

  // Activate demo mode on mount
  useEffect(() => {
    if (!isDemoMode) {
      activateDemo();
    }
  }, [isDemoMode, activateDemo]);

  // Declarative navigation — only renders when context has propagated isDemoMode=true
  if (isDemoMode) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoadingState message="Activation du mode démo..." />;
}
