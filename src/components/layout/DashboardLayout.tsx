import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePermissions } from "@/hooks/usePermissions";
import { useSessionExpiry } from "@/hooks/useSessionExpiry";
import { useServices, getRouteService } from "@/hooks/useServices";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Zap,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Building2,
  Loader2,
  Menu,
  X,
  Bot,
  Lock,
  Target,
  Briefcase,
  Shield,
  Users,
  Scale,
  Database,
  Cog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { LanguageToggle } from "@/components/LanguageToggle";
import { OfflineBanner } from "@/components/ui/offline-banner";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  requiresRole?: "admin" | "manager" | "owner";
  hideForClients?: boolean;
  comingSoon?: boolean;
  isLocked?: boolean;
}

interface NavDepartment {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  items: NavItem[];
}

// Main navigation - CEO-level (always visible)
const mainNavItems: NavItem[] = [
  { path: "/dashboard", label: "Cockpit", icon: LayoutDashboard },
  { path: "/dashboard/agents", label: "Mon équipe IA", icon: Bot },
  { path: "/dashboard/research", label: "Intelligence", icon: () => <span className="text-base">🔍</span> },
  { path: "/dashboard/approvals", label: "À valider", icon: () => <span className="text-base">✓</span> },
  { path: "/dashboard/reports", label: "Rapports", icon: () => <span className="text-base">📊</span> },
];

// Advanced items organized by department
const advancedDepartments: NavDepartment[] = [
  {
    id: "marketing",
    label: "Marketing",
    icon: Target,
    color: "text-emerald-500",
    description: "SEO, contenu, social, publicité",
    items: [
      { path: "/dashboard/seo", label: "SEO Tech", icon: () => <span className="text-base">🔍</span> },
      { path: "/dashboard/content", label: "Contenu", icon: () => <span className="text-base">📝</span> },
      { path: "/dashboard/local", label: "Local SEO", icon: () => <span className="text-base">📍</span> },
      { path: "/dashboard/ads", label: "Google Ads", icon: () => <span className="text-base">📣</span> },
      { path: "/dashboard/social", label: "Social", icon: () => <span className="text-base">📱</span> },
      { path: "/dashboard/cro", label: "CRO", icon: () => <span className="text-base">🎯</span> },
      { path: "/dashboard/competitors", label: "Concurrents", icon: () => <span className="text-base">👥</span> },
      { path: "/dashboard/brand-kit", label: "Brand Kit", icon: () => <span className="text-base">🎨</span> },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: Briefcase,
    color: "text-blue-500",
    description: "Pipeline, offres, lifecycle",
    items: [
      { path: "/dashboard/offers", label: "Offres", icon: () => <span className="text-base">📦</span> },
      { path: "/dashboard/lifecycle", label: "Lifecycle", icon: () => <span className="text-base">📧</span> },
      { path: "/dashboard/reputation", label: "Réputation", icon: () => <span className="text-base">⭐</span> },
    ],
  },
  {
    id: "content",
    label: "Médias",
    icon: Database,
    color: "text-purple-500",
    description: "CMS, assets, exports",
    items: [
      { path: "/dashboard/cms", label: "CMS", icon: () => <span className="text-base">📄</span> },
      { path: "/dashboard/media", label: "Media Assets", icon: () => <span className="text-base">🎬</span> },
    ],
  },
  {
    id: "hr-legal",
    label: "RH & Legal",
    icon: Scale,
    color: "text-amber-500",
    description: "Ressources humaines, juridique",
    items: [
      { path: "/dashboard/hr", label: "RH", icon: () => <span className="text-base">👥</span> },
      { path: "/dashboard/legal", label: "Juridique", icon: () => <span className="text-base">⚖️</span> },
    ],
  },
  {
    id: "governance",
    label: "Gouvernance",
    icon: Shield,
    color: "text-red-500",
    description: "Sécurité, accès, audit",
    items: [
      { path: "/dashboard/access-review", label: "Revue accès", icon: () => <span className="text-base">🔐</span> },
      { path: "/dashboard/audit-log", label: "Audit Log", icon: () => <span className="text-base">📜</span>, requiresRole: "manager" },
      { path: "/dashboard/agency", label: "Mode Agence", icon: Building2, requiresRole: "admin" },
    ],
  },
  {
    id: "config",
    label: "Configuration",
    icon: Cog,
    color: "text-slate-500",
    description: "Sites, intégrations, automations",
    items: [
      { path: "/dashboard/sites", label: "Sites", icon: Building2 },
      { path: "/dashboard/integrations", label: "Connexions API", icon: () => <span className="text-base">🔧</span>, requiresRole: "admin" },
      { path: "/dashboard/connections", label: "Mes accès", icon: () => <span className="text-base">🔑</span> },
      { path: "/dashboard/automations", label: "Automations", icon: () => <span className="text-base">⚡</span> },
    ],
  },
  {
    id: "ops",
    label: "Ops & Support",
    icon: Users,
    color: "text-cyan-500",
    description: "Logs, diagnostics, facturation",
    items: [
      { path: "/dashboard/logs", label: "Logs", icon: () => <span className="text-base">📋</span>, requiresRole: "manager" },
      { path: "/dashboard/ops", label: "Ops", icon: () => <span className="text-base">⚙️</span>, requiresRole: "admin" },
      { path: "/dashboard/diagnostics", label: "Diagnostics", icon: () => <span className="text-base">🔧</span>, requiresRole: "admin" },
      { path: "/dashboard/billing", label: "Facturation", icon: () => <span className="text-base">💳</span>, requiresRole: "owner" },
      { path: "/dashboard/guide", label: "Guide", icon: () => <span className="text-base">🚀</span> },
    ],
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const { user, signOut, loading: authLoading } = useAuth();
  const { workspaces, currentWorkspace, setCurrentWorkspace, loading: wsLoading } = useWorkspace();
  const { isAtLeastRole, loading: permLoading } = usePermissions();
  const { hasService } = useServices();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [openDepartments, setOpenDepartments] = useState<Set<string>>(new Set());

  // Check if current route is in advanced section and open relevant department
  useEffect(() => {
    for (const dept of advancedDepartments) {
      const isInDept = dept.items.some((item) => location.pathname === item.path);
      if (isInDept) {
        setAdvancedOpen(true);
        setOpenDepartments((prev) => new Set([...prev, dept.id]));
        break;
      }
    }
  }, [location.pathname]);

  const toggleDepartment = (deptId: string) => {
    setOpenDepartments((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) {
        next.delete(deptId);
      } else {
        next.add(deptId);
      }
      return next;
    });
  };

  // Filter nav items based on user role AND enabled services
  const filteredMainItems = useMemo(() => {
    return mainNavItems.map((item) => {
      const requiredService = getRouteService(item.path);
      const isLocked = requiredService ? !hasService(requiredService) : false;
      return { ...item, isLocked };
    });
  }, [hasService]);

  const filteredDepartments = useMemo(() => {
    return advancedDepartments.map((dept) => ({
      ...dept,
      items: dept.items
        .filter((item) => {
          if (item.requiresRole && !isAtLeastRole(item.requiresRole)) {
            return false;
          }
          return true;
        })
        .map((item) => {
          const requiredService = getRouteService(item.path);
          const isLocked = requiredService ? !hasService(requiredService) : false;
          return { ...item, isLocked };
        }),
    })).filter((dept) => dept.items.length > 0);
  }, [isAtLeastRole, hasService]);

  // Monitor session expiry
  useSessionExpiry({
    warningMinutes: 5,
    onExpired: () => {
      navigate("/auth");
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || wsLoading || permLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    if (item.comingSoon) {
      return (
        <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/50 cursor-default">
          <Icon className="w-4 h-4" />
          {item.label}
          <span className="ml-auto text-[10px] uppercase tracking-wide opacity-60">soon</span>
        </span>
      );
    }

    if (item.isLocked) {
      return (
        <span
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/40 cursor-default group"
          title="Service non activé"
        >
          <Icon className="w-4 h-4" />
          <span className="flex-1">{item.label}</span>
          <Lock className="w-3 h-3 opacity-50" />
        </span>
      );
    }

    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <Icon className="w-4 h-4" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border h-16 flex items-center justify-between px-4">
        <div className="flex items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2 ml-4">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-bold">Growth OS</span>
          </div>
        </div>
        <NotificationCenter />
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
            <div className="p-1.5 rounded-lg gradient-bg">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Growth OS</span>
          </div>

          {/* Workspace selector */}
          <div className="p-4 border-b border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2 truncate">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{currentWorkspace?.name || "Sélectionner"}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => setCurrentWorkspace(ws)}
                    className={cn(currentWorkspace?.id === ws.id && "bg-secondary")}
                  >
                    {ws.name}
                  </DropdownMenuItem>
                ))}
                {workspaces.length === 0 && (
                  <DropdownMenuItem disabled>Aucun workspace</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/onboarding")}>
                  + Nouveau workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {/* Main navigation items */}
            {filteredMainItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}

            {/* Advanced section with departments */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors mt-4">
                <Cog className="w-4 h-4" />
                <span className="flex-1 text-left">Avancé</span>
                <ChevronRight
                  className={cn(
                    "w-4 h-4 transition-transform",
                    advancedOpen && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {filteredDepartments.map((dept) => {
                  const DeptIcon = dept.icon;
                  const isOpen = openDepartments.has(dept.id);
                  
                  return (
                    <Collapsible key={dept.id} open={isOpen} onOpenChange={() => toggleDepartment(dept.id)}>
                      <CollapsibleTrigger className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary/50 transition-colors">
                        <DeptIcon className={cn("w-3.5 h-3.5", dept.color)} />
                        <span className="flex-1 text-left">{dept.label}</span>
                        <span className="text-[10px] opacity-50">{dept.items.length}</span>
                        <ChevronRight
                          className={cn(
                            "w-3 h-3 transition-transform",
                            isOpen && "rotate-90"
                          )}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-4 space-y-0.5 pt-1">
                        {dept.items.map((item) => (
                          <NavLink key={item.path} item={item} />
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium text-sm mr-2">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="truncate text-sm">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>{t("auth.login")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  {t("common.configure")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {/* Desktop notification bar */}
        <div className="hidden lg:flex h-14 items-center justify-end gap-2 px-6 border-b border-border bg-card/50">
          <LanguageToggle />
          <NotificationCenter />
        </div>
        <div className="p-6 lg:p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
