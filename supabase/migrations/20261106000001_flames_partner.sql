BEGIN;
-- Savings records are deliberately separate from artists, bar balances and roles.
CREATE TYPE public.partner_member_status AS ENUM ('pending_guarantor','active','eligible','drew','completed','defaulted_predraw','defaulted_postdraw','withdrawn');
CREATE TYPE public.partner_deposit_status AS ENUM ('pending','held','refunded','forfeited');
CREATE TYPE public.partner_guarantor_status AS ENUM ('pending','approved','declined','timeout');
CREATE TYPE public.partner_payment_status AS ENUM ('pending','paid','late','defaulted');
CREATE TYPE public.partner_draw_status AS ENUM ('scheduled','paid','cancelled');
CREATE SEQUENCE public.partner_spark_display_seq;
CREATE SEQUENCE public.partner_blaze_display_seq;
CREATE SEQUENCE public.partner_inferno_display_seq;
CREATE SEQUENCE public.partner_guarantors_display_seq;

CREATE TABLE public.partner_members (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), display_id text UNIQUE NOT NULL,
 full_name text NOT NULL CHECK(length(full_name) BETWEEN 1 AND 160),
 email text NOT NULL CHECK(length(email) BETWEEN 3 AND 254), phone text NOT NULL,
 address text NOT NULL, employer text NOT NULL,
 enrollment_date timestamptz NOT NULL DEFAULT now(),
 status public.partner_member_status NOT NULL DEFAULT 'pending_guarantor',
 weeks_paid integer NOT NULL DEFAULT 0 CHECK(weeks_paid BETWEEN 0 AND 20),
 draw_date timestamptz, completion_date timestamptz,
 deposit_status public.partner_deposit_status NOT NULL DEFAULT 'pending',
 payment_day smallint NOT NULL CHECK(payment_day BETWEEN 0 AND 6),
 tier text NOT NULL DEFAULT 'spark' CHECK(tier IN ('spark','blaze','inferno')),
 is_test boolean NOT NULL DEFAULT false, deleted_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX partner_members_queue ON public.partner_members(tier,is_test,enrollment_date,id) WHERE status='eligible' AND deleted_at IS NULL;
CREATE UNIQUE INDEX partner_members_active_email ON public.partner_members(lower(email)) WHERE deleted_at IS NULL;
CREATE TABLE public.partner_guarantors (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 display_id text UNIQUE NOT NULL DEFAULT 'GR-' || lpad(nextval('public.partner_guarantors_display_seq')::text,4,'0'),
 member_id uuid NOT NULL REFERENCES public.partner_members(id), full_name text NOT NULL,
 email text NOT NULL, phone text NOT NULL, address text NOT NULL, employer text NOT NULL,
 relationship_to_member text NOT NULL,
 status public.partner_guarantor_status NOT NULL DEFAULT 'pending',
 approval_token text UNIQUE NOT NULL, responded_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX partner_guarantors_member ON public.partner_guarantors(member_id);
CREATE TABLE public.partner_accounts (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 member_id uuid UNIQUE NOT NULL REFERENCES public.partner_members(id),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.partner_payments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL REFERENCES public.partner_members(id),
 week_number smallint NOT NULL CHECK(week_number BETWEEN 1 AND 20), due_date date NOT NULL,
 received_date timestamptz,
 amount numeric NOT NULL CHECK(amount>=0 AND trunc(amount)=amount),
 late_fee numeric NOT NULL DEFAULT 0 CHECK(late_fee>=0 AND trunc(late_fee)=late_fee),
 method text CHECK(method IN ('cash','bank_transfer')),
 status public.partner_payment_status NOT NULL DEFAULT 'pending',
 recorded_by uuid REFERENCES public.profiles(id),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(member_id,week_number)
);
CREATE TABLE public.partner_draws (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL REFERENCES public.partner_members(id),
 scheduled_week date NOT NULL, paid_date timestamptz,
 amount numeric NOT NULL CHECK(amount>=0 AND trunc(amount)=amount),
 status public.partner_draw_status NOT NULL DEFAULT 'scheduled',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX partner_one_live_draw ON public.partner_draws(member_id) WHERE status IN ('scheduled','paid');
CREATE TABLE public.partner_agreements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL REFERENCES public.partner_members(id),
 document_url text NOT NULL, signed_date timestamptz NOT NULL, version text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX partner_agreements_member ON public.partner_agreements(member_id);
CREATE TABLE public.partner_audit_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), action text NOT NULL,
 actor_id uuid REFERENCES public.profiles(id), target_type text NOT NULL, target_id uuid,
 details jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.partner_tier_interest (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL,
 tier text NOT NULL CHECK(tier IN ('spark','blaze','inferno')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(email,tier)
);
CREATE TABLE public.partner_operation_receipts (
 request_id uuid PRIMARY KEY, actor_id uuid, operation text NOT NULL, payload jsonb NOT NULL,
 result jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION public.partner_set_display_id() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 -- Explicit historical identifiers are preserved during an approved data import.
 IF NEW.display_id IS NULL OR NEW.display_id='' THEN
  NEW.display_id := CASE NEW.tier WHEN 'spark' THEN 'SP-' WHEN 'blaze' THEN 'BL-' ELSE 'IN-' END ||
   lpad(nextval(('public.partner_'||NEW.tier||'_display_seq')::regclass)::text,4,'0');
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER partner_members_display BEFORE INSERT ON public.partner_members FOR EACH ROW EXECUTE FUNCTION public.partner_set_display_id();
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['partner_members','partner_guarantors','partner_payments','partner_draws'] LOOP
  EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',t||'_updated',t);
 END LOOP;
END $$;
CREATE FUNCTION public.partner_current_member_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT a.member_id FROM public.partner_accounts a JOIN public.partner_members m ON m.id=a.member_id WHERE a.user_id=auth.uid() AND m.deleted_at IS NULL
$$;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['partner_members','partner_guarantors','partner_accounts','partner_payments','partner_draws','partner_agreements','partner_audit_log','partner_tier_interest','partner_operation_receipts'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated',t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
 END LOOP;
END $$;
GRANT SELECT ON public.partner_members,public.partner_accounts,public.partner_payments,public.partner_draws,public.partner_agreements,public.partner_audit_log TO authenticated;
-- Token values and guarantor contact/address data are never exposed by the member API.
GRANT SELECT(id,display_id,member_id,full_name,status,responded_at,created_at,updated_at) ON public.partner_guarantors TO authenticated;
CREATE POLICY partner_members_read ON public.partner_members FOR SELECT TO authenticated USING(public.is_admin() OR id=public.partner_current_member_id());
CREATE POLICY partner_accounts_read ON public.partner_accounts FOR SELECT TO authenticated USING(public.is_admin() OR user_id=auth.uid());
CREATE POLICY partner_guarantors_read ON public.partner_guarantors FOR SELECT TO authenticated USING(public.is_admin() OR member_id=public.partner_current_member_id());
CREATE POLICY partner_payments_read ON public.partner_payments FOR SELECT TO authenticated USING(public.is_admin() OR member_id=public.partner_current_member_id());
CREATE POLICY partner_draws_read ON public.partner_draws FOR SELECT TO authenticated USING(public.is_admin() OR member_id=public.partner_current_member_id());
CREATE POLICY partner_agreements_read ON public.partner_agreements FOR SELECT TO authenticated USING(public.is_admin() OR member_id=public.partner_current_member_id());
CREATE POLICY partner_audit_read ON public.partner_audit_log FOR SELECT TO authenticated USING(public.is_admin());
GRANT USAGE,SELECT ON SEQUENCE public.partner_spark_display_seq,public.partner_blaze_display_seq,public.partner_inferno_display_seq,public.partner_guarantors_display_seq TO service_role;

ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK(role IN ('admin','artist','bartender','gamer','partner'));
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_member uuid;
BEGIN
 -- app metadata is set only by the trusted Auth admin API, never signup metadata.
 v_member := NULLIF(to_jsonb(NEW)->'raw_app_meta_data'->>'partner_member_id','')::uuid;
 IF v_member IS NOT NULL THEN
  IF NOT EXISTS(SELECT 1 FROM partner_members WHERE id=v_member AND deleted_at IS NULL AND lower(email)=lower(NEW.email) AND status IN ('active','eligible','drew','completed')) THEN
   RAISE EXCEPTION 'Partner account does not match an approved member';
  END IF;
  INSERT INTO profiles(id,role) VALUES(NEW.id,'partner');
  INSERT INTO partner_accounts(user_id,member_id) VALUES(NEW.id,v_member);
 ELSE
  INSERT INTO profiles(id,role) VALUES(NEW.id,'artist');
 END IF;
 RETURN NEW;
END $$;

CREATE FUNCTION public.partner_tier_config(p_tier text) RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT CASE p_tier
 WHEN 'spark' THEN '{"contribution":3000,"draw":57000,"liability":24000}'::jsonb
 WHEN 'blaze' THEN '{"contribution":10000,"draw":190000,"liability":80000}'::jsonb
 WHEN 'inferno' THEN '{"contribution":20000,"draw":380000,"liability":160000}'::jsonb END
$$;
CREATE FUNCTION public.partner_validate_person(p_person jsonb,p_guarantor boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SET search_path=public AS $$
DECLARE k text; v text;
BEGIN
 IF jsonb_typeof(p_person) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Person details required'; END IF;
 FOREACH k IN ARRAY ARRAY['full_name','email','phone','address','employer'] LOOP
  v:=btrim(p_person->>k);
  IF v IS NULL OR length(v)<1 OR length(v)>(CASE WHEN k='address' THEN 1000 ELSE 254 END) THEN RAISE EXCEPTION 'Invalid %',k; END IF;
 END LOOP;
 IF (p_person->>'email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Invalid email'; END IF;
 IF length(p_person->>'full_name')>160 THEN RAISE EXCEPTION 'Invalid full_name'; END IF;
 IF p_guarantor THEN
  IF COALESCE(length(btrim(p_person->>'relationship_to_member')),0) NOT BETWEEN 1 AND 254 THEN RAISE EXCEPTION 'Relationship required'; END IF;
 ELSE
  IF (p_person->>'payment_day') !~ '^[0-6]$' THEN RAISE EXCEPTION 'Invalid payment day'; END IF;
 END IF;
END $$;
CREATE FUNCTION public.partner_apply_application(p_member jsonb,p_guarantor jsonb,p_request_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_member uuid; v_receipt partner_operation_receipts; v_payload jsonb;
BEGIN
 IF p_request_id IS NULL THEN RAISE EXCEPTION 'Request identifier required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('partner_applications',0));
 v_payload:=jsonb_build_object('member',p_member,'guarantor',p_guarantor-'approval_token');
 SELECT * INTO v_receipt FROM partner_operation_receipts WHERE request_id=p_request_id;
 IF FOUND THEN
  IF v_receipt.operation<>'application' OR v_receipt.payload<>v_payload THEN RAISE EXCEPTION 'Request identifier already used'; END IF;
  RETURN (v_receipt.result->>'member_id')::uuid;
 END IF;
 PERFORM partner_validate_person(p_member); PERFORM partner_validate_person(p_guarantor,true);
 IF COALESCE(p_member->>'tier','spark')<>'spark' THEN RAISE EXCEPTION 'That tier is not open for enrollment'; END IF;
 IF lower(btrim(p_member->>'email'))=lower(btrim(p_guarantor->>'email')) THEN RAISE EXCEPTION 'A separate guarantor is required'; END IF;
 IF COALESCE(length(p_guarantor->>'approval_token'),0)<32 OR length(p_guarantor->>'approval_token')>256 THEN RAISE EXCEPTION 'Secure approval token required'; END IF;
 IF (SELECT count(*) FROM partner_operation_receipts WHERE operation='application' AND created_at>now()-interval '1 hour')>=20 THEN RAISE EXCEPTION 'Applications are temporarily limited; please try later'; END IF;
 INSERT INTO partner_members(full_name,email,phone,address,employer,payment_day,tier) VALUES(btrim(p_member->>'full_name'),lower(btrim(p_member->>'email')),btrim(p_member->>'phone'),btrim(p_member->>'address'),btrim(p_member->>'employer'),(p_member->>'payment_day')::smallint,'spark') RETURNING id INTO v_member;
 INSERT INTO partner_guarantors(member_id,full_name,email,phone,address,employer,relationship_to_member,approval_token) VALUES(v_member,btrim(p_guarantor->>'full_name'),lower(btrim(p_guarantor->>'email')),btrim(p_guarantor->>'phone'),btrim(p_guarantor->>'address'),btrim(p_guarantor->>'employer'),btrim(p_guarantor->>'relationship_to_member'),p_guarantor->>'approval_token');
 INSERT INTO partner_audit_log(action,target_type,target_id) VALUES('application','member',v_member);
 INSERT INTO partner_operation_receipts(request_id,operation,payload,result) VALUES(p_request_id,'application',v_payload,jsonb_build_object('member_id',v_member));
 RETURN v_member;
END $$;

CREATE FUNCTION public.partner_respond_guarantor(p_token text,p_response text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE g partner_guarantors; m partner_members;
BEGIN
 IF p_response IS NULL OR p_response NOT IN ('approve','decline') OR p_token IS NULL OR length(p_token)<32 THEN RAISE EXCEPTION 'Invalid guarantor response'; END IF;
 SELECT * INTO g FROM partner_guarantors WHERE approval_token=p_token FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('status','invalid'); END IF;
 IF g.responded_at IS NOT NULL OR g.status IN ('approved','declined') THEN RETURN jsonb_build_object('status','used'); END IF;
 IF g.created_at<=now()-interval '7 days' OR g.status='timeout' THEN
  UPDATE partner_guarantors SET status='timeout' WHERE id=g.id;
  RETURN jsonb_build_object('status','expired');
 END IF;
 SELECT * INTO m FROM partner_members WHERE id=g.member_id AND deleted_at IS NULL FOR UPDATE;
 IF NOT FOUND OR m.status<>'pending_guarantor' THEN RETURN jsonb_build_object('status','invalid'); END IF;
 UPDATE partner_guarantors SET status=CASE WHEN p_response='approve' THEN 'approved'::partner_guarantor_status ELSE 'declined'::partner_guarantor_status END,responded_at=now() WHERE id=g.id;
 IF p_response='approve' THEN UPDATE partner_members SET status='active' WHERE id=m.id; END IF;
 INSERT INTO partner_audit_log(action,target_type,target_id) VALUES('guarantor_'||p_response,'member',m.id);
 RETURN jsonb_build_object('status',CASE WHEN p_response='approve' THEN 'approved' ELSE 'declined' END,'member_id',m.id,'email',m.email,'full_name',m.full_name);
END $$;

CREATE FUNCTION public.partner_admin_operation(p_actor uuid,p_request_id uuid,p_operation text,p_payload jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m partner_members; d partner_draws; r partner_operation_receipts; v_id uuid;
 v_config jsonb; v_amount numeric; v_fee numeric; v_week integer; v_count integer; v_balance numeric; v_status partner_member_status; v_result jsonb;
BEGIN
 -- Only service_role can call this. The server first enforces requireAdmin/MFA.
 IF p_actor IS NULL OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=p_actor AND role='admin') THEN RAISE EXCEPTION 'Administrator access required'; END IF;
 IF p_request_id IS NULL OR jsonb_typeof(p_payload) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Request identifier and details required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('partner_operations',0));
 SELECT * INTO r FROM partner_operation_receipts WHERE request_id=p_request_id;
 IF FOUND THEN
  IF r.actor_id IS DISTINCT FROM p_actor OR r.operation<>p_operation OR r.payload<>p_payload THEN RAISE EXCEPTION 'Request identifier already used'; END IF;
  RETURN r.result;
 END IF;
 IF p_operation='create_member' THEN
  PERFORM partner_validate_person(p_payload);
  IF partner_tier_config(p_payload->>'tier') IS NULL THEN RAISE EXCEPTION 'Invalid tier'; END IF;
  -- Manual creation is an admin rehearsal, never a bypass for real guarantor consent.
  INSERT INTO partner_members(full_name,email,phone,address,employer,payment_day,tier,is_test,status)
  VALUES(btrim(p_payload->>'full_name'),lower(btrim(p_payload->>'email')),btrim(p_payload->>'phone'),btrim(p_payload->>'address'),btrim(p_payload->>'employer'),(p_payload->>'payment_day')::smallint,p_payload->>'tier',true,'active') RETURNING id INTO v_id;
  v_result:=jsonb_build_object('member_id',v_id);
 ELSE
  IF p_operation IN ('pay_draw','cancel_draw') THEN
   SELECT * INTO d FROM partner_draws WHERE id=(p_payload->>'draw_id')::uuid FOR UPDATE;
   IF NOT FOUND THEN RAISE EXCEPTION 'Draw not found'; END IF;
   IF p_payload ? 'member_id' AND (p_payload->>'member_id')::uuid<>d.member_id THEN RAISE EXCEPTION 'Draw belongs to another member'; END IF;
   SELECT * INTO m FROM partner_members WHERE id=d.member_id AND deleted_at IS NULL FOR UPDATE;
  ELSE
   SELECT * INTO m FROM partner_members WHERE id=(p_payload->>'member_id')::uuid AND deleted_at IS NULL FOR UPDATE;
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member not found'; END IF;
  v_config:=partner_tier_config(m.tier);
  IF p_operation='record_payment' THEN
   IF m.status NOT IN ('active','eligible','drew','defaulted_predraw','defaulted_postdraw') THEN RAISE EXCEPTION 'Member cannot receive a contribution in this state'; END IF;
   v_week:=(p_payload->>'week_number')::integer;
   IF v_week IS NULL OR v_week NOT BETWEEN 1 AND 20 OR (p_payload->>'method') NOT IN ('cash','bank_transfer') OR p_payload->>'method' IS NULL OR p_payload->>'due_date' IS NULL THEN RAISE EXCEPTION 'Invalid contribution details'; END IF;
   IF EXISTS(SELECT 1 FROM partner_payments WHERE member_id=m.id AND week_number=v_week AND received_date IS NOT NULL) THEN RAISE EXCEPTION 'This week already has a received contribution'; END IF;
   v_amount:=(v_config->>'contribution')::numeric;
   v_fee:=CASE WHEN COALESCE((p_payload->>'late_fee')::boolean,false) THEN 500 ELSE 0 END;
   INSERT INTO partner_payments(member_id,week_number,due_date,received_date,amount,late_fee,method,status,recorded_by)
   VALUES(m.id,v_week,(p_payload->>'due_date')::date,now(),v_amount,v_fee,p_payload->>'method','paid',p_actor)
   ON CONFLICT(member_id,week_number) DO UPDATE SET received_date=now(),amount=EXCLUDED.amount,late_fee=GREATEST(partner_payments.late_fee,EXCLUDED.late_fee),method=EXCLUDED.method,status='paid',recorded_by=p_actor;
   SELECT count(*) INTO v_count FROM partner_payments WHERE member_id=m.id AND received_date IS NOT NULL;
   UPDATE partner_members SET weeks_paid=v_count,
    status=CASE WHEN v_count=20 AND m.status='drew' THEN 'completed'::partner_member_status WHEN v_count>=12 AND m.status='active' THEN 'eligible'::partner_member_status ELSE status END,
    completion_date=CASE WHEN v_count=20 AND m.status='drew' THEN now() ELSE completion_date END WHERE id=m.id;
   v_result:=jsonb_build_object('member_id',m.id,'weeks_paid',v_count);
  ELSIF p_operation='status' THEN
   v_status:=(p_payload->>'status')::partner_member_status;
   IF v_status=m.status THEN v_result:=jsonb_build_object('member_id',m.id);
   ELSE
    IF NOT (v_status='withdrawn' AND m.status IN ('pending_guarantor','active','eligible') OR v_status='defaulted_predraw' AND m.status IN ('active','eligible') OR v_status='defaulted_postdraw' AND m.status='drew' OR v_status='active' AND m.status='defaulted_predraw' OR v_status='drew' AND m.status='defaulted_postdraw') THEN RAISE EXCEPTION 'This status change is not allowed'; END IF;
    IF EXISTS(SELECT 1 FROM partner_draws WHERE member_id=m.id AND status='scheduled') THEN RAISE EXCEPTION 'Cancel the scheduled draw before changing status'; END IF;
    UPDATE partner_members SET status=v_status WHERE id=m.id;
    v_result:=jsonb_build_object('member_id',m.id);
   END IF;
  ELSIF p_operation='schedule_draw' THEN
   IF m.status<>'eligible' OR m.weeks_paid<12 THEN RAISE EXCEPTION 'Member is not eligible for a draw'; END IF;
   IF EXISTS(SELECT 1 FROM partner_members q WHERE q.tier=m.tier AND q.is_test=m.is_test AND q.status='eligible' AND q.deleted_at IS NULL AND (q.enrollment_date,q.id)<(m.enrollment_date,m.id) AND NOT EXISTS(SELECT 1 FROM partner_draws x WHERE x.member_id=q.id AND x.status IN ('scheduled','paid'))) THEN RAISE EXCEPTION 'An earlier member is ahead in this tier queue'; END IF;
   INSERT INTO partner_draws(member_id,scheduled_week,amount) VALUES(m.id,(p_payload->>'scheduled_week')::date,(v_config->>'draw')::numeric) RETURNING id INTO v_id;
   v_result:=jsonb_build_object('draw_id',v_id,'member_id',m.id);
  ELSIF p_operation='pay_draw' THEN
   IF d.status<>'scheduled' OR m.status<>'eligible' THEN RAISE EXCEPTION 'Only a scheduled eligible draw can be paid'; END IF;
   IF EXISTS(SELECT 1 FROM partner_members q WHERE q.tier=m.tier AND q.is_test=m.is_test AND q.status='eligible' AND q.deleted_at IS NULL AND (q.enrollment_date,q.id)<(m.enrollment_date,m.id)) THEN RAISE EXCEPTION 'An earlier member is ahead in this tier queue'; END IF;
   SELECT COALESCE((SELECT sum(p.amount+p.late_fee) FROM partner_payments p JOIN partner_members x ON x.id=p.member_id WHERE x.tier=m.tier AND x.is_test=m.is_test AND p.received_date IS NOT NULL),0)
    -COALESCE((SELECT sum(xd.amount) FROM partner_draws xd JOIN partner_members x ON x.id=xd.member_id WHERE x.tier=m.tier AND x.is_test=m.is_test AND xd.status='paid'),0) INTO v_balance;
   IF d.amount<>(v_config->>'draw')::numeric THEN RAISE EXCEPTION 'Scheduled draw amount does not match this tier'; END IF;
   IF v_balance<d.amount THEN RAISE EXCEPTION 'This tier has insufficient received funds'; END IF;
   UPDATE partner_draws SET status='paid',paid_date=now() WHERE id=d.id;
   UPDATE partner_members SET status=CASE WHEN weeks_paid=20 THEN 'completed'::partner_member_status ELSE 'drew'::partner_member_status END,draw_date=now(),completion_date=CASE WHEN weeks_paid=20 THEN now() ELSE completion_date END WHERE id=m.id;
   v_result:=jsonb_build_object('draw_id',d.id,'member_id',m.id);
  ELSIF p_operation='cancel_draw' THEN
   IF d.status<>'scheduled' THEN RAISE EXCEPTION 'Only a scheduled draw can be cancelled'; END IF;
   UPDATE partner_draws SET status='cancelled' WHERE id=d.id;
   v_result:=jsonb_build_object('draw_id',d.id);
  ELSE RAISE EXCEPTION 'Unknown savings operation'; END IF;
 END IF;
 INSERT INTO partner_audit_log(action,actor_id,target_type,target_id,details) VALUES(p_operation,p_actor,CASE WHEN p_operation IN ('pay_draw','cancel_draw','schedule_draw') THEN 'draw' ELSE 'member' END,COALESCE((v_result->>'draw_id')::uuid,(v_result->>'member_id')::uuid),p_payload);
 INSERT INTO partner_operation_receipts(request_id,actor_id,operation,payload,result) VALUES(p_request_id,p_actor,p_operation,p_payload,v_result);
 RETURN v_result;
END $$;

CREATE FUNCTION public.partner_tier_summary(include_test boolean DEFAULT false)
RETURNS TABLE(tier text,active_members bigint,queue_length bigint,total_contributions_received numeric,total_draws_paid numeric,buffer_balance numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.role()<>'service_role' AND NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator access required'; END IF;
 RETURN QUERY WITH scoped AS(SELECT * FROM partner_members m WHERE include_test OR NOT m.is_test),
 contributions AS(SELECT m.tier,sum(p.amount+p.late_fee) total FROM scoped m JOIN partner_payments p ON p.member_id=m.id WHERE p.received_date IS NOT NULL GROUP BY m.tier),
 draws AS(SELECT m.tier,sum(d.amount) total FROM scoped m JOIN partner_draws d ON d.member_id=m.id WHERE d.status='paid' GROUP BY m.tier)
 SELECT m.tier,count(*) FILTER(WHERE m.deleted_at IS NULL AND m.status IN ('active','eligible','drew')),count(*) FILTER(WHERE m.deleted_at IS NULL AND m.status='eligible'),COALESCE(c.total,0),COALESCE(d.total,0),COALESCE(c.total,0)-COALESCE(d.total,0)
 FROM scoped m LEFT JOIN contributions c ON c.tier=m.tier LEFT JOIN draws d ON d.tier=m.tier GROUP BY m.tier,c.total,d.total ORDER BY m.tier;
END $$;
CREATE FUNCTION public.partner_queue_position(p_member uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE m partner_members; v_position bigint; v_total bigint;
BEGIN
 IF NOT public.is_admin() AND p_member IS DISTINCT FROM public.partner_current_member_id() THEN RAISE EXCEPTION 'Member access required'; END IF;
 SELECT * INTO m FROM partner_members WHERE id=p_member AND deleted_at IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Member not found'; END IF;
 SELECT count(*),count(*) FILTER(WHERE (q.enrollment_date,q.id)<=(m.enrollment_date,m.id)) INTO v_total,v_position FROM partner_members q WHERE q.tier=m.tier AND q.is_test=m.is_test AND q.deleted_at IS NULL AND q.status='eligible';
 RETURN jsonb_build_object('position',CASE WHEN m.status='eligible' THEN v_position ELSE NULL END,'total',v_total);
END $$;
CREATE FUNCTION public.partner_daily_maintenance() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_late integer; v_defaults integer; v_expired integer; v_eligible integer;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('partner_operations',0));
 UPDATE partner_payments SET status='late',late_fee=500 WHERE received_date IS NULL AND status='pending' AND due_date<(now() AT TIME ZONE 'America/Jamaica')::date-3;
 GET DIAGNOSTICS v_late=ROW_COUNT;
 UPDATE partner_payments SET status='defaulted' WHERE received_date IS NULL AND status IN ('pending','late') AND due_date<=(now() AT TIME ZONE 'America/Jamaica')::date-7;
 GET DIAGNOSTICS v_defaults=ROW_COUNT;
 UPDATE partner_members m SET status=CASE WHEN EXISTS(SELECT 1 FROM partner_draws d WHERE d.member_id=m.id AND d.status='paid') THEN 'defaulted_postdraw'::partner_member_status ELSE 'defaulted_predraw'::partner_member_status END WHERE m.deleted_at IS NULL AND m.status IN ('active','eligible','drew') AND EXISTS(SELECT 1 FROM partner_payments p WHERE p.member_id=m.id AND p.status='defaulted' AND p.received_date IS NULL);
 UPDATE partner_guarantors SET status='timeout' WHERE status='pending' AND created_at<=now()-interval '7 days'; GET DIAGNOSTICS v_expired=ROW_COUNT;
 UPDATE partner_members SET status='eligible' WHERE status='active' AND weeks_paid>=12 AND deleted_at IS NULL; GET DIAGNOSTICS v_eligible=ROW_COUNT;
 INSERT INTO partner_audit_log(action,target_type,details) VALUES('daily_maintenance','system',jsonb_build_object('late',v_late,'defaults',v_defaults,'expired',v_expired,'eligible',v_eligible));
 RETURN jsonb_build_object('late',v_late,'defaults',v_defaults,'expired',v_expired,'eligible',v_eligible);
END $$;

CREATE FUNCTION public.partner_lookup_account(p_email text) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT id FROM auth.users WHERE lower(email)=lower(btrim(p_email)) LIMIT 1
$$;
CREATE FUNCTION public.partner_link_account(p_member uuid,p_user uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m partner_members;
BEGIN
 SELECT * INTO m FROM partner_members WHERE id=p_member AND deleted_at IS NULL FOR UPDATE;
 IF NOT FOUND OR m.status NOT IN ('active','eligible','drew','completed') OR NOT EXISTS(SELECT 1 FROM partner_guarantors WHERE member_id=m.id AND status='approved') THEN RAISE EXCEPTION 'Approved member required'; END IF;
 IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id=p_user AND lower(email)=lower(m.email)) THEN RAISE EXCEPTION 'Account email does not match member'; END IF;
 IF EXISTS(SELECT 1 FROM partner_accounts WHERE user_id=p_user AND member_id<>p_member OR member_id=p_member AND user_id<>p_user) THEN RAISE EXCEPTION 'Account is already linked'; END IF;
 INSERT INTO partner_accounts(user_id,member_id) VALUES(p_user,p_member) ON CONFLICT(user_id) DO NOTHING;
END $$;
CREATE FUNCTION public.partner_capture_interest(p_email text,p_tier text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF p_email IS NULL OR length(p_email)>254 OR btrim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR p_tier NOT IN ('blaze','inferno') OR p_tier IS NULL THEN RAISE EXCEPTION 'Valid email and coming-soon tier required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('partner_interest',0));
 IF EXISTS(SELECT 1 FROM partner_tier_interest WHERE email=lower(btrim(p_email)) AND tier=p_tier) THEN RETURN; END IF;
 IF (SELECT count(*) FROM partner_tier_interest WHERE created_at>now()-interval '1 hour')>=30 THEN RAISE EXCEPTION 'Please try again later'; END IF;
 INSERT INTO partner_tier_interest(email,tier) VALUES(lower(btrim(p_email)),p_tier);
END $$;

CREATE FUNCTION public.partner_immutable_record() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN RAISE EXCEPTION 'Savings audit and retry records are immutable'; END $$;
CREATE TRIGGER partner_audit_immutable BEFORE UPDATE OR DELETE ON public.partner_audit_log FOR EACH ROW EXECUTE FUNCTION public.partner_immutable_record();
CREATE TRIGGER partner_receipts_immutable BEFORE UPDATE OR DELETE ON public.partner_operation_receipts FOR EACH ROW EXECUTE FUNCTION public.partner_immutable_record();

-- Default function grants are broad in Supabase. Explicitly remove inherited grants.
DO $$ DECLARE f record; BEGIN
 FOR f IN SELECT p.oid::regprocedure signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname LIKE 'partner\_%' ESCAPE '\' LOOP
  EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC,anon,authenticated',f.signature);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',f.signature);
 END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION public.partner_current_member_id(),public.partner_queue_position(uuid),public.partner_tier_summary(boolean) TO authenticated;
COMMIT;
