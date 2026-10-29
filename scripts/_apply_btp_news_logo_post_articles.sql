-- BTP News: logo + INTERMAT post cleanup + articles.
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

  UPDATE public.profiles
  SET
    avatar_url = '/federations/btp-news-logo.png',
    is_verified = true
  WHERE id = uid;

  UPDATE public.posts
  SET
    description = E'INTERMAT 2027 accueillera, le jeudi 22 avril 2027 à partir de 9h30, la première édition de l''African Summit, un nouveau rendez-vous consacré aux perspectives de développement du secteur de la construction et des infrastructures sur le continent africain.\n\nOrganisé dans le cadre du salon INTERMAT (21-24 avril 2027, Paris-Nord Villepinte), ce sommet réunira industriels, décideurs publics, institutions africaines et experts autour des dynamiques du marché africain : grands chantiers, besoins en infrastructures et perspectives d''investissement sur les vingt prochaines années.\n\nDans un contexte d''urbanisation rapide et de forte croissance démographique, l''Afrique apparaît comme l''un des marchés les plus prometteurs. Plusieurs pays à fort potentiel seront au centre des échanges, dont le Maroc, l''Algérie, l''Égypte, la Côte d''Ivoire, le Sénégal, le Kenya, le Nigeria, l''Afrique du Sud et la Tunisie.\n\nAu programme : priorités de développement des États africains, coopération industrielle et technologique, financement des projets, modernisation des équipements et transition énergétique, avec des sessions de networking pour nouer des partenariats internationaux.\n\nLe programme détaillé et la liste des intervenants seront annoncés prochainement.',
    updated_at = NOW()
  WHERE id = 'a8c41e20-7b3d-4f19-9e5a-000000000001'::uuid
    AND user_id = uid;

  UPDATE public.profiles SET is_verified = was_verified WHERE id = uid;
END $$;

-- Articles (idempotent by URL)
INSERT INTO public.articles (user_id, cover_url, rubrique, title, excerpt, published_on, url)
SELECT
  p.id,
  'https://www.btpnews.ma/wp-content/uploads/2026/09/Logement.jpg',
  'Actualité Maroc',
  'Aide directe au logement : le gouvernement assouplit les procédures et accorde 60 jours pour finaliser la vente',
  'Le Conseil de gouvernement a approuvé un projet de décret visant à simplifier les démarches des bénéficiaires de l''aide directe au logement et à porter à 60 jours le délai pour conclure l''acte définitif de vente.',
  '2026-09-11'::date,
  'https://www.btpnews.ma/aide-directe-au-logement-le-gouvernement-assouplit-les-procedures-et-accorde-60-jours-pour-finaliser-la-vente/'
FROM public.profiles p
WHERE p.username = 'btp-news'
  AND p.profile_type = 'institution'
  AND NOT EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.user_id = p.id
      AND a.url = 'https://www.btpnews.ma/aide-directe-au-logement-le-gouvernement-assouplit-les-procedures-et-accorde-60-jours-pour-finaliser-la-vente/'
  );

INSERT INTO public.articles (user_id, cover_url, rubrique, title, excerpt, published_on, url)
SELECT
  p.id,
  'https://www.btpnews.ma/wp-content/uploads/2025/09/Manara-Prefa.jpg',
  'BTP Maroc',
  'Secteur BTP : Safi accueille une importante usine préfabriquée Manara Préfa',
  'Une nouvelle unité industrielle dédiée aux produits de construction préfabriqués a été inaugurée à Safi par Manara Préfa, filiale du groupe Manara Holding.',
  '2025-09-20'::date,
  'https://www.btpnews.ma/secteur-btp-safi-accueille-une-importante-usine-prefabriquee-manara-prefa/'
FROM public.profiles p
WHERE p.username = 'btp-news'
  AND p.profile_type = 'institution'
  AND NOT EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.user_id = p.id
      AND a.url = 'https://www.btpnews.ma/secteur-btp-safi-accueille-une-importante-usine-prefabriquee-manara-prefa/'
  );

INSERT INTO public.articles (user_id, cover_url, rubrique, title, excerpt, published_on, url)
SELECT
  p.id,
  'https://www.btpnews.ma/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-26-a-11.59.58_a9e8d1ec.jpg',
  'Actualité Maroc',
  'Les infrastructures sportives du Maroc saluées par la FIFA',
  'Le président de la FIFA, Gianni Infantino, a salué les infrastructures hors pair réalisées par le Maroc, qui propulsent le Royaume parmi l''élite mondiale du football.',
  '2025-07-31'::date,
  'https://www.btpnews.ma/les-infrastructures-sportives-du-maroc-saluees-par-la-fifa/'
FROM public.profiles p
WHERE p.username = 'btp-news'
  AND p.profile_type = 'institution'
  AND NOT EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.user_id = p.id
      AND a.url = 'https://www.btpnews.ma/les-infrastructures-sportives-du-maroc-saluees-par-la-fifa/'
  );

INSERT INTO public.articles (user_id, cover_url, rubrique, title, excerpt, published_on, url)
SELECT
  p.id,
  'https://www.btpnews.ma/wp-content/uploads/2025/07/CENTRE-DE-FORMATION-LAAYOUNE.jpg',
  'Actualité Maroc',
  'Laâyoune : 130 MDH investis dans des projets d''infrastructures urbaines et sportives',
  'À l''occasion du 26e anniversaire de la Fête du Trône, une série de projets structurants ont été lancés à Laâyoune pour un budget global de 130 millions de dirhams.',
  '2025-07-30'::date,
  'https://www.btpnews.ma/laayoune-130-mdh-investis-dans-des-projets-dinfrastructures-urbaines-et-sportives/'
FROM public.profiles p
WHERE p.username = 'btp-news'
  AND p.profile_type = 'institution'
  AND NOT EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.user_id = p.id
      AND a.url = 'https://www.btpnews.ma/laayoune-130-mdh-investis-dans-des-projets-dinfrastructures-urbaines-et-sportives/'
  );

INSERT INTO public.articles (user_id, cover_url, rubrique, title, excerpt, published_on, url)
SELECT
  p.id,
  'https://www.btpnews.ma/wp-content/uploads/2025/07/btp.jpg',
  'Actualité Maroc',
  'Coupe du Monde 2030 : une aubaine pour le BTP et les infrastructures au Maroc',
  'L''organisation conjointe de la Coupe du Monde 2030 par le Maroc, l''Espagne et le Portugal constitue un formidable levier pour le développement du secteur du BTP au Royaume.',
  '2025-07-21'::date,
  'https://www.btpnews.ma/coupe-du-monde-2030-une-aubaine-pour-le-btp-et-les-infrastructures-au-maroc/'
FROM public.profiles p
WHERE p.username = 'btp-news'
  AND p.profile_type = 'institution'
  AND NOT EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.user_id = p.id
      AND a.url = 'https://www.btpnews.ma/coupe-du-monde-2030-une-aubaine-pour-le-btp-et-les-infrastructures-au-maroc/'
  );

INSERT INTO public.articles (user_id, cover_url, rubrique, title, excerpt, published_on, url)
SELECT
  p.id,
  'https://www.btpnews.ma/wp-content/uploads/2025/06/89420214-63221379.webp',
  'Avis d''Expert',
  'Le BTP marocain entre relance, consolidation et durabilité : un secteur en pleine transformation',
  'Porté par une reprise vigoureuse, des investissements publics stratégiques et une reconfiguration industrielle, le BTP s''affirme comme un levier central du développement national.',
  '2025-06-30'::date,
  'https://www.btpnews.ma/le-btp-marocain-entre-relance-consolidation-et-durabilite-un-secteur-en-pleine-transformation/'
FROM public.profiles p
WHERE p.username = 'btp-news'
  AND p.profile_type = 'institution'
  AND NOT EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.user_id = p.id
      AND a.url = 'https://www.btpnews.ma/le-btp-marocain-entre-relance-consolidation-et-durabilite-un-secteur-en-pleine-transformation/'
  );

SELECT left(description, 80) AS post_excerpt
FROM public.posts
WHERE id = 'a8c41e20-7b3d-4f19-9e5a-000000000001'::uuid;

SELECT username, avatar_url
FROM public.profiles
WHERE username = 'btp-news';

SELECT title, rubrique, published_on, url
FROM public.articles a
JOIN public.profiles p ON p.id = a.user_id
WHERE p.username = 'btp-news'
ORDER BY published_on DESC NULLS LAST;
