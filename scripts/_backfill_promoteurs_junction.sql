-- Backfill profile_internal_categories for promoteurs (code 1.2.1).
-- Découvrir filters via this junction (!inner), not profiles.internal_category_id alone.
BEGIN;

INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT
  p.id,
  ic.id,
  NOT EXISTS (
    SELECT 1
    FROM public.profile_internal_categories x
    WHERE x.profile_id = p.id AND x.is_primary
  )
FROM public.profiles p
JOIN public.internal_categories ic
  ON ic.id = p.internal_category_id AND ic.code = '1.2.1'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.profile_internal_categories pic
  WHERE pic.profile_id = p.id AND pic.internal_category_id = ic.id
)
ON CONFLICT (profile_id, internal_category_id) DO NOTHING;

COMMIT;
