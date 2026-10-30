-- Accounts with at least one product get Fournisseurs / Matériaux (8.5.4)
-- in addition to the specialties they already have. Existing primary stays.
-- Skip anyone who already has any fournisseur code (8.5.1–8.5.5).

INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT DISTINCT p.user_id, ic.id, FALSE
FROM public.products p
JOIN public.internal_categories ic ON ic.code = '8.5.4'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.profile_internal_categories pic
  JOIN public.internal_categories existing ON existing.id = pic.internal_category_id
  WHERE pic.profile_id = p.user_id
    AND existing.code LIKE '8.5.%'
)
ON CONFLICT (profile_id, internal_category_id) DO NOTHING;
