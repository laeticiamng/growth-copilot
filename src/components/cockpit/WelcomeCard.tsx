import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Download, Sparkles, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  const greeting = getGreeting();
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <CardContent className="relative pt-6 pb-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="text-5xl">{agentAvatar}</div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-3 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-chart-3 border-2 border-background" />
            </span>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className="font-bold text-lg">{agentName}</h2>
              <Badge variant="outline" className="text-xs font-normal">
                <Bot className="w-3 h-3 mr-1" />
                {agentRole}
              </Badge>
            </div>
            
            <p className="text-muted-foreground">
              {greeting} Voici l'état de{" "}
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
            </p>
            
            {/* Sync Info */}
            {lastSync && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Dernière synchronisation : {format(lastSync, "dd MMM à HH:mm", { locale: fr })}
              </div>
            )}
          </div>
          
          {/* Export Button */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="shrink-0">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          )}
        </div>
        
        {/* Quick Stats Bar */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <QuickStat 
                icon={<Sparkles className="w-4 h-4 text-primary" />}
                label="Agents actifs"
                value="39"
              />
              <QuickStat 
                icon={<span className="text-sm">📊</span>}
                label="Départements"
                value="11"
              />
              <QuickStat 
                icon={<span className="text-sm">⚡</span>}
                label="Disponibilité"
                value="24/7"
              />
            </div>
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour !";
  if (hour < 18) return "Bon après-midi !";
  return "Bonsoir !";
}
