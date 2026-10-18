BEGIN;
CREATE TABLE public.youtube_upload_requests(
 source text NOT NULL CHECK(source IN ('video','video_job')), record_id uuid NOT NULL,
 request_id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
 status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','started','done','failed','uncertain')),
 youtube_id text, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(source,record_id)
);
ALTER TABLE public.youtube_upload_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.youtube_upload_requests FROM anon,authenticated;
ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_youtube_upload_status_check;
ALTER TABLE public.videos ADD CONSTRAINT videos_youtube_upload_status_check CHECK(youtube_upload_status IN ('uploading','done','failed','review'));
ALTER TABLE public.video_jobs DROP CONSTRAINT IF EXISTS video_jobs_youtube_upload_status_check;
ALTER TABLE public.video_jobs ADD CONSTRAINT video_jobs_youtube_upload_status_check CHECK(youtube_upload_status IN ('uploading','done','failed','review'));
CREATE FUNCTION public.claim_youtube_upload(p_source text,p_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.youtube_upload_requests; existing_id text;
BEGIN
 IF p_source NOT IN ('video','video_job') THEN RAISE EXCEPTION 'Unknown video source'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_source||p_id::text,3));
 IF p_source='video' THEN SELECT youtube_id INTO existing_id FROM videos WHERE id=p_id FOR UPDATE;
 ELSE SELECT youtube_id INTO existing_id FROM video_jobs WHERE id=p_id AND status='complete' FOR UPDATE; END IF;
 IF NOT FOUND THEN RAISE EXCEPTION 'Completed video not found'; END IF;
 IF existing_id IS NOT NULL THEN RAISE EXCEPTION 'This video already has a YouTube link'; END IF;
 SELECT * INTO r FROM youtube_upload_requests WHERE source=p_source AND record_id=p_id FOR UPDATE;
 IF FOUND AND r.status IN ('started','uncertain','done') THEN RAISE EXCEPTION 'Check the private YouTube uploads before requesting another upload'; END IF;
 IF FOUND AND r.status='queued' THEN RETURN r.request_id; END IF;
 INSERT INTO youtube_upload_requests(source,record_id) VALUES(p_source,p_id)
 ON CONFLICT(source,record_id) DO UPDATE SET request_id=gen_random_uuid(),status='queued',created_at=now() RETURNING * INTO r;
 IF p_source='video' THEN UPDATE videos SET youtube_upload_status='uploading' WHERE id=p_id;
 ELSE UPDATE video_jobs SET youtube_upload_status='uploading' WHERE id=p_id; END IF;
 RETURN r.request_id;
END; $$;
REVOKE ALL ON FUNCTION public.claim_youtube_upload(text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_youtube_upload(text,uuid) TO service_role;
GRANT ALL ON public.youtube_upload_requests TO service_role;
COMMIT;
