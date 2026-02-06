import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Download, Sparkles, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS, es, de, it, pt, nl } from "date-fns/locale";

const dateLocaleMap: Record<string, typeof enUS> = { fr, en: enUS, es, de, it, pt, nl };

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
  const greeting = getGreeting(t);
  const dateLocale = dateLocaleMap[i18n.language] || enUS;
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <CardContent className="relative pt-6 pb-5">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="text-4xl sm:text-5xl">{agentAvatar}</div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3 sm:h-4 sm:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-3 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-chart-3 border-2 border-background" />
            </span>
          </div>
          
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
              {t("cockpit.welcomeStatusOf")}{" "}
              <span className="font-medium text-foreground">{siteName}</span>.{" "}
              {pendingCount > 0 ? (
                <span className="font-semibold text-primary">
                  {t("cockpit.welcomeDecisionsPending", { count: pendingCount })}
                </span>
              ) : (
                <span className="text-chart-3">{t("cockpit.welcomeAllUpToDate")}</span>
              )}
            </p>
            
            {lastSync && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {t("cockpit.welcomeLastSync", { 
                  date: format(lastSync, i18n.language === 'fr' ? "dd MMM 'à' HH:mm" : "MMM dd 'at' HH:mm", { locale: dateLocale })
                })}
              </div>
            )}
          </div>
          
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="shrink-0">
              <Download className="w-4 h-4 mr-2" />
              {t("common.export")}
            </Button>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <QuickStat 
              icon={<Sparkles className="w-4 h-4 text-primary flex-shrink-0" />}
              label={t("cockpit.welcomeActiveAgents")}
              value="39"
            />
            <QuickStat 
              icon={<span className="text-sm flex-shrink-0">📊</span>}
              label={t("cockpit.welcomeDepartments")}
              value="11"
            />
            <QuickStat 
              icon={<span className="text-sm flex-shrink-0">⚡</span>}
              label={t("cockpit.welcomeAvailability")}
              value="24/7"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("cockpit.welcomeGreetingMorning");
  if (hour < 18) return t("cockpit.welcomeGreetingAfternoon");
  return t("cockpit.welcomeGreetingEvening");
}
