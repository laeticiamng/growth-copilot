/**
 * Enhanced Activity Feed Component
 * Displays a chronological feed of all workspace actions with avatars and relative time
 */
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Bot,
  Filter,
  Loader2,
  RefreshCw,
  FileText,
  Zap,
  Search,
  TrendingUp,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { formatDistanceToNow } from "date-fns";
import { getDateLocale } from "@/lib/date-locale";

interface ActivityItem {
  id: string;
  actor_type: string;
  actor_id: string | null;
  actor_name?: string;
  action_type: string;
  action_category: string | null;
  description: string;
  details: Record<string, unknown> | null;
  result: string | null;
  is_automated: boolean | null;
  entity_type: string | null;
  site_id: string | null;
  created_at: string;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  seo_audit: Search,
  content_generation: FileText,
  report_generated: TrendingUp,
  approval_requested: Clock,
  approval_granted: CheckCircle,
  approval_rejected: XCircle,
  automation_triggered: Zap,
  security_check: Shield,
  default: Activity,
};

const CATEGORY_COLORS: Record<string, string> = {
  marketing: "bg-emerald-500/10 text-emerald-500",
  operations: "bg-violet-500/10 text-violet-500",
  sales: "bg-blue-500/10 text-blue-500",
  governance: "bg-red-500/10 text-red-500",
  default: "bg-secondary text-muted-foreground",
};

const AGENT_NAMES: Record<string, string> = {
  seo_auditor: "Sophie Marchand",
  content_strategist: "Marie Dupont",
  analytics_agent: "Pierre Martin",
  meta_orchestrator: "Clara Bernard",
  cgo_agent: "Thomas Lefèvre",
  report_generator: "Julie Moreau",
  default: "Agent IA",
};

interface ActivityFeedProps {
  limit?: number;
  showFilters?: boolean;
  showLoadMore?: boolean;
  className?: string;
}

export function ActivityFeed({
  limit = 20,
  showFilters = true,
  showLoadMore = true,
  className,
}: ActivityFeedProps) {
  const { t, i18n } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const fetchActivities = useCallback(async (reset = false) => {
    if (!currentWorkspace?.id) return;
    
    const currentOffset = reset ? 0 : offset;
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let query = supabase
        .from("action_log")
        .select("*")
        .eq("workspace_id", currentWorkspace.id)
        .order("created_at", { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (agentFilter !== "all") {
        query = query.eq("actor_id", agentFilter);
      }
      if (categoryFilter !== "all") {
        query = query.eq("action_category", categoryFilter);
      }
      if (dateFilter !== "all") {
        const now = new Date();
        let dateThreshold: Date;
        switch (dateFilter) {
          case "today":
            dateThreshold = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            dateThreshold = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            dateThreshold = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            dateThreshold = new Date(0);
        }
        query = query.gte("created_at", dateThreshold.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const newActivities = (data || []) as ActivityItem[];
      
      if (reset) {
        setActivities(newActivities);
        setOffset(limit);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
        setOffset(prev => prev + limit);
      }
      
      setHasMore(newActivities.length === limit);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentWorkspace?.id, limit, offset, agentFilter, categoryFilter, dateFilter]);

  useEffect(() => {
    fetchActivities(true);
  }, [currentWorkspace?.id, agentFilter, categoryFilter, dateFilter]);

  const getActorInfo = (activity: ActivityItem) => {
    if (activity.is_automated || activity.actor_type === "agent") {
      const agentName = AGENT_NAMES[activity.actor_id || ""] || AGENT_NAMES.default;
      return {
        name: agentName,
        initials: agentName.split(" ").map(n => n[0]).join(""),
        isAgent: true,
      };
    }
    return {
      name: t("activity.you"),
      initials: "U",
      isAgent: false,
    };
  };

  const getActionIcon = (actionType: string) => {
    return ACTION_ICONS[actionType] || ACTION_ICONS.default;
  };

  const getCategoryColor = (category: string | null) => {
    return CATEGORY_COLORS[category || ""] || CATEGORY_COLORS.default;
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: getDateLocale(i18n.language) });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {t("activity.recentActivity")}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => fetchActivities(true)}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      {showFilters && (
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className="w-[140px]">
              <Bot className="w-3 h-3 mr-2" />
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("activity.allAgents")}</SelectItem>
              <SelectItem value="seo_auditor">Sophie (SEO)</SelectItem>
              <SelectItem value="content_strategist">Marie (Contenu)</SelectItem>
              <SelectItem value="analytics_agent">Pierre (Analytics)</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-3 h-3 mr-2" />
              <SelectValue placeholder={t("common.filter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("activity.allCategories")}</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="governance">Governance</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-3 h-3 mr-2" />
              <SelectValue placeholder={t("common.filter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("activity.all")}</SelectItem>
              <SelectItem value="today">{t("activity.today")}</SelectItem>
              <SelectItem value="week">{t("activity.last7Days")}</SelectItem>
              <SelectItem value="month">{t("activity.last30Days")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>{t("activity.noActivity")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const actor = getActorInfo(activity);
              const Icon = getActionIcon(activity.action_type);
              const categoryColor = getCategoryColor(activity.action_category);
              
              return (
                <div key={activity.id} className="flex gap-3 group">
                  <Avatar className={actor.isAgent ? "ring-2 ring-primary/30" : ""}>
                    <AvatarFallback className={actor.isAgent ? "bg-primary/10 text-primary" : "bg-secondary"}>
                      {actor.isAgent ? <Bot className="w-4 h-4" /> : actor.initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="text-sm">
                        <span className="font-medium">{actor.name}</span>
                        {" "}
                        <span className="text-muted-foreground">{activity.description}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(activity.created_at)}
                      </span>
                      {activity.action_category && (
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${categoryColor}`}>
                          {activity.action_category}
                        </Badge>
                      )}
                      {activity.result && (
                        <Badge 
                          variant={activity.result === "success" ? "default" : "destructive"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {activity.result === "success" ? t("activity.success") : t("activity.failure")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className={`p-1.5 rounded ${categoryColor}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {showLoadMore && hasMore && activities.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => fetchActivities(false)} disabled={loadingMore}>
              {loadingMore ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {t("activity.loadMore")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
