import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <>
      <SEOHead
        title="Pricing — Growth OS"
        description="Simple Growth OS packaging for Solo operators, Agency teams and Scale brands."
        canonical="/pricing"
      />
      <Navbar />
      <div className="min-h-screen bg-background">
        <section className="pt-28 pb-12 md:pt-36 md:pb-16">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="agent" className="mb-4">Pricing</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Packaging for the new growth operating model</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Buy a connected cockpit with signals, prioritization, approvals and outcome tracking — not a bundle of fictional headcount.
            </p>
          </div>
        </section>
        <Pricing />
        <section className="pb-16 md:pb-24">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto border-border/60">
              <CardContent className="p-8 grid gap-6 md:grid-cols-3">
                {[
                  ["Governance", "RBAC, approval gate and audit log are included in the product story from day one."],
                  ["Evidence", "Recommendations can be justified with evidence bundles before execution and reporting."],
                  ["Execution", "Marketing modules remain available when you want to move from decision to action."],
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
