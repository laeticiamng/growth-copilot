

# Audit UX Complet - Round 7 (Composants secondaires & DashboardHome)

## Resume

Apres les rounds 5 et 6 (cockpit principal localise), il reste **8 composants secondaires** et le fichier **DashboardHome.tsx** lui-meme avec des textes hardcodes en francais ou des patterns `i18n.language === 'fr' ? "..." : "..."` au lieu d'utiliser les cles i18n. Ces composants sont visibles dans le cockpit et affectent l'experience utilisateur dans toutes les langues autres que FR/EN.

---

## Problemes Identifies

### 1. WelcomeCard.tsx - Pattern ternaire au lieu de i18n (P0)
- Lignes 62-96: Tout le bloc de texte utilise `i18n.language === 'fr'` au lieu de `t()`
- Lignes 125-137: "Agents actifs", "Departements", "Disponibilite" en ternaire
- Lignes 103-106: Format de date en ternaire
- **Impact**: Ne fonctionne pas pour ES, DE, IT, PT, NL (7 langues supportees)

### 2. DashboardHome.tsx - Textes hardcodes restants (P0)
- Ligne 59: `getCGORole()` en ternaire FR/EN
- Ligne 213: `Par ${a.agent_type}` - francais hardcode
- Lignes 341-343: "Votre equipe d'agents specialises..." en ternaire
- Lignes 349-354: "Departements", "Direction Marketing", "Prets a executer" via `t()` mais pas verifie
- Lignes 370-389: Labels KPI "Clics organiques", "Conversions", "Position moyenne" hardcodes en francais

### 3. MoMComparison.tsx - 100% francais (P0)
- Lignes 38-43: periodLabels hardcodes ("Mois precedent", "Annee precedente", etc.)
- Ligne 58-67: `Intl.NumberFormat('fr-FR')` hardcode
- Lignes 114-127: Empty state "Aucune donnee KPI disponible", "Connecter Google Search Console"
- Lignes 136-139: "Comparaison de Periodes", "Evolution de vos KPIs cles"
- Lignes 166-181: "en hausse", "en baisse", "stables", "Moyenne"
- Ligne 219: "Pas de comparaison"
- Ligne 192: "Pas de donnees anterieures disponibles"

### 4. CockpitPDFExport.tsx - 100% francais (P1)
- Lignes 30-37: Section labels ("Resume executif", "Score de sante business", etc.)
- Lignes 48-65: Toast et dialog texts
- Ligne 72-76: Date en `fr-FR` hardcode
- Lignes 243-285: Dialog "Exporter le Cockpit en PDF", "Annuler", "Exporter"

### 5. RealtimeStatus.tsx - 100% francais (P1)
- Lignes 47-99: Channel names "Approbations", "Executions agents"
- Ligne 148: "Connexions temps reel"
- Ligne 169: "Aucune connexion active"

### 6. SmartAlertsPanel.tsx - 90% francais (P0)
- Ligne 70: "L'agent ${a.agent_type} propose une action."
- Lignes 115-143: Predictive alerts en francais
- Ligne 214: "Alertes"
- Ligne 227: "Aucune alerte"
- Ligne 263: `formatDistanceToNow` avec `locale: fr` hardcode

### 7. SessionStatus.tsx - 100% francais (P1)
- Ligne 53: "Non connecte"
- Lignes 78-79: "Expiration proche", "Session active"
- Ligne 85: "Expire dans..."
- Ligne 112-115: Meme textes en version non-compact
- Ligne 135: "Renouveler la session"
- Ligne 152: "Deconnexion"
- Ligne 59: `locale: fr` hardcode pour date-fns

### 8. NavigationHelper.tsx - 100% francais (P2)
- Lignes 29-85: Tous les titres, descriptions et features des sections de navigation
- Ligne 92: "Navigation rapide"
- Ligne 119: "Nouveau"

### 9. WorkspaceQuotaWidget.tsx - 100% francais (P1)
- Lignes 100-125: "Tokens IA", "Crawls (aujourd'hui)", "Executions concurrentes"
- Lignes 143-149: "Limite proche", "Attention"
- Ligne 194: "utilise" dans tooltip
- Ligne 204: "Gerer les quotas"

### 10. EmptyStateGuide.tsx - Texte "Progression" hardcode (P2)
- Ligne 37: "Progression"

### 11. AgentPerformanceChart.tsx - `locale: fr` hardcode (P1)
- Ligne 13: Import `fr` de date-fns, utilise sans dynamisme

---

## Plan d'Implementation

### Phase 1: Ajouter ~100 nouvelles cles i18n (en.ts et fr.ts)
Namespaces a ajouter/enrichir: `cockpit`, `dashboard`, `common`

### Phase 2: Corriger les 11 composants
Pour chaque composant:
1. Remplacer les ternaires `i18n.language === 'fr'` par `t("key")`
2. Dynamiser les locales `date-fns` et `Intl.NumberFormat` selon `i18n.language`
3. Ajouter `useTranslation` la ou manquant

### Fichiers a modifier

| Fichier | Nb textes | Priorite |
|---------|-----------|----------|
| `src/i18n/locales/en.ts` | ~100 cles | P0 |
| `src/i18n/locales/fr.ts` | ~100 cles | P0 |
| `src/components/cockpit/WelcomeCard.tsx` | 12 textes | P0 |
| `src/pages/dashboard/DashboardHome.tsx` | 8 textes | P0 |
| `src/components/dashboard/MoMComparison.tsx` | 18 textes | P0 |
| `src/components/notifications/SmartAlertsPanel.tsx` | 10 textes | P0 |
| `src/components/cockpit/SessionStatus.tsx` | 8 textes | P1 |
| `src/components/cockpit/RealtimeStatus.tsx` | 4 textes | P1 |
| `src/components/cockpit/WorkspaceQuotaWidget.tsx` | 8 textes | P1 |
| `src/components/dashboard/CockpitPDFExport.tsx` | 12 textes | P1 |
| `src/components/agents/AgentPerformanceChart.tsx` | 2 textes | P1 |
| `src/components/cockpit/NavigationHelper.tsx` | 20 textes | P2 |
| `src/components/cockpit/EmptyStateGuide.tsx` | 1 texte | P2 |

---

## Details techniques cles

### Pattern a eliminer
Le pattern `i18n.language === 'fr' ? "texte FR" : "texte EN"` est un anti-pattern car il ne supporte que 2 langues sur les 7 configurees (FR, EN, ES, DE, IT, PT, NL). Toutes ces occurrences doivent etre remplacees par `t("cle")`.

### Intl.NumberFormat dynamique
```text
// Avant
new Intl.NumberFormat('fr-FR').format(value)

// Apres
new Intl.NumberFormat(i18n.language === 'fr' ? 'fr-FR' : 'en-US').format(value)
```

### date-fns locale map reutilisable
Un helper partage pour la map de locales date-fns sera utilise, similaire a celui deja en place dans RunsHistory et ServiceHealthMonitor.

## Resume
- 11 composants avec textes hardcodes en francais
- ~100 nouvelles cles de traduction
- 13 fichiers a modifier
- Elimination de l'anti-pattern ternaire FR/EN
- Support complet des 7 langues

