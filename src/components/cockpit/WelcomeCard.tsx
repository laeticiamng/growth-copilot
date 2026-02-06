import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Download, Sparkles, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

interface WelcomeCardProps {
  agentName: string;
  agentRole: string;
  agentAvatar: string;
  siteName: string;
  pendingCount: number;
  lastSync?: Date;
  onExport?: () => void;
  className?: string;
}

export function WelcomeCard({
  agentName,
  agentRole,
  agentAvatar,
  siteName,
  pendingCount,
  lastSync,
  onExport,
  className,
}: WelcomeCardProps) {
  const { t, i18n } = useTranslation();
  const greeting = getGreeting(i18n.language);
  const dateLocale = i18n.language === 'fr' ? fr : enUS;
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <CardContent className="relative pt-6 pb-5">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="text-4xl sm:text-5xl">{agentAvatar}</div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3 sm:h-4 sm:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-3 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-chart-3 border-2 border-background" />
            </span>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h2 className="font-bold text-base sm:text-lg">{agentName}</h2>
              <Badge variant="outline" className="text-xs font-normal whitespace-nowrap">
                <Bot className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{agentRole}</span>
              </Badge>
            </div>
            
            <p className="text-muted-foreground">
              {greeting}{" "}
              {i18n.language === 'fr' ? (
                <>
                  Voici l'état de{" "}
                  <span className="font-medium text-foreground">{siteName}</span>.{" "}
                  {pendingCount > 0 ? (
                    <span>
                      Vous avez{" "}
                      <span className="font-semibold text-primary">
                        {pendingCount} décision{pendingCount > 1 ? "s" : ""}
                      </span>{" "}
                      en attente de validation.
                    </span>
                  ) : (
                    <span className="text-chart-3">Tout est à jour, aucune action requise.</span>
                  )}
                </>
              ) : (
                <>
                  Here's the status of{" "}
                  <span className="font-medium text-foreground">{siteName}</span>.{" "}
                  {pendingCount > 0 ? (
                    <span>
                      You have{" "}
                      <span className="font-semibold text-primary">
                        {pendingCount} decision{pendingCount > 1 ? "s" : ""}
                      </span>{" "}
                      pending approval.
                    </span>
                  ) : (
                    <span className="text-chart-3">All up to date, no action required.</span>
                  )}
                </>
              )}
            </p>
            
            {/* Sync Info */}
            {lastSync && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {i18n.language === 'fr' 
                  ? `Dernière synchronisation : ${format(lastSync, "dd MMM à HH:mm", { locale: dateLocale })}`
                  : `Last sync: ${format(lastSync, "MMM dd at HH:mm", { locale: dateLocale })}`
                }
              </div>
            )}
          </div>
          
          {/* Export Button */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="shrink-0">
              <Download className="w-4 h-4 mr-2" />
              {t("common.export")}
            </Button>
          )}
        </div>
        
        {/* Quick Stats Bar */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <QuickStat 
              icon={<Sparkles className="w-4 h-4 text-primary flex-shrink-0" />}
              label={i18n.language === 'fr' ? "Agents actifs" : "Active agents"}
              value="39"
            />
            <QuickStat 
              icon={<span className="text-sm flex-shrink-0">📊</span>}
              label={i18n.language === 'fr' ? "Départements" : "Departments"}
              value="11"
            />
            <QuickStat 
              icon={<span className="text-sm flex-shrink-0">⚡</span>}
              label={i18n.language === 'fr' ? "Disponibilité" : "Availability"}
              value="24/7"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStat({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

function getGreeting(lang: string): string {
  const hour = new Date().getHours();
  if (lang === 'fr') {
    if (hour < 12) return "Bonjour !";
    if (hour < 18) return "Bon après-midi !";
    return "Bonsoir !";
  } else {
    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";
    return "Good evening!";
  }
}
