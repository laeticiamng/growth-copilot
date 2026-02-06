/**
 * Department Semaphores Component
 * Displays health status of each department with color coding
 */
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { 
  Search, 
  FileText, 
  Megaphone, 
  Users, 
  TrendingUp,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";

interface DepartmentStatus {
  id: string;
  name: string;
  icon: React.ElementType;
  status: "green" | "orange" | "red" | "gray";
  message: string;
  link: string;
  linkLabel: string;
}

interface DepartmentSemaphoresProps {
  className?: string;
}

export function DepartmentSemaphores({ className }: DepartmentSemaphoresProps) {
  const { t, i18n } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<DepartmentStatus[]>([]);

  useEffect(() => {
    const fetchDepartmentHealth = async () => {
      if (!currentWorkspace?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch data for each department in parallel
        const [contentRes, adsRes, commercialRes, financeRes] = await Promise.all([
          // Content: Pending briefs count
          supabase
            .from('content_briefs')
            .select('id')
            .eq('workspace_id', currentWorkspace.id)
            .eq('status', 'draft'),
          // Ads: Campaign performance
          supabase
            .from('campaigns')
            .select('cost_30d, conversions_30d')
            .eq('workspace_id', currentWorkspace.id)
            .eq('status', 'active'),
          // Commercial: Lead conversion
          supabase
            .from('leads')
            .select('status')
            .eq('workspace_id', currentWorkspace.id),
          // Finance: ROI data
          supabase
            .from('agent_runs')
            .select('cost_estimate')
            .eq('workspace_id', currentWorkspace.id)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        ]);

        // SEO status - simplified (no seo_audits table query)
        let seoStatus: DepartmentStatus = {
          id: "seo",
          name: "SEO",
          icon: Search,
          status: "gray",
          message: "Non activé — Lancer le premier audit",
          link: "/dashboard/seo",
          linkLabel: "Auditer",
        };

        // Calculate Content status
        const pendingBriefs = contentRes.data?.length || 0;
        let contentStatus: DepartmentStatus = {
          id: "content",
          name: "Content",
          icon: FileText,
          status: pendingBriefs === 0 ? "gray" : pendingBriefs <= 3 ? "green" : pendingBriefs <= 10 ? "orange" : "red",
          message: pendingBriefs === 0 ? "Non activé — Créer un brief" : `${pendingBriefs} brief(s) en attente`,
          link: "/dashboard/content",
          linkLabel: "Gérer",
        };

        // Calculate Ads status
        let adsStatus: DepartmentStatus = {
          id: "ads",
          name: "Ads",
          icon: Megaphone,
          status: "gray",
          message: "Non activé — Configurer Google Ads",
          link: "/dashboard/ads",
          linkLabel: "Configurer",
        };
        
        if (adsRes.data && adsRes.data.length > 0) {
          const totalSpend = adsRes.data.reduce((sum, c) => sum + (c.cost_30d || 0), 0);
          const totalConversions = adsRes.data.reduce((sum, c) => sum + (c.conversions_30d || 0), 0);
          const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
          
          adsStatus = {
            ...adsStatus,
            status: cpa === 0 ? "gray" : cpa < 50 ? "green" : cpa < 100 ? "orange" : "red",
            message: totalSpend > 0 ? `CPA: ${cpa.toFixed(0)}€` : "Aucune dépense",
          };
        }

        // Calculate Commercial status
        const leads = commercialRes.data || [];
        const wonLeads = leads.filter(l => l.status === 'won').length;
        const totalLeads = leads.length;
        const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
        
        let commercialStatus: DepartmentStatus = {
          id: "commercial",
          name: "Commercial",
          icon: Users,
          status: totalLeads === 0 ? "gray" : conversionRate >= 20 ? "green" : conversionRate >= 10 ? "orange" : "red",
          message: totalLeads === 0 ? "Non activé — Qualifier un lead" : `Taux: ${conversionRate.toFixed(0)}%`,
          link: "/dashboard/lifecycle",
          linkLabel: "Pipeline",
        };

        // Calculate Finance status
        const totalCosts = financeRes.data?.reduce((sum, r) => sum + (r.cost_estimate || 0), 0) || 0;
        let financeStatus: DepartmentStatus = {
          id: "finance",
          name: "Finance",
          icon: TrendingUp,
          status: "gray",
          message: "Non activé — Calculer le ROI",
          link: "/dashboard/roi",
          linkLabel: "Analyser",
        };
        
        if (totalCosts > 0) {
          // Simplified ROI calculation
          financeStatus = {
            ...financeStatus,
            status: "green",
            message: `Coûts IA: ${totalCosts.toFixed(2)}€`,
          };
        }

        setDepartments([seoStatus, contentStatus, adsStatus, commercialStatus, financeStatus]);
      } catch (err) {
        console.error("Error fetching department health:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentHealth();
  }, [currentWorkspace?.id, currentSite?.id]);

  const getStatusColor = (status: DepartmentStatus["status"]) => {
    switch (status) {
      case "green": return "bg-primary text-primary-foreground";
      case "orange": return "bg-warning text-warning-foreground";
      case "red": return "bg-destructive text-destructive-foreground";
      case "gray": return "bg-muted text-muted-foreground";
    }
  };

  const getStatusDot = (status: DepartmentStatus["status"]) => {
    switch (status) {
      case "green": return "bg-primary";
      case "orange": return "bg-warning";
      case "red": return "bg-destructive";
      case "gray": return "bg-muted-foreground";
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="feature" className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {t("cockpit.semaphores")}
          <Badge variant="outline" className="text-xs font-normal">
            5 {t("cockpit.departmentsCount")}
          </Badge>
        </CardTitle>
        <CardDescription>
          {t("cockpit.operationsHealth")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <Link 
                key={dept.id} 
                to={dept.link}
                className={cn(
                  "p-3 rounded-lg border transition-all hover:shadow-sm flex flex-col items-center text-center gap-2",
                  dept.status === "gray" 
                    ? "bg-muted/30 border-dashed" 
                    : "bg-secondary/30 border-border"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  getStatusColor(dept.status)
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{dept.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {dept.message}
                  </p>
                </div>
                <div className={cn("w-2 h-2 rounded-full", getStatusDot(dept.status))} />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
