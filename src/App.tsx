import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingState } from "@/components/ui/loading-state";

// Core providers
import { AuthProvider } from "@/hooks/useAuth";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { SitesProvider } from "@/hooks/useSites";
import { PermissionsProvider } from "@/hooks/usePermissions";

// Feature providers
import { FeatureFlagsProvider } from "@/hooks/useFeatureFlags";
import { MediaProvider } from "@/hooks/useMedia";
import { ContentProvider } from "@/hooks/useContent";
import { AdsProvider } from "@/hooks/useAds";
import { CROProvider } from "@/hooks/useCRO";
import { LocalSEOProvider } from "@/hooks/useLocalSEO";
import { CompetitorsProvider } from "@/hooks/useCompetitors";
import { ApprovalsProvider } from "@/hooks/useApprovals";
import { SocialProvider } from "@/hooks/useSocial";
import { LifecycleProvider } from "@/hooks/useLifecycle";
import { AgencyProvider } from "@/hooks/useAgency";
import { ReputationProvider } from "@/hooks/useReputation";
import { OffersProvider } from "@/hooks/useOffers";
import { ServicesProvider } from "@/hooks/useServices";

// AI providers
import { MetaProvider } from "@/hooks/useMeta";
import { CreativesProvider } from "@/hooks/useCreatives";
import { ExperimentsProvider } from "@/hooks/useExperiments";

// Utility providers
import { PoliciesProvider } from "@/hooks/usePolicies";
import { AuditLogProvider } from "@/hooks/useAuditLog";
import { OpsMetricsProvider } from "@/hooks/useOpsMetrics";
import { PolicyProfilesProvider } from "@/hooks/usePolicyProfiles";
import { TokenLifecycleProvider } from "@/hooks/useTokenLifecycle";

// Compose providers utility
import { composeProviders, createProviderGroup } from "@/lib/compose-providers";

// Layout & Auth components
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/auth/ProtectedRoute";
import { ServiceGuard } from "@/components/auth/ServiceGuard";
import { EnvGuard } from "@/components/EnvGuard";

// Sentry routing hook
import { useSentryRouting } from "@/hooks/useSentryRouting";

// Dynamic html lang sync
import { useLanguageSync } from "@/hooks/useLanguageSync";

// Lazy-loaded global widgets (not critical for first paint)
const CrispChat = lazy(() => import("@/components/CrispChat").then(m => ({ default: m.CrispChat })));
const CookieConsent = lazy(() => import("@/components/CookieConsent").then(m => ({ default: m.CookieConsent })));

// ─── Eagerly loaded pages (critical for first paint / SEO) ───
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// ─── Lazy-loaded public pages ───
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const SmartLink = lazy(() => import("./pages/SmartLink"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const DemoOAuth = lazy(() => import("./pages/DemoOAuth"));
const Contact = lazy(() => import("./pages/Contact"));
const LegalPage = lazy(() => import("./pages/Legal"));
const About = lazy(() => import("./pages/About"));
const Install = lazy(() => import("./pages/Install"));
const SalesTerms = lazy(() => import("./pages/SalesTerms"));
const AgentsCatalog = lazy(() => import("./pages/AgentsCatalog"));
const AgentDetail = lazy(() => import("./pages/AgentDetail"));
const DepartmentDetail = lazy(() => import("./pages/DepartmentDetail"));
const Features = lazy(() => import("./pages/Features"));
const Blog = lazy(() => import("./pages/Blog"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Help = lazy(() => import("./pages/Help"));
const PublicStatus = lazy(() => import("./pages/Status"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const UseCases = lazy(() => import("./pages/UseCases"));
const ForAgencies = lazy(() => import("./pages/ForAgencies"));

// ─── Lazy-loaded dashboard pages ───
// Foundation
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const Sites = lazy(() => import("./pages/dashboard/Sites"));
const Integrations = lazy(() => import("./pages/dashboard/Integrations"));
const ConnectionStatus = lazy(() => import("./pages/dashboard/ConnectionStatus"));
const BrandKit = lazy(() => import("./pages/dashboard/BrandKit"));
const Logs = lazy(() => import("./pages/dashboard/Logs"));
const Billing = lazy(() => import("./pages/dashboard/Billing"));

// Modules
const SEOTech = lazy(() => import("./pages/dashboard/SEOTech"));
const Content = lazy(() => import("./pages/dashboard/Content"));
const LocalSEO = lazy(() => import("./pages/dashboard/LocalSEO"));
const Ads = lazy(() => import("./pages/dashboard/Ads"));
const Social = lazy(() => import("./pages/dashboard/Social"));
const CRO = lazy(() => import("./pages/dashboard/CRO"));
const Offers = lazy(() => import("./pages/dashboard/Offers"));
const Lifecycle = lazy(() => import("./pages/dashboard/Lifecycle"));
const Reputation = lazy(() => import("./pages/dashboard/Reputation"));
const Reports = lazy(() => import("./pages/dashboard/Reports"));

// Advanced
const Approvals = lazy(() => import("./pages/dashboard/Approvals"));
const Competitors = lazy(() => import("./pages/dashboard/Competitors"));
const Agency = lazy(() => import("./pages/dashboard/Agency"));
const OnboardingGuide = lazy(() => import("./pages/dashboard/Onboarding"));
const Automations = lazy(() => import("./pages/dashboard/Automations"));

// Media Launch
const MediaAssets = lazy(() => import("./pages/dashboard/MediaAssets"));
const LaunchPlan = lazy(() => import("./pages/dashboard/LaunchPlan"));
const CreativesStudio = lazy(() => import("./pages/dashboard/CreativesStudio"));
const MediaKPIs = lazy(() => import("./pages/dashboard/MediaKPIs"));
const TemplateAdsFactory = lazy(() => import("./pages/dashboard/TemplateAdsFactory"));

// Diagnostics & Ops
const Diagnostics = lazy(() => import("./pages/dashboard/Diagnostics"));
const Ops = lazy(() => import("./pages/dashboard/Ops"));
const ApprovalsV2 = lazy(() => import("./pages/dashboard/ApprovalsV2"));
const Agents = lazy(() => import("./pages/dashboard/Agents"));
const CMS = lazy(() => import("./pages/dashboard/CMS"));
const Research = lazy(() => import("./pages/dashboard/Research"));
const HR = lazy(() => import("./pages/dashboard/HR"));
const Legal = lazy(() => import("./pages/dashboard/Legal"));
const AccessReview = lazy(() => import("./pages/dashboard/AccessReview"));
const AuditLogPage = lazy(() => import("./pages/dashboard/AuditLog"));
const StatusPage = lazy(() => import("./pages/dashboard/StatusPage"));
const ROIDashboard = lazy(() => import("./pages/dashboard/ROIDashboard"));
const ServiceCatalog = lazy(() => import("./pages/dashboard/ServiceCatalog"));
const AICostDashboard = lazy(() => import("./pages/dashboard/AICostDashboard"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));

// Growth OS App Pages
const AppDashboard = lazy(() => import("./pages/dashboard/AppDashboard"));
const DeptDashboard = lazy(() => import("./pages/dashboard/DeptDashboard"));
const AgentChat = lazy(() => import("./pages/dashboard/AgentChat"));
const AnalyzeUrl = lazy(() => import("./pages/dashboard/AnalyzeUrl"));
const SetupWizard = lazy(() => import("./pages/dashboard/SetupWizard"));
const GEO = lazy(() => import("./pages/dashboard/GEO"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        const message = (error as Error)?.message || '';
        if (message.includes('401') || message.includes('403') || message.includes('JWT')) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Provider Groups - Organized by dependency and purpose
 * This flattens the 24-level provider pyramid into logical groups
 */

// Core providers - Must be at the root, auth/workspace/permissions
const CoreProviders = createProviderGroup('Core', [
  AuthProvider,
  WorkspaceProvider,
  SitesProvider,
  PermissionsProvider,
  FeatureFlagsProvider,
  ServicesProvider,
]);

// Feature data providers - Business domain data
const FeatureProviders = createProviderGroup('Features', [
  MediaProvider,
  ContentProvider,
  AdsProvider,
  CROProvider,
  LocalSEOProvider,
  CompetitorsProvider,
  ApprovalsProvider,
  SocialProvider,
  LifecycleProvider,
  AgencyProvider,
  ReputationProvider,
  OffersProvider,
]);

// AI & Automation providers
const AIProviders = createProviderGroup('AI', [
  MetaProvider,
  CreativesProvider,
  ExperimentsProvider,
]);

// Utility providers - Policies, logging, ops
const UtilityProviders = createProviderGroup('Utility', [
  PoliciesProvider,
  AuditLogProvider,
  OpsMetricsProvider,
  PolicyProfilesProvider,
  TokenLifecycleProvider,
]);

/**
 * Composed Application Providers (without QueryClient, handled separately)
 * Replaces the 24-level nested structure with a flat, readable composition
 */
const InnerProviders = composeProviders([
  CoreProviders,
  FeatureProviders,
  AIProviders,
  UtilityProviders,
  TooltipProvider,
]);

/**
 * Suspense fallback for lazy-loaded routes
 */
function PageLoader() {
  return <LoadingState message="Loading..." />;
}

/**
 * Dashboard route wrapper for cleaner route definitions
 */
function DashboardRoute({ children, service }: { children: React.ReactNode; service?: string }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {service ? (
          <ServiceGuard service={service}>{children}</ServiceGuard>
        ) : (
          children
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

/**
 * Route tracker component for Sentry breadcrumbs
 * Must be inside BrowserRouter
 */
function SentryRouteTracker() {
  useSentryRouting();
  return null;
}

/**
 * Syncs i18next language to <html lang> attribute
 */
function LanguageSyncTracker() {
  useLanguageSync();
  return null;
}

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <InnerProviders>
          <Toaster />
          <Sonner />
          <Suspense fallback={null}><CrispChat /></Suspense>
          <Suspense fallback={null}><CookieConsent /></Suspense>
          <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <SentryRouteTracker />
            <LanguageSyncTracker />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/install" element={<Install />} />
                <Route path="/sales-terms" element={<SalesTerms />} />
                <Route path="/demo-oauth" element={<DemoOAuth />} />
                <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/link/:slug" element={<SmartLink />} />

                {/* New public pages */}
                <Route path="/agents" element={<AgentsCatalog />} />
                <Route path="/agents/:slug" element={<AgentDetail />} />
                <Route path="/departments/:slug" element={<DepartmentDetail />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/use-cases" element={<UseCases />} />
                <Route path="/for-agencies" element={<ForAgencies />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogArticle />} />
                <Route path="/changelog" element={<Changelog />} />
                <Route path="/help" element={<Help />} />
                <Route path="/status" element={<PublicStatus />} />
                <Route path="/api-docs" element={<ApiDocs />} />

                {/* Dashboard - Foundation */}
                <Route path="/dashboard" element={<DashboardRoute><DashboardHome /></DashboardRoute>} />
                <Route path="/dashboard/sites" element={<DashboardRoute><Sites /></DashboardRoute>} />
                <Route path="/dashboard/connections" element={<DashboardRoute><ConnectionStatus /></DashboardRoute>} />
                <Route path="/dashboard/integrations" element={<DashboardRoute><Integrations /></DashboardRoute>} />
                <Route path="/dashboard/brand-kit" element={<DashboardRoute><BrandKit /></DashboardRoute>} />
                <Route path="/dashboard/logs" element={<DashboardRoute><Logs /></DashboardRoute>} />
                <Route path="/dashboard/billing" element={<DashboardRoute><Billing /></DashboardRoute>} />

                {/* Dashboard - Modules (Service-Gated) */}
                <Route path="/dashboard/seo" element={<DashboardRoute service="marketing"><SEOTech /></DashboardRoute>} />
                <Route path="/dashboard/content" element={<DashboardRoute service="marketing"><Content /></DashboardRoute>} />
                <Route path="/dashboard/local" element={<DashboardRoute service="marketing"><LocalSEO /></DashboardRoute>} />
                <Route path="/dashboard/ads" element={<DashboardRoute service="marketing"><Ads /></DashboardRoute>} />
                <Route path="/dashboard/social" element={<DashboardRoute service="marketing"><Social /></DashboardRoute>} />
                <Route path="/dashboard/cro" element={<DashboardRoute service="marketing"><CRO /></DashboardRoute>} />
                <Route path="/dashboard/offers" element={<DashboardRoute service="sales"><Offers /></DashboardRoute>} />
                <Route path="/dashboard/lifecycle" element={<DashboardRoute service="sales"><Lifecycle /></DashboardRoute>} />
                <Route path="/dashboard/reputation" element={<DashboardRoute service="support"><Reputation /></DashboardRoute>} />
                <Route path="/dashboard/reports" element={<DashboardRoute service="finance"><Reports /></DashboardRoute>} />

                {/* Dashboard - Advanced (Service-Gated) */}
                <Route path="/dashboard/approvals" element={<DashboardRoute><Approvals /></DashboardRoute>} />
                <Route path="/dashboard/competitors" element={<DashboardRoute service="marketing"><Competitors /></DashboardRoute>} />
                <Route path="/dashboard/agency" element={<DashboardRoute service="governance"><Agency /></DashboardRoute>} />
                <Route path="/dashboard/guide" element={<DashboardRoute><OnboardingGuide /></DashboardRoute>} />
                <Route path="/dashboard/automations" element={<DashboardRoute service="governance"><Automations /></DashboardRoute>} />

                {/* Dashboard - Media Launch (Marketing-Gated) */}
                <Route path="/dashboard/media" element={<DashboardRoute service="marketing"><MediaAssets /></DashboardRoute>} />
                <Route path="/dashboard/media/launch" element={<DashboardRoute service="marketing"><LaunchPlan /></DashboardRoute>} />
                <Route path="/dashboard/media/creatives" element={<DashboardRoute service="marketing"><CreativesStudio /></DashboardRoute>} />
                <Route path="/dashboard/media/kpis" element={<DashboardRoute service="marketing"><MediaKPIs /></DashboardRoute>} />
                <Route path="/dashboard/media/ads-factory" element={<DashboardRoute service="marketing"><TemplateAdsFactory /></DashboardRoute>} />

                {/* Dashboard - Diagnostics & Ops (Security-Gated) */}
                <Route path="/dashboard/diagnostics" element={<DashboardRoute service="security"><Diagnostics /></DashboardRoute>} />
                <Route path="/dashboard/ops" element={<DashboardRoute service="security"><Ops /></DashboardRoute>} />
                <Route path="/dashboard/approvals-v2" element={<DashboardRoute><ApprovalsV2 /></DashboardRoute>} />
                <Route path="/dashboard/agents" element={<DashboardRoute><Agents /></DashboardRoute>} />
                <Route path="/dashboard/cms" element={<DashboardRoute service="marketing"><CMS /></DashboardRoute>} />
                <Route path="/dashboard/research" element={<DashboardRoute><Research /></DashboardRoute>} />

                {/* Dashboard - HR & Legal (New Departments) */}
                <Route path="/dashboard/hr" element={<DashboardRoute service="hr"><HR /></DashboardRoute>} />
                <Route path="/dashboard/legal" element={<DashboardRoute service="legal"><Legal /></DashboardRoute>} />
                <Route path="/dashboard/access-review" element={<DashboardRoute service="security"><AccessReview /></DashboardRoute>} />
                <Route path="/dashboard/audit-log" element={<DashboardRoute><AuditLogPage /></DashboardRoute>} />
                <Route path="/dashboard/status" element={<DashboardRoute><StatusPage /></DashboardRoute>} />
                <Route path="/dashboard/roi" element={<DashboardRoute><ROIDashboard /></DashboardRoute>} />
                <Route path="/dashboard/services" element={<DashboardRoute><ServiceCatalog /></DashboardRoute>} />
                <Route path="/dashboard/ai-costs" element={<DashboardRoute><AICostDashboard /></DashboardRoute>} />
                <Route path="/dashboard/settings" element={<DashboardRoute><Settings /></DashboardRoute>} />

                {/* Dashboard - Growth OS App Pages */}
                <Route path="/dashboard/app" element={<DashboardRoute><AppDashboard /></DashboardRoute>} />
                <Route path="/dashboard/dept/:slug" element={<DashboardRoute><DeptDashboard /></DashboardRoute>} />
                <Route path="/dashboard/agent/:slug" element={<DashboardRoute><AgentChat /></DashboardRoute>} />
                <Route path="/dashboard/analyze" element={<DashboardRoute><AnalyzeUrl /></DashboardRoute>} />
                <Route path="/dashboard/setup" element={<DashboardRoute><SetupWizard /></DashboardRoute>} />
                <Route path="/dashboard/geo" element={<DashboardRoute service="marketing"><GEO /></DashboardRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </InnerProviders>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
