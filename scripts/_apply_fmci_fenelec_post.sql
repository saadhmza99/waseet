-- FMCI post: signature of the FMCI / FENELEC partnership, 24 September 2026.
DO $$
DECLARE
  uid uuid;
  was_verified boolean;
BEGIN
  SELECT id, is_verified INTO uid, was_verified
  FROM public.profiles
  WHERE username = 'fmci' AND profile_type = 'institution';

  IF uid IS NULL THEN
    RAISE EXCEPTION 'fmci institution profile not found';
  END IF;

  UPDATE public.profiles SET is_verified = true WHERE id = uid;

  INSERT INTO public.posts (
    id, user_id, title, description, single_image_url, images,
    likes_count, comments_count, shares_count, is_sponsored, post_type, city,
    created_at, updated_at
  ) VALUES (
    '20260924-0000-4000-8000-000000000004'::uuid,
    uid,
    'Signature de la convention de partenariat FMCI/FENELEC',
    E'Signature de la convention de partenariat FMCI/FENELEC\nCe fut un immense plaisir de voir deux importantes fédérations de notre pays : la Fédération Marocaine du Conseil et de l''Ingénierie et la FENELEC se rencontrer pour identifier, développer et faire fructifier les synergies entre leurs ambitions citoyennes respectives. Les enjeux de productivité, de performance de conformité normative, d’innovation, d’excellence, de co construction de proximité de souveraineté… ont ponctué les échanges précédant le moment fort de signature de la convention de partenariat que le Président de la FMCI a eu le plaisir d’acter avec son ami M. Ali El Harti président de la FENELEC. Ces échanges spontanés consistants et pertinents entre les instances des deux fédérations annoncent d’emblée un partenariat prometteur. Bon vent donc à ce partenariat, qui s’inscrit pleinement dans la dynamique de transformation et de montée en puissance que connaît l’industrie marocaine, ayant fait le choix stratégique et historique de s’appuyer durablement sur l’ingénierie nationale. Un engagement qui contribue à bâtir un Maroc plus performant, souverain et rayonnant.',
    '/federations/posts/fmci-fenelec.jpg',
    '["/federations/posts/fmci-fenelec.jpg"]'::jsonb,
    0, 0, 0, FALSE, 'standard', 'Maroc',
    '2026-09-24 10:00:00+00',
    '2026-09-24 10:00:00+00'
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    single_image_url = EXCLUDED.single_image_url,
    images = EXCLUDED.images,
    city = EXCLUDED.city,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

  UPDATE public.profiles SET is_verified = was_verified WHERE id = uid;
END $$;

SELECT left(description, 70) AS caption, created_at, single_image_url
FROM public.posts
WHERE id = '20260924-0000-4000-8000-000000000004'::uuid;
