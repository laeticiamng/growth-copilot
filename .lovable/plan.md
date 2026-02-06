
# Audit UX Complet - Round 6 (Cockpit & Composants)

## Resume

Apres les corrections des rounds precedents (landing, layout, settings, billing), il reste **8 composants cockpit majeurs** et **2 composants secondaires** avec des textes hardcodes en francais. Ces composants representent le coeur de l'experience dashboard et sont visibles des la premiere connexion.

---

## Problemes Identifies

### 1. QuickLaunchers.tsx - Textes 100% francais (P0)
- "Plan de la semaine", "Audit SEO", "Diagnostic funnel", "Verification securite"
- "Lancer une action"
- Toast: "Ce service n'est pas active", "lance avec succes", "Erreur lors du lancement"

### 2. PriorityActions.tsx - Textes 100% francais (P1)
- "Priorites", "Actions classees par impact x confiance x facilite"
- "Aucune action prioritaire pour le moment"

### 3. PriorityActionsEnhanced.tsx - Textes 100% francais (P0)
- "Actions Prioritaires", "Classees par score ICE"
- "Aucune action prioritaire", "Vos agents travaillent en arriere-plan"
- "Action proposee par...", "Immediat", "Voir"
- Toast: "Erreur lors de l'approbation", "Action approuvee/refusee"
- `window.prompt("Raison du refus :")` - francais hardcode

### 4. ApprovalsWidget.tsx - Textes 100% francais (P1)
- "En attente d'approbation"
- "Aucune action en attente", "Vous etes a jour !"
- "Refuser", "Approuver", "Voir details"
- "Voir les X autres"

### 5. RunsHistory.tsx - Textes 100% francais (P0)
- "Executions recentes"
- "Aucune execution recente", "Lancez une action depuis le cockpit"
- STATUS_CONFIG: "Termine", "Echec", "En cours", "En attente"
- Dialog: "Resume", "Preuves", "Resultats", "Erreur"
- `date-fns locale: fr` hardcode (pas dynamique)

### 6. ExecutiveSummary.tsx - Textes 100% francais (P1)
- "Etat de {siteName}"
- statusConfig: "Operationnel", "Attention requise", "Action urgente", "Non configure"
- Badges: "critiques", "attention", "Tout va bien"

### 7. ROITrackerWidget.tsx - Textes 100% francais (P0)
- "ROI Temps Reel", "30 derniers jours"
- "Economies nettes", "Temps gagne"
- "Taches IA", "Duree IA", "Equiv. humain", "Couts IA"
- "Agents les plus actifs", "taches"
- "Valeur produite", "Cout plateforme", "Couts IA (tokens)"
- Tooltip en francais

### 8. BusinessHealthScore.tsx - Textes 100% francais (P0)
- "Meteo Business"
- "Score de sante global de votre workspace"
- Metrics: "Configuration", "Integrations", "Activite IA", "Approbations", "Donnees KPI"
- Descriptions: "Site configure", "Aucun site configure", "integrations actives", "executions cette semaine", etc.
- Weather labels: "Excellent", "Bon", "Modere", "A ameliorer"
- Tooltip en francais

### 9. ServiceHealthMonitor.tsx - Textes 100% francais (P1)
- "Sante des Services"
- "Tous operationnels", "Degrade", "Probleme detecte"
- "Aucun service a surveiller"
- "Derniere verification:", "Taux d'erreur:", "Derniere mise a jour:"
- `date-fns locale: fr` hardcode

### 10. DepartmentSemaphores.tsx - Messages en francais (P1)
- Les messages dynamiques sont hardcodes: "Non active - Lancer le premier audit", "brief(s) en attente", "Non active - Configurer Google Ads", etc.
- linkLabels: "Auditer", "Gerer", "Configurer", "Pipeline", "Analyser"

---

## Plan d'Implementation

### Phase 1: Ajouter les cles i18n manquantes (en.ts et fr.ts)
Ajouter un namespace `cockpit` etendu couvrant tous les composants ci-dessus (~80 nouvelles cles).

### Phase 2: Corriger les 10 composants
Pour chaque composant:
1. Ajouter `import { useTranslation } from "react-i18next"`
2. Remplacer les textes hardcodes par `t("cockpit.xxx")`
3. Dynamiser les `date-fns` locales selon `i18n.language`

### Fichiers a modifier

| Fichier | Nb textes a traduire |
|---------|---------------------|
| `src/i18n/locales/en.ts` | ~80 cles |
| `src/i18n/locales/fr.ts` | ~80 cles |
| `src/components/cockpit/QuickLaunchers.tsx` | 10 textes |
| `src/components/cockpit/PriorityActions.tsx` | 5 textes |
| `src/components/cockpit/PriorityActionsEnhanced.tsx` | 15 textes |
| `src/components/cockpit/ApprovalsWidget.tsx` | 8 textes |
| `src/components/cockpit/RunsHistory.tsx` | 12 textes |
| `src/components/cockpit/ExecutiveSummary.tsx` | 8 textes |
| `src/components/cockpit/ROITrackerWidget.tsx` | 15 textes |
| `src/components/cockpit/BusinessHealthScore.tsx` | 18 textes |
| `src/components/cockpit/ServiceHealthMonitor.tsx` | 8 textes |
| `src/components/cockpit/DepartmentSemaphores.tsx` | 12 textes |

---

## Priorites

1. **P0:** QuickLaunchers + PriorityActionsEnhanced + RunsHistory + ROITrackerWidget + BusinessHealthScore (composants les plus visibles)
2. **P1:** ApprovalsWidget + PriorityActions + ExecutiveSummary + ServiceHealthMonitor + DepartmentSemaphores

## Resume
- 10 composants cockpit a localiser
- ~80 nouvelles cles de traduction
- 12 fichiers a modifier
- Impact: Experience dashboard 100% coherente EN/FR
