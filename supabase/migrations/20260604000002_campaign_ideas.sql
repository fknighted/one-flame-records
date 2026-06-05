CREATE TABLE public.campaign_ideas (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                text        NOT NULL,
  angle                text,
  pillar               text,
  source_type          text        NOT NULL DEFAULT 'text'
                                   CHECK (source_type IN ('video','post','newsletter','text','url')),
  suggested_platforms  text[]      NOT NULL DEFAULT '{}',
  status               text        NOT NULL DEFAULT 'draft'
                                   CHECK (status IN ('draft','expanded','dismissed')),
  created_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ideas_admin_all"
  ON public.campaign_ideas FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
