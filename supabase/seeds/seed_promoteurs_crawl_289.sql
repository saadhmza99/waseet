-- Crawl-based enrichment for the 2 promoteurs (batch promoteurs_289) absent
-- from promoteurs_immobiliers_15.csv. Safe to re-run. Auth logins untouched.
--
-- Philippe Benisty: crawled 2026-10-22 from lesresidencescarline.ma
-- (homepage: logo, banner, contact email/phone) + site/imonga descriptions.
-- B. Saad: no public company identity exists (private client / maitre
-- d'ouvrage of one villa per S2AER portfolio) -- enriched only with the
-- project facts already in our corpus; no contact data invented.

UPDATE public.profiles SET
  bio = 'Promoteur immobilier à Marrakech — Les Résidences Carline : 32 villas clés en main à Zahrat Annakhil, face à la chaîne de l''Atlas.',
  about_text = 'Authentique marrakchi et promoteur immobilier depuis plusieurs générations, Philippe Benisty développe Les Résidences Carline à Marrakech : 32 luxueuses villas clés en main dans la nouvelle zone touristique de Zahrat Annakhil, face à la chaîne montagneuse de l''Atlas. Résidence fermée et sécurisée 24/7 avec piscine centrale, jardins paysagers et parkings.

Informations
Siège : Annakhil, Marrakech
Projet : Résidence Carline — 32 villas clés en main (Zahrat Annakhil, Marrakech)
Architecte : Douglas Benchetrit',
  avatar_url = 'https://lesresidencescarline.ma/wp-content/uploads/2018/12/logo.png',
  cover_photo_url = 'https://lesresidencescarline.ma/wp-content/uploads/2023/10/bnr1.png',
  location = 'Marrakech',
  phone = '+212661465350',
  email = 'prodevimkech@gmail.com',
  website_url = 'https://lesresidencescarline.ma/',
  updated_at = NOW()
WHERE id = '5fec6fb9-cda8-5179-a4d1-d80cf23cf769'; -- Philippe Benisty

UPDATE public.profiles SET
  bio = 'Maître d''ouvrage à Rabat — Villa haut standing au quartier Les Ambassadeurs.',
  about_text = 'B. Saad est le maître d''ouvrage de la villa haut standing réalisée en 2015 au quartier Les Ambassadeurs à Rabat.

Informations
Ville : Rabat (quartier Les Ambassadeurs)
Projet : Villa haut standing — Les Ambassadeurs (livrée, 2015)
Architecte : Mounia Chaouni
Bureau d''études structure : S2AER',
  location = 'Rabat',
  updated_at = NOW()
WHERE id = 'dc439a7e-024a-5d58-b47e-ab37327ea65d'; -- B. Saad
