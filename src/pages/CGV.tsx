import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, Building2, Mail, FileText, CreditCard, CalendarClock,
  RefreshCw, AlertTriangle, Gavel, Shield, Clock, Ban, Truck, Receipt,
  Scale
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const LAST_UPDATED = "11 février 2026";

export default function CGV() {
  const { i18n } = useTranslation();
  const isFr = i18n.language === "fr";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Conditions Générales de Vente"
        description="CGV de Growth OS. Tarifs, modalités de paiement, livraison du service, droit de rétractation et garanties pour les abonnements à la plateforme."
        canonical="/cgv"
      />
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-16 pt-24">
        <div className="container max-w-4xl px-4">
          {!isFr && (
            <Badge variant="outline" className="mb-4">
              This document is only available in French (legal requirement).
            </Badge>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Conditions Générales de Vente
          </h1>
          <p className="text-muted-foreground text-lg">
            Dernière mise à jour : {LAST_UPDATED}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-12 px-4">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">

          {/* 1 - Préambule */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
              <Scale className="w-5 h-5" />
              Préambule et champ d'application
            </h2>
            <p>
              Les présentes Conditions Générales de Vente (ci-après « CGV ») s'appliquent à toute souscription
              d'abonnement à la plateforme <strong>Growth OS</strong>, éditée par :
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
            <p>
              Les présentes CGV régissent exclusivement les relations contractuelles entre EmotionsCare SASU
              (ci-après « le Prestataire ») et tout client professionnel (ci-après « le Client ») souscrivant
              à un abonnement Growth OS. Toute souscription implique l'acceptation pleine et entière des présentes CGV.
            </p>
            <p>
              Les présentes CGV prévalent sur tout autre document émanant du Client, sauf dérogation expresse et écrite du Prestataire.
            </p>
          </section>

          <Separator />

          {/* 2 - Description du service */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
              <FileText className="w-5 h-5" />
              Description du service
            </h2>
            <p>
              Growth OS est une <strong>plateforme SaaS B2B d'agents IA</strong> accessible via navigateur web à
              l'adresse <a href="https://www.agent-growth-automator.com" className="text-primary hover:underline">www.agent-growth-automator.com</a>.
              Le service comprend :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Jusqu'à <strong>39 agents IA spécialisés</strong> répartis en 11 départements</li>
              <li>Intégrations avec les plateformes tierces (Google, Meta, WordPress, Shopify)</li>
              <li>Tableaux de bord, reporting automatisé et analytics en temps réel</li>
              <li>Système d'approbation présidentielle pour les actions critiques</li>
              <li>Audit trail complet et chiffrement AES-256</li>
              <li>Support technique par email et chat intégré</li>
            </ul>
            <p>
              Les fonctionnalités disponibles varient selon la formule d'abonnement souscrite.
            </p>
          </section>

          <Separator />

          {/* 3 - Tarifs */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
              <ShoppingCart className="w-5 h-5" />
              Tarifs et formules d'abonnement
            </h2>
            <p>Les tarifs ci-dessous s'entendent en euros, hors taxes (HT). La TVA applicable est celle en vigueur au jour de la facturation.</p>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-primary">Starter</p>
                <p className="text-2xl font-bold">490 € <span className="text-sm font-normal text-muted-foreground">HT/mois</span></p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>11 agents IA (version lite)</li>
                  <li>3 départements</li>
                  <li>Support email</li>
                </ul>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-primary">À la carte</p>
                <p className="text-2xl font-bold">1 900 € <span className="text-sm font-normal text-muted-foreground">HT/dept/mois</span></p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Par département</li>
                  <li>Agents complets du département</li>
                  <li>Support prioritaire</li>
                </ul>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2 border border-primary/30">
                <p className="font-semibold text-primary">Full Company</p>
                <p className="text-2xl font-bold">9 000 € <span className="text-sm font-normal text-muted-foreground">HT/mois</span></p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>39 agents IA complets</li>
                  <li>11 départements</li>
                  <li>Support dédié 24/7</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Le Prestataire se réserve le droit de modifier ses tarifs. Toute modification sera notifiée au
              Client au moins <strong>30 jours</strong> avant son entrée en vigueur. Les tarifs en vigueur au
              moment du renouvellement s'appliquent.
            </p>
          </section>

          <Separator />

          {/* 4 - Essai gratuit */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">4</span>
              <Clock className="w-5 h-5" />
              Période d'essai gratuit
            </h2>
            <p>
              Toute nouvelle souscription bénéficie d'une <strong>période d'essai gratuit de 14 jours</strong>,
              sans engagement et sans carte bancaire requise.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>L'essai donne accès à l'ensemble des fonctionnalités de la formule choisie</li>
              <li>À l'issue de l'essai, le Client peut choisir de souscrire un abonnement payant ou de résilier sans frais</li>
              <li>En l'absence de souscription, l'accès à la plateforme est suspendu automatiquement</li>
              <li>Les données du Client sont conservées pendant 30 jours après la fin de l'essai</li>
            </ul>
          </section>

          <Separator />

          {/* 5 - Commande et souscription */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">5</span>
              <Receipt className="w-5 h-5" />
              Commande et souscription
            </h2>
            <p>La souscription à un abonnement Growth OS s'effectue en ligne, selon le processus suivant :</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Création d'un compte utilisateur sur la plateforme</li>
              <li>Sélection de la formule d'abonnement souhaitée</li>
              <li>Renseignement des informations de facturation</li>
              <li>Validation du paiement via Stripe (prestataire de paiement sécurisé)</li>
              <li>Confirmation de la souscription par email</li>
            </ol>
            <p>
              La souscription est effective dès réception du paiement. Un email de confirmation tenant lieu de
              facture est envoyé au Client.
            </p>
          </section>

          <Separator />

          {/* 6 - Modalités de paiement */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">6</span>
              <CreditCard className="w-5 h-5" />
              Modalités de paiement
            </h2>
            <h3 className="text-lg font-medium mt-4">6.1 Moyens de paiement</h3>
            <p>Les paiements sont effectués par carte bancaire (Visa, Mastercard, American Express) via <strong>Stripe</strong>, prestataire certifié PCI-DSS.</p>

            <h3 className="text-lg font-medium mt-4">6.2 Facturation</h3>
            <p>
              La facturation est mensuelle, à terme échu. Les factures sont émises automatiquement et
              accessibles depuis l'espace client (section Billing).
            </p>

            <h3 className="text-lg font-medium mt-4">6.3 Retard de paiement</h3>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm">
                Conformément aux articles L.441-10 et suivants du Code de commerce, tout retard de paiement
                entraîne de plein droit :
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
                <li>Des <strong>pénalités de retard</strong> égales à 3 fois le taux d'intérêt légal en vigueur</li>
                <li>Une <strong>indemnité forfaitaire de 40 €</strong> pour frais de recouvrement (article D.441-5 du Code de commerce)</li>
                <li>La <strong>suspension du service</strong> après une mise en demeure restée sans effet pendant 15 jours</li>
              </ul>
            </div>

            <h3 className="text-lg font-medium mt-4">6.4 Absence d'escompte</h3>
            <p>Aucun escompte n'est accordé en cas de paiement anticipé.</p>
          </section>

          <Separator />

          {/* 7 - Livraison et mise à disposition */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">7</span>
              <Truck className="w-5 h-5" />
              Livraison et mise à disposition du service
            </h2>
            <p>
              Le service étant de nature dématérialisée (SaaS), la « livraison » consiste en la mise à
              disposition immédiate de l'accès à la plateforme Growth OS après validation du paiement.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Délai de mise à disposition</strong> : immédiat après confirmation du paiement</li>
              <li><strong>Accès</strong> : via navigateur web, 24h/24 et 7j/7, sous réserve des opérations de maintenance</li>
              <li><strong>Disponibilité cible</strong> : 99,9 % (hors maintenance programmée)</li>
            </ul>
            <p>
              En cas d'indisponibilité prolongée (supérieure à 24 heures consécutives hors maintenance programmée),
              le Client pourra demander un avoir au prorata de la durée d'indisponibilité.
            </p>
          </section>

          <Separator />

          {/* 8 - Durée et renouvellement */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">8</span>
              <CalendarClock className="w-5 h-5" />
              Durée, renouvellement et résiliation
            </h2>
            <h3 className="text-lg font-medium mt-4">8.1 Durée</h3>
            <p>
              L'abonnement est conclu pour une durée d'<strong>un (1) mois</strong>, tacitement reconductible
              pour des périodes successives d'un mois.
            </p>

            <h3 className="text-lg font-medium mt-4">8.2 Résiliation par le Client</h3>
            <p>
              Le Client peut résilier son abonnement à tout moment depuis les paramètres de son compte
              (section Billing). La résiliation prend effet à la fin de la période d'abonnement en cours.
              Aucun remboursement n'est dû pour la période entamée.
            </p>

            <h3 className="text-lg font-medium mt-4">8.3 Résiliation par le Prestataire</h3>
            <p>
              Le Prestataire se réserve le droit de suspendre ou résilier l'abonnement en cas de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Non-paiement persistant après mise en demeure</li>
              <li>Violation des <Link to="/terms" className="text-primary hover:underline">Conditions Générales d'Utilisation</Link></li>
              <li>Utilisation frauduleuse ou abusive du service</li>
              <li>Comportement portant atteinte à la sécurité ou à l'intégrité de la plateforme</li>
            </ul>

            <h3 className="text-lg font-medium mt-4">8.4 Conséquences de la résiliation</h3>
            <p>
              À l'issue de la résiliation, le Client dispose d'un délai de <strong>30 jours</strong> pour
              exporter ses données. Passé ce délai, les données seront supprimées conformément à notre
              <Link to="/privacy" className="text-primary hover:underline ml-1">politique de confidentialité</Link>.
            </p>
          </section>

          <Separator />

          {/* 9 - Droit de rétractation */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">9</span>
              <RefreshCw className="w-5 h-5" />
              Droit de rétractation
            </h2>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="font-medium">Clients professionnels (B2B)</p>
              <p className="text-sm text-muted-foreground mt-2">
                Conformément à l'article L.221-3 du Code de la consommation, le droit de rétractation
                ne s'applique pas aux contrats conclus entre professionnels. Growth OS étant destiné
                exclusivement à un usage professionnel, aucun droit de rétractation n'est applicable.
              </p>
            </div>
            <p>
              Toutefois, la période d'essai gratuit de 14 jours permet au Client de tester l'ensemble du
              service avant tout engagement financier.
            </p>
          </section>

          <Separator />

          {/* 10 - Garanties et SLA */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">10</span>
              <Shield className="w-5 h-5" />
              Garanties et niveau de service (SLA)
            </h2>
            <p>Le Prestataire s'engage à :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Assurer une <strong>disponibilité de 99,9 %</strong> du service (hors maintenance programmée)</li>
              <li>Notifier les maintenances programmées au moins <strong>48 heures</strong> à l'avance</li>
              <li>Garantir la <strong>sécurité des données</strong> via un chiffrement AES-256 et un hébergement en Europe</li>
              <li>Maintenir un <strong>audit trail complet</strong> de toutes les actions des agents IA</li>
              <li>Fournir un support technique par email dans un délai de <strong>24 heures ouvrées</strong></li>
            </ul>
            <p>
              Le statut des services en temps réel est consultable sur la
              <Link to="/status" className="text-primary hover:underline ml-1">page de statut</Link>.
            </p>
          </section>

          <Separator />

          {/* 11 - Limitation de responsabilité */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">11</span>
              <AlertTriangle className="w-5 h-5" />
              Limitation de responsabilité
            </h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-600 dark:text-amber-400 font-medium">Clause importante</p>
              <p className="text-sm mt-2">
                Les agents IA fournissent des <strong>recommandations automatisées</strong> qui ne constituent
                pas des conseils professionnels, juridiques, financiers ou médicaux. La décision finale
                appartient exclusivement au Client.
              </p>
            </div>
            <p>
              En tout état de cause, la responsabilité totale du Prestataire au titre du contrat ne pourra
              excéder le montant total des sommes versées par le Client au cours des <strong>douze (12) derniers
              mois</strong> précédant le fait générateur.
            </p>
            <p>
              Le Prestataire ne saurait être tenu responsable des dommages indirects, tels que perte de
              chiffre d'affaires, perte de données (en dehors de ses obligations de sauvegarde), atteinte
              à l'image de marque ou perte de clientèle.
            </p>
          </section>

          <Separator />

          {/* 12 - Force majeure */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">12</span>
              <Ban className="w-5 h-5" />
              Force majeure
            </h2>
            <p>
              Aucune des parties ne sera responsable de l'inexécution de ses obligations si celle-ci résulte
              d'un cas de force majeure au sens de l'article 1218 du Code civil, notamment : catastrophe
              naturelle, pandémie, guerre, incendie, grève générale, panne de réseau internet ou d'hébergement,
              cyberattaque d'ampleur exceptionnelle.
            </p>
            <p>
              La partie invoquant la force majeure en informera l'autre partie dans un délai de 48 heures.
              Si l'événement perdure au-delà de 30 jours, chaque partie pourra résilier le contrat sans
              indemnité.
            </p>
          </section>

          <Separator />

          {/* 13 - Protection des données */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">13</span>
              <Shield className="w-5 h-5" />
              Protection des données personnelles
            </h2>
            <p>
              Le traitement des données personnelles est régi par notre
              <Link to="/privacy" className="text-primary hover:underline ml-1">politique de confidentialité</Link>,
              conforme au Règlement Général sur la Protection des Données (RGPD).
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Données hébergées en <strong>Europe</strong></li>
              <li>Chiffrement <strong>AES-256</strong> des données au repos et en transit</li>
              <li>DPO joignable à : <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a></li>
            </ul>
          </section>

          <Separator />

          {/* 14 - Propriété intellectuelle */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">14</span>
              <FileText className="w-5 h-5" />
              Propriété intellectuelle
            </h2>
            <p>
              La plateforme Growth OS, son code source, son design, ses algorithmes et sa documentation
              sont la propriété exclusive d'EmotionsCare SASU. L'abonnement confère au Client un droit
              d'utilisation personnel, non exclusif et non transférable, pour la durée de l'abonnement.
            </p>
            <p>
              Le Client conserve l'entière propriété des données qu'il importe et du contenu généré par
              les agents IA dans le cadre de son utilisation du service.
            </p>
          </section>

          <Separator />

          {/* 15 - Médiation et litiges */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">15</span>
              <Gavel className="w-5 h-5" />
              Droit applicable et règlement des litiges
            </h2>
            <p>
              Les présentes CGV sont régies par le <strong>droit français</strong>.
            </p>
            <p>
              En cas de litige, les parties s'engagent à rechercher une solution amiable pendant un
              délai de 30 jours à compter de la notification du différend. À défaut de résolution amiable,
              tout litige sera soumis aux <strong>tribunaux compétents du ressort du siège social
              d'EmotionsCare SASU</strong>.
            </p>
          </section>

          <Separator />

          {/* 16 - Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">16</span>
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

          {/* Cross-links */}
          <Separator />
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/terms" className="text-primary hover:underline">Conditions Générales d'Utilisation</Link>
            <Link to="/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>
            <Link to="/legal" className="text-primary hover:underline">Mentions légales</Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
