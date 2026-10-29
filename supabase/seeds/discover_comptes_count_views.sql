-- Count-only views for Discover Entreprises (independent of list queries).
-- Non-promoteur: directory-visible + full promoteur roster (1.2.1), incl. hidden.
-- Promoteurs chip: featured_promoter only (allowed visibility).

DROP VIEW IF EXISTS public.discover_comptes_promoteurs;
DROP VIEW IF EXISTS public.discover_comptes_all;

CREATE VIEW public.discover_comptes_all
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.profession,
  p.location,
  p.created_at
FROM public.profiles p
WHERE p.username IS NOT NULL
  AND (
    COALESCE(p.directory_visible, false) = true
    OR EXISTS (
      SELECT 1
      FROM public.profile_internal_categories pic
      JOIN public.internal_categories ic ON ic.id = pic.internal_category_id
      WHERE pic.profile_id = p.id
        AND ic.code = '1.2.1'
    )
  );

CREATE VIEW public.discover_comptes_promoteurs
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.profession,
  p.location,
  p.created_at
FROM public.profiles p
WHERE p.username IS NOT NULL
  AND COALESCE(p.featured_promoter, false) = true;

COMMENT ON VIEW public.discover_comptes_all IS
  'Discover Entreprises counts outside the Promoteurs chip: visible directory plus all 1.2.1 promoteurs.';
COMMENT ON VIEW public.discover_comptes_promoteurs IS
  'Discover Entreprises counts for the Promoteurs chip: featured_promoter only.';

GRANT SELECT ON public.discover_comptes_all TO anon, authenticated;
GRANT SELECT ON public.discover_comptes_promoteurs TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
