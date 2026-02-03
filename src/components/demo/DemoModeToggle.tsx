import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDemoMode } from "@/hooks/useDemoMode";
import { TestTube2, Radio } from "lucide-react";

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-secondary/50">
      <div className="flex items-center gap-3">
        {isDemoMode ? (
          <TestTube2 className="w-5 h-5 text-yellow-500" />
        ) : (
          <Radio className="w-5 h-5 text-green-500" />
        )}
        <div>
          <Label htmlFor="demo-mode" className="font-medium cursor-pointer">
            {isDemoMode ? "Mode Démo" : "Mode Production"}
          </Label>
          <p className="text-xs text-muted-foreground">
            {isDemoMode 
              ? "Données fictives pour la démonstration" 
              : "Données réelles de votre workspace"
            }
          </p>
        </div>
      </div>
      <Switch 
        id="demo-mode" 
        checked={isDemoMode} 
        onCheckedChange={toggleDemoMode}
      />
    </div>
  );
}
