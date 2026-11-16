BEGIN;
-- Every valid /contact submission is kept, so a failed or missed email never
-- loses an enquiry. Only the validated, rate-limited server action writes rows
-- (service role). Signed-in administrators who passed their second sign-in
-- step can read them; nobody else can read, write, change or delete them.
CREATE TABLE public.contact_enquiries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 enquiry_type text NOT NULL CHECK (enquiry_type IN
  ('general','studio_session','event','private_hire','press','sync','artist_submission')),
 name text NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
 email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
 message text NOT NULL CHECK (length(message) BETWEEN 1 AND 5000),
 -- Whether the email provider accepted each message. Accepted does not prove inbox delivery.
 admin_email_status text NOT NULL DEFAULT 'pending' CHECK (admin_email_status IN ('pending','sent','failed')),
 reply_email_status text NOT NULL DEFAULT 'pending' CHECK (reply_email_status IN ('pending','sent','failed')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contact_enquiries_created_at_idx ON public.contact_enquiries (created_at DESC);
CREATE INDEX contact_enquiries_type_created_at_idx ON public.contact_enquiries (enquiry_type, created_at DESC);

ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contact_enquiries FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.contact_enquiries TO authenticated;
GRANT ALL ON public.contact_enquiries TO service_role;
CREATE POLICY contact_enquiries_admin_read ON public.contact_enquiries
 FOR SELECT TO authenticated USING (public.is_admin());

-- The sender's automatic confirmation uses the existing Email Studio, so its
-- wording can be edited and tested like the other automatic emails.
ALTER TABLE public.email_studio_templates DROP CONSTRAINT email_studio_templates_key_check;
ALTER TABLE public.email_studio_templates ADD CONSTRAINT email_studio_templates_key_check CHECK (key IN
 ('application-approved','application-rejected','staff-invitation','subscription-confirmation','unsubscribe-link','welcome','contact-confirmation'));
COMMIT;
