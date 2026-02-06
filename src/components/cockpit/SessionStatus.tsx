import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Clock, RefreshCw, LogOut, Shield, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSessionExpiry } from "@/hooks/useSessionExpiry";
import { formatDistanceToNow } from "date-fns";
import { getDateLocale } from "@/lib/date-locale";

interface SessionStatusProps {
  compact?: boolean;
  showActions?: boolean;
}

export function SessionStatus({ compact = false, showActions = true }: SessionStatusProps) {
  const { t, i18n } = useTranslation();
  const { user, session, signOut } = useAuth();
  const { expiresAt, refreshSession } = useSessionExpiry();
  const isExpiringSoon = expiresAt ? (expiresAt.getTime() - Date.now()) < 5 * 60 * 1000 : false;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const locale = getDateLocale(i18n.language);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!session || !user) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="w-4 h-4" />
        <span className="text-sm">{t("cockpit.sessionNotConnected")}</span>
      </div>
    );
  }

  const sessionExpiresAt = expiresAt ? expiresAt : null;
  const timeLeft = sessionExpiresAt
    ? formatDistanceToNow(sessionExpiresAt, { locale, addSuffix: false })
    : null;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-destructive" />}
              <Badge variant={isExpiringSoon ? "secondary" : "success"} className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                {isExpiringSoon ? t("cockpit.sessionExpiringSoon") : t("cockpit.sessionActive")}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 text-xs">
              <p>{user.email}</p>
              {timeLeft && <p>{t("cockpit.sessionExpiresIn", { time: timeLeft })}</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-secondary/50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${isOnline ? "bg-green-500" : "bg-destructive"}`} />
        </div>
        <div>
          <p className="font-medium text-sm truncate max-w-[180px]">{user.email}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {timeLeft ? (
              <span className={isExpiringSoon ? "text-amber-500" : ""}>
                {t("cockpit.sessionExpiresIn", { time: timeLeft })}
              </span>
            ) : (
              <span>{t("cockpit.sessionActive")}</span>
            )}
          </div>
        </div>
      </div>
      
      {showActions && (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshSession}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("cockpit.sessionRenew")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => signOut()}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("cockpit.sessionLogout")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
