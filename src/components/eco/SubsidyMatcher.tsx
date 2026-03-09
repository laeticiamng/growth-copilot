import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, Euro, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Subsidy {
  id: string;
  name: string;
  provider: string;
  maxAmount: string;
  deadline: string;
  daysLeft: number;
  eligibility: number;
  matchedActions: string[];
  url: string;
}

const DEMO_SUBSIDIES: Subsidy[] = [
  {
    id: "1", name: "Tremplin pour la transition écologique des PME", provider: "ADEME",
    maxAmount: "200 000 €", deadline: "2026-06-30", daysLeft: 113,
    eligibility: 92, matchedActions: ["Panneaux solaires", "LED", "Achats responsables"],
    url: "https://agirpourlatransition.ademe.fr/entreprises/aides-financieres/2024/tremplin-transition-ecologique-pme",
  },
  {
    id: "2", name: "France 2030 — Industrie verte", provider: "France 2030",
    maxAmount: "500 000 €", deadline: "2026-09-15", daysLeft: 190,
    eligibility: 78, matchedActions: ["Optimisation logistique", "Green IT"],
    url: "https://www.gouvernement.fr/france-2030",
  },
  {
    id: "3", name: "Prêt vert BPI", provider: "BPI France",
    maxAmount: "1 000 000 €", deadline: "Permanent", daysLeft: 999,
    eligibility: 85, matchedActions: ["Flotte électrique", "Panneaux solaires"],
    url: "https://www.bpifrance.fr/catalogue-offres/transition-ecologique-et-energetique/pret-vert",
  },
  {
    id: "4", name: "Fonds chaleur renouvelable", provider: "ADEME",
    maxAmount: "100 000 €", deadline: "2026-04-30", daysLeft: 52,
    eligibility: 60, matchedActions: ["Chauffage"],
    url: "https://agirpourlatransition.ademe.fr/entreprises/aides-financieres/fonds-chaleur",
  },
  {
    id: "5", name: "Aide régionale transition énergétique", provider: "Région Île-de-France",
    maxAmount: "50 000 €", deadline: "2026-05-15", daysLeft: 67,
    eligibility: 70, matchedActions: ["LED", "Panneaux solaires"],
    url: "https://www.iledefrance.fr/aides-et-appels-a-projets",
  },
];

function getDeadlineBadge(daysLeft: number, t: (key: string) => string) {
  if (daysLeft > 180) return <Badge variant="success" className="text-[10px]"><Clock className="h-2.5 w-2.5 mr-1" />{t("eco.permanent")}</Badge>;
  if (daysLeft > 90) return <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400"><Clock className="h-2.5 w-2.5 mr-1" />{daysLeft}j</Badge>;
  if (daysLeft > 30) return <Badge variant="warning" className="text-[10px]"><AlertTriangle className="h-2.5 w-2.5 mr-1" />{daysLeft}j</Badge>;
  return <Badge variant="error" className="text-[10px]"><AlertTriangle className="h-2.5 w-2.5 mr-1" />{daysLeft}j — {t("eco.urgent")}</Badge>;
}

export function SubsidyMatcher() {
  const { t } = useTranslation();

  const handleApply = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{t("eco.subsidiesTitle")}</h3>
        <p className="text-sm text-muted-foreground">{t("eco.subsidiesDesc")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {DEMO_SUBSIDIES.map(sub => (
          <Card key={sub.id} className="border-border bg-card hover:border-emerald-500/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-semibold">{sub.provider}</Badge>
                    {getDeadlineBadge(sub.daysLeft, t)}
                  </div>
                  <h4 className="font-medium text-sm mt-2">{sub.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-sm font-semibold text-emerald-400">
                      <Euro className="h-3.5 w-3.5" /> {sub.maxAmount}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" /> {t("eco.eligibility")} {sub.eligibility}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sub.matchedActions.map(a => (
                      <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0" onClick={() => handleApply(sub.url)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> {t("eco.apply")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
