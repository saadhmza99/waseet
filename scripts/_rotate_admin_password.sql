-- One-shot: rotate known admin account password (no password stored in repo).
-- Set via: SELECT set_config('app.admin_password', '<new>', false);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_id UUID := 'b0a01111-1111-5111-8111-111111111101'::uuid;
  v_email TEXT := 'adminhamza99@sifarah.com.local';
  v_password TEXT := nullif(current_setting('app.admin_password', true), '');
BEGIN
  IF v_password IS NULL OR length(v_password) < 12 THEN
    RAISE EXCEPTION 'Set app.admin_password (min 12 chars) before running';
  END IF;

  UPDATE auth.users
  SET
    email = v_email,
    encrypted_password = crypt(v_password, gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
  WHERE id = v_id OR lower(email) IN (lower(v_email), 'admin@sifarah.local');

  UPDATE public.profiles
  SET email = v_email, username = COALESCE(username, 'admin'), is_verified = true
  WHERE id = v_id;

  INSERT INTO public.moderation_admins (user_id)
  VALUES (v_id)
  ON CONFLICT DO NOTHING;
END $$;
