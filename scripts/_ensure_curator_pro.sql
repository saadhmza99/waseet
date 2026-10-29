-- Dedicated curator pro account for media power mode.
-- Email: curator@sifarah.local
-- Password: Waseet-Curator-2026!

do $$
declare
  v_id uuid := 'a1111111-1111-5111-8111-111111111111'::uuid;
  v_email text := 'curator@sifarah.local';
  v_pass text := crypt('Waseet-Curator-2026!', gen_salt('bf'));
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_id,
    'authenticated',
    'authenticated',
    v_email,
    v_pass,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'username', 'curator',
      'full_name', 'Waseet Curator',
      'profession', 'Administration',
      'profile_type', 'enterprise',
      'account_type', 'pro'
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  on conflict (id) do update
  set encrypted_password = excluded.encrypted_password,
      email_confirmed_at = coalesce(auth.users.email_confirmed_at, now()),
      raw_user_meta_data = excluded.raw_user_meta_data,
      updated_at = now();

  -- Also reset by email if a different id already owns that email.
  update auth.users
  set encrypted_password = v_pass,
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now(),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
        'username', 'curator',
        'full_name', 'Waseet Curator',
        'profession', 'Administration',
        'profile_type', 'enterprise',
        'account_type', 'pro'
      )
  where email = v_email;

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  )
  select
    u.id, u.id,
    jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
    'email', u.id::text, now(), now(), now()
  from auth.users u
  where u.email = v_email
  on conflict do nothing;

  insert into public.profiles (
    id, username, full_name, profession, profile_type, created_at, updated_at
  )
  select
    u.id,
    'curator',
    'Waseet Curator',
    'Administration',
    'enterprise',
    now(),
    now()
  from auth.users u
  where u.email = v_email
  on conflict (id) do update
  set username = excluded.username,
      full_name = excluded.full_name,
      profession = excluded.profession,
      profile_type = excluded.profile_type,
      updated_at = now();
end $$;

select id::text, email, email_confirmed_at is not null as confirmed
from auth.users
where email = 'curator@sifarah.local';
