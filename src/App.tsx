import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import DashboardHome from "./pages/dashboard/DashboardHome";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WorkspaceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
