import { Badge } from "@/components/ui/badge";
import { useDemoMode } from "@/hooks/useDemoMode";
import { TestTube2 } from "lucide-react";

export function DemoModeBanner() {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-950 py-1 px-4 text-center text-sm font-medium flex items-center justify-center gap-2">
      <TestTube2 className="w-4 h-4" />
      Mode Démo — Les données affichées sont fictives
    </div>
  );
}

export function DemoModeWatermark() {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 pointer-events-none">
      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/50 text-lg px-4 py-2">
        <TestTube2 className="w-5 h-5 mr-2" />
        DEMO
      </Badge>
    </div>
  );
}
