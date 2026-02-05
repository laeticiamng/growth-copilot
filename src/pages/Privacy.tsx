import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Building2, Mail, Cookie, Database, Users, Clock, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const LAST_UPDATED = "5 février 2026";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-muted-foreground text-lg">
            Dernière mise à jour : {LAST_UPDATED}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-12 px-4">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          
          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
              Introduction
            </h2>
            <p>
              La présente Politique de Confidentialité décrit la manière dont <strong>EmotionsCare SASU</strong> 
              (ci-après « nous », « notre » ou « EmotionsCare ») collecte, utilise, stocke et protège vos 
              données personnelles dans le cadre de l'utilisation de la plateforme <strong>Growth OS</strong>.
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <strong>Responsable du traitement</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                EmotionsCare SASU<br />
                Siège social : France<br />
                DPO / Contact : <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>
              </p>
            </div>
            <p>
              Nous nous engageons à respecter le <strong>Règlement Général sur la Protection des Données (RGPD)</strong> 
              (UE 2016/679) ainsi que la loi française Informatique et Libertés du 6 janvier 1978 modifiée.
            </p>
          </section>

          <Separator />

          {/* Données collectées */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
              Données personnelles collectées
            </h2>
            
            <h3 className="text-lg font-medium mt-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              2.1 Données d'identification
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Email professionnel</strong> : utilisé pour l'authentification et les communications</li>
              <li><strong>Nom / Prénom</strong> : pour personnaliser votre expérience (optionnel)</li>
              <li><strong>Nom de l'entreprise</strong> : associé à votre workspace</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              2.2 Données professionnelles
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>URL du site web</strong> : pour les audits SEO et le suivi de performance</li>
              <li><strong>Données d'intégrations</strong> : métriques issues de Google Analytics, Search Console, Meta Ads via OAuth</li>
              <li><strong>Contenu généré</strong> : textes, rapports et recommandations produits par les agents IA</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              2.3 Données techniques
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Logs d'utilisation</strong> : actions effectuées sur la plateforme (audit trail)</li>
              <li><strong>Données de connexion</strong> : adresse IP, type de navigateur, horodatage</li>
              <li><strong>Tokens OAuth chiffrés</strong> : pour les connexions aux services tiers</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 flex items-center gap-2">
              <Cookie className="w-4 h-4 text-primary" />
              2.4 Données de paiement
            </h3>
            <p>
              Les informations de paiement (carte bancaire) sont collectées et traitées exclusivement 
              par notre prestataire <strong>Stripe</strong>. Nous ne stockons aucune donnée de carte bancaire.
            </p>
          </section>

          <Separator />

          {/* Finalités */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
              Finalités du traitement
            </h2>
            <p>Vos données sont traitées pour les finalités suivantes :</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-semibold">Finalité</th>
                    <th className="text-left py-3 pr-4 font-semibold">Base légale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 pr-4">Fourniture et fonctionnement du service</td>
                    <td className="py-3 pr-4">Exécution du contrat</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Gestion de votre compte et authentification</td>
                    <td className="py-3 pr-4">Exécution du contrat</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Facturation et paiement</td>
                    <td className="py-3 pr-4">Exécution du contrat / Obligation légale</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Support client et assistance</td>
                    <td className="py-3 pr-4">Exécution du contrat</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Amélioration du service et développement</td>
                    <td className="py-3 pr-4">Intérêt légitime</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Communications importantes (sécurité, mises à jour)</td>
                    <td className="py-3 pr-4">Intérêt légitime / Obligation légale</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Audit et conformité légale</td>
                    <td className="py-3 pr-4">Obligation légale</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Analyses statistiques anonymisées</td>
                    <td className="py-3 pr-4">Intérêt légitime</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <Separator />

          {/* Sous-traitants */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">4</span>
              Sous-traitants et destinataires
            </h2>
            <p>
              Nous faisons appel à des sous-traitants techniques pour assurer le bon fonctionnement 
              de la Plateforme. Ces sous-traitants sont sélectionnés pour leur conformité au RGPD :
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-semibold">Sous-traitant</th>
                    <th className="text-left py-3 pr-4 font-semibold">Fonction</th>
                    <th className="text-left py-3 pr-4 font-semibold">Localisation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 pr-4 font-medium">Supabase</td>
                    <td className="py-3 pr-4">Base de données et authentification</td>
                    <td className="py-3 pr-4">EU (via AWS eu-central-1)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Stripe</td>
                    <td className="py-3 pr-4">Paiements et facturation</td>
                    <td className="py-3 pr-4">USA (Clauses Contractuelles Types)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Google Cloud</td>
                    <td className="py-3 pr-4">APIs (Analytics, Search Console, etc.)</td>
                    <td className="py-3 pr-4">USA (Clauses Contractuelles Types)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Meta Platforms</td>
                    <td className="py-3 pr-4">APIs (Facebook Ads, Instagram)</td>
                    <td className="py-3 pr-4">USA (Clauses Contractuelles Types)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Lovable</td>
                    <td className="py-3 pr-4">Hébergement de l'application</td>
                    <td className="py-3 pr-4">EU</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Pour les transferts hors de l'Union Européenne, nous nous assurons que des garanties 
              appropriées sont en place (Clauses Contractuelles Types de la Commission Européenne).
            </p>
          </section>

          <Separator />

          {/* Durée de conservation */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">5</span>
              <Clock className="w-5 h-5" />
              Durée de conservation
            </h2>
            <p>
              Vos données personnelles sont conservées pour la <strong>durée du contrat + 3 ans</strong> 
              après la fin de la relation contractuelle, sauf obligation légale contraire.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-semibold">Type de données</th>
                    <th className="text-left py-3 pr-4 font-semibold">Durée de conservation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 pr-4">Données de compte</td>
                    <td className="py-3 pr-4">Durée du contrat + 3 ans</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Données de facturation</td>
                    <td className="py-3 pr-4">10 ans (obligation comptable)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Logs d'audit</td>
                    <td className="py-3 pr-4">3 ans</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Métriques analytics (Google, Meta)</td>
                    <td className="py-3 pr-4">24 mois</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Logs d'exécution des agents IA</td>
                    <td className="py-3 pr-4">12 mois</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Enregistrements vocaux (Assistant IA)</td>
                    <td className="py-3 pr-4">Non stockés (traitement temps réel)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Cookies analytics</td>
                    <td className="py-3 pr-4">13 mois maximum</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <Separator />

          {/* Droits */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">6</span>
              Vos droits
            </h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">🔍 Droit d'accès</h4>
                <p className="text-sm text-muted-foreground">
                  Obtenir confirmation du traitement de vos données et en recevoir une copie.
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">✏️ Droit de rectification</h4>
                <p className="text-sm text-muted-foreground">
                  Faire corriger vos données inexactes ou incomplètes.
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">🗑️ Droit à l'effacement</h4>
                <p className="text-sm text-muted-foreground">
                  Demander la suppression de vos données (« droit à l'oubli »).
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">📦 Droit à la portabilité</h4>
                <p className="text-sm text-muted-foreground">
                  Recevoir vos données dans un format structuré et lisible.
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">⛔ Droit d'opposition</h4>
                <p className="text-sm text-muted-foreground">
                  Vous opposer au traitement de vos données pour motifs légitimes.
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">⏸️ Droit à la limitation</h4>
                <p className="text-sm text-muted-foreground">
                  Demander la suspension temporaire du traitement.
                </p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
              <p className="font-medium mb-2">📧 Exercer vos droits</p>
              <p className="text-sm">
                Pour exercer vos droits, envoyez un email à notre DPO :{" "}
                <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline font-medium">
                  contact@emotionscare.com
                </a>
              </p>
              <p className="text-sm mt-2 text-muted-foreground">
                Nous répondrons dans un délai d'un mois. En cas de demande complexe, ce délai peut 
                être prolongé de deux mois.
              </p>
            </div>

            <p className="text-sm mt-4">
              Vous disposez également du droit d'introduire une réclamation auprès de la{" "}
              <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) :{" "}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                www.cnil.fr
              </a>
            </p>
          </section>

          <Separator />

          {/* Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">7</span>
              <Cookie className="w-5 h-5" />
              Cookies
            </h2>
            
            <h3 className="text-lg font-medium mt-4">7.1 Types de cookies utilisés</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-semibold">Type</th>
                    <th className="text-left py-3 pr-4 font-semibold">Finalité</th>
                    <th className="text-left py-3 pr-4 font-semibold">Consentement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 pr-4 font-medium">Cookies essentiels</td>
                    <td className="py-3 pr-4">Authentification, session, préférences</td>
                    <td className="py-3 pr-4">Non requis (nécessaires)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Cookies analytics</td>
                    <td className="py-3 pr-4">Mesure d'audience, amélioration du service</td>
                    <td className="py-3 pr-4 text-primary font-medium">Requis</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium mt-4">7.2 Gestion de vos préférences</h3>
            <p>
              Lors de votre première visite, un bandeau vous permet de choisir les cookies que vous 
              acceptez. Vous pouvez modifier vos préférences à tout moment :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Via les paramètres de votre navigateur</li>
              <li>Via notre bandeau de consentement (accessible en bas de page)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Le refus des cookies analytics n'affecte pas le fonctionnement du service.
            </p>
          </section>

          <Separator />

          {/* Sécurité */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">8</span>
              <Lock className="w-5 h-5" />
              Sécurité des données
            </h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour 
              protéger vos données :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Chiffrement en transit</strong> : TLS 1.3 pour toutes les communications</li>
              <li><strong>Chiffrement au repos</strong> : AES-256 pour les données sensibles (tokens OAuth)</li>
              <li><strong>Authentification sécurisée</strong> : mots de passe hashés (bcrypt), MFA disponible</li>
              <li><strong>Contrôle d'accès</strong> : Row Level Security (RLS) au niveau base de données</li>
              <li><strong>Audit trail</strong> : journalisation immuable de toutes les actions</li>
              <li><strong>Sauvegardes</strong> : quotidiennes avec rétention de 30 jours</li>
              <li><strong>Monitoring</strong> : surveillance 24/7 et alertes de sécurité</li>
            </ul>
          </section>

          <Separator />

          {/* Mineurs */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">9</span>
              Protection des mineurs
            </h2>
            <p>
              Growth OS est une plateforme B2B destinée aux professionnels. Elle n'est pas destinée 
              aux personnes de moins de 18 ans. Nous ne collectons pas sciemment de données 
              personnelles auprès de mineurs.
            </p>
          </section>

          <Separator />

          {/* Modifications */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">10</span>
              Modifications de la politique
            </h2>
            <p>
              Nous pouvons mettre à jour cette Politique de Confidentialité pour refléter les 
              évolutions de nos pratiques ou de la réglementation. En cas de modification 
              substantielle, vous serez informé :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Par email à l'adresse associée à votre compte</li>
              <li>Par une notification sur la Plateforme</li>
            </ul>
            <p>
              La date de « Dernière mise à jour » en haut de cette page indique la version en vigueur.
            </p>
          </section>

          <Separator />

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">11</span>
              Contact
            </h2>
            <p>
              Pour toute question relative à cette Politique de Confidentialité ou à la protection 
              de vos données personnelles, contactez notre Délégué à la Protection des Données (DPO) :
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Délégué à la Protection des Données</p>
                <a href="mailto:m.laeticia@hotmail.fr" className="text-primary hover:underline">
                  m.laeticia@hotmail.fr
                </a>
              </div>
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
                <Shield className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} EmotionsCare SASU</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                CGU
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
