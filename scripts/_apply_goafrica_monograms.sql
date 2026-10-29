-- Replace goafricaonline placeholder logos with monograms
BEGIN;
UPDATE public.profiles SET avatar_url = '/monograms/lc-3mmarocminnesotaminingandman-58ae94b2.svg', updated_at = NOW() WHERE id = '58ae94b2-eb80-5996-9b1a-2d546f26089f'::uuid;
UPDATE public.profiles SET avatar_url = '/monograms/lc-abmbricolage-0c6a1a8c.svg', updated_at = NOW() WHERE id = '0c6a1a8c-e23a-5414-b8cc-14eed40d35a8'::uuid;
UPDATE public.profiles SET avatar_url = '/monograms/lc-acasateliersetchantiersdagad-45f98c49.svg', updated_at = NOW() WHERE id = '45f98c49-79d6-582d-b880-083d14998f91'::uuid;
UPDATE public.profiles SET avatar_url = '/monograms/lc-acetiairconditionningenginee-cfb9b7a5.svg', updated_at = NOW() WHERE id = 'cfb9b7a5-ed5d-5c65-bf79-02a9d5dc90d7'::uuid;
UPDATE public.profiles SET avatar_url = '/monograms/lc-afifiengineering-f80e37f1.svg', updated_at = NOW() WHERE id = 'f80e37f1-4be0-5a7c-8d97-f963ec657654'::uuid;
UPDATE public.profiles SET avatar_url = '/monograms/lc-afriquibatafricainedequincai-10ecf59b.svg', updated_at = NOW() WHERE id = '10ecf59b-8190-571f-9a47-b08447d74160'::uuid;
UPDATE public.profiles SET avatar_url = '/monograms/lc-ahammamclim-72654c18.svg', updated_at = NOW() WHERE id = '72654c18-9df5-5e9a-b46a-dd337a6f511b'::uuid;
UPDATE public.profiles SET avatar_url = '/monograms/lc-aitighoud-41bac301.svg', updated_at = NOW() WHERE id = '41bac301-3136-597b-b5b3-df577ff7e115'::uuid;
UPDATE public.profiles SET avatar_url = '/monograms/lc-almalquy-257ef7e5.svg', updated_at = NOW() WHERE id = '257ef7e5-a66f-5ea1-9dd8-9c8a3cfe2ed1'::uuid;
UPDATE public.profiles SET avatar_url = '/monograms/lc-aluwoodmaroc-1a2ef5b4.svg', updated_at = NOW() WHERE id = '1a2ef5b4-f228-55c2-bf83-73f13eec188d'::uuid;
UPDATE public.profiles SET avatar_url = '/monograms/lc-ammatlanticmachinerymanufact-0fb63c1b.svg', updated_at = NOW() WHERE id = '0fb63c1b-3d42-5d82-af4e-e87df2108688'::uuid;
COMMIT;
-- Updated 11 profiles
