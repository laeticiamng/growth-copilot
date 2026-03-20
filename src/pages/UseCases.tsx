import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Building2, LineChart, Shield, Users } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const useCases = [
  {
    title: "Consultant",
    icon: Briefcase,
    summary: "Turn disconnected client metrics into a weekly decision cockpit with clear priorities and evidence.",
    bullets: ["One workspace per client", "Weekly anomaly review", "Proof before recommendations"],
  },
  {
    title: "Agency",
    icon: Users,
    summary: "Run multi-client delivery with approvals, auditability and a visible action queue instead of scattered docs.",
    bullets: ["Multi-tenant operations", "Approval workflows", "Outcome reporting by account"],
  },
  {
    title: "Brand / Scale-up",
    icon: Building2,
    summary: "Give marketing, growth and ops teams one governed workspace for signals, actions and measured impact.",
    bullets: ["Cross-channel monitoring", "RBAC and traceability", "Executive outcome tracking"],
  },
];

const pillars = [
  { title: "Signals", icon: LineChart, description: "Detect what changed before the team loses another week in reporting." },
  { title: "Governance", icon: Shield, description: "Use approval gates and audit logs when recommendations become real actions." },
  { title: "Execution", icon: Briefcase, description: "Keep execution modules available as downstream capacity when action is approved." },
];

export default function UseCases() {
  return (
    <>
      <SEOHead
        title="Use cases — Growth OS"
        description="Growth OS for consultants, agencies and brands: connected data, anomalies, actions, approvals and outcome tracking."
        canonical="/use-cases"
      />
      <Navbar />
      <div className="min-h-screen bg-background">
        <section className="pt-28 pb-12 md:pt-36 md:pb-16">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="agent" className="mb-4">Use cases</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">A growth cockpit adapted to who is operating it</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The interface stays consistent, but the narrative changes by operating model: consultant, agency or brand.
            </p>
          </div>
        </section>

        <section className="pb-16 md:pb-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
              {useCases.map((useCase) => {
                const Icon = useCase.icon;
                return (
                  <Card key={useCase.title} className="border-border/60">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle>{useCase.title}</CardTitle>
                      <CardDescription className="leading-6">{useCase.summary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                        {useCase.bullets.map((bullet) => (
                          <li key={bullet}>• {bullet}</li>
                        ))}
                      </ul>
                      <Link to="/onboarding">
                        <Button variant="outline" className="w-full">
                          Start this flow
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pb-16 md:pb-24">
          <div className="container mx-auto px-4">
            <Card className="max-w-5xl mx-auto border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
              <CardContent className="p-8 grid gap-6 md:grid-cols-3">
                {pillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div key={pillar.title}>
                      <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-primary mb-4">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="font-semibold mb-2">{pillar.title}</h2>
                      <p className="text-sm text-muted-foreground leading-6">{pillar.description}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
