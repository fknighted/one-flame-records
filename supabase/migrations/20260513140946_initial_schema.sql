-- ─────────────────────────────────────────────────────────────
-- Shared updated_at trigger function
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- artists
-- ─────────────────────────────────────────────────────────────
create table public.artists (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  stage_name     text not null,
  legal_name     text,
  bio            text not null default '',
  photo_url      text,
  hometown       text,
  genres         text[] not null default '{}',
  socials        jsonb not null default '{}',
  streaming      jsonb not null default '{}',
  status         text not null default 'pending'
                   check (status in ('pending', 'active', 'archived')),
  featured_order int,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger artists_updated_at
  before update on public.artists
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- signup_codes
-- ─────────────────────────────────────────────────────────────
create table public.signup_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  label       text not null,
  is_active   boolean not null default true,
  rotated_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger signup_codes_updated_at
  before update on public.signup_codes
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- profiles  (mirrors auth.users, created via trigger)
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'artist'
                check (role in ('admin', 'artist')),
  artist_id   uuid references public.artists(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profiles row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- releases
-- ─────────────────────────────────────────────────────────────
create table public.releases (
  id              uuid primary key default gen_random_uuid(),
  artist_id       uuid not null references public.artists(id) on delete cascade,
  title           text not null,
  slug            text not null unique,
  type            text not null check (type in ('single', 'ep', 'album', 'mixtape')),
  release_date    date not null,
  cover_url       text not null default '',
  description     text,
  streaming_links jsonb not null default '{}',
  featured        boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger releases_updated_at
  before update on public.releases
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- videos
-- ─────────────────────────────────────────────────────────────
create table public.videos (
  id           uuid primary key default gen_random_uuid(),
  artist_id    uuid not null references public.artists(id) on delete cascade,
  release_id   uuid references public.releases(id) on delete set null,
  title        text not null,
  youtube_id   text not null,
  kind         text not null check (kind in ('music_video', 'lyric', 'live', 'behind_scenes', 'generated')),
  published_at timestamptz not null default now(),
  featured     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger videos_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- assets  (private artist uploads)
-- ─────────────────────────────────────────────────────────────
create table public.assets (
  id               uuid primary key default gen_random_uuid(),
  artist_id        uuid not null references public.artists(id) on delete cascade,
  kind             text not null check (kind in ('instrumental', 'demo', 'reference_video', 'reference_image')),
  title            text not null,
  storage_path     text not null,
  mime_type        text not null,
  size_bytes       bigint not null,
  duration_seconds int,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger assets_updated_at
  before update on public.assets
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- signup_applications
-- ─────────────────────────────────────────────────────────────
create table public.signup_applications (
  id           uuid primary key default gen_random_uuid(),
  code_id      uuid not null references public.signup_codes(id),
  stage_name   text not null,
  legal_name   text not null,
  email        text not null,
  phone        text,
  genres       text[] not null default '{}',
  socials      jsonb not null default '{}',
  message      text,
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  reviewed_by  uuid references public.profiles(id) on delete set null,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger signup_applications_updated_at
  before update on public.signup_applications
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- video_jobs  (Phase 4 — state machine)
-- ─────────────────────────────────────────────────────────────
create table public.video_jobs (
  id               uuid primary key default gen_random_uuid(),
  artist_id        uuid not null references public.artists(id) on delete cascade,
  source_asset_id  uuid not null references public.assets(id),
  inngest_run_id   text,
  status           text not null default 'queued'
                     check (status in ('queued', 'analyzing', 'prompting', 'generating', 'assembling', 'complete', 'failed')),
  params           jsonb not null default '{}',
  output_url       text,
  error            text,
  started_at       timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger video_jobs_updated_at
  before update on public.video_jobs
  for each row execute function public.set_updated_at();
