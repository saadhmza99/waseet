-- BTP News: INTERMAT 2027 — African Summit (1re édition).
DO $$
DECLARE
  uid uuid;
  was_verified boolean;
BEGIN
  SELECT id, is_verified INTO uid, was_verified
  FROM public.profiles
  WHERE username = 'btp-news' AND profile_type = 'institution';

  IF uid IS NULL THEN
    RAISE EXCEPTION 'btp-news institution profile not found';
  END IF;

  UPDATE public.profiles SET is_verified = true WHERE id = uid;

  INSERT INTO public.posts (
    id, user_id, title, description, single_image_url, images,
    likes_count, comments_count, shares_count, is_sponsored, post_type, city,
    created_at, updated_at
  ) VALUES (
    'a8c41e20-7b3d-4f19-9e5a-000000000001'::uuid,
    uid,
    '',
    E'INTERMAT 2027 accueillera, le jeudi 22 avril 2027 à partir de 9h30, la première édition de l''African Summit, un nouveau rendez-vous consacré aux perspectives de développement du secteur de la construction et des infrastructures sur le continent africain.\n\nOrganisé dans le cadre du salon INTERMAT (21-24 avril 2027, Paris-Nord Villepinte), ce sommet réunira industriels, décideurs publics, institutions africaines et experts autour des dynamiques du marché africain : grands chantiers, besoins en infrastructures et perspectives d''investissement sur les vingt prochaines années.\n\nDans un contexte d''urbanisation rapide et de forte croissance démographique, l''Afrique apparaît comme l''un des marchés les plus prometteurs. Plusieurs pays à fort potentiel seront au centre des échanges, dont le Maroc, l''Algérie, l''Égypte, la Côte d''Ivoire, le Sénégal, le Kenya, le Nigeria, l''Afrique du Sud et la Tunisie.\n\nAu programme : priorités de développement des États africains, coopération industrielle et technologique, financement des projets, modernisation des équipements et transition énergétique, avec des sessions de networking pour nouer des partenariats internationaux.\n\nLe programme détaillé et la liste des intervenants seront annoncés prochainement.',
    '/federations/posts/btp-intermat-african-summit.jpg',
    '["/federations/posts/btp-intermat-african-summit.jpg"]'::jsonb,
    0, 0, 0, FALSE, 'standard', 'Paris',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description,
    single_image_url = EXCLUDED.single_image_url,
    images = EXCLUDED.images,
    city = EXCLUDED.city,
    created_at = EXCLUDED.created_at,
    updated_at = NOW();

  UPDATE public.profiles SET is_verified = was_verified WHERE id = uid;
END $$;

SELECT id, left(description, 90) AS excerpt, single_image_url, city, created_at
FROM public.posts
WHERE id = 'a8c41e20-7b3d-4f19-9e5a-000000000001'::uuid;
