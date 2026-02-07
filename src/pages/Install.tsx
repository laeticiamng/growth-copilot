import { Smartphone, Bell, Zap, Shield, Download, Monitor, Apple } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function Install() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    { icon: Zap, titleKey: "pages.install.features.offline", descKey: "pages.install.features.offlineDesc" },
    { icon: Bell, titleKey: "pages.install.features.notifications", descKey: "pages.install.features.notificationsDesc" },
    { icon: Smartphone, titleKey: "pages.install.features.quickAccess", descKey: "pages.install.features.quickAccessDesc" },
    { icon: Shield, titleKey: "pages.install.features.secureData", descKey: "pages.install.features.secureDataDesc" },
  ];

  const faqItems = [
    { qKey: "pages.install.faq.whatIsPwa", aKey: "pages.install.faq.whatIsPwaAnswer" },
    { qKey: "pages.install.faq.isFree", aKey: "pages.install.faq.isFreeAnswer" },
    { qKey: "pages.install.faq.isSecure", aKey: "pages.install.faq.isSecureAnswer" },
    { qKey: "pages.install.faq.canUninstall", aKey: "pages.install.faq.canUninstallAnswer" },
    { qKey: "pages.install.faq.allDevices", aKey: "pages.install.faq.allDevicesAnswer" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("pages.install.seoTitle")}
        description={t("pages.install.seoDescription")}
        canonical="/install"
      />
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-4xl pt-24">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Download className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">{t("pages.install.title")}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("pages.install.subtitle")}</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {features.map((feature) => (
            <Card key={feature.titleKey} variant="feature">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t(feature.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(feature.descKey)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Installation Instructions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">{t("pages.install.instructions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ios" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ios" className="gap-2"><Apple className="w-4 h-4" />iPhone / iPad</TabsTrigger>
                <TabsTrigger value="android" className="gap-2"><Smartphone className="w-4 h-4" />Android</TabsTrigger>
                <TabsTrigger value="desktop" className="gap-2"><Monitor className="w-4 h-4" />{t("pages.install.desktop")}</TabsTrigger>
              </TabsList>

              <TabsContent value="ios" className="mt-6">
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">{t("pages.install.ios.title")}</h3>
                  <p className="text-muted-foreground">{t("pages.install.ios.subtitle")}</p>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(step => (
                      <div key={step} className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{step}</div>
                        <div>
                          <p className="font-medium">{t(`pages.install.ios.step${step}`)}</p>
                          <p className="text-sm text-muted-foreground">{t(`pages.install.ios.step${step}Detail`)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="android" className="mt-6">
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">{t("pages.install.android.title")}</h3>
                  <p className="text-muted-foreground">{t("pages.install.android.subtitle")}</p>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(step => (
                      <div key={step} className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{step}</div>
                        <div>
                          <p className="font-medium">{t(`pages.install.android.step${step}`)}</p>
                          <p className="text-sm text-muted-foreground">{t(`pages.install.android.step${step}Detail`)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm"><strong>💡 {t("pages.install.android.tip")}</strong></p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="desktop" className="mt-6">
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">{t("pages.install.desktopTab.title")}</h3>
                  <p className="text-muted-foreground">{t("pages.install.desktopTab.subtitle")}</p>
                  <div className="space-y-4">
                    {[1, 2, 3].map(step => (
                      <div key={step} className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{step}</div>
                        <div>
                          <p className="font-medium">{t(`pages.install.desktopTab.step${step}`)}</p>
                          <p className="text-sm text-muted-foreground">{t(`pages.install.desktopTab.step${step}Detail`)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm"><strong>⌨️ {t("pages.install.desktopTab.shortcut")}</strong></p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t("pages.install.faqTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{t(item.qKey)}</AccordionTrigger>
                  <AccordionContent>{t(item.aKey)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">{t("pages.install.ctaText")}</p>
          <Button size="lg" onClick={() => navigate("/auth")}>{t("pages.install.ctaButton")}</Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
