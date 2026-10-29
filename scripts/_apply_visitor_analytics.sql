-- Extended visitor analytics: sessions, dwell, clicks + admin overview RPC.

ALTER TABLE public.visitor_hits
  ADD COLUMN IF NOT EXISTS session_id UUID,
  ADD COLUMN IF NOT EXISTS account_kind TEXT,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS dwell_ms INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS visitor_hits_session_idx ON public.visitor_hits (session_id);
CREATE INDEX IF NOT EXISTS visitor_hits_user_idx ON public.visitor_hits (user_id);
CREATE INDEX IF NOT EXISTS visitor_hits_path_created_idx ON public.visitor_hits (path, created_at DESC);

CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key TEXT NOT NULL,
  user_id UUID,
  account_kind TEXT NOT NULL DEFAULT 'anon',
  started_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS visitor_sessions_last_seen_idx
  ON public.visitor_sessions (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS visitor_sessions_client_idx
  ON public.visitor_sessions (client_key, started_at DESC);
CREATE INDEX IF NOT EXISTS visitor_sessions_user_idx
  ON public.visitor_sessions (user_id);

ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.visitor_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key TEXT NOT NULL,
  session_id UUID,
  path TEXT NOT NULL,
  label TEXT,
  href TEXT,
  target_tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS visitor_clicks_created_idx ON public.visitor_clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS visitor_clicks_path_idx ON public.visitor_clicks (path, created_at DESC);
CREATE INDEX IF NOT EXISTS visitor_clicks_session_idx ON public.visitor_clicks (session_id);

ALTER TABLE public.visitor_clicks ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public._valid_client_key(p TEXT)
RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE
AS $$
  SELECT lower(btrim(COALESCE(p, ''))) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
$$;

DROP FUNCTION IF EXISTS public.track_visitor_hit(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.track_visitor_hit(
  p_client_key TEXT,
  p_path TEXT,
  p_referrer TEXT DEFAULT NULL,
  p_session_id UUID DEFAULT NULL,
  p_account_kind TEXT DEFAULT 'anon',
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key TEXT := lower(btrim(COALESCE(p_client_key, '')));
  v_path TEXT := left(btrim(COALESCE(p_path, '/')), 500);
  v_ref TEXT := nullif(left(btrim(COALESCE(p_referrer, '')), 500), '');
  v_kind TEXT := lower(btrim(COALESCE(p_account_kind, 'anon')));
  v_session UUID := p_session_id;
  v_hit UUID;
  v_uid UUID := p_user_id;
BEGIN
  IF NOT public._valid_client_key(v_key) THEN
    RETURN NULL;
  END IF;
  IF v_path = '' THEN v_path := '/'; END IF;
  IF v_kind NOT IN ('anon', 'visitor', 'member') THEN v_kind := 'anon'; END IF;
  IF v_uid IS DISTINCT FROM auth.uid() THEN
    v_uid := auth.uid();
  END IF;

  IF v_session IS NULL OR NOT EXISTS (SELECT 1 FROM public.visitor_sessions WHERE id = v_session) THEN
    INSERT INTO public.visitor_sessions (client_key, user_id, account_kind)
    VALUES (v_key, v_uid, v_kind)
    RETURNING id INTO v_session;
  ELSE
    UPDATE public.visitor_sessions
    SET
      last_seen_at = NOW(),
      user_id = COALESCE(v_uid, user_id),
      account_kind = CASE
        WHEN v_kind = 'member' THEN 'member'
        WHEN v_kind = 'visitor' AND account_kind = 'anon' THEN 'visitor'
        ELSE account_kind
      END,
      ended_at = NULL
    WHERE id = v_session;
  END IF;

  SELECT id INTO v_hit
  FROM public.visitor_hits
  WHERE client_key = v_key
    AND path = v_path
    AND session_id IS NOT DISTINCT FROM v_session
    AND created_at > NOW() - INTERVAL '25 seconds'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_hit IS NOT NULL THEN
    UPDATE public.visitor_sessions SET last_seen_at = NOW() WHERE id = v_session;
    RETURN v_hit;
  END IF;

  INSERT INTO public.visitor_hits (client_key, path, referrer, session_id, account_kind, user_id)
  VALUES (v_key, v_path, v_ref, v_session, v_kind, v_uid)
  RETURNING id INTO v_hit;

  RETURN v_hit;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_visitor_dwell(
  p_hit_id UUID,
  p_dwell_ms INTEGER,
  p_session_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ms INTEGER := GREATEST(0, LEAST(COALESCE(p_dwell_ms, 0), 3600000));
BEGIN
  IF p_hit_id IS NULL OR v_ms <= 0 THEN RETURN; END IF;
  UPDATE public.visitor_hits
  SET dwell_ms = GREATEST(dwell_ms, v_ms)
  WHERE id = p_hit_id;
  IF p_session_id IS NOT NULL THEN
    UPDATE public.visitor_sessions
    SET last_seen_at = NOW(), ended_at = NULL
    WHERE id = p_session_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_visitor_click(
  p_client_key TEXT,
  p_path TEXT,
  p_label TEXT DEFAULT NULL,
  p_href TEXT DEFAULT NULL,
  p_target_tag TEXT DEFAULT NULL,
  p_session_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key TEXT := lower(btrim(COALESCE(p_client_key, '')));
  v_path TEXT := left(btrim(COALESCE(p_path, '/')), 500);
BEGIN
  IF NOT public._valid_client_key(v_key) THEN RETURN; END IF;
  IF v_path = '' THEN v_path := '/'; END IF;

  INSERT INTO public.visitor_clicks (client_key, session_id, path, label, href, target_tag)
  VALUES (
    v_key,
    p_session_id,
    v_path,
    nullif(left(btrim(COALESCE(p_label, '')), 200), ''),
    nullif(left(btrim(COALESCE(p_href, '')), 500), ''),
    nullif(left(btrim(COALESCE(p_target_tag, '')), 40), '')
  );

  IF p_session_id IS NOT NULL THEN
    UPDATE public.visitor_sessions
    SET last_seen_at = NOW(), ended_at = NULL
    WHERE id = p_session_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_visitor_analytics(p_range TEXT DEFAULT 'today')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_from TIMESTAMPTZ;
  v_to TIMESTAMPTZ := NOW();
  v_active_cut TIMESTAMPTZ := NOW() - INTERVAL '15 minutes';
  v_result JSONB;
BEGIN
  IF v_uid IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.moderation_admins ma WHERE ma.user_id = v_uid
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  CASE lower(btrim(COALESCE(p_range, 'today')))
    WHEN 'active' THEN
      v_from := v_active_cut;
    WHEN 'yesterday' THEN
      v_from := date_trunc('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day';
      v_to := date_trunc('day', NOW() AT TIME ZONE 'UTC');
    WHEN 'week' THEN
      v_from := NOW() - INTERVAL '7 days';
    WHEN 'month' THEN
      v_from := NOW() - INTERVAL '30 days';
    ELSE
      -- today
      v_from := date_trunc('day', NOW() AT TIME ZONE 'UTC');
  END CASE;

  WITH
  sessions AS (
    SELECT *
    FROM public.visitor_sessions s
    WHERE s.last_seen_at >= v_from AND s.last_seen_at < v_to
  ),
  hits AS (
    SELECT *
    FROM public.visitor_hits h
    WHERE h.created_at >= v_from AND h.created_at < v_to
  ),
  clicks AS (
    SELECT *
    FROM public.visitor_clicks c
    WHERE c.created_at >= v_from AND c.created_at < v_to
  ),
  signed_keys AS (
    SELECT DISTINCT client_key
    FROM sessions
    WHERE account_kind IN ('visitor', 'member')
       OR user_id IS NOT NULL
    UNION
    SELECT DISTINCT client_key
    FROM hits
    WHERE account_kind IN ('visitor', 'member')
       OR user_id IS NOT NULL
  ),
  member_ids AS (
    SELECT DISTINCT user_id
    FROM sessions
    WHERE user_id IS NOT NULL AND account_kind = 'member'
    UNION
    SELECT DISTINCT user_id
    FROM hits
    WHERE user_id IS NOT NULL AND account_kind = 'member'
  ),
  visitor_ids AS (
    SELECT DISTINCT user_id
    FROM sessions
    WHERE user_id IS NOT NULL AND account_kind = 'visitor'
    UNION
    SELECT DISTINCT user_id
    FROM hits
    WHERE user_id IS NOT NULL AND account_kind = 'visitor'
  ),
  cats AS (
    SELECT
      COALESCE(
        nullif(btrim(ic.detailed_sub_category), ''),
        nullif(btrim(ic.sub_category), ''),
        ic.code,
        'Sans catégorie'
      ) AS category,
      count(DISTINCT m.user_id)::int AS members
    FROM member_ids m
    JOIN public.profiles p ON p.id = m.user_id
    LEFT JOIN public.internal_categories ic ON ic.id = p.internal_category_id
    GROUP BY 1
    ORDER BY members DESC, category
    LIMIT 30
  ),
  page_clicks AS (
    SELECT path, count(*)::int AS clicks
    FROM clicks
    GROUP BY path
  ),
  pages AS (
    SELECT
      h.path,
      count(*)::int AS views,
      count(DISTINCT h.client_key)::int AS unique_visitors,
      COALESCE(sum(h.dwell_ms), 0)::bigint AS watch_ms_total,
      COALESCE(round(avg(NULLIF(h.dwell_ms, 0))), 0)::bigint AS watch_ms_avg,
      COALESCE(max(pc.clicks), 0)::int AS clicks
    FROM hits h
    LEFT JOIN page_clicks pc ON pc.path = h.path
    GROUP BY h.path
    ORDER BY views DESC
    LIMIT 40
  )
  SELECT jsonb_build_object(
    'range', lower(btrim(COALESCE(p_range, 'today'))),
    'from', v_from,
    'to', v_to,
    'generated_at', NOW(),
    'active_sessions', (
      SELECT count(*)::int FROM public.visitor_sessions WHERE last_seen_at >= v_active_cut
    ),
    'sessions', (SELECT count(*)::int FROM sessions),
    'visitors', (SELECT count(DISTINCT client_key)::int FROM sessions),
    'page_views', (SELECT count(*)::int FROM hits),
    'clicks', (SELECT count(*)::int FROM clicks),
    'watch_ms_total', (SELECT COALESCE(sum(dwell_ms), 0)::bigint FROM hits),
    'signed_up', (
      SELECT count(*)::int FROM (
        SELECT client_key FROM signed_keys
      ) x
    ),
    'members', (SELECT count(*)::int FROM member_ids),
    'guest_visitors', (SELECT count(*)::int FROM visitor_ids),
    'regular_visitors', (
      SELECT count(DISTINCT s.client_key)::int
      FROM sessions s
      WHERE s.client_key NOT IN (SELECT client_key FROM signed_keys)
        AND COALESCE(s.account_kind, 'anon') = 'anon'
        AND s.user_id IS NULL
    ),
    'categories', COALESCE((SELECT jsonb_agg(to_jsonb(c)) FROM cats c), '[]'::jsonb),
    'pages', COALESCE((SELECT jsonb_agg(to_jsonb(p)) FROM pages p), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.track_visitor_hit(TEXT, TEXT, TEXT, UUID, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.track_visitor_dwell(UUID, INTEGER, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.track_visitor_click(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_visitor_analytics(TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.track_visitor_hit(TEXT, TEXT, TEXT, UUID, TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_visitor_dwell(UUID, INTEGER, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_visitor_click(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_visitor_analytics(TEXT) TO authenticated;
