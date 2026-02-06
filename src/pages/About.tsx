/**
 * About Page - Mission, Team & Values
 */
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Users, Eye, Shield, Sparkles, Heart } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

export default function About() {
  const { t } = useTranslation();

  const VALUES = [
    { icon: Eye, titleKey: "pages.about.value1Title", descKey: "pages.about.value1Desc" },
    { icon: Sparkles, titleKey: "pages.about.value2Title", descKey: "pages.about.value2Desc" },
    { icon: Heart, titleKey: "pages.about.value3Title", descKey: "pages.about.value3Desc" },
    { icon: Shield, titleKey: "pages.about.value4Title", descKey: "pages.about.value4Desc" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("pages.about.seoTitle")}
        description={t("pages.about.seoDescription")}
        canonical="/about"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": t("pages.about.schemaName"),
          "description": t("pages.about.schemaDesc"),
          "publisher": { "@type": "Organization", "name": "EmotionsCare SASU" }
        }}
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-20">
        <section className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="secondary" className="mb-4">{t("pages.about.missionBadge")}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("pages.about.missionTitle")}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t("pages.about.missionTitleHighlight")}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">{t("pages.about.missionDescription")}</p>
        </section>

        <section className="max-w-4xl mx-auto mb-20">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t("pages.about.storyTitle")}</h2>
                  <p className="text-muted-foreground">{t("pages.about.storyBy")}</p>
                </div>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>{t("pages.about.storyP1")}</p>
                <p>{t("pages.about.storyP2")}</p>
                <p>{t("pages.about.storyP3")}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("pages.about.valuesTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("pages.about.valuesSubtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {VALUES.map((value) => (
              <Card key={value.titleKey} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <value.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{t(value.titleKey)}</h3>
                      <p className="text-sm text-muted-foreground">{t(value.descKey)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{t("pages.about.teamTitle")}</h2>
          </div>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">EC</span>
              </div>
              <h3 className="text-xl font-semibold mb-1">EmotionsCare SASU</h3>
              <p className="text-muted-foreground mb-4">{t("pages.about.teamRole")}</p>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">{t("pages.about.teamDescription")}</p>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {t("pages.about.contact")}<a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
