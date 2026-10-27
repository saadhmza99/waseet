-- Pros with internal categories but no service row yet → one detailed card per specialty.
WITH targets AS (
  SELECT
    p.id AS user_id,
    p.full_name,
    p.location,
    p.bio,
    p.about_text,
    p.avatar_url,
    pic.internal_category_id AS cat_id,
    ic.code AS cat_code,
    coalesce(
      nullif(btrim(ic.detailed_sub_category), ''),
      nullif(btrim(ic.sub_category), ''),
      'Prestation'
    ) AS label
  FROM public.profiles p
  JOIN public.profile_internal_categories pic ON pic.profile_id = p.id
  JOIN public.internal_categories ic ON ic.id = pic.internal_category_id
  WHERE NOT EXISTS (SELECT 1 FROM public.services s WHERE s.user_id = p.id)
)
INSERT INTO public.services (
  id,
  user_id,
  title,
  description,
  category,
  cover,
  gallery,
  kinds,
  included,
  options,
  price_mode,
  amount,
  duration,
  zone_mode,
  cities,
  region,
  travel,
  remote,
  audiences,
  audience_other,
  missions,
  internal_category_id
)
SELECT
  md5(t.user_id::text || ':svc-from-profile:' || coalesce(t.cat_code, t.cat_id::text))::uuid,
  t.user_id,
  left(t.label || ' : prestation sur devis', 120),
  left(
    'Spécialité ' || t.label || '. '
    || coalesce(nullif(btrim(regexp_replace(coalesce(t.about_text, ''), '<[^>]+>', ' ', 'g')), ''), nullif(btrim(t.bio), ''), '')
    || CASE
         WHEN coalesce(nullif(btrim(t.bio), ''), '') <> '' OR coalesce(t.about_text, '') <> '' THEN ' '
         ELSE ''
       END
    || 'Mission portée par ' || coalesce(nullif(btrim(t.full_name), ''), 'l''entreprise')
    || coalesce(' basée à ' || nullif(btrim(split_part(coalesce(t.location, ''), E'\n', 1)), ''), '')
    || '. Prestations sur devis pour particuliers et entreprises : cadrage de la mission, réalisation et suivi jusqu''à livraison.',
    4000
  ),
  t.label,
  nullif(btrim(t.avatar_url), ''),
  CASE
    WHEN nullif(btrim(t.avatar_url), '') IS NULL THEN '[]'::jsonb
    ELSE jsonb_build_array(btrim(t.avatar_url))
  END,
  '["Étude", "Accompagnement"]'::jsonb,
  jsonb_build_array(
    'Conseil et cadrage de la mission',
    'Prestation adaptée au périmètre convenu',
    'Expertise ' || t.label,
    'Suivi jusqu''à livraison de la mission'
  ),
  '["Options sur devis"]'::jsonb,
  'devis',
  NULL,
  NULL,
  'villes',
  CASE
    WHEN nullif(btrim(split_part(coalesce(t.location, ''), E'\n', 1)), '') IS NULL THEN '[]'::jsonb
    ELSE jsonb_build_array(btrim(split_part(t.location, E'\n', 1)))
  END,
  NULL,
  TRUE,
  FALSE,
  '["Particuliers", "Entreprises"]'::jsonb,
  NULL,
  '["National"]'::jsonb,
  t.cat_id
FROM targets t
ON CONFLICT (id) DO NOTHING;

SELECT
  (SELECT count(*) FROM public.services) AS services_total,
  (
    SELECT count(*) FROM public.profiles p
    WHERE (SELECT count(*) FROM public.profile_internal_categories pic WHERE pic.profile_id = p.id) >
          (SELECT count(*) FROM public.services s WHERE s.user_id = p.id)
  ) AS pros_still_short_on_services,
  (
    SELECT count(*) FROM public.profiles p
    WHERE exists (SELECT 1 FROM public.profile_internal_categories pic WHERE pic.profile_id = p.id)
      AND not exists (SELECT 1 FROM public.services s WHERE s.user_id = p.id)
  ) AS pros_with_cats_no_svc;
