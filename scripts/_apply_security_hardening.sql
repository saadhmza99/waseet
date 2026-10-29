-- Security hardening: path redaction, rate limits, dwell ownership, notifications, about sanitize, profile PII view.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Safe URL path: drop query/hash; strip auth-ish tokens if somehow present
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.safe_analytics_path(p_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v TEXT := left(btrim(COALESCE(p_path, '/')), 500);
  v_q INT;
BEGIN
  IF v = '' THEN RETURN '/'; END IF;
  v_q := position('?' IN v);
  IF v_q > 0 THEN v := left(v, v_q - 1); END IF;
  v_q := position('#' IN v);
  IF v_q > 0 THEN v := left(v, v_q - 1); END IF;
  IF v = '' THEN v := '/'; END IF;
  RETURN v;
END;
$$;

CREATE OR REPLACE FUNCTION public.safe_analytics_href(p_href TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v TEXT := left(btrim(COALESCE(p_href, '')), 500);
  v_q INT;
BEGIN
  IF v = '' THEN RETURN NULL; END IF;
  v_q := position('?' IN v);
  IF v_q > 0 THEN v := left(v, v_q - 1); END IF;
  v_q := position('#' IN v);
  IF v_q > 0 THEN v := left(v, v_q - 1); END IF;
  RETURN nullif(v, '');
END;
$$;

-- Patch track_visitor_hit / click / dwell (redefine bodies with safe path + dwell ownership)
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
  v_path TEXT := public.safe_analytics_path(p_path);
  v_ref TEXT := public.safe_analytics_href(p_referrer);
  v_kind TEXT := lower(btrim(COALESCE(p_account_kind, 'anon')));
  v_session UUID := p_session_id;
  v_hit UUID;
  v_uid UUID := p_user_id;
BEGIN
  IF NOT public._valid_client_key(v_key) THEN RETURN NULL; END IF;
  IF v_kind NOT IN ('anon', 'visitor', 'member') THEN v_kind := 'anon'; END IF;
  IF v_uid IS DISTINCT FROM auth.uid() THEN v_uid := auth.uid(); END IF;

  IF v_session IS NULL OR NOT EXISTS (SELECT 1 FROM public.visitor_sessions WHERE id = v_session AND client_key = v_key) THEN
    -- Prefer reuse of open session for this client_key
    SELECT id INTO v_session
    FROM public.visitor_sessions
    WHERE client_key = v_key AND ended_at IS NULL
    ORDER BY last_seen_at DESC
    LIMIT 1;

    IF v_session IS NULL THEN
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
    WHERE id = v_session AND client_key = v_key;
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
  v_session UUID;
  v_client TEXT;
BEGIN
  IF p_hit_id IS NULL OR v_ms <= 0 THEN RETURN; END IF;

  SELECT session_id, client_key INTO v_session, v_client
  FROM public.visitor_hits WHERE id = p_hit_id;

  IF v_client IS NULL THEN RETURN; END IF;

  -- Only allow dwell updates for hits belonging to the claimed session (if provided)
  IF p_session_id IS NOT NULL AND v_session IS DISTINCT FROM p_session_id THEN
    RETURN;
  END IF;

  IF p_session_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.visitor_sessions
    WHERE id = p_session_id AND client_key = v_client
  ) THEN
    RETURN;
  END IF;

  UPDATE public.visitor_hits
  SET dwell_ms = GREATEST(dwell_ms, v_ms)
  WHERE id = p_hit_id;

  IF p_session_id IS NOT NULL THEN
    UPDATE public.visitor_sessions
    SET last_seen_at = NOW(), ended_at = NULL
    WHERE id = p_session_id AND client_key = v_client;
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
  v_path TEXT := public.safe_analytics_path(p_path);
BEGIN
  IF NOT public._valid_client_key(v_key) THEN RETURN; END IF;

  -- Soft rate limit clicks
  IF EXISTS (
    SELECT 1 FROM public.visitor_clicks
    WHERE client_key = v_key AND created_at > NOW() - INTERVAL '400 milliseconds'
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.visitor_clicks (client_key, session_id, path, label, href, target_tag)
  VALUES (
    v_key,
    CASE
      WHEN p_session_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.visitor_sessions s WHERE s.id = p_session_id AND s.client_key = v_key
      ) THEN p_session_id
      ELSE NULL
    END,
    v_path,
    nullif(left(btrim(COALESCE(p_label, '')), 200), ''),
    public.safe_analytics_href(p_href),
    nullif(left(btrim(COALESCE(p_target_tag, '')), 40), '')
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Activity path redaction (redefine track_activity_event path handling)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.track_activity_event(
  p_action TEXT,
  p_status TEXT DEFAULT 'attempt',
  p_actor_kind TEXT DEFAULT 'anon',
  p_actor_label TEXT DEFAULT NULL,
  p_target_type TEXT DEFAULT NULL,
  p_target_id TEXT DEFAULT NULL,
  p_target_label TEXT DEFAULT NULL,
  p_path TEXT DEFAULT NULL,
  p_message TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_meta JSONB DEFAULT '{}'::jsonb,
  p_client_key TEXT DEFAULT NULL,
  p_session_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action TEXT := left(lower(btrim(COALESCE(p_action, ''))), 80);
  v_status TEXT := lower(btrim(COALESCE(p_status, 'attempt')));
  v_kind TEXT := lower(btrim(COALESCE(p_actor_kind, 'anon')));
  v_key TEXT := lower(btrim(COALESCE(p_client_key, '')));
  v_id UUID;
BEGIN
  IF v_action = '' THEN RETURN NULL; END IF;
  IF v_status NOT IN ('attempt', 'success', 'failure') THEN v_status := 'attempt'; END IF;
  IF v_kind NOT IN ('anon', 'visitor', 'member') THEN v_kind := 'anon'; END IF;
  IF v_key <> '' AND v_key !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    v_key := NULL;
  END IF;

  IF v_status = 'attempt' AND v_key IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.activity_events
    WHERE client_key = v_key AND action = v_action AND status = 'attempt'
      AND created_at > NOW() - INTERVAL '2 seconds'
  ) THEN
    RETURN NULL;
  END IF;

  -- Broader abuse cap
  IF v_key IS NOT NULL AND (
    SELECT count(*) FROM public.activity_events
    WHERE client_key = v_key AND created_at > NOW() - INTERVAL '1 minute'
  ) > 40 THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.activity_events (
    action, status, actor_id, actor_kind, actor_label,
    target_type, target_id, target_label, path, message, error_message,
    meta, client_key, session_id
  ) VALUES (
    v_action,
    v_status,
    auth.uid(),
    v_kind,
    nullif(left(btrim(COALESCE(p_actor_label, '')), 160), ''),
    nullif(left(btrim(COALESCE(p_target_type, '')), 40), ''),
    nullif(left(btrim(COALESCE(p_target_id, '')), 80), ''),
    nullif(left(btrim(COALESCE(p_target_label, '')), 200), ''),
    public.safe_analytics_path(p_path),
    nullif(left(btrim(COALESCE(p_message, '')), 400), ''),
    nullif(left(btrim(COALESCE(p_error_message, '')), 800), ''),
    COALESCE(p_meta, '{}'::jsonb),
    v_key,
    p_session_id
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Devis insert rate limit (3 / phone / seller / 24h; 10 / phone / 24h global)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_devis_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone TEXT := regexp_replace(COALESCE(NEW.phone, ''), '\D', '', 'g');
  v_seller UUID := NEW.seller_id;
  v_cnt INT;
BEGIN
  IF length(v_phone) < 6 THEN
    RAISE EXCEPTION 'DEVIS_RATE_LIMIT: invalid phone';
  END IF;

  SELECT count(*)::int INTO v_cnt
  FROM public.devis_requests
  WHERE regexp_replace(COALESCE(phone, ''), '\D', '', 'g') = v_phone
    AND created_at > NOW() - INTERVAL '24 hours';
  IF v_cnt >= 10 THEN
    RAISE EXCEPTION 'DEVIS_RATE_LIMIT: too many requests from this phone';
  END IF;

  IF v_seller IS NOT NULL THEN
    SELECT count(*)::int INTO v_cnt
    FROM public.devis_requests
    WHERE seller_id = v_seller
      AND regexp_replace(COALESCE(phone, ''), '\D', '', 'g') = v_phone
      AND created_at > NOW() - INTERVAL '24 hours';
    IF v_cnt >= 3 THEN
      RAISE EXCEPTION 'DEVIS_RATE_LIMIT: too many requests to this pro';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_devis_rate_limit_trigger ON public.devis_requests;
CREATE TRIGGER enforce_devis_rate_limit_trigger
  BEFORE INSERT ON public.devis_requests
  FOR EACH ROW EXECUTE FUNCTION public.enforce_devis_rate_limit();

-- Contact / partner spam soft limits
CREATE OR REPLACE FUNCTION public.enforce_contact_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT := lower(btrim(COALESCE(NEW.email, '')));
  v_cnt INT;
BEGIN
  IF v_email = '' THEN RETURN NEW; END IF;
  SELECT count(*)::int INTO v_cnt
  FROM public.contact_messages
  WHERE lower(email) = v_email AND created_at > NOW() - INTERVAL '24 hours';
  IF v_cnt >= 5 THEN
    RAISE EXCEPTION 'CONTACT_RATE_LIMIT: too many messages';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_contact_rate_limit_trigger ON public.contact_messages;
CREATE TRIGGER enforce_contact_rate_limit_trigger
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.enforce_contact_rate_limit();

CREATE OR REPLACE FUNCTION public.enforce_partner_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT := lower(btrim(COALESCE(NEW.email, '')));
  v_cnt INT;
BEGIN
  IF v_email = '' THEN RETURN NEW; END IF;
  SELECT count(*)::int INTO v_cnt
  FROM public.partner_requests
  WHERE lower(email) = v_email AND created_at > NOW() - INTERVAL '24 hours';
  IF v_cnt >= 3 THEN
    RAISE EXCEPTION 'PARTNER_RATE_LIMIT: too many requests';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_partner_rate_limit_trigger ON public.partner_requests;
CREATE TRIGGER enforce_partner_rate_limit_trigger
  BEFORE INSERT ON public.partner_requests
  FOR EACH ROW EXECUTE FUNCTION public.enforce_partner_rate_limit();

-- ---------------------------------------------------------------------------
-- Notifications: whitelist types + rate limit
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_notification(
  p_target_user_id UUID,
  p_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_message TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nid UUID;
  v_type TEXT := left(lower(btrim(COALESCE(p_type, ''))), 40);
  v_cnt INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF auth.uid() = p_target_user_id THEN
    RETURN NULL;
  END IF;
  IF p_target_user_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_target_user_id) THEN
    RETURN NULL;
  END IF;
  IF v_type NOT IN (
    'like', 'comment', 'follow', 'mention', 'message', 'devis_reply',
    'partner', 'system', 'save', 'tag', 'inquiry'
  ) THEN
    RAISE EXCEPTION 'invalid notification type';
  END IF;

  SELECT count(*)::int INTO v_cnt
  FROM public.notifications
  WHERE actor_user_id = auth.uid() AND created_at > NOW() - INTERVAL '1 minute';
  IF v_cnt >= 20 THEN
    RAISE EXCEPTION 'notification rate limit';
  END IF;

  INSERT INTO public.notifications (
    actor_user_id, target_user_id, type, entity_type, entity_id, message
  ) VALUES (
    auth.uid(),
    p_target_user_id,
    v_type,
    left(btrim(COALESCE(p_entity_type, '')), 40),
    p_entity_id,
    left(btrim(COALESCE(p_message, '')), 400)
  )
  RETURNING id INTO nid;

  RETURN nid;
END;
$$;

-- ---------------------------------------------------------------------------
-- About HTML: strip scripts/handlers server-side on write
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sanitize_about_html(p_html TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v TEXT := COALESCE(p_html, '');
BEGIN
  IF v = '' THEN RETURN NULL; END IF;
  v := regexp_replace(v, '(?i)<script[\s\S]*?</script>', '', 'g');
  v := regexp_replace(v, '(?i)<iframe[\s\S]*?</iframe>', '', 'g');
  v := regexp_replace(v, '(?i)<object[\s\S]*?</object>', '', 'g');
  v := regexp_replace(v, '(?i)<embed[^>]*>', '', 'g');
  v := regexp_replace(v, '(?i)<link[^>]*>', '', 'g');
  v := regexp_replace(v, '(?i)<meta[^>]*>', '', 'g');
  v := regexp_replace(v, '(?i)\son[a-z]+\s*=\s*("[^"]*"|''[^'']*''|[^\s>]+)', '', 'g');
  v := regexp_replace(v, '(?i)javascript:', '', 'g');
  v := regexp_replace(v, '(?i)data:text/html', '', 'g');
  RETURN left(v, 50000);
END;
$$;

CREATE OR REPLACE FUNCTION public.profiles_sanitize_about()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.about_text IS NOT NULL THEN
    NEW.about_text := public.sanitize_about_html(NEW.about_text);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sanitize_about_trigger ON public.profiles;
CREATE TRIGGER profiles_sanitize_about_trigger
  BEFORE INSERT OR UPDATE OF about_text ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_sanitize_about();

-- ---------------------------------------------------------------------------
-- Profile PII: email never public; phone only when show_phone or owner/mod
-- Exposed as view for safe reads. Table RLS unchanged for app compat;
-- revoke email/phone from anon role at column level.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  cols TEXT;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
  INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name NOT IN ('email', 'phone');

  IF cols IS NULL THEN
    RAISE NOTICE 'profiles columns not found';
  ELSE
    BEGIN
      EXECUTE format('REVOKE SELECT (email, phone) ON public.profiles FROM anon');
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'revoke anon email/phone: %', SQLERRM;
    END;
    -- Keep authenticated able to SELECT (owners, sellers contact UX); client masks for non-owners.
  END IF;
END $$;

CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.cover_photo_url,
  p.bio,
  p.about_text,
  p.profession,
  p.location,
  p.website_url,
  p.profile_type,
  p.institution_kind,
  p.is_verified,
  p.directory_visible,
  p.featured_promoter,
  p.created_at,
  p.updated_at,
  CASE
    WHEN auth.uid() = p.id THEN p.email
    WHEN EXISTS (SELECT 1 FROM public.moderation_admins ma WHERE ma.user_id = auth.uid()) THEN p.email
    ELSE NULL
  END AS email,
  CASE
    WHEN auth.uid() = p.id THEN p.phone
    WHEN EXISTS (SELECT 1 FROM public.moderation_admins ma WHERE ma.user_id = auth.uid()) THEN p.phone
    WHEN COALESCE((SELECT us.show_phone FROM public.user_settings us WHERE us.user_id = p.id LIMIT 1), false) THEN p.phone
    ELSE NULL
  END AS phone
FROM public.profiles p;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Scrub historical analytics paths that still hold query strings
UPDATE public.visitor_hits
SET path = public.safe_analytics_path(path)
WHERE path LIKE '%?%' OR path LIKE '%#%';

UPDATE public.visitor_clicks
SET href = public.safe_analytics_href(href),
    path = public.safe_analytics_path(path)
WHERE COALESCE(href, '') LIKE '%?%' OR COALESCE(href, '') LIKE '%#%' OR path LIKE '%?%' OR path LIKE '%#%';

UPDATE public.activity_events
SET path = public.safe_analytics_path(path)
WHERE path LIKE '%?%' OR path LIKE '%#%';

NOTIFY pgrst, 'reload schema';
