CREATE TABLE public.events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  description  text,
  event_date   timestamptz NOT NULL,
  end_date     timestamptz,
  type         text        NOT NULL DEFAULT 'other'
               CHECK (type IN ('open_mic','showcase','dj_night','listening_session','watch_party','private_hire','other')),
  location     text        NOT NULL DEFAULT 'Flames Lounge, Montego Bay',
  tickets_url  text,
  is_public    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_public"
  ON public.events FOR SELECT
  USING (is_public = true);

CREATE POLICY "events_admin_all"
  ON public.events FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
