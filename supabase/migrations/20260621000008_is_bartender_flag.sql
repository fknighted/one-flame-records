-- Allow an artist to also have bar access without changing their primary role.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_bartender BOOLEAN NOT NULL DEFAULT FALSE;
