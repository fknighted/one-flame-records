CREATE TABLE public.fan_subscribers (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        UNIQUE NOT NULL,
  status     text        NOT NULL DEFAULT 'active'
             CHECK (status IN ('active', 'unsubscribed')),
  source     text        NOT NULL DEFAULT 'website',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fan_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can subscribe (insert only)
CREATE POLICY "subscribers_insert_public"
  ON public.fan_subscribers FOR INSERT
  WITH CHECK (true);

-- Admins manage everything
CREATE POLICY "subscribers_admin_all"
  ON public.fan_subscribers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
