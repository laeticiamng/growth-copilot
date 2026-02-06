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
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  // Translated values
  const VALUES = [
    {
      icon: Eye,
      title: isEn ? "AI Transparency" : "Transparence IA",
      description: isEn
        ? "Every agent action is tracked and auditable. You know exactly what's done and why."
        : "Chaque action des agents est tracée et auditable. Vous savez exactement ce qui est fait et pourquoi.",
    },
    {
      icon: Sparkles,
      title: isEn ? "Premium Expertise" : "Compétence Premium",
      description: isEn
        ? "39 AI experts trained on market best practices. No empty promises, measurable results."
        : "39 experts IA formés aux meilleures pratiques du marché. Pas de promesses vides, des résultats mesurables.",
    },
    {
      icon: Heart,
      title: isEn ? "Absolute Simplicity" : "Simplicité Absolue",
      description: isEn
        ? "An interface designed for leaders, not technicians. Zero jargon, 100% action."
        : "Une interface pensée pour les dirigeants, pas les techniciens. Zéro jargon, 100% action.",
    },
    {
      icon: Shield,
      title: isEn ? "Security & Ethics" : "Sécurité & Éthique",
      description: isEn
        ? "Data hosted in Europe, AES-256 encrypted. No engagement manipulation, platform compliance."
        : "Données hébergées en Europe, chiffrées AES-256. Aucune manipulation d'engagement, respect des plateformes.",
    },
  ];

  // Translated content
  const content = {
    missionBadge: isEn ? "Our mission" : "Notre mission",
    missionTitle: isEn ? "Democratize access to a " : "Démocratiser l'accès à une ",
    missionTitleHighlight: isEn ? "complete digital company" : "entreprise digitale complète",
    missionDescription: isEn
      ? "Growth OS enables every entrepreneur to access the skills of a 39-expert team — marketing, sales, finance, support — without hiring, training, or managing."
      : "Growth OS permet à chaque entrepreneur d'accéder aux compétences d'une équipe de 39 experts — marketing, ventes, finance, support — sans recruter, sans former, sans gérer.",
    storyTitle: isEn ? "The story of Growth OS" : "L'histoire de Growth OS",
    storyBy: isEn ? "By EmotionsCare SASU" : "Par EmotionsCare SASU",
    storyP1: isEn
      ? "Growth OS was born from a simple observation: SMBs and startups need the same skills as large companies but don't have the resources to hire a complete team."
      : "Growth OS est né d'un constat simple : les PME et startups ont besoin des mêmes compétences que les grandes entreprises, mais n'ont pas les moyens de recruter une équipe complète.",
    storyP2: isEn
      ? "We created a platform that provides 39 specialized AI agents, each an expert in their field: SEO, copywriting, advertising, data analysis, reputation management, and much more."
      : "Nous avons créé une plateforme qui met à disposition 39 agents IA spécialisés, chacun expert dans son domaine : SEO, rédaction, publicité, analyse de données, gestion de la réputation, et bien plus.",
    storyP3: isEn
      ? "These agents work 24/7, coordinated by a central intelligence that optimizes every action to maximize your growth. All supervised by you through a simple, transparent interface."
      : "Ces agents travaillent 24h/24, coordonnés par une intelligence centrale qui optimise chaque action pour maximiser votre croissance. Le tout, supervisé par vous via une interface simple et transparente.",
    valuesTitle: isEn ? "Our values" : "Nos valeurs",
    valuesSubtitle: isEn
      ? "Four principles that guide every decision, every line of code, every interaction with our clients."
      : "Quatre principes qui guident chaque décision, chaque ligne de code, chaque interaction avec nos clients.",
    teamTitle: isEn ? "The team" : "L'équipe",
    teamName: "EmotionsCare SASU",
    teamRole: isEn ? "Creator of Growth OS" : "Créateur de Growth OS",
    teamDescription: isEn
      ? "EmotionsCare develops technological solutions that augment human capabilities. Growth OS is our vision of a digital company accessible to everyone."
      : "EmotionsCare développe des solutions technologiques qui augmentent les capacités humaines. Growth OS est notre vision d'une entreprise digitale accessible à tous.",
    contact: "Contact : ",
    seoTitle: isEn ? "About" : "À propos",
    seoDescription: isEn
      ? "Discover Growth OS's mission: democratizing access to a complete digital company with 39 AI agents. Created by EmotionsCare SASU."
      : "Découvrez la mission de Growth OS : démocratiser l'accès à une entreprise digitale complète avec 39 agents IA. Créé par EmotionsCare SASU.",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={content.seoTitle}
        description={content.seoDescription}
        canonical="/about"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": isEn ? "About Growth OS" : "À propos de Growth OS",
          "description": isEn ? "Mission, team and values of Growth OS" : "Mission, équipe et valeurs de Growth OS",
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
            {content.missionBadge}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {content.missionTitle}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {content.missionTitleHighlight}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            {content.missionDescription}
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
                  <h2 className="text-2xl font-bold">{content.storyTitle}</h2>
                  <p className="text-muted-foreground">{content.storyBy}</p>
                </div>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>{content.storyP1}</p>
                <p>{content.storyP2}</p>
                <p>{content.storyP3}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.valuesTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {content.valuesSubtitle}
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
            <h2 className="text-2xl font-bold">{content.teamTitle}</h2>
          </div>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">EC</span>
              </div>
              <h3 className="text-xl font-semibold mb-1">{content.teamName}</h3>
              <p className="text-muted-foreground mb-4">{content.teamRole}</p>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                {content.teamDescription}
              </p>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {content.contact}<a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>
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
