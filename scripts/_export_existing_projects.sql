-- Export all projects for dedup keys
SELECT
  id,
  user_id,
  title,
  city,
  promoter_id,
  promoter_name,
  attributes
FROM public.projects
ORDER BY user_id, title, id;
