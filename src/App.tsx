import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineBanner } from "@/components/ui/error-helpers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { SitesProvider } from "@/hooks/useSites";
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
import { MetaProvider } from "@/hooks/useMeta";
import { CreativesProvider } from "@/hooks/useCreatives";
import { PermissionsProvider } from "@/hooks/usePermissions";
import { PoliciesProvider } from "@/hooks/usePolicies";
import { ExperimentsProvider } from "@/hooks/useExperiments";
import { AuditLogProvider } from "@/hooks/useAuditLog";
import { OpsMetricsProvider } from "@/hooks/useOpsMetrics";
import { PolicyProfilesProvider } from "@/hooks/usePolicyProfiles";
import { TokenLifecycleProvider } from "@/hooks/useTokenLifecycle";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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

// Dashboard pages - Advanced (Livraison 4+5)
import Approvals from "./pages/dashboard/Approvals";
import Competitors from "./pages/dashboard/Competitors";
import Agency from "./pages/dashboard/Agency";
import OnboardingGuide from "./pages/dashboard/Onboarding";
import Automations from "./pages/dashboard/Automations";

// Dashboard pages - Media Launch (Livraison 6)
import MediaAssets from "./pages/dashboard/MediaAssets";
import LaunchPlan from "./pages/dashboard/LaunchPlan";
import CreativesStudio from "./pages/dashboard/CreativesStudio";
import MediaKPIs from "./pages/dashboard/MediaKPIs";
import TemplateAdsFactory from "./pages/dashboard/TemplateAdsFactory";

// Dashboard pages - Diagnostics & Ops
import Diagnostics from "./pages/dashboard/Diagnostics";
import Ops from "./pages/dashboard/Ops";
import ApprovalsV2 from "./pages/dashboard/ApprovalsV2";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <SitesProvider>
              <FeatureFlagsProvider>
                <MediaProvider>
                  <ContentProvider>
                    <AdsProvider>
                      <CROProvider>
                        <LocalSEOProvider>
                          <CompetitorsProvider>
                            <ApprovalsProvider>
                              <SocialProvider>
                                <LifecycleProvider>
                                  <AgencyProvider>
                                    <ReputationProvider>
                                      <OffersProvider>
                                        <MetaProvider>
                                        <CreativesProvider>
                                        <PermissionsProvider>
                                        <PoliciesProvider>
                                        <ExperimentsProvider>
                                        <AuditLogProvider>
                                        <OpsMetricsProvider>
                                        <PolicyProfilesProvider>
                                        <TokenLifecycleProvider>
                                        <TooltipProvider>
                                      <Toaster />
                                      <Sonner />
                                      <OfflineBanner />
                                    <BrowserRouter>
                                      <Routes>
                                        {/* Public routes */}
                                        <Route path="/" element={<Index />} />
                                        <Route path="/auth" element={<Auth />} />
                                        <Route path="/onboarding" element={<Onboarding />} />
                                        <Route path="/link/:slug" element={<SmartLink />} />
                                        
                                        {/* Dashboard - Foundation */}
                                        <Route path="/dashboard" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
                                        <Route path="/dashboard/sites" element={<DashboardLayout><Sites /></DashboardLayout>} />
                                        <Route path="/dashboard/connections" element={<DashboardLayout><ConnectionStatus /></DashboardLayout>} />
                                        <Route path="/dashboard/integrations" element={<DashboardLayout><Integrations /></DashboardLayout>} />
                                        <Route path="/dashboard/brand-kit" element={<DashboardLayout><BrandKit /></DashboardLayout>} />
                                        <Route path="/dashboard/logs" element={<DashboardLayout><Logs /></DashboardLayout>} />
                                        <Route path="/dashboard/billing" element={<DashboardLayout><Billing /></DashboardLayout>} />
                                        
                                        {/* Dashboard - Modules */}
                                        <Route path="/dashboard/seo" element={<DashboardLayout><SEOTech /></DashboardLayout>} />
                                        <Route path="/dashboard/content" element={<DashboardLayout><Content /></DashboardLayout>} />
                                        <Route path="/dashboard/local" element={<DashboardLayout><LocalSEO /></DashboardLayout>} />
                                        <Route path="/dashboard/ads" element={<DashboardLayout><Ads /></DashboardLayout>} />
                                        <Route path="/dashboard/social" element={<DashboardLayout><Social /></DashboardLayout>} />
                                        <Route path="/dashboard/cro" element={<DashboardLayout><CRO /></DashboardLayout>} />
                                        <Route path="/dashboard/offers" element={<DashboardLayout><Offers /></DashboardLayout>} />
                                        <Route path="/dashboard/lifecycle" element={<DashboardLayout><Lifecycle /></DashboardLayout>} />
                                        <Route path="/dashboard/reputation" element={<DashboardLayout><Reputation /></DashboardLayout>} />
                                        <Route path="/dashboard/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
                                        
                                        {/* Dashboard - Advanced (Livraison 4+5) */}
                                        <Route path="/dashboard/approvals" element={<DashboardLayout><Approvals /></DashboardLayout>} />
                                        <Route path="/dashboard/competitors" element={<DashboardLayout><Competitors /></DashboardLayout>} />
                                        <Route path="/dashboard/agency" element={<DashboardLayout><Agency /></DashboardLayout>} />
                                        <Route path="/dashboard/guide" element={<DashboardLayout><OnboardingGuide /></DashboardLayout>} />
                                        <Route path="/dashboard/automations" element={<DashboardLayout><Automations /></DashboardLayout>} />
                                        
                                        {/* Dashboard - Media Launch (Livraison 6) */}
                                        <Route path="/dashboard/media" element={<DashboardLayout><MediaAssets /></DashboardLayout>} />
                                        <Route path="/dashboard/media/launch" element={<DashboardLayout><LaunchPlan /></DashboardLayout>} />
                                        <Route path="/dashboard/media/creatives" element={<DashboardLayout><CreativesStudio /></DashboardLayout>} />
                                        <Route path="/dashboard/media/kpis" element={<DashboardLayout><MediaKPIs /></DashboardLayout>} />
                                        <Route path="/dashboard/media/ads-factory" element={<DashboardLayout><TemplateAdsFactory /></DashboardLayout>} />
                                        
                                        {/* Dashboard - Debug & Diagnostics */}
                                        <Route path="/dashboard/diagnostics" element={<DashboardLayout><Diagnostics /></DashboardLayout>} />
                                        <Route path="/dashboard/ops" element={<DashboardLayout><Ops /></DashboardLayout>} />
                                        <Route path="/dashboard/approvals-v2" element={<DashboardLayout><ApprovalsV2 /></DashboardLayout>} />
                                        
                                        <Route path="*" element={<NotFound />} />
                                      </Routes>
                                    </BrowserRouter>
                                        </TooltipProvider>
                                        </TokenLifecycleProvider>
                                        </PolicyProfilesProvider>
                                        </OpsMetricsProvider>
                                        </AuditLogProvider>
                                        </ExperimentsProvider>
                                        </PoliciesProvider>
                                        </PermissionsProvider>
                                        </CreativesProvider>
                                        </MetaProvider>
                                      </OffersProvider>
                                    </ReputationProvider>
                                  </AgencyProvider>
                                </LifecycleProvider>
                              </SocialProvider>
                            </ApprovalsProvider>
                          </CompetitorsProvider>
                        </LocalSEOProvider>
                      </CROProvider>
                    </AdsProvider>
                  </ContentProvider>
                </MediaProvider>
              </FeatureFlagsProvider>
            </SitesProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;