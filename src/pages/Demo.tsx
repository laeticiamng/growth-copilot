import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "@/hooks/useDemoMode";
import { LoadingState } from "@/components/ui/loading-state";

/**
 * /demo route — Activates demo mode and redirects to dashboard
 * Uses two-step effect to avoid race condition:
 * 1. First effect activates demo mode
 * 2. Second effect waits for isDemoMode=true before navigating
 */
export default function Demo() {
  const { isDemoMode, activateDemo } = useDemoMode();
  const navigate = useNavigate();

  // Step 1: Activate demo mode on mount
  useEffect(() => {
    activateDemo();
  }, [activateDemo]);

  // Step 2: Navigate only once isDemoMode is confirmed true
  useEffect(() => {
    if (isDemoMode) {
      navigate("/dashboard", { replace: true });
    }
  }, [isDemoMode, navigate]);

  return <LoadingState message="Activation du mode démo..." />;
}
