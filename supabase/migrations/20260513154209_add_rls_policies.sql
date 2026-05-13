-- ─────────────────────────────────────────────────────────────
-- Helper functions (security definer so they bypass RLS)
-- ─────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_artist_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select artist_id from public.profiles
  where id = auth.uid();
$$;

-- ─────────────────────────────────────────────────────────────
-- Enable RLS on all tables
-- ─────────────────────────────────────────────────────────────
alter table public.artists            enable row level security;
alter table public.releases           enable row level security;
alter table public.videos             enable row level security;
alter table public.assets             enable row level security;
alter table public.profiles           enable row level security;
alter table public.signup_codes       enable row level security;
alter table public.signup_applications enable row level security;
alter table public.video_jobs         enable row level security;

-- ─────────────────────────────────────────────────────────────
-- artists
-- Public reads active artists. Admin reads all. Admin writes.
-- Artist can update their own row (column restriction app-enforced).
-- ─────────────────────────────────────────────────────────────
create policy "artists_select_public"
  on public.artists for select
  using (status = 'active');

create policy "artists_select_admin"
  on public.artists for select
  using (public.is_admin());

create policy "artists_insert_admin"
  on public.artists for insert
  with check (public.is_admin());

create policy "artists_update_admin"
  on public.artists for update
  using (public.is_admin());

create policy "artists_update_self"
  on public.artists for update
  using (id = public.current_artist_id());

create policy "artists_delete_admin"
  on public.artists for delete
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- releases
-- Public reads all. Admin writes.
-- ─────────────────────────────────────────────────────────────
create policy "releases_select_public"
  on public.releases for select
  using (true);

create policy "releases_insert_admin"
  on public.releases for insert
  with check (public.is_admin());

create policy "releases_update_admin"
  on public.releases for update
  using (public.is_admin());

create policy "releases_delete_admin"
  on public.releases for delete
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- videos
-- Public reads all. Admin writes.
-- ─────────────────────────────────────────────────────────────
create policy "videos_select_public"
  on public.videos for select
  using (true);

create policy "videos_insert_admin"
  on public.videos for insert
  with check (public.is_admin());

create policy "videos_update_admin"
  on public.videos for update
  using (public.is_admin());

create policy "videos_delete_admin"
  on public.videos for delete
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- profiles
-- Users read/update their own. Admin reads/updates all.
-- INSERT is handled by the handle_new_user trigger (security definer).
-- ─────────────────────────────────────────────────────────────
create policy "profiles_select_self"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid());

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- signup_codes
-- Admin only.
-- ─────────────────────────────────────────────────────────────
create policy "signup_codes_admin_all"
  on public.signup_codes for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- signup_applications
-- Anyone can submit (QR flow, Phase 3). Admin reads and manages.
-- ─────────────────────────────────────────────────────────────
create policy "signup_applications_insert_public"
  on public.signup_applications for insert
  with check (true);

create policy "signup_applications_admin_all"
  on public.signup_applications for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- assets
-- Artist sees/manages their own. Admin sees/manages all.
-- ─────────────────────────────────────────────────────────────
create policy "assets_select_own_or_admin"
  on public.assets for select
  using (artist_id = public.current_artist_id() or public.is_admin());

create policy "assets_insert_own_or_admin"
  on public.assets for insert
  with check (artist_id = public.current_artist_id() or public.is_admin());

create policy "assets_update_own_or_admin"
  on public.assets for update
  using (artist_id = public.current_artist_id() or public.is_admin());

create policy "assets_delete_own_or_admin"
  on public.assets for delete
  using (artist_id = public.current_artist_id() or public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- video_jobs
-- Artist sees their own. Admin sees all. Only admin/service updates
-- (Inngest pipeline runs as service role, bypasses RLS entirely).
-- ─────────────────────────────────────────────────────────────
create policy "video_jobs_select_own_or_admin"
  on public.video_jobs for select
  using (artist_id = public.current_artist_id() or public.is_admin());

create policy "video_jobs_insert_own_or_admin"
  on public.video_jobs for insert
  with check (artist_id = public.current_artist_id() or public.is_admin());

create policy "video_jobs_update_admin"
  on public.video_jobs for update
  using (public.is_admin());

create policy "video_jobs_delete_admin"
  on public.video_jobs for delete
  using (public.is_admin());
