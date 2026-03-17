import { useEffect, useState, useCallback, useMemo } from "react";
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
  Zap,
  Play,
  MessageSquare,
  FileText,
  Globe,
  Palette,
  TrendingUp,
  Database,
} from "lucide-react";
import { AGENTS_CATALOG } from "@/data/agents-catalog";
import { Badge } from "@/components/ui/badge";

interface CommandRoute {
  path: string;
  label: string;
  icon: React.ElementType;
  group: string;
  keywords?: string[];
  badge?: string;
}

// Exported so the search button in DashboardLayout can open it
let openCommandPalette: (() => void) | null = null;
export function triggerCommandPalette() {
  openCommandPalette?.();
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";

  // Expose open function
  useEffect(() => {
    openCommandPalette = () => setOpen(true);
    return () => { openCommandPalette = null; };
  }, []);

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

  // Build agent items from catalog
  const agentItems: CommandRoute[] = useMemo(() =>
    AGENTS_CATALOG.map((agent) => ({
      path: `/dashboard/agents?agent=${agent.slug}`,
      label: `${agent.persona.name} — ${agent.role[lang] || agent.name}`,
      icon: agent.icon,
      group: "agents",
      keywords: [agent.name, agent.slug, agent.department, agent.persona.name, ...(agent.capabilities || [])],
      badge: agent.department,
    })),
    [lang]
  );

  const routes: CommandRoute[] = useMemo(() => [
    // ── Quick Actions ──
    { path: "/dashboard/analyze", label: lang === "fr" ? "🔍 Analyser une URL" : "🔍 Analyze a URL", icon: Zap, group: "actions", keywords: ["analyze", "url", "audit", "analyser"] },
    { path: "/dashboard/agents?chat=true", label: lang === "fr" ? "💬 Parler à un agent" : "💬 Chat with an agent", icon: MessageSquare, group: "actions", keywords: ["chat", "agent", "parler", "ia"] },
    { path: "/dashboard/reports", label: lang === "fr" ? "📊 Générer un rapport" : "📊 Generate a report", icon: FileText, group: "actions", keywords: ["report", "generate", "rapport", "generer"] },
    { path: "/dashboard/automations", label: lang === "fr" ? "⚡ Lancer une automatisation" : "⚡ Run an automation", icon: Play, group: "actions", keywords: ["run", "automation", "lancer"] },

    // ── Navigation — Main ──
    { path: "/dashboard", label: t("layout.cockpit"), icon: LayoutDashboard, group: "main", keywords: ["home", "cockpit", "accueil", "briefing"] },
    { path: "/dashboard/app", label: t("nav.dashboard"), icon: BarChart3, group: "main", keywords: ["dashboard", "tableau de bord", "kpi"] },
    { path: "/dashboard/agents", label: t("layout.myTeam"), icon: Bot, group: "main", keywords: ["agents", "equipe", "team", "ia"] },
    { path: "/dashboard/analyze", label: t("nav.analyzeUrl"), icon: Target, group: "main", keywords: ["analyze", "url", "analyser", "crawler"] },

    // ── Operations ──
    { path: "/dashboard/research", label: t("nav.intelligence"), icon: Search, group: "operations", keywords: ["research", "intelligence", "recherche", "perplexity"] },
    { path: "/dashboard/approvals", label: t("nav.approvals"), icon: FileCheck, group: "operations", keywords: ["approvals", "approbations", "review", "pending"] },
    { path: "/dashboard/reports", label: t("nav.reports"), icon: BarChart3, group: "operations", keywords: ["reports", "rapports", "pdf"] },
    { path: "/dashboard/automations", label: t("nav.automations"), icon: Settings, group: "operations", keywords: ["automations", "rules", "triggers"] },

    // ── Marketing ──
    { path: "/dashboard/seo", label: t("nav.seo"), icon: Search, group: "marketing", keywords: ["seo", "search", "technique", "audit"] },
    { path: "/dashboard/geo", label: "GEO", icon: Globe, group: "marketing", keywords: ["geo", "ai overview", "generative"] },
    { path: "/dashboard/content", label: t("nav.content"), icon: FileText, group: "marketing", keywords: ["content", "contenu", "article", "blog"] },
    { path: "/dashboard/local", label: t("nav.localSeo"), icon: Target, group: "marketing", keywords: ["local", "gmb", "google business", "maps"] },
    { path: "/dashboard/ads", label: t("nav.ads"), icon: TrendingUp, group: "marketing", keywords: ["ads", "publicite", "google ads", "meta ads", "campaigns"] },
    { path: "/dashboard/social", label: t("nav.social"), icon: Users, group: "marketing", keywords: ["social", "reseaux sociaux", "instagram", "linkedin"] },
    { path: "/dashboard/cro", label: t("nav.cro"), icon: Target, group: "marketing", keywords: ["cro", "conversion", "ab test", "optimization"] },
    { path: "/dashboard/competitors", label: t("nav.competitors"), icon: Users, group: "marketing", keywords: ["competitors", "concurrents", "benchmark"] },
    { path: "/dashboard/brand-kit", label: t("nav.brandKit"), icon: Palette, group: "marketing", keywords: ["brand", "marque", "kit", "charte graphique"] },

    // ── Sales ──
    { path: "/dashboard/offers", label: t("nav.offers"), icon: Target, group: "sales", keywords: ["offers", "offres", "produits"] },
    { path: "/dashboard/lifecycle", label: t("nav.lifecycle"), icon: Target, group: "sales", keywords: ["lifecycle", "email", "nurturing", "leads"] },
    { path: "/dashboard/reputation", label: t("nav.reputation"), icon: Target, group: "sales", keywords: ["reputation", "avis", "reviews", "google reviews"] },

    // ── Media & Data ──
    { path: "/dashboard/media", label: t("nav.media"), icon: Database, group: "media", keywords: ["media", "assets", "fichiers"] },
    { path: "/dashboard/media/creatives", label: t("nav.creativesStudio"), icon: Palette, group: "media", keywords: ["creatives", "studio", "design"] },
    { path: "/dashboard/media/kpis", label: t("nav.mediaKpis"), icon: BarChart3, group: "media", keywords: ["media kpis", "youtube", "analytics"] },
    { path: "/dashboard/media/ads-factory", label: t("nav.adsFactory"), icon: Target, group: "media", keywords: ["ads factory", "templates", "bannières"] },
    { path: "/dashboard/cms", label: t("nav.cms"), icon: FileCheck, group: "media", keywords: ["cms", "pages", "éditeur"] },

    // ── Resources ──
    { path: "/dashboard/hr", label: t("nav.hr"), icon: Users, group: "resources", keywords: ["hr", "rh", "employees", "organigramme"] },
    { path: "/dashboard/legal", label: t("nav.legal"), icon: Shield, group: "resources", keywords: ["legal", "juridique", "contrats", "rgpd"] },
    { path: "/dashboard/services", label: t("nav.serviceCatalog"), icon: Settings, group: "resources", keywords: ["services", "catalogue", "modules"] },

    // ── Governance ──
    { path: "/dashboard/audit-log", label: t("nav.auditLog"), icon: History, group: "governance", keywords: ["audit", "log", "journal", "traçabilité"] },
    { path: "/dashboard/access-review", label: t("nav.accessReview"), icon: Shield, group: "governance", keywords: ["access", "review", "permissions", "sécurité"] },
    { path: "/dashboard/diagnostics", label: t("nav.diagnostics"), icon: Settings, group: "governance", keywords: ["diagnostics", "health", "système"] },
    { path: "/dashboard/agency", label: t("nav.agency"), icon: Building2, group: "governance", keywords: ["agency", "agence", "clients"] },

    // ── Configuration ──
    { path: "/dashboard/sites", label: t("nav.sites"), icon: Building2, group: "config", keywords: ["sites", "domaines", "website"] },
    { path: "/dashboard/integrations", label: t("nav.api"), icon: Settings, group: "config", keywords: ["integrations", "api", "connexions", "google", "meta"] },
    { path: "/dashboard/connections", label: t("nav.access"), icon: Settings, group: "config", keywords: ["connections", "oauth", "tokens"] },
    { path: "/dashboard/billing", label: t("layout.billing"), icon: Settings, group: "config", keywords: ["billing", "facturation", "plan", "abonnement"] },
    { path: "/dashboard/settings", label: t("common.configure"), icon: Settings, group: "config", keywords: ["settings", "parametres", "configuration"] },
    { path: "/dashboard/setup", label: t("nav.setupWizard"), icon: Zap, group: "config", keywords: ["setup", "wizard", "onboarding", "démarrage"] },

    // ── Compliance ──
    { path: "/dashboard/logs", label: t("nav.logs"), icon: FileCheck, group: "compliance", keywords: ["logs", "monitoring"] },
    { path: "/dashboard/status", label: t("nav.statusPage"), icon: Target, group: "compliance", keywords: ["status", "uptime", "santé"] },
    { path: "/dashboard/roi", label: t("nav.roiDashboard"), icon: TrendingUp, group: "compliance", keywords: ["roi", "return", "investissement"] },
    { path: "/dashboard/ai-costs", label: t("nav.aiCosts"), icon: Bot, group: "compliance", keywords: ["ai", "costs", "coûts", "tokens"] },

    // ── Public Pages ──
    { path: "/", label: lang === "fr" ? "Accueil" : "Home", icon: LayoutDashboard, group: "pages", keywords: ["home", "landing", "accueil"] },
    { path: "/pricing", label: lang === "fr" ? "Tarifs" : "Pricing", icon: TrendingUp, group: "pages", keywords: ["pricing", "tarifs", "prix"] },
    { path: "/agents", label: lang === "fr" ? "Catalogue Agents" : "Agents Catalog", icon: Bot, group: "pages", keywords: ["catalog", "catalogue", "agents"] },
    { path: "/features", label: lang === "fr" ? "Fonctionnalités" : "Features", icon: Zap, group: "pages", keywords: ["features", "fonctionnalites"] },
    { path: "/use-cases", label: lang === "fr" ? "Cas d'usage" : "Use Cases", icon: Target, group: "pages", keywords: ["use cases", "cas d'usage"] },
    { path: "/for-agencies", label: lang === "fr" ? "Pour les agences" : "For Agencies", icon: Building2, group: "pages", keywords: ["agencies", "agences"] },
    { path: "/contact", label: "Contact", icon: Users, group: "pages", keywords: ["contact", "support"] },
    { path: "/blog", label: "Blog", icon: FileText, group: "pages", keywords: ["blog", "articles"] },
    { path: "/changelog", label: lang === "fr" ? "Journal des mises à jour" : "Changelog", icon: History, group: "pages", keywords: ["changelog", "updates", "mises à jour"] },
    { path: "/help", label: lang === "fr" ? "Aide" : "Help", icon: MessageSquare, group: "pages", keywords: ["help", "aide", "faq"] },
  ], [t, lang]);

  const groupLabels: Record<string, string> = {
    actions: lang === "fr" ? "⚡ Actions rapides" : "⚡ Quick Actions",
    main: lang === "fr" ? "🏠 Navigation principale" : "🏠 Main Navigation",
    agents: lang === "fr" ? "🤖 Agents IA" : "🤖 AI Agents",
    operations: t("layout.operations"),
    marketing: t("layout.marketing"),
    sales: t("layout.sales"),
    media: t("layout.dataAnalytics"),
    resources: t("layout.resources"),
    governance: t("layout.governance"),
    config: t("layout.configuration"),
    compliance: t("layout.compliance"),
    pages: lang === "fr" ? "🌐 Pages publiques" : "🌐 Public Pages",
  };

  const groups = ["actions", "main", "agents", "operations", "marketing", "sales", "media", "resources", "governance", "config", "compliance", "pages"];

  // Combine routes + agents
  const allItems = useMemo(() => [...routes, ...agentItems], [routes, agentItems]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={lang === "fr" ? "Rechercher pages, agents, actions..." : "Search pages, agents, actions..."} />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <Search className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {lang === "fr" ? "Aucun résultat trouvé." : "No results found."}
            </p>
          </div>
        </CommandEmpty>
        {groups.map((group, i) => {
          const items = allItems.filter((r) => r.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              {i > 0 && <CommandSeparator />}
              <CommandGroup heading={groupLabels[group]}>
                {items.map((route) => {
                  const Icon = route.icon;
                  return (
                    <CommandItem
                      key={route.path + route.label}
                      value={`${route.label} ${route.keywords?.join(" ") || ""}`}
                      onSelect={() => handleSelect(route.path)}
                      className="gap-3"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 truncate">{route.label}</span>
                      {route.badge && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                          {route.badge}
                        </Badge>
                      )}
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
