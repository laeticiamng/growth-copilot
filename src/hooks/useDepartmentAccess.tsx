 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useWorkspace } from "./useWorkspace";
 
 export interface DepartmentAccess {
   slug: string;
   name: string;
   hasAccess: boolean;
   isLite: boolean; // Starter = accès lite
   agentsCount: number;
   agents: string[];
 }
 
 const DEPARTMENTS = [
   { slug: "marketing", name: "Marketing", agents: ["tech_auditor", "keyword_strategist", "content_builder", "local_optimizer", "social_manager"], liteAgent: "tech_auditor" },
   { slug: "sales", name: "Sales", agents: ["offer_architect", "sales_accelerator", "lifecycle_manager", "deal_closer"], liteAgent: "offer_architect" },
   { slug: "finance", name: "Finance", agents: ["revenue_analyst", "budget_optimizer", "billing_manager"], liteAgent: "revenue_analyst" },
   { slug: "security", name: "Security", agents: ["security_auditor", "access_controller", "threat_monitor"], liteAgent: "security_auditor" },
   { slug: "product", name: "Product", agents: ["feature_analyst", "ux_optimizer", "roadmap_planner", "backlog_manager"], liteAgent: "ux_optimizer" },
   { slug: "engineering", name: "Engineering", agents: ["code_reviewer", "performance_engineer", "devops_agent", "api_integrator", "testing_agent"], liteAgent: "code_reviewer" },
   { slug: "data", name: "Data", agents: ["analytics_detective", "data_engineer", "ml_trainer", "reporting_agent"], liteAgent: "analytics_detective" },
   { slug: "support", name: "Support", agents: ["reputation_guardian", "ticket_handler", "knowledge_manager"], liteAgent: "reputation_guardian" },
   { slug: "governance", name: "Governance", agents: ["compliance_auditor", "policy_enforcer", "risk_assessor"], liteAgent: "compliance_auditor" },
   { slug: "hr", name: "HR", agents: ["recruitment_agent", "employee_experience"], liteAgent: "recruitment_agent" },
   { slug: "legal", name: "Legal", agents: ["contract_analyzer"], liteAgent: "contract_analyzer" },
 ];
 
 export function useDepartmentAccess() {
   const { currentWorkspace } = useWorkspace();
 
   const { data: subscription, isLoading: subLoading } = useQuery({
     queryKey: ["workspace-subscription", currentWorkspace?.id],
     queryFn: async () => {
       if (!currentWorkspace?.id) return null;
       const { data } = await supabase
         .from("workspace_subscriptions")
         .select("*")
         .eq("workspace_id", currentWorkspace.id)
         .single();
       return data;
     },
     enabled: !!currentWorkspace?.id,
   });
 
   const { data: enabledDepts, isLoading: deptsLoading } = useQuery({
     queryKey: ["workspace-departments", currentWorkspace?.id],
     queryFn: async () => {
       if (!currentWorkspace?.id) return [];
       const { data } = await supabase
         .from("workspace_departments")
         .select("*")
         .eq("workspace_id", currentWorkspace.id)
         .eq("is_active", true);
       return data || [];
     },
     enabled: !!currentWorkspace?.id,
   });
 
   const isFounder = subscription?.plan === "founder";
   const isFullCompany = subscription?.is_full_company === true || isFounder;
   const isStarter = subscription?.is_starter === true;
   const enabledSlugs = enabledDepts?.map((d) => d.department_slug) || [];
 
   const departments: DepartmentAccess[] = DEPARTMENTS.map((dept) => {
     const hasFullAccess = isFullCompany || enabledSlugs.includes(dept.slug);
     const hasLiteAccess = isStarter;
     const hasAccess = hasFullAccess || hasLiteAccess;
 
     return {
       slug: dept.slug,
       name: dept.name,
       hasAccess,
       isLite: hasLiteAccess && !hasFullAccess,
       agentsCount: hasFullAccess ? dept.agents.length : hasLiteAccess ? 1 : 0,
       agents: hasFullAccess ? dept.agents : hasLiteAccess ? [dept.liteAgent] : [],
     };
   });
 
   // Direction toujours accessible
   const direction: DepartmentAccess = {
     slug: "direction",
     name: "Direction",
     hasAccess: isFullCompany || isStarter || enabledSlugs.length > 0,
     isLite: isStarter && !isFullCompany,
     agentsCount: isFullCompany ? 2 : 1,
     agents: isFullCompany ? ["chief_growth_officer", "quality_compliance"] : ["chief_growth_officer"],
   };
 
   const allDepartments = [direction, ...departments];
   const accessibleDepartments = allDepartments.filter((d) => d.hasAccess);
   const totalAgents = accessibleDepartments.reduce((sum, d) => sum + d.agentsCount, 0);
 
   return {
     departments: allDepartments,
     accessibleDepartments,
     totalAgents,
     isFounder,
     isFullCompany,
     isStarter,
     enabledDepartmentSlugs: enabledSlugs,
     subscription,
     loading: subLoading || deptsLoading,
     hasDepartmentAccess: (slug: string) => {
       const dept = allDepartments.find((d) => d.slug === slug);
       return dept?.hasAccess || false;
     },
     getAgentsForDepartment: (slug: string) => {
       const dept = allDepartments.find((d) => d.slug === slug);
       return dept?.agents || [];
     },
   };
 }