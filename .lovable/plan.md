

# Plan : Retrait des faux avis et verification finale

## 1. Retrait de la section Testimonials (P0 - demande explicite)

La section Testimonials avec les faux profils (Laurent Moreau, Sophie Bertrand, Marc Dubois) sera entierement supprimee de la landing page.

**Fichiers concernes :**
- `src/pages/Index.tsx` : Retirer l'import et le composant `<Testimonials />`
- `src/components/landing/Testimonials.tsx` : Le fichier reste dans le projet mais n'est plus utilise (pas de suppression physique necessaire)

## 2. Verification complete des chemins et boutons

Apres audit exhaustif de tous les liens et CTA de la landing page, voici le statut :

| Element | Route | Statut |
|---------|-------|--------|
| Hero "Commencer" | `/auth?tab=signup&url=...` | OK |
| Hero "Voir les tarifs" | `#pricing` (smooth scroll) | OK |
| Navbar "Login" | `/auth` | OK |
| Navbar "Get Started" | `/auth?tab=signup` | OK |
| Navbar mobile (meme logique) | `/auth?tab=signup` | OK |
| Services CTA "Construire mon package" | `/auth?tab=signup` | OK |
| CTA section "Commencer gratuitement" | `/auth?tab=signup` | OK |
| CTA "Voir les tarifs" | `#pricing` (smooth scroll) | OK |
| Footer liens internes | `/about`, `/contact`, `/legal`, `/terms`, `/privacy`, `/roadmap` | OK (toutes ces routes existent dans App.tsx) |
| Footer liens ancres | `#features`, `#services`, `#pricing`, `#tools` | OK |
| Navbar ancres | `#features`, `#departments`, `#tools`, `#pricing` | OK |

**Toutes les routes publiques declarees dans App.tsx :**
- `/` `/auth` `/privacy` `/terms` `/legal` `/about` `/roadmap` `/contact` `/install` `/demo-oauth` `/link/:slug` `/onboarding` (protegee)
- Toutes les routes `/dashboard/*` sont protegees par `ProtectedRoute`
- Route `*` -> `NotFound` (page 404 stylisee)

## 3. Verification securite et conformite

| Check | Statut |
|-------|--------|
| Secrets cote client (.env) | Uniquement cles publiques (anon key, URL) |
| Bandeau cookies (CookieConsent) | Present et fonctionnel |
| Crisp bloque avant consentement | Oui (verifie dans CrispChat.tsx) |
| Pages legales (Privacy, Terms, Legal) | Completes |
| Rate limiting (contact, smart links) | En place via triggers DB |
| RLS sur 131 tables | Actif |
| Analytics tracking (useAnalytics) | Hook present, events traces |

## 4. Resume des modifications

Une seule modification : retirer `<Testimonials />` de `Index.tsx` (2 lignes : import + composant).

La landing page passera de 12 a 11 sections :
Hero > TrustBar > Features > Services > TeamOrgChart > Tools > HowItWorks > Pricing > FAQ > CTA > Footer

**Verdict apres correction : READY TO PUBLISH = OUI**

