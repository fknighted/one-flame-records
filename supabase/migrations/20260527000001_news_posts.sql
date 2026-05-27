CREATE TABLE public.news_posts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text        UNIQUE NOT NULL,
  title        text        NOT NULL,
  excerpt      text,
  body         text        NOT NULL DEFAULT '',
  cover_url    text,
  category     text        NOT NULL DEFAULT 'label',
  published_at timestamptz,
  is_published boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_posts_select_public"
  ON public.news_posts FOR SELECT
  USING (is_published = true AND published_at <= now());

CREATE POLICY "news_posts_admin_all"
  ON public.news_posts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER set_news_posts_updated_at
  BEFORE UPDATE ON public.news_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
