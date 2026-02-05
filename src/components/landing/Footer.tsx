import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Zap, Twitter, Linkedin, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const footerLinks = {
    [isEn ? "Product" : "Produit"]: [
      { label: isEn ? "Features" : "Fonctionnalités", href: "#features" },
      { label: isEn ? "Departments" : "Départements", href: "#services" },
      { label: isEn ? "Pricing" : "Tarifs", href: "#pricing" },
      { label: isEn ? "Integrations" : "Intégrations", href: "#tools" },
    ],
    [isEn ? "Resources" : "Ressources"]: [
      { label: "Documentation", href: "/dashboard/guide" },
      { label: "Blog", href: "#" },
      { label: isEn ? "Status" : "Statut", href: "/dashboard/status" },
      { label: "API", href: "/dashboard/api-docs" },
    ],
    [isEn ? "Company" : "Entreprise"]: [
      { label: isEn ? "About" : "À propos", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: isEn ? "Legal Notice" : "Mentions légales", href: "/legal" },
    ],
    [isEn ? "Legal" : "Légal"]: [
      { label: isEn ? "Terms" : "CGU", href: "/terms" },
      { label: isEn ? "Privacy" : "Confidentialité", href: "/privacy" },
      { label: "RGPD", href: "/privacy#gdpr" },
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
              © 2026 EmotionsCare SASU — {isEn ? "All rights reserved." : "Tous droits réservés."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a href="mailto:contact@emotionscare.com" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Email">
              <Mail className="w-5 h-5" />
            </a>
            <a href="https://twitter.com/emotionscare" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com/company/emotionscare" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
