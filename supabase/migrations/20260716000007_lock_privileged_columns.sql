-- SECURITY: freeze privileged columns against direct PostgREST writes.
--
-- The self-update RLS policies (profiles_update_self, artists_update_self,
-- video_jobs_update_own) scope WHICH row a user may update but not WHICH
-- columns. Because the anon key + Supabase URL are public, any authenticated
-- low-privilege user (artist/bartender/gamer) holds a valid JWT and can call
-- PostgREST directly — e.g. PATCH /rest/v1/profiles?id=eq.<self> {"role":"admin"}
-- — bypassing the app entirely. The proxy and requireAdmin() both trust
-- profiles.role, so that single call yields full admin. Same class of hole lets
-- an artist rewrite their own artists.status/slug or a video_jobs output_url.
--
-- Fix: BEFORE UPDATE triggers that reject changes to sensitive columns from
-- non-privileged callers. The service client (auth.role() = 'service_role',
-- used by every admin/bar server action and the Inngest pipeline) and admins
-- (is_admin()) are exempt, so all legitimate app writes still succeed.

-- ─────────────────────────────────────────────────────────────
-- profiles: role / is_bartender / artist_id are privilege-defining.
-- ─────────────────────────────────────────────────────────────
create or replace function public.guard_profiles_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;
  if new.role        is distinct from old.role
     or new.is_bartender is distinct from old.is_bartender
     or new.artist_id is distinct from old.artist_id then
    raise exception 'Not authorized to modify privileged profile columns';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_privileged on public.profiles;
create trigger profiles_guard_privileged
  before update on public.profiles
  for each row execute function public.guard_profiles_privileged_columns();

-- ─────────────────────────────────────────────────────────────
-- artists: status (public visibility) and slug (public URL) are label-owned.
-- Bio/socials/streaming/photo_url stay freely self-editable via the portal.
-- ─────────────────────────────────────────────────────────────
create or replace function public.guard_artists_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;
  if new.status is distinct from old.status
     or new.slug is distinct from old.slug then
    raise exception 'Not authorized to modify artist status or slug';
  end if;
  return new;
end;
$$;

drop trigger if exists artists_guard_privileged on public.artists;
create trigger artists_guard_privileged
  before update on public.artists
  for each row execute function public.guard_artists_privileged_columns();

-- ─────────────────────────────────────────────────────────────
-- video_jobs: the only legitimate self-edit is toggling is_public. Freeze
-- every other column (output_url, status, cost_estimate_usd, artist_id, …)
-- via a whole-row jsonb diff so future output columns are covered too.
-- ─────────────────────────────────────────────────────────────
create or replace function public.guard_video_jobs_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;
  if (to_jsonb(new) - 'is_public' - 'updated_at')
       is distinct from (to_jsonb(old) - 'is_public' - 'updated_at') then
    raise exception 'Only the is_public flag may be changed on your own video jobs';
  end if;
  return new;
end;
$$;

drop trigger if exists video_jobs_guard_privileged on public.video_jobs;
create trigger video_jobs_guard_privileged
  before update on public.video_jobs
  for each row execute function public.guard_video_jobs_privileged_columns();
