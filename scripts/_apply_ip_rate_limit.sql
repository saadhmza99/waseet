-- IP / geo rate-limit buckets for Edge Function submit-lead.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  bucket_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  country TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (bucket_key, window_start)
);

CREATE INDEX IF NOT EXISTS rate_limit_buckets_updated_idx
  ON public.rate_limit_buckets (updated_at DESC);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: only service_role (bypasses RLS) / SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_bucket_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER DEFAULT 3600,
  p_country TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key TEXT := left(btrim(COALESCE(p_bucket_key, '')), 200);
  v_limit INTEGER := GREATEST(1, LEAST(COALESCE(p_limit, 10), 1000));
  v_window INTEGER := GREATEST(60, LEAST(COALESCE(p_window_seconds, 3600), 86400));
  v_start TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  IF v_key = '' THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'missing_key');
  END IF;

  v_start := to_timestamp(floor(extract(epoch FROM NOW()) / v_window) * v_window);

  INSERT INTO public.rate_limit_buckets (bucket_key, window_start, hit_count, country, updated_at)
  VALUES (v_key, v_start, 1, nullif(left(upper(btrim(COALESCE(p_country, ''))), 8), ''), NOW())
  ON CONFLICT (bucket_key, window_start) DO UPDATE
  SET
    hit_count = public.rate_limit_buckets.hit_count + 1,
    country = COALESCE(EXCLUDED.country, public.rate_limit_buckets.country),
    updated_at = NOW()
  RETURNING hit_count INTO v_count;

  IF v_count > v_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit',
      'count', v_count,
      'limit', v_limit,
      'retry_after_seconds', v_window - (extract(epoch FROM NOW())::int % v_window)
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'count', v_count,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_count)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, INTEGER, TEXT) TO service_role;

-- Force devis / contact / partner creates through Edge Function (service_role).
DROP POLICY IF EXISTS "Anyone can create a devis request" ON public.devis_requests;
DROP POLICY IF EXISTS "Anyone can send a contact message" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can create a partner request" ON public.partner_requests;

REVOKE INSERT ON public.devis_requests FROM anon, authenticated;
REVOKE INSERT ON public.contact_messages FROM anon, authenticated;
REVOKE INSERT ON public.partner_requests FROM anon, authenticated;

-- Optional cleanup of old windows (keep ~7 days)
DELETE FROM public.rate_limit_buckets WHERE window_start < NOW() - INTERVAL '7 days';

NOTIFY pgrst, 'reload schema';
