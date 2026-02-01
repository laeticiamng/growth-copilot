import { ReactNode, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePermissions } from "@/hooks/usePermissions";
import { useSessionExpiry } from "@/hooks/useSessionExpiry";
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
  Zap,
  LayoutDashboard,
  Search,
  FileText,
  MapPin,
  Megaphone,
  Instagram,
  Target,
  Package,
  Mail,
  Star,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  Loader2,
  Menu,
  X,
  Shield,
  Users,
  Rocket,
  Palette,
  Youtube,
  Play,
  Sparkles,
  TrendingUp,
  Webhook,
  Bot,
  Plug,
  Wifi,
} from "lucide-react";
import { useState } from "react";
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
}

const allNavItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/sites", label: "Sites", icon: Building2 },
  // Connection Status (read-only) for all users
  { path: "/dashboard/connections", label: "Connexions", icon: Wifi },
  // Integrations management - Agency/Admin only
  { path: "/dashboard/integrations", label: "Intégrations (Admin)", icon: Plug, requiresRole: "admin", hideForClients: true },
  // Media Launch OS
  { path: "/dashboard/media", label: "Media Assets", icon: Youtube },
  { path: "/dashboard/media/launch", label: "Launch Plan", icon: Play },
  { path: "/dashboard/media/creatives", label: "Creatives", icon: Sparkles },
  { path: "/dashboard/media/kpis", label: "Media KPIs", icon: TrendingUp },
  // Core modules
  { path: "/dashboard/seo", label: "SEO Tech", icon: Search },
  { path: "/dashboard/content", label: "Contenu", icon: FileText },
  { path: "/dashboard/local", label: "Local SEO", icon: MapPin },
  { path: "/dashboard/ads", label: "Google Ads", icon: Megaphone },
  { path: "/dashboard/social", label: "Social", icon: Instagram },
  { path: "/dashboard/cro", label: "CRO", icon: Target },
  { path: "/dashboard/offers", label: "Offres", icon: Package },
  { path: "/dashboard/lifecycle", label: "Lifecycle", icon: Mail },
  { path: "/dashboard/reputation", label: "Réputation", icon: Star },
  { path: "/dashboard/competitors", label: "Concurrents", icon: Users },
  { path: "/dashboard/reports", label: "Rapports", icon: BarChart3 },
  { path: "/dashboard/approvals", label: "Approbations", icon: Shield },
  { path: "/dashboard/automations", label: "Automations", icon: Webhook },
  { path: "/dashboard/agency", label: "Mode Agence", icon: Building2, requiresRole: "admin" },
  { path: "/dashboard/brand-kit", label: "Brand Kit", icon: Palette },
  { path: "/dashboard/guide", label: "Guide", icon: Rocket },
  { path: "/dashboard/logs", label: "Logs", icon: BarChart3, requiresRole: "manager" },
  { path: "/dashboard/ops", label: "Ops", icon: TrendingUp, requiresRole: "admin" },
  { path: "/dashboard/diagnostics", label: "Diagnostics", icon: Bot, requiresRole: "admin" },
  { path: "/dashboard/billing", label: "Billing", icon: Settings, requiresRole: "owner" },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const { user, signOut, loading: authLoading } = useAuth();
  const { workspaces, currentWorkspace, setCurrentWorkspace, loading: wsLoading } = useWorkspace();
  const { isAtLeastRole, loading: permLoading } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter nav items based on user role
  const navItems = useMemo(() => {
    return allNavItems.filter(item => {
      // If no role requirement, show to everyone
      if (!item.requiresRole) return true;
      // Check if user has at least the required role
      return isAtLeastRole(item.requiresRole);
    });
  }, [isAtLeastRole]);

  // Monitor session expiry and show warnings
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
                    className={cn(
                      currentWorkspace?.id === ws.id && "bg-secondary"
                    )}
                  >
                    {ws.name}
                  </DropdownMenuItem>
                ))}
                {workspaces.length === 0 && (
                  <DropdownMenuItem disabled>
                    Aucun workspace
                  </DropdownMenuItem>
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
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
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
      
      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
