
# Pre-Publication Fix: Remaining Hardcoded French Strings

## Findings

4 files still contain hardcoded French strings that break the non-French user experience:

| File | Hardcoded strings | i18n keys exist? |
|------|-------------------|------------------|
| `src/pages/dashboard/Sites.tsx` | ~30 strings (dialogs, labels, buttons, sectors) | Yes (`sitesPage.*`) |
| `src/pages/dashboard/HR.tsx` | ~15 strings (dialog titles, empty states, buttons) | Yes (`hrPage.*`) |
| `src/pages/dashboard/Legal.tsx` | ~10 strings (empty states, buttons, descriptions) | Yes (`legalPage.*`) |
| `src/pages/dashboard/Ops.tsx` | ~20 strings (card titles, empty states, token labels) | No -- keys need to be added to `en.ts` and `fr.ts` |

## Plan

### 1. `src/pages/dashboard/Sites.tsx`
- Replace all hardcoded strings with `t("sitesPage.*")` calls
- Convert `sectors` array to dynamic `getSectors(t)` function using existing `sitesPage.sector*` keys
- Covers: dialog titles, descriptions, labels, buttons, empty states, delete confirmation

### 2. `src/pages/dashboard/HR.tsx`
- Replace remaining hardcoded strings with `t("hrPage.*")` calls
- Covers: "Nouvel employe", "Ajouter un employe", "Aucun employe trouve", "Aucun onboarding en cours", form labels

### 3. `src/pages/dashboard/Legal.tsx`
- Replace remaining hardcoded strings with `t("legalPage.*")` calls
- Covers: "Aucun contrat trouve", "Aucun template", "Supprimer", contract count labels

### 4. `src/pages/dashboard/Ops.tsx`
- Add `opsPage` namespace to both `en.ts` and `fr.ts` with ~20 keys
- Replace hardcoded strings: "Incidents recents", "Etat des tokens", "Audit des tokens", "Aucun incident", "Aucune integration active", "Aucun evenement", "Resoudre", "Pas d'expiration", "echecs"

## Technical Details

- All files already have `useTranslation` imported
- Sites.tsx needs the `sectors` array converted to a getter function (same pattern as HR/Legal label refactoring done in previous rounds)
- Ops.tsx is the only file needing new locale keys -- approximately 20 keys per language file
- No structural changes, only string replacement

**Files modified: 6** (4 components + 2 locale files)
