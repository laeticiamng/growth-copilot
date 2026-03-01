

# Add real-time database subscriptions for instant dashboard updates

## Current state

The app already has partial realtime infrastructure:
- `notifications` and `approval_queue` tables are in the `supabase_realtime` publication and have working subscriptions
- `useNotifications` listens for new notifications in real-time (working)
- `useApprovals` listens for approval_queue changes in real-time (working)
- `RealtimeStatus` widget monitors channels for approvals and agent_runs

However, several key tables are **missing from realtime**:
- `agent_runs` -- not in `supabase_realtime` publication (RealtimeStatus channel exists but gets no events)
- `executive_runs` -- uses 10-second polling instead of realtime
- `kpis_daily` -- no realtime at all

## Changes

### 1. Database migration -- enable realtime on 3 tables

Add `agent_runs`, `executive_runs`, and `kpis_daily` to the `supabase_realtime` publication so Postgres broadcasts changes to connected clients.

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.executive_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kpis_daily;
```

### 2. New hook: `useDashboardRealtime`

Create `src/hooks/useDashboardRealtime.tsx` -- a single hook that subscribes to all dashboard-critical tables and invalidates the corresponding React Query caches when changes occur. This replaces manual polling with instant updates.

Tables monitored:
- `agent_runs` (workspace filter) -- invalidates `['executive-runs']` and `['agent-runs']` queries
- `executive_runs` (workspace filter) -- invalidates `['executive-runs']` queries  
- `kpis_daily` (site filter) -- invalidates `['dashboard-kpis-current']` and `['dashboard-kpis-previous']` queries
- `approval_queue` (workspace filter) -- already has its own realtime, but this adds React Query cache invalidation for any widget using `useQuery`

The hook uses the existing `useMultiTableSubscription` pattern from `useRealtimeSubscription.tsx`.

### 3. Wire into DashboardHome

Import and call `useDashboardRealtime()` inside `DashboardHome` so all dashboard widgets refresh instantly when backend data changes. No UI changes needed -- existing widgets will simply show fresh data.

### 4. Remove polling from `useExecutiveRuns`

Remove `refetchInterval: 10000` from the React Query config since realtime subscriptions now handle updates. This reduces unnecessary network requests.

## What will change for users

- Agent run completions appear instantly on the dashboard (no 10-second delay)
- KPI syncs show new data the moment they land in the database
- Executive run status transitions (queued -> running -> completed) update live
- RealtimeStatus widget will now actually receive agent_runs events (currently silent because the table isn't in the publication)
- Reduced network overhead (no more polling every 10 seconds)

## Technical notes

- The `useMultiTableSubscription` hook already handles ref-stable callbacks and cleanup
- React Query `invalidateQueries` triggers a background refetch, so data stays consistent with the server
- RLS policies on these tables are already consolidated -- realtime respects RLS, so users only receive events for their own workspace data

