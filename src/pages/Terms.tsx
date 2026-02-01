import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12 px-4">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Acceptation des conditions</h2>
            <p>
              En accédant et en utilisant Agent Growth Automator, vous acceptez d'être lié par ces 
              conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez 
              ne pas utiliser notre service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Description du service</h2>
            <p>
              Agent Growth Automator est une plateforme SaaS d'automatisation marketing qui permet de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Connecter et synchroniser vos comptes Google et Meta</li>
              <li>Automatiser la gestion de vos campagnes publicitaires</li>
              <li>Analyser vos performances SEO et marketing</li>
              <li>Générer des rapports et recommandations via l'IA</li>
              <li>Gérer votre réputation en ligne</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Inscription et compte</h2>
            <p>
              Pour utiliser nos services, vous devez créer un compte en fournissant des informations 
              exactes et complètes. Vous êtes responsable de la confidentialité de vos identifiants 
              et de toutes les activités effectuées sous votre compte.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Utilisation acceptable</h2>
            <p>Vous vous engagez à :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utiliser le service conformément aux lois applicables</li>
              <li>Ne pas tenter de contourner les mesures de sécurité</li>
              <li>Ne pas utiliser le service pour des activités frauduleuses</li>
              <li>Respecter les conditions d'utilisation des plateformes tierces (Google, Meta)</li>
              <li>Ne pas surcharger intentionnellement nos systèmes</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Intégrations tierces</h2>
            <p>
              Notre service se connecte à des plateformes tierces (Google, Meta, etc.). Vous êtes 
              responsable du respect des conditions d'utilisation de ces plateformes. Nous ne sommes 
              pas responsables des modifications ou interruptions de ces services tiers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Propriété intellectuelle</h2>
            <p>
              Tout le contenu, les fonctionnalités et la technologie de Agent Growth Automator sont 
              notre propriété exclusive ou celle de nos concédants. Vous bénéficiez d'une licence 
              limitée, non exclusive et non transférable pour utiliser le service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Tarification et paiement</h2>
            <p>
              Les tarifs sont indiqués sur notre page de tarification. Nous nous réservons le droit 
              de modifier nos prix avec un préavis de 30 jours. Les paiements sont non remboursables, 
              sauf disposition contraire de la loi.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Limitation de responsabilité</h2>
            <p>
              Dans les limites autorisées par la loi, nous ne serons pas responsables des dommages 
              indirects, accessoires, spéciaux ou consécutifs résultant de l'utilisation ou de 
              l'impossibilité d'utiliser nos services.
            </p>
            <p>
              Nous ne garantissons pas que le service sera ininterrompu ou exempt d'erreurs. Les 
              recommandations générées par l'IA sont fournies à titre indicatif et ne constituent 
              pas des conseils professionnels.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Confidentialité des données</h2>
            <p>
              Votre utilisation du service est également régie par notre{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Politique de Confidentialité
              </Link>
              , qui fait partie intégrante de ces conditions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Résiliation</h2>
            <p>
              Vous pouvez résilier votre compte à tout moment depuis les paramètres. Nous pouvons 
              suspendre ou résilier votre accès en cas de violation de ces conditions, avec ou sans 
              préavis selon la gravité de la violation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">11. Modifications des conditions</h2>
            <p>
              Nous pouvons modifier ces conditions à tout moment. Les modifications importantes vous 
              seront notifiées par email. Votre utilisation continue du service après notification 
              vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">12. Droit applicable</h2>
            <p>
              Ces conditions sont régies par le droit français. Tout litige sera soumis à la 
              compétence exclusive des tribunaux de Paris, France.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">13. Contact</h2>
            <p>
              Pour toute question concernant ces conditions, contactez-nous à :{" "}
              <a href="mailto:m.laeticia@hotmail.fr" className="text-primary hover:underline">
                m.laeticia@hotmail.fr
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
