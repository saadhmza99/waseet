-- Clear lechantier placeholder logos → default avatar (NULL)
UPDATE public.profiles
SET avatar_url = NULL
WHERE avatar_url ILIKE '%lechantier.ma/logo%';

-- Delete duplicate accounts (same full_name, keep the richest profile)
CREATE TEMP TABLE _dup_losers ON COMMIT DROP AS
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY lower(btrim(full_name))
      ORDER BY
        CASE WHEN ice IS NOT NULL AND btrim(ice) <> '' THEN 0 ELSE 1 END,
        CASE
          WHEN avatar_url IS NOT NULL
            AND btrim(avatar_url) <> ''
            AND avatar_url NOT ILIKE '%default-pro%'
            AND avatar_url NOT ILIKE '%lechantier.ma/logo%'
            AND avatar_url NOT ILIKE '%woomar%'
            AND avatar_url NOT ILIKE '%kerix%'
          THEN 0
          ELSE 1
        END,
        CASE WHEN about_text IS NOT NULL AND length(btrim(about_text)) > 40 THEN 0 ELSE 1 END,
        CASE WHEN phone IS NOT NULL AND btrim(phone) <> '' THEN 0 ELSE 1 END,
        CASE WHEN bio IS NOT NULL AND length(btrim(bio)) > 10 THEN 0 ELSE 1 END,
        created_at ASC NULLS LAST,
        id ASC
    ) AS rn
  FROM public.profiles
  WHERE full_name IS NOT NULL AND btrim(full_name) <> ''
)
SELECT id FROM ranked WHERE rn > 1;

UPDATE public.post_reports SET reviewed_by = NULL WHERE reviewed_by IN (SELECT id FROM _dup_losers);
UPDATE public.reel_reports SET reviewed_by = NULL WHERE reviewed_by IN (SELECT id FROM _dup_losers);
UPDATE public.profile_reports SET reviewed_by = NULL WHERE reviewed_by IN (SELECT id FROM _dup_losers);

DELETE FROM public.profiles WHERE id IN (SELECT id FROM _dup_losers);
DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM _dup_losers);
DELETE FROM auth.users WHERE id IN (SELECT id FROM _dup_losers);

SELECT
  (SELECT count(*) FROM _dup_losers) AS deleted_dupes,
  (SELECT count(*) FROM public.profiles WHERE avatar_url ILIKE '%lechantier.ma/logo%') AS remaining_lechantier_avatars,
  (SELECT count(*) FROM (
     SELECT 1 FROM public.profiles
     WHERE full_name IS NOT NULL AND btrim(full_name) <> ''
     GROUP BY lower(btrim(full_name))
     HAVING count(*) > 1
   ) t) AS remaining_dup_name_groups;
