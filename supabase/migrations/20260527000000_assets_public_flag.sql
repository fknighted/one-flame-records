-- Add is_public flag to assets and video_jobs.
-- Artists and admins can mark items public so they appear on the artist's public page.

ALTER TABLE public.assets
  ADD COLUMN is_public boolean NOT NULL DEFAULT false;

ALTER TABLE public.video_jobs
  ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Anon users can read public assets (metadata only — storage still requires signed URLs)
CREATE POLICY "assets_select_public"
  ON public.assets FOR SELECT
  USING (is_public = true);

-- Anon users can read completed public video jobs
CREATE POLICY "video_jobs_select_public"
  ON public.video_jobs FOR SELECT
  USING (is_public = true AND status = 'complete');

-- Artists can update their own video jobs (e.g. to toggle is_public)
CREATE POLICY "video_jobs_update_own"
  ON public.video_jobs FOR UPDATE
  USING (artist_id = public.current_artist_id());
