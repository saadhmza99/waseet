-- App activity / attempt / failure audit trail for admins.
CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'attempt'
    CHECK (status IN ('attempt', 'success', 'failure')),
  actor_id UUID,
  actor_kind TEXT NOT NULL DEFAULT 'anon'
    CHECK (actor_kind IN ('anon', 'visitor', 'member')),
  actor_label TEXT,
  target_type TEXT,
  target_id TEXT,
  target_label TEXT,
  path TEXT,
  message TEXT,
  error_message TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_key TEXT,
  session_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS activity_events_created_idx ON public.activity_events (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_events_action_created_idx ON public.activity_events (action, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_events_status_created_idx ON public.activity_events (status, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_events_actor_created_idx ON public.activity_events (actor_id, created_at DESC);

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

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

  -- Soft rate limit noisy attempts from same client/action.
  IF v_status = 'attempt' AND v_key IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.activity_events
    WHERE client_key = v_key
      AND action = v_action
      AND status = 'attempt'
      AND created_at > NOW() - INTERVAL '2 seconds'
  ) THEN
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
    nullif(left(btrim(COALESCE(p_path, '')), 500), ''),
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

DROP POLICY IF EXISTS "Moderators can view activity events" ON public.activity_events;
CREATE POLICY "Moderators can view activity events"
  ON public.activity_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.moderation_admins ma WHERE ma.user_id = auth.uid())
  );

REVOKE ALL ON FUNCTION public.track_activity_event(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, UUID
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_activity_event(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, UUID
) TO anon, authenticated;
GRANT SELECT ON public.activity_events TO authenticated;

NOTIFY pgrst, 'reload schema';
