-- Anonymous first-party cookie tracking (sifarah_vid).
CREATE TABLE IF NOT EXISTS public.visitor_hits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS visitor_hits_client_created_idx
  ON public.visitor_hits (client_key, created_at DESC);
CREATE INDEX IF NOT EXISTS visitor_hits_created_idx
  ON public.visitor_hits (created_at DESC);

ALTER TABLE public.visitor_hits ENABLE ROW LEVEL SECURITY;

-- No direct table access; writes go through the RPC below.
DROP POLICY IF EXISTS "No direct visitor_hits access" ON public.visitor_hits;

CREATE OR REPLACE FUNCTION public.track_visitor_hit(
  p_client_key TEXT,
  p_path TEXT,
  p_referrer TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key TEXT := lower(btrim(COALESCE(p_client_key, '')));
  v_path TEXT := left(btrim(COALESCE(p_path, '/')), 500);
  v_ref TEXT := nullif(left(btrim(COALESCE(p_referrer, '')), 500), '');
BEGIN
  IF v_key !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    RETURN;
  END IF;
  IF v_path = '' THEN
    v_path := '/';
  END IF;

  -- Soft rate limit: skip if same client+path was logged in the last 25 seconds.
  IF EXISTS (
    SELECT 1
    FROM public.visitor_hits
    WHERE client_key = v_key
      AND path = v_path
      AND created_at > NOW() - INTERVAL '25 seconds'
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.visitor_hits (client_key, path, referrer)
  VALUES (v_key, v_path, v_ref);
END;
$$;

REVOKE ALL ON FUNCTION public.track_visitor_hit(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_visitor_hit(TEXT, TEXT, TEXT) TO anon, authenticated;
