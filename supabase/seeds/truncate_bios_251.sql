-- Cap profile bios at 251 characters (new max).
-- 1) Truncate existing oversized bios
-- 2) Tighten CHECK constraint from 450 → 251

UPDATE public.profiles
SET bio = left(bio, 251), updated_at = NOW()
WHERE bio IS NOT NULL AND char_length(bio) > 251;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_bio_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_bio_check CHECK (bio IS NULL OR char_length(bio) <= 251);
