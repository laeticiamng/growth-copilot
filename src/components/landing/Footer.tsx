import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export function Footer() {
  const footerLinks = {
    Produit: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Tarifs", href: "#pricing" },
      { label: "Intégrations", href: "#tools" },
      { label: "Changelog", href: "#" },
    ],
    Ressources: [
      { label: "Documentation", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Études de cas", href: "#" },
      { label: "API", href: "#" },
    ],
    Entreprise: [
      { label: "À propos", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Carrières", href: "#" },
      { label: "Partenaires", href: "#" },
    ],
    Légal: [
      { label: "Confidentialité", href: "#" },
      { label: "CGU", href: "#" },
      { label: "RGPD", href: "#" },
      { label: "Sécurité", href: "#" },
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
            <p className="text-sm text-muted-foreground max-w-xs">
              Automatise ta croissance avec des agents IA. SEO, Ads, CRO, Local — tout en un.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 text-sm">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Growth OS. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Twitter
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
