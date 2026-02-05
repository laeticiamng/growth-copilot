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
import { SEOHead } from "@/components/SEOHead";

const features = [
  {
    icon: Zap,
    title: "Fonctionne hors ligne",
    description: "Accédez à vos outils même sans connexion internet",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Recevez des alertes en temps réel sur vos actions IA",
  },
  {
    icon: Smartphone,
    title: "Accès rapide",
    description: "Lancez l'app directement depuis votre écran d'accueil",
  },
  {
    icon: Shield,
    title: "Données sécurisées",
    description: "Vos données restent protégées et chiffrées",
  },
];

const faqItems = [
  {
    question: "Qu'est-ce qu'une PWA ?",
    answer:
      "Une Progressive Web App (PWA) est une application web qui fonctionne comme une application native. Elle s'installe sur votre appareil, fonctionne hors ligne et offre une expérience rapide.",
  },
  {
    question: "L'installation est-elle gratuite ?",
    answer:
      "Oui, l'installation est entièrement gratuite. Il n'y a aucun passage par l'App Store ou le Play Store.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Absolument. Vos données sont chiffrées et stockées de manière sécurisée. L'application respecte le RGPD et vos données personnelles ne sont jamais partagées.",
  },
  {
    question: "Puis-je désinstaller l'application ?",
    answer:
      "Oui, vous pouvez la désinstaller à tout moment comme n'importe quelle autre application sur votre appareil.",
  },
  {
    question: "L'app fonctionne-t-elle sur tous les appareils ?",
    answer:
      "Growth OS fonctionne sur tous les appareils modernes : iPhone, iPad, Android, Windows, Mac et Linux. Utilisez Chrome, Edge, Safari ou Brave pour une expérience optimale.",
  },
];

export default function Install() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Installer l'application"
        description="Installez Growth OS sur votre appareil. Application PWA disponible sur iPhone, Android et ordinateur. Accès rapide, notifications et mode hors ligne."
        canonical="/install"
      />
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent"
          >
            Growth OS
          </button>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Se connecter
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Download className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Installez Growth OS sur votre appareil
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Accédez à votre cockpit marketing en un clic, même hors ligne.
            Installation rapide, sans App Store.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {features.map((feature) => (
            <Card key={feature.title} variant="feature">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Installation Instructions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">
              Instructions d'installation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ios" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ios" className="gap-2">
                  <Apple className="w-4 h-4" />
                  iPhone / iPad
                </TabsTrigger>
                <TabsTrigger value="android" className="gap-2">
                  <Smartphone className="w-4 h-4" />
                  Android
                </TabsTrigger>
                <TabsTrigger value="desktop" className="gap-2">
                  <Monitor className="w-4 h-4" />
                  Ordinateur
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ios" className="mt-6">
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">
                    Installation sur iPhone / iPad
                  </h3>
                  <p className="text-muted-foreground">
                    Utilisez Safari pour une installation optimale
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Ouvrez Safari</p>
                        <p className="text-sm text-muted-foreground">
                          Chrome et Firefox ne supportent pas l'installation PWA
                          sur iOS
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">
                          Appuyez sur le bouton Partager
                        </p>
                        <p className="text-sm text-muted-foreground">
                          L'icône carrée avec une flèche vers le haut, en bas de
                          l'écran
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">
                          Sélectionnez « Sur l'écran d'accueil »
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Faites défiler vers le bas si nécessaire
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Confirmez avec « Ajouter »</p>
                        <p className="text-sm text-muted-foreground">
                          L'icône Growth OS apparaîtra sur votre écran d'accueil
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="android" className="mt-6">
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">
                    Installation sur Android
                  </h3>
                  <p className="text-muted-foreground">
                    Chrome est recommandé pour une meilleure expérience
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Ouvrez Chrome</p>
                        <p className="text-sm text-muted-foreground">
                          Ou tout autre navigateur Chromium (Edge, Brave, Opera)
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">
                          Appuyez sur le menu (⋮) en haut à droite
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Les trois points verticaux
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">
                          Sélectionnez « Installer l'application »
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ou « Ajouter à l'écran d'accueil » selon votre version
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Confirmez l'installation</p>
                        <p className="text-sm text-muted-foreground">
                          L'application sera disponible dans votre liste d'apps
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm">
                      <strong>💡 Astuce :</strong> Si une bannière d'installation
                      apparaît automatiquement en bas de l'écran, appuyez
                      simplement sur « Installer ».
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="desktop" className="mt-6">
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">
                    Installation sur ordinateur
                  </h3>
                  <p className="text-muted-foreground">
                    Chrome, Edge ou Brave sont recommandés
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">
                          Ouvrez Chrome, Edge ou Brave
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Firefox ne supporte pas encore l'installation PWA sur
                          desktop
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">
                          Cherchez l'icône d'installation
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Dans la barre d'adresse, à droite, cliquez sur l'icône
                          ⊕ ou 📥
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">
                          Cliquez sur « Installer »
                        </p>
                        <p className="text-sm text-muted-foreground">
                          L'application s'ouvrira dans sa propre fenêtre
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm">
                      <strong>⌨️ Raccourci Chrome/Edge :</strong> Menu (⋮) →
                      « Installer Growth OS... » ou « Plus d'outils » →
                      « Créer un raccourci »
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Questions fréquentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Prêt à booster votre marketing avec l'IA ?
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Commencer gratuitement
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 EmotionsCare SASU — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
