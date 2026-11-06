BEGIN;
CREATE TABLE public.email_studio_templates (
 key text PRIMARY KEY CHECK(key IN ('application-approved','application-rejected','staff-invitation','subscription-confirmation','unsubscribe-link','welcome')),
 subject text NOT NULL CHECK(length(subject) BETWEEN 1 AND 200 AND position(chr(10) in subject)=0 AND position(chr(13) in subject)=0),
 opening text NOT NULL CHECK(length(opening) BETWEEN 1 AND 200),
 body text NOT NULL CHECK(length(body) BETWEEN 1 AND 6000),
 version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now(), updated_by uuid NOT NULL REFERENCES auth.users(id)
);
CREATE TABLE public.email_studio_tests (
 id uuid PRIMARY KEY, actor uuid NOT NULL REFERENCES auth.users(id), recipient text NOT NULL, payload jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), status text NOT NULL DEFAULT 'prepared' CHECK(status IN ('prepared','accepted')), provider_id text
);
CREATE FUNCTION public.protect_email_studio_test() RETURNS trigger
LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Test history is immutable'; END IF;
 IF NEW.id<>OLD.id OR NEW.actor<>OLD.actor OR NEW.recipient<>OLD.recipient OR NEW.payload<>OLD.payload OR NEW.created_at<>OLD.created_at THEN RAISE EXCEPTION 'Test payload is immutable'; END IF;
 IF OLD.status='accepted' AND (NEW.status<>OLD.status OR NEW.provider_id IS DISTINCT FROM OLD.provider_id) THEN RAISE EXCEPTION 'Accepted test receipt is immutable'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER protect_email_studio_test BEFORE UPDATE OR DELETE ON public.email_studio_tests FOR EACH ROW EXECUTE FUNCTION public.protect_email_studio_test();
ALTER TABLE public.email_studio_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_studio_tests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_studio_templates,public.email_studio_tests FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.email_studio_templates,public.email_studio_tests TO service_role;
CREATE FUNCTION public.save_email_studio_template(p_key text,p_subject text,p_opening text,p_body text,p_version integer,p_actor uuid) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE next_version integer;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM profiles WHERE id=p_actor AND role='admin') THEN RAISE EXCEPTION 'Administrator required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_key,12));
 IF p_version=0 THEN
  IF EXISTS(SELECT 1 FROM email_studio_templates WHERE key=p_key) THEN RAISE EXCEPTION 'Template changed. Reload before saving.'; END IF;
  INSERT INTO email_studio_templates(key,subject,opening,body,updated_by) VALUES(p_key,p_subject,p_opening,p_body,p_actor) RETURNING version INTO next_version;
 ELSE
  UPDATE email_studio_templates SET subject=p_subject,opening=p_opening,body=p_body,version=version+1,updated_at=now(),updated_by=p_actor WHERE key=p_key AND version=p_version RETURNING version INTO next_version;
  IF NOT FOUND THEN RAISE EXCEPTION 'Template changed. Reload before saving.'; END IF;
 END IF;
 RETURN next_version;
END; $$;
CREATE FUNCTION public.prepare_email_studio_test(p_id uuid,p_actor uuid,p_recipient text,p_payload jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE attempt public.email_studio_tests;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM profiles WHERE id=p_actor AND role='admin') THEN RAISE EXCEPTION 'Administrator required'; END IF;
 IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id=p_actor AND lower(email)=lower(p_recipient)) THEN RAISE EXCEPTION 'Use your own sign-in email'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_actor::text,13));
 SELECT * INTO attempt FROM email_studio_tests WHERE id=p_id;
 IF FOUND THEN
  IF attempt.actor<>p_actor OR attempt.recipient<>p_recipient OR attempt.payload<>p_payload THEN RAISE EXCEPTION 'Test content changed. Start a new test.'; END IF;
  IF attempt.status<>'accepted' AND attempt.created_at<now()-interval '23 hours' THEN RAISE EXCEPTION 'Test delivery is uncertain. Check the provider before starting another test.'; END IF;
  RETURN to_jsonb(attempt);
 END IF;
 IF (SELECT count(*) FROM email_studio_tests WHERE actor=p_actor AND created_at>now()-interval '1 hour')>=20 THEN RAISE EXCEPTION 'Wait before sending more tests.'; END IF;
 INSERT INTO email_studio_tests(id,actor,recipient,payload) VALUES(p_id,p_actor,p_recipient,p_payload) RETURNING * INTO attempt;
 RETURN to_jsonb(attempt);
END; $$;
REVOKE ALL ON FUNCTION public.save_email_studio_template(text,text,text,text,integer,uuid), public.prepare_email_studio_test(uuid,uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_email_studio_template(text,text,text,text,integer,uuid), public.prepare_email_studio_test(uuid,uuid,text,jsonb) TO service_role;
COMMIT;
