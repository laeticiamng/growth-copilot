/**
 * Trust Bar Component - Security & Compliance badges
 * Displayed under the hero section
 */
import { Shield, Lock, Flag, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

export function TrustBar() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const TRUST_ITEMS = [
    { icon: Shield, label: isEn ? "GDPR Compliant" : "Conforme RGPD" },
    { icon: Flag, label: isEn ? "EU-hosted data" : "Données hébergées en Europe" },
    { icon: Lock, label: isEn ? "AES-256 encryption" : "Chiffrement AES-256" },
    { icon: Award, label: isEn ? "SOC 2 in progress" : "SOC 2 en cours" },
  ];

  return (
    <section className="py-6 border-b border-border/50 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-muted-foreground text-sm"
            >
              <item.icon className="w-4 h-4 text-primary/70" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
