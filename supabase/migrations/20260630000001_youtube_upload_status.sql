-- Add YouTube upload tracking to the curated videos table.
-- youtube_id already exists and is populated when a video is linked to YouTube.
-- youtube_upload_status tracks in-progress API uploads triggered from the admin panel.
alter table public.videos
  add column if not exists youtube_upload_status text
    check (youtube_upload_status in ('uploading', 'done', 'failed'));
