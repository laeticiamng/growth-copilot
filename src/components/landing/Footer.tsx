import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Zap, Twitter, Linkedin, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    [t("landing.footer.product")]: [
      { label: t("landing.footer.features"), href: "#features" },
      { label: t("landing.footer.departments"), href: "#services" },
      { label: t("landing.footer.pricing"), href: "#pricing" },
      { label: t("landing.footer.integrations"), href: "#tools" },
    ],
    [t("landing.footer.resources")]: [
      { label: t("landing.footer.documentation"), href: "/about" },
      { label: t("landing.footer.status"), href: "/contact" },
      { label: t("landing.footer.roadmap"), href: "/roadmap" },
    ],
    [t("landing.footer.company")]: [
      { label: t("landing.footer.about"), href: "/about" },
      { label: t("landing.footer.contact"), href: "/contact" },
      { label: t("landing.footer.legalNotice"), href: "/legal" },
    ],
    [t("landing.footer.legal")]: [
      { label: t("landing.footer.terms"), href: "/terms" },
      { label: t("landing.footer.privacy"), href: "/privacy" },
      { label: t("landing.footer.rgpd"), href: "/privacy#gdpr" },
    ],
  };

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Growth OS</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              {t("landing.footer.brandDescription")}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {t("landing.footer.premiumCompetence")}
              </Badge>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 text-sm">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    ) : link.href.startsWith('#') ? (
                      <a href={link.href} onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(link.href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        {link.label}
                      </a>
                    ) : (
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{t("landing.footer.copyright")}</p>
          <div className="flex items-center gap-4">
            <a href="mailto:contact@growthOS.ai" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Email"><Mail className="w-5 h-5" /></a>
            <a href="https://twitter.com/growthOS_ai" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
            <a href="https://linkedin.com/company/growth-os-ai" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
