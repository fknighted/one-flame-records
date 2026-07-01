-- Add YouTube upload tracking to AI-generated video jobs.
alter table public.video_jobs
  add column if not exists youtube_id text;
alter table public.video_jobs
  add column if not exists youtube_upload_status text
    check (youtube_upload_status in ('uploading', 'done', 'failed'));
