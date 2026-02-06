import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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

// Sentry routing hook
import { useSentryRouting } from "@/hooks/useSentryRouting";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import SmartLink from "./pages/SmartLink";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Roadmap from "./pages/Roadmap";
import DemoOAuth from "./pages/DemoOAuth";
import Contact from "./pages/Contact";
import LegalPage from "./pages/Legal";
import About from "./pages/About";
import Install from "./pages/Install";

// Crisp Chat widget
import { CrispChat } from "@/components/CrispChat";
import { CookieConsent } from "@/components/CookieConsent";

// Dashboard pages - Foundation
import DashboardHome from "./pages/dashboard/DashboardHome";
import Sites from "./pages/dashboard/Sites";
import Integrations from "./pages/dashboard/Integrations";
import ConnectionStatus from "./pages/dashboard/ConnectionStatus";
import BrandKit from "./pages/dashboard/BrandKit";
import Logs from "./pages/dashboard/Logs";
import Billing from "./pages/dashboard/Billing";

// Dashboard pages - Modules
import SEOTech from "./pages/dashboard/SEOTech";
import Content from "./pages/dashboard/Content";
import LocalSEO from "./pages/dashboard/LocalSEO";
import Ads from "./pages/dashboard/Ads";
import Social from "./pages/dashboard/Social";
import CRO from "./pages/dashboard/CRO";
import Offers from "./pages/dashboard/Offers";
import Lifecycle from "./pages/dashboard/Lifecycle";
import Reputation from "./pages/dashboard/Reputation";
import Reports from "./pages/dashboard/Reports";

// Dashboard pages - Advanced
import Approvals from "./pages/dashboard/Approvals";
import Competitors from "./pages/dashboard/Competitors";
import Agency from "./pages/dashboard/Agency";
import OnboardingGuide from "./pages/dashboard/Onboarding";
import Automations from "./pages/dashboard/Automations";

// Dashboard pages - Media Launch
import MediaAssets from "./pages/dashboard/MediaAssets";
import LaunchPlan from "./pages/dashboard/LaunchPlan";
import CreativesStudio from "./pages/dashboard/CreativesStudio";
import MediaKPIs from "./pages/dashboard/MediaKPIs";
import TemplateAdsFactory from "./pages/dashboard/TemplateAdsFactory";

// Dashboard pages - Diagnostics & Ops
import Diagnostics from "./pages/dashboard/Diagnostics";
import Ops from "./pages/dashboard/Ops";
import ApprovalsV2 from "./pages/dashboard/ApprovalsV2";
import Agents from "./pages/dashboard/Agents";
import CMS from "./pages/dashboard/CMS";
import Research from "./pages/dashboard/Research";
import HR from "./pages/dashboard/HR";
import Legal from "./pages/dashboard/Legal";
import AccessReview from "./pages/dashboard/AccessReview";
import AuditLogPage from "./pages/dashboard/AuditLog";
import StatusPage from "./pages/dashboard/StatusPage";
import ROIDashboard from "./pages/dashboard/ROIDashboard";
import ServiceCatalog from "./pages/dashboard/ServiceCatalog";
import AICostDashboard from "./pages/dashboard/AICostDashboard";
import Settings from "./pages/dashboard/Settings";

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

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <InnerProviders>
          <Toaster />
          <Sonner />
           <CrispChat />
            <CookieConsent />
          <BrowserRouter>
            <SentryRouteTracker />
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
              <Route path="/demo-oauth" element={<DemoOAuth />} />
              <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/link/:slug" element={<SmartLink />} />
              
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
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </InnerProviders>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
