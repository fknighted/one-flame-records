BEGIN;
-- Saved with the business event, never with a browser response. Only the server
-- can read addresses, secure approval links or account-setup links.
CREATE TABLE public.partner_delivery_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL REFERENCES public.partner_members(id),
 kind text NOT NULL CHECK(kind IN ('application','guarantor_request','approved','declined')),
 recipient text NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent')),
 payload jsonb, prepared_at timestamptz, attempts integer NOT NULL DEFAULT 0, lease_until timestamptz, lease_id uuid,
 sent_at timestamptz, first_send_at timestamptz, last_error text, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(member_id,kind)
);
ALTER TABLE public.partner_delivery_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.partner_delivery_jobs FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.partner_delivery_jobs TO service_role;
CREATE INDEX partner_delivery_pending ON public.partner_delivery_jobs(status,created_at);
CREATE FUNCTION public.partner_queue_consent_mail() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m partner_members;
BEGIN
 SELECT * INTO STRICT m FROM partner_members WHERE id=NEW.member_id;
 IF TG_OP='INSERT' THEN
  INSERT INTO partner_delivery_jobs(member_id,kind,recipient) VALUES(m.id,'application',m.email),(m.id,'guarantor_request',NEW.email) ON CONFLICT DO NOTHING;
 ELSIF NEW.status IN ('approved','declined') AND OLD.status IS DISTINCT FROM NEW.status THEN
  INSERT INTO partner_delivery_jobs(member_id,kind,recipient) VALUES(m.id,NEW.status::text,m.email) ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER partner_consent_mail AFTER INSERT OR UPDATE ON public.partner_guarantors FOR EACH ROW EXECUTE FUNCTION public.partner_queue_consent_mail();
CREATE FUNCTION public.partner_claim_mail(p_member uuid DEFAULT NULL) RETURNS SETOF public.partner_delivery_jobs
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 RETURN QUERY UPDATE partner_delivery_jobs j SET status='sending',lease_until=now()+interval '5 minutes',lease_id=gen_random_uuid(),attempts=j.attempts+1
 WHERE j.id IN (SELECT q.id FROM partner_delivery_jobs q WHERE (p_member IS NULL OR q.member_id=p_member) AND (q.status='pending' OR q.status='sending' AND q.lease_until<now()) ORDER BY q.created_at,q.id LIMIT 20 FOR UPDATE SKIP LOCKED)
 RETURNING j.*;
END $$;
REVOKE EXECUTE ON FUNCTION public.partner_queue_consent_mail(),public.partner_claim_mail(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.partner_claim_mail(uuid) TO service_role;
COMMIT;
