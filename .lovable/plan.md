
# Plan: Corriger les points restants de l'audit pré-production

## Problèmes identifiés (encore présents)

### 1. "Portable Company" jargon (P1) — 4 occurrences
- `fr.ts` lignes 1304, 1341 : "abonnement Portable Company" → "abonnement Growth OS"
- `en.ts` lignes 1304, 1341 : "Portable Company subscription" → "Growth OS subscription"

### 2. Testimonials quotes en première personne (P0 résiduel)
Les quotes utilisent toujours le "je/nous" et des détails très spécifiques ("52 employés", "3 mois") qui donnent l'impression de vrais témoignages malgré le badge "Cas d'usage type". Conformément à la politique Zero Fake Data, reformuler en descriptions factuelles de scénarios plutôt qu'en faux verbatims.

**FR** (fr.ts lignes 273-286) et **EN** (en.ts lignes 272-289) :
- Remplacer les quotes à la première personne par des descriptions objectives de scénarios :
  - t1 : "Une PME Tech de 50 employés a pu remplacer son agence SEO et son freelance ads en activant les départements Marketing et Commercial. Résultat type : réduction de 40% du budget et hausse significative des leads qualifiés."
  - t2 : "Un fondateur solo déploie les 11 départements pour couvrir l'ensemble des fonctions business sans recruter. Les agents gèrent marketing, ventes, finance et support de manière autonome."
  - t3 : "Un consultant digital utilise Growth OS pour ses clients : audits SEO automatiques, rapports PDF, suivi des KPIs. Gain de productivité estimé : 10h par semaine."

### 3. ICE jargon dans Help (P1 résiduel)
- Help article #6 mentionne "ICE scoring" sans que ce soit expliqué pour un novice. Le texte actuel donne une définition correcte mais le terme reste du jargon.
- Reformuler la question : "Comment sont priorisées les recommandations ?" / "How are recommendations prioritized?"

### 4. Absence de section screenshots produit (P0.2 — non implémentable automatiquement)
Ce point nécessite des captures d'écran réelles du dashboard. Je ne peux pas les générer. En revanche, je peux créer le composant placeholder `ProductPreview` avec des emplacements pour les images, prêt à recevoir de vraies captures.

## Fichiers modifiés

1. **`src/i18n/locales/fr.ts`** — Remplacer "Portable Company" (×2), reformuler quotes testimonials, reformuler ICE question Help
2. **`src/i18n/locales/en.ts`** — Idem en anglais
3. **`src/pages/Help.tsx`** — Reformuler question ICE
4. **`src/components/landing/ProductPreview.tsx`** — Nouveau composant placeholder pour screenshots produit
5. **`src/pages/Index.tsx`** — Intégrer ProductPreview entre Features et TeamOrgChart
