-- Fix: reuse browser session instead of minting a new one every page view.
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

  IF v_session IS NOT NULL AND EXISTS (SELECT 1 FROM public.visitor_sessions WHERE id = v_session) THEN
    UPDATE public.visitor_sessions
    SET
      last_seen_at = NOW(),
      client_key = v_key,
      user_id = COALESCE(v_uid, user_id),
      account_kind = CASE
        WHEN v_kind = 'member' THEN 'member'
        WHEN v_kind = 'visitor' AND account_kind = 'anon' THEN 'visitor'
        ELSE account_kind
      END,
      ended_at = NULL
    WHERE id = v_session;
  ELSE
    SELECT id INTO v_session
    FROM public.visitor_sessions
    WHERE client_key = v_key
      AND last_seen_at > NOW() - INTERVAL '12 hours'
    ORDER BY last_seen_at DESC
    LIMIT 1;

    IF v_session IS NULL THEN
      IF p_session_id IS NOT NULL THEN
        INSERT INTO public.visitor_sessions (id, client_key, user_id, account_kind)
        VALUES (p_session_id, v_key, v_uid, v_kind)
        ON CONFLICT (id) DO UPDATE
          SET last_seen_at = NOW(),
              user_id = COALESCE(EXCLUDED.user_id, public.visitor_sessions.user_id),
              account_kind = EXCLUDED.account_kind,
              ended_at = NULL
        RETURNING id INTO v_session;
      ELSE
        INSERT INTO public.visitor_sessions (client_key, user_id, account_kind)
        VALUES (v_key, v_uid, v_kind)
        RETURNING id INTO v_session;
      END IF;
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

-- Count distinct browsers for "active" / sessions (not duplicated rows).
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
    WHERE account_kind IN ('visitor', 'member') OR user_id IS NOT NULL
    UNION
    SELECT DISTINCT client_key
    FROM hits
    WHERE account_kind IN ('visitor', 'member') OR user_id IS NOT NULL
  ),
  member_ids AS (
    SELECT DISTINCT user_id FROM sessions WHERE user_id IS NOT NULL AND account_kind = 'member'
    UNION
    SELECT DISTINCT user_id FROM hits WHERE user_id IS NOT NULL AND account_kind = 'member'
  ),
  visitor_ids AS (
    SELECT DISTINCT user_id FROM sessions WHERE user_id IS NOT NULL AND account_kind = 'visitor'
    UNION
    SELECT DISTINCT user_id FROM hits WHERE user_id IS NOT NULL AND account_kind = 'visitor'
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
    SELECT path, count(*)::int AS clicks FROM clicks GROUP BY path
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
      SELECT count(DISTINCT client_key)::int
      FROM public.visitor_sessions
      WHERE last_seen_at >= v_active_cut
    ),
    'sessions', (SELECT count(DISTINCT client_key)::int FROM sessions),
    'visitors', (SELECT count(DISTINCT client_key)::int FROM sessions),
    'page_views', (SELECT count(*)::int FROM hits),
    'clicks', (SELECT count(*)::int FROM clicks),
    'watch_ms_total', (SELECT COALESCE(sum(dwell_ms), 0)::bigint FROM hits),
    'signed_up', (SELECT count(*)::int FROM (SELECT client_key FROM signed_keys) x),
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
