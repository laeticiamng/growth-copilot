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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Growth OS",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Plateforme SaaS d'automatisation marketing pilotée par 39 agents IA. SEO, Ads, Content, Social, Analytics - tout en autopilot.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "description": "Essai gratuit 14 jours"
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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Growth OS - 39 Agents IA pour Automatiser Votre Croissance"
        description="Plateforme SaaS d'automatisation marketing pilotée par l'IA. SEO, Ads, Content, Social, Analytics - 39 agents travaillent 24/7 pour votre croissance."
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

