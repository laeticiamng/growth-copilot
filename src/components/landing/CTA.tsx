import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Rocket, Shield, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTA() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartFree = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    navigate('/auth?tab=signup');
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg opacity-10" />
      <div className="absolute inset-0 radial-overlay" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="gradient" className="mb-6">
            <Sparkles className="w-3 h-3 mr-1" />
            {t("landing.cta.badge")}
          </Badge>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t("landing.cta.title")}{" "}
            <span className="gradient-text">
              {t("landing.cta.titleHighlight")}
            </span> ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t("landing.cta.subtitle")}
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {[
              { icon: Shield, text: t("landing.cta.gdpr") },
              { icon: Rocket, text: t("landing.cta.fiveMinSetup") },
              { icon: Sparkles, text: t("landing.cta.evidenceBased") },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="hero" 
              size="xl"
              onClick={handleStartFree}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t("landing.cta.loading")}
                </>
              ) : (
                <>
                  {t("landing.cta.startFree")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            <a 
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Button variant="hero-outline" size="xl">
                {t("landing.cta.seePricing")}
              </Button>
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            {t("landing.cta.noCardRequired")}
          </p>
        </div>
      </div>
    </section>
  );
}
