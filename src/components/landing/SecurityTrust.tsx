import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, FileCheck, Server, UserCheck } from "lucide-react";

const features = [
  { key: "encryption", icon: Lock },
  { key: "rbac", icon: UserCheck },
  { key: "audit", icon: Eye },
  { key: "gdpr", icon: FileCheck },
  { key: "hosting", icon: Server },
  { key: "approvals", icon: Shield },
] as const;

export function SecurityTrust() {
  const { t } = useTranslation();

  return (
    <section className="py-20 relative" id="security">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Shield className="w-3 h-3 mr-1" />
            {t("landing.security.badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("landing.security.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("landing.security.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map(({ key, icon: Icon }) => (
            <Card key={key} className="p-6 border-border/50 hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t(`landing.security.${key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`landing.security.${key}.desc`)}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
