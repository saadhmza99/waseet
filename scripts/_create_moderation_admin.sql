-- Upsert moderation admin WITHOUT embedding secrets in git.
-- Usage (PowerShell):
--   $env:SIFARAH_ADMIN_EMAIL = 'you@example.com'
--   $env:SIFARAH_ADMIN_PASSWORD = 'long-random-password'
--   supabase db query --linked -f scripts/_create_moderation_admin.sql
--
-- Or pass literals via psql variables. Never commit real passwords.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_id UUID := 'b0a01111-1111-5111-8111-111111111101'::uuid;
  v_email TEXT := nullif(current_setting('app.admin_email', true), '');
  v_password TEXT := nullif(current_setting('app.admin_password', true), '');
  v_username TEXT := 'admin';
BEGIN
  IF v_email IS NULL OR v_password IS NULL THEN
    RAISE EXCEPTION
      'Set app.admin_email and app.admin_password before running (never hardcode secrets in this file). Example: SELECT set_config(''app.admin_email'', ''admin@example.com'', false);';
  END IF;

  IF length(v_password) < 12 THEN
    RAISE EXCEPTION 'Admin password must be at least 12 characters';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_id) THEN
    IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(v_email)) THEN
      SELECT id INTO v_id FROM auth.users WHERE lower(email) = lower(v_email) LIMIT 1;
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_id) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'username', v_username,
        'full_name', 'Sifarah Admin',
        'profile_type', 'enterprise'
      ),
      NOW(),
      NOW(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_id,
      v_id,
      jsonb_build_object(
        'sub', v_id::text,
        'email', v_email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      v_id::text,
      NOW(),
      NOW(),
      NOW()
    );
  ELSE
    UPDATE auth.users
    SET
      email = v_email,
      encrypted_password = crypt(v_password, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
        'username', v_username,
        'full_name', 'Sifarah Admin',
        'profile_type', 'enterprise'
      ),
      updated_at = NOW()
    WHERE id = v_id;

    UPDATE auth.identities
    SET
      identity_data = COALESCE(identity_data, '{}'::jsonb) || jsonb_build_object(
        'sub', v_id::text,
        'email', v_email,
        'email_verified', true
      ),
      updated_at = NOW()
    WHERE user_id = v_id AND provider = 'email';
  END IF;

  INSERT INTO public.profiles (id, username, full_name, email, profile_type, is_verified)
  VALUES (v_id, v_username, 'Sifarah Admin', v_email, 'enterprise', true)
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    profile_type = COALESCE(public.profiles.profile_type, EXCLUDED.profile_type),
    is_verified = true;

  INSERT INTO public.moderation_admins (user_id)
  VALUES (v_id)
  ON CONFLICT DO NOTHING;
END $$;

SELECT u.email, p.username,
       EXISTS (SELECT 1 FROM public.moderation_admins ma WHERE ma.user_id = u.id) AS is_moderator
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.id = 'b0a01111-1111-5111-8111-111111111101'::uuid;
