import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/growth-cockpit";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-secondary/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge variant="agent" className="mb-4">Simple packaging</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Pricing built for <span className="gradient-text">operators, agencies and brands</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Keep the connected data, governance, evidence and approvals. Choose the operating model that fits your revenue stage.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative border-border/60",
                ('featured' in plan) && (plan as any).featured && "border-primary/40 bg-gradient-to-b from-primary/10 via-background to-background shadow-xl"
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="gradient" className="px-3 py-1 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Recommended for modern agencies
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground mb-1">/ month</span>}
                </div>
                <CardDescription className="text-sm leading-6">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.name === "Scale" ? "/contact" : "/auth?tab=signup"}>
                  <Button variant={plan.featured ? "hero" : "outline"} className="w-full" size="lg">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
