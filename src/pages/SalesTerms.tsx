import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Scale, Building2, Mail, FileText, CreditCard, CalendarClock,
  ShieldCheck, RefreshCw, AlertTriangle, Gavel, Truck, Ban,
  Receipt, Clock, HelpCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const LAST_UPDATED = "10 février 2026";

export default function SalesTerms() {
  const { i18n } = useTranslation();
  const isFr = i18n.language === "fr";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Conditions Générales de Vente"
        description="CGV de Growth OS par EmotionsCare SASU. Conditions commerciales, tarification, facturation, garanties et responsabilités."
        canonical="/sales-terms"
      />
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-16 pt-24">
        <div className="container max-w-4xl px-4">
          {!isFr && (
            <Badge variant="outline" className="mb-4">
              This document is available in French only
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

          {/* Article 1 - Préambule */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
              <Scale className="w-5 h-5" />
              Préambule et champ d'application
            </h2>
            <p>
              Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent les relations commerciales
              entre <strong>EmotionsCare SASU</strong> (ci-après « le Prestataire ») et tout Client professionnel
              (ci-après « le Client ») souscrivant un abonnement à la plateforme <strong>Growth OS</strong>.
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
              Les présentes CGV sont applicables à toute commande passée par un Client professionnel.
              Toute souscription implique l'acceptation sans réserve des présentes CGV, qui prévalent sur
              tout autre document du Client, sauf accord écrit contraire.
            </p>
          </section>

          <Separator />

          {/* Article 2 - Offres et tarifs */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
              <CreditCard className="w-5 h-5" />
              Offres et tarification
            </h2>

            <h3 className="text-lg font-medium mt-4">2.1 Formules d'abonnement</h3>
            <p>Le Prestataire propose les formules suivantes :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Starter</strong> : 490 € HT/mois — Accès à 11 agents IA en mode lite,
                fonctionnalités essentielles
              </li>
              <li>
                <strong>Full Company</strong> : 9 000 € HT/mois — Accès à l'intégralité des 39 agents IA
                répartis dans les 11 départements, fonctionnalités complètes, support prioritaire
              </li>
              <li>
                <strong>À la carte</strong> : 1 900 € HT/département/mois — Sélection des départements
                souhaités avec l'ensemble des agents du département activés
              </li>
            </ul>

            <h3 className="text-lg font-medium mt-4">2.2 Essai gratuit</h3>
            <p>
              Un essai gratuit de <strong>14 jours</strong> est proposé sans engagement et sans carte bancaire.
              À l'issue de la période d'essai, le Client choisit librement de souscrire ou non un abonnement payant.
              En l'absence de souscription, l'accès est automatiquement suspendu.
            </p>

            <h3 className="text-lg font-medium mt-4">2.3 Tarifs</h3>
            <p>
              Les prix sont indiqués en euros hors taxes (€ HT). La TVA applicable sera ajoutée
              conformément à la législation en vigueur au moment de la facturation.
              Le Prestataire se réserve le droit de modifier ses tarifs. Toute modification sera notifiée
              au Client au moins <strong>30 jours</strong> avant son entrée en vigueur et ne s'appliquera
              qu'au renouvellement suivant.
            </p>
          </section>

          <Separator />

          {/* Article 3 - Commande et souscription */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
              <FileText className="w-5 h-5" />
              Commande et souscription
            </h2>
            <p>
              La souscription s'effectue en ligne sur la plateforme <strong>www.agent-growth-automator.com</strong>.
              Le Client sélectionne la formule souhaitée et procède au paiement. La souscription est confirmée
              par l'envoi d'un email de confirmation avec les détails de l'abonnement et les informations
              de facturation.
            </p>
            <p>
              Le Client s'engage à fournir des informations exactes, complètes et à jour lors de la souscription,
              notamment ses coordonnées de facturation et son numéro de TVA intracommunautaire le cas échéant.
            </p>
          </section>

          <Separator />

          {/* Article 4 - Facturation et paiement */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">4</span>
              <Receipt className="w-5 h-5" />
              Facturation et modalités de paiement
            </h2>

            <h3 className="text-lg font-medium mt-4">4.1 Facturation</h3>
            <p>
              La facturation est mensuelle et intervient à la date anniversaire de la souscription.
              Les factures sont émises par voie électronique et mises à disposition dans l'espace
              Client (Dashboard &gt; Facturation).
            </p>

            <h3 className="text-lg font-medium mt-4">4.2 Moyens de paiement</h3>
            <p>
              Les paiements sont effectués par carte bancaire via la plateforme sécurisée <strong>Stripe</strong>.
              Le prélèvement est automatique à chaque échéance mensuelle.
            </p>

            <h3 className="text-lg font-medium mt-4">4.3 Retard de paiement</h3>
            <p>
              Conformément aux articles L.441-10 et suivants du Code de commerce, tout retard de
              paiement entraînera de plein droit :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                L'application de <strong>pénalités de retard</strong> égales à 3 fois le taux d'intérêt légal
                en vigueur, calculées par jour de retard
              </li>
              <li>
                Une <strong>indemnité forfaitaire</strong> de 40 € pour frais de recouvrement
                (article D.441-5 du Code de commerce)
              </li>
              <li>
                La <strong>suspension du service</strong> après une mise en demeure restée infructueuse
                pendant 15 jours
              </li>
            </ul>
          </section>

          <Separator />

          {/* Article 5 - Durée et renouvellement */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">5</span>
              <CalendarClock className="w-5 h-5" />
              Durée, renouvellement et résiliation
            </h2>

            <h3 className="text-lg font-medium mt-4">5.1 Durée</h3>
            <p>
              L'abonnement est conclu pour une durée d'<strong>un mois</strong>, renouvelable par
              tacite reconduction, sauf résiliation par l'une des parties.
            </p>

            <h3 className="text-lg font-medium mt-4">5.2 Résiliation par le Client</h3>
            <p>
              Le Client peut résilier son abonnement à tout moment depuis les paramètres de son compte
              (Dashboard &gt; Paramètres &gt; Facturation). La résiliation prend effet à la fin de la
              période en cours. Aucun remboursement au prorata ne sera effectué pour la période entamée.
            </p>

            <h3 className="text-lg font-medium mt-4">5.3 Résiliation par le Prestataire</h3>
            <p>
              Le Prestataire se réserve le droit de résilier l'abonnement en cas de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Non-paiement après mise en demeure restée infructueuse pendant 30 jours</li>
              <li>Violation des Conditions Générales d'Utilisation</li>
              <li>Utilisation frauduleuse ou abusive de la plateforme</li>
            </ul>

            <h3 className="text-lg font-medium mt-4">5.4 Conséquences de la résiliation</h3>
            <p>
              À la fin de l'abonnement, le Client dispose de <strong>30 jours</strong> pour exporter
              ses données. Passé ce délai, les données seront définitivement supprimées conformément
              à notre politique de confidentialité.
            </p>
          </section>

          <Separator />

          {/* Article 6 - Livraison et accès */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">6</span>
              <Truck className="w-5 h-5" />
              Fourniture du service et niveaux de service
            </h2>

            <h3 className="text-lg font-medium mt-4">6.1 Accès au service</h3>
            <p>
              L'accès à la plateforme est fourni immédiatement après la confirmation de la souscription.
              Le service est accessible 24h/24, 7j/7, sous réserve des périodes de maintenance planifiées.
            </p>

            <h3 className="text-lg font-medium mt-4">6.2 Niveaux de service (SLA)</h3>
            <p>Le Prestataire s'engage sur les niveaux de disponibilité suivants :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Application web</strong> : 99,9% de disponibilité mensuelle</li>
              <li><strong>Agents IA</strong> : 99,5% de disponibilité mensuelle</li>
              <li><strong>API</strong> : 99,9% de disponibilité mensuelle</li>
            </ul>
            <p>
              Les maintenances planifiées sont annoncées au minimum <strong>48 heures</strong> à l'avance
              via la page de statut (<Link to="/status" className="text-primary hover:underline">/status</Link>)
              et par notification dans l'application.
            </p>

            <h3 className="text-lg font-medium mt-4">6.3 Support</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Starter</strong> : Support par email, délai de réponse sous 48h ouvrées</li>
              <li><strong>À la carte</strong> : Support par email et chat, délai de réponse sous 24h ouvrées</li>
              <li><strong>Full Company</strong> : Support prioritaire (email, chat, visioconférence), délai de réponse sous 4h ouvrées</li>
            </ul>
          </section>

          <Separator />

          {/* Article 7 - Droit de rétractation */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">7</span>
              <RefreshCw className="w-5 h-5" />
              Droit de rétractation
            </h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-600 dark:text-amber-400 font-medium">Information importante</p>
              <p className="text-sm mt-2">
                Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation
                ne s'applique pas aux contrats de fourniture de contenu numérique non fourni sur un support
                matériel dont l'exécution a commencé avec l'accord du consommateur.
              </p>
            </div>
            <p>
              Toutefois, les Clients professionnels bénéficient de la <strong>période d'essai gratuite de 14 jours</strong>,
              permettant de tester l'intégralité du service avant tout engagement financier.
            </p>
          </section>

          <Separator />

          {/* Article 8 - Garanties */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">8</span>
              <ShieldCheck className="w-5 h-5" />
              Garanties et sécurité des données
            </h2>

            <h3 className="text-lg font-medium mt-4">8.1 Garantie de conformité</h3>
            <p>
              Le Prestataire garantit que le service est conforme à la description figurant sur la plateforme
              et dans la documentation. En cas de non-conformité avérée, le Client peut demander la mise en
              conformité du service ou, à défaut, une réduction proportionnelle du prix.
            </p>

            <h3 className="text-lg font-medium mt-4">8.2 Sécurité des données</h3>
            <p>Le Prestataire met en œuvre les mesures de sécurité suivantes :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Chiffrement AES-256</strong> pour les données au repos et en transit</li>
              <li><strong>Hébergement en Europe</strong> (infrastructure Supabase, centres de données EU)</li>
              <li><strong>Conformité RGPD</strong> : traitement des données conforme au Règlement Général sur la Protection des Données</li>
              <li><strong>Audit trail complet</strong> : traçabilité de toutes les actions des agents IA</li>
              <li><strong>Système d'approbation</strong> : validation humaine obligatoire pour les actions critiques</li>
            </ul>

            <h3 className="text-lg font-medium mt-4">8.3 Propriété des données</h3>
            <p>
              Le Client reste propriétaire de l'ensemble des données qu'il importe dans la plateforme.
              Le contenu généré par les agents IA à partir des données du Client lui appartient intégralement.
            </p>
          </section>

          <Separator />

          {/* Article 9 - Limitation de responsabilité */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">9</span>
              <AlertTriangle className="w-5 h-5" />
              Limitation de responsabilité
            </h2>
            <p>
              La responsabilité du Prestataire est limitée aux dommages directs et prévisibles subis
              par le Client, résultant d'un manquement prouvé à ses obligations contractuelles.
            </p>
            <p>
              En tout état de cause, la responsabilité totale du Prestataire au titre des présentes CGV
              ne saurait excéder le montant total des sommes versées par le Client au cours des
              <strong> 12 derniers mois</strong> précédant l'événement donnant lieu à responsabilité.
            </p>
            <p>Le Prestataire ne saurait être tenu responsable :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Des dommages indirects (perte de chiffre d'affaires, perte de données, préjudice d'image)</li>
              <li>De l'inexactitude des recommandations émises par les agents IA</li>
              <li>Des interruptions de service dues à des tiers (fournisseurs cloud, API tierces)</li>
              <li>D'une utilisation non conforme de la plateforme par le Client</li>
              <li>Des cas de force majeure au sens de l'article 1218 du Code civil</li>
            </ul>
          </section>

          <Separator />

          {/* Article 10 - Propriété intellectuelle */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">10</span>
              <Ban className="w-5 h-5" />
              Propriété intellectuelle
            </h2>
            <p>
              La plateforme Growth OS, ses algorithmes, son code source, son design, ses marques et
              sa documentation sont la propriété exclusive d'EmotionsCare SASU.
            </p>
            <p>
              L'abonnement confère au Client un droit d'utilisation personnel, non exclusif, non
              transférable et non cessible, pour la durée de l'abonnement, dans le cadre de son
              activité professionnelle.
            </p>
            <p>Toute reproduction, représentation, modification ou exploitation non autorisée est interdite.</p>
          </section>

          <Separator />

          {/* Article 11 - Données personnelles */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">11</span>
              <ShieldCheck className="w-5 h-5" />
              Protection des données personnelles
            </h2>
            <p>
              Le traitement des données personnelles est régi par notre{" "}
              <Link to="/privacy" className="text-primary hover:underline">Politique de Confidentialité</Link>.
              Le Prestataire agit en qualité de sous-traitant au sens du RGPD pour les données
              du Client traitées via la plateforme.
            </p>
            <p>
              Le Client peut exercer ses droits (accès, rectification, suppression, portabilité)
              en contactant <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>.
            </p>
          </section>

          <Separator />

          {/* Article 12 - Force majeure */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">12</span>
              <Clock className="w-5 h-5" />
              Force majeure
            </h2>
            <p>
              Aucune des parties ne pourra être tenue responsable d'un manquement à ses obligations
              contractuelles en cas de force majeure au sens de l'article 1218 du Code civil, incluant
              notamment : catastrophes naturelles, pandémies, guerres, grèves générales, défaillances
              majeures d'infrastructure Internet, actes de cyberattaque à grande échelle.
            </p>
            <p>
              La partie invoquant la force majeure devra en informer l'autre partie dans les
              <strong> 72 heures</strong> suivant la survenance de l'événement.
            </p>
          </section>

          <Separator />

          {/* Article 13 - Médiation */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">13</span>
              <HelpCircle className="w-5 h-5" />
              Réclamations et médiation
            </h2>
            <p>
              En cas de réclamation, le Client est invité à contacter le service client à l'adresse{" "}
              <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>{" "}
              ou via la <Link to="/contact" className="text-primary hover:underline">page de contact</Link>.
              Le Prestataire s'engage à apporter une réponse sous 30 jours.
            </p>
            <p>
              En cas de litige non résolu, les parties s'engagent à rechercher une solution amiable
              avant toute action judiciaire. Le Client peut recourir au médiateur de la consommation
              désigné par le Prestataire.
            </p>
          </section>

          <Separator />

          {/* Article 14 - Droit applicable */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">14</span>
              <Gavel className="w-5 h-5" />
              Droit applicable et juridiction compétente
            </h2>
            <p>
              Les présentes CGV sont régies par le <strong>droit français</strong>.
            </p>
            <p>
              En cas de litige, et après échec de toute tentative de résolution amiable, les tribunaux
              compétents du ressort du siège social d'EmotionsCare SASU seront seuls compétents,
              y compris en cas de pluralité de défendeurs ou d'appel en garantie.
            </p>
          </section>

          <Separator />

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">15</span>
              <Mail className="w-5 h-5" />
              Contact
            </h2>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p><strong>EmotionsCare SASU</strong></p>
              <p className="text-sm text-muted-foreground">
                Email : <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a><br />
                Formulaire : <Link to="/contact" className="text-primary hover:underline">Page de contact</Link><br />
                Site : <a href="https://www.agent-growth-automator.com" className="text-primary hover:underline">www.agent-growth-automator.com</a>
              </p>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}
