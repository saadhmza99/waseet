-- Latest Industrie du Maroc articles (BTP / industrie).
-- Source: https://industries.ma/category/industrie/btp/

INSERT INTO public.articles (user_id, cover_url, rubrique, title, excerpt, published_on, url)
SELECT
  p.id,
  '/federations/posts/idm-marche-investissement.jpg',
  'Acteurs',
  'Investissement régional : Agadir mobilise la diaspora pour accélérer la transformation économique du Souss-Massa',
  'En mobilisant les compétences et les capitaux de la diaspora, le Souss-Massa cherche à construire un modèle de développement davantage ouvert sur l’investissement productif et les partenariats internationaux.',
  '2026-10-28'::date,
  'https://industries.ma/investissement-regional-agadir-mobilise-la-diaspora-pour-accelerer-la-transformation-economique-du-souss-massa/'
FROM public.profiles p
WHERE p.username = 'industrie-du-maroc'
  AND p.profile_type = 'institution'
  AND NOT EXISTS (
    SELECT 1
    FROM public.articles a
    WHERE a.user_id = p.id
      AND a.url = 'https://industries.ma/investissement-regional-agadir-mobilise-la-diaspora-pour-accelerer-la-transformation-economique-du-souss-massa/'
  );

INSERT INTO public.articles (user_id, cover_url, rubrique, title, excerpt, published_on, url)
SELECT
  p.id,
  'https://industries.ma/wp-content/uploads/2025/07/Foncier-public-pres-de-55-millions-dhectares-desormais-inscrits-au-Domaine-prive-de-lEtat.jpg',
  'Agriculture',
  'Foncier public : 19,7 milliards de dirhams d’investissements pour transformer les territoires',
  'Le Maroc poursuit la mobilisation de son patrimoine foncier public au service du développement économique, avec l’approbation de 114 projets représentant un investissement global de 19,7 milliards de dirhams.',
  '2026-10-28'::date,
  'https://industries.ma/foncier-public-197-milliards-de-dirhams-dinvestissements-pour-transformer-les-territoires/'
FROM public.profiles p
WHERE p.username = 'industrie-du-maroc'
  AND p.profile_type = 'institution'
  AND NOT EXISTS (
    SELECT 1
    FROM public.articles a
    WHERE a.user_id = p.id
      AND a.url = 'https://industries.ma/foncier-public-197-milliards-de-dirhams-dinvestissements-pour-transformer-les-territoires/'
  );
