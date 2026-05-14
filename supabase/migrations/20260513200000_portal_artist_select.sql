-- Artist can read their own row regardless of status.
-- Needed for portal layout/dashboard when artist status is 'pending'.
create policy "artists_select_self"
  on public.artists for select
  using (id = public.current_artist_id());
