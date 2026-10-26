CREATE OR REPLACE FUNCTION public.get_default_avatar_url(profile_kind TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://auusinntfgmoneqhjcbe.supabase.co/storage/v1/object/public/images/avatars/default-pro.jpg';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

UPDATE public.profiles
SET avatar_url = public.get_default_avatar_url(COALESCE(profile_type, 'individual')),
    updated_at = NOW()
WHERE avatar_url IS NULL
   OR btrim(avatar_url) = ''
   OR avatar_url LIKE 'data:image/svg+xml%';

UPDATE public.visitors
SET avatar_url = public.get_default_avatar_url('individual')
WHERE avatar_url IS NULL
   OR btrim(avatar_url) = ''
   OR avatar_url LIKE 'data:image/svg+xml%';

SELECT
  (SELECT count(*)::int FROM profiles WHERE avatar_url LIKE '%/avatars/default-pro.jpg') AS profiles_on_default,
  (SELECT count(*)::int FROM profiles WHERE avatar_url IS NULL OR btrim(avatar_url)='' OR avatar_url LIKE 'data:image/svg+xml%') AS profiles_still_empty,
  public.get_default_avatar_url('enterprise') AS default_url;
