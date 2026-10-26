-- Purge incomplete / scam seed profiles, then clean remaining lc-* copy.

CREATE TEMP TABLE doomed_profiles ON COMMIT DROP AS
SELECT id, username
FROM public.profiles
WHERE ice IS NULL OR btrim(ice) = ''
   OR bio ILIKE '%gamatogel%'
   OR bio ILIKE '%toto macau%'
   OR bio ILIKE '%live draw%'
   OR bio ILIKE '%pack visibilité%'
   OR about_text ILIKE '%gamatogel%'
   OR about_text ILIKE '%university education wordpress%'
   OR about_text ILIKE '%pack visibilité%'
   OR btrim(coalesce(bio, '')) IN ('|', '||', '-', '—')
   OR btrim(coalesce(about_text, '')) IN ('|', '||', '-', '—');

-- Break social / engagement links first (often RESTRICT / SET NULL varies).
DELETE FROM public.follows f USING doomed_profiles d WHERE f.follower_id = d.id OR f.following_id = d.id;
DELETE FROM public.reviews r USING doomed_profiles d WHERE r.user_id = d.id OR r.reviewer_id = d.id;
DELETE FROM public.post_likes pl USING doomed_profiles d WHERE pl.user_id = d.id;
DELETE FROM public.post_comments pc USING doomed_profiles d WHERE pc.user_id = d.id;
DELETE FROM public.inquiries i USING doomed_profiles d WHERE i.seller_id = d.id OR i.sender_id = d.id;

DELETE FROM public.services s USING doomed_profiles d WHERE s.user_id = d.id;
DELETE FROM public.realisations r USING doomed_profiles d WHERE r.user_id = d.id;
DELETE FROM public.posts p USING doomed_profiles d WHERE p.user_id = d.id;
DELETE FROM public.listings l USING doomed_profiles d WHERE l.user_id = d.id;
DELETE FROM public.products pr USING doomed_profiles d WHERE pr.user_id = d.id;
DELETE FROM public.portfolio_items pi USING doomed_profiles d WHERE pi.user_id = d.id;
DELETE FROM public.projects pj USING doomed_profiles d WHERE pj.user_id = d.id;
DELETE FROM public.properties prop USING doomed_profiles d WHERE prop.user_id = d.id;
DELETE FROM public.reels rl USING doomed_profiles d WHERE rl.user_id = d.id;
DELETE FROM public.profile_internal_categories pic USING doomed_profiles d WHERE pic.profile_id = d.id;

DELETE FROM public.profiles p USING doomed_profiles d WHERE p.id = d.id;
DELETE FROM auth.identities i USING doomed_profiles d WHERE i.user_id = d.id;
DELETE FROM auth.users u USING doomed_profiles d WHERE u.id = d.id;

UPDATE public.profiles p
SET
  bio = NULLIF(
    left(
      trim(both ' —' FROM concat_ws(
        ' — ',
        NULLIF(btrim(coalesce(p.profession, '')), ''),
        NULLIF(btrim(coalesce(p.location, '')), '')
      )),
      251
    ),
    ''
  ),
  about_text = format(
    '<p><strong>%s</strong>%s%s.</p><p>Profil professionnel sur Sifarah — contactez cette entreprise pour vos projets.</p>',
    replace(coalesce(NULLIF(btrim(p.full_name), ''), p.username), '''', '&#39;'),
    CASE
      WHEN NULLIF(btrim(coalesce(p.profession, '')), '') IS NOT NULL
        THEN ' · ' || replace(btrim(p.profession), '''', '&#39;')
      ELSE ''
    END,
    CASE
      WHEN NULLIF(btrim(coalesce(p.location, '')), '') IS NOT NULL
        THEN ' · ' || replace(btrim(p.location), '''', '&#39;')
      ELSE ''
    END
  ),
  updated_at = NOW()
WHERE p.username LIKE 'lc-%'
  AND p.ice IS NOT NULL
  AND btrim(p.ice) <> '';

SELECT
  (SELECT count(*)::int FROM public.profiles) AS profiles_left,
  (SELECT count(*)::int FROM public.profiles WHERE ice IS NULL OR btrim(ice) = '') AS still_no_ice,
  (SELECT count(*)::int FROM public.profiles WHERE username LIKE 'lc-%') AS seed_left,
  (SELECT count(*)::int FROM public.profiles WHERE bio ILIKE '%gamatogel%' OR about_text ILIKE '%gamatogel%') AS still_scam_bio;
