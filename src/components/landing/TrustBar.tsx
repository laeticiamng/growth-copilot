/**
 * Trust Bar Component - Security & Compliance badges
 * Displayed under the hero section
 */
import { Shield, Lock, Flag, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

export function TrustBar() {
  const { t } = useTranslation();

  const TRUST_ITEMS = [
    { icon: Shield, labelKey: "landing.trustBar.gdpr" },
    { icon: Flag, labelKey: "landing.trustBar.euHosted" },
    { icon: Lock, labelKey: "landing.trustBar.encryption" },
    { icon: Award, labelKey: "landing.trustBar.soc2" },
  ];

  return (
    <section className="py-6 border-b border-border/50 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.labelKey}
              className="flex items-center gap-2 text-muted-foreground text-sm"
            >
              <item.icon className="w-4 h-4 text-primary/70" />
              <span>{t(item.labelKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
