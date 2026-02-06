import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { Features } from "@/components/landing/Features";
import { Services } from "@/components/landing/Services";
import { TeamOrgChart } from "@/components/landing/TeamOrgChart";
import { Tools } from "@/components/landing/Tools";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { SEOHead } from "@/components/SEOHead";

const Index = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  // Dynamic SEO content based on language
  const seoContent = {
    title: isEn 
      ? "Growth OS - 39 AI Agents to Automate Your Growth"
      : "Growth OS - 39 Agents IA pour Automatiser Votre Croissance",
    description: isEn
      ? "AI-powered SaaS marketing automation platform. SEO, Ads, Content, Social, Analytics - 39 agents working 24/7 for your growth."
      : "Plateforme SaaS d'automatisation marketing pilotée par l'IA. SEO, Ads, Content, Social, Analytics - 39 agents travaillent 24/7 pour votre croissance.",
  };

  // Dynamic schema.org structured data based on language
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Growth OS",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": isEn
      ? "AI-powered SaaS marketing automation platform with 39 AI agents. SEO, Ads, Content, Social, Analytics - all on autopilot."
      : "Plateforme SaaS d'automatisation marketing pilotée par 39 agents IA. SEO, Ads, Content, Social, Analytics - tout en autopilot.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": isEn ? "14-day free trial" : "Essai gratuit 14 jours"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    },
    "provider": {
      "@type": "Organization",
      "name": "Growth OS",
      "url": "https://agent-growth-automator.lovable.app"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoContent.title}
        description={seoContent.description}
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
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
