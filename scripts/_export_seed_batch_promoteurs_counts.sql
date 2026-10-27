-- Count auth users by promoteur-related seed_batch values
SELECT
  COALESCE(raw_user_meta_data->>'seed_batch', '(null)') AS seed_batch,
  count(*)::int AS user_count
FROM auth.users
WHERE (raw_user_meta_data->>'seed_batch') ILIKE '%promoteur%'
   OR (raw_user_meta_data->>'source_promoteur_id') IS NOT NULL
GROUP BY 1
ORDER BY user_count DESC, seed_batch;
