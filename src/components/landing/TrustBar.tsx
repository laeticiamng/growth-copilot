/**
 * Trust Bar Component - Security & Compliance badges
 * Displayed under the hero section
 */
import { Shield, Lock, Flag, Award } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Shield, label: "Conforme RGPD" },
  { icon: Flag, label: "Données hébergées en Europe" },
  { icon: Lock, label: "Chiffrement AES-256" },
  { icon: Award, label: "SOC 2 en cours" },
];

export function TrustBar() {
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
