BEGIN;
CREATE TABLE public.newsletter_confirmations(email text PRIMARY KEY, token_hash text NOT NULL, expires_at timestamptz NOT NULL);
CREATE TABLE public.newsletter_runs(id uuid PRIMARY KEY,subject text NOT NULL,body text NOT NULL,created_by uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.newsletter_deliveries(
 run_id uuid NOT NULL REFERENCES public.newsletter_runs(id), subscriber_id uuid NOT NULL,
 email text NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','accepted','failed','uncertain','skipped')),
 first_attempt_at timestamptz, claimed_at timestamptz, provider_id text, PRIMARY KEY(run_id,subscriber_id)
);
ALTER TABLE public.newsletter_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.newsletter_confirmations,public.newsletter_runs,public.newsletter_deliveries FROM anon,authenticated;
CREATE FUNCTION public.confirm_newsletter(p_email text,p_hash text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 DELETE FROM newsletter_confirmations WHERE email=p_email AND token_hash=p_hash AND expires_at>now();
 IF NOT FOUND THEN RETURN false; END IF;
 INSERT INTO fan_subscribers(email,status,source) VALUES(p_email,'active','website') ON CONFLICT(email) DO UPDATE SET status='active';
 RETURN true;
END; $$;
CREATE FUNCTION public.prepare_newsletter(p_id uuid,p_subject text,p_body text,p_actor uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE existing public.newsletter_runs;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_id::text,2));
 SELECT * INTO existing FROM newsletter_runs WHERE id=p_id;
 IF FOUND THEN
  IF existing.subject<>p_subject OR existing.body<>p_body OR existing.created_by<>p_actor THEN RAISE EXCEPTION 'This send already has different content'; END IF;
  RETURN;
 END IF;
 IF NOT EXISTS(SELECT 1 FROM profiles WHERE id=p_actor AND role='admin') THEN RAISE EXCEPTION 'Administrator required'; END IF;
 INSERT INTO newsletter_runs(id,subject,body,created_by) VALUES(p_id,p_subject,p_body,p_actor);
 INSERT INTO newsletter_deliveries(run_id,subscriber_id,email) SELECT p_id,id,email FROM fan_subscribers WHERE status='active';
END; $$;
CREATE FUNCTION public.claim_newsletter_batch(p_id uuid) RETURNS SETOF public.newsletter_deliveries
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 -- Provider idempotency lasts 24 hours. Never blindly retry past that window.
 UPDATE newsletter_deliveries SET status='uncertain' WHERE run_id=p_id AND status IN ('pending','sending','failed') AND first_attempt_at<now()-interval '23 hours';
 RETURN QUERY WITH batch AS (
  SELECT run_id,subscriber_id FROM newsletter_deliveries WHERE run_id=p_id
   AND (status IN ('pending','failed') OR (status='sending' AND claimed_at<now()-interval '10 minutes'))
   ORDER BY subscriber_id FOR UPDATE SKIP LOCKED LIMIT 25
 ) UPDATE newsletter_deliveries d SET status='sending',claimed_at=now(),first_attempt_at=COALESCE(d.first_attempt_at,now())
 FROM batch b WHERE d.run_id=b.run_id AND d.subscriber_id=b.subscriber_id RETURNING d.*;
END; $$;
REVOKE ALL ON FUNCTION public.confirm_newsletter(text,text),public.prepare_newsletter(uuid,text,text,uuid),public.claim_newsletter_batch(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_newsletter(text,text),public.prepare_newsletter(uuid,text,text,uuid),public.claim_newsletter_batch(uuid) TO service_role;
CREATE FUNCTION public.newsletter_progress(p_actor uuid,p_run uuid DEFAULT NULL)
RETURNS TABLE(run_id uuid,subject text,created_at timestamptz,sent bigint,remaining bigint,uncertain bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT r.id,r.subject,r.created_at,
 COUNT(*) FILTER(WHERE d.status='accepted'),
 COUNT(*) FILTER(WHERE d.status IN ('pending','sending','failed')),
 COUNT(*) FILTER(WHERE d.status='uncertain')
 FROM newsletter_runs r LEFT JOIN newsletter_deliveries d ON d.run_id=r.id
 WHERE r.created_by=p_actor AND (p_run IS NULL OR r.id=p_run)
 GROUP BY r.id
 ORDER BY (COUNT(*) FILTER(WHERE d.status IN ('pending','sending','failed','uncertain'))>0) DESC,r.created_at DESC LIMIT 20;
$$;
REVOKE ALL ON FUNCTION public.newsletter_progress(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.newsletter_progress(uuid,uuid) TO service_role;

GRANT ALL ON public.newsletter_confirmations,public.newsletter_runs,public.newsletter_deliveries TO service_role;
COMMIT;
