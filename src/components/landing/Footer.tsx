import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Zap, Twitter, Linkedin, Youtube, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const footerLinks = {
    [isEn ? "Product" : "Produit"]: [
      { label: t("landing.footer.features"), href: "#features" },
      { label: t("landing.footer.pricing"), href: "#pricing" },
      { label: isEn ? "Departments" : "Départements", href: "#services" },
      { label: isEn ? "Integrations" : "Intégrations", href: "#tools" },
    ],
    [isEn ? "Resources" : "Ressources"]: [
      { label: isEn ? "Documentation" : "Documentation", href: "#" },
      { label: isEn ? "Help Center" : "Centre d'aide", href: "#" },
      { label: isEn ? "Status" : "Statut", href: "#" },
      { label: "API", href: "#" },
    ],
    [isEn ? "Company" : "Entreprise"]: [
      { label: isEn ? "About" : "À propos", href: "#" },
      { label: isEn ? "Contact" : "Contact", href: "mailto:m.laeticia@hotmail.fr" },
      { label: isEn ? "Blog" : "Blog", href: "#" },
    ],
    [isEn ? "Legal" : "Légal"]: [
      { label: t("landing.footer.privacy"), href: "/privacy" },
      { label: t("landing.footer.terms"), href: "/terms" },
      { label: "GDPR", href: "#" },
    ],
  };

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Growth OS</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              {isEn 
                ? "The complete digital company. Subscribe to all departments or choose only what you need."
                : "L'entreprise digitale complète. Abonnez-vous à tous les départements ou choisissez uniquement ce dont vous avez besoin."
              }
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {isEn ? "Premium Competence" : "Compétence Premium"}
              </Badge>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 text-sm">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') || link.href.startsWith('mailto:') ? (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2026 EmotionsCare Sasu. {isEn ? "All rights reserved." : "Tous droits réservés."}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Growth OS {isEn ? "is a product of" : "est un produit de"} EmotionsCare Sasu
              {" · "}
              <Link to="/privacy" className="hover:text-foreground underline">
                {isEn ? "Privacy Policy" : "Politique de confidentialité"}
              </Link>
              {" · "}
              <Link to="/terms" className="hover:text-foreground underline">
                {isEn ? "Terms of Service" : "Conditions d'utilisation"}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="mailto:support@agent-growth-automator.com?subject=Demande de support Growth OS" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mr-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              Besoin d'aide ?
            </a>
            <a href="mailto:m.laeticia@hotmail.fr" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Email">
              <Mail className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="YouTube">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
