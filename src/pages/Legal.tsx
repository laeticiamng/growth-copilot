import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";

export default function Legal() {
  const { t, i18n } = useTranslation();
  const isFr = i18n.language === "fr";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title="Mentions Légales" description="Mentions légales de Growth OS par EmotionsCare SASU." canonical="/legal" />
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container max-w-4xl px-4">
            {!isFr && (
              <Badge variant="outline" className="mb-4">
                {t("common.frenchOnly")}
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Mentions Légales</h1>
            <p className="text-muted-foreground text-lg">Dernière mise à jour : Février 2026</p>
          </div>
        </div>

        <div className="container max-w-4xl py-12 px-4">
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Éditeur du site</h2>
              <p className="text-muted-foreground leading-relaxed">
                Le site <strong>Growth OS</strong> est édité par :
              </p>
              <ul className="list-none space-y-2 text-muted-foreground mt-4">
                <li><strong>Raison sociale :</strong> EmotionsCare SASU</li>
                <li><strong>Siège social :</strong> France</li>
                <li><strong>Forme juridique :</strong> Société par Actions Simplifiée Unipersonnelle</li>
                <li><strong>Informations d'immatriculation :</strong> Disponibles sur demande</li>
                <li><strong>Email de contact :</strong> <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a></li>
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
              <p className="text-muted-foreground leading-relaxed">Le site Growth OS est hébergé par :</p>
              <ul className="list-none space-y-2 text-muted-foreground mt-4">
                <li><strong>Lovable (GPT Engineer, Inc.)</strong></li>
                <li>2261 Market Street #4830</li>
                <li>San Francisco, CA 94114, États-Unis</li>
                <li>Site web : <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">lovable.dev</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Propriété intellectuelle</h2>
              <p className="text-muted-foreground leading-relaxed">
                L'ensemble des contenus présents sur le site Growth OS sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction est interdite sauf autorisation écrite préalable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Protection des données personnelles</h2>
              <p className="text-muted-foreground leading-relaxed">
                Conformément au RGPD, vous disposez de droits sur vos données personnelles. Pour plus d'informations, consultez notre <Link to="/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Contact DPO : <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitation de responsabilité</h2>
              <p className="text-muted-foreground leading-relaxed">
                EmotionsCare SASU ne saurait être tenue responsable des dommages directs ou indirects pouvant résulter de l'utilisation de ce site ou de l'impossibilité de l'utiliser.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Droit applicable</h2>
              <p className="text-muted-foreground leading-relaxed">
                Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
              <ul className="list-none space-y-2 text-muted-foreground mt-4">
                <li><strong>Par email :</strong> <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a></li>
                <li><strong>Via le site :</strong> <Link to="/contact" className="text-primary hover:underline">Formulaire de contact</Link></li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
