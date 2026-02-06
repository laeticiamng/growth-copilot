import { useTranslation } from "react-i18next";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { Features } from "@/components/landing/Features";
import { Services } from "@/components/landing/Services";
import { TeamOrgChart } from "@/components/landing/TeamOrgChart";
import { Tools } from "@/components/landing/Tools";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { SEOHead } from "@/components/SEOHead";

const Index = () => {
  const { t } = useTranslation();
  useAnalytics(); // Track landing page views

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Growth OS",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": t("pages.index.schemaDescription"),
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": t("pages.index.trialOffer"),
    },
    "provider": {
      "@type": "Organization",
      "name": "Growth OS",
      "url": "https://agent-growth-automator.lovable.app",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("pages.index.title")}
        description={t("pages.index.description")}
        canonical="/"
        structuredData={organizationSchema}
      />
      <Navbar />
      <Hero />
      <TrustBar />
      <Features />
      <Services />
      <TeamOrgChart />
      <Tools />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
