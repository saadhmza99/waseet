-- Keep one service per (user_id, internal_category_id); drop thinner duplicates.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, internal_category_id
      ORDER BY
        length(coalesce(description, '')) DESC,
        length(coalesce(title, '')) DESC,
        created_at ASC NULLS LAST,
        id ASC
    ) AS rn
  FROM public.services
  WHERE internal_category_id IS NOT NULL
),
losers AS (
  SELECT id FROM ranked WHERE rn > 1
)
DELETE FROM public.services
WHERE id IN (SELECT id FROM losers);

-- Also collapse exact same title for same owner when category is null on both
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, lower(btrim(title))
      ORDER BY
        CASE WHEN internal_category_id IS NULL THEN 1 ELSE 0 END,
        length(coalesce(description, '')) DESC,
        created_at ASC NULLS LAST,
        id ASC
    ) AS rn
  FROM public.services
),
losers AS (
  SELECT id FROM ranked WHERE rn > 1
)
DELETE FROM public.services
WHERE id IN (SELECT id FROM losers);

SELECT
  (SELECT count(*) FROM public.services) AS services_total,
  (
    SELECT count(*) FROM (
      SELECT 1 FROM public.services
      WHERE internal_category_id IS NOT NULL
      GROUP BY user_id, internal_category_id
      HAVING count(*) > 1
    ) t
  ) AS remaining_cat_dup_groups;
