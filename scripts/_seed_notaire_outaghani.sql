-- Single notaire from incomplete batch paste (Kamal Outaghani, Berrechid).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_id UUID := 'b7c4e2a1-0f11-5c22-9d33-0a1a10a1a001'::uuid;
  v_email TEXT := 'notaire-kamal-outaghani@notaires-agadir.sifarah.local';
  v_username TEXT := 'notaire-kamal-outaghani';
  v_name TEXT := 'Kamal Outaghani';
  v_password TEXT := 'Sifarah-notaire-kamal-outaghani-2026!';
  v_phone TEXT := '+212522326667';
  v_contact TEXT := NULL; -- no public email found
  v_address TEXT := 'bd Mohamed V, résidence Essafi, 26100 Berrechid';
  v_bio TEXT := 'Kamal Outaghani, notaire à Berrechid. L''étude reçoit particuliers et professionnels pour sécuriser chaque acte. Ventes, donations, successions, sociétés et authentification d''actes.';
  v_about TEXT := '<h2>Étude de Kamal Outaghani</h2><p>Notaire à Berrechid, Kamal Outaghani accompagne particuliers, familles et entreprises dans la rédaction et l''authentification des actes. L''étude privilégie la clarté des explications, la vérification des pièces et le respect des délais.</p><h3>Domaines d''intervention</h3><ul><li>ventes immobilières et VEFA</li><li>donations et successions</li><li>création et cession de sociétés</li></ul><p>Chaque dossier fait l''objet d''un suivi personnalisé, de la prise de contact jusqu''à la signature et au dépôt des formalités.</p><p><strong>Adresse :</strong> bd Mohamed V, résidence Essafi, 26100 Berrechid</p><p><strong>Tél :</strong> 05 22 32 66 67</p>';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_id) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
      v_email, crypt(v_password, gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'seed_batch', 'notaires_agadir_2026',
        'username', v_username,
        'full_name', v_name,
        'profession', 'Notaire',
        'location', 'Berrechid',
        'profile_type', 'enterprise',
        'internal_category_code', '6.4.1'
      ),
      NOW(), NOW(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      v_id, v_id,
      jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
      'email', v_id::text, NOW(), NOW(), NOW()
    );
  END IF;

  UPDATE public.profiles SET
    username = v_username,
    full_name = v_name,
    profession = 'Notaire',
    location = 'Berrechid',
    bio = v_bio,
    about_text = v_about,
    phone = v_phone,
    email = v_contact,
    avatar_url = '/notaires/notaire-kamal-outaghani.svg',
    profile_type = 'enterprise',
    directory_visible = TRUE,
    is_verified = TRUE,
    verified_at = COALESCE(verified_at, NOW()),
    internal_category_id = (SELECT id FROM public.internal_categories WHERE code = '6.4.1' LIMIT 1),
    updated_at = NOW()
  WHERE id = v_id;

  INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
  SELECT v_id, id, TRUE FROM public.internal_categories WHERE code = '6.4.1' LIMIT 1
  ON CONFLICT DO NOTHING;

  INSERT INTO public.services (
    id, user_id, title, description, category, cover, gallery, kinds, included, options,
    price_mode, zone_mode, cities, region, travel, remote, audiences, missions, internal_category_id
  ) VALUES (
    'b7c4e2a1-0f11-5c22-9d33-0a1a10a1a002'::uuid,
    v_id,
    'Étude notariale - Kamal Outaghani',
    'Accompagnement notarial par Kamal Outaghani à Berrechid : actes de vente, donations, successions, sociétés et authentification. Honoraires selon le barème et la nature du dossier. Prise de rendez-vous sur devis.',
    'Notariat',
    '/notaires/notaire-kamal-outaghani.svg',
    '["/notaires/notaire-kamal-outaghani.svg"]'::jsonb,
    '["Conseil", "Actes"]'::jsonb,
    '["Acte authentique", "Vérification des pièces", "Conseil préalable", "Formalités post-signature"]'::jsonb,
    '[]'::jsonb,
    'devis',
    'villes',
    '["Berrechid"]'::jsonb,
    'Casablanca-Settat',
    FALSE,
    FALSE,
    '["Particuliers", "Professionnels"]'::jsonb,
    '["Sur place", "Sur rendez-vous"]'::jsonb,
    (SELECT id FROM public.internal_categories WHERE code = '6.4.1' LIMIT 1)
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

SELECT username, full_name, location, phone FROM public.profiles WHERE username = 'notaire-kamal-outaghani';
