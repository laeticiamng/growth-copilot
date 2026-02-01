import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineBanner } from "@/components/ui/error-helpers";
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

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import SmartLink from "./pages/SmartLink";

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

const queryClient = new QueryClient();

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
function DashboardRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <InnerProviders>
          <Toaster />
          <Sonner />
          <OfflineBanner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
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
              
              {/* Dashboard - Modules */}
              <Route path="/dashboard/seo" element={<DashboardRoute><SEOTech /></DashboardRoute>} />
              <Route path="/dashboard/content" element={<DashboardRoute><Content /></DashboardRoute>} />
              <Route path="/dashboard/local" element={<DashboardRoute><LocalSEO /></DashboardRoute>} />
              <Route path="/dashboard/ads" element={<DashboardRoute><Ads /></DashboardRoute>} />
              <Route path="/dashboard/social" element={<DashboardRoute><Social /></DashboardRoute>} />
              <Route path="/dashboard/cro" element={<DashboardRoute><CRO /></DashboardRoute>} />
              <Route path="/dashboard/offers" element={<DashboardRoute><Offers /></DashboardRoute>} />
              <Route path="/dashboard/lifecycle" element={<DashboardRoute><Lifecycle /></DashboardRoute>} />
              <Route path="/dashboard/reputation" element={<DashboardRoute><Reputation /></DashboardRoute>} />
              <Route path="/dashboard/reports" element={<DashboardRoute><Reports /></DashboardRoute>} />
              
              {/* Dashboard - Advanced */}
              <Route path="/dashboard/approvals" element={<DashboardRoute><Approvals /></DashboardRoute>} />
              <Route path="/dashboard/competitors" element={<DashboardRoute><Competitors /></DashboardRoute>} />
              <Route path="/dashboard/agency" element={<DashboardRoute><Agency /></DashboardRoute>} />
              <Route path="/dashboard/guide" element={<DashboardRoute><OnboardingGuide /></DashboardRoute>} />
              <Route path="/dashboard/automations" element={<DashboardRoute><Automations /></DashboardRoute>} />
              
              {/* Dashboard - Media Launch */}
              <Route path="/dashboard/media" element={<DashboardRoute><MediaAssets /></DashboardRoute>} />
              <Route path="/dashboard/media/launch" element={<DashboardRoute><LaunchPlan /></DashboardRoute>} />
              <Route path="/dashboard/media/creatives" element={<DashboardRoute><CreativesStudio /></DashboardRoute>} />
              <Route path="/dashboard/media/kpis" element={<DashboardRoute><MediaKPIs /></DashboardRoute>} />
              <Route path="/dashboard/media/ads-factory" element={<DashboardRoute><TemplateAdsFactory /></DashboardRoute>} />
              
              {/* Dashboard - Diagnostics & Ops */}
              <Route path="/dashboard/diagnostics" element={<DashboardRoute><Diagnostics /></DashboardRoute>} />
              <Route path="/dashboard/ops" element={<DashboardRoute><Ops /></DashboardRoute>} />
              <Route path="/dashboard/approvals-v2" element={<DashboardRoute><ApprovalsV2 /></DashboardRoute>} />
              <Route path="/dashboard/agents" element={<DashboardRoute><Agents /></DashboardRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </InnerProviders>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
