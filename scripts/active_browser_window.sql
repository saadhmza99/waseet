-- Count distinct browsers for "active" / sessions (not duplicated rows).
-- p_active_minutes drives "Navigateurs actifs" (15, 30, then each hour up to 24).
DROP FUNCTION IF EXISTS public.admin_visitor_analytics(TEXT);

CREATE OR REPLACE FUNCTION public.admin_visitor_analytics(
  p_range TEXT DEFAULT 'today',
  p_active_minutes INTEGER DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_from TIMESTAMPTZ;
  v_to TIMESTAMPTZ := NOW();
  v_minutes INTEGER := LEAST(1440, GREATEST(15, COALESCE(p_active_minutes, 15)));
  v_active_cut TIMESTAMPTZ := NOW() - (v_minutes * INTERVAL '1 minute');
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
    'active_minutes', v_minutes,
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

REVOKE ALL ON FUNCTION public.admin_visitor_analytics(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_visitor_analytics(TEXT, INTEGER) TO authenticated;
NOTIFY pgrst, 'reload schema';
