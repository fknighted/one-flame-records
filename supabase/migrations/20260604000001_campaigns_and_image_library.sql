-- AI Generated Images library
CREATE TABLE public.ai_generated_images (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  url        text        NOT NULL,
  prompt     text,
  purpose    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_images_admin_all"
  ON public.ai_generated_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Content campaigns
CREATE TABLE public.content_campaigns (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text        NOT NULL,
  source_type    text        NOT NULL CHECK (source_type IN ('video','post','newsletter','text','url')),
  source_content text        NOT NULL,
  status         text        NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('draft','generating','review','approved','publishing','done','failed')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_admin_all"
  ON public.content_campaigns FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER set_content_campaigns_updated_at
  BEFORE UPDATE ON public.content_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Content pieces
CREATE TABLE public.content_pieces (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid        NOT NULL REFERENCES public.content_campaigns(id) ON DELETE CASCADE,
  platform     text        NOT NULL CHECK (platform IN ('instagram','tiktok','facebook')),
  content_type text        NOT NULL CHECK (content_type IN ('image_post','video_post','reel','story','text_post')),
  caption      text,
  hashtags     text[],
  image_url    text,
  video_url    text,
  video_mode   text        CHECK (video_mode IN ('script','generated')),
  video_script text,
  status       text        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','generating','ready','approved','rejected','publishing','published','failed')),
  error        text,
  published_at timestamptz,
  sort_order   int         NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_pieces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pieces_admin_all"
  ON public.content_pieces FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER set_content_pieces_updated_at
  BEFORE UPDATE ON public.content_pieces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
