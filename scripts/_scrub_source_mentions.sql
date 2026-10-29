-- Remove crawl/source brand mentions from bios and about_text.
UPDATE public.profiles
SET
  bio = regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(COALESCE(bio, ''), '(?i)\s*chridari\s*', ' ', 'g'),
            '(?i)\s*telecontact\s*', ' ', 'g'
          ),
          '(?i)\s*tachrone\s*', ' ', 'g'
        ),
        '(?i)\s*le\s*chantier\s*', ' ', 'g'
      ),
      '(?i)\s*lechantier\s*', ' ', 'g'
    ),
    '\s{2,}', ' ', 'g'
  ),
  about_text = regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(COALESCE(about_text, ''), '(?i)chridari', '', 'g'),
            '(?i)telecontact', '', 'g'
          ),
          '(?i)tachrone', '', 'g'
        ),
        '(?i)le\s*chantier', '', 'g'
      ),
      '(?i)lechantier', '', 'g'
    ),
    '\s{2,}', ' ', 'g'
  ),
  updated_at = NOW()
WHERE bio ILIKE '%chridari%'
   OR bio ILIKE '%telecontact%'
   OR bio ILIKE '%lechantier%'
   OR bio ILIKE '%tachrone%'
   OR bio ILIKE '%le chantier%'
   OR about_text ILIKE '%chridari%'
   OR about_text ILIKE '%telecontact%'
   OR about_text ILIKE '%lechantier%'
   OR about_text ILIKE '%tachrone%'
   OR about_text ILIKE '%le chantier%';

SELECT count(*)::int AS remaining
FROM public.profiles
WHERE bio ILIKE '%chridari%'
   OR bio ILIKE '%telecontact%'
   OR bio ILIKE '%lechantier%'
   OR bio ILIKE '%tachrone%'
   OR bio ILIKE '%le chantier%'
   OR about_text ILIKE '%chridari%'
   OR about_text ILIKE '%telecontact%'
   OR about_text ILIKE '%lechantier%'
   OR about_text ILIKE '%tachrone%'
   OR about_text ILIKE '%le chantier%';
