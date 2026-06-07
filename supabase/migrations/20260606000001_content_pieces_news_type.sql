-- Allow news_post as a content_type on content_pieces
ALTER TABLE public.content_pieces
  DROP CONSTRAINT IF EXISTS content_pieces_content_type_check;

ALTER TABLE public.content_pieces
  ADD CONSTRAINT content_pieces_content_type_check
  CHECK (content_type IN ('image_post','video_post','reel','story','text_post','news_post'));
