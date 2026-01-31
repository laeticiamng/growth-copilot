import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Link as LinkIcon, 
  Scan, 
  Bot, 
  LineChart,
  CheckCircle2
} from "lucide-react";

export function HowItWorks() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const stepsFr = [
    {
      number: "01",
      icon: LinkIcon,
      title: "Colle ton URL",
      description: "Entre l'adresse de ton site, ton secteur, et tes objectifs. 30 secondes chrono.",
      details: ["Détection automatique du CMS", "Analyse secteur et concurrence", "Définition des KPIs"],
    },
    {
      number: "02",
      icon: Scan,
      title: "Audit automatique",
      description: "Nos agents analysent technique, contenu, local, conversion, et concurrents.",
      details: ["Crawl technique complet", "Analyse mots-clés GSC", "Scoring opportunités"],
    },
    {
      number: "03",
      icon: Bot,
      title: "Exécution & Optimisation",
      description: "Actions priorisées, correctifs appliqués, campagnes lancées. Tu valides, on exécute.",
      details: ["Corrections SEO auto", "Briefs et drafts IA", "Campagnes Ads optimisées"],
    },
    {
      number: "04",
      icon: LineChart,
      title: "Reporting & Amélioration",
      description: "Dashboard live, alertes, rapports mensuels. On apprend, on s'améliore.",
      details: ["KPIs temps réel", "Rapports PDF auto", "Cycle d'amélioration continue"],
    },
  ];

  const stepsEn = [
    {
      number: "01",
      icon: LinkIcon,
      title: "Paste your URL",
      description: "Enter your site address, industry, and objectives. 30 seconds flat.",
      details: ["Automatic CMS detection", "Industry & competition analysis", "KPI definition"],
    },
    {
      number: "02",
      icon: Scan,
      title: "Automatic audit",
      description: "Our agents analyze technical, content, local, conversion, and competitors.",
      details: ["Complete technical crawl", "GSC keyword analysis", "Opportunity scoring"],
    },
    {
      number: "03",
      icon: Bot,
      title: "Execution & Optimization",
      description: "Prioritized actions, fixes applied, campaigns launched. You validate, we execute.",
      details: ["Auto SEO fixes", "AI briefs and drafts", "Optimized Ads campaigns"],
    },
    {
      number: "04",
      icon: LineChart,
      title: "Reporting & Improvement",
      description: "Live dashboard, alerts, monthly reports. We learn, we improve.",
      details: ["Real-time KPIs", "Auto PDF reports", "Continuous improvement cycle"],
    },
  ];

  const steps = isEn ? stepsEn : stepsFr;

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="agent" className="mb-4">
            {t("landing.navbar.howItWorks")}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t("landing.howItWorks.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("landing.howItWorks.subtitle")}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card
              key={step.number}
              variant="feature"
              className="relative overflow-hidden fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardContent className="p-8">
                {/* Step Number */}
                <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6 glow-primary">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-6">{step.description}</p>

                {/* Details */}
                <ul className="space-y-2">
                  {step.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
