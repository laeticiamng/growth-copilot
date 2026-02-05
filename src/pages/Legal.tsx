import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Legal() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold mb-8">Mentions Légales</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Éditeur du site</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le site <strong>www.agent-growth-automator.com</strong> (ci-après « Growth OS ») est édité par :
            </p>
            <ul className="list-none space-y-2 text-muted-foreground mt-4">
              <li><strong>Raison sociale :</strong> EmotionsCare SASU</li>
              <li><strong>Siège social :</strong> [Adresse à compléter]</li>
              <li><strong>SIRET :</strong> [Numéro SIRET à compléter]</li>
              <li><strong>RCS :</strong> [Ville d'immatriculation à compléter]</li>
              <li><strong>Capital social :</strong> [Montant à compléter] euros</li>
              <li><strong>N° TVA intracommunautaire :</strong> [Numéro TVA à compléter]</li>
              <li><strong>Email de contact :</strong> <a href="mailto:contact@agent-growth-automator.com" className="text-primary hover:underline">contact@agent-growth-automator.com</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Directeur de la publication</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le directeur de la publication est le représentant légal de la société EmotionsCare SASU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Hébergement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le site Growth OS est hébergé par :
            </p>
            <ul className="list-none space-y-2 text-muted-foreground mt-4">
              <li><strong>Lovable (GPT Engineer, Inc.)</strong></li>
              <li>2261 Market Street #4830</li>
              <li>San Francisco, CA 94114, États-Unis</li>
              <li>Site web : <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">lovable.dev</a></li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Les données sont stockées sur les serveurs de :
            </p>
            <ul className="list-none space-y-2 text-muted-foreground mt-4">
              <li><strong>Supabase, Inc.</strong></li>
              <li>970 Toa Payoh North #07-04</li>
              <li>Singapore 318992</li>
              <li>Site web : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'ensemble des contenus présents sur le site Growth OS (textes, images, vidéos, logos, icônes, 
              sons, logiciels, etc.) sont protégés par les lois françaises et internationales relatives à 
              la propriété intellectuelle.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie 
              des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf 
              autorisation écrite préalable de la société EmotionsCare SASU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Protection des données personnelles</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique 
              et Libertés, vous disposez de droits sur vos données personnelles. Pour plus d'informations, 
              consultez notre <Link to="/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pour exercer vos droits ou pour toute question relative à vos données personnelles, vous pouvez 
              nous contacter à : <a href="mailto:contact@agent-growth-automator.com" className="text-primary hover:underline">contact@agent-growth-automator.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le site Growth OS utilise des cookies pour améliorer l'expérience utilisateur et analyser 
              le trafic. Pour plus d'informations sur l'utilisation des cookies, consultez notre{" "}
              <Link to="/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation de responsabilité</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les informations contenues sur ce site sont aussi précises que possible et le site est 
              régulièrement mis à jour. Toutefois, il peut contenir des inexactitudes ou des omissions.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              EmotionsCare SASU ne saurait être tenue responsable des dommages directs ou indirects 
              pouvant résulter de l'utilisation de ce site ou de l'impossibilité de l'utiliser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Droit applicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes mentions légales sont régies par le droit français. En cas de litige, 
              les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question ou demande concernant les mentions légales, vous pouvez nous contacter :
            </p>
            <ul className="list-none space-y-2 text-muted-foreground mt-4">
              <li><strong>Par email :</strong> <a href="mailto:contact@agent-growth-automator.com" className="text-primary hover:underline">contact@agent-growth-automator.com</a></li>
              <li><strong>Via le site :</strong> <Link to="/contact" className="text-primary hover:underline">Formulaire de contact</Link></li>
            </ul>
          </section>

          <p className="text-sm text-muted-foreground mt-12 pt-8 border-t border-border">
            Dernière mise à jour : Février 2026
          </p>
        </div>
      </div>
    </div>
  );
}
