UPDATE public.profiles p
SET
  full_name = regexp_replace(p.full_name, '^Ma[iî]tre\s+', '', 'i'),
  bio = regexp_replace(p.bio, 'Ma[iî]tre\s+', '', 'gi'),
  about_text = regexp_replace(
    regexp_replace(p.about_text, 'Étude de Ma[iî]tre\s+', 'Étude de ', 'gi'),
    'Ma[iî]tre\s+',
    '',
    'gi'
  ),
  updated_at = NOW()
FROM auth.users u
WHERE u.id = p.id
  AND u.raw_user_meta_data->>'seed_batch' = 'notaires_agadir_2026';

UPDATE public.services s
SET
  title = regexp_replace(s.title, 'Ma[iî]tre\s+', '', 'gi'),
  description = regexp_replace(s.description, 'Ma[iî]tre\s+', '', 'gi')
FROM auth.users u
WHERE u.id = s.user_id
  AND u.raw_user_meta_data->>'seed_batch' = 'notaires_agadir_2026';

SELECT p.username, p.full_name
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.raw_user_meta_data->>'seed_batch' = 'notaires_agadir_2026'
ORDER BY p.full_name
LIMIT 8;
