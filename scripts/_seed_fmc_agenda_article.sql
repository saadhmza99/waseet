-- Latest FMC agenda item as an institution article.
INSERT INTO public.articles (user_id, rubrique, title, excerpt, published_on, url, cover_url)
SELECT
  p.id,
  'AGENDA',
  'Rencontre de la FMC avec le ministre de l’Equipement et de l’Eau autour des enjeux du secteur des matériaux de construction.',
  'Siège du Ministère de l’Équipement et de l’Eau à Rabat',
  '2026-04-27'::date,
  'https://fmc.org.ma/agenda-des-activites/',
  '/federations/articles/fmc-rencontre.jpg'
FROM public.profiles p
WHERE p.username = 'fmc'
  AND p.profile_type = 'institution'
  AND NOT EXISTS (
    SELECT 1
    FROM public.articles a
    WHERE a.user_id = p.id
      AND a.url = 'https://fmc.org.ma/agenda-des-activites/'
      AND a.published_on = '2026-04-27'::date
  );

UPDATE public.articles a
SET cover_url = '/federations/articles/fmc-rencontre.jpg'
FROM public.profiles p
WHERE a.user_id = p.id
  AND p.username = 'fmc'
  AND a.url = 'https://fmc.org.ma/agenda-des-activites/'
  AND a.published_on = '2026-04-27'::date;
