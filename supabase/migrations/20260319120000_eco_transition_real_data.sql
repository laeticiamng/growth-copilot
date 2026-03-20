create table if not exists public.eco_emission_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  site_id uuid references public.sites(id) on delete cascade,
  source_name text not null,
  category text not null,
  scope smallint not null check (scope in (1, 2, 3)),
  annual_emissions_tco2e numeric(12,2) not null check (annual_emissions_tco2e >= 0),
  methodology text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eco_roadmap_actions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  site_id uuid references public.sites(id) on delete cascade,
  title text not null,
  target_year integer not null check (target_year between 2024 and 2100),
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed')),
  co2_reduction_tco2e numeric(12,2) default 0 check (co2_reduction_tco2e >= 0),
  budget_eur numeric(12,2) default 0 check (budget_eur >= 0),
  roi_percent numeric(8,2) default 0,
  owner_name text,
  funding_sources text[] default '{}',
  notes text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.eco_subsidy_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  site_id uuid references public.sites(id) on delete cascade,
  program_name text not null,
  provider text not null,
  amount_eur numeric(12,2) default 0 check (amount_eur >= 0),
  deadline date,
  eligibility_score integer default 0 check (eligibility_score between 0 and 100),
  status text not null default 'identified' check (status in ('identified', 'drafting', 'submitted', 'won', 'rejected')),
  source_url text,
  tags text[] default '{}',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.eco_monthly_metrics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  site_id uuid references public.sites(id) on delete cascade,
  month date not null,
  energy_kwh numeric(12,2) check (energy_kwh >= 0),
  waste_recycled_pct numeric(5,2) check (waste_recycled_pct between 0 and 100),
  renewable_energy_pct numeric(5,2) check (renewable_energy_pct between 0 and 100),
  carbon_intensity_g_per_eur numeric(10,2) check (carbon_intensity_g_per_eur >= 0),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  unique (workspace_id, site_id, month)
);

create table if not exists public.eco_reporting_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  site_id uuid references public.sites(id) on delete cascade,
  period_label text not null,
  csrd_completeness_pct integer not null check (csrd_completeness_pct between 0 and 100),
  climate_score integer not null check (climate_score between 0 and 100),
  social_score integer not null check (social_score between 0 and 100),
  governance_score integer not null check (governance_score between 0 and 100),
  notes text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists eco_emission_sources_workspace_idx on public.eco_emission_sources (workspace_id, scope, updated_at desc);
create index if not exists eco_roadmap_actions_workspace_idx on public.eco_roadmap_actions (workspace_id, target_year, status);
create index if not exists eco_subsidy_projects_workspace_idx on public.eco_subsidy_projects (workspace_id, status, deadline);
create index if not exists eco_monthly_metrics_workspace_idx on public.eco_monthly_metrics (workspace_id, month desc);
create index if not exists eco_reporting_snapshots_workspace_idx on public.eco_reporting_snapshots (workspace_id, created_at desc);

alter table public.eco_emission_sources enable row level security;
alter table public.eco_roadmap_actions enable row level security;
alter table public.eco_subsidy_projects enable row level security;
alter table public.eco_monthly_metrics enable row level security;
alter table public.eco_reporting_snapshots enable row level security;

drop policy if exists "eco_emission_sources_workspace_access" on public.eco_emission_sources;
create policy "eco_emission_sources_workspace_access" on public.eco_emission_sources
for all using (public.has_workspace_access(auth.uid(), workspace_id))
with check (public.has_workspace_access(auth.uid(), workspace_id));

drop policy if exists "eco_roadmap_actions_workspace_access" on public.eco_roadmap_actions;
create policy "eco_roadmap_actions_workspace_access" on public.eco_roadmap_actions
for all using (public.has_workspace_access(auth.uid(), workspace_id))
with check (public.has_workspace_access(auth.uid(), workspace_id));

drop policy if exists "eco_subsidy_projects_workspace_access" on public.eco_subsidy_projects;
create policy "eco_subsidy_projects_workspace_access" on public.eco_subsidy_projects
for all using (public.has_workspace_access(auth.uid(), workspace_id))
with check (public.has_workspace_access(auth.uid(), workspace_id));

drop policy if exists "eco_monthly_metrics_workspace_access" on public.eco_monthly_metrics;
create policy "eco_monthly_metrics_workspace_access" on public.eco_monthly_metrics
for all using (public.has_workspace_access(auth.uid(), workspace_id))
with check (public.has_workspace_access(auth.uid(), workspace_id));

drop policy if exists "eco_reporting_snapshots_workspace_access" on public.eco_reporting_snapshots;
create policy "eco_reporting_snapshots_workspace_access" on public.eco_reporting_snapshots
for all using (public.has_workspace_access(auth.uid(), workspace_id))
with check (public.has_workspace_access(auth.uid(), workspace_id));

create or replace function public.touch_eco_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_touch_eco_emission_sources_updated_at on public.eco_emission_sources;
create trigger tr_touch_eco_emission_sources_updated_at
before update on public.eco_emission_sources
for each row execute function public.touch_eco_updated_at();
