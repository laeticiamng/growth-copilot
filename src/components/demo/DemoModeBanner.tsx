import { forwardRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDemoMode } from "@/hooks/useDemoMode";
import { TestTube2, Rocket, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const DemoModeBanner = forwardRef<HTMLDivElement>(function DemoModeBanner(_props, ref) {
  const { isDemoMode, deactivateDemo } = useDemoMode();
  const { t } = useTranslation();

  if (!isDemoMode) return null;

  return (
    <div ref={ref} className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-chart-4 to-chart-5 text-white py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-3 shadow-lg">
      <TestTube2 className="w-4 h-4 shrink-0" />
      <span>
        {t("demo.bannerMessage", "Sandbox Mode — Explore the dashboard with demo data")}
      </span>
      <Link to="/auth">
        <Button size="sm" variant="secondary" className="h-7 gap-1 text-xs font-semibold">
          <Rocket className="w-3 h-3" />
          {t("demo.createAccount", "Create free account")}
        </Button>
      </Link>
      <button
        onClick={deactivateDemo}
        className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

export const DemoModeWatermark = forwardRef<HTMLDivElement>(function DemoModeWatermark(_props, ref) {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-40 pointer-events-none">
      <Badge variant="outline" className="bg-chart-4/20 text-chart-4 border-chart-4/50 text-lg px-4 py-2">
        <TestTube2 className="w-5 h-5 mr-2" />
        SANDBOX
      </Badge>
    </div>
  );
});
