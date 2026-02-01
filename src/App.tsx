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
import { ProtectedRoute, PublicOnlyRoute } from "@/components/auth/ProtectedRoute";
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
                                        <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
                                        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                                        <Route path="/link/:slug" element={<SmartLink />} />
                                        
                                        {/* Dashboard - Foundation (Protected) */}
                                        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardHome /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/sites" element={<ProtectedRoute><DashboardLayout><Sites /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/connections" element={<ProtectedRoute><DashboardLayout><ConnectionStatus /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/integrations" element={<ProtectedRoute><DashboardLayout><Integrations /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/brand-kit" element={<ProtectedRoute><DashboardLayout><BrandKit /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/logs" element={<ProtectedRoute><DashboardLayout><Logs /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/billing" element={<ProtectedRoute><DashboardLayout><Billing /></DashboardLayout></ProtectedRoute>} />
                                        
                                        {/* Dashboard - Modules (Protected) */}
                                        <Route path="/dashboard/seo" element={<ProtectedRoute><DashboardLayout><SEOTech /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/content" element={<ProtectedRoute><DashboardLayout><Content /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/local" element={<ProtectedRoute><DashboardLayout><LocalSEO /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/ads" element={<ProtectedRoute><DashboardLayout><Ads /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/social" element={<ProtectedRoute><DashboardLayout><Social /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/cro" element={<ProtectedRoute><DashboardLayout><CRO /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/offers" element={<ProtectedRoute><DashboardLayout><Offers /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/lifecycle" element={<ProtectedRoute><DashboardLayout><Lifecycle /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/reputation" element={<ProtectedRoute><DashboardLayout><Reputation /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/reports" element={<ProtectedRoute><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} />
                                        
                                        {/* Dashboard - Advanced (Protected) */}
                                        <Route path="/dashboard/approvals" element={<ProtectedRoute><DashboardLayout><Approvals /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/competitors" element={<ProtectedRoute><DashboardLayout><Competitors /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/agency" element={<ProtectedRoute><DashboardLayout><Agency /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/guide" element={<ProtectedRoute><DashboardLayout><OnboardingGuide /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/automations" element={<ProtectedRoute><DashboardLayout><Automations /></DashboardLayout></ProtectedRoute>} />
                                        
                                        {/* Dashboard - Media Launch (Protected) */}
                                        <Route path="/dashboard/media" element={<ProtectedRoute><DashboardLayout><MediaAssets /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/media/launch" element={<ProtectedRoute><DashboardLayout><LaunchPlan /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/media/creatives" element={<ProtectedRoute><DashboardLayout><CreativesStudio /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/media/kpis" element={<ProtectedRoute><DashboardLayout><MediaKPIs /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/media/ads-factory" element={<ProtectedRoute><DashboardLayout><TemplateAdsFactory /></DashboardLayout></ProtectedRoute>} />
                                        
                                        {/* Dashboard - Debug & Diagnostics (Protected) */}
                                        <Route path="/dashboard/diagnostics" element={<ProtectedRoute><DashboardLayout><Diagnostics /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/ops" element={<ProtectedRoute><DashboardLayout><Ops /></DashboardLayout></ProtectedRoute>} />
                                        <Route path="/dashboard/approvals-v2" element={<ProtectedRoute><DashboardLayout><ApprovalsV2 /></DashboardLayout></ProtectedRoute>} />
                                        
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