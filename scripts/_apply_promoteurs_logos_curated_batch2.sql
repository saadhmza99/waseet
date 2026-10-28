-- Curated logo batch 2
-- 2
BEGIN;
-- Residences Dar Saada
UPDATE public.profiles SET avatar_url = 'https://www.espacessaada.com/assets/images/logo.png', updated_at = NOW() WHERE id = '51c89945-24ca-5ce1-95ef-119e960c0521'::uuid AND (avatar_url IS NULL OR avatar_url LIKE '%default-pro.jpg%');
-- OCP S.A.
UPDATE public.profiles SET avatar_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Ocp-group.png', updated_at = NOW() WHERE id = 'a6b67e68-4251-5323-9e8b-d3eb40fa0118'::uuid AND (avatar_url IS NULL OR avatar_url LIKE '%default-pro.jpg%');
COMMIT;
