CREATE OR REPLACE FUNCTION public.feed_page(p_limit integer DEFAULT 8, p_offset integer DEFAULT 0)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  description text,
  before_image_url text,
  after_image_url text,
  single_image_url text,
  images jsonb,
  likes_count integer,
  comments_count integer,
  shares_count integer,
  is_sponsored boolean,
  created_at timestamptz,
  post_type text,
  price text,
  surface text,
  beds integer,
  baths integer,
  city text,
  phone text,
  username text,
  full_name text,
  avatar_url text,
  location text,
  profession text,
  is_verified boolean,
  has_more boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $feed$
  WITH args AS (
    SELECT
      GREATEST(COALESCE(p_limit, 8), 0) AS lim,
      GREATEST(COALESCE(p_offset, 0), 0) AS off,
      auth.uid() AS uid
  ),
  mode AS (
    SELECT
      a.lim,
      a.off,
      a.uid,
      (
        a.uid IS NOT NULL
        AND EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id = a.uid)
        AND EXISTS (
          SELECT 1 FROM public.visible_feed_posts v
          WHERE NOT v.from_following OR COALESCE(v.is_verified, false)
        )
      ) AS mix
    FROM args a
  ),
  counts AS (
    SELECT
      m.lim,
      m.off,
      m.uid,
      m.mix,
      CASE WHEN m.mix THEN m.off / 4 ELSE 0 END AS follow_before,
      CASE WHEN m.mix THEN m.off - (m.off / 4) ELSE m.off END AS general_before,
      CASE
        WHEN m.mix THEN (
          SELECT count(*)::integer
          FROM generate_series(m.off, m.off + m.lim - 1) AS s(slot)
          WHERE s.slot % 4 = 3
        )
        ELSE 0
      END AS follow_count
    FROM mode m
  ),
  sized AS (
    SELECT
      c.*,
      CASE WHEN c.mix THEN c.lim - c.follow_count ELSE c.lim END AS general_count
    FROM counts c
  ),
  -- Verified authors stay ahead inside the professional pool. The public stream
  -- opens with a professional, then alternates one institution post. Institution
  -- posts rotate across accounts: newest of each, then the next newest of each.
  general_base AS (
    SELECT
      v.*,
      (pr.profile_type = 'institution') AS is_institution
    FROM public.visible_feed_posts v
    JOIN public.profiles pr ON pr.id = v.user_id
    CROSS JOIN sized s
    WHERE s.general_count > 0
      AND (
        NOT s.mix
        OR NOT v.from_following
        OR COALESCE(v.is_verified, false)
      )
  ),
  institution_turns AS (
    SELECT
      b.id,
      b.user_id,
      row_number() OVER (
        PARTITION BY b.user_id
        ORDER BY b.created_at DESC, b.id DESC
      ) AS author_rn,
      max(b.created_at) OVER (PARTITION BY b.user_id) AS author_latest
    FROM general_base b
    WHERE b.is_institution
  ),
  pool_order AS (
    SELECT
      b.id,
      row_number() OVER (
        ORDER BY COALESCE(b.is_verified, false) DESC, b.created_at DESC, b.id DESC
      ) AS pool_rn
    FROM general_base b
    WHERE NOT b.is_institution
    UNION ALL
    SELECT
      t.id,
      row_number() OVER (
        ORDER BY t.author_rn, t.author_latest DESC, t.user_id, t.id DESC
      ) AS pool_rn
    FROM institution_turns t
  ),
  general_ranked AS (
    SELECT b.*, o.pool_rn
    FROM general_base b
    JOIN pool_order o ON o.id = b.id
  ),
  general_ordered AS (
    SELECT
      r.*,
      CASE
        WHEN NOT r.is_institution AND r.pool_rn = 1 THEN 0
        WHEN r.is_institution THEN r.pool_rn * 2 - 1
        ELSE (r.pool_rn - 1) * 2
      END AS weave
    FROM general_ranked r
  ),
  general_slice AS (
    SELECT q.*, row_number() OVER (ORDER BY q.weave, q.id) - 1 AS local_index
    FROM (
      SELECT g.*
      FROM general_ordered g
      ORDER BY g.weave, g.id
      OFFSET (SELECT general_before FROM sized)
      LIMIT (SELECT general_count FROM sized)
    ) q
  ),
  follow_slice AS (
    SELECT q.*, row_number() OVER (ORDER BY q.created_at DESC, q.id DESC) - 1 AS local_index
    FROM (
      SELECT v.*
      FROM public.visible_feed_posts v
      CROSS JOIN sized s
      WHERE s.mix
        AND s.follow_count > 0
        AND v.from_following
        AND NOT COALESCE(v.is_verified, false)
      ORDER BY v.created_at DESC, v.id DESC
      OFFSET (SELECT follow_before FROM sized)
      LIMIT (SELECT follow_count FROM sized)
    ) q
  ),
  slots AS (
    SELECT
      s.slot,
      CASE WHEN z.mix AND s.slot % 4 = 3 THEN 'follow' ELSE 'general' END AS kind,
      CASE
        WHEN z.mix AND s.slot % 4 = 3 THEN (s.slot / 4) - z.follow_before
        WHEN z.mix THEN (s.slot - (s.slot / 4)) - z.general_before
        ELSE s.slot - z.off
      END AS local_index
    FROM sized z
    CROSS JOIN LATERAL generate_series(z.off, z.off + z.lim - 1) AS s(slot)
    WHERE z.lim > 0
  ),
  picked AS (
    SELECT sl.slot, sl.kind, g.id, g.user_id, g.description, g.before_image_url, g.after_image_url,
      g.single_image_url, g.images, g.likes_count, g.comments_count, g.shares_count, g.is_sponsored,
      g.created_at, g.post_type, g.price, g.surface, g.beds, g.baths, g.city, g.phone,
      g.username, g.full_name, g.avatar_url, g.location, g.profession, g.is_verified
    FROM slots sl
    JOIN general_slice g ON sl.kind = 'general' AND g.local_index = sl.local_index
    UNION ALL
    SELECT sl.slot, sl.kind, f.id, f.user_id, f.description, f.before_image_url, f.after_image_url,
      f.single_image_url, f.images, f.likes_count, f.comments_count, f.shares_count, f.is_sponsored,
      f.created_at, f.post_type, f.price, f.surface, f.beds, f.baths, f.city, f.phone,
      f.username, f.full_name, f.avatar_url, f.location, f.profession, f.is_verified
    FROM slots sl
    JOIN follow_slice f ON sl.kind = 'follow' AND f.local_index = sl.local_index
  ),
  more AS (
    SELECT
      EXISTS (
        SELECT 1
        FROM general_ordered g
        ORDER BY g.weave, g.id
        OFFSET (
          SELECT s.general_before + (SELECT count(*)::integer FROM picked pk WHERE pk.kind = 'general')
          FROM sized s
        )
        LIMIT 1
      )
      OR EXISTS (
        SELECT 1
        FROM public.visible_feed_posts v
        CROSS JOIN sized s
        WHERE s.mix AND v.from_following AND NOT COALESCE(v.is_verified, false)
        ORDER BY v.created_at DESC, v.id DESC
        OFFSET (
          SELECT s.follow_before + (SELECT count(*)::integer FROM picked pk WHERE pk.kind = 'follow')
          FROM sized s
        )
        LIMIT 1
      ) AS has_more
  )
  SELECT
    pk.id,
    pk.user_id,
    pk.description,
    pk.before_image_url,
    pk.after_image_url,
    pk.single_image_url,
    pk.images,
    pk.likes_count,
    pk.comments_count,
    pk.shares_count,
    pk.is_sponsored,
    pk.created_at,
    pk.post_type,
    pk.price,
    pk.surface,
    pk.beds,
    pk.baths,
    pk.city,
    pk.phone,
    pk.username,
    pk.full_name,
    pk.avatar_url,
    pk.location,
    pk.profession,
    pk.is_verified,
    more.has_more
  FROM picked pk
  CROSS JOIN more
  ORDER BY pk.slot;
$feed$;

COMMENT ON FUNCTION public.feed_page(integer, integer) IS
  'Newest visible posts, paged. Accueil opens with a professional, then alternates institution posts one account at a time. Verified professionals stay ahead of other professionals. Signed-in viewers who follow people get one non-verified followed post after every three others.';


REVOKE ALL ON FUNCTION public.feed_page(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.feed_page(integer, integer) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
