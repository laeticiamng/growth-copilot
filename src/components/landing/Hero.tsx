import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-grid opacity-50" />
      <div className="absolute inset-0 radial-overlay" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="fade-in-up mb-8">
            <Badge variant="agent" className="px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              {t("landing.hero.tagline")}
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="fade-in-up text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-balance" style={{ animationDelay: "0.1s" }}>
            {t("landing.hero.title")}
            <br />
            <span className="gradient-text">{t("landing.hero.titleHighlight")}</span>
          </h1>

          {/* Subheadline */}
          <p className="fade-in-up text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10" style={{ animationDelay: "0.2s" }}>
            {t("landing.hero.subtitle")}
          </p>

          {/* URL Input + CTA */}
          <div className="fade-in-up max-w-xl mx-auto mb-8" style={{ animationDelay: "0.3s" }}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="url"
                  placeholder="https://yoursite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-14 px-5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <Link to={`/onboarding${url ? `?url=${encodeURIComponent(url)}` : ''}`}>
                <Button variant="hero" className="w-full sm:w-auto whitespace-nowrap">
                  {t("landing.hero.cta")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="fade-in-up flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: "0.4s" }}>
            <Link to="/dashboard">
              <Button variant="hero-outline">
                <Play className="w-4 h-4 mr-2" />
                {t("landing.hero.secondaryCta")}
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="fade-in-up mt-16 pt-8 border-t border-border/50" style={{ animationDelay: "0.5s" }}>
            <p className="text-sm text-muted-foreground mb-6">{t("landing.hero.stats.clients")}</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {["Startup Alpha", "Agency Pro", "E-commerce Plus", "SaaS Corp", "Local Business"].map((name) => (
                <div key={name} className="text-lg font-semibold text-muted-foreground">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
