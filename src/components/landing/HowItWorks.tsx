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
  const { t } = useTranslation();

  const steps = [
    { number: "01", icon: LinkIcon, key: "step1" },
    { number: "02", icon: Scan, key: "step2" },
    { number: "03", icon: Bot, key: "step3" },
    { number: "04", icon: LineChart, key: "step4" },
  ];

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
                <h3 className="text-xl font-semibold mb-3">
                  {t(`landing.howItWorks.${step.key}.title`)}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t(`landing.howItWorks.${step.key}.description`)}
                </p>

                {/* Details */}
                <ul className="space-y-2">
                  {[1, 2, 3].map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{t(`landing.howItWorks.${step.key}.detail${d}`)}</span>
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
