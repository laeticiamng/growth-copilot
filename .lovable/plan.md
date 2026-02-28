

# Replace remaining mock data with real database queries

## Summary

3 dashboard pages still consume `mock-dashboard.ts`. This plan replaces each with real Lovable Cloud queries while keeping useful UX patterns intact.

## Current state

| Page | Mock used | Real data source |
|------|-----------|-----------------|
| `DeptDashboard.tsx` | `getMockTasksForDepartment`, `getMockMetricsForDepartment` | `agent_runs` (tasks), `ops_metrics_daily` (metrics) |
| `AnalyzeUrl.tsx` | `MOCK_ANALYSIS_RESULT` | `site-analyze` edge function (already exists) |
| `AgentChat.tsx` | `getAgentGreeting`, `getAgentResponses` | `ai-gateway` edge function (real AI responses) |

## Changes

### 1. DeptDashboard.tsx -- Wire to real data

**Remove** imports from `mock-dashboard.ts`.

**Add query: Department tasks** -- Query `agent_runs` filtered by `workspace_id` and agent types belonging to the department. Map agent_type to department using the existing `AGENTS_CATALOG` data. Show real status, created_at as due date proxy.

**Add query: Department metrics** -- Query `ops_metrics_daily` for the workspace (last 7 days). Compute department-specific metrics (runs total, success rate, avg duration). Display computed metrics with week-over-week change.

**Task creation** -- Wire the "New Task" button to actually INSERT into `agent_runs` with status `pending` (or show a toast that the run was queued). Use `supabase.functions.invoke("run-executor")` to launch a real agent run.

**Fallback** -- Show Skeleton loaders while fetching, and empty states when no data exists.

### 2. AnalyzeUrl.tsx -- Call real site-analyze edge function

**Remove** `MOCK_ANALYSIS_RESULT` import.

**Replace** the fake progress animation with a real call to the `site-analyze` edge function (already deployed, supports Firecrawl).

**Flow:**
1. User enters URL, clicks Analyze
2. Call `supabase.functions.invoke("site-analyze", { body: { url } })`
3. Show progress bar during the call
4. On response, map `analysis` result fields (title, wordCount, techStack, hasAnalytics, etc.) to the score display
5. Compute scores from real signals (e.g., hasAnalytics = good, no meta description = warning)
6. Generate recommendations dynamically from the analysis response

**Scores calculation logic:**
- SEO: based on title presence, description, h1, internal links count
- Content: based on wordCount thresholds
- Speed: placeholder (no real measurement yet, show N/A or use a reasonable default)
- Technical: based on techStack detection, analytics, CMS presence

### 3. AgentChat.tsx -- Connect to AI gateway for real responses

**Remove** `getAgentGreeting` and `getAgentResponses` imports.

**Keep** the greeting as a client-side static message based on agent persona (from `agents-catalog.ts` which is NOT mock data -- it's the real catalog). Generate a greeting dynamically from agent role + name.

**Replace** scripted responses with real AI calls:
1. User sends message
2. Call `supabase.functions.invoke("ai-gateway", { body: { prompt, model, context } })` with the agent's persona as system prompt
3. Stream or display the AI response when received
4. Fall back to a generic "I'm processing your request" message if the call fails

**System prompt construction:** Use agent's `role`, `persona.name`, `departmentSlug` from the catalog to build a contextual system prompt like: "You are {name}, {role} in the {department} department. Respond helpfully in {language}."

### 4. Clean up mock-dashboard.ts

After all 3 pages are migrated, **delete** `src/data/mock-dashboard.ts` entirely. The file will have zero consumers.

## Technical details

```text
Files to modify:
  src/pages/dashboard/DeptDashboard.tsx  -- replace mock with agent_runs + ops_metrics queries
  src/pages/dashboard/AnalyzeUrl.tsx     -- replace mock with site-analyze edge function call
  src/pages/dashboard/AgentChat.tsx      -- replace scripted responses with ai-gateway calls

Files to delete:
  src/data/mock-dashboard.ts             -- no longer needed

No database migrations needed -- all tables already exist.
No new edge functions needed -- site-analyze and ai-gateway are already deployed.
```

### Query patterns (DeptDashboard)

Tasks query:
```typescript
supabase.from("agent_runs")
  .select("id, agent_type, status, created_at, completed_at, duration_ms")
  .eq("workspace_id", wsId)
  .in("agent_type", agentTypesForDepartment)
  .order("created_at", { ascending: false })
  .limit(20)
```

Metrics query:
```typescript
supabase.from("ops_metrics_daily")
  .select("*")
  .eq("workspace_id", wsId)
  .gte("date", sevenDaysAgo)
  .order("date", { ascending: false })
```

### Edge function calls (AnalyzeUrl + AgentChat)

```typescript
// AnalyzeUrl
const { data } = await supabase.functions.invoke("site-analyze", {
  body: { url: formattedUrl }
});

// AgentChat
const { data } = await supabase.functions.invoke("ai-gateway", {
  body: {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ]
  }
});
```

