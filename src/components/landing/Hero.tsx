import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Play, CheckCircle2, AlertCircle, Building2, Zap, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { urlSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";

export function Hero() {
  const { t } = useTranslation();
  
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlValid, setUrlValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateUrl = useCallback((value: string) => {
    if (!value) {
      setUrlError(null);
      setUrlValid(false);
      return false;
    }
    let urlToValidate = value;
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      urlToValidate = `https://${value}`;
    }
    const result = urlSchema.safeParse(urlToValidate);
    if (result.success) {
      setUrlError(null);
      setUrlValid(true);
      return true;
    } else {
      setUrlError(result.error.errors[0]?.message || "URL invalide");
      setUrlValid(false);
      return false;
    }
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    validateUrl(value);
  };

  const handleGetStarted = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    navigate('/onboarding');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50" />
      <div className="absolute inset-0 radial-overlay" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="fade-in-up mb-8">
            <Badge variant="agent" className="px-4 py-2 text-sm">
              <Building2 className="w-4 h-4 mr-2" />
              {t("landing.hero.badge")}
            </Badge>
          </div>

          <h1 className="fade-in-up text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-balance" style={{ animationDelay: "0.1s" }}>
            {t("landing.hero.headline1")}
            <br />
            <span className="gradient-text">
              {t("landing.hero.headlineHighlight")}
            </span>
          </h1>

          <p className="fade-in-up text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6" style={{ animationDelay: "0.2s" }}>
            {t("landing.hero.subheadline")}
          </p>

          <div className="fade-in-up flex flex-wrap items-center justify-center gap-4 mb-10" style={{ animationDelay: "0.25s" }}>
            {[
              { icon: Zap, key: "landing.hero.benefitBriefs" },
              { icon: CheckCircle2, key: "landing.hero.benefitApprovals" },
              { icon: Sparkles, key: "landing.hero.benefitEvidence" },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{t(item.key)}</span>
              </div>
            ))}
          </div>

          <div className="fade-in-up max-w-xl mx-auto mb-8" style={{ animationDelay: "0.3s" }}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="url"
                  placeholder={t("landing.hero.urlPlaceholder")}
                  value={url}
                  onChange={handleUrlChange}
                  className={cn(
                    "w-full h-14 px-5 pr-10 rounded-xl bg-secondary border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all",
                    urlError 
                      ? "border-destructive focus:ring-destructive" 
                      : urlValid 
                        ? "border-chart-3 focus:ring-chart-3" 
                        : "border-border focus:ring-primary focus:border-transparent"
                  )}
                  aria-invalid={!!urlError}
                  aria-describedby={urlError ? "url-error" : urlValid ? "url-valid" : undefined}
                />
                {url && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {urlValid ? (
                      <CheckCircle2 className="w-5 h-5 text-chart-3" aria-hidden="true" />
                    ) : urlError ? (
                      <AlertCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
                    ) : null}
                  </div>
                )}
              </div>
              <Button 
                variant="hero" 
                className="w-full sm:w-auto whitespace-nowrap h-14 px-8"
                onClick={handleGetStarted}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("landing.hero.loading")}
                  </>
                ) : (
                  <>
                    {t("landing.hero.getStarted")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
            <div className="h-5 mt-2">
              {urlError && (
                <p id="url-error" className="text-sm text-destructive flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {urlError}
                </p>
              )}
              {urlValid && (
                <p id="url-valid" className="text-sm text-chart-3 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t("landing.hero.urlValid")}
                </p>
              )}
            </div>
          </div>

          <div className="fade-in-up flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: "0.4s" }}>
            <a 
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Button variant="hero-outline">
                <Play className="w-4 h-4 mr-2" />
                {t("landing.hero.seePricing")}
              </Button>
            </a>
          </div>

          <div className="fade-in-up mt-16 pt-8 border-t border-border/50" style={{ animationDelay: "0.5s" }}>
            <p className="text-sm text-muted-foreground mb-6">
              {t("landing.hero.premiumCompetence")}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {[
                { value: "11", key: "landing.hero.statDepartments" },
                { value: "24/7", key: "landing.hero.statAutomation" },
                { value: "100%", key: "landing.hero.statAuditable" },
                { value: "39", key: "landing.hero.statAIEmployees" },
              ].map((stat) => (
                <div key={stat.key} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{t(stat.key)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
