import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus(false);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground py-2 px-4">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm">
        <WifiOff className="w-4 h-4" />
        <span>Vous êtes hors ligne. Certaines fonctionnalités peuvent être indisponibles.</span>
      </div>
    </div>
  );
}