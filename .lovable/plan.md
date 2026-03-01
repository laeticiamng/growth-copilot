

# Consolidate 113 redundant RLS policies into clean 4-per-table structure

## Problem

The security scan found **21 findings** (16 errors, 5 warnings). Investigation reveals:

- All 20 flagged tables already have RLS **enabled** -- no data is truly unprotected
- The real issue: **113 overlapping policies** across 16 tables, accumulated from 15+ migrations
- Many policies use `{public}` role (which includes anonymous users) instead of `{authenticated}` only
- Since PERMISSIVE policies are OR'd together, the broadest policy wins -- making stricter ones meaningless
- Example: `deals` has 3 SELECT policies, 3 INSERT policies, 3 UPDATE policies, 2 DELETE policies

## Root cause

Each migration added new policies without dropping the old ones, creating layers of redundancy where the broadest policy always wins.

## Solution

Drop all existing policies on each table and replace with exactly **4 clean policies** (SELECT/INSERT/UPDATE/DELETE) targeting `{authenticated}` role only, using the strictest access logic appropriate for each table's sensitivity level.

## Tables grouped by access pattern

### Tier 1: Owner/HR only (most sensitive)
| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `employees` | HR or self or owner | HR only | HR only | HR only |
| `performance_reviews` | HR/reviewer/self | HR/manager | HR/manager | HR only |
| `time_off_requests` | HR or self | workspace member | HR or self | HR only |
| `gdpr_requests` | owner only | owner/HR | owner only | owner only |
| `integration_tokens` | owner only | owner only | owner only | owner only |
| `oauth_tokens` | (keep existing 4 policies -- already consolidated) | -- | -- | -- |

### Tier 2: Role-gated (business data)
| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `leads` | workspace member | workspace member | sales access | sales access |
| `deals` | assigned or sales mgr | sales access | assigned or sales mgr | sales access |
| `activities` | assigned/creator/manager | workspace member | assigned/creator/manager | creator or manager |
| `contracts` | billing access or owner | billing access | billing access | owner only |
| `ai_requests` | own or owner or billing | workspace member | own or owner | -- (no delete) |
| `kpis_daily` | workspace member | workspace member | owner only | owner only |

### Tier 3: Integration data (workspace-scoped)
| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `meta_conversations` | workspace member | workspace member | workspace member | owner only |
| `meta_messages` | workspace member | workspace member | -- (immutable) | owner only |
| `meta_capi_events` | workspace member | workspace member | -- (immutable) | owner only |
| `smart_link_emails` | owner/admin | anon (rate-limited) | -- | owner only |

## Migration structure

A single SQL migration that for each of the 15 tables (excluding `oauth_tokens` which is already clean):

```text
1. DROP all existing policies on the table
2. CREATE exactly 4 new policies (SELECT/INSERT/UPDATE/DELETE)
   - All use {authenticated} role (except smart_link_emails INSERT which needs anon)
   - All use workspace-scoped security definer functions
   - Named consistently: {table}_{select|insert|update|delete}
```

## Expected outcome

- Policy count: 113 --> ~62 (4 per table, some tables skip DELETE or UPDATE)
- All `{public}` role policies eliminated (except smart_link_emails insert)
- Security scan errors: 16 --> 0
- Security scan warnings: reduced (audit_log, notifications, approval_queue, creative_jobs are separate tables not in this scope)
- No functional regression: same access logic, just deduplicated

## Technical notes

- `oauth_tokens` is skipped (already consolidated in a previous migration)
- `smart_link_emails` INSERT keeps `anon` role since it's a public lead capture form (protected by rate-limit trigger)
- The `{public}` role in PostgreSQL means ALL roles including `anon` -- this is what the scanner flagged as dangerous
- All security definer functions (`has_workspace_access`, `has_hr_access`, `has_sales_access`, `is_workspace_owner`, `has_billing_access`, `has_permission`) already exist and are unchanged

