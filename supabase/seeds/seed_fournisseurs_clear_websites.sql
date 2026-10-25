-- Run against live DB to remove supplier website links
-- Clear website links on all fournisseur / product supplier profiles
UPDATE public.profiles
SET website_url = NULL, updated_at = NOW()
WHERE id IN (
  SELECT DISTINCT user_id FROM public.products
  UNION
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = 'fournisseurs_289'
  UNION
  SELECT id FROM auth.users WHERE COALESCE(raw_user_meta_data->>'source_supplier_key', '') <> ''
);
