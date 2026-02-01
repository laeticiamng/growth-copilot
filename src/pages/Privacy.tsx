import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12 px-4">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Introduction</h2>
            <p>
              Bienvenue sur Agent Growth Automator. Nous nous engageons à protéger votre vie privée et vos données personnelles. 
              Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Données collectées</h2>
            <p>Nous collectons les types de données suivants :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Informations de compte</strong> : nom, adresse email, mot de passe crypté</li>
              <li><strong>Données d'intégration</strong> : tokens OAuth pour Google Analytics, Search Console, Meta Ads, etc.</li>
              <li><strong>Données d'utilisation</strong> : interactions avec la plateforme, préférences</li>
              <li><strong>Données analytiques</strong> : métriques de performance de vos campagnes marketing</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fournir et améliorer nos services d'automatisation marketing</li>
              <li>Synchroniser vos données avec les plateformes tierces (Google, Meta, etc.)</li>
              <li>Générer des rapports et analyses personnalisés</li>
              <li>Vous envoyer des notifications importantes sur votre compte</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Intégrations tierces</h2>
            <p>
              Notre plateforme se connecte à des services tiers via OAuth 2.0. Nous n'avons accès qu'aux 
              données nécessaires au fonctionnement des fonctionnalités que vous activez. Vous pouvez 
              révoquer ces accès à tout moment depuis les paramètres de votre compte.
            </p>
            <p>Services intégrés :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google Analytics, Search Console, Ads, Business Profile, YouTube</li>
              <li>Meta (Facebook, Instagram, WhatsApp Business)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité robustes pour protéger vos données :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chiffrement des données en transit (TLS/SSL) et au repos</li>
              <li>Stockage sécurisé des tokens OAuth avec chiffrement AES-256</li>
              <li>Authentification à deux facteurs disponible</li>
              <li>Audits de sécurité réguliers</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Conservation des données</h2>
            <p>
              Nous conservons vos données tant que votre compte est actif. Vous pouvez demander la 
              suppression de vos données à tout moment. Les données analytiques sont conservées 
              pendant 24 mois maximum.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Vos droits (RGPD)</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification des données inexactes</li>
              <li>Droit à l'effacement ("droit à l'oubli")</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Cookies</h2>
            <p>
              Nous utilisons des cookies essentiels pour le fonctionnement de la plateforme et des 
              cookies analytiques pour améliorer votre expérience. Vous pouvez gérer vos préférences 
              de cookies dans les paramètres de votre navigateur.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos 
              droits, contactez-nous à : <a href="mailto:m.laeticia@hotmail.fr" className="text-primary hover:underline">m.laeticia@hotmail.fr</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Modifications</h2>
            <p>
              Nous pouvons mettre à jour cette politique de confidentialité. Les modifications 
              importantes vous seront notifiées par email ou via la plateforme.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
