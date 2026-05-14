-- settings: simple key/value store for label-level config
create table public.settings (
  key   text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seed the monthly video budget (USD). Admin can update this via /admin/settings.
insert into public.settings (key, value) values ('monthly_video_budget_usd', '100'::jsonb);

-- updated_at trigger
create trigger settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- RLS: only admins can read or write settings
alter table public.settings enable row level security;

create policy "settings_admin_only"
  on public.settings for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- Add cost tracking to video_jobs
alter table public.video_jobs
  add column if not exists cost_estimate_usd numeric(8,4) default null;
