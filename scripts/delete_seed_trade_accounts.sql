-- Remove seed trade accounts that are neither promotion immobilière
-- nor press / federations / public bodies / orders / observatories / chambers.
-- Keeps @sifarah.local seeds whose phone is a mobile (06, 07, +2126, +2127),
-- and never deletes a profile with an empty profession (the admin seed).
-- Seed mail lives on auth.users. Run as a role that can write auth.users.
--
-- One block: the editor commits between statements, so a temp table
-- created earlier disappears before the deletes run.

DO $$
DECLARE
  n integer;
BEGIN
  CREATE TEMP TABLE doomed_seed_accounts ON COMMIT DROP AS
  SELECT p.id
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE (
      lower(coalesce(u.email, '')) LIKE '%@sifarah.local'
      OR lower(coalesce(u.email, '')) LIKE '%@sifarah.com.local'
      OR lower(coalesce(p.email, '')) LIKE '%@sifarah.local'
      OR lower(coalesce(p.email, '')) LIKE '%@sifarah.com.local'
    )
    AND (
      p.phone IS NULL
      OR btrim(p.phone) = ''
      OR btrim(p.phone) !~ '^(06|07|\+2126|\+2127)'
    )
    AND btrim(coalesce(p.profession, '')) <> ''
    AND p.profile_type IS DISTINCT FROM 'institution'
    AND lower(btrim(p.profession)) <> 'promotion immobilière'
    AND lower(btrim(p.profession)) NOT IN (
      'presse',
      'ordre',
      'organisme public',
      'fédération',
      'observatoire',
      'administration',
      'chambre'
    );

  SELECT count(*) INTO n FROM doomed_seed_accounts;
  IF n = 0 THEN
    RAISE NOTICE 'No seed trade accounts left to delete.';
    RETURN;
  END IF;
  IF n <> 70 THEN
    RAISE EXCEPTION 'Expected 70 seed accounts to delete, found %', n;
  END IF;

  UPDATE public.post_reports
  SET reviewed_by = NULL
  WHERE reviewed_by IN (SELECT id FROM doomed_seed_accounts);

  UPDATE public.profile_reports
  SET reviewed_by = NULL
  WHERE reviewed_by IN (SELECT id FROM doomed_seed_accounts);

  UPDATE public.reel_reports
  SET reviewed_by = NULL
  WHERE reviewed_by IN (SELECT id FROM doomed_seed_accounts);

  DELETE FROM public.profiles
  WHERE id IN (SELECT id FROM doomed_seed_accounts);

  DELETE FROM auth.users
  WHERE id IN (SELECT id FROM doomed_seed_accounts);
END $$;
