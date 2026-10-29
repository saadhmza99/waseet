-- Institutions are verified by default, including accounts that already exist.
CREATE OR REPLACE FUNCTION public.track_profile_field_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.profile_type = 'institution' THEN
    NEW.is_verified := TRUE;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_verified := COALESCE(NEW.is_verified, FALSE);
    NEW.contact_updated_at := COALESCE(NEW.contact_updated_at, NEW.created_at, NOW());
    NEW.avatar_updated_at := COALESCE(NEW.avatar_updated_at, NEW.created_at, NOW());
    IF NEW.is_verified IS TRUE THEN
      NEW.verified_at := COALESCE(NEW.verified_at, NOW());
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.phone IS DISTINCT FROM OLD.phone
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.website_url IS DISTINCT FROM OLD.website_url THEN
    NEW.contact_updated_at := NOW();
  END IF;

  IF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN
    NEW.avatar_updated_at := NOW();
  END IF;

  IF OLD.signup_ip IS NOT NULL THEN
    NEW.signup_ip := OLD.signup_ip;
  END IF;
  IF OLD.signup_country IS NOT NULL THEN
    NEW.signup_country := OLD.signup_country;
  END IF;
  IF OLD.signup_country_code IS NOT NULL THEN
    NEW.signup_country_code := OLD.signup_country_code;
  END IF;

  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    IF NEW.is_verified THEN
      NEW.verified_at := COALESCE(NEW.verified_at, NOW());
    ELSE
      NEW.verified_at := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

UPDATE public.profiles
SET
  is_verified = TRUE,
  verified_at = COALESCE(verified_at, NOW())
WHERE profile_type = 'institution'
  AND is_verified IS DISTINCT FROM TRUE;

NOTIFY pgrst, 'reload schema';

SELECT username, is_verified
FROM public.profiles
WHERE profile_type = 'institution'
ORDER BY username;
