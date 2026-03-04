import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Bot,
  Target,
  BarChart3,
  Settings,
  Building2,
  FileCheck,
  History,
  Shield,
  Users,
  Search,
} from "lucide-react";

interface CommandRoute {
  path: string;
  label: string;
  icon: React.ElementType;
  group: string;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false);
      navigate(path);
    },
    [navigate]
  );

  const routes: CommandRoute[] = [
    // Main
    { path: "/dashboard", label: t("layout.cockpit"), icon: LayoutDashboard, group: "main", keywords: ["home", "cockpit", "accueil"] },
    { path: "/dashboard/app", label: t("nav.dashboard"), icon: BarChart3, group: "main", keywords: ["dashboard", "tableau de bord"] },
    { path: "/dashboard/agents", label: t("layout.myTeam"), icon: Bot, group: "main", keywords: ["agents", "equipe", "team"] },
    { path: "/dashboard/analyze", label: t("nav.analyzeUrl"), icon: Target, group: "main", keywords: ["analyze", "url", "analyser"] },
    // Operations
    { path: "/dashboard/research", label: t("nav.intelligence"), icon: Search, group: "operations", keywords: ["research", "intelligence", "recherche"] },
    { path: "/dashboard/approvals", label: t("nav.approvals"), icon: FileCheck, group: "operations", keywords: ["approvals", "approbations"] },
    { path: "/dashboard/reports", label: t("nav.reports"), icon: BarChart3, group: "operations", keywords: ["reports", "rapports"] },
    { path: "/dashboard/automations", label: t("nav.automations"), icon: Settings, group: "operations", keywords: ["automations", "rules"] },
    // Marketing
    { path: "/dashboard/seo", label: t("nav.seo"), icon: Target, group: "marketing", keywords: ["seo", "search"] },
    { path: "/dashboard/geo", label: "GEO", icon: Target, group: "marketing", keywords: ["geo", "ai overview"] },
    { path: "/dashboard/content", label: t("nav.content"), icon: FileCheck, group: "marketing", keywords: ["content", "contenu"] },
    { path: "/dashboard/local", label: t("nav.localSeo"), icon: Target, group: "marketing", keywords: ["local", "gmb", "google business"] },
    { path: "/dashboard/ads", label: t("nav.ads"), icon: Target, group: "marketing", keywords: ["ads", "publicite", "google ads"] },
    { path: "/dashboard/social", label: t("nav.social"), icon: Users, group: "marketing", keywords: ["social", "reseaux sociaux"] },
    { path: "/dashboard/cro", label: t("nav.cro"), icon: Target, group: "marketing", keywords: ["cro", "conversion"] },
    { path: "/dashboard/competitors", label: t("nav.competitors"), icon: Users, group: "marketing", keywords: ["competitors", "concurrents"] },
    { path: "/dashboard/brand-kit", label: t("nav.brandKit"), icon: Target, group: "marketing", keywords: ["brand", "marque", "kit"] },
    // Sales
    { path: "/dashboard/offers", label: t("nav.offers"), icon: Target, group: "sales", keywords: ["offers", "offres"] },
    { path: "/dashboard/lifecycle", label: t("nav.lifecycle"), icon: Target, group: "sales", keywords: ["lifecycle", "email", "nurturing"] },
    { path: "/dashboard/reputation", label: t("nav.reputation"), icon: Target, group: "sales", keywords: ["reputation", "avis", "reviews"] },
    // Governance
    { path: "/dashboard/audit-log", label: t("nav.auditLog"), icon: History, group: "governance", keywords: ["audit", "log", "journal"] },
    { path: "/dashboard/diagnostics", label: t("nav.diagnostics"), icon: Settings, group: "governance", keywords: ["diagnostics", "health"] },
    { path: "/dashboard/agency", label: t("nav.agency"), icon: Building2, group: "governance", keywords: ["agency", "agence"] },
    // Config
    { path: "/dashboard/sites", label: t("nav.sites"), icon: Building2, group: "config", keywords: ["sites", "domaines"] },
    { path: "/dashboard/integrations", label: t("nav.api"), icon: Settings, group: "config", keywords: ["integrations", "api", "connexions"] },
    { path: "/dashboard/billing", label: t("layout.billing"), icon: Settings, group: "config", keywords: ["billing", "facturation", "plan"] },
    { path: "/dashboard/settings", label: t("common.configure"), icon: Settings, group: "config", keywords: ["settings", "parametres"] },
    // Media
    { path: "/dashboard/media", label: t("nav.media"), icon: Target, group: "media", keywords: ["media", "assets"] },
    { path: "/dashboard/media/creatives", label: t("nav.creativesStudio"), icon: Target, group: "media", keywords: ["creatives", "studio"] },
    { path: "/dashboard/cms", label: t("nav.cms"), icon: FileCheck, group: "media", keywords: ["cms", "pages"] },
    // HR & Legal
    { path: "/dashboard/hr", label: t("nav.hr"), icon: Users, group: "resources", keywords: ["hr", "rh", "employees"] },
    { path: "/dashboard/legal", label: t("nav.legal"), icon: Shield, group: "resources", keywords: ["legal", "juridique", "contrats"] },
    // Public pages
    { path: "/", label: "Accueil", icon: LayoutDashboard, group: "pages", keywords: ["home", "landing"] },
    { path: "/pricing", label: "Pricing", icon: Target, group: "pages", keywords: ["pricing", "tarifs", "prix"] },
    { path: "/agents", label: "Agents Catalog", icon: Bot, group: "pages", keywords: ["catalog", "catalogue"] },
    { path: "/features", label: "Features", icon: Target, group: "pages", keywords: ["features", "fonctionnalites"] },
    { path: "/contact", label: "Contact", icon: Users, group: "pages", keywords: ["contact", "support"] },
  ];

  const groupLabels: Record<string, string> = {
    main: t("layout.cockpit"),
    operations: t("layout.operations"),
    marketing: t("layout.marketing"),
    sales: t("layout.sales"),
    governance: t("layout.governance"),
    config: t("layout.configuration"),
    media: t("layout.dataAnalytics"),
    resources: t("layout.resources"),
    pages: "Pages",
  };

  const groups = ["main", "operations", "marketing", "sales", "media", "resources", "governance", "config", "pages"];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t("commandPalette.placeholder") || "Rechercher une page, action..."} />
      <CommandList>
        <CommandEmpty>{t("commandPalette.noResults") || "Aucun résultat."}</CommandEmpty>
        {groups.map((group, i) => {
          const items = routes.filter((r) => r.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              {i > 0 && <CommandSeparator />}
              <CommandGroup heading={groupLabels[group]}>
                {items.map((route) => {
                  const Icon = route.icon;
                  return (
                    <CommandItem
                      key={route.path}
                      value={`${route.label} ${route.keywords?.join(" ") || ""}`}
                      onSelect={() => handleSelect(route.path)}
                    >
                      <Icon className="mr-2 h-4 w-4 shrink-0" />
                      <span>{route.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground hidden sm:inline">{route.path}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
