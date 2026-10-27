-- Export promoteur-like profiles for dedup keys
SELECT DISTINCT ON (p.id)
  p.id,
  p.username,
  p.full_name,
  p.email,
  p.website_url,
  lower(btrim(p.full_name)) AS lower_full_name
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
LEFT JOIN public.profile_internal_categories pic ON pic.profile_id = p.id
LEFT JOIN public.internal_categories ic ON ic.id = pic.internal_category_id
LEFT JOIN public.internal_categories ic_primary ON ic_primary.id = p.internal_category_id
WHERE
  p.profession ILIKE '%promotion%'
  OR ic.code = '1.2.1'
  OR ic_primary.code = '1.2.1'
  OR p.username LIKE 'promoteur-%'
  OR (u.raw_user_meta_data->>'source_promoteur_id') IS NOT NULL
  OR (u.raw_user_meta_data->>'seed_batch') ILIKE 'promoteurs%'
ORDER BY p.id, p.username;
