-- Allow videos to be uploaded directly (not just YouTube links)
ALTER TABLE public.videos
  ALTER COLUMN youtube_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS storage_url text;
