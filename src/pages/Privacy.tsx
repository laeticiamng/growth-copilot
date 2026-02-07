import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Shield, Building2, Mail, Cookie, Database, Users, Clock, Lock, Search, Pencil, Trash2, Package, Ban, Pause, FileText, Brain, Scale } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const LAST_UPDATED = "5 février 2026";

export default function Privacy() {
  const { t, i18n } = useTranslation();
  const isFr = i18n.language === "fr";
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Politique de Confidentialité"
        description="Politique de confidentialité de Growth OS. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD."
        canonical="/privacy"
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
              <Shield className="w-5 h-5" />
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
              <Database className="w-5 h-5" />
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
              <FileText className="w-5 h-5" />
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
                  <tr><td className="py-3 pr-4">Fourniture et fonctionnement du service</td><td className="py-3 pr-4">Exécution du contrat</td></tr>
                  <tr><td className="py-3 pr-4">Gestion de votre compte et authentification</td><td className="py-3 pr-4">Exécution du contrat</td></tr>
                  <tr><td className="py-3 pr-4">Facturation et paiement</td><td className="py-3 pr-4">Exécution du contrat / Obligation légale</td></tr>
                  <tr><td className="py-3 pr-4">Support client et assistance</td><td className="py-3 pr-4">Exécution du contrat</td></tr>
                  <tr><td className="py-3 pr-4">Amélioration du service et développement</td><td className="py-3 pr-4">Intérêt légitime</td></tr>
                  <tr><td className="py-3 pr-4">Communications importantes (sécurité, mises à jour)</td><td className="py-3 pr-4">Intérêt légitime / Obligation légale</td></tr>
                  <tr><td className="py-3 pr-4">Audit et conformité légale</td><td className="py-3 pr-4">Obligation légale</td></tr>
                  <tr><td className="py-3 pr-4">Analyses statistiques anonymisées</td><td className="py-3 pr-4">Intérêt légitime</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <Separator />

          {/* Sous-traitants */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">4</span>
              <Users className="w-5 h-5" />
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
                  <tr><td className="py-3 pr-4 font-medium">Supabase</td><td className="py-3 pr-4">Base de données et authentification</td><td className="py-3 pr-4">EU (via AWS eu-central-1)</td></tr>
                  <tr><td className="py-3 pr-4 font-medium">Stripe</td><td className="py-3 pr-4">Paiements et facturation</td><td className="py-3 pr-4">USA (Clauses Contractuelles Types)</td></tr>
                  <tr><td className="py-3 pr-4 font-medium">Google Cloud</td><td className="py-3 pr-4">APIs (Analytics, Search Console, etc.)</td><td className="py-3 pr-4">USA (Clauses Contractuelles Types)</td></tr>
                  <tr><td className="py-3 pr-4 font-medium">Meta Platforms</td><td className="py-3 pr-4">APIs (Facebook Ads, Instagram)</td><td className="py-3 pr-4">USA (Clauses Contractuelles Types)</td></tr>
                  <tr><td className="py-3 pr-4 font-medium">Lovable</td><td className="py-3 pr-4">Hébergement de l'application</td><td className="py-3 pr-4">EU</td></tr>
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
                  <tr><td className="py-3 pr-4">Données de compte</td><td className="py-3 pr-4">Durée du contrat + 3 ans</td></tr>
                  <tr><td className="py-3 pr-4">Données de facturation</td><td className="py-3 pr-4">10 ans (obligation comptable)</td></tr>
                  <tr><td className="py-3 pr-4">Logs d'audit</td><td className="py-3 pr-4">3 ans</td></tr>
                  <tr><td className="py-3 pr-4">Métriques analytics (Google, Meta)</td><td className="py-3 pr-4">24 mois</td></tr>
                  <tr><td className="py-3 pr-4">Logs d'exécution des agents IA</td><td className="py-3 pr-4">12 mois</td></tr>
                  <tr><td className="py-3 pr-4">Enregistrements vocaux (Assistant IA)</td><td className="py-3 pr-4">Non stockés (traitement temps réel)</td></tr>
                  <tr><td className="py-3 pr-4">Cookies analytics</td><td className="py-3 pr-4">13 mois maximum</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <Separator />

          {/* Droits */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">6</span>
              <Scale className="w-5 h-5" />
              Vos droits
            </h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { Icon: Search, title: "Droit d'accès", desc: "Obtenir confirmation du traitement de vos données et en recevoir une copie." },
                { Icon: Pencil, title: "Droit de rectification", desc: "Faire corriger vos données inexactes ou incomplètes." },
                { Icon: Trash2, title: "Droit à l'effacement", desc: "Demander la suppression de vos données (« droit à l'oubli »)." },
                { Icon: Package, title: "Droit à la portabilité", desc: "Recevoir vos données dans un format structuré et lisible." },
                { Icon: Ban, title: "Droit d'opposition", desc: "Vous opposer au traitement de vos données pour motifs légitimes." },
                { Icon: Pause, title: "Droit à la limitation", desc: "Demander la suspension temporaire du traitement." },
              ].map(r => (
                <div key={r.title} className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2"><r.Icon className="w-4 h-4 text-primary" /> {r.title}</h4>
                  <p className="text-sm text-muted-foreground">{r.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
              <p className="font-medium mb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Exercer vos droits</p>
              <p className="text-sm">
                Pour exercer vos droits, envoyez un email à notre DPO :{" "}
                <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline font-medium">
                  contact@emotionscare.com
                </a>
              </p>
              <p className="text-sm mt-2 text-muted-foreground">
                Nous répondrons dans un délai de 30 jours. Vous pouvez également adresser une réclamation 
                à la <strong>CNIL</strong> (cnil.fr).
              </p>
            </div>
          </section>

          <Separator />

          {/* Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">7</span>
              <Cookie className="w-5 h-5" />
              Cookies et traceurs
            </h2>
            <p>Growth OS utilise les catégories de cookies suivantes :</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-semibold">Type</th>
                    <th className="text-left py-3 pr-4 font-semibold">Finalité</th>
                    <th className="text-left py-3 pr-4 font-semibold">Consentement requis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="py-3 pr-4 font-medium">Essentiels</td><td className="py-3 pr-4">Authentification, sécurité, préférences</td><td className="py-3 pr-4">Non (nécessaires)</td></tr>
                  <tr><td className="py-3 pr-4 font-medium">Analytics</td><td className="py-3 pr-4">Mesure d'audience (anonymisé)</td><td className="py-3 pr-4">Oui</td></tr>
                  <tr><td className="py-3 pr-4 font-medium">Support</td><td className="py-3 pr-4">Chat d'assistance (Crisp)</td><td className="py-3 pr-4">Oui</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground">
              Vous pouvez gérer vos préférences de cookies à tout moment via la bannière de consentement 
              ou dans les paramètres de votre navigateur.
            </p>
          </section>

          <Separator />

          {/* Sécurité */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">8</span>
              <Shield className="w-5 h-5" />
              Sécurité des données
            </h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour 
              protéger vos données :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Chiffrement en transit</strong> : HTTPS/TLS pour toutes les communications</li>
              <li><strong>Chiffrement au repos</strong> : AES-256 pour les données stockées</li>
              <li><strong>OAuth 2.0</strong> : pour les connexions aux services tiers (pas de stockage de mots de passe)</li>
              <li><strong>Tokens chiffrés</strong> : les tokens d'accès sont chiffrés avec AES-256-GCM</li>
              <li><strong>Audit trail</strong> : journalisation complète des actions pour traçabilité</li>
              <li><strong>Contrôle d'accès</strong> : RBAC (Role-Based Access Control) par workspace</li>
              <li><strong>Hébergement européen</strong> : données hébergées sur des serveurs AWS en Europe (eu-central-1)</li>
            </ul>
          </section>

          <Separator />

          {/* IA */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">9</span>
              <Brain className="w-5 h-5" />
              Utilisation de l'Intelligence Artificielle
            </h2>
            <p>
              Growth OS utilise des modèles d'IA pour fournir des recommandations et générer du contenu. 
              Concernant vos données et l'IA :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Vos données <strong>ne sont pas utilisées pour entraîner</strong> les modèles d'IA</li>
              <li>Les requêtes IA sont traitées par des fournisseurs tiers (OpenAI, Google) avec des engagements de confidentialité</li>
              <li>Les enregistrements vocaux (Assistant IA) sont traités en temps réel et <strong>ne sont pas stockés</strong></li>
              <li>Chaque décision IA est accompagnée d'un <strong>Evidence Bundle</strong> traçable</li>
              <li>Vous conservez le <strong>contrôle total</strong> via le système d'approbation</li>
            </ul>
          </section>

          <Separator />

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">10</span>
              <Mail className="w-5 h-5" />
              Contact
            </h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou l'exercice de vos droits :
            </p>
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
