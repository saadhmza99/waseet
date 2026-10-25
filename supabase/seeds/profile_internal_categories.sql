-- Enterprises may hold several concurrent internal categories.
-- profiles.internal_category_id remains the primary (used for post/service history).

CREATE TABLE IF NOT EXISTS public.profile_internal_categories (
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  internal_category_id INTEGER NOT NULL REFERENCES public.internal_categories(id) ON DELETE RESTRICT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, internal_category_id)
);

CREATE INDEX IF NOT EXISTS profile_internal_categories_category_idx
  ON public.profile_internal_categories (internal_category_id);

CREATE UNIQUE INDEX IF NOT EXISTS profile_internal_categories_one_primary_idx
  ON public.profile_internal_categories (profile_id)
  WHERE is_primary;

-- Backfill from the existing single FK.
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT id, internal_category_id, TRUE
FROM public.profiles
WHERE internal_category_id IS NOT NULL
ON CONFLICT (profile_id, internal_category_id) DO NOTHING;

ALTER TABLE public.profile_internal_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profile internal categories are viewable by everyone" ON public.profile_internal_categories;
CREATE POLICY "Profile internal categories are viewable by everyone"
  ON public.profile_internal_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage their internal categories" ON public.profile_internal_categories;
CREATE POLICY "Owners manage their internal categories"
  ON public.profile_internal_categories
  FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

REVOKE ALL ON public.profile_internal_categories FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profile_internal_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_internal_categories TO authenticated;

-- Keep profiles.internal_category_id in sync when the junction primary changes.
CREATE OR REPLACE FUNCTION public.sync_profile_primary_internal_category()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_primary INTEGER;
BEGIN
  v_profile_id := COALESCE(NEW.profile_id, OLD.profile_id);

  SELECT internal_category_id INTO v_primary
  FROM public.profile_internal_categories
  WHERE profile_id = v_profile_id AND is_primary
  LIMIT 1;

  IF v_primary IS NULL THEN
    SELECT internal_category_id INTO v_primary
    FROM public.profile_internal_categories
    WHERE profile_id = v_profile_id
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_primary IS NOT NULL THEN
      UPDATE public.profile_internal_categories
      SET is_primary = TRUE
      WHERE profile_id = v_profile_id AND internal_category_id = v_primary;
    END IF;
  END IF;

  UPDATE public.profiles
  SET internal_category_id = v_primary
  WHERE id = v_profile_id
    AND internal_category_id IS DISTINCT FROM v_primary;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_primary_internal_category ON public.profile_internal_categories;
CREATE TRIGGER trg_sync_profile_primary_internal_category
  AFTER INSERT OR UPDATE OR DELETE ON public.profile_internal_categories
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_primary_internal_category();
