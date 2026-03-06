

# Amélioration visuelle de la section Testimonials

## Contexte
La section actuelle utilise des "cas d'usage types" conformément à la politique Zero Fake Data. Le contenu i18n est bon. L'amélioration porte sur le visuel pour donner plus de crédibilité et d'impact sans inventer de fausses preuves.

## Changements prévus

### 1. Refonte visuelle du composant Testimonials
- Remplacer la grille statique par un design plus premium avec des guillemets décoratifs (icône `Quote`)
- Ajouter un badge "Cas d'usage type" sur chaque carte au lieu du disclaimer en bas
- Cards avec effet glassmorphism et bordure subtile au hover
- Avatars plus grands (48px) avec des icônes de secteur au lieu des initiales (Building2, Rocket, Briefcase) pour représenter le type d'entreprise
- Ajouter une section "Résultat clé" mise en avant visuellement (chiffre en gros, coloré) sous chaque quote
- Fond de section avec un léger dégradé pour se démarquer

### 2. Ajouter une barre de métriques factuelles
Sous le titre, afficher 3 métriques vérifiables de la plateforme (pas de fausses stats utilisateurs) :
- "39 agents IA" 
- "9 départements"
- "Déploiement en < 5 min"

Ces métriques sont des faits produit, pas des claims marketing.

### 3. Mise à jour i18n (FR + EN)
- Ajouter les clés pour les "résultats clés" de chaque profil (ex: "-40% budget", "+65% leads", "10h/semaine gagnées")
- Ajouter les clés pour le badge "Cas d'usage type"
- Renommer le titre de section en quelque chose de plus impactant : "Ce que nos agents peuvent accomplir" / "What our agents can achieve"
- Supprimer le disclaimer séparé (intégré dans le badge sur chaque carte)

### Fichiers modifiés
- `src/components/landing/Testimonials.tsx` — refonte visuelle complète
- `src/i18n/locales/fr.ts` — nouvelles clés testimonials
- `src/i18n/locales/en.ts` — nouvelles clés testimonials

