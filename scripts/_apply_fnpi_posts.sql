-- FNPI profile posts from their public LinkedIn updates.
-- Dates are relative so the profile shows "il y a 1 semaine" and "il y a 3 jours".
DO $$
DECLARE
  uid uuid;
  was_verified boolean;
BEGIN
  SELECT id, is_verified INTO uid, was_verified
  FROM public.profiles
  WHERE username = 'fnpi' AND profile_type = 'institution';

  IF uid IS NULL THEN
    RAISE EXCEPTION 'fnpi institution profile not found';
  END IF;

  UPDATE public.profiles SET is_verified = true WHERE id = uid;

  INSERT INTO public.posts (
    id, user_id, title, description, single_image_url, images,
    likes_count, comments_count, shares_count, is_sponsored, post_type, city,
    created_at, updated_at
  ) VALUES (
    '75178921-1739-4598-8144-000000000001'::uuid,
    uid,
    '',
    'Plaisir de partager cet extrait de notre revue Al Akaar Infos, mettant en lumière les synergies entre la FNPI et la FNBTP au service du secteur de la construction au Maroc.',
    '/federations/posts/al-akaar.jpg',
    '["/federations/posts/al-akaar.jpg"]'::jsonb,
    0, 0, 0, FALSE, 'standard', 'Casablanca',
    NOW() - interval '7 days',
    NOW() - interval '7 days'
  )
  ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description,
    single_image_url = EXCLUDED.single_image_url,
    images = EXCLUDED.images,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

  INSERT INTO public.posts (
    id, user_id, title, description, single_image_url, images,
    likes_count, comments_count, shares_count, is_sponsored, post_type, city,
    created_at, updated_at
  ) VALUES (
    '75204307-4925-4533-9360-000000000002'::uuid,
    uid,
    '',
    E'Observatoire de l''Immobilier FNPI\nMieux comprendre le marché immobilier marocain, c''est distinguer les dynamiques du logement neuf et de l''ancien et s''appuyer sur des indicateurs fiables pour éclairer les décisions.',
    '/federations/posts/observatoire-1.jpg',
    '["/federations/posts/observatoire-1.jpg","/federations/posts/observatoire-2.jpg","/federations/posts/observatoire-3.jpg","/federations/posts/observatoire-4.jpg"]'::jsonb,
    0, 0, 0, FALSE, 'standard', 'Casablanca',
    NOW() - interval '3 days',
    NOW() - interval '3 days'
  )
  ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description,
    single_image_url = EXCLUDED.single_image_url,
    images = EXCLUDED.images,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

  UPDATE public.profiles SET is_verified = was_verified WHERE id = uid;
END $$;

SELECT left(description, 48) AS excerpt, created_at
FROM public.posts
WHERE id IN (
  '75178921-1739-4598-8144-000000000001'::uuid,
  '75204307-4925-4533-9360-000000000002'::uuid
)
ORDER BY created_at DESC;
