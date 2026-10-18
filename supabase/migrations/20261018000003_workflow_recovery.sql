BEGIN;
CREATE TABLE public.upload_reservations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES auth.users(id),
 artist_id uuid NOT NULL REFERENCES public.artists(id), purpose text NOT NULL CHECK(purpose IN ('asset','profile_photo')),
 kind text NOT NULL, bucket text NOT NULL, path text NOT NULL UNIQUE, mime_type text NOT NULL,
 size_bytes int NOT NULL CHECK(size_bytes>0), expires_at timestamptz NOT NULL DEFAULT now()+interval '24 hours'
);
ALTER TABLE public.upload_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.upload_reservations FROM anon,authenticated;
-- A failed storage cleanup remains recoverable, with its original private path.
CREATE TABLE public.storage_cleanup_queue (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket text NOT NULL, path text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(bucket,path)
);
ALTER TABLE public.storage_cleanup_queue ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.storage_cleanup_queue FROM anon,authenticated;
CREATE UNIQUE INDEX assets_unique_storage_path ON public.assets(storage_path);
CREATE FUNCTION public.delete_asset_record(p_id uuid,p_artist uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE asset public.assets;
BEGIN
 SELECT * INTO asset FROM public.assets WHERE id=p_id AND artist_id=p_artist;
 IF NOT FOUND THEN RETURN; END IF;
 PERFORM 1 FROM public.upload_reservations WHERE path=asset.storage_path FOR UPDATE;
 SELECT * INTO asset FROM public.assets WHERE id=p_id AND artist_id=p_artist FOR UPDATE;
 IF NOT FOUND THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM public.video_jobs WHERE source_asset_id=p_id) THEN RAISE EXCEPTION 'This asset is used by a saved video and must be kept'; END IF;
 DELETE FROM public.upload_reservations WHERE path=asset.storage_path;
 DELETE FROM public.assets WHERE id=p_id; -- FK also protects concurrent references.
 INSERT INTO public.storage_cleanup_queue(bucket,path) VALUES('private-assets',asset.storage_path) ON CONFLICT DO NOTHING;
END; $$;
REVOKE ALL ON FUNCTION public.delete_asset_record(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.delete_asset_record(uuid,uuid) TO service_role;

CREATE FUNCTION public.finalize_asset_upload(p_upload uuid,p_owner uuid,p_title text,p_notes text,p_duration int) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE reservation public.upload_reservations; asset_id uuid;
BEGIN
 SELECT * INTO reservation FROM public.upload_reservations WHERE id=p_upload AND owner_id=p_owner AND purpose='asset' AND expires_at>now() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Upload expired or was removed'; END IF;
 INSERT INTO public.assets(artist_id,kind,title,notes,storage_path,mime_type,size_bytes,duration_seconds)
 VALUES(reservation.artist_id,reservation.kind,p_title,p_notes,reservation.path,reservation.mime_type,reservation.size_bytes,p_duration)
 ON CONFLICT(storage_path) DO UPDATE SET storage_path=excluded.storage_path RETURNING id INTO asset_id;
 RETURN asset_id;
END; $$;
REVOKE ALL ON FUNCTION public.finalize_asset_upload(uuid,uuid,text,text,int) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_asset_upload(uuid,uuid,text,text,int) TO service_role;

ALTER TABLE public.signup_applications ADD COLUMN approval_lease_until timestamptz;
ALTER TABLE public.signup_applications ADD COLUMN provisioned_user_id uuid;
ALTER TABLE public.signup_applications ADD COLUMN provisioned_artist_id uuid REFERENCES public.artists(id);
CREATE FUNCTION public.claim_application(p_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.signup_applications; existing_user uuid;
BEGIN
 SELECT * INTO a FROM signup_applications WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;
 IF a.status<>'pending' THEN RAISE EXCEPTION 'Application is already reviewed'; END IF;
 IF a.approval_lease_until>now() THEN RAISE EXCEPTION 'Approval is already running. Wait a minute before retrying'; END IF;
 SELECT u.id INTO existing_user FROM auth.users u WHERE lower(u.email)=lower(a.email);
 IF existing_user IS NOT NULL AND EXISTS(SELECT 1 FROM profiles WHERE id=existing_user AND (role<>'artist' OR is_bartender OR (artist_id IS NOT NULL AND artist_id IS DISTINCT FROM a.provisioned_artist_id))) THEN RAISE EXCEPTION 'This email already belongs to a linked account. Review it manually'; END IF;
 UPDATE signup_applications SET approval_lease_until=now()+interval '5 minutes',provisioned_user_id=COALESCE(provisioned_user_id,existing_user) WHERE id=p_id RETURNING * INTO a;
 RETURN to_jsonb(a);
END; $$;
CREATE FUNCTION public.finish_application(p_id uuid,p_user uuid,p_admin uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.signup_applications; artist uuid;
BEGIN
 SELECT * INTO a FROM signup_applications WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR a.status<>'pending' OR a.provisioned_user_id IS DISTINCT FROM p_user THEN RAISE EXCEPTION 'Approval state changed. Refresh and retry'; END IF;
 IF NOT EXISTS(SELECT 1 FROM profiles WHERE id=p_admin AND role='admin') THEN RAISE EXCEPTION 'Administrator required'; END IF;
 SELECT id INTO artist FROM artists WHERE id=a.provisioned_artist_id;
 IF artist IS NULL THEN
  INSERT INTO artists(stage_name,legal_name,slug,genres,socials,bio,status)
  VALUES(a.stage_name,a.legal_name,'artist-'||a.id::text,a.genres,COALESCE(a.socials,'{}'),'','pending') RETURNING id INTO artist;
 END IF;
 UPDATE profiles SET artist_id=artist WHERE id=p_user AND role='artist' AND (artist_id IS NULL OR artist_id=artist);
 IF NOT FOUND THEN RAISE EXCEPTION 'Could not link this account safely'; END IF;
 UPDATE signup_applications SET status='approved',provisioned_artist_id=artist,reviewed_by=p_admin,reviewed_at=now(),approval_lease_until=NULL WHERE id=p_id;
END; $$;
REVOKE ALL ON FUNCTION public.claim_application(uuid),public.finish_application(uuid,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_application(uuid),public.finish_application(uuid,uuid,uuid) TO service_role;

CREATE TABLE public.form_rate_limits(key text PRIMARY KEY, window_start timestamptz NOT NULL, hits int NOT NULL);
ALTER TABLE public.form_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.form_rate_limits FROM anon,authenticated;
CREATE FUNCTION public.consume_form_limit(p_key text,p_limit int,p_window_seconds int) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n int;
BEGIN
 INSERT INTO form_rate_limits VALUES(p_key,now(),1) ON CONFLICT(key) DO UPDATE SET
 hits=CASE WHEN form_rate_limits.window_start<now()-make_interval(secs=>p_window_seconds) THEN 1 ELSE form_rate_limits.hits+1 END,
 window_start=CASE WHEN form_rate_limits.window_start<now()-make_interval(secs=>p_window_seconds) THEN now() ELSE form_rate_limits.window_start END
 RETURNING hits INTO n;
 RETURN n<=p_limit;
END; $$;
REVOKE ALL ON FUNCTION public.consume_form_limit(text,int,int) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_form_limit(text,int,int) TO service_role;
CREATE FUNCTION public.submit_artist_application(p_data jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result uuid;
BEGIN
 PERFORM 1 FROM signup_codes WHERE id=(p_data->>'code_id')::uuid AND is_active FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'This application code has expired'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(lower(p_data->>'email'),1));
 IF EXISTS(SELECT 1 FROM signup_applications WHERE lower(email)=lower(p_data->>'email') AND status='pending') THEN RETURN NULL; END IF;
 IF length(p_data->>'stage_name') NOT BETWEEN 1 AND 100 OR length(p_data->>'legal_name') NOT BETWEEN 1 AND 200 OR length(p_data->>'email')>254 OR length(COALESCE(p_data->>'message',''))>5000 THEN RAISE EXCEPTION 'Application fields are too long'; END IF;
 INSERT INTO signup_applications(code_id,stage_name,legal_name,email,phone,message,genres,socials,status)
 VALUES((p_data->>'code_id')::uuid,p_data->>'stage_name',p_data->>'legal_name',lower(p_data->>'email'),p_data->>'phone',p_data->>'message',ARRAY(SELECT jsonb_array_elements_text(p_data->'genres')),p_data->'socials','pending') RETURNING id INTO result;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.submit_artist_application(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.submit_artist_application(jsonb) TO service_role;
GRANT ALL ON public.upload_reservations,public.storage_cleanup_queue,public.form_rate_limits TO service_role;
COMMIT;
