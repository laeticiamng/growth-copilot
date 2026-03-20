import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  FileCheck2,
  Gauge,
  Shield,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { growthLoopSteps } from "@/lib/growth-cockpit";

const capabilityCards = [
  {
    title: "Connected data model",
    description: "Bring Google, Meta, site, subscription and workspace data into one cockpit instead of scattered reports.",
    icon: BarChart3,
  },
  {
    title: "Explainable anomalies",
    description: "Spot sudden drops, channel drift and conversion friction with evidence-backed context.",
    icon: Gauge,
  },
  {
    title: "Prioritized decisions",
    description: "Turn noise into ranked actions with owner, expected impact, risk level and next step.",
    icon: Workflow,
  },
  {
    title: "Governance by design",
    description: "Use approval gates, audit logs and RBAC when recommendations become sensitive actions.",
    icon: Shield,
  },
];

const secondaryCapabilities = [
  "Marketing execution stays available as a downstream capability, not the headline promise.",
  "Evidence bundles justify recommendations before a user approves or rejects an action.",
  "Schedulers keep briefs, refreshes and signal monitoring running without losing control.",
];

export default function Index() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Growth OS",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Growth cockpit for connected data, anomaly detection, action prioritization, approvals and outcome tracking.",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Growth OS — Connected growth cockpit"
        description="Connect growth data, detect anomalies, prioritize actions, route approvals and prove outcomes in one cockpit."
        canonical="/"
        structuredData={structuredData}
      />
      <Navbar />
      <main>
        <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="absolute inset-0 hero-grid opacity-40" />
          <div className="absolute inset-0 radial-overlay" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <Badge variant="agent" className="mb-6 px-4 py-2 text-sm">
                2026 growth cockpit for operators, agencies and brands
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-balance">
                Connected growth data. <span className="gradient-text">Clear anomalies.</span><br />
                Prioritized decisions with proof.
              </h1>
              <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
                Growth OS is not a “portable company”. It is a premium operating cockpit that unifies signals, surfaces anomalies, prioritizes actions, routes approvals and tracks measurable outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Link to="/auth?tab=signup">
                  <Button variant="hero" size="lg" className="min-w-52">
                    Start a workspace
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/use-cases">
                  <Button variant="outline" size="lg" className="min-w-52">
                    Explore use cases
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Connected workspaces and RBAC</span>
                <span className="flex items-center gap-2"><FileCheck2 className="w-4 h-4 text-primary" /> Approval gate and audit log</span>
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Evidence bundles and impact tracking</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { value: "4", label: "steps from signal to outcome" },
                { value: "1", label: "workspace model for multi-tenant delivery" },
                { value: "100%", label: "auditability for sensitive actions" },
                { value: "24/7", label: "scheduler-ready monitoring cadence" },
              ].map((stat) => (
                <Card key={stat.label} className="border-border/60 bg-background/80 backdrop-blur">
                  <CardContent className="p-5 text-center">
                    <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Badge variant="agent" className="mb-4">Operating loop</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">From connected data to governed outcomes</h2>
              <p className="text-lg text-muted-foreground">The product story is now a defensible loop: data → anomalies → actions → approvals → outcomes.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {growthLoopSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={step.title} className="border-border/60">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className="w-fit">0{index + 1}</Badge>
                      <CardTitle className="mt-2">{step.title}</CardTitle>
                      <CardDescription className="leading-6">{step.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Badge variant="agent" className="mb-4">Core capabilities</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Built on the stack you already have</h2>
              <p className="text-lg text-muted-foreground">The pivot keeps the technical moat: Supabase backend, approvals, auditability, scheduler, AI gateway, Stripe and channel integrations.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="grid gap-6 sm:grid-cols-2">
                {capabilityCards.map((capability) => {
                  const Icon = capability.icon;
                  return (
                    <Card key={capability.title} className="border-border/60 h-full">
                      <CardHeader>
                        <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-primary mb-3">
                          <Icon className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl">{capability.title}</CardTitle>
                        <CardDescription className="leading-6">{capability.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <BadgeCheck className="w-6 h-6 text-primary" />
                    Secondary capability: marketing execution
                  </CardTitle>
                  <CardDescription className="leading-6 text-base">
                    SEO, content, ads and social remain available, but as execution modules fed by signals and governance rather than the front-door promise.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {secondaryCapabilities.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl border border-border/60 p-4">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                  <div className="rounded-xl border border-dashed border-primary/30 p-4 text-sm text-muted-foreground">
                    This makes the product easier to understand in under 10 seconds and more defensible against generic agents.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Pricing />

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Card className="max-w-5xl mx-auto border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
              <CardContent className="p-8 md:p-12 flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <Badge variant="agent" className="mb-4">For 2026 operators</Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Give every team one place to see signals, approve action and prove impact.</h2>
                  <p className="text-muted-foreground text-lg">Move from dashboard sprawl and AI noise to a single cockpit with traceability, evidence and outcome tracking.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/onboarding">
                    <Button variant="hero" size="lg">Start onboarding</Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="outline" size="lg">See packaging</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
