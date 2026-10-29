CREATE OR REPLACE VIEW public.visible_feed_posts
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.user_id,
  p.description,
  p.before_image_url,
  p.after_image_url,
  p.single_image_url,
  p.images,
  p.likes_count,
  p.comments_count,
  p.shares_count,
  p.is_sponsored,
  p.created_at,
  p.post_type,
  p.price,
  p.surface,
  p.beds,
  p.baths,
  COALESCE(NULLIF(btrim(p.city), ''), NULLIF(btrim(p.property_details->>'city'), '')) AS city,
  COALESCE(
    (
      SELECT btrim(item)
      FROM jsonb_array_elements_text(
        CASE
          WHEN jsonb_typeof(p.property_details->'phones') = 'array' THEN p.property_details->'phones'
          ELSE '[]'::jsonb
        END
      ) AS item
      WHERE length(regexp_replace(item, '\D', '', 'g')) >= 6
      LIMIT 1
    ),
    NULLIF(btrim(pr.phone), '')
  ) AS phone,
  pr.username,
  pr.full_name,
  pr.avatar_url,
  pr.location,
  pr.profession,
  pr.is_verified,
  EXISTS (
    SELECT 1
    FROM public.follows f
    WHERE f.follower_id = auth.uid()
      AND f.following_id = p.user_id
  ) AS from_following
FROM public.posts p
JOIN public.profiles pr ON pr.id = p.user_id
WHERE NOT EXISTS (
  SELECT 1
  FROM public.blocked_users b
  WHERE b.blocker_id = auth.uid()
    AND b.blocked_id = p.user_id
)
AND NOT EXISTS (
  SELECT 1
  FROM public.muted_accounts m
  WHERE m.muter_id = auth.uid()
    AND m.muted_id = p.user_id
    AND m.mute_posts
);

COMMENT ON VIEW public.visible_feed_posts IS
  'Posts the current viewer can see. Blocked authors and muted accounts are excluded. Institution posts stay in this organic feed and on the profile.';

NOTIFY pgrst, 'reload schema';

SELECT username, is_verified, left(description, 40) AS excerpt, created_at,
  row_number() OVER (
    ORDER BY COALESCE(is_verified, false) DESC, created_at DESC, id DESC
  ) AS organic_rank
FROM public.visible_feed_posts
WHERE id IN (
  '75178921-1739-4598-8144-000000000001'::uuid,
  '75204307-4925-4533-9360-000000000002'::uuid
);
