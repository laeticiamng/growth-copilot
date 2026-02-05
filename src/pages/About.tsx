/**
 * About Page - Mission, Team & Values
 */
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Users, Eye, Shield, Sparkles, Heart } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
const VALUES = [
  {
    icon: Eye,
    title: "Transparence IA",
    description:
      "Chaque action des agents est tracée et auditable. Vous savez exactement ce qui est fait et pourquoi.",
  },
  {
    icon: Sparkles,
    title: "Compétence Premium",
    description:
      "39 experts IA formés aux meilleures pratiques du marché. Pas de promesses vides, des résultats mesurables.",
  },
  {
    icon: Heart,
    title: "Simplicité Absolue",
    description:
      "Une interface pensée pour les dirigeants, pas les techniciens. Zéro jargon, 100% action.",
  },
  {
    icon: Shield,
    title: "Sécurité & Éthique",
    description:
      "Données hébergées en Europe, chiffrées AES-256. Aucune manipulation d'engagement, respect des plateformes.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="À propos"
        description="Découvrez la mission de Growth OS : démocratiser l'accès à une entreprise digitale complète avec 39 agents IA. Créé par EmotionsCare SASU."
        canonical="/about"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "À propos de Growth OS",
          "description": "Mission, équipe et valeurs de Growth OS",
          "publisher": {
            "@type": "Organization",
            "name": "EmotionsCare SASU"
          }
        }}
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="secondary" className="mb-4">
            Notre mission
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Démocratiser l'accès à une{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              entreprise digitale complète
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Growth OS permet à chaque entrepreneur d'accéder aux compétences d'une équipe
            de 39 experts — marketing, ventes, finance, support — sans recruter,
            sans former, sans gérer.
          </p>
        </section>

        {/* Story Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">L'histoire de Growth OS</h2>
                  <p className="text-muted-foreground">Par EmotionsCare SASU</p>
                </div>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Growth OS est né d'un constat simple : les PME et startups ont besoin des mêmes
                  compétences que les grandes entreprises, mais n'ont pas les moyens de recruter
                  une équipe complète.
                </p>
                <p>
                  Nous avons créé une plateforme qui met à disposition 39 agents IA spécialisés,
                  chacun expert dans son domaine : SEO, rédaction, publicité, analyse de données,
                  gestion de la réputation, et bien plus.
                </p>
                <p>
                  Ces agents travaillent 24h/24, coordonnés par une intelligence centrale qui
                  optimise chaque action pour maximiser votre croissance. Le tout, supervisé
                  par vous via une interface simple et transparente.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nos valeurs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Quatre principes qui guident chaque décision, chaque ligne de code,
              chaque interaction avec nos clients.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {VALUES.map((value) => (
              <Card key={value.title} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <value.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">L'équipe</h2>
          </div>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">EC</span>
              </div>
              <h3 className="text-xl font-semibold mb-1">EmotionsCare SASU</h3>
              <p className="text-muted-foreground mb-4">Créateur de Growth OS</p>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                EmotionsCare développe des solutions technologiques qui augmentent les capacités
                humaines. Growth OS est notre vision d'une entreprise digitale accessible à tous.
              </p>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Contact : <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>
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
