import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Scale, Building2, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SEOHead } from "@/components/SEOHead";

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
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Scale className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Growth OS</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-16">
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

          {/* Objet */}
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

          {/* Acceptation */}
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
              seront notifiées aux Utilisateurs par email au moins 30 jours avant leur entrée en vigueur. La 
              poursuite de l'utilisation du service après cette date vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <Separator />

          {/* Inscription */}
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
            <p>
              L'Utilisateur est seul responsable de l'ensemble des actions effectuées via son compte. 
              EmotionsCare SASU ne pourra être tenue responsable d'un accès non autorisé résultant d'une 
              négligence de l'Utilisateur dans la protection de ses identifiants.
            </p>
          </section>

          <Separator />

          {/* Tarification */}
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
            <p>
              Les paiements sont effectués mensuellement via <strong>Stripe</strong>, notre prestataire de 
              paiement sécurisé. La facturation intervient le 1er de chaque mois pour le mois en cours.
            </p>

            <h3 className="text-lg font-medium mt-4">5.3 Taxes</h3>
            <p>
              Les prix sont indiqués hors taxes. La TVA applicable sera ajoutée conformément à la 
              réglementation en vigueur selon le pays de facturation du Client.
            </p>

            <h3 className="text-lg font-medium mt-4">5.4 Retard de paiement</h3>
            <p>
              Tout retard de paiement entraînera l'application de pénalités de retard égales à 3 fois 
              le taux d'intérêt légal, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement.
            </p>
          </section>

          <Separator />

          {/* Durée et résiliation */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">6</span>
              Durée et résiliation
            </h2>
            
            <h3 className="text-lg font-medium mt-4">6.1 Durée de l'abonnement</h3>
            <p>
              L'abonnement est conclu pour une durée d'un mois, tacitement reconductible. Il se renouvelle 
              automatiquement à chaque échéance mensuelle, sauf résiliation.
            </p>

            <h3 className="text-lg font-medium mt-4">6.2 Résiliation par le Client</h3>
            <p>
              Le Client peut résilier son abonnement à tout moment depuis les paramètres de son compte. 
              La résiliation prend effet à la fin de la période de facturation en cours. Aucun 
              remboursement ne sera effectué pour la période entamée.
            </p>

            <h3 className="text-lg font-medium mt-4">6.3 Résiliation par EmotionsCare SASU</h3>
            <p>
              EmotionsCare SASU peut suspendre ou résilier l'accès d'un Utilisateur en cas de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violation des présentes CGU</li>
              <li>Défaut de paiement après mise en demeure restée infructueuse</li>
              <li>Utilisation frauduleuse ou abusive du service</li>
              <li>Comportement nuisant au fonctionnement de la Plateforme</li>
            </ul>

            <h3 className="text-lg font-medium mt-4">6.4 Conséquences de la résiliation</h3>
            <p>
              À l'issue de la résiliation, l'Utilisateur peut exporter ses données pendant 30 jours. 
              Passé ce délai, les données seront supprimées conformément à notre politique de confidentialité.
            </p>
          </section>

          <Separator />

          {/* Agents IA */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">7</span>
              Utilisation des agents IA
            </h2>
            
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-600 dark:text-amber-400 font-medium">⚠️ Clause importante</p>
              <p className="text-sm mt-2">
                Les agents IA de Growth OS fournissent des <strong>recommandations</strong> et des 
                <strong>suggestions</strong> basées sur l'analyse des données. Ces recommandations ne 
                constituent en aucun cas des conseils professionnels, juridiques, financiers ou médicaux.
              </p>
            </div>

            <p>L'Utilisateur reconnaît et accepte que :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La <strong>décision finale</strong> d'appliquer ou non une recommandation lui appartient exclusivement</li>
              <li>Les résultats des agents IA dépendent de la qualité et de l'exactitude des données fournies</li>
              <li>EmotionsCare SASU ne garantit pas l'exactitude, la pertinence ou l'exhaustivité des recommandations</li>
              <li>L'Utilisateur doit valider les actions avant leur exécution via le système d'approbation</li>
            </ul>
          </section>

          <Separator />

          {/* Propriété intellectuelle */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">8</span>
              Propriété intellectuelle
            </h2>
            
            <h3 className="text-lg font-medium mt-4">8.1 Propriété d'EmotionsCare SASU</h3>
            <p>
              La Plateforme Growth OS, incluant mais non limité à son code source, son architecture, 
              ses interfaces, ses agents IA, ses algorithmes, sa documentation et son design, est la 
              propriété exclusive d'EmotionsCare SASU ou de ses concédants.
            </p>
            <p>
              L'Utilisateur ne se voit conférer qu'un droit d'utilisation personnel, non exclusif et 
              non transférable, pour la durée de son abonnement.
            </p>

            <h3 className="text-lg font-medium mt-4">8.2 Données de l'Utilisateur</h3>
            <p>
              L'Utilisateur conserve la propriété de toutes les données qu'il importe dans la Plateforme. 
              Il concède à EmotionsCare SASU une licence limitée pour traiter ces données aux seules fins 
              de fourniture du service.
            </p>

            <h3 className="text-lg font-medium mt-4">8.3 Contenu généré</h3>
            <p>
              Le contenu généré par les agents IA (textes, rapports, recommandations) appartient à 
              l'Utilisateur. Toutefois, les modèles, templates et méthodologies utilisés restent la 
              propriété d'EmotionsCare SASU.
            </p>
          </section>

          <Separator />

          {/* Intégrations tierces */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">9</span>
              Services et intégrations tiers
            </h2>
            <p>
              La Plateforme s'intègre avec des services tiers (Google, Meta, Stripe, etc.) via leurs API 
              officielles. L'Utilisateur reconnaît que :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>L'utilisation de ces services est soumise à leurs propres conditions d'utilisation</li>
              <li>EmotionsCare SASU n'est pas responsable des modifications, interruptions ou dysfonctionnements de ces services tiers</li>
              <li>Les fonctionnalités dépendant de services tiers peuvent être modifiées ou supprimées sans préavis</li>
              <li>L'Utilisateur doit respecter les politiques de ces services tiers (notamment les règles publicitaires de Google et Meta)</li>
            </ul>
          </section>

          <Separator />

          {/* Limitation de responsabilité */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">10</span>
              Limitation de responsabilité
            </h2>
            
            <h3 className="text-lg font-medium mt-4">10.1 Exclusions de garantie</h3>
            <p>
              Dans les limites autorisées par la loi, la Plateforme est fournie « en l'état » sans 
              garantie d'aucune sorte. EmotionsCare SASU ne garantit pas que :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Le service sera ininterrompu, sécurisé ou exempt d'erreurs</li>
              <li>Les résultats obtenus seront exacts ou fiables</li>
              <li>Les recommandations des agents IA produiront les effets escomptés</li>
            </ul>

            <h3 className="text-lg font-medium mt-4">10.2 Limitation des dommages</h3>
            <p>
              En aucun cas EmotionsCare SASU ne pourra être tenue responsable des dommages indirects, 
              accessoires, spéciaux, punitifs ou consécutifs, incluant notamment :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Perte de profits, de revenus ou d'économies anticipées</li>
              <li>Perte de données ou interruption d'activité</li>
              <li>Préjudice d'image ou atteinte à la réputation</li>
            </ul>
            <p>
              La responsabilité totale d'EmotionsCare SASU est limitée au montant des sommes versées 
              par le Client au cours des 12 mois précédant le fait générateur.
            </p>
          </section>

          <Separator />

          {/* Données personnelles */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">11</span>
              Protection des données personnelles
            </h2>
            <p>
              Le traitement des données personnelles est régi par notre{" "}
              <Link to="/privacy" className="text-primary hover:underline font-medium">
                Politique de Confidentialité
              </Link>
              , qui fait partie intégrante des présentes CGU.
            </p>
            <p>
              EmotionsCare SASU s'engage à respecter le Règlement Général sur la Protection des Données 
              (RGPD) et la loi Informatique et Libertés.
            </p>
          </section>

          <Separator />

          {/* Droit applicable */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">12</span>
              Droit applicable et juridiction compétente
            </h2>
            <p>
              Les présentes CGU sont régies par le <strong>droit français</strong>.
            </p>
            <p>
              En cas de litige relatif à l'interprétation, la validité ou l'exécution des présentes CGU, 
              les parties s'engagent à rechercher une solution amiable. À défaut d'accord amiable dans 
              un délai de 30 jours, le litige sera soumis à la compétence exclusive des{" "}
              <strong>tribunaux de Paris (France)</strong>.
            </p>
            <p>
              Pour les Utilisateurs consommateurs résidant dans l'Union européenne, cette clause ne 
              porte pas atteinte aux droits dont ils bénéficient en vertu des dispositions impératives 
              de leur pays de résidence.
            </p>
          </section>

          <Separator />

          {/* Dispositions diverses */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">13</span>
              Dispositions diverses
            </h2>
            
            <h3 className="text-lg font-medium mt-4">13.1 Intégralité</h3>
            <p>
              Les présentes CGU, ainsi que la Politique de Confidentialité, constituent l'intégralité 
              de l'accord entre les parties et remplacent tout accord antérieur.
            </p>

            <h3 className="text-lg font-medium mt-4">13.2 Divisibilité</h3>
            <p>
              Si une disposition des présentes CGU est déclarée nulle ou inapplicable, les autres 
              dispositions resteront en vigueur.
            </p>

            <h3 className="text-lg font-medium mt-4">13.3 Renonciation</h3>
            <p>
              Le fait pour EmotionsCare SASU de ne pas exercer un droit prévu aux présentes CGU ne 
              constitue pas une renonciation à ce droit.
            </p>
          </section>

          <Separator />

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">14</span>
              Contact
            </h2>
            <p>
              Pour toute question relative aux présentes CGU, vous pouvez nous contacter :
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <a href="mailto:m.laeticia@hotmail.fr" className="text-primary hover:underline font-medium">
                m.laeticia@hotmail.fr
              </a>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-secondary/30 py-8">
        <div className="container max-w-4xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Scale className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} EmotionsCare SASU</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Confidentialité
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Accueil
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
