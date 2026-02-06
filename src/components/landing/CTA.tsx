import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Rocket, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function CTA() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg opacity-10" />
      <div className="absolute inset-0 radial-overlay" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="gradient" className="mb-6">
            <Sparkles className="w-3 h-3 mr-1" />
            {isEn ? "Premium Competence Standard" : "Standard de compétence premium"}
          </Badge>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {isEn ? "Ready to deploy your" : "Prêt à déployer votre"}{" "}
            <span className="gradient-text">
              {isEn ? "Portable Company" : "Entreprise Portable"}
            </span> ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {isEn 
              ? "No technical setup. No complex configuration. Just answer a few questions and let your digital company work for you."
              : "Aucune configuration technique. Aucun paramétrage complexe. Répondez simplement à quelques questions et laissez votre entreprise digitale travailler pour vous."
            }
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {[
              { icon: Shield, text: isEn ? "GDPR Compliant" : "Conforme RGPD" },
              { icon: Rocket, text: isEn ? "5-min setup" : "5 min de config" },
              { icon: Sparkles, text: isEn ? "Evidence-based" : "Basé sur les données" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/onboarding">
              <Button variant="hero" size="xl">
                {isEn ? "Start Free" : "Commencer gratuitement"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a 
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Button variant="hero-outline" size="xl">
                {isEn ? "See Pricing" : "Voir les tarifs"}
              </Button>
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            {isEn 
              ? "No credit card required. Cancel anytime."
              : "Pas de carte bancaire requise. Annulez à tout moment."
            }
          </p>
        </div>
      </div>
    </section>
  );
}
