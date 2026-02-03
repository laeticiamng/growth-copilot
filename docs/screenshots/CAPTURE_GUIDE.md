# Guide de Capture d'Écran Complet

## Pages à Capturer (Priorité)

### 1. Landing Page
- **URL** : `/`
- **Fichier** : `landing-hero.png`
- **Contenu** : Section Hero, départements, pricing

### 2. Cockpit Exécutif
- **URL** : `/dashboard`
- **Fichier** : `cockpit.png`
- **Contenu** : ExecutiveSummary, PriorityActions, QuickLaunchers, RunsHistory

### 3. Module RH
- **URL** : `/dashboard/hr`
- **Fichier** : `hr.png`
- **Contenu** : Annuaire employés, onboarding, performance

### 4. Module Juridique
- **URL** : `/dashboard/legal`
- **Fichier** : `legal.png`
- **Contenu** : Contrats, conformité RGPD, alertes

### 5. Module Marketing - SEO
- **URL** : `/dashboard/seo`
- **Fichier** : `seo.png`
- **Contenu** : Audit technique, issues, recommandations

### 6. Module Agents IA
- **URL** : `/dashboard/agents`
- **Fichier** : `agents.png`
- **Contenu** : Roster 37 agents, statuts, métriques

### 7. Module Approbations
- **URL** : `/dashboard/approvals`
- **Fichier** : `approvals.png`
- **Contenu** : Queue d'approbation, risques, actions

### 8. Module Finance (Billing)
- **URL** : `/dashboard/billing`
- **Fichier** : `billing.png`
- **Contenu** : Plans Stripe, usage, factures

### 9. Module Sécurité (Ops)
- **URL** : `/dashboard/ops`
- **Fichier** : `ops.png`
- **Contenu** : Métriques système, latence, santé

### 10. Module Audit Log
- **URL** : `/dashboard/audit-log`
- **Fichier** : `audit-log.png`
- **Contenu** : Traçabilité actions, filtres

---

## Instructions de Capture

### Méthode Automatique (Recommandée)

1. Se connecter à l'application
2. Utiliser Lovable Browser pour naviguer et capturer
3. Sauvegarder dans `docs/screenshots/`

### Méthode Manuelle

1. Ouvrir https://agent-growth-automator.lovable.app
2. Se connecter avec un compte test
3. Naviguer vers chaque page
4. Capture via DevTools (Ctrl+Shift+P → "Capture full size screenshot")
5. Sauvegarder en PNG 1920x1080

---

## Statut des Captures

| Page | Capturé | Contenu observé |
|------|---------|-----------------|
| Landing | ✅ | Hero, départements visibles, CTA |
| Cockpit | ✅ | Executive Summary, Priority Actions, Quick Launchers, Alerts |
| HR | ⚠️ | Upsell (service payant) |
| Legal | ⚠️ | Upsell (service payant) |
| SEO | ✅ | Interface d'audit SEO technique |
| Agents | ✅ | Mon équipe IA - roster visible |
| Approvals | ✅ | Queue d'approbation (vide actuellement) |
| Billing | ✅ | Plans Stripe, souscription |
| Ops | ✅ | Métriques système, santé |
| Audit Log | ✅ | Traçabilité des actions |

## Modules Accessibles Confirmés

Les screenshots confirment que les modules suivants sont **fonctionnels et accessibles** :
- ✅ **Cockpit Exécutif** - Tableau de bord principal avec widgets
- ✅ **Mon équipe IA (Agents)** - Roster des agents disponibles
- ✅ **SEO Tech** - Audit technique disponible
- ✅ **Approbations** - Queue de validation
- ✅ **Billing** - Gestion de l'abonnement
- ✅ **Ops** - Monitoring système
- ✅ **Audit Log** - Historique des actions

## Modules avec Upgrade Requis

Certains modules nécessitent un plan payant :
- ⚠️ **RH** - Département Ressources Humaines
- ⚠️ **Legal** - Département Juridique

> Note : Les captures ont été réalisées le 2026-02-03 via le navigateur automatisé Lovable.
