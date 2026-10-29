-- FMCI post: 14th SISTEP IMME salon, 9 September 2026.
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
    '20260909-0000-4000-8000-000000000005'::uuid,
    uid,
    '14ème édition du Salon SISTEP IMME 2026',
    E'14ème édition du Salon SISTEP IMME 2026\nL’ingénierie nationale représentée par la Fédération Marocaine du Conseil et de l''Ingénierie et ses membres a été particulièrement ravie de participer en tant que partenaire institutionnel de la FIMME - Fédération des Industries Métallurgiques, Mécaniques et Electromécaniques et des éco systèmes industriels aux activités du salon SISTEP 2026 tenu à Casablanca. Des experts et acteurs de l’ingénierie ont été systématiquement programmes et invites pour modérer et participer aux échanges des différents panels hautement stratégiques qu’ a connus le programme scientifique du salon. prévention des risques, économie circulaire, durabilité, résilience, maintenance, … tels étaient quelques mots clé des thématiques abordées par le riche programme des panels. L’industrie navale, ses enjeux et ses perspectives était aussi à l’ordre du jour à travers une pleiniere et des ateliers ou des idées issues de réflexions nationales et internationales ont été largement échangées. Des experts locaux et étrangers partenaires de la Fédération Marocaine du Conseil et de l''Ingénierie y étaient parmi les panelistes L’évolution des textes réglementaires, leur pertinence, cohérence et synchronisation et arrimage universel ont été aussi débattus dans un panel ou le Président de la FMCI a eu le plaisir d’y participer. L’un de nos membres : JESA S.A a été également primé par un trophée prestigieux a l’instar des deux autres collèges : celui de l’industrie Holcim Maroc et de l’assurance @atlanta sanad Le stand Fédération Marocaine du Conseil et de l''Ingénierie et son académie IPA orientée éco systèmes ont accueilli avec beaucoup d’intérêt les visiteurs et leurs questionnements et réflexions. Bravo encore une fois à la FIMME - Fédération des Industries Métallurgiques, Mécaniques et Electromécaniques , au GIPSI et tous les autres co organisateurs pour la réussite de cette formidable agora inédite des éco systèmes industriels. Merci pour nos membres qui ont contribué aux activités de la FMCI et honoré l’ingénierie nationale : JESA S.A LABORATOIRE PUBLIC D''ESSAIS ET D''ETUDES (LPEE) CNAPP IDAFA Green wave OMGC SERD …',
    '/federations/posts/fmci-sistep-1.jpg',
    '["/federations/posts/fmci-sistep-1.jpg","/federations/posts/fmci-sistep-2.jpg"]'::jsonb,
    0, 0, 0, FALSE, 'standard', 'Casablanca',
    '2026-09-09 10:00:00+00',
    '2026-09-09 10:00:00+00'
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

SELECT left(description, 60) AS caption, created_at, jsonb_array_length(images) AS photos
FROM public.posts
WHERE id = '20260909-0000-4000-8000-000000000005'::uuid;
