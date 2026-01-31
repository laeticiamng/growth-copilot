import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Clock, RefreshCw, AlertTriangle } from "lucide-react";

interface MetaModuleCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  status: "connected" | "configured" | "disconnected" | "coming_soon";
  lastSync?: string | null;
  stats?: { label: string; value: string | number }[];
  onSync?: () => void;
  syncing?: boolean;
  note?: string;
}

export function MetaModuleCard({
  title,
  description,
  icon: Icon,
  status,
  lastSync,
  stats,
  onSync,
  syncing,
  note,
}: MetaModuleCardProps) {
  const isActive = status === "connected" || status === "configured";
  const isComingSoon = status === "coming_soon";

  const formatLastSync = (date: string | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `il y a ${diffHours}h`;
    return d.toLocaleDateString("fr-FR");
  };

  return (
    <Card 
      className={`${isActive ? "border-primary/30 bg-primary/5" : isComingSoon ? "opacity-60" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${isActive ? "bg-primary/20" : "bg-muted"}`}>
            <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm">{title}</h4>
              <Badge 
                variant={isActive ? "success" : isComingSoon ? "outline" : "secondary"}
                className="text-xs"
              >
                {status === "connected" && <><Check className="w-3 h-3 mr-1" />Connecté</>}
                {status === "configured" && <><Check className="w-3 h-3 mr-1" />Configuré</>}
                {status === "disconnected" && <><Clock className="w-3 h-3 mr-1" />Non connecté</>}
                {status === "coming_soon" && <><Clock className="w-3 h-3 mr-1" />Bientôt</>}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            
            {note && (
              <div className="flex items-start gap-1.5 text-xs text-warning bg-warning/10 p-2 rounded mb-2">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{note}</span>
              </div>
            )}
            
            {stats && stats.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-2">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="text-muted-foreground">{stat.label}:</span>{" "}
                    <span className="font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2">
              {lastSync && (
                <span className="text-xs text-muted-foreground">
                  Sync: {formatLastSync(lastSync)}
                </span>
              )}
              
              {onSync && isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSync}
                  disabled={syncing}
                  className="h-7 text-xs"
                >
                  {syncing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Sync
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
