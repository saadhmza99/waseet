-- Curated logo batch 1 (manual/WebSearch)
-- 3 updates
BEGIN;
-- Arcadia Capital
UPDATE public.profiles SET avatar_url = 'https://arcadia-immo.ma/wp-content/uploads/2025/01/Arcadia-logo.svg', updated_at = NOW() WHERE id = 'ae4197c7-7847-518c-964d-dab7e5078ad3'::uuid AND (avatar_url IS NULL OR avatar_url LIKE '%default-pro.jpg%');
-- Avenis
UPDATE public.profiles SET avatar_url = 'https://www.jetgroupafrica.com/images/logo.png', updated_at = NOW() WHERE id = '9da6b6e8-0cbe-5c30-aaee-64e212a6f399'::uuid AND (avatar_url IS NULL OR avatar_url LIKE '%default-pro.jpg%');
-- Yamed
UPDATE public.profiles SET avatar_url = 'https://ynexis.com/wp-content/uploads/2025/10/YNEXIS_LOGO_DIGI_R.svg', updated_at = NOW() WHERE id = 'a0d0269b-3a26-5f31-8e2d-ada1b9d3523a'::uuid AND (avatar_url IS NULL OR avatar_url LIKE '%default-pro.jpg%');
COMMIT;
