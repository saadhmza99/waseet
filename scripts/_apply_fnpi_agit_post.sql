-- FNPI infographic: La FNPI agit pour l'intérêt général.
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
    '17928377-1906-4000-8000-000000000003'::uuid,
    uid,
    '',
    E'La FNPI agit pour l''intérêt général, pour un secteur immobilier structuré, éthique et durable.',
    '/federations/posts/fnpi-agit.jpg',
    '["/federations/posts/fnpi-agit.jpg"]'::jsonb,
    0, 0, 0, FALSE, 'standard', 'Casablanca',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description,
    single_image_url = EXCLUDED.single_image_url,
    images = EXCLUDED.images,
    updated_at = NOW();

  UPDATE public.profiles SET is_verified = was_verified WHERE id = uid;
END $$;

SELECT id, left(description, 80) AS excerpt, single_image_url, created_at
FROM public.posts
WHERE id = '17928377-1906-4000-8000-000000000003'::uuid;
