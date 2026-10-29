-- Institution profiles. Password: Sifarah-{username}-2026!
-- Login email: {username}@sifarah.local
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

DELETE FROM public.formations WHERE user_id IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = 'institutions_sifarah'
);
DELETE FROM public.articles WHERE user_id IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = 'institutions_sifarah'
);
DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = 'institutions_sifarah'
);
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = 'institutions_sifarah'
);
DELETE FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = 'institutions_sifarah';

DO $$
DECLARE
  rec record;
  new_id uuid;
  auth_email text;
  pwd text;
  job_title text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.username IN (
      'fnpi','onigt','ordre-architectes-centre','fmci','fnbtp','cgem','anrf','btp-news',
      'industrie-du-maroc','fmc','unim','filec','ordre-national-architectes',
      'ordre-architectes-nord','ordre-architectes-sud','ordre-architectes-oriental',
      'ordre-national-notaires','ccis-casablanca-settat','chambre-artisanat',
      'ministere-habitat-urbanisme','ministere-equipement','ancfcc',
      'centres-regionaux-investissement','leconomiste','medias24','challenge',
      'la-vie-eco','les-inspirations-eco','cetemco','hcp'
    )
  ) THEN
    RAISE EXCEPTION 'institution username already taken';
  END IF;

  FOR rec IN
    SELECT *
    FROM (VALUES
      ('fnpi', 'FNPI', 'federation', 'Casablanca', 'https://www.fnpimaroc.net', 'fnpi@fnpi.ma', '+212 522 985 979', 'Fédération nationale des promoteurs immobiliers.'),
      ('onigt', 'ONIGT', 'order', 'Rabat', 'https://www.onigt.org', NULL, NULL, 'Ordre national des ingénieurs géomètres topographes.'),
      ('ordre-architectes-centre', 'Conseil régional de l''Ordre des architectes du Centre', 'order', 'Casablanca', 'https://ordrearchicentre.org', 'crcsecretariat@ordrearchicentre.org', '0522294109', 'Conseil régional de l''Ordre des architectes du Centre.'),
      ('fmci', 'FMCI', 'federation', 'Maroc', 'https://www.fmci.ma', NULL, NULL, 'Fédération marocaine du conseil et de l''ingénierie.'),
      ('fnbtp', 'FNBTP', 'federation', 'Casablanca', 'https://fnbtp.ma', 'contact@fnbtp.ma', '+212 522 20 02 69', 'Fédération nationale du bâtiment et des travaux publics.'),
      ('cgem', 'CGEM', 'federation', 'Casablanca', 'https://www.cgem.ma', NULL, NULL, 'Confédération générale des entreprises du Maroc.'),
      ('anrf', 'ANRF', 'public', 'Rabat', 'https://www.anrf.gov.ma', NULL, NULL, 'Autorité nationale du renseignement financier.'),
      ('btp-news', 'BTP News', 'media', 'Maroc', 'https://www.btpnews.ma', NULL, NULL, 'Presse du bâtiment et des travaux publics.'),
      ('industrie-du-maroc', 'Industrie du Maroc', 'media', 'Casablanca', 'https://industries.ma', NULL, NULL, 'Presse de l''industrie au Maroc.'),
      ('fmc', 'FMC', 'federation', 'Casablanca', 'https://fmc.org.ma', 'fmc@fmc.org.ma', '+212 522 39 54 51', 'Fédération des industries des matériaux de construction.'),
      ('unim', 'UNIM', 'federation', 'Rabat', 'https://unim.org.ma', NULL, '+212 537 681674', 'Union nationale des ingénieurs marocains.'),
      ('filec', 'FILEC', 'federation', 'Maroc', NULL, NULL, NULL, 'Fédération interprofessionnelle des laboratoires d''essais et de contrôle.'),
      ('ordre-national-architectes', 'Ordre national des architectes', 'order', 'Rabat', 'https://cnoa.ma', NULL, '+212 537 26 29 82', 'Ordre national des architectes.'),
      ('ordre-architectes-nord', 'Conseil régional de l''Ordre des architectes du Nord', 'order', 'Tanger', NULL, NULL, NULL, 'Conseil régional de l''Ordre des architectes du Nord.'),
      ('ordre-architectes-sud', 'Conseil régional de l''Ordre des architectes du Sud', 'order', 'Agadir', NULL, NULL, NULL, 'Conseil régional de l''Ordre des architectes du Sud.'),
      ('ordre-architectes-oriental', 'Conseil régional de l''Ordre des architectes de l''Oriental', 'order', 'Oujda', NULL, NULL, NULL, 'Conseil régional de l''Ordre des architectes de l''Oriental.'),
      ('ordre-national-notaires', 'Ordre national des notaires', 'order', 'Rabat', 'https://notaires.org.ma', NULL, NULL, 'Ordre national des notaires.'),
      ('ccis-casablanca-settat', 'CCIS Casablanca-Settat', 'chamber', 'Casablanca', 'https://cciscs.ma', 'contact@cciscs.ma', '+212 522 29 31 81', 'Chambre de commerce, d''industrie et de services de Casablanca-Settat.'),
      ('chambre-artisanat', 'Chambre d''artisanat', 'chamber', 'Maroc', NULL, NULL, NULL, 'Chambre d''artisanat.'),
      ('ministere-habitat-urbanisme', 'Ministère de l''Habitat et de l''urbanisme', 'public', 'Rabat', NULL, NULL, NULL, 'Ministère de l''Habitat et de l''urbanisme.'),
      ('ministere-equipement', 'Ministère de l''Équipement', 'public', 'Rabat', 'https://www.equipement.gov.ma', NULL, NULL, 'Ministère de l''Équipement.'),
      ('ancfcc', 'ANCFCC', 'public', 'Rabat', 'https://www.ancfcc.gov.ma', NULL, '+212 530 14 1414', 'Agence nationale de la conservation foncière, du cadastre et de la cartographie.'),
      ('centres-regionaux-investissement', 'Centres régionaux d''investissement', 'public', 'Maroc', NULL, NULL, NULL, 'Centres régionaux d''investissement.'),
      ('leconomiste', 'L''Économiste', 'media', 'Casablanca', 'https://www.leconomiste.com', NULL, NULL, 'Quotidien économique.'),
      ('medias24', 'Médias24', 'media', 'Casablanca', 'https://medias24.com', NULL, NULL, 'Presse économique.'),
      ('challenge', 'Challenge', 'media', 'Casablanca', 'https://www.challenge.ma', NULL, NULL, 'Presse économique.'),
      ('la-vie-eco', 'La Vie Éco', 'media', 'Casablanca', 'https://www.lavieeco.com', NULL, NULL, 'Presse économique.'),
      ('les-inspirations-eco', 'Les Inspirations Éco', 'media', 'Casablanca', 'https://leseco.ma', NULL, NULL, 'Presse économique.'),
      ('cetemco', 'CETEMCO', 'observatory', 'Casablanca', 'https://www.cetemco.org', NULL, NULL, 'Centre des techniques et matériaux de construction.'),
      ('hcp', 'Haut-Commissariat au Plan', 'observatory', 'Rabat', 'https://www.hcp.ma', NULL, NULL, 'Haut-Commissariat au Plan.')
    ) AS t(username, full_name, kind, location, website, email, phone, bio)
  LOOP
    new_id := gen_random_uuid();
    auth_email := rec.username || '@sifarah.local';
    pwd := 'Sifarah-' || rec.username || '-2026!';
    job_title := CASE rec.kind
      WHEN 'federation' THEN 'Fédération'
      WHEN 'order' THEN 'Ordre'
      WHEN 'chamber' THEN 'Chambre'
      WHEN 'public' THEN 'Organisme public'
      WHEN 'media' THEN 'Presse'
      WHEN 'observatory' THEN 'Observatoire'
    END;

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_id,
      'authenticated',
      'authenticated',
      auth_email,
      crypt(pwd, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'seed_batch', 'institutions_sifarah',
        'username', rec.username,
        'full_name', rec.full_name,
        'profession', job_title,
        'location', rec.location,
        'bio', rec.bio,
        'phone', coalesce(rec.phone, ''),
        'profile_type', 'institution',
        'institution_kind', rec.kind
      ),
      NOW(),
      NOW(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      new_id,
      new_id,
      jsonb_build_object(
        'sub', new_id::text,
        'email', auth_email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      new_id::text,
      NOW(),
      NOW(),
      NOW()
    );

    UPDATE public.profiles
    SET
      username = rec.username,
      full_name = rec.full_name,
      profession = job_title,
      location = rec.location,
      bio = rec.bio,
      phone = rec.phone,
      email = coalesce(rec.email, auth_email),
      website_url = rec.website,
      profile_type = 'institution',
      institution_kind = rec.kind,
      is_verified = true,
      directory_visible = true,
      featured_promoter = false,
      updated_at = NOW()
    WHERE id = new_id;
  END LOOP;
END $$;

UPDATE public.profiles
SET
  avatar_url = '/federations/' || username || '.jpg',
  avatar_updated_at = NOW(),
  updated_at = NOW()
WHERE profile_type = 'institution'
  AND username IN ('cgem', 'filec', 'fmc', 'fmci', 'fnbtp', 'fnpi', 'unim');

COMMIT;

SELECT full_name, institution_kind, username
FROM public.profiles
WHERE id IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = 'institutions_sifarah'
)
ORDER BY full_name;
