import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg opacity-10" />
      <div className="absolute inset-0 radial-overlay" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Prêt à automatiser ta{" "}
            <span className="gradient-text">croissance</span> ?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Rejoins les entreprises qui ont choisi de scaler intelligemment. 
            Audit gratuit, sans engagement, résultats en 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/onboarding">
              <Button variant="hero" size="xl">
                Commencer l'audit gratuit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="hero-outline" size="xl">
                Voir la démo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
