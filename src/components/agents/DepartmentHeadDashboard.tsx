 import { useState, useCallback, useMemo } from "react";
 import { useTranslation } from "react-i18next";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback } from "@/components/ui/avatar";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   Bot,
   Brain,
   Users,
   Activity,
   CheckCircle,
   AlertCircle,
   Clock,
   TrendingUp,
   TrendingDown,
   MessageSquare,
   PlayCircle,
   PauseCircle,
   Sparkles,
   Crown,
   Target,
   Briefcase,
   DollarSign,
   Lock,
   Package,
   Code2,
   Database,
   HeadphonesIcon,
   Shield,
   Scale,
   UserCheck,
   Building2,
 } from "lucide-react";
 import { useQuery, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useWorkspace } from "@/hooks/useWorkspace";
 import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
 import { useDepartmentAccess } from "@/hooks/useDepartmentAccess";
 import { cn } from "@/lib/utils";
 import { formatDistanceToNow } from "date-fns";
 import { getDateLocale } from "@/lib/date-locale";
 
 // Department heads configuration
 const DEPARTMENT_HEADS: Record<string, {
   name: string;
   role: string;
   icon: React.ComponentType<{ className?: string }>;
   color: string;
   bgColor: string;
   agents: string[];
 }> = {
   direction: {
     name: "Sophie Marchand",
     role: "Chief Growth Officer",
     icon: Crown,
     color: "from-violet-600 to-purple-500",
     bgColor: "bg-violet-50 dark:bg-violet-950/30",
     agents: ["chief_growth_officer", "quality_compliance"],
   },
   marketing: {
     name: "Emma Lefebvre",
     role: "Responsable Marketing",
     icon: Target,
     color: "from-emerald-600 to-green-500",
     bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
     agents: ["tech_auditor", "keyword_strategist", "content_builder", "local_optimizer", "social_manager"],
   },
   sales: {
     name: "David Petit",
     role: "Directeur Commercial",
     icon: Briefcase,
     color: "from-amber-600 to-orange-500",
     bgColor: "bg-amber-50 dark:bg-amber-950/30",
     agents: ["offer_architect", "sales_accelerator", "lifecycle_manager", "deal_closer"],
   },
   finance: {
     name: "Mathilde Legrand",
     role: "Directrice Financière",
     icon: DollarSign,
     color: "from-blue-600 to-cyan-500",
     bgColor: "bg-blue-50 dark:bg-blue-950/30",
     agents: ["revenue_analyst", "budget_optimizer", "billing_manager"],
   },
   security: {
     name: "Julien Moreau",
     role: "Directeur Sécurité",
     icon: Lock,
     color: "from-red-600 to-rose-500",
     bgColor: "bg-red-50 dark:bg-red-950/30",
     agents: ["security_auditor", "access_controller", "threat_monitor"],
   },
   product: {
     name: "Marie Leclerc",
     role: "Chef de Produit",
     icon: Package,
     color: "from-pink-600 to-fuchsia-500",
     bgColor: "bg-pink-50 dark:bg-pink-950/30",
     agents: ["feature_analyst", "ux_optimizer", "roadmap_planner", "backlog_manager"],
   },
   engineering: {
     name: "Maxime Perrin",
     role: "Responsable Technique",
     icon: Code2,
     color: "from-slate-600 to-gray-500",
     bgColor: "bg-slate-50 dark:bg-slate-950/30",
     agents: ["code_reviewer", "performance_engineer", "devops_agent", "api_integrator", "testing_agent"],
   },
   data: {
     name: "Lucas Bernier",
     role: "Responsable Data",
     icon: Database,
     color: "from-indigo-600 to-blue-500",
     bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
     agents: ["analytics_detective", "data_engineer", "ml_trainer", "reporting_agent"],
   },
   support: {
     name: "Marine Leroy",
     role: "Responsable Support",
     icon: HeadphonesIcon,
     color: "from-teal-600 to-cyan-500",
     bgColor: "bg-teal-50 dark:bg-teal-950/30",
     agents: ["reputation_guardian", "ticket_handler", "knowledge_manager"],
   },
   governance: {
     name: "Isabelle Lambert",
     role: "Responsable Conformité",
     icon: Shield,
     color: "from-yellow-600 to-amber-500",
     bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
     agents: ["compliance_auditor", "policy_enforcer", "risk_assessor"],
   },
   hr: {
     name: "Sandrine Petit",
     role: "Directrice RH",
     icon: UserCheck,
     color: "from-lime-600 to-green-500",
     bgColor: "bg-lime-50 dark:bg-lime-950/30",
     agents: ["recruitment_agent", "employee_experience"],
   },
   legal: {
     name: "Me Véronique Roche",
     role: "Directrice Juridique",
     icon: Scale,
     color: "from-stone-600 to-neutral-500",
     bgColor: "bg-stone-50 dark:bg-stone-950/30",
     agents: ["contract_analyzer"],
   },
 };
 
 interface DepartmentStats {
   totalRuns: number;
   successRuns: number;
   failedRuns: number;
   pendingApprovals: number;
   avgDurationMs: number;
   recentRuns: Array<{
     id: string;
     agent_type: string;
     status: string;
     created_at: string;
     duration_ms?: number;
   }>;
 }
 
function DepartmentHeadCard({ 
  deptKey,
  stats,
  isActive = true 
}: { 
  deptKey: string; 
  stats: DepartmentStats;
  isActive?: boolean;
}) {
  const { t, i18n } = useTranslation();
   const head = DEPARTMENT_HEADS[deptKey];
   if (!head) return null;
   
   const HeadIcon = head.icon;
   const successRate = stats.totalRuns > 0 
     ? Math.round((stats.successRuns / stats.totalRuns) * 100) 
     : 0;
   
   return (
     <Card className={cn(
       "transition-all duration-200 hover:shadow-lg",
       !isActive && "opacity-50"
     )}>
       <CardHeader className="pb-3">
         <div className="flex items-start justify-between">
           <div className="flex items-center gap-3">
             <div className={cn(
               "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md",
               head.color
             )}>
               <HeadIcon className="w-6 h-6 text-white" />
             </div>
             <div>
               <CardTitle className="text-base flex items-center gap-2">
                 {head.name}
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75" />
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                 </span>
               </CardTitle>
               <CardDescription className="text-xs">
                 {head.role}
               </CardDescription>
             </div>
           </div>
           <Badge variant={isActive ? "default" : "secondary"}>
             {head.agents.length} agents
           </Badge>
         </div>
       </CardHeader>
       <CardContent className="space-y-4">
         {/* Team Stats */}
         <div className="grid grid-cols-3 gap-2">
           <div className="p-2 rounded-lg bg-muted/50 text-center">
             <p className="text-lg font-bold text-primary">{stats.totalRuns}</p>
             <p className="text-xs text-muted-foreground">{t("deptHeads.executions")}</p>
           </div>
           <div className="p-2 rounded-lg bg-muted/50 text-center">
             <p className="text-lg font-bold text-chart-3">{successRate}%</p>
             <p className="text-xs text-muted-foreground">{t("deptHeads.success")}</p>
           </div>
           <div className="p-2 rounded-lg bg-muted/50 text-center">
             <p className="text-lg font-bold text-amber-500">{stats.pendingApprovals}</p>
             <p className="text-xs text-muted-foreground">{t("deptHeads.waiting")}</p>
           </div>
         </div>
         
         {/* Progress bar */}
         <div className="space-y-1">
           <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t("deptHeads.teamPerformance")}</span>
             <span className="font-medium">{successRate}%</span>
           </div>
           <Progress value={successRate} className="h-2" />
         </div>
         
         {/* Recent activity */}
         {stats.recentRuns.length > 0 && (
           <div className="space-y-2">
             <p className="text-xs font-medium text-muted-foreground">{t("deptHeads.recentActivity")}</p>
             <ScrollArea className="h-24">
               <div className="space-y-1.5">
                 {stats.recentRuns.slice(0, 5).map((run) => (
                   <div 
                     key={run.id}
                     className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-xs"
                   >
                     <div className="flex items-center gap-2">
                       {run.status === 'completed' ? (
                         <CheckCircle className="w-3 h-3 text-chart-3" />
                       ) : run.status === 'failed' ? (
                         <AlertCircle className="w-3 h-3 text-destructive" />
                       ) : (
                         <Clock className="w-3 h-3 text-amber-500" />
                       )}
                       <span className="truncate max-w-[120px]">
                         {run.agent_type.replace(/_/g, ' ')}
                       </span>
                     </div>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(run.created_at), { 
                          addSuffix: true, 
                          locale: getDateLocale(i18n.language)
                        })}
                      </span>
                   </div>
                 ))}
               </div>
             </ScrollArea>
           </div>
         )}
       </CardContent>
     </Card>
   );
 }
 
 export function DepartmentHeadDashboard() {
   const { currentWorkspace } = useWorkspace();
   const queryClient = useQueryClient();
   const { accessibleDepartments, isFullCompany, isStarter } = useDepartmentAccess();
   
   // Fetch all department stats
   const { data: departmentStats, isLoading } = useQuery({
     queryKey: ['department-head-stats', currentWorkspace?.id],
     queryFn: async () => {
       if (!currentWorkspace?.id) return {};
       
       const stats: Record<string, DepartmentStats> = {};
       
       // Fetch agent runs
       const { data: runs } = await supabase
         .from('agent_runs')
         .select('id, agent_type, status, created_at, duration_ms')
         .eq('workspace_id', currentWorkspace.id)
         .order('created_at', { ascending: false })
         .limit(200);
       
       // Fetch pending approvals
       const { data: approvals } = await supabase
         .from('approval_queue')
         .select('id, agent_type, status')
         .eq('workspace_id', currentWorkspace.id)
         .eq('status', 'pending');
       
       // Calculate stats per department
       Object.entries(DEPARTMENT_HEADS).forEach(([deptKey, head]) => {
         const deptRuns = (runs || []).filter(r => 
           head.agents.includes(r.agent_type)
         );
         const deptApprovals = (approvals || []).filter(a => 
           head.agents.includes(a.agent_type)
         );
         
         stats[deptKey] = {
           totalRuns: deptRuns.length,
           successRuns: deptRuns.filter(r => r.status === 'completed').length,
           failedRuns: deptRuns.filter(r => r.status === 'failed').length,
           pendingApprovals: deptApprovals.length,
           avgDurationMs: deptRuns.length > 0
             ? deptRuns.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / deptRuns.length
             : 0,
           recentRuns: deptRuns.slice(0, 10),
         };
       });
       
       return stats;
     },
     enabled: !!currentWorkspace?.id,
     refetchInterval: 30000,
   });
   
   // Real-time subscription
   const handleRealtimeUpdate = useCallback(() => {
     queryClient.invalidateQueries({ queryKey: ['department-head-stats', currentWorkspace?.id] });
   }, [queryClient, currentWorkspace?.id]);
   
   useRealtimeSubscription(
     `dept-heads-${currentWorkspace?.id}`,
     {
       table: 'agent_runs',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     handleRealtimeUpdate,
     !!currentWorkspace?.id
   );
   
   useRealtimeSubscription(
     `dept-heads-approvals-${currentWorkspace?.id}`,
     {
       table: 'approval_queue',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     handleRealtimeUpdate,
     !!currentWorkspace?.id
   );
   
   // Get accessible department slugs
   const accessibleSlugs = useMemo(() => {
     return new Set(accessibleDepartments.map(d => d.slug));
   }, [accessibleDepartments]);
   
   // Calculate totals
   const totals = useMemo(() => {
     if (!departmentStats) return { runs: 0, success: 0, pending: 0 };
     
     let runs = 0, success = 0, pending = 0;
     Object.values(departmentStats).forEach(stats => {
       runs += stats.totalRuns;
       success += stats.successRuns;
       pending += stats.pendingApprovals;
     });
     
     return { runs, success, pending };
   }, [departmentStats]);
   
   if (isLoading) {
     return (
       <Card>
         <CardContent className="py-12">
           <div className="flex items-center justify-center gap-3">
             <Activity className="w-5 h-5 animate-spin" />
              <span>Chargement des données des chefs de département...</span>
           </div>
         </CardContent>
       </Card>
     );
   }
   
   return (
     <div className="space-y-6">
       {/* Summary Header */}
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle className="flex items-center gap-2">
                 <Users className="w-5 h-5" />
                 <span className="relative">
                   Tableau de bord des chefs de département
                   <span className="absolute -right-2 -top-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                 </span>
               </CardTitle>
               <CardDescription>
                 Suivi en temps réel de chaque département et son équipe
               </CardDescription>
             </div>
             <div className="flex items-center gap-4">
               <div className="text-right">
                 <p className="text-2xl font-bold">{totals.runs}</p>
                 <p className="text-xs text-muted-foreground">exécutions totales</p>
               </div>
               <div className="text-right">
                 <p className="text-2xl font-bold text-chart-3">
                   {totals.runs > 0 ? Math.round((totals.success / totals.runs) * 100) : 0}%
                 </p>
                 <p className="text-xs text-muted-foreground">taux de succès</p>
               </div>
               {totals.pending > 0 && (
                 <Badge variant="secondary" className="text-amber-600">
                   {totals.pending} en attente
                 </Badge>
               )}
             </div>
           </div>
         </CardHeader>
       </Card>
       
       {/* Department Heads Grid */}
       <Tabs defaultValue="all" className="space-y-4">
         <TabsList>
           <TabsTrigger value="all">Tous</TabsTrigger>
           <TabsTrigger value="active">Actifs</TabsTrigger>
           <TabsTrigger value="direction">Direction</TabsTrigger>
         </TabsList>
         
         <TabsContent value="all" className="space-y-4">
           {/* Direction */}
           <div>
             <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
               <Crown className="w-4 h-4 text-amber-500" />
               Direction
             </h3>
             <div className="grid gap-4 md:grid-cols-2">
               {['direction'].map(deptKey => (
                 <DepartmentHeadCard
                   key={deptKey}
                   deptKey={deptKey}
                   stats={departmentStats?.[deptKey] || {
                     totalRuns: 0,
                     successRuns: 0,
                     failedRuns: 0,
                     pendingApprovals: 0,
                     avgDurationMs: 0,
                     recentRuns: [],
                   }}
                   isActive={accessibleSlugs.has(deptKey) || isFullCompany}
                 />
               ))}
             </div>
           </div>
           
           {/* Other Departments */}
           <div>
             <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
               <Building2 className="w-4 h-4" />
               Départements ({Object.keys(DEPARTMENT_HEADS).length - 1})
             </h3>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {Object.keys(DEPARTMENT_HEADS)
                 .filter(k => k !== 'direction')
                 .map(deptKey => (
                   <DepartmentHeadCard
                     key={deptKey}
                     deptKey={deptKey}
                     stats={departmentStats?.[deptKey] || {
                       totalRuns: 0,
                       successRuns: 0,
                       failedRuns: 0,
                       pendingApprovals: 0,
                       avgDurationMs: 0,
                       recentRuns: [],
                     }}
                     isActive={accessibleSlugs.has(deptKey) || isFullCompany}
                   />
                 ))}
             </div>
           </div>
         </TabsContent>
         
         <TabsContent value="active" className="space-y-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {Object.keys(DEPARTMENT_HEADS)
               .filter(k => accessibleSlugs.has(k) || isFullCompany)
               .map(deptKey => (
                 <DepartmentHeadCard
                   key={deptKey}
                   deptKey={deptKey}
                   stats={departmentStats?.[deptKey] || {
                     totalRuns: 0,
                     successRuns: 0,
                     failedRuns: 0,
                     pendingApprovals: 0,
                     avgDurationMs: 0,
                     recentRuns: [],
                   }}
                   isActive={true}
                 />
               ))}
           </div>
         </TabsContent>
         
         <TabsContent value="direction">
           <DepartmentHeadCard
             deptKey="direction"
             stats={departmentStats?.['direction'] || {
               totalRuns: 0,
               successRuns: 0,
               failedRuns: 0,
               pendingApprovals: 0,
               avgDurationMs: 0,
               recentRuns: [],
             }}
             isActive={true}
           />
         </TabsContent>
       </Tabs>
     </div>
   );
 }
 