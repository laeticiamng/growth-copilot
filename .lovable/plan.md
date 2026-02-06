

# Fix: Remove Duplicate i18n Keys (Build Error TS1117)

## Problem
Both `en.ts` and `fr.ts` have 4 duplicate namespace blocks appended at the end of the file (lines ~3661-3762) that conflict with earlier, already-complete definitions:

| Namespace | First occurrence (kept) | Duplicate (to remove) |
|-----------|------------------------|----------------------|
| `hrPage` | Line ~1551 | Line ~3661 |
| `legalPage` | (already exists earlier) | Line ~3687 |
| `agentsPage` | Line ~3453 | Line ~3713 |
| `webhooksComponent` | Line ~3406 | Line ~3724 |
| `autopilotComponent` | Line ~3430 | Line ~3744 |

The first occurrences already contain the complete and correct keys used by the components.

## Fix (both en.ts and fr.ts)
Delete the duplicate blocks from line 3661 through line 3762 (the `hrPage`, `legalPage`, `agentsPage`, `webhooksComponent`, `autopilotComponent` duplicates), keeping only the `sitesPage` block that follows.

This is the same pattern as previous rounds -- keys were appended instead of merged into existing blocks.

**Files modified: 2** (`en.ts`, `fr.ts`)
