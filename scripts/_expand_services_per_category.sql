-- One detailed service card per internal category (clone richest existing card).
-- Also soften em dashes in profile copy (reads less "AI").

-- 1) Em dashes → colon (bio + about + service titles/descriptions)
UPDATE public.profiles
SET
  bio = replace(bio, '—', ' : '),
  about_text = replace(about_text, '—', ' : ')
WHERE (bio LIKE '%—%' OR about_text LIKE '%—%');

UPDATE public.services
SET
  title = replace(title, '—', ' : '),
  description = replace(description, '—', ' : '),
  category = replace(category, '—', ' : ')
WHERE title LIKE '%—%'
   OR description LIKE '%—%'
   OR category LIKE '%—%';

-- 2) Clone services for missing specialty codes
WITH ranked AS (
  SELECT
    s.*,
    row_number() OVER (
      PARTITION BY s.user_id
      ORDER BY length(coalesce(s.description, '')) DESC,
               length(coalesce(s.title, '')) DESC,
               s.created_at ASC NULLS LAST
    ) AS rn
  FROM public.services s
),
base AS (
  SELECT * FROM ranked WHERE rn = 1
),
needed AS (
  SELECT
    b.user_id,
    b.title AS base_title,
    b.description,
    b.cover,
    b.gallery,
    b.kinds,
    b.included,
    b.options,
    b.price_mode,
    b.amount,
    b.duration,
    b.zone_mode,
    b.cities,
    b.region,
    b.travel,
    b.remote,
    b.audiences,
    b.audience_other,
    b.missions,
    pic.internal_category_id AS cat_id,
    coalesce(nullif(btrim(ic.detailed_sub_category), ''), nullif(btrim(ic.sub_category), ''), 'Prestation') AS label,
    ic.code AS cat_code
  FROM base b
  JOIN public.profile_internal_categories pic ON pic.profile_id = b.user_id
  JOIN public.internal_categories ic ON ic.id = pic.internal_category_id
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.services s2
    WHERE s2.user_id = b.user_id
      AND s2.internal_category_id IS NOT DISTINCT FROM pic.internal_category_id
  )
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
  md5(n.user_id::text || ':svc-cat:' || coalesce(n.cat_code, n.cat_id::text))::uuid,
  n.user_id,
  left(n.label || ' : prestation sur devis', 120),
  CASE
    WHEN n.description IS NULL OR btrim(n.description) = '' THEN
      'Prestation ' || n.label || ' sur devis, avec cadrage de la mission, réalisation et suivi jusqu''à livraison.'
    ELSE
      'Spécialité ' || n.label || '. ' || n.description
  END,
  n.label,
  n.cover,
  n.gallery,
  n.kinds,
  n.included,
  n.options,
  coalesce(nullif(btrim(n.price_mode), ''), 'devis'),
  n.amount,
  n.duration,
  coalesce(nullif(btrim(n.zone_mode), ''), 'villes'),
  n.cities,
  n.region,
  n.travel,
  n.remote,
  n.audiences,
  n.audience_other,
  n.missions,
  n.cat_id
FROM needed n
ON CONFLICT (id) DO NOTHING;

-- Point the original card at primary category when it has none
UPDATE public.services s
SET internal_category_id = pic.internal_category_id
FROM public.profile_internal_categories pic
WHERE s.internal_category_id IS NULL
  AND pic.profile_id = s.user_id
  AND pic.is_primary IS TRUE
  AND NOT EXISTS (
    SELECT 1 FROM public.services s2
    WHERE s2.user_id = s.user_id
      AND s2.id <> s.id
      AND s2.internal_category_id = pic.internal_category_id
  );

SELECT
  (SELECT count(*) FROM public.services) AS services_total,
  (SELECT count(*) FROM public.profiles WHERE bio LIKE '%—%' OR about_text LIKE '%—%') AS profiles_still_emdash,
  (
    SELECT count(*) FROM public.profiles p
    WHERE (SELECT count(*) FROM public.profile_internal_categories pic WHERE pic.profile_id = p.id) >
          (SELECT count(*) FROM public.services s WHERE s.user_id = p.id)
  ) AS pros_still_short_on_services;
