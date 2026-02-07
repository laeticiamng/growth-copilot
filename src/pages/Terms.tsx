import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Scale, Building2, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const LAST_UPDATED = "5 février 2026";

export default function Terms() {
  const { t, i18n } = useTranslation();
  const isFr = i18n.language === "fr";
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Conditions Générales d'Utilisation"
        description="CGU de Growth OS. Conditions d'accès, tarification, propriété intellectuelle et responsabilités pour l'utilisation de la plateforme."
        canonical="/terms"
      />
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-16 pt-24">
        <div className="container max-w-4xl px-4">
          {!isFr && (
            <Badge variant="outline" className="mb-4">
              {t("common.frenchOnly")}
            </Badge>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-muted-foreground text-lg">
            Dernière mise à jour : {LAST_UPDATED}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-12 px-4">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          
          {/* Préambule */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
              Préambule et définitions
            </h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation 
              de la plateforme <strong>Growth OS</strong>, éditée par :
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <strong>EmotionsCare SASU</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Société par Actions Simplifiée Unipersonnelle<br />
                Siège social : France<br />
                Contact : <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>
              </p>
            </div>
            <p>Dans les présentes CGU, les termes suivants ont la signification indiquée :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>« Plateforme »</strong> : le service Growth OS accessible à l'adresse agent-growth-automator.lovable.app</li>
              <li><strong>« Utilisateur »</strong> : toute personne physique ou morale accédant à la Plateforme</li>
              <li><strong>« Client »</strong> : tout Utilisateur ayant souscrit un abonnement payant</li>
              <li><strong>« Agents IA »</strong> : les assistants artificiels intégrés à la Plateforme</li>
              <li><strong>« Workspace »</strong> : l'espace de travail attribué à chaque Client</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
              Objet du service
            </h2>
            <p>
              Growth OS est une <strong>plateforme SaaS B2B d'agents IA</strong> destinée à assister les entreprises 
              dans la gestion et l'optimisation de leurs activités. Le service comprend notamment :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>39 agents IA spécialisés répartis en 11 départements (Marketing, Sales, Finance, RH, etc.)</li>
              <li>Intégrations avec Google (Analytics, Search Console, Ads, Business Profile)</li>
              <li>Intégrations avec Meta (Facebook Ads, Instagram)</li>
              <li>Outils d'audit SEO, de génération de contenu et de reporting automatisé</li>
              <li>Tableaux de bord et analytics en temps réel</li>
              <li>Système d'approbation des actions recommandées par les agents</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
              Acceptation des conditions
            </h2>
            <p>
              L'accès et l'utilisation de la Plateforme impliquent l'acceptation pleine et entière des présentes CGU. 
              En créant un compte ou en utilisant le service, l'Utilisateur reconnaît avoir pris connaissance des 
              présentes CGU et les accepter sans réserve.
            </p>
            <p>
              EmotionsCare SASU se réserve le droit de modifier les présentes CGU à tout moment. Les modifications 
              seront notifiées aux Utilisateurs par email au moins 30 jours avant leur entrée en vigueur.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">4</span>
              Inscription et compte utilisateur
            </h2>
            <p>
              Pour utiliser la Plateforme, l'Utilisateur doit créer un compte en fournissant des informations 
              exactes, complètes et à jour. L'Utilisateur s'engage à :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fournir une adresse email professionnelle valide</li>
              <li>Choisir un mot de passe robuste et le conserver confidentiel</li>
              <li>Informer immédiatement EmotionsCare SASU de toute utilisation non autorisée de son compte</li>
              <li>Mettre à jour ses informations en cas de changement</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">5</span>
              Tarification et paiement
            </h2>
            <h3 className="text-lg font-medium mt-4">5.1 Modèle tarifaire</h3>
            <p>Growth OS propose les formules suivantes :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Full Company</strong> : 9 000 € HT/mois – Accès à tous les départements et agents</li>
              <li><strong>Départements à la carte</strong> : 1 900 € HT/département/mois</li>
              <li><strong>Essai gratuit</strong> : 14 jours d'accès complet sans engagement</li>
            </ul>
            <h3 className="text-lg font-medium mt-4">5.2 Facturation</h3>
            <p>Les paiements sont effectués mensuellement via <strong>Stripe</strong>.</p>
            <h3 className="text-lg font-medium mt-4">5.3 Retard de paiement</h3>
            <p>
              Tout retard de paiement entraînera l'application de pénalités de retard égales à 3 fois 
              le taux d'intérêt légal, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">6</span>
              Durée et résiliation
            </h2>
            <p>
              L'abonnement est conclu pour une durée d'un mois, tacitement reconductible. Le Client peut résilier 
              à tout moment depuis les paramètres de son compte. À l'issue de la résiliation, l'Utilisateur peut 
              exporter ses données pendant 30 jours.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">7</span>
              Utilisation des agents IA
            </h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-600 dark:text-amber-400 font-medium">⚠️ Clause importante</p>
              <p className="text-sm mt-2">
                Les agents IA fournissent des <strong>recommandations</strong> et des <strong>suggestions</strong>. 
                Ces recommandations ne constituent en aucun cas des conseils professionnels, juridiques, financiers ou médicaux.
              </p>
            </div>
            <p>L'Utilisateur reconnaît et accepte que :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La <strong>décision finale</strong> lui appartient exclusivement</li>
              <li>Les résultats dépendent de la qualité des données fournies</li>
              <li>EmotionsCare SASU ne garantit pas l'exactitude des recommandations</li>
              <li>L'Utilisateur doit valider les actions via le système d'approbation</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">8</span>
              Propriété intellectuelle
            </h2>
            <p>
              La Plateforme Growth OS est la propriété exclusive d'EmotionsCare SASU. L'Utilisateur ne se voit 
              conférer qu'un droit d'utilisation personnel, non exclusif et non transférable.
            </p>
            <p>
              L'Utilisateur conserve la propriété de toutes les données qu'il importe. Le contenu généré par les 
              agents IA appartient à l'Utilisateur.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">9</span>
              Services et intégrations tiers
            </h2>
            <p>
              La Plateforme s'intègre avec des services tiers (Google, Meta, Stripe, etc.) via leurs API officielles. 
              L'utilisation de ces services est soumise à leurs propres conditions d'utilisation.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">10</span>
              Limitation de responsabilité
            </h2>
            <p>
              La Plateforme est fournie « en l'état ». En aucun cas la responsabilité totale d'EmotionsCare SASU 
              ne pourra excéder le montant total payé par le Client au cours des 12 derniers mois.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">11</span>
              Droit applicable et juridiction
            </h2>
            <p>
              Les présentes CGU sont régies par le <strong>droit français</strong>. Tout litige sera soumis aux 
              tribunaux compétents du ressort du siège social d'EmotionsCare SASU, sauf disposition légale contraire.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">12</span>
              <Mail className="w-5 h-5" />
              Contact
            </h2>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p><strong>EmotionsCare SASU</strong></p>
              <p className="text-sm text-muted-foreground">
                Email : <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a><br />
                Formulaire : <Link to="/contact" className="text-primary hover:underline">Page de contact</Link>
              </p>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}
