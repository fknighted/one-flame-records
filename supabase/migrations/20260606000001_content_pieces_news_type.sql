-- Allow news_post as a content_type and news as a platform on content_pieces
ALTER TABLE public.content_pieces
  DROP CONSTRAINT IF EXISTS content_pieces_content_type_check;

ALTER TABLE public.content_pieces
  ADD CONSTRAINT content_pieces_content_type_check
  CHECK (content_type IN ('image_post','video_post','reel','story','text_post','news_post'));

ALTER TABLE public.content_pieces
  DROP CONSTRAINT IF EXISTS content_pieces_platform_check;

ALTER TABLE public.content_pieces
  ADD CONSTRAINT content_pieces_platform_check
  CHECK (platform IN ('instagram','tiktok','facebook','news'));
