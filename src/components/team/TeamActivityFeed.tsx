import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Settings,
  Users,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ActivityItem {
  id: string;
  actorType: "user" | "agent" | "system";
  actorName: string;
  actorAvatar?: string;
  action: string;
  target?: string;
  targetType?: string;
  result?: "success" | "error" | "warning" | "pending";
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface TeamActivityFeedProps {
  activities?: ActivityItem[];
  maxItems?: number;
  showHeader?: boolean;
  compact?: boolean;
}

const DEMO_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    actorType: "agent",
    actorName: "Sophie Marchand",
    action: "a généré un plan de croissance",
    target: "Q1 2026",
    result: "success",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "2",
    actorType: "user",
    actorName: "Jean Dupont",
    action: "a approuvé",
    target: "Campagne Meta Ads",
    targetType: "approval",
    result: "success",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: "3",
    actorType: "agent",
    actorName: "Emma Lefebvre",
    action: "a terminé l'audit SEO",
    target: "exemple.fr",
    result: "warning",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    metadata: { issues: 12 },
  },
  {
    id: "4",
    actorType: "system",
    actorName: "Système",
    action: "a synchronisé",
    target: "Google Search Console",
    result: "success",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: "5",
    actorType: "agent",
    actorName: "Thomas Duval",
    action: "a échoué à publier",
    target: "Article blog",
    result: "error",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
];

export function TeamActivityFeed({ 
  activities = DEMO_ACTIVITIES, 
  maxItems = 10,
  showHeader = true,
  compact = false,
}: TeamActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  const getActorIcon = (actorType: ActivityItem['actorType']) => {
    switch (actorType) {
      case 'agent':
        return <Bot className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getResultIcon = (result?: ActivityItem['result']) => {
    switch (result) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getActorBadge = (actorType: ActivityItem['actorType']) => {
    switch (actorType) {
      case 'agent':
        return (
          <Badge variant="secondary" className="text-xs gap-1">
            <Bot className="w-3 h-3" />
            Agent IA
          </Badge>
        );
      case 'system':
        return (
          <Badge variant="outline" className="text-xs gap-1">
            <Zap className="w-3 h-3" />
            Système
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { locale: fr, addSuffix: true });
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {displayActivities.slice(0, 5).map((activity) => (
          <div key={activity.id} className="flex items-center gap-2 text-sm">
            {getResultIcon(activity.result)}
            <span className="font-medium">{activity.actorName}</span>
            <span className="text-muted-foreground">{activity.action}</span>
            {activity.target && (
              <span className="font-medium truncate">{activity.target}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card variant="feature">
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Activité de l'équipe
          </CardTitle>
          <CardDescription>
            Actions récentes des utilisateurs et agents IA
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "" : "pt-6"}>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {displayActivities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.actorType === 'agent' ? 'bg-primary/10 text-primary' :
                    activity.actorType === 'system' ? 'bg-secondary text-muted-foreground' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {activity.actorAvatar ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activity.actorAvatar} />
                        <AvatarFallback>{activity.actorName[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      getActorIcon(activity.actorType)
                    )}
                  </div>
                  {index < displayActivities.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-2" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{activity.actorName}</span>
                        {getActorBadge(activity.actorType)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {activity.action}
                        {activity.target && (
                          <span className="font-medium text-foreground"> {activity.target}</span>
                        )}
                      </p>
                      {activity.metadata && (
                        <div className="mt-2">
                          {activity.metadata.issues && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.metadata.issues as number} problèmes détectés
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getResultIcon(activity.result)}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {displayActivities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune activité récente</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
