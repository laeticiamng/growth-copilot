import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PricingPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t("pricingPage.seoTitle")}
        description={t("pricingPage.seoDesc")}
        canonical="/pricing"
      />
      <Navbar />
      <div className="min-h-screen bg-background">
        <section className="pt-28 pb-12 md:pt-36 md:pb-16">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="agent" className="mb-4">{t("pricingPage.badge")}</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{t("pricingPage.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t("pricingPage.subtitle")}
            </p>
          </div>
        </section>
        <Pricing />
        <section className="pb-16 md:pb-24">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto border-border/60">
              <CardContent className="p-8 grid gap-6 md:grid-cols-3">
                {[
                  [t("pricingPage.governanceTitle"), t("pricingPage.governanceDesc")],
                  [t("pricingPage.evidenceTitle"), t("pricingPage.evidenceDesc")],
                  [t("pricingPage.executionTitle"), t("pricingPage.executionDesc")],
                ].map(([title, description]) => (
                  <div key={title}>
                    <h2 className="font-semibold mb-2">{title}</h2>
                    <p className="text-sm text-muted-foreground leading-6">{description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
