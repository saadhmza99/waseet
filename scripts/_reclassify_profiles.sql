-- Auto-generated: reclassify profiles from bio/profession (admin, no login)
BEGIN;
UPDATE public.profiles SET bio = 'Situ├⌐e dans la zone industrielle de Ain Atiq; 6PO Industrie est une soci├⌐t├⌐ sp├⌐cialis├⌐e dans la fabrication de tubes en PVC et PEHD; destin├⌐s ├á la distribution et adduction dΓÇÖeau potable; ├á lΓÇÖirrigation; lΓÇÖ├⌐vacuation des eaux; lΓÇÖassai', updated_at = NOW() WHERE id = 'a48ab3d8-3035-5222-af53-87fba7cb529b'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'a48ab3d8-3035-5222-af53-87fba7cb529b'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'a48ab3d8-3035-5222-af53-87fba7cb529b'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'a48ab3d8-3035-5222-af53-87fba7cb529b'::uuid AND ic.code = '3.2.2';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b35ac3fe-19a1-556f-b8c9-82eb56cfafb7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b35ac3fe-19a1-556f-b8c9-82eb56cfafb7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.4.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b35ac3fe-19a1-556f-b8c9-82eb56cfafb7'::uuid AND ic.code = '8.4.3';
UPDATE public.profiles SET bio = 'Cr├⌐├⌐e en 2023 au Maroc; ABGM sΓÇÖappuie sur plus de 5 ans dΓÇÖexp├⌐rience acquise en Italie dans les domaines de lΓÇÖagencement int├⌐rieur et ext├⌐rieur ainsi que de lΓÇÖisolation thermique et acoustique. Sp├⌐cialis├⌐e dans lΓÇÖinstallation de faux ', updated_at = NOW() WHERE id = '21f33873-f32b-5a52-a55b-e0ed76837b5f'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '21f33873-f32b-5a52-a55b-e0ed76837b5f'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '21f33873-f32b-5a52-a55b-e0ed76837b5f'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.7'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '21f33873-f32b-5a52-a55b-e0ed76837b5f'::uuid AND ic.code = '3.2.7';
UPDATE public.profiles SET bio = 'Une entreprise de premier plan engag├⌐e dans la construction; la production; et l''exploitation des ressources n├⌐cessaires ├á l''essor de l''industrie. Avec nos filiales Bitumed; Moja Pr├⌐fa et Sud Gravette; nous couvrons divers aspects de l''industrie; ', updated_at = NOW() WHERE id = '1fd00041-d9b0-5890-851e-dd2bfa52f900'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '1fd00041-d9b0-5890-851e-dd2bfa52f900'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '1fd00041-d9b0-5890-851e-dd2bfa52f900'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '1fd00041-d9b0-5890-851e-dd2bfa52f900'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'Acero Building Systems (Acero) propose des solutions compl├¿tes pour les b├ótiments en charpente m├⌐tallique; comprenant la conception; la fabrication et la fourniture; en utilisant des logiciels dΓÇÖing├⌐nierie internationalement reconnus ainsi que d', updated_at = NOW() WHERE id = 'f6907254-98ed-5de9-a06a-86a5b3d556e1'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'f6907254-98ed-5de9-a06a-86a5b3d556e1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f6907254-98ed-5de9-a06a-86a5b3d556e1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.6'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'f6907254-98ed-5de9-a06a-86a5b3d556e1'::uuid AND ic.code = '3.1.6';
UPDATE public.profiles SET bio = 'Promotion immobili├¿re. Logements ├⌐conomiques. Certification ISO 9001/2008 (2009)', updated_at = NOW() WHERE id = '48e4f110-acc2-5760-b807-be98d3c402d1'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '48e4f110-acc2-5760-b807-be98d3c402d1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '48e4f110-acc2-5760-b807-be98d3c402d1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '1.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '48e4f110-acc2-5760-b807-be98d3c402d1'::uuid AND ic.code = '1.2.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '92538cce-f47d-5e45-b82d-bbbeab990081'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '92538cce-f47d-5e45-b82d-bbbeab990081'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '92538cce-f47d-5e45-b82d-bbbeab990081'::uuid AND ic.code = '4.2.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'aefc38a9-3f3e-55ee-8fe6-e0d9ab6b69b0'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'aefc38a9-3f3e-55ee-8fe6-e0d9ab6b69b0'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'aefc38a9-3f3e-55ee-8fe6-e0d9ab6b69b0'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Bienvenus chez AFCODEV; le leader marocain sp├⌐cialis├⌐ dans la vente et lΓÇÖinstallation de kits de protection de derni├¿re g├⌐n├⌐ration pour s├⌐curiser les fen├¬tres; balcons; terrasses; et bien plus encore. Fabriqu├⌐ ├á base dΓÇÖun filet en acier i', updated_at = NOW() WHERE id = '0e7a9fb3-97fc-5a42-a10b-d3dfab4ca9e0'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '0e7a9fb3-97fc-5a42-a10b-d3dfab4ca9e0'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '0e7a9fb3-97fc-5a42-a10b-d3dfab4ca9e0'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '0e7a9fb3-97fc-5a42-a10b-d3dfab4ca9e0'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '0e7a9fb3-97fc-5a42-a10b-d3dfab4ca9e0'::uuid AND ic.code = '3.3.5';
UPDATE public.profiles SET bio = 'AFRIPINTE est une entreprise sp├⌐cialis├⌐e dans la production et les travaux de peinture. Elle propose des produits et des services de haute qualit├⌐ pour divers secteurs; notamment le b├ótiment; l''industrie et les infrastructures. L''entreprise est co', updated_at = NOW() WHERE id = 'e23c2fe4-bf47-578b-b12d-ee2397638de0'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e23c2fe4-bf47-578b-b12d-ee2397638de0'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e23c2fe4-bf47-578b-b12d-ee2397638de0'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e23c2fe4-bf47-578b-b12d-ee2397638de0'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.4.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e23c2fe4-bf47-578b-b12d-ee2397638de0'::uuid AND ic.code = '3.3.2';
UPDATE public.profiles SET bio = 'Afrique D├⌐coupe Laser est une soci├⌐t├⌐ marocaine sp├⌐cialis├⌐e dans la d├⌐coupe laser de t├┤les et de tubes; le pliage; le roulage; la soudure argon. Elle offre des solutions m├⌐talliques pr├⌐cises et innovantes pour les secteurs industriel; automob', updated_at = NOW() WHERE id = '9905df39-f4ef-5a6f-ab9d-9ff7371412a6'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '9905df39-f4ef-5a6f-ab9d-9ff7371412a6'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9905df39-f4ef-5a6f-ab9d-9ff7371412a6'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9905df39-f4ef-5a6f-ab9d-9ff7371412a6'::uuid AND ic.code = '3.3.5';
UPDATE public.profiles SET bio = 'Depuis plus de 50 ans; AFRIQUE ├ëTANCH├ëIT├ë sΓÇÖimpose comme lΓÇÖun des pionniers africains dans le domaine de lΓÇÖ├⌐tanch├⌐it├⌐ bitumineuse. De notre premi├¿re ligne de production ├á notre pr├⌐sence actuelle sur le march├⌐ marocain et africain; notr', updated_at = NOW() WHERE id = 'e706cb5b-4e6d-5ac2-8617-402a4e68c0b5'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e706cb5b-4e6d-5ac2-8617-402a4e68c0b5'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e706cb5b-4e6d-5ac2-8617-402a4e68c0b5'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.6'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e706cb5b-4e6d-5ac2-8617-402a4e68c0b5'::uuid AND ic.code = '3.2.6';
UPDATE public.profiles SET bio = 'Agence d''architecture et d''am├⌐nagement TAHTI - 3AT; bas├⌐e ├á Casablanca; est une structure multidisciplinaire fond├⌐e en 2000. Elle est r├⌐put├⌐e pour son innovation; durabilit├⌐ et excellence dans la cr├⌐ation dΓÇÖespaces dynamiques et significatif', updated_at = NOW() WHERE id = 'b503f3fa-287f-504b-b657-f3bcfc5edaba'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b503f3fa-287f-504b-b657-f3bcfc5edaba'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b503f3fa-287f-504b-b657-f3bcfc5edaba'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b503f3fa-287f-504b-b657-f3bcfc5edaba'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.4.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b503f3fa-287f-504b-b657-f3bcfc5edaba'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'AGTM est le fruit de lΓÇÖassociation de deux Ing├⌐nieurs G├⌐om├¿tres Topographes laur├⌐ats de IAV Hassan II; une association compl├⌐mentaire qui permet au cabinet de proposer ├á ses clients une multitude de comp├⌐tences dans divers domaines dΓÇÖactivi', updated_at = NOW() WHERE id = 'f7e9d9f9-7fc8-511a-ae40-0a6538dadf25'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'f7e9d9f9-7fc8-511a-ae40-0a6538dadf25'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f7e9d9f9-7fc8-511a-ae40-0a6538dadf25'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '6.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'f7e9d9f9-7fc8-511a-ae40-0a6538dadf25'::uuid AND ic.code = '6.2.3';
UPDATE public.profiles SET bio = 'Nous sommes une soci├⌐t├⌐ sp├⌐cialis├⌐e dans la production et la fourniture de gazon naturel en rouleau; bas├⌐e ├á Agadir; au service des particuliers; professionnels; paysagistes et promoteurs immobiliers. Notre gazon naturel premium vous garantit : ', updated_at = NOW() WHERE id = '6e1ee925-0b69-5aa0-b39c-d3cc56e43d63'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '6e1ee925-0b69-5aa0-b39c-d3cc56e43d63'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6e1ee925-0b69-5aa0-b39c-d3cc56e43d63'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.3.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6e1ee925-0b69-5aa0-b39c-d3cc56e43d63'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '6e1ee925-0b69-5aa0-b39c-d3cc56e43d63'::uuid AND ic.code = '5.3.3';
UPDATE public.profiles SET bio = 'Une soci├⌐t├⌐ sp├⌐cialis├⌐e en installation ├⌐lectrique et domotique; videosurveillance; avec une belle equipe qui a travaill├⌐ sur des grands projets que saΓÇª', updated_at = NOW() WHERE id = '12a86979-68fd-5988-94d2-4fca53d52d1b'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '12a86979-68fd-5988-94d2-4fca53d52d1b'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '12a86979-68fd-5988-94d2-4fca53d52d1b'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '12a86979-68fd-5988-94d2-4fca53d52d1b'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '12a86979-68fd-5988-94d2-4fca53d52d1b'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '7.5.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '12a86979-68fd-5988-94d2-4fca53d52d1b'::uuid AND ic.code = '3.2.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '36c35acc-50bd-5c19-b9fd-ebf2345c6465'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '36c35acc-50bd-5c19-b9fd-ebf2345c6465'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '36c35acc-50bd-5c19-b9fd-ebf2345c6465'::uuid AND ic.code = '3.5.2';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ce476ff9-0c52-5d1a-b861-a9dc1ff1a586'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ce476ff9-0c52-5d1a-b861-a9dc1ff1a586'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.9'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ce476ff9-0c52-5d1a-b861-a9dc1ff1a586'::uuid AND ic.code = '3.2.9';
UPDATE public.profiles SET bio = 'Promotion immobili├¿re', updated_at = NOW() WHERE id = '4695cecd-b348-51d6-bb14-7d92e4ae0980'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '4695cecd-b348-51d6-bb14-7d92e4ae0980'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '4695cecd-b348-51d6-bb14-7d92e4ae0980'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '1.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '4695cecd-b348-51d6-bb14-7d92e4ae0980'::uuid AND ic.code = '1.2.1';
UPDATE public.profiles SET bio = 'AlquiMaroc a ├⌐t├⌐ cr├⌐├⌐e pour r├⌐pondre aux besoins sp├⌐cifiques des secteurs de la construction; du g├⌐nie civil; des travaux publics et de lΓÇÖindustrie. AlquiMaroc propose des services personnalis├⌐s et de qualit├⌐; qui se distinguent de ceux de ', updated_at = NOW() WHERE id = '606ae6b8-73cc-56a7-8a76-dbc4e82100ad'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '606ae6b8-73cc-56a7-8a76-dbc4e82100ad'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '606ae6b8-73cc-56a7-8a76-dbc4e82100ad'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '606ae6b8-73cc-56a7-8a76-dbc4e82100ad'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'ALUFACTORY vous accompagne dans le choix et la fourniture de vos syst├¿mes de menuiserie en aluminium; avec sa large gamme de produits; comprenant fen├¬tres; portes; volets roulants; fa├ºades; pergolas; v├⌐randas; brises soleils; cloisons; syst├¿mes d', updated_at = NOW() WHERE id = '338fc142-85d5-583b-b68e-8b3f3d9b7efe'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '338fc142-85d5-583b-b68e-8b3f3d9b7efe'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '338fc142-85d5-583b-b68e-8b3f3d9b7efe'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '338fc142-85d5-583b-b68e-8b3f3d9b7efe'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'Ama light est une entreprise marocaine sp├⌐cialis├⌐e dans lΓÇÖimportation et la vente de luminaires modernes et ├⌐l├⌐gants. Nous proposons ├⌐galement des services dΓÇÖinstallation; de conception dΓÇÖ├⌐clairage et de domotique pour appartements; villas', updated_at = NOW() WHERE id = 'f2deff97-d01d-5336-8c7c-852d4fd2fd1d'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'f2deff97-d01d-5336-8c7c-852d4fd2fd1d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f2deff97-d01d-5336-8c7c-852d4fd2fd1d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f2deff97-d01d-5336-8c7c-852d4fd2fd1d'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'f2deff97-d01d-5336-8c7c-852d4fd2fd1d'::uuid AND ic.code = '3.2.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '91562dbd-6975-5376-8566-309bb1615152'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '91562dbd-6975-5376-8566-309bb1615152'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '91562dbd-6975-5376-8566-309bb1615152'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '5.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '91562dbd-6975-5376-8566-309bb1615152'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '91562dbd-6975-5376-8566-309bb1615152'::uuid AND ic.code = '5.1.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'd19f0c05-f5f4-5455-adb8-e6b641408f0d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'd19f0c05-f5f4-5455-adb8-e6b641408f0d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'd19f0c05-f5f4-5455-adb8-e6b641408f0d'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'd19f0c05-f5f4-5455-adb8-e6b641408f0d'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'd19f0c05-f5f4-5455-adb8-e6b641408f0d'::uuid AND ic.code = '3.2.2';
UPDATE public.profiles SET bio = 'Promotion immobili├¿re', updated_at = NOW() WHERE id = '5f80b2de-a026-50e6-a178-1056dca3cfaf'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '5f80b2de-a026-50e6-a178-1056dca3cfaf'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '5f80b2de-a026-50e6-a178-1056dca3cfaf'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '1.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '5f80b2de-a026-50e6-a178-1056dca3cfaf'::uuid AND ic.code = '1.2.1';
UPDATE public.profiles SET bio = 'APRO Industrie est une entreprise sp├⌐cialis├⌐e dans les travaux de BTP; intervenant dans la construction; le g├⌐nie civil et les installations industrielles. Nous accompagnons nos clients publics et priv├⌐s avec des solutions techniques fiables; dans', updated_at = NOW() WHERE id = '543815ef-57c7-53c3-a6c4-cb0df7299fb0'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '543815ef-57c7-53c3-a6c4-cb0df7299fb0'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '543815ef-57c7-53c3-a6c4-cb0df7299fb0'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '543815ef-57c7-53c3-a6c4-cb0df7299fb0'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'AR SOLUTIONS Notre sp├⌐cialit├⌐ est la location de mat├⌐riels et engins destin├⌐s aux professionnels du b├ótiment et des travaux publics (BTP); ├á lΓÇÖagriculture et ├á lΓÇÖindustrie. En toute s├⌐curit├⌐; nous proposons des formules souples et flexibl', updated_at = NOW() WHERE id = '9b297c51-d9f6-5d96-9862-37ac943a6518'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '9b297c51-d9f6-5d96-9862-37ac943a6518'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9b297c51-d9f6-5d96-9862-37ac943a6518'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9b297c51-d9f6-5d96-9862-37ac943a6518'::uuid AND ic.code = '3.1.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = '5d46de53-1f7e-565b-99c6-ddfd3295c556'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '5d46de53-1f7e-565b-99c6-ddfd3295c556'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '5d46de53-1f7e-565b-99c6-ddfd3295c556'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'ART KIT est une entreprise sp├⌐cialis├⌐e dans la distribution de quincaillerie haut de gamme pour meubles; cuisines et dressings. Distributeur officiel de 8 marques europ├⌐ennes certifi├⌐es; nous mettons ├á votre disposition une s├⌐lection rigoureuse ', updated_at = NOW() WHERE id = '088d8da4-7888-5d58-af9b-b40de64edcaf'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '088d8da4-7888-5d58-af9b-b40de64edcaf'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '088d8da4-7888-5d58-af9b-b40de64edcaf'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '088d8da4-7888-5d58-af9b-b40de64edcaf'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '088d8da4-7888-5d58-af9b-b40de64edcaf'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'ArtMood ΓÇô Fabricant de cuisines et dressings sur mesure ├á Tanger :Usine de fabrication de cuisines; dressings et mobilier sur mesure ├á Tanger depuis 2014. 600 m┬▓ d''atelier; machines CNC derni├¿re g├⌐n├⌐ration; 30 artisans qualifi├⌐s. Nos sp├⌐cial', updated_at = NOW() WHERE id = '30b30b8e-23de-5ecb-8512-8567e77bc629'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '30b30b8e-23de-5ecb-8512-8567e77bc629'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '30b30b8e-23de-5ecb-8512-8567e77bc629'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '30b30b8e-23de-5ecb-8512-8567e77bc629'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '30b30b8e-23de-5ecb-8512-8567e77bc629'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'ATIBA Architecture ΓÇô Votre vision; notre mission ! Bas├⌐e ├á Berrechid; ATIBA Architecture est une agence innovante sp├⌐cialis├⌐e dans la conception et le suivi de projets architecturaux r├⌐sidentiels; commerciaux et professionnels. Nous vous accomp', updated_at = NOW() WHERE id = '65aeaa2b-8ddb-5afc-af14-db8cd8eaa4f7'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '65aeaa2b-8ddb-5afc-af14-db8cd8eaa4f7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '65aeaa2b-8ddb-5afc-af14-db8cd8eaa4f7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '65aeaa2b-8ddb-5afc-af14-db8cd8eaa4f7'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'ATLAS CONFORT ET SECURITE (ACS) est un sp├⌐cialiste des lots techniques du b├ótiment; offrant des solutions compl├¿tes en Climatisation et traitement de l''air; fluides ainsi quΓÇÖune expertise multi technique. Nous assurons la fourniture; lΓÇÖinstalla', updated_at = NOW() WHERE id = 'bfeb4f57-d596-5589-93ec-fdf3c4089beb'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'bfeb4f57-d596-5589-93ec-fdf3c4089beb'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'bfeb4f57-d596-5589-93ec-fdf3c4089beb'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'bfeb4f57-d596-5589-93ec-fdf3c4089beb'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'bfeb4f57-d596-5589-93ec-fdf3c4089beb'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '8.6.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'bfeb4f57-d596-5589-93ec-fdf3c4089beb'::uuid AND ic.code = '3.2.5';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c25e8016-2bef-598f-a823-9cb0ad8a9b3c'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c25e8016-2bef-598f-a823-9cb0ad8a9b3c'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c25e8016-2bef-598f-a823-9cb0ad8a9b3c'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c25e8016-2bef-598f-a823-9cb0ad8a9b3c'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c25e8016-2bef-598f-a823-9cb0ad8a9b3c'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c25e8016-2bef-598f-a823-9cb0ad8a9b3c'::uuid AND ic.code = '4.2.4';
UPDATE public.profiles SET bio = 'Install├⌐e ├á Marrakech; ATTERRA a pour ambition de conjuguer exigence technique; innovation et respect du territoire; au service des projets marocains et des dynamiques r├⌐gionales. Forte de lΓÇÖexp├⌐rience du groupe en France; ATTERRA sΓÇÖengage dan', updated_at = NOW() WHERE id = '2a0a66a3-71c6-5717-913e-d4650ee37c2e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '2a0a66a3-71c6-5717-913e-d4650ee37c2e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2a0a66a3-71c6-5717-913e-d4650ee37c2e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2a0a66a3-71c6-5717-913e-d4650ee37c2e'::uuid AND ic.code = '3.4.2';
UPDATE public.profiles SET bio = 'Bas├⌐e ├á Marrakech; qui repense les codes traditionnels ├á travers une vision r├⌐solument moderniste. Fond├⌐e sur la conviction que lΓÇÖarchitecture est un vecteur de transformation culturelle et sociale; notre agence sΓÇÖattache ├á cr├⌐er des espace', updated_at = NOW() WHERE id = 'f38162db-3845-5217-bf68-a9fa9aa6cb6c'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'f38162db-3845-5217-bf68-a9fa9aa6cb6c'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f38162db-3845-5217-bf68-a9fa9aa6cb6c'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'f38162db-3845-5217-bf68-a9fa9aa6cb6c'::uuid AND ic.code = '5.1.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '2aa9c8db-5060-5540-aa5f-ee4b42c774a3'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2aa9c8db-5060-5540-aa5f-ee4b42c774a3'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2aa9c8db-5060-5540-aa5f-ee4b42c774a3'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'AYOU TECH POWER ΓÇô Expertise; Innovation et Fiabilit├⌐ AYOU TECH POWER est une entreprise marocaine sp├⌐cialis├⌐e dans les solutions ├⌐lectriques; informatiques et digitales pour les particuliers; les entreprises et les industries. Nous accompagnons ', updated_at = NOW() WHERE id = 'be0cd6fe-f5e0-57dd-8ee6-fc36b688d22f'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'be0cd6fe-f5e0-57dd-8ee6-fc36b688d22f'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'be0cd6fe-f5e0-57dd-8ee6-fc36b688d22f'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'be0cd6fe-f5e0-57dd-8ee6-fc36b688d22f'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'be0cd6fe-f5e0-57dd-8ee6-fc36b688d22f'::uuid AND ic.code = '7.5.2';
DELETE FROM public.profile_internal_categories WHERE profile_id = '70829a2f-cce7-5451-b7c1-45e30cfac840'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '70829a2f-cce7-5451-b7c1-45e30cfac840'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '70829a2f-cce7-5451-b7c1-45e30cfac840'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '70829a2f-cce7-5451-b7c1-45e30cfac840'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'Badryteam est une soci├⌐t├⌐ de production audiovisuelle bas├⌐e ├á Tanger; sp├⌐cialis├⌐e dans la r├⌐alisation de contenus photo et vid├⌐o pour le secteur immobilier. Depuis plus de 8 ans; nous accompagnons les promoteurs; agences et architectes dans la', updated_at = NOW() WHERE id = '2fd5d3d9-2f8b-5ff6-ad1a-2c335f9b9401'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '2fd5d3d9-2f8b-5ff6-ad1a-2c335f9b9401'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2fd5d3d9-2f8b-5ff6-ad1a-2c335f9b9401'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2fd5d3d9-2f8b-5ff6-ad1a-2c335f9b9401'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'Bass Studio est un atelier dΓÇÖarchitecture Premium Fond├⌐ par l''Architecte Abdelhamid Berrissoul; d├⌐di├⌐ ├á lΓÇÖinnovation esth├⌐tique; ├á la cr├⌐ativit├⌐ spatiale et ├á lΓÇÖexcellence des d├⌐tails. Notre signature : des lignes ├⌐l├⌐gantes; des mat├', updated_at = NOW() WHERE id = '51bf27fe-990b-5279-9b96-3c7155a7131a'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '51bf27fe-990b-5279-9b96-3c7155a7131a'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '51bf27fe-990b-5279-9b96-3c7155a7131a'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '51bf27fe-990b-5279-9b96-3c7155a7131a'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'Beccaprime est une entreprise sp├⌐cialis├⌐e dans le secteur des services de nettoyage professionnel; de lΓÇÖentretien des espaces verts (jardinage); ainsi que dans la distribution de produits dΓÇÖentretien et dΓÇÖ├⌐quipements de protection individuell', updated_at = NOW() WHERE id = '5357c4b9-08a3-54e5-86d0-f6a3eb7496a1'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '5357c4b9-08a3-54e5-86d0-f6a3eb7496a1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '5357c4b9-08a3-54e5-86d0-f6a3eb7496a1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '5357c4b9-08a3-54e5-86d0-f6a3eb7496a1'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '8.6.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '5357c4b9-08a3-54e5-86d0-f6a3eb7496a1'::uuid AND ic.code = '4.3.2';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e1dcc759-4c95-5e85-9dbb-5f8f4d35c42b'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e1dcc759-4c95-5e85-9dbb-5f8f4d35c42b'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e1dcc759-4c95-5e85-9dbb-5f8f4d35c42b'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e1dcc759-4c95-5e85-9dbb-5f8f4d35c42b'::uuid AND ic.code = '3.2.2';
UPDATE public.profiles SET bio = 'BECOMAR est une entreprise marocaine sp├⌐cialis├⌐e dans la production et la commercialisation de solutions b├⌐ton innovantes et de qualit├⌐ sup├⌐rieure. Fond├⌐e pour r├⌐pondre aux besoins croissants du march├⌐ de la construction; elle s''appuie sur une', updated_at = NOW() WHERE id = 'ff742c20-0951-5af2-a8d6-b9429bcc781e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ff742c20-0951-5af2-a8d6-b9429bcc781e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ff742c20-0951-5af2-a8d6-b9429bcc781e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ff742c20-0951-5af2-a8d6-b9429bcc781e'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'Benapro est une entreprise de construction marocaine proposant des services fiables en construction; r├⌐novation et finition. Nous visons l''excellence; privil├⌐giant un savoir-faire de qualit├⌐; une communication transparente et la r├⌐alisation de pro', updated_at = NOW() WHERE id = 'eeea4c89-6318-59d8-88bd-f9f5391ac809'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'eeea4c89-6318-59d8-88bd-f9f5391ac809'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'eeea4c89-6318-59d8-88bd-f9f5391ac809'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'eeea4c89-6318-59d8-88bd-f9f5391ac809'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'eeea4c89-6318-59d8-88bd-f9f5391ac809'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Depuis sa cr├⌐ation en 1985; le Bureau d''├⌐tudes techniques (BET) SKIREDJ a d├⌐montr├⌐ ├á travers ses r├⌐alisations ce qui nous distingue : S├⌐rieux; Excellence et innovation. Notre bureau d''├⌐tudes a r├⌐alis├⌐ plus de 1000 projets de construction: B├', updated_at = NOW() WHERE id = '34329189-eb9e-5dbb-b1a6-a85e5aa42df5'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '34329189-eb9e-5dbb-b1a6-a85e5aa42df5'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '34329189-eb9e-5dbb-b1a6-a85e5aa42df5'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '34329189-eb9e-5dbb-b1a6-a85e5aa42df5'::uuid AND ic.code = '3.4.2';
UPDATE public.profiles SET bio = 'B├⌐ton Cir├⌐ Maroc est une entreprise sp├⌐cialis├⌐e dans la cr├⌐ation et lΓÇÖapplication de rev├¬tements d├⌐coratifs en b├⌐ton cir├⌐; destin├⌐s aux particuliers et aux professionnels ├á la recherche dΓÇÖun design moderne; ├⌐pur├⌐ et durable. Notre mis', updated_at = NOW() WHERE id = '3019bb6d-a5f0-5efe-a213-e6e7fb5796bc'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '3019bb6d-a5f0-5efe-a213-e6e7fb5796bc'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '3019bb6d-a5f0-5efe-a213-e6e7fb5796bc'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '3019bb6d-a5f0-5efe-a213-e6e7fb5796bc'::uuid AND ic.code = '4.4.2';
UPDATE public.profiles SET bio = 'Apr├¿s 13 ann├⌐es dΓÇÖexp├⌐rience dans lΓÇÖimportation et la distribution; BK International sΓÇÖinscrit dans la continuit├⌐ de cette expertise tout en affirmant une dynamique dΓÇÖexpansion et de diversification. Si notre c┼ôur dΓÇÖactivit├⌐ demeure le', updated_at = NOW() WHERE id = '6385367e-700b-59dc-9c32-2174970e0b79'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '6385367e-700b-59dc-9c32-2174970e0b79'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6385367e-700b-59dc-9c32-2174970e0b79'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '6385367e-700b-59dc-9c32-2174970e0b79'::uuid AND ic.code = '8.5.4';
UPDATE public.profiles SET bio = 'Blok Modulaire Maroc est une entreprise marocaine sp├⌐cialis├⌐e dans la construction; la vente et la location de b├ótiments modulaires. Nous proposons des solutions rapides; flexibles et durables pour r├⌐pondre aux besoins des professionnels; des coll', updated_at = NOW() WHERE id = '5ca2783d-1d83-5165-9cb3-11ceb7ed7276'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '5ca2783d-1d83-5165-9cb3-11ceb7ed7276'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '5ca2783d-1d83-5165-9cb3-11ceb7ed7276'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '5ca2783d-1d83-5165-9cb3-11ceb7ed7276'::uuid AND ic.code = '3.1.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ca2c80e1-cbe8-5931-9000-d826bf28fad7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ca2c80e1-cbe8-5931-9000-d826bf28fad7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ca2c80e1-cbe8-5931-9000-d826bf28fad7'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = '"BRS ENERGIE est une entreprise sp├⌐cialis├⌐e dans les travaux divers: Climatisation; Ventilation; D├⌐senfumage; Plomberie; Piscine; Energie Solaire; etc. Nous vous accompagnons dans vos projets en vous apportant des solutions parfaitement adapt├⌐es ├', updated_at = NOW() WHERE id = '86127ee0-5687-5634-a2a1-13ddd94ae442'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '86127ee0-5687-5634-a2a1-13ddd94ae442'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '86127ee0-5687-5634-a2a1-13ddd94ae442'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '86127ee0-5687-5634-a2a1-13ddd94ae442'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '86127ee0-5687-5634-a2a1-13ddd94ae442'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '86127ee0-5687-5634-a2a1-13ddd94ae442'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '8.6.6'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '86127ee0-5687-5634-a2a1-13ddd94ae442'::uuid AND ic.code = '3.2.3';
UPDATE public.profiles SET bio = 'Building Archi-Design est un bureau sp├⌐cialis├⌐ dans le design et lΓÇÖarchitecture dΓÇÖint├⌐rieur; lΓÇÖam├⌐nagement dΓÇÖespaces et la visualisation architecturale. Depuis 2020; nous accompagnons particuliers; entreprises et institutions dans la r├⌐al', updated_at = NOW() WHERE id = '250db7b0-3508-5a53-8027-6667e1e1cd91'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '250db7b0-3508-5a53-8027-6667e1e1cd91'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '250db7b0-3508-5a53-8027-6667e1e1cd91'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '250db7b0-3508-5a53-8027-6667e1e1cd91'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'CAP FER; acier disponible pour vos chantiers. Distributeur d''acier ├á Casablanca : tubes (carr├⌐s; ronds; rectangulaires); t├┤les (noires; galva; stri├⌐es; perfor├⌐es); poutrelles IPN/UPN et lamin├⌐s marchands (corni├¿res; fers plats; fers ├á T; UAC; ', updated_at = NOW() WHERE id = '718fbd28-1b65-53ff-9eda-3ae85a360654'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '718fbd28-1b65-53ff-9eda-3ae85a360654'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '718fbd28-1b65-53ff-9eda-3ae85a360654'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '718fbd28-1b65-53ff-9eda-3ae85a360654'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '718fbd28-1b65-53ff-9eda-3ae85a360654'::uuid AND ic.code = '3.3.5';
DELETE FROM public.profile_internal_categories WHERE profile_id = '28f68172-39bb-53e5-9ff8-d394a870fe65'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '28f68172-39bb-53e5-9ff8-d394a870fe65'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '28f68172-39bb-53e5-9ff8-d394a870fe65'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'Castle Wood est une entreprise marocaine sp├⌐cialis├⌐e dans lΓÇÖam├⌐nagement int├⌐rieur sous toutes ses formes; avec une exp├⌐rience terrain de 25 ans. Elle propose des solutions globales et personnalis├⌐es englobant la conception; la fabrication et l', updated_at = NOW() WHERE id = 'eba2a059-acce-56e1-9e7c-66537840ce6a'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'eba2a059-acce-56e1-9e7c-66537840ce6a'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'eba2a059-acce-56e1-9e7c-66537840ce6a'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'eba2a059-acce-56e1-9e7c-66537840ce6a'::uuid AND ic.code = '4.4.2';
UPDATE public.profiles SET bio = 'Fabricant de vis depuis 1963; CELO con├ºoit; fabrique et commercialise un ensemble de produits de fixation et de supportage orient├⌐s ├á la r├⌐duction du temps dΓÇÖinstallation et la r├⌐alisation dΓÇÖ├⌐conomies sur les co├╗ts de pose ou dΓÇÖassemblage', updated_at = NOW() WHERE id = 'e79cd28f-118d-5645-bb9c-675cdad15acc'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e79cd28f-118d-5645-bb9c-675cdad15acc'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e79cd28f-118d-5645-bb9c-675cdad15acc'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e79cd28f-118d-5645-bb9c-675cdad15acc'::uuid AND ic.code = '3.5.2';
UPDATE public.profiles SET bio = 'Depuis 30 ans; Groupe Ceramex sΓÇÖest fait la promesse de fournir ├á ses clients les meilleurs produits; accompagn├⌐s du meilleur service. C├⌐ramiques; salles de bain et robinetterie : un large ├⌐ventail de produits sΓÇÖoffre ├á notre client├¿le. Visi', updated_at = NOW() WHERE id = 'b43d5e0e-4e08-5189-a1ba-29394be15dab'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b43d5e0e-4e08-5189-a1ba-29394be15dab'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b43d5e0e-4e08-5189-a1ba-29394be15dab'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b43d5e0e-4e08-5189-a1ba-29394be15dab'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b43d5e0e-4e08-5189-a1ba-29394be15dab'::uuid AND ic.code = '4.2.4';
UPDATE public.profiles SET bio = 'CERATUBE est une entreprise sp├⌐cialis├⌐e dans la distribution dΓÇÖappareils sanitaires; de mat├⌐riel ├⌐lectrique; de quincaillerie ainsi que dans le n├⌐goce de produits industriels; agricoles; artisanaux et divers. Forte dΓÇÖune expertise reconnue; C', updated_at = NOW() WHERE id = '2a0723c9-ab85-56d7-a9a6-f77deaaa296d'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '2a0723c9-ab85-56d7-a9a6-f77deaaa296d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2a0723c9-ab85-56d7-a9a6-f77deaaa296d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2a0723c9-ab85-56d7-a9a6-f77deaaa296d'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2a0723c9-ab85-56d7-a9a6-f77deaaa296d'::uuid AND ic.code = '4.2.4';
UPDATE public.profiles SET bio = 'Chattal Ing├⌐nierie & Coordination est un bureau d''├⌐tudes BTP au Maroc sp├⌐cialis├⌐ en structure; OPC; VRD; ing├⌐nierie multi-technique et assistance ├á ma├«trise d''ouvrage. Nous accompagnons promoteurs; architectes et ma├«tres d''ouvrage dans leurs p', updated_at = NOW() WHERE id = 'b4b96535-1528-5ffd-a32b-278be3ede2b0'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b4b96535-1528-5ffd-a32b-278be3ede2b0'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b4b96535-1528-5ffd-a32b-278be3ede2b0'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b4b96535-1528-5ffd-a32b-278be3ede2b0'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b4b96535-1528-5ffd-a32b-278be3ede2b0'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'ChicD├⌐coration est une entreprise sp├⌐cialis├⌐e dans le rev├¬tement de sols et murs. Nous proposons une large gamme de solutions d├⌐coratives : papier peint; moulures; bardage mural; parquet et bien plus. Alliez style et qualit├⌐ pour sublimer vos es', updated_at = NOW() WHERE id = 'b193452c-e1b3-5f3d-9a80-3db072ea21d4'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b193452c-e1b3-5f3d-9a80-3db072ea21d4'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b193452c-e1b3-5f3d-9a80-3db072ea21d4'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b193452c-e1b3-5f3d-9a80-3db072ea21d4'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'ChiΓÇÖLivin est une agence dΓÇÖarchitecture; de design dΓÇÖint├⌐rieur et de construction qui offre un service cl├⌐ en main; cr├⌐ant des espaces uniques alliant esth├⌐tique; fonctionnalit├⌐ et durabilit├⌐ pour transformer vos projets en exp├⌐riences de', updated_at = NOW() WHERE id = 'f5edc905-e0c0-55fa-a655-049e2a582dd5'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'f5edc905-e0c0-55fa-a655-049e2a582dd5'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f5edc905-e0c0-55fa-a655-049e2a582dd5'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'f5edc905-e0c0-55fa-a655-049e2a582dd5'::uuid AND ic.code = '5.1.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '03a10c1f-c4bb-5b9d-98c4-5b83f6367576'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '03a10c1f-c4bb-5b9d-98c4-5b83f6367576'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '03a10c1f-c4bb-5b9d-98c4-5b83f6367576'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '03a10c1f-c4bb-5b9d-98c4-5b83f6367576'::uuid AND ic.code = '3.3.1';
UPDATE public.profiles SET bio = 'CIMAG est une soci├⌐t├⌐ sp├⌐cialis├⌐e dans la vente de mat├⌐riaux de construction; offrant une large gamme de produits tels que les agglos; poutrelles; hourdis; bordures; et autres ├⌐l├⌐ments essentiels pour le gros ┼ôuvre. Elle sΓÇÖadresse aux profes', updated_at = NOW() WHERE id = '15f0bac3-c026-58e6-87b8-48fbb5a06a63'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '15f0bac3-c026-58e6-87b8-48fbb5a06a63'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '15f0bac3-c026-58e6-87b8-48fbb5a06a63'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '15f0bac3-c026-58e6-87b8-48fbb5a06a63'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'Clairo; dot├⌐ de plus de 36 ans d''expertise reconnue; referent au Maroc dans le secteur du traitement des eaux et de l''├⌐quipement pour piscines au Maroc. L''entreprise; est situ├⌐e ├á Casablanca; Marrakech et Agadir; offre des solutions completes et p', updated_at = NOW() WHERE id = 'cbd93fe8-6b0d-5be7-963d-756fd429697a'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'cbd93fe8-6b0d-5be7-963d-756fd429697a'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'cbd93fe8-6b0d-5be7-963d-756fd429697a'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'cbd93fe8-6b0d-5be7-963d-756fd429697a'::uuid AND ic.code = '4.3.4';
UPDATE public.profiles SET bio = 'CLENZ est une entreprise marocaine fond├⌐e en 2022; sp├⌐cialis├⌐e dans la distribution dΓÇÖ├ëquipements de Protection Individuelle (EPI); de consommables et de produits dΓÇÖhygi├¿ne ├á usage professionnel. Elle accompagne les entreprises soucieuses de', updated_at = NOW() WHERE id = '9aee86ff-d895-5a51-a02e-94f63e2668b0'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '9aee86ff-d895-5a51-a02e-94f63e2668b0'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9aee86ff-d895-5a51-a02e-94f63e2668b0'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9aee86ff-d895-5a51-a02e-94f63e2668b0'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'Clique services; Construction professional in casablanca. Contact; client reviews and free quotes on lechantier.ma.', updated_at = NOW() WHERE id = '2e662793-2abc-5cf4-a23b-beae27d398b2'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '2e662793-2abc-5cf4-a23b-beae27d398b2'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2e662793-2abc-5cf4-a23b-beae27d398b2'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2e662793-2abc-5cf4-a23b-beae27d398b2'::uuid AND ic.code = '8.5.4';
UPDATE public.profiles SET bio = 'Cobureau Sp├⌐cialiste du mobilier de bureau et de lΓÇÖam├⌐nagement dΓÇÖespaces de travail au Maroc; notre entreprise accompagne les professionnels; PME; grandes entreprises et administrations dans la cr├⌐ation de bureaux fonctionnels; modernes et ergo', updated_at = NOW() WHERE id = 'bdb90679-4761-5f32-a82d-5857364610c7'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'bdb90679-4761-5f32-a82d-5857364610c7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'bdb90679-4761-5f32-a82d-5857364610c7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'bdb90679-4761-5f32-a82d-5857364610c7'::uuid AND ic.code = '8.5.2';
UPDATE public.profiles SET bio = 'Soci├⌐t├⌐ sp├⌐cialis├⌐e dans lΓÇÖinstallation; lΓÇÖentretien et la maintenance de syst├¿mes techniques pour le b├ótiment et lΓÇÖindustrie. Ses domaines dΓÇÖexpertise incluent la climatisation; lΓÇÖaspiration centralis├⌐e; la domotique; le plancher cha', updated_at = NOW() WHERE id = '7142b31b-f760-53df-83fd-f1f12059ff22'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '7142b31b-f760-53df-83fd-f1f12059ff22'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7142b31b-f760-53df-83fd-f1f12059ff22'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7142b31b-f760-53df-83fd-f1f12059ff22'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7142b31b-f760-53df-83fd-f1f12059ff22'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7142b31b-f760-53df-83fd-f1f12059ff22'::uuid AND ic.code = '3.2.3';
UPDATE public.profiles SET bio = 'Bienvenue dans notre magasin sp├⌐cialis├⌐ dans divers types de peintures pour b├ótiments; carrosseries; piscines et bien plus encore. Nous offrons des produits de haute qualit├⌐ qui r├⌐pondent ├á tous vos besoins en mati├¿re de peinture. Notre ├⌐quipe', updated_at = NOW() WHERE id = 'ed7747fb-9601-533d-bbc1-3a9fe859bc46'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ed7747fb-9601-533d-bbc1-3a9fe859bc46'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ed7747fb-9601-533d-bbc1-3a9fe859bc46'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ed7747fb-9601-533d-bbc1-3a9fe859bc46'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ed7747fb-9601-533d-bbc1-3a9fe859bc46'::uuid AND ic.code = '3.3.2';
UPDATE public.profiles SET bio = 'Entreprise sp├⌐cialis├⌐e dans les mat├⌐riaux de construction et plomberie et d''├⌐lectricit├⌐.', updated_at = NOW() WHERE id = 'e71015d7-3062-51b0-8aa9-c8665730cb1e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e71015d7-3062-51b0-8aa9-c8665730cb1e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e71015d7-3062-51b0-8aa9-c8665730cb1e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e71015d7-3062-51b0-8aa9-c8665730cb1e'::uuid AND ic.code = '3.2.2';
UPDATE public.profiles SET bio = 'Corinto SARL est une entreprise marocaine bas├⌐e ├á Mohammedia; sp├⌐cialis├⌐e dans la vente; installation; r├⌐paration et maintenance de solutions de fermeture industrielles et commerciales. Active dans tout le Maroc; Corinto propose une gamme compl├¿', updated_at = NOW() WHERE id = '29ee6189-fec8-5458-96e1-2724ee14ca6e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '29ee6189-fec8-5458-96e1-2724ee14ca6e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '29ee6189-fec8-5458-96e1-2724ee14ca6e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '29ee6189-fec8-5458-96e1-2724ee14ca6e'::uuid AND ic.code = '3.2.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '8eeded93-c56f-5e6d-81f7-df2deb7a18d3'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '8eeded93-c56f-5e6d-81f7-df2deb7a18d3'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '8eeded93-c56f-5e6d-81f7-df2deb7a18d3'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '8eeded93-c56f-5e6d-81f7-df2deb7a18d3'::uuid AND ic.code = '3.2.2';
UPDATE public.profiles SET bio = '╪¬┘Å┘é╪»┘à ╪┤╪▒┘â╪⌐ CRISTAL POINT 3D ╪«╪»┘à╪º╪¬ ┘à╪¬┘â╪º┘à┘ä╪⌐ ┘ê┘à╪¬┘à┘è╪▓╪⌐ ┘ü┘è ┘à╪¼╪º┘ä╪º╪¬ ╪¬┘ä┘à┘è╪╣ ╪º┘ä╪▒╪«╪º┘à╪î ╪º┘ä╪¬┘å╪╕┘è┘ü ╪º┘ä┘å┘ç╪º╪ª┘è╪î ┘ê┘à┘â╪º┘ü╪¡╪⌐ ╪º┘ä╪¡╪┤╪▒╪º╪¬ ┘ê╪º┘ä┘é┘ê╪º╪▒╪╢╪î ┘à┘ê╪¼┘ç╪⌐ ┘ä┘ä╪ú┘ü╪▒╪º╪»╪î ╪º┘ä╪┤╪▒┘â╪º╪¬╪î ┘ê╪', updated_at = NOW() WHERE id = '1606ae50-008f-5447-ba9a-93c338500e88'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '1606ae50-008f-5447-ba9a-93c338500e88'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '1606ae50-008f-5447-ba9a-93c338500e88'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.6.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '1606ae50-008f-5447-ba9a-93c338500e88'::uuid AND ic.code = '8.6.1';
UPDATE public.profiles SET bio = 'DallTech Travaux est une entreprise sp├⌐cialis├⌐e en g├⌐nie civil; VRD; am├⌐nagements ext├⌐rieurs et terrains de sport (Padel; Football; Basket...) au Maroc. Nous intervenons dans la r├⌐alisation de projets vari├⌐s; notamment les travaux de dallage et', updated_at = NOW() WHERE id = '37bc3f8d-179c-59ec-b73f-a4417e6ac3a6'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '37bc3f8d-179c-59ec-b73f-a4417e6ac3a6'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '37bc3f8d-179c-59ec-b73f-a4417e6ac3a6'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '37bc3f8d-179c-59ec-b73f-a4417e6ac3a6'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Dar pvc ┘â┘å┘ê┘ü╪▒ ┘ä┘è┘â┘à ╪ú╪¡╪»╪½ ╪º┘ä╪¬┘é┘å┘è╪º╪¬ ╪ú┘ê ┘â┘å╪│╪¬╪«╪»┘à┘ê ┘à┘ê╪º╪» ╪»╪º╪¬ ╪¼┘ê╪»╪⌐ ╪╣╪º┘ä┘è╪⌐ ╪ú┘ê ┘â┘å╪¼┘à╪╣┘ê ┘à╪º ╪¿┘è┘å ╪º┘å╪º┘é╪⌐ ╪º┘ä╪¬╪╡┘à┘è┘à ╪º┘ê ╪¼┘ê╪»╪⌐ ╪º┘ä╪¬┘å┘ü┘è╪░ ┘à┘å╪¬╪¼╪º╪¬ dar pvc ┘â╪¬╪╢┘à┘å ┘ä┘è┘â┘à ╪╣╪▓┘ä ╪º┘ä╪¡', updated_at = NOW() WHERE id = '299be79e-a887-55b2-94d9-7701f7e0c9aa'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '299be79e-a887-55b2-94d9-7701f7e0c9aa'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '299be79e-a887-55b2-94d9-7701f7e0c9aa'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '299be79e-a887-55b2-94d9-7701f7e0c9aa'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'DARI BTP SARL AU est une soci├⌐t├⌐ dans le domaine du b├ótiment et travaux public; on offre comme service la r├⌐alisation des travaux tous corps d''etat el les travaux d''am├⌐nagement. Notre soci├⌐t├⌐ DARI BTP qui g├⌐r├⌐e par des personnes dipl├┤m├⌐es e', updated_at = NOW() WHERE id = '9a449819-22a1-5446-adce-b9be61cc3ee1'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '9a449819-22a1-5446-adce-b9be61cc3ee1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9a449819-22a1-5446-adce-b9be61cc3ee1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9a449819-22a1-5446-adce-b9be61cc3ee1'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'DATUM Engineering est un bureau dΓÇÖ├⌐tudes sp├⌐cialis├⌐ en topographie; am├⌐nagement du territoire; et ing├⌐nierie des infrastructures urbaines. Situ├⌐e ├á Casablanca; notre soci├⌐t├⌐ accompagne les collectivit├⌐s; les promoteurs immobiliers; les arc', updated_at = NOW() WHERE id = 'bc7b3f88-e74e-51e1-af7c-fe5a8aa7abb6'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'bc7b3f88-e74e-51e1-af7c-fe5a8aa7abb6'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'bc7b3f88-e74e-51e1-af7c-fe5a8aa7abb6'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '6.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'bc7b3f88-e74e-51e1-af7c-fe5a8aa7abb6'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'bc7b3f88-e74e-51e1-af7c-fe5a8aa7abb6'::uuid AND ic.code = '6.2.3';
UPDATE public.profiles SET bio = 'Nous proposons ├á diff├⌐rents groupes de destinataires les articles dΓÇÖ├⌐quipement de salle de bain et de cuisine quΓÇÖils recherchent. Nous consid├⌐rons notre sotien du client et des employ├⌐s comme la principale source de d├⌐veloppement de lΓÇÖentr', updated_at = NOW() WHERE id = '78651ad0-3ea6-5782-8643-4f6b5b816246'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '78651ad0-3ea6-5782-8643-4f6b5b816246'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '78651ad0-3ea6-5782-8643-4f6b5b816246'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '78651ad0-3ea6-5782-8643-4f6b5b816246'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '78651ad0-3ea6-5782-8643-4f6b5b816246'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '78651ad0-3ea6-5782-8643-4f6b5b816246'::uuid AND ic.code = '4.2.4';
UPDATE public.profiles SET bio = 'DECOLAG est une soci├⌐t├⌐ sp├⌐cialis├⌐e dans lΓÇÖam├⌐nagement et la d├⌐coration int├⌐rieure; offrant des solutions innovantes et esth├⌐tiques pour sublimer tous vos espaces. Nous proposons une large gamme de produits haut de gamme : bardages PVC d├⌐co', updated_at = NOW() WHERE id = '642ccd06-83a9-54f6-9f51-f7673ead72dd'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '642ccd06-83a9-54f6-9f51-f7673ead72dd'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '642ccd06-83a9-54f6-9f51-f7673ead72dd'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '642ccd06-83a9-54f6-9f51-f7673ead72dd'::uuid AND ic.code = '4.4.2';
UPDATE public.profiles SET bio = 'La soci├⌐t├⌐ D├⌐veloppement&Construction Maroc est une entreprise sp├⌐cialis├⌐e en construction g├⌐n├⌐rale pour la r├⌐alisation de projets r├⌐sidentiels; commerciales et industriels. Notre objectif est la qualit├⌐ et un meilleur service. La soci├⌐t├⌐ ', updated_at = NOW() WHERE id = '715195c5-720d-5c19-9936-6980efb02916'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '715195c5-720d-5c19-9936-6980efb02916'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '715195c5-720d-5c19-9936-6980efb02916'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '715195c5-720d-5c19-9936-6980efb02916'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Dfye (DecoForYou├ëlite) est votre expert en d├⌐coration d''int├⌐rieur et en am├⌐nagement sur-mesure; offrant des solutions haut de gamme en menuiserie aluminium; fa├ºades ├⌐l├⌐gantes; travaux de vitrage de pr├⌐cision; et escaliers en verre tremp├⌐. Nou', updated_at = NOW() WHERE id = 'b528d609-887a-578d-9e33-3cb463809cb0'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b528d609-887a-578d-9e33-3cb463809cb0'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b528d609-887a-578d-9e33-3cb463809cb0'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b528d609-887a-578d-9e33-3cb463809cb0'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'Dismetal est une societe sp├⌐cialis├⌐ dans la distribution de produit m├⌐tallurgique ainsi que la menuiserie et fabrication de : modulaire garde de corp cl├┤ture m├⌐tallique charpente m├⌐tallique rideau de magasin rideau sectionnelle ├⌐chafaudage pann', updated_at = NOW() WHERE id = 'b71ba1d4-3127-5ac5-a067-bcead8f7e0f7'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b71ba1d4-3127-5ac5-a067-bcead8f7e0f7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b71ba1d4-3127-5ac5-a067-bcead8f7e0f7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.6'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b71ba1d4-3127-5ac5-a067-bcead8f7e0f7'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b71ba1d4-3127-5ac5-a067-bcead8f7e0f7'::uuid AND ic.code = '3.1.6';
DELETE FROM public.profile_internal_categories WHERE profile_id = '5eaf47b4-1fba-5a21-b95f-425411572000'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '5eaf47b4-1fba-5a21-b95f-425411572000'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '5eaf47b4-1fba-5a21-b95f-425411572000'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '5eaf47b4-1fba-5a21-b95f-425411572000'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'Docteur piscines est une entreprise sp├⌐cialis├⌐e dans la conception; la construction et la r├⌐novation des piscines et spa haut-de-gamme au Maroc pour cr├⌐er une nouvelle pi├¿ce ├á vivre conforme aux tendances actuelles. Notre c┼ôur de m├⌐tier est la', updated_at = NOW() WHERE id = '963c9ea0-26c2-5528-aba9-bc68ec4f0522'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '963c9ea0-26c2-5528-aba9-bc68ec4f0522'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '963c9ea0-26c2-5528-aba9-bc68ec4f0522'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '963c9ea0-26c2-5528-aba9-bc68ec4f0522'::uuid AND ic.code = '4.3.4';
UPDATE public.profiles SET bio = 'Soci├⌐t├⌐ sp├⌐cialis├⌐e dans la fourniture et la distribution de solutions techniques pour le b├ótiment et lΓÇÖindustrie. Nous proposons une large gamme de produits professionnels couvrant plusieurs domaines; notamment la climatisation; la domotique; ', updated_at = NOW() WHERE id = 'e77f4863-62a0-593f-9dbd-74ded62acb10'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e77f4863-62a0-593f-9dbd-74ded62acb10'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e77f4863-62a0-593f-9dbd-74ded62acb10'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e77f4863-62a0-593f-9dbd-74ded62acb10'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e77f4863-62a0-593f-9dbd-74ded62acb10'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e77f4863-62a0-593f-9dbd-74ded62acb10'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e77f4863-62a0-593f-9dbd-74ded62acb10'::uuid AND ic.code = '3.2.5';
UPDATE public.profiles SET bio = 'Bureau d''├⌐tudes techniques VRD & B├ótiment bas├⌐ ├á Benslimane. ├ëtudes assainissement; voirie; structures; profils; plans d''ex├⌐cution et m├⌐tr├⌐s. +5 ans; march├⌐s publics Ben Hmed/Guisser. On s''adapte ├á vos besoins ΓÇô VRD ou b├ótiment; devis gra', updated_at = NOW() WHERE id = 'e1944df3-b41d-5df4-9d60-ff3a18320dac'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e1944df3-b41d-5df4-9d60-ff3a18320dac'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e1944df3-b41d-5df4-9d60-ff3a18320dac'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e1944df3-b41d-5df4-9d60-ff3a18320dac'::uuid AND ic.code = '3.4.2';
UPDATE public.profiles SET bio = '1. Am├⌐nagement int├⌐rieur & mobilier sur mesure portes placards cuisines biblioth├¿ques 2. Design int├⌐rieur; mobilier custom et habillage mural 3. Solutions dΓÇÖam├⌐nagement et d├⌐coration professionnelle 4. Mobilier sur mesure et design dΓÇÖespaces', updated_at = NOW() WHERE id = '814c1bbf-a285-5d7c-8cbb-eb15829d1061'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '814c1bbf-a285-5d7c-8cbb-eb15829d1061'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '814c1bbf-a285-5d7c-8cbb-eb15829d1061'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '814c1bbf-a285-5d7c-8cbb-eb15829d1061'::uuid AND ic.code = '4.2.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'f83e862a-7b1a-54b3-b5b2-9f4544f3a94d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f83e862a-7b1a-54b3-b5b2-9f4544f3a94d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'f83e862a-7b1a-54b3-b5b2-9f4544f3a94d'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'EFFINEX | Expertise; Innovation & Maintenance en Infrastructures R├⌐seaux Bienvenue sur le profil officiel d''EFFINEX; votre partenaire strat├⌐gique bas├⌐ ├á Casablanca; sp├⌐cialis├⌐ dans lΓÇÖinstallation et la maintenance des infrastructures t├⌐l├⌐com', updated_at = NOW() WHERE id = 'ac62adb3-30af-5a25-b415-aa5fe31ec840'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ac62adb3-30af-5a25-b415-aa5fe31ec840'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ac62adb3-30af-5a25-b415-aa5fe31ec840'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ac62adb3-30af-5a25-b415-aa5fe31ec840'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'El Manar Tr├⌐filage est votre sp├⌐cialiste en fil tr├⌐fil├⌐; grillage et pointerie en acier doux de haute qualit├⌐. Nous proposons des solutions m├⌐tallurgiques adapt├⌐es ├á divers secteurs industriels. Gr├óce ├á notre expertise en tr├⌐filage; nous pr', updated_at = NOW() WHERE id = '06624d8b-d338-52f3-9cc6-7b2a8b844248'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '06624d8b-d338-52f3-9cc6-7b2a8b844248'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '06624d8b-d338-52f3-9cc6-7b2a8b844248'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '06624d8b-d338-52f3-9cc6-7b2a8b844248'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '06624d8b-d338-52f3-9cc6-7b2a8b844248'::uuid AND ic.code = '3.3.5';
UPDATE public.profiles SET bio = 'Forte de plus de deux d├⌐cennies dΓÇÖexp├⌐rience; EL WIFAQ VERRE sΓÇÖimpose aujourdΓÇÖhui comme une r├⌐f├⌐rence nationale dans la transformation; la distribution et la commercialisation de verre et mat├⌐riaux associ├⌐s. Install├⌐e ├á F├¿s et dot├⌐e dΓ', updated_at = NOW() WHERE id = '91964dd3-bafc-5a0a-b8bf-cbbf65354340'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '91964dd3-bafc-5a0a-b8bf-cbbf65354340'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '91964dd3-bafc-5a0a-b8bf-cbbf65354340'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '91964dd3-bafc-5a0a-b8bf-cbbf65354340'::uuid AND ic.code = '4.4.2';
DELETE FROM public.profile_internal_categories WHERE profile_id = '9a8a2bc8-eb4d-5b85-ba8a-6103f9a22f8f'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9a8a2bc8-eb4d-5b85-ba8a-6103f9a22f8f'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9a8a2bc8-eb4d-5b85-ba8a-6103f9a22f8f'::uuid AND ic.code = '4.3.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b22bf46f-53d6-5271-a13a-8606403cc486'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b22bf46f-53d6-5271-a13a-8606403cc486'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b22bf46f-53d6-5271-a13a-8606403cc486'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b22bf46f-53d6-5271-a13a-8606403cc486'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'ELKRON MAROC - L''innovation au service de la s├⌐curit├⌐ depuis 1974 Filiale marocaine du groupe italien URMET; ELKRON MAROC s''impose aujourd''hui comme un acteur incontournable dans le domaine des solutions de s├⌐curit├⌐ ├⌐lectronique au Royaume. Forte', updated_at = NOW() WHERE id = '7ca474f6-59cd-5b12-805b-c84ae2bdbc81'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '7ca474f6-59cd-5b12-805b-c84ae2bdbc81'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7ca474f6-59cd-5b12-805b-c84ae2bdbc81'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7ca474f6-59cd-5b12-805b-c84ae2bdbc81'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'Travaux achat et vente de tous mat├⌐riels et fournitures ├⌐lectriques; industriels et automatisme; import; export', updated_at = NOW() WHERE id = 'e4105a41-8939-54d0-afd2-23900a8f418d'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e4105a41-8939-54d0-afd2-23900a8f418d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e4105a41-8939-54d0-afd2-23900a8f418d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e4105a41-8939-54d0-afd2-23900a8f418d'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e4105a41-8939-54d0-afd2-23900a8f418d'::uuid AND ic.code = '3.2.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'f12370d7-d87b-5323-8b1f-94ef8e23c1a1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f12370d7-d87b-5323-8b1f-94ef8e23c1a1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'f12370d7-d87b-5323-8b1f-94ef8e23c1a1'::uuid AND ic.code = '3.2.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ab3a0ef3-422d-521c-9d8a-6dc2448378d9'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ab3a0ef3-422d-521c-9d8a-6dc2448378d9'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ab3a0ef3-422d-521c-9d8a-6dc2448378d9'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'ERMAF Fa├ºades; une entreprise sp├⌐cialis├⌐e dans la menuiserie aluminium depuis 1997 et la r├⌐alisation de fa├ºades modernes; murs rideaux; cloisons vitr├⌐es; v├⌐randas; pergolas; ainsi que diverses solutions personnalis├⌐es pour les particuliers; pr', updated_at = NOW() WHERE id = '28df421b-b16f-5bf5-988a-1e32fca8be50'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '28df421b-b16f-5bf5-988a-1e32fca8be50'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '28df421b-b16f-5bf5-988a-1e32fca8be50'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '28df421b-b16f-5bf5-988a-1e32fca8be50'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'La soci├⌐t├⌐ Espace Steel est une entreprise marocaine sp├⌐cialis├⌐e dans la conception; la fabrication; la vente et la location de b├ótiments modulaires et de structures m├⌐talliques. Bas├⌐e ├á M├⌐diouna (Casablanca); elle intervient principalement d', updated_at = NOW() WHERE id = '67d4d420-c4a2-5fe9-b67b-3c92436ade0c'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '67d4d420-c4a2-5fe9-b67b-3c92436ade0c'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '67d4d420-c4a2-5fe9-b67b-3c92436ade0c'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '67d4d420-c4a2-5fe9-b67b-3c92436ade0c'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'Europelles Marrakech ΓÇô Sp├⌐cialiste des Machines de Construction Europelles Marrakech est une entreprise sp├⌐cialis├⌐e dans la vente; lΓÇÖimportation et la distribution de machines de construction neuves et dΓÇÖoccasion; ainsi que dΓÇÖaccessoires et', updated_at = NOW() WHERE id = '3e87a7c7-4150-5d5b-ad67-9e452297d0bd'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '3e87a7c7-4150-5d5b-ad67-9e452297d0bd'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '3e87a7c7-4150-5d5b-ad67-9e452297d0bd'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '3e87a7c7-4150-5d5b-ad67-9e452297d0bd'::uuid AND ic.code = '8.5.4';
UPDATE public.profiles SET bio = 'Eurotex est une entreprise espagnole fond├⌐e en 1981; sp├⌐cialis├⌐e depuis plus de 40 ans dans la fabrication et la commercialisation de peintures; vernis; rev├¬tements; solvants pour les secteurs industriel; professionnel ; avec une forte pr├⌐sence e', updated_at = NOW() WHERE id = 'a4a38245-1562-5e3b-8e20-be8fdd00b130'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'a4a38245-1562-5e3b-8e20-be8fdd00b130'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'a4a38245-1562-5e3b-8e20-be8fdd00b130'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'a4a38245-1562-5e3b-8e20-be8fdd00b130'::uuid AND ic.code = '3.3.2';
DELETE FROM public.profile_internal_categories WHERE profile_id = '2b4262f7-cfbe-589e-bbe0-41b74dcbd3de'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2b4262f7-cfbe-589e-bbe0-41b74dcbd3de'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2b4262f7-cfbe-589e-bbe0-41b74dcbd3de'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2b4262f7-cfbe-589e-bbe0-41b74dcbd3de'::uuid AND ic.code = '4.3.2';
UPDATE public.profiles SET bio = 'Expert Levage et Manutention (EXLEMA); bas├⌐e ├á Casablanca; est sp├⌐cialis├⌐e dans la vente; la location et la maintenance de mat├⌐riel de levage et de manutention au Maroc. Nous proposons une large gamme d''├⌐quipements professionnels : - Nacelles ci', updated_at = NOW() WHERE id = '91adee8a-74bc-588b-8c7c-978bbdd294a6'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '91adee8a-74bc-588b-8c7c-978bbdd294a6'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '91adee8a-74bc-588b-8c7c-978bbdd294a6'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '1.1.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '91adee8a-74bc-588b-8c7c-978bbdd294a6'::uuid AND ic.code = '1.1.5';
DELETE FROM public.profile_internal_categories WHERE profile_id = '35b5578a-beef-5047-ab90-d75966eccf57'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '35b5578a-beef-5047-ab90-d75966eccf57'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '35b5578a-beef-5047-ab90-d75966eccf57'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Ezzer Pierre est une entreprise sp├⌐cialis├⌐e dans la vente et la pose de pierre naturelle marocaine; notamment la c├⌐l├¿bre Pierre de Taza; reconnue pour sa r├⌐sistance; sa beaut├⌐ et sa durabilit├⌐. LΓÇÖentreprise sΓÇÖappuie sur un savoir-faire fami', updated_at = NOW() WHERE id = '5803323f-23e5-5adf-a037-930932fb462a'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '5803323f-23e5-5adf-a037-930932fb462a'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '5803323f-23e5-5adf-a037-930932fb462a'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '5803323f-23e5-5adf-a037-930932fb462a'::uuid AND ic.code = '3.3.1';
UPDATE public.profiles SET bio = 'Fadil Group est un acteur marocain du BTP qui propose des solutions de construction adapt├⌐es aux besoins des particuliers; des entreprises et des investisseurs. Nous nous engageons ├á livrer des projets de qualit├⌐ avec professionnalisme et efficacit', updated_at = NOW() WHERE id = '46d2ba27-ce25-5da3-9810-963c52739ac2'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '46d2ba27-ce25-5da3-9810-963c52739ac2'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '46d2ba27-ce25-5da3-9810-963c52739ac2'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '46d2ba27-ce25-5da3-9810-963c52739ac2'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Fadl Energy est une entreprise marocaine sp├⌐cialis├⌐e dans les solutions d''├⌐nergie solaire. Nous proposons des services de conception; d''installation et de maintenance de syst├¿mes photovolta├»ques et de chauffe-eaux solaires; destin├⌐s ├á r├⌐duire ', updated_at = NOW() WHERE id = '6922d48a-2c44-561d-ada6-d7d34d6bd508'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '6922d48a-2c44-561d-ada6-d7d34d6bd508'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6922d48a-2c44-561d-ada6-d7d34d6bd508'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '6922d48a-2c44-561d-ada6-d7d34d6bd508'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'FAW Aluminium est une entreprise sp├⌐cialis├⌐e dans la conception sur mesure et la pose de menuiseries en aluminium haut de gamme et moyen standing. Nous intervenons sur des projets r├⌐sidentiels; m├⌐dicaux et de bureaux; en assurant des finitions de ', updated_at = NOW() WHERE id = '51a256e8-f801-5002-a5a2-0d9a7f1bac07'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '51a256e8-f801-5002-a5a2-0d9a7f1bac07'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '51a256e8-f801-5002-a5a2-0d9a7f1bac07'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '51a256e8-f801-5002-a5a2-0d9a7f1bac07'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '51a256e8-f801-5002-a5a2-0d9a7f1bac07'::uuid AND ic.code = '3.3.4';
DELETE FROM public.profile_internal_categories WHERE profile_id = '116bf424-e914-51fe-8730-9ffdcd1612e3'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '116bf424-e914-51fe-8730-9ffdcd1612e3'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '116bf424-e914-51fe-8730-9ffdcd1612e3'::uuid AND ic.code = '3.5.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '12cb9e66-efe1-582c-b820-841228d33eb1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '12cb9e66-efe1-582c-b820-841228d33eb1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.3.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '12cb9e66-efe1-582c-b820-841228d33eb1'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '12cb9e66-efe1-582c-b820-841228d33eb1'::uuid AND ic.code = '5.3.3';
UPDATE public.profiles SET bio = 'Floor Lebo est une entreprise sp├⌐cialis├⌐ dans le rev├¬tement de sol en parquet et les travaux de boiserie int├⌐rieure et ext├⌐rieure.', updated_at = NOW() WHERE id = '19f3ccf7-864c-535e-bb4b-7dc98dece0ca'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '19f3ccf7-864c-535e-bb4b-7dc98dece0ca'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '19f3ccf7-864c-535e-bb4b-7dc98dece0ca'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '19f3ccf7-864c-535e-bb4b-7dc98dece0ca'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'FLOWSUD est une entreprise marocaine sp├⌐cialis├⌐e dans la conception et la construction de r├⌐seaux d''acheminement et de traitement des fluides. La motivation derri├¿re sa cr├⌐ation ├⌐mane de la volont├⌐ dΓÇÖ├⌐tablir une rupture avec les pratiques cl', updated_at = NOW() WHERE id = '9ee5eacc-fe2f-5fcc-85ac-58923a35e0af'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '9ee5eacc-fe2f-5fcc-85ac-58923a35e0af'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9ee5eacc-fe2f-5fcc-85ac-58923a35e0af'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9ee5eacc-fe2f-5fcc-85ac-58923a35e0af'::uuid AND ic.code = '3.2.2';
UPDATE public.profiles SET bio = 'Fortis Travaux est une entreprise sp├⌐cialis├⌐e dans les travaux techniques : ├⌐lectricit├⌐ industrielle et de b├ótiment; domotique; s├⌐curit├⌐ (vid├⌐osurveillance; contr├┤le d''acc├¿s; s├⌐curit├⌐ incendie); t├⌐l├⌐distribution et r├⌐seaux informatiques', updated_at = NOW() WHERE id = '9fb8a43e-b58c-53f0-8a47-4bb755ddd2c6'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '9fb8a43e-b58c-53f0-8a47-4bb755ddd2c6'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9fb8a43e-b58c-53f0-8a47-4bb755ddd2c6'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9fb8a43e-b58c-53f0-8a47-4bb755ddd2c6'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9fb8a43e-b58c-53f0-8a47-4bb755ddd2c6'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'FORUM DIFFUSION; bas├⌐e ├á Rabat; est sp├⌐cialis├⌐e dans lΓÇÖam├⌐nagement et lΓÇÖ├⌐quipement dΓÇÖespaces de travail professionnels. Depuis sa cr├⌐ation; lΓÇÖentreprise accompagne les organisations dans la conception de bureaux modernes; ergonomiques e', updated_at = NOW() WHERE id = '3e014bf1-a76c-5ff3-ba96-57487a244d60'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '3e014bf1-a76c-5ff3-ba96-57487a244d60'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '3e014bf1-a76c-5ff3-ba96-57487a244d60'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '3e014bf1-a76c-5ff3-ba96-57487a244d60'::uuid AND ic.code = '8.5.2';
DELETE FROM public.profile_internal_categories WHERE profile_id = '91f57533-aed5-51d0-8cab-6543a36b23e0'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '91f57533-aed5-51d0-8cab-6543a36b23e0'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '91f57533-aed5-51d0-8cab-6543a36b23e0'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '91f57533-aed5-51d0-8cab-6543a36b23e0'::uuid AND ic.code = '3.2.5';
DELETE FROM public.profile_internal_categories WHERE profile_id = '58e49c12-ba77-5fc1-a698-bd6cf2b528e5'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '58e49c12-ba77-5fc1-a698-bd6cf2b528e5'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '58e49c12-ba77-5fc1-a698-bd6cf2b528e5'::uuid AND ic.code = '3.2.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = '887b11b0-935c-57bf-8b8d-d9c1a1cf5abb'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '887b11b0-935c-57bf-8b8d-d9c1a1cf5abb'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.3.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '887b11b0-935c-57bf-8b8d-d9c1a1cf5abb'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '887b11b0-935c-57bf-8b8d-d9c1a1cf5abb'::uuid AND ic.code = '5.3.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = '7f04ded1-198e-586c-a1f4-8ed151fbc2ed'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7f04ded1-198e-586c-a1f4-8ed151fbc2ed'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7f04ded1-198e-586c-a1f4-8ed151fbc2ed'::uuid AND ic.code = '4.3.1';
UPDATE public.profiles SET bio = 'GC CERAMICA : Votre fournisseur en mati├¿re de carrelage & accessoires d├⌐coratifs. Nous sommes sp├⌐cialis├⌐ dans lΓÇÖimportation et la distribution de carreaux et accessoires d├⌐coratifs; nous r├⌐alisons des projets cr├⌐atifs pour une client├¿le comp', updated_at = NOW() WHERE id = '4ab6ca4d-9455-5f25-8cff-42eac641bd3c'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '4ab6ca4d-9455-5f25-8cff-42eac641bd3c'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '4ab6ca4d-9455-5f25-8cff-42eac641bd3c'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '4ab6ca4d-9455-5f25-8cff-42eac641bd3c'::uuid AND ic.code = '3.3.1';
UPDATE public.profiles SET bio = 'GEC Engineering est une entreprise marocaine bas├⌐e ├á T├⌐mara; cr├⌐├⌐e en 2017; sp├⌐cialis├⌐e dans les ├⌐tudes; la r├⌐alisation et la maintenance dΓÇÖinstallations ├⌐lectriques et ├⌐nerg├⌐tiques. Avec pr├¿s de 9 ans dΓÇÖexp├⌐rience sur le march├⌐; no', updated_at = NOW() WHERE id = '8137d195-6e94-5cbe-81bd-e1a8798098a6'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '8137d195-6e94-5cbe-81bd-e1a8798098a6'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '8137d195-6e94-5cbe-81bd-e1a8798098a6'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '8137d195-6e94-5cbe-81bd-e1a8798098a6'::uuid AND ic.code = '3.2.3';
UPDATE public.profiles SET bio = 'GENELTEC ΓÇô ├ëlectricit├⌐ & Smart Home Solutions GENELTEC est une entreprise marocaine sp├⌐cialis├⌐e dans les installations ├⌐lectriques compl├¿tes pour villas; b├ótiments r├⌐sidentiels et projets commerciaux. Nous offrons des solutions modernes et i', updated_at = NOW() WHERE id = '6d1760c8-a3d9-5b87-be74-7f49755b315e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '6d1760c8-a3d9-5b87-be74-7f49755b315e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6d1760c8-a3d9-5b87-be74-7f49755b315e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '6d1760c8-a3d9-5b87-be74-7f49755b315e'::uuid AND ic.code = '7.5.2';
UPDATE public.profiles SET bio = 'Geo Horizon est un cabinet d''ing├⌐nierie topographique; sp├⌐cialis├⌐ dans les lev├⌐s topographiques; les implantations; les bornages et la production de plans techniques pr├⌐cis pour les projets de construction; dΓÇÖam├⌐nagement et dΓÇÖing├⌐nierie. Gr', updated_at = NOW() WHERE id = 'd200bbd4-e8cf-5b60-bdfc-cc6ca9503bf4'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'd200bbd4-e8cf-5b60-bdfc-cc6ca9503bf4'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'd200bbd4-e8cf-5b60-bdfc-cc6ca9503bf4'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '6.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'd200bbd4-e8cf-5b60-bdfc-cc6ca9503bf4'::uuid AND ic.code = '6.2.3';
UPDATE public.profiles SET bio = 'GEO-AFRIQUE DRILLERS est une entreprise sp├⌐cialis├⌐e dans lΓÇÖex├⌐cution de sondages de reconnaissance de sol et essais in situ. Depuis sa cr├⌐ation; G.A.D accompagne les projets de construction et dΓÇÖam├⌐nagement gr├óce ├á une expertise reconnue da', updated_at = NOW() WHERE id = '963279c3-0cb2-5096-a5f1-dcbc3f22eb4d'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '963279c3-0cb2-5096-a5f1-dcbc3f22eb4d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '963279c3-0cb2-5096-a5f1-dcbc3f22eb4d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '963279c3-0cb2-5096-a5f1-dcbc3f22eb4d'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'L''ing├⌐nieur topographe mesure et analyse le terrain pour pr├⌐parer des projets de construction ou d''am├⌐nagement. utilise des instruments de pr├⌐cision et des technologies GPS pour collecter des donn├⌐es exactes. r├⌐alise des plans et cartes et colla', updated_at = NOW() WHERE id = '1d04b02f-9772-5e7c-b234-0b9eeb42d69d'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '1d04b02f-9772-5e7c-b234-0b9eeb42d69d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '1d04b02f-9772-5e7c-b234-0b9eeb42d69d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '6.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '1d04b02f-9772-5e7c-b234-0b9eeb42d69d'::uuid AND ic.code = '6.2.3';
UPDATE public.profiles SET bio = 'GEOMAREC est une entreprise sp├⌐cialis├⌐e en climatisation; ├⌐nergies solaires; chauffage; piscines et plomberie g├⌐n├⌐ral. Nous accompagnons les particuliers et les professionnels en proposant des solutions fiables; durables et adapt├⌐es ├á chaque be', updated_at = NOW() WHERE id = '2a429a91-1c18-5086-9047-0961a89f7d19'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '2a429a91-1c18-5086-9047-0961a89f7d19'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2a429a91-1c18-5086-9047-0961a89f7d19'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2a429a91-1c18-5086-9047-0961a89f7d19'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2a429a91-1c18-5086-9047-0961a89f7d19'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2a429a91-1c18-5086-9047-0961a89f7d19'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2a429a91-1c18-5086-9047-0961a89f7d19'::uuid AND ic.code = '3.2.2';
UPDATE public.profiles SET bio = 'Ma├«trisez chaque d├⌐tail du terrain avec GEOMATRIX. Experts en ing├⌐nierie et topographie ├á Agadir; nous donnons vie ├á vos projets avec pr├⌐cision et innovation. Lev├⌐s; plans 2D/3D; scanner laser; drones : nous sommes votre partenaire de confiance', updated_at = NOW() WHERE id = '50631b24-cf44-59f6-a3be-e2febbd21374'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '50631b24-cf44-59f6-a3be-e2febbd21374'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '50631b24-cf44-59f6-a3be-e2febbd21374'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '6.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '50631b24-cf44-59f6-a3be-e2febbd21374'::uuid AND ic.code = '6.2.3';
UPDATE public.profiles SET bio = 'Gmr est votre garant et partenaire id├⌐al dans le domaine dΓÇÖinstallation des ascenseurs et des syst├¿mes de mobilit├⌐ compl├⌐mentaires. Notre principe est clair; assurer une installation fluide alliant les meilleures technologies et lΓÇÖexcellence d', updated_at = NOW() WHERE id = 'bbb752e3-4aae-50c0-abfa-30d7dc26836f'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'bbb752e3-4aae-50c0-abfa-30d7dc26836f'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'bbb752e3-4aae-50c0-abfa-30d7dc26836f'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.9'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'bbb752e3-4aae-50c0-abfa-30d7dc26836f'::uuid AND ic.code = '3.2.9';
DELETE FROM public.profile_internal_categories WHERE profile_id = '12d5376d-b3bd-5c9b-a933-737179018692'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '12d5376d-b3bd-5c9b-a933-737179018692'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '12d5376d-b3bd-5c9b-a933-737179018692'::uuid AND ic.code = '8.5.3';
UPDATE public.profiles SET bio = 'Green Atlas Studio est sp├⌐cialis├⌐ dans la conception; lΓÇÖam├⌐nagement et lΓÇÖentretien des espaces verts. Nous imaginons et cr├⌐ons des espaces ext├⌐rieurs harmonieux; esth├⌐tiques et durables; adapt├⌐s ├á lΓÇÖarchitecture; ├á lΓÇÖenvironnement et ', updated_at = NOW() WHERE id = '3cd97b0d-5a06-5590-bbde-3a9ac36d079d'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '3cd97b0d-5a06-5590-bbde-3a9ac36d079d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '3cd97b0d-5a06-5590-bbde-3a9ac36d079d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.3.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '3cd97b0d-5a06-5590-bbde-3a9ac36d079d'::uuid AND ic.code = '5.3.3';
UPDATE public.profiles SET bio = 'En innovant chaque jour; GYPTEC participe ├á lΓÇÖhabitat de demain : plus sain; plus s├╗r; plus ├⌐volutif Notre but est non seulement dΓÇÖoffrir des produits avec des niveaux de performance ├⌐lev├⌐s; mais ├⌐galement des produits qui respectent l''envir', updated_at = NOW() WHERE id = 'f736cf6b-265a-5f19-9f24-a1c200b9f667'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'f736cf6b-265a-5f19-9f24-a1c200b9f667'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f736cf6b-265a-5f19-9f24-a1c200b9f667'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'f736cf6b-265a-5f19-9f24-a1c200b9f667'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'H-FER NEGOCE est une soci├⌐t├⌐ sp├⌐cialis├⌐e dans la fabrication et la r├⌐alisation de constructions m├⌐talliques sur mesure. Nous proposons des solutions adapt├⌐es aux besoins des professionnels et des particuliers : charpentes m├⌐talliques; escalier', updated_at = NOW() WHERE id = '9fd5f091-b9ee-5576-9961-f277bcf945ea'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '9fd5f091-b9ee-5576-9961-f277bcf945ea'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9fd5f091-b9ee-5576-9961-f277bcf945ea'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.6'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9fd5f091-b9ee-5576-9961-f277bcf945ea'::uuid AND ic.code = '3.1.6';
UPDATE public.profiles SET bio = 'HAGEMEYER est un partenaire Fable dans les domaines du b├ótiment; de l''Energie et de lΓÇÖindustrie. L''engagement de HAGEMEYER est de r├⌐pondre aux besoins de ses clients en apportant des solutions de qualit├⌐. Central dΓÇÖachat Peinture & Isolation th', updated_at = NOW() WHERE id = '411aa138-c838-59e5-ab73-108cecbe57cf'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '411aa138-c838-59e5-ab73-108cecbe57cf'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '411aa138-c838-59e5-ab73-108cecbe57cf'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.7'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '411aa138-c838-59e5-ab73-108cecbe57cf'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '411aa138-c838-59e5-ab73-108cecbe57cf'::uuid AND ic.code = '3.2.7';
UPDATE public.profiles SET bio = 'Ham-Archi est une agence d''architecture bas├⌐e ├á Casablanca; au Maroc. Elle est dirig├⌐e par Houssine Abdallaoui Maane et propose des services en architecture; design et am├⌐nagement int├⌐rieur. L''agence intervient sur divers types de projets; qu''ils', updated_at = NOW() WHERE id = 'b4af7e55-9043-53a5-8a38-21cf8e5f0908'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b4af7e55-9043-53a5-8a38-21cf8e5f0908'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b4af7e55-9043-53a5-8a38-21cf8e5f0908'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b4af7e55-9043-53a5-8a38-21cf8e5f0908'::uuid AND ic.code = '5.1.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b10c8182-7d17-5d86-a346-e336a8c66383'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b10c8182-7d17-5d86-a346-e336a8c66383'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b10c8182-7d17-5d86-a346-e336a8c66383'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'HAVA HARD TRADE est une soci├⌐t├⌐ sp├⌐cialis├⌐e dans la quincaillerie de b├ótiment et la fourniture de composants pour lΓÇÖam├⌐nagement int├⌐rieur. Nous proposons une large gamme de produits destin├⌐s aux professionnels du b├ótiment; aux menuisiers; a', updated_at = NOW() WHERE id = '4b0bca9a-90e3-51c9-bd98-70b85cf7293d'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '4b0bca9a-90e3-51c9-bd98-70b85cf7293d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '4b0bca9a-90e3-51c9-bd98-70b85cf7293d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '4b0bca9a-90e3-51c9-bd98-70b85cf7293d'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'HBA Studio est une agence dΓÇÖarchitecture situ├⌐e ├á Marrakech; sp├⌐cialis├⌐e dans la conception dΓÇÖespaces uniques; en harmonie avec lΓÇÖidentit├⌐ culturelle et la lumi├¿re singuli├¿re de la ville ocre. ├Ç travers chaque projet; nous transformons v', updated_at = NOW() WHERE id = 'e82093a3-3723-5144-8f4c-ce9c72c38749'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e82093a3-3723-5144-8f4c-ce9c72c38749'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e82093a3-3723-5144-8f4c-ce9c72c38749'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e82093a3-3723-5144-8f4c-ce9c72c38749'::uuid AND ic.code = '5.1.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '7b1e603a-59cb-5401-a6fb-fbf1df8b17ba'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7b1e603a-59cb-5401-a6fb-fbf1df8b17ba'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7b1e603a-59cb-5401-a6fb-fbf1df8b17ba'::uuid AND ic.code = '3.4.2';
UPDATE public.profiles SET bio = 'Travaux de terrassement et voirie et reseau divers assainissement; eau potable; eclairage publics travaux de viabilisation d''une lotissement travaux de genies civils Situ├⌐e ├á Casablanca; Helpworks prend en charge tous vos travaux publics. Depuis 201', updated_at = NOW() WHERE id = '0c6c9d0d-d9a1-5ea2-b9ef-84916e1bff7d'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '0c6c9d0d-d9a1-5ea2-b9ef-84916e1bff7d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '0c6c9d0d-d9a1-5ea2-b9ef-84916e1bff7d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '0c6c9d0d-d9a1-5ea2-b9ef-84916e1bff7d'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '0c6c9d0d-d9a1-5ea2-b9ef-84916e1bff7d'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Vous construisez une villa ou une maison ? Commencez sur des bases solides. Hexagon Geosurveys accompagne les particuliers et promoteurs immobiliers dans leurs projets de construction gr├óce ├á des relev├⌐s topographiques pr├⌐cis; des mod├⌐lisations 3', updated_at = NOW() WHERE id = 'c72692c0-ee70-5226-bf8e-2269d208a3aa'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c72692c0-ee70-5226-bf8e-2269d208a3aa'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c72692c0-ee70-5226-bf8e-2269d208a3aa'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '6.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c72692c0-ee70-5226-bf8e-2269d208a3aa'::uuid AND ic.code = '6.2.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ccdb95a3-8054-5a89-bc17-a279fbdb9c0a'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ccdb95a3-8054-5a89-bc17-a279fbdb9c0a'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ccdb95a3-8054-5a89-bc17-a279fbdb9c0a'::uuid AND ic.code = '3.5.2';
UPDATE public.profiles SET bio = 'HITECH-INFO est un soci├⌐t├⌐ de marchand du mat├⌐riel informatique et bureautique -n├⌐goce il offre des service : installation des camera serviuellence installation des r├⌐seaux installation des nouvel technologie installation audio - vid├⌐o installat', updated_at = NOW() WHERE id = '60c584a6-3dc1-58d4-bbd4-1d24de0fd533'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '60c584a6-3dc1-58d4-bbd4-1d24de0fd533'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '60c584a6-3dc1-58d4-bbd4-1d24de0fd533'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '60c584a6-3dc1-58d4-bbd4-1d24de0fd533'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '60c584a6-3dc1-58d4-bbd4-1d24de0fd533'::uuid AND ic.code = '7.5.2';
UPDATE public.profiles SET bio = 'HN BLOOM Distributeur des solutions s├⌐curit├⌐ ├⌐lectroniques et physiques Repr├⌐sentant exclusif de la marque SMART G4 CONTROL des solutions domotique. Sp├⌐cialis├⌐e dans l etude ;installation et la commercialisation des solutions pour les march├⌐s d', updated_at = NOW() WHERE id = '360bda5a-f429-5b17-a19d-4891f9ed870a'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '360bda5a-f429-5b17-a19d-4891f9ed870a'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '360bda5a-f429-5b17-a19d-4891f9ed870a'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '360bda5a-f429-5b17-a19d-4891f9ed870a'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '360bda5a-f429-5b17-a19d-4891f9ed870a'::uuid AND ic.code = '7.5.2';
UPDATE public.profiles SET bio = 'HORIZON CONSEILS & DEVELOPPEMENT est une entit├⌐ compos├⌐e dΓÇÖing├⌐nieurs; de techniciens et de dessinateurs sp├⌐cialis├⌐s dans diff├⌐rents domaines (structure; fluides; ├⌐lectricit├⌐; thermique; etc.). Il intervient ├á diff├⌐rentes ├⌐tapes dΓÇÖun pr', updated_at = NOW() WHERE id = '58daa950-1e54-5955-a66c-3853951bb936'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '58daa950-1e54-5955-a66c-3853951bb936'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '58daa950-1e54-5955-a66c-3853951bb936'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '58daa950-1e54-5955-a66c-3853951bb936'::uuid AND ic.code = '3.4.2';
UPDATE public.profiles SET bio = 'Entreprise reconnue pour son expertise dans les domaines de la domotique; de la vid├⌐osurveillance; du c├óblage r├⌐seaux et de la s├⌐curit├⌐. ├ëlectricit├⌐ et climatisation ├á une ├⌐quipe d''ing├⌐nieurs et de techniciens hautement qualifi├⌐s; nous prop', updated_at = NOW() WHERE id = 'b1fac96c-54de-5f38-9700-6d242988c55e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b1fac96c-54de-5f38-9700-6d242988c55e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b1fac96c-54de-5f38-9700-6d242988c55e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b1fac96c-54de-5f38-9700-6d242988c55e'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b1fac96c-54de-5f38-9700-6d242988c55e'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b1fac96c-54de-5f38-9700-6d242988c55e'::uuid AND ic.code = '7.5.2';
UPDATE public.profiles SET bio = 'IADIS est une entreprise marocaine sp├⌐cialis├⌐e dans la distribution de fournitures; ├⌐quipements et solutions industrielles destin├⌐es aux professionnels de lΓÇÖindustrie; du b├ótiment; de la maintenance et des services techniques. Nous accompagnons', updated_at = NOW() WHERE id = '8e886a6a-9256-595b-88b9-422b78533125'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '8e886a6a-9256-595b-88b9-422b78533125'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '8e886a6a-9256-595b-88b9-422b78533125'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.6'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '8e886a6a-9256-595b-88b9-422b78533125'::uuid AND ic.code = '3.2.6';
UPDATE public.profiles SET bio = 'Sp├⌐cialistes de la Mousse Polyur├⌐thane Projet├⌐e ICYNENE est une soci├⌐t├⌐ sp├⌐cialis├⌐e dans l''application professionnelle de mousse polyur├⌐thane projet├⌐e pour l''isolation thermique et acoustique des b├ótiments. Notre r├┤le est d''accompagner part', updated_at = NOW() WHERE id = '80bba3b5-50dd-5535-b5f7-3beeebc6406c'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '80bba3b5-50dd-5535-b5f7-3beeebc6406c'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '80bba3b5-50dd-5535-b5f7-3beeebc6406c'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.7'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '80bba3b5-50dd-5535-b5f7-3beeebc6406c'::uuid AND ic.code = '3.2.7';
UPDATE public.profiles SET bio = 'IMMAR ├ëTUDES; bureau dΓÇÖ├⌐tudes techniques bas├⌐ au Maroc; est sp├⌐cialis├⌐ en ing├⌐nierie du b├ótiment et des infrastructures. Nous intervenons sur lΓÇÖensemble des phases de vos projets : ├⌐tudes de structures; VRD; lots techniques; ├⌐tudes dΓÇÖex', updated_at = NOW() WHERE id = 'b97715fe-3dff-5064-82bf-b28a2dc6ea6c'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b97715fe-3dff-5064-82bf-b28a2dc6ea6c'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b97715fe-3dff-5064-82bf-b28a2dc6ea6c'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b97715fe-3dff-5064-82bf-b28a2dc6ea6c'::uuid AND ic.code = '3.4.2';
UPDATE public.profiles SET bio = 'Groupe d''architectes et sp├⌐cialistes dans la cr├⌐ation de contenu visuel pour les professionnels. Nous travaillons avec des agences d''architecture; des promoteurs immobiliers et ma├«tres d''ouvrages dans tout le pays. Leur d├⌐fi consiste ├á produire d', updated_at = NOW() WHERE id = 'f6701fdf-2bf7-5e5e-92e6-0237f1cc979c'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'f6701fdf-2bf7-5e5e-92e6-0237f1cc979c'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f6701fdf-2bf7-5e5e-92e6-0237f1cc979c'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'f6701fdf-2bf7-5e5e-92e6-0237f1cc979c'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'Societer specialis├⌐ dans la distribution d''equipement de securit├⌐ et vetement de travail .nos valeur seront a la hauteur de vos attente .', updated_at = NOW() WHERE id = 'e00bfc6d-fe30-5fe3-a631-49910b132c06'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e00bfc6d-fe30-5fe3-a631-49910b132c06'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e00bfc6d-fe30-5fe3-a631-49910b132c06'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e00bfc6d-fe30-5fe3-a631-49910b132c06'::uuid AND ic.code = '3.5.2';
UPDATE public.profiles SET bio = 'Indubois est une entreprise marocaine sp├⌐cialis├⌐e dans la menuiserie industrielle en bois; offrant des solutions sur mesure pour les portes; placards; dressings et cuisines. Fond├⌐e en 2017; elle op├¿re sous la forme juridique de Soci├⌐t├⌐ ├á Respon', updated_at = NOW() WHERE id = '31bc9652-c568-5b6a-abea-d6c626f011c4'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '31bc9652-c568-5b6a-abea-d6c626f011c4'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '31bc9652-c568-5b6a-abea-d6c626f011c4'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '31bc9652-c568-5b6a-abea-d6c626f011c4'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '31bc9652-c568-5b6a-abea-d6c626f011c4'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'INK AND FABRIK est le partenaire id├⌐al pour r├⌐pondre ├á vos besoins. Que vous souhaitiez affirmer lΓÇÖidentit├⌐ de votre marque; garantir la s├⌐curit├⌐ de vos employ├⌐s; ou personnaliser vos ├⌐v├⌐nements; nous vous accompagnons ├á chaque ├⌐tape. Ave', updated_at = NOW() WHERE id = 'b4f94c7d-0f85-5195-afef-0a1715d9d5fa'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b4f94c7d-0f85-5195-afef-0a1715d9d5fa'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b4f94c7d-0f85-5195-afef-0a1715d9d5fa'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b4f94c7d-0f85-5195-afef-0a1715d9d5fa'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'Fond├⌐e en 2009 ├á Mekn├¿s; INNOPLATRE Distribution est sp├⌐cialis├⌐e dans les solutions de second ┼ôuvre au Maroc. LΓÇÖentreprise accompagne les professionnels du b├ótiment et les particuliers en proposant des solutions fiables et conformes aux norme', updated_at = NOW() WHERE id = '4d090b4f-55d9-5d0f-95ec-077bbbb60fe1'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '4d090b4f-55d9-5d0f-95ec-077bbbb60fe1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '4d090b4f-55d9-5d0f-95ec-077bbbb60fe1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '4d090b4f-55d9-5d0f-95ec-077bbbb60fe1'::uuid AND ic.code = '4.4.2';
UPDATE public.profiles SET bio = 'ISODEC est une entreprise sp├⌐cialis├⌐e dans les travaux de r├⌐novation et dΓÇÖam├⌐nagement int├⌐rieur pour particuliers et professionnels. Forte de plus de 25 ans dΓÇÖexp├⌐rience dans le domaine; notre ├⌐quipe r├⌐alise des projets cl├⌐s en main : clo', updated_at = NOW() WHERE id = '67796985-0882-52ca-8ddf-f74af40dbb4e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '67796985-0882-52ca-8ddf-f74af40dbb4e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '67796985-0882-52ca-8ddf-f74af40dbb4e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '67796985-0882-52ca-8ddf-f74af40dbb4e'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'ISODUR sΓÇÖengage ├á fournir la meilleure isolation thermique et acoustique au Maroc; en faisant ├⌐merger une industrie locale de produits innovants qui valorise pleinement les comp├⌐tences nationales. Nous sommes d├⌐termin├⌐s ├á accompagner et souten', updated_at = NOW() WHERE id = 'c710e082-9514-5841-a80f-bca5220eeaf2'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c710e082-9514-5841-a80f-bca5220eeaf2'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c710e082-9514-5841-a80f-bca5220eeaf2'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.7'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c710e082-9514-5841-a80f-bca5220eeaf2'::uuid AND ic.code = '3.2.7';
UPDATE public.profiles SET bio = 'La soci├⌐t├⌐ Isolfix est une entreprise marocaine sp├⌐cialis├⌐e dans les travaux et la distribution d''isolation thermique; phonique et acoustique; ainsi que dans l''├⌐tanch├⌐it├⌐ et les rev├¬tements sp├⌐ciaux. Domaines d''expertise ISOLFIX propose une g', updated_at = NOW() WHERE id = '7b506d1c-f04f-58e7-8fc5-fa0ad7120243'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '7b506d1c-f04f-58e7-8fc5-fa0ad7120243'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7b506d1c-f04f-58e7-8fc5-fa0ad7120243'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.7'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7b506d1c-f04f-58e7-8fc5-fa0ad7120243'::uuid AND ic.code = '3.2.7';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'a2221aee-5fee-5a83-9de5-8e0c1a640fe6'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'a2221aee-5fee-5a83-9de5-8e0c1a640fe6'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'a2221aee-5fee-5a83-9de5-8e0c1a640fe6'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'IXINA Agadir est sp├⌐cialis├⌐e dans la conception; la fourniture et l''installation de cuisines ├⌐quip├⌐es sur mesure ainsi que de solutions d''am├⌐nagement int├⌐rieur. Adoss├⌐e ├á un r├⌐seau international pr├⌐sent dans plus de 20 pays; l''enseigne propo', updated_at = NOW() WHERE id = '7c48354b-da6b-5c8f-a37f-ec73ac279582'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '7c48354b-da6b-5c8f-a37f-ec73ac279582'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7c48354b-da6b-5c8f-a37f-ec73ac279582'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7c48354b-da6b-5c8f-a37f-ec73ac279582'::uuid AND ic.code = '4.2.3';
UPDATE public.profiles SET bio = '┘å╪¡┘å ┘ü┘è Jardinier & ├ël├⌐gance de la Maison ┘å╪ñ┘à┘å ╪¿╪ú┘å ╪º┘ä╪¼┘à╪º┘ä ╪º┘ä╪¡┘é┘è┘é┘è ┘è╪¿╪»╪ú ┘à┘å ╪º┘ä╪«╪º╪▒╪¼ ┘ê┘è┘à╪¬╪» ╪Ñ┘ä┘ë ╪ú╪╣┘à╪º┘é ╪º┘ä╪¬┘ü╪º╪╡┘è┘ä ╪º┘ä╪»╪º╪«┘ä┘è╪⌐. ┘å┘é╪»┘à ╪«╪»┘à╪º╪¬ ┘à╪¬┘â╪º┘à┘ä╪⌐ ┘ü┘è ╪¬┘å╪│┘è┘é ╪º┘ä╪¡╪»╪º╪ª┘é╪î ', updated_at = NOW() WHERE id = '15f6cbdb-25d0-5c80-81a9-c11324f079bb'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '15f6cbdb-25d0-5c80-81a9-c11324f079bb'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '15f6cbdb-25d0-5c80-81a9-c11324f079bb'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.3.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '15f6cbdb-25d0-5c80-81a9-c11324f079bb'::uuid AND ic.code = '5.3.3';
UPDATE public.profiles SET bio = 'La briqueterie JBEL ANNOUR est une entreprise marocaine fond├⌐e en 2007; sp├⌐cialis├⌐e dans la fabrication de briques rouges et de mat├⌐riaux de construction. Bas├⌐e ├á Mohammedia; elle dispose dΓÇÖune des usines les plus modernes dΓÇÖAfrique; avec un', updated_at = NOW() WHERE id = '2da8103b-8bf8-593a-8f36-f1f4a42e1bd0'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '2da8103b-8bf8-593a-8f36-f1f4a42e1bd0'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2da8103b-8bf8-593a-8f36-f1f4a42e1bd0'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2da8103b-8bf8-593a-8f36-f1f4a42e1bd0'::uuid AND ic.code = '3.5.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '1167c24a-ec56-5759-be2b-a7cd91658b83'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '1167c24a-ec56-5759-be2b-a7cd91658b83'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '1167c24a-ec56-5759-be2b-a7cd91658b83'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'KAS ELECTRIQUE EST UNE SOCIETE DE SERVICES ET VENTE EN RESEAUX INDUSTRIELS. NOTRE MISSION CONSISTE A CONCEVOIR; REALISER; GERER ET DEVELOPPER DES SOLUTIONS ADAPTER AU BESOIN DU MARCHE INDUSTRIEL MAROCAIN. PARMI NOS SERVICES : 1 ) R├⌐alisation des armo', updated_at = NOW() WHERE id = '80a799fe-cb3e-5be3-9e1c-b071de8fbf17'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '80a799fe-cb3e-5be3-9e1c-b071de8fbf17'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '80a799fe-cb3e-5be3-9e1c-b071de8fbf17'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '80a799fe-cb3e-5be3-9e1c-b071de8fbf17'::uuid AND ic.code = '3.2.3';
UPDATE public.profiles SET bio = 'Activit├⌐s Kech Design Menuiserie g├⌐n├⌐rale (particuliers & professionnels) Agencement int├⌐rieur : cuisines; dressings; salles de bain; biblioth├¿ques; meubles TV; buffets; chambres ├á coucher; salons marocains; tables basses; tables traditionnelles', updated_at = NOW() WHERE id = '29edbcce-2192-52d5-b9ce-6b092552d66e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '29edbcce-2192-52d5-b9ce-6b092552d66e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '29edbcce-2192-52d5-b9ce-6b092552d66e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '29edbcce-2192-52d5-b9ce-6b092552d66e'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '29edbcce-2192-52d5-b9ce-6b092552d66e'::uuid AND ic.code = '3.3.4';
DELETE FROM public.profile_internal_categories WHERE profile_id = '08d5d6d0-fb1d-5760-abdc-5ed161802b6b'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '08d5d6d0-fb1d-5760-abdc-5ed161802b6b'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '08d5d6d0-fb1d-5760-abdc-5ed161802b6b'::uuid AND ic.code = '4.2.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = '7304e7a6-7c7a-5d5d-bf81-f9212adcd803'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7304e7a6-7c7a-5d5d-bf81-f9212adcd803'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7304e7a6-7c7a-5d5d-bf81-f9212adcd803'::uuid AND ic.code = '4.3.4';
UPDATE public.profiles SET bio = 'Etanch├⌐it├⌐ du Casa nord Chaleur et ├⌐l├⌐gance; notre passion dans chaque foyer. Des po├¬les ├á bois aux chemin├⌐es suspendues; des accessoires raffin├⌐s aux tuiles impeccables; d├⌐couvrez l''art du confort chez nous. De la chaleur ├á l''esth├⌐tique; d', updated_at = NOW() WHERE id = '7c6a8733-667f-505c-9316-a04fa686c38c'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '7c6a8733-667f-505c-9316-a04fa686c38c'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7c6a8733-667f-505c-9316-a04fa686c38c'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.6'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7c6a8733-667f-505c-9316-a04fa686c38c'::uuid AND ic.code = '3.2.6';
UPDATE public.profiles SET bio = 'Depuis sa cr├⌐ation; La Washateria sΓÇÖest impos├⌐e comme une r├⌐f├⌐rence incontournable dans le secteur du nettoyage et de la r├⌐novation en fin de chantier. Sp├⌐cialis├⌐e dans le pon├ºage et le dressage du marbre ainsi que le pon├ºage de la mosa├»qu', updated_at = NOW() WHERE id = '442f985b-b804-5a41-84ca-98347add0cd2'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '442f985b-b804-5a41-84ca-98347add0cd2'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '442f985b-b804-5a41-84ca-98347add0cd2'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.6.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '442f985b-b804-5a41-84ca-98347add0cd2'::uuid AND ic.code = '8.6.1';
UPDATE public.profiles SET bio = 'CIBTP est un Laboratoire du Centre dΓÇÖIng├⌐nierie du BTP sp├⌐cialis├⌐ dans les ├⌐tudes; les essais et le contr├┤le dans les domaines de la g├⌐otechnique des sols; des mat├⌐riaux de construction; de l''ing├⌐nierie du b├ótiment; du g├⌐nie civil; de la g', updated_at = NOW() WHERE id = 'f4f55046-79f7-5b56-b32d-e42d32873858'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'f4f55046-79f7-5b56-b32d-e42d32873858'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f4f55046-79f7-5b56-b32d-e42d32873858'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'f4f55046-79f7-5b56-b32d-e42d32873858'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'LAHLOU WORKERS; entreprise de construction fond├⌐e en 2022; s''appuie sur une solide exp├⌐rience internationale dans la r├⌐alisation d''ouvrages de prestige. Sp├⌐cialis├⌐s dans les h├┤tels de luxe; complexes r├⌐sidentiels haut de gamme et immeubles de b', updated_at = NOW() WHERE id = '1654a8d5-a27b-548d-a50f-a51789c06895'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '1654a8d5-a27b-548d-a50f-a51789c06895'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '1654a8d5-a27b-548d-a50f-a51789c06895'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '1654a8d5-a27b-548d-a50f-a51789c06895'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Le Carr├⌐ dΓÇÖ├ël├⌐gance est une soci├⌐t├⌐ sp├⌐cialis├⌐e dans la d├⌐coration int├⌐rieure et la conception architecturale 2D/3D; bas├⌐e sur la cr├⌐ativit├⌐; la pr├⌐cision et le sens du d├⌐tail. Gr├óce ├á notre atelier; nous offrons un accompagnement co', updated_at = NOW() WHERE id = '7151481a-4454-503c-9e35-eaa60522f2e9'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '7151481a-4454-503c-9e35-eaa60522f2e9'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7151481a-4454-503c-9e35-eaa60522f2e9'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7151481a-4454-503c-9e35-eaa60522f2e9'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'Fond├⌐e en 2013; LEADER PAK s''est impos├⌐e comme une r├⌐f├⌐rence incontournable gr├óce ├á son expertise; son engagement envers la qualit├⌐ et son innovation constante. Sous la marque VIDAL; lΓÇÖentreprise d├⌐veloppe et commercialise une gamme compl├¿t', updated_at = NOW() WHERE id = '047fa3c3-0682-5518-ba14-40789a20995d'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '047fa3c3-0682-5518-ba14-40789a20995d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '047fa3c3-0682-5518-ba14-40789a20995d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '047fa3c3-0682-5518-ba14-40789a20995d'::uuid AND ic.code = '3.3.1';
UPDATE public.profiles SET bio = 'Ledcom est une entreprise marocaine sp├⌐cialis├⌐e dans la distribution et lΓÇÖint├⌐gration de solutions dΓÇÖautomatismes; de contr├┤le dΓÇÖacc├¿s et de syst├¿mes de s├⌐curit├⌐. Nous accompagnons les promoteurs immobiliers; industriels et acteurs du te', updated_at = NOW() WHERE id = 'abf301a9-f0e7-5260-bd8f-87c44fc160f0'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'abf301a9-f0e7-5260-bd8f-87c44fc160f0'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'abf301a9-f0e7-5260-bd8f-87c44fc160f0'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'abf301a9-f0e7-5260-bd8f-87c44fc160f0'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'Depuis sa cr├⌐ation en 2007; LEGBTP se veut ├¬tre un laboratoire g├⌐otechnique leader dans le domaine du BTP au Maroc. En effet; il a d├⌐velopp├⌐ son champ dΓÇÖactivit├⌐s au fur et ├á mesure de son ├⌐volution. Celui-ci englobe actuellement les ├⌐tudes', updated_at = NOW() WHERE id = '6eaffd4d-fac0-5f44-b5bc-c149acc27cca'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '6eaffd4d-fac0-5f44-b5bc-c149acc27cca'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6eaffd4d-fac0-5f44-b5bc-c149acc27cca'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '6eaffd4d-fac0-5f44-b5bc-c149acc27cca'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Bienvenue chez ste lemzzali cerame. vente carrelage local et importation. sanitaire / robinetterie. ville de safi. 0669003214. instagram = lemzzalicerame.', updated_at = NOW() WHERE id = '26cd4f14-3c7f-5d76-9e7f-e097ed3c7fa4'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '26cd4f14-3c7f-5d76-9e7f-e097ed3c7fa4'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '26cd4f14-3c7f-5d76-9e7f-e097ed3c7fa4'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '26cd4f14-3c7f-5d76-9e7f-e097ed3c7fa4'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '26cd4f14-3c7f-5d76-9e7f-e097ed3c7fa4'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '26cd4f14-3c7f-5d76-9e7f-e097ed3c7fa4'::uuid AND ic.code = '3.2.2';
UPDATE public.profiles SET bio = 'LEXMATERIEL est votre partenaire de confiance pour la location et le cr├⌐dit-bail de mat├⌐riel de levage et de chantier au Maroc. Notre objectif est clair : vous offrir des solutions de location fiables; flexibles et performantes pour r├⌐pondre ├á tou', updated_at = NOW() WHERE id = 'f977f667-c261-5e60-acee-1937ee84cb03'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'f977f667-c261-5e60-acee-1937ee84cb03'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f977f667-c261-5e60-acee-1937ee84cb03'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '1.1.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'f977f667-c261-5e60-acee-1937ee84cb03'::uuid AND ic.code = '1.1.5';
UPDATE public.profiles SET bio = 'Nous aidons les architectes; les designers d''int├⌐rieur; les promoteurs immobiliers et les agences de branding ├á raconter leur histoire en cr├⌐ant des images haute fid├⌐lit├⌐; des animations et des exp├⌐riences virtuelles qui r├⌐sonnent avec leur aud', updated_at = NOW() WHERE id = '56e72d26-1a18-515e-b187-5612739ca747'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '56e72d26-1a18-515e-b187-5612739ca747'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '56e72d26-1a18-515e-b187-5612739ca747'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '56e72d26-1a18-515e-b187-5612739ca747'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'Laboratoire marocain d''ing├⌐nierie et de la G├⌐otechnique (LMIG) est Laboratoire de renomm├⌐e ├á la r├⌐gion F├¿s Mekn├¿s (Essais; ├ëtudes et Expertises) ├⌐tait cr├⌐er pour cible de la client├¿le qualifi├⌐e et comp├⌐tente dans le domaine du BTP. Notre ', updated_at = NOW() WHERE id = 'e7ff4f68-8a2f-547c-bd91-662f281dd1e7'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e7ff4f68-8a2f-547c-bd91-662f281dd1e7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e7ff4f68-8a2f-547c-bd91-662f281dd1e7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e7ff4f68-8a2f-547c-bd91-662f281dd1e7'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Location d''engins et Manitou au Maroc. Locarad est votre partenaire de confiance pour la location de mat├⌐riel de levage; de manutention et de chantier; sp├⌐cialis├⌐ dans les chariots t├⌐lescopiques Manitou avec conducteur. Bas├⌐s ├á T├⌐mara; nous int', updated_at = NOW() WHERE id = 'df9bc7a9-09df-58e0-97f1-54012bb3d344'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'df9bc7a9-09df-58e0-97f1-54012bb3d344'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'df9bc7a9-09df-58e0-97f1-54012bb3d344'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '1.1.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'df9bc7a9-09df-58e0-97f1-54012bb3d344'::uuid AND ic.code = '1.1.5';
DELETE FROM public.profile_internal_categories WHERE profile_id = '2b5322ae-f2a9-56be-8fb6-d60541b72794'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2b5322ae-f2a9-56be-8fb6-d60541b72794'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2b5322ae-f2a9-56be-8fb6-d60541b72794'::uuid AND ic.code = '3.5.2';
UPDATE public.profiles SET bio = 'Logimar SARL; bas├⌐e au Maroc; est sp├⌐cialis├⌐e dans l''importation et la distribution nationale de bois et panneaux. Fond├⌐e sur des partenariats internationaux (notamment scandinaves); l''entreprise s''est impos├⌐e comme un acteur cl├⌐ du secteur gr├ó', updated_at = NOW() WHERE id = 'c64c75f8-4ef5-5a50-a717-52b558858459'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c64c75f8-4ef5-5a50-a717-52b558858459'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c64c75f8-4ef5-5a50-a717-52b558858459'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c64c75f8-4ef5-5a50-a717-52b558858459'::uuid AND ic.code = '8.5.4';
UPDATE public.profiles SET bio = 'LUXALIGHT est la premi├¿re chaine de magasin sp├⌐cialis├⌐e en produits d''├⌐clairage au Maroc. Distributeur exclusif de plusieurs marques europ├⌐ennes: Brilliant AG; New Garden; Iris Cristal; Soflight; Beghelli; LightOne et Stiel. LUXALIGHT est lΓÇÖadr', updated_at = NOW() WHERE id = 'b5eaaf16-a811-5643-be84-782cb4ede276'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b5eaaf16-a811-5643-be84-782cb4ede276'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b5eaaf16-a811-5643-be84-782cb4ede276'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b5eaaf16-a811-5643-be84-782cb4ede276'::uuid AND ic.code = '8.5.3';
UPDATE public.profiles SET bio = 'PREFALIA r├⌐pond aux besoins des professionnels du BTP en fournissant du b├⌐ton pr├¬t ├á lΓÇÖemploi et des blocs agglom├⌐r├⌐s de haute qualit├⌐. Nos produits; garantissent r├⌐sistance; r├⌐gularit├⌐ et rapidit├⌐ de mise en ┼ôuvre. Gr├óce ├á des central', updated_at = NOW() WHERE id = '13d974f0-4e19-5907-ad11-d7e22782e725'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '13d974f0-4e19-5907-ad11-d7e22782e725'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '13d974f0-4e19-5907-ad11-d7e22782e725'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '13d974f0-4e19-5907-ad11-d7e22782e725'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Nous sommes la Maison M├⌐diterran├⌐enne ; fabricant de mobilier et dΓÇÖameublement bas├⌐ ├á Marrakech au quartier industriel depuis 1999. Nous accompagnons les professionnels (h├┤tels; restaurants; architectesΓÇª) ainsi que les particuliers dans lΓÇÖa', updated_at = NOW() WHERE id = '2fdb25f5-7867-538f-8a8e-5a06840cc600'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '2fdb25f5-7867-538f-8a8e-5a06840cc600'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2fdb25f5-7867-538f-8a8e-5a06840cc600'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2fdb25f5-7867-538f-8a8e-5a06840cc600'::uuid AND ic.code = '5.1.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '48105aaa-5697-584b-a35f-876d49916911'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '48105aaa-5697-584b-a35f-876d49916911'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '48105aaa-5697-584b-a35f-876d49916911'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'MAKRODOOR est un leader marocain dans la fabrication; la fourniture et lΓÇÖinstallation de solutions compl├¿tes pour les portes industrielles; les ├⌐quipements de quai et les syst├¿mes logistiques. Forts dΓÇÖune expertise technique solide; nous r├⌐pon', updated_at = NOW() WHERE id = 'afef5b63-e64a-5ef7-b06f-5dc91bbd20fb'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'afef5b63-e64a-5ef7-b06f-5dc91bbd20fb'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'afef5b63-e64a-5ef7-b06f-5dc91bbd20fb'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'afef5b63-e64a-5ef7-b06f-5dc91bbd20fb'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'Un acteur majeur dans l''importation et la distribution de carrelage; sanitaire et accessoires au Maroc. MallZellij se concentre essentiellement sur lΓÇÖimportation et la vente en B2B et B2C de carreaux et sanitaires provenant principalement d''Italie; ', updated_at = NOW() WHERE id = '7b50b45f-ce3d-5de0-af66-9e846943c8a8'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '7b50b45f-ce3d-5de0-af66-9e846943c8a8'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7b50b45f-ce3d-5de0-af66-9e846943c8a8'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7b50b45f-ce3d-5de0-af66-9e846943c8a8'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7b50b45f-ce3d-5de0-af66-9e846943c8a8'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7b50b45f-ce3d-5de0-af66-9e846943c8a8'::uuid AND ic.code = '4.2.4';
UPDATE public.profiles SET bio = 'SBEL Maroc; un des leaders en Afrique du Nord; vous propose son expertise dans le levage; la manutention et le transport exceptionnel. Fid├¿le ├á ses principes fondateurs; nous mettons ├á votre disposition une ├⌐quipe d├⌐di├⌐e ├á la qualit├⌐ et la s├⌐', updated_at = NOW() WHERE id = '5cc4a7ea-3156-51de-a6b4-b7b39b6354c0'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '5cc4a7ea-3156-51de-a6b4-b7b39b6354c0'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '5cc4a7ea-3156-51de-a6b4-b7b39b6354c0'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '1.1.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '5cc4a7ea-3156-51de-a6b4-b7b39b6354c0'::uuid AND ic.code = '1.1.5';
UPDATE public.profiles SET bio = 'Nous somme societ├⌐ specialis├⌐ dans le domaine de fabrication b├ótiment modulaire sur mesure Bureau de chantier bureau de vente Gu├⌐rite de gardiennage Etc…', updated_at = NOW() WHERE id = 'c5ed677b-dce5-5569-8f6a-684a78513031'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c5ed677b-dce5-5569-8f6a-684a78513031'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c5ed677b-dce5-5569-8f6a-684a78513031'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.6.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c5ed677b-dce5-5569-8f6a-684a78513031'::uuid AND ic.code = '8.6.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = '0bab561a-8218-58b0-a395-2d6106705030'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '0bab561a-8218-58b0-a395-2d6106705030'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '0bab561a-8218-58b0-a395-2d6106705030'::uuid AND ic.code = '4.2.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '6d533300-134b-57e0-9b89-e82b3f5ff53c'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6d533300-134b-57e0-9b89-e82b3f5ff53c'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '6d533300-134b-57e0-9b89-e82b3f5ff53c'::uuid AND ic.code = '5.1.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e5fea6ce-a705-5fdd-98f1-dd4dacb5ab40'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e5fea6ce-a705-5fdd-98f1-dd4dacb5ab40'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e5fea6ce-a705-5fdd-98f1-dd4dacb5ab40'::uuid AND ic.code = '4.2.3';
UPDATE public.profiles SET bio = 'Les fen├¬tres MEKSA & VEKA & ROTO & SFS allient performances thermiques et acoustiques; design; s├⌐curit├⌐ et un large choix de formes; de coloris et de finitions. D├⌐clin├⌐s en diff├⌐rentes gammes; nos produits vous permettent de trouver la solution ', updated_at = NOW() WHERE id = '6c1d2318-dee2-5959-8a69-75888f777e49'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '6c1d2318-dee2-5959-8a69-75888f777e49'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6c1d2318-dee2-5959-8a69-75888f777e49'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '6c1d2318-dee2-5959-8a69-75888f777e49'::uuid AND ic.code = '4.2.1';
UPDATE public.profiles SET bio = 'M├ëNAGE-PRO est une entreprise sp├⌐cialis├⌐e dans le nettoyage professionnel; intervenant aupr├¿s des particuliers;et entreprises Nos services : ΓÇó Grands m├⌐nages (domiciles; villas; appartements) ΓÇó Nettoyage de fin de chantier ΓÇó Nettoyage de bu', updated_at = NOW() WHERE id = '750cca8a-ae5b-568d-966b-2c49f5101a43'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '750cca8a-ae5b-568d-966b-2c49f5101a43'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '750cca8a-ae5b-568d-966b-2c49f5101a43'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.6.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '750cca8a-ae5b-568d-966b-2c49f5101a43'::uuid AND ic.code = '8.6.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '7fedafaa-4cff-582c-90d9-a39e4ae61508'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7fedafaa-4cff-582c-90d9-a39e4ae61508'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7fedafaa-4cff-582c-90d9-a39e4ae61508'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'METALNOV est une entreprise marocaine sp├⌐cialis├⌐e dans le mobilier urbain; la fonderie et les travaux m├⌐talliques. Nous fabriquons et posons des bancs; poubelles; poteaux dΓÇÖ├⌐clairage; pi├¿ces en fonte pour r├⌐seaux dΓÇÖeau et structures m├⌐talli', updated_at = NOW() WHERE id = 'd624e5a9-5a96-5793-af30-c77e5b93ee45'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'd624e5a9-5a96-5793-af30-c77e5b93ee45'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'd624e5a9-5a96-5793-af30-c77e5b93ee45'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'd624e5a9-5a96-5793-af30-c77e5b93ee45'::uuid AND ic.code = '8.5.2';
UPDATE public.profiles SET bio = 'Metastone est une entreprise sp├⌐cialis├⌐e dans lΓÇÖextraction; la transformation; la vente et la pose de pierre naturelle; notamment le travertin et lΓÇÖardoise. Fortement enracin├⌐s dans le riche patrimoine g├⌐ologique de Taza (Maroc); nous s├⌐lecti', updated_at = NOW() WHERE id = '25172669-5e34-58b0-8a13-229f6057f9a2'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '25172669-5e34-58b0-8a13-229f6057f9a2'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '25172669-5e34-58b0-8a13-229f6057f9a2'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '25172669-5e34-58b0-8a13-229f6057f9a2'::uuid AND ic.code = '3.3.1';
UPDATE public.profiles SET bio = 'Soci├⌐t├⌐s sp├⌐cialis├⌐es dans la collecte; la mesure et la repr├⌐sentation des donn├⌐es g├⌐ospatiales. Elles offrent une gamme de services li├⌐s ├á la cartographie; ├á la g├⌐od├⌐sie; ├á la t├⌐l├⌐d├⌐tection et ├á d''autres technologies de mesure et de ', updated_at = NOW() WHERE id = '6a10bce5-c997-5e9e-a202-3a0283b52908'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '6a10bce5-c997-5e9e-a202-3a0283b52908'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6a10bce5-c997-5e9e-a202-3a0283b52908'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '6.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '6a10bce5-c997-5e9e-a202-3a0283b52908'::uuid AND ic.code = '6.2.3';
UPDATE public.profiles SET bio = 'Nous sommes fabricants et grossistes sp├⌐cialis├⌐s dans le bardage PVC et les panneaux d├⌐coratifs haut de gamme. Bas├⌐s ├á Casablanca; nous proposons des produits innovants; esth├⌐tiques et durables pour r├⌐pondre aux besoins des revendeurs et des pr', updated_at = NOW() WHERE id = '056c5c92-2459-5149-86cf-51969eb52cf4'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '056c5c92-2459-5149-86cf-51969eb52cf4'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '056c5c92-2459-5149-86cf-51969eb52cf4'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '056c5c92-2459-5149-86cf-51969eb52cf4'::uuid AND ic.code = '4.4.2';
UPDATE public.profiles SET bio = 'Mon Grillage est un fournisseur sp├⌐cialis├⌐ dans les solutions de s├⌐curisation des espaces. Nous accompagnons les particuliers; les entreprises et les collectivit├⌐s avec des produits fiables; esth├⌐tiques et con├ºus pour durer. Nous proposons des s', updated_at = NOW() WHERE id = 'e8f8c441-f099-5228-a0cf-d9c3e5ba2046'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e8f8c441-f099-5228-a0cf-d9c3e5ba2046'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e8f8c441-f099-5228-a0cf-d9c3e5ba2046'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e8f8c441-f099-5228-a0cf-d9c3e5ba2046'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'Je suis freelance sp├⌐cialis├⌐ en design architectural et visualisation 3D. Mon objectif : transformer vos id├⌐es en images percutantes et r├⌐alistes qui parlent ├á vos clients. Que ce soit pour des projets r├⌐sidentiels; commerciaux ou institutionnel', updated_at = NOW() WHERE id = '9bcc27e6-3c31-5f09-8ee2-b9662ae02990'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '9bcc27e6-3c31-5f09-8ee2-b9662ae02990'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9bcc27e6-3c31-5f09-8ee2-b9662ae02990'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9bcc27e6-3c31-5f09-8ee2-b9662ae02990'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'Mr Clim ΓÇô Centrale dΓÇÖachat & sp├⌐cialiste climatisation pour tous vos projets Mr Clim est ├á la fois centrale dΓÇÖachat et expert en climatisation; d├⌐di├⌐ aux professionnels de la grande distribution; promoteurs; installateurs et entreprises g├⌐n', updated_at = NOW() WHERE id = 'feab5e59-9f7f-5800-bd3e-e354e78c2fdc'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'feab5e59-9f7f-5800-bd3e-e354e78c2fdc'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'feab5e59-9f7f-5800-bd3e-e354e78c2fdc'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'feab5e59-9f7f-5800-bd3e-e354e78c2fdc'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'feab5e59-9f7f-5800-bd3e-e354e78c2fdc'::uuid AND ic.code = '3.2.5';
DELETE FROM public.profile_internal_categories WHERE profile_id = '5ba44125-0036-57e3-9fd0-919273143acc'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '5ba44125-0036-57e3-9fd0-919273143acc'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '5ba44125-0036-57e3-9fd0-919273143acc'::uuid AND ic.code = '4.2.1';
UPDATE public.profiles SET bio = 'MULTILUM Votre exigence est notre challenge MULTILUM est une entreprise dont le c┼ôur de m├⌐tier est la fabrication et la pose de tous types de menuiseries en aluminium et en verre pour vos locaux : portes dΓÇÖentr├⌐e; fen├¬tres et portes-fen├¬tres; b', updated_at = NOW() WHERE id = '886a2610-b8fc-5bd5-9b2c-ff69de264fef'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '886a2610-b8fc-5bd5-9b2c-ff69de264fef'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '886a2610-b8fc-5bd5-9b2c-ff69de264fef'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '886a2610-b8fc-5bd5-9b2c-ff69de264fef'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'MULTIRESEAUX SARL est un acteur majeur dans les installations ├⌐lectriques et informatiques au Maroc. Forte dΓÇÖune exp├⌐rience de plus de 15 ans; notre entreprise est reconnue pour sa fiabilit├⌐; son expertise technique et son engagement qualit├⌐; ga', updated_at = NOW() WHERE id = '25387be8-946c-5e74-8026-26cc07835d3f'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '25387be8-946c-5e74-8026-26cc07835d3f'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '25387be8-946c-5e74-8026-26cc07835d3f'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '25387be8-946c-5e74-8026-26cc07835d3f'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'SP├ëCIALISTE DE B├éTIMENT ET CONSTRUCTION MODULAIRE MUSTANG offre des b├ótiments et constructions modulaires adapt├⌐es ├á tous vos besoins; peu importe la taille de votre entreprise. MUSTANG sΓÇÖoccupe de la conception; design; construction et livrais', updated_at = NOW() WHERE id = '250bca65-5ea2-5055-83a1-23478311a0cd'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '250bca65-5ea2-5055-83a1-23478311a0cd'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '250bca65-5ea2-5055-83a1-23478311a0cd'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '250bca65-5ea2-5055-83a1-23478311a0cd'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'My Zdayn Invest est une entreprise marocaine innovante sp├⌐cialis├⌐e dans les travaux de construction; dΓÇÖam├⌐nagement et de b├⌐ton d├⌐coratif; avec une vision claire : transformer durablement le paysage du BTP au Maroc. Gr├óce ├á une combinaison de ', updated_at = NOW() WHERE id = 'ae30cf07-12e8-5460-aaea-39c2841f9d16'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ae30cf07-12e8-5460-aaea-39c2841f9d16'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ae30cf07-12e8-5460-aaea-39c2841f9d16'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ae30cf07-12e8-5460-aaea-39c2841f9d16'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ae30cf07-12e8-5460-aaea-39c2841f9d16'::uuid AND ic.code = '4.3.2';
UPDATE public.profiles SET bio = 'NW ACCESS est une entreprise sp├⌐cialis├⌐e dans le domaine de lΓÇÖaluminium; bas├⌐e ├á Tanger. Nous nous distinguons par une expertise compl├¿te qui englobe : ΓÇó LΓÇÖimportation et la distribution de moteurs et accessoires pour rideaux en aluminium; ', updated_at = NOW() WHERE id = 'c99a2676-8b3b-56d5-b861-e8fcfbcc9be9'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c99a2676-8b3b-56d5-b861-e8fcfbcc9be9'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c99a2676-8b3b-56d5-b861-e8fcfbcc9be9'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c99a2676-8b3b-56d5-b861-e8fcfbcc9be9'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'Nom de lΓÇÖEntreprise : NAIT DBOU BATIMENTS Localisation : Casablanca; Maroc Secteur dΓÇÖActivit├⌐ : ├ëtanch├⌐it├⌐ et Isolation Thermique et Acoustique ├Ç Propos de Nait Dbou Batiments Fond├⌐e ├á Casablanca; Nait Dbou Batiments est une entreprise maro', updated_at = NOW() WHERE id = 'de4a8041-5a04-53be-a650-9c0d2a5e9771'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'de4a8041-5a04-53be-a650-9c0d2a5e9771'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'de4a8041-5a04-53be-a650-9c0d2a5e9771'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.7'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'de4a8041-5a04-53be-a650-9c0d2a5e9771'::uuid AND ic.code = '3.2.7';
UPDATE public.profiles SET bio = 'Sp├⌐cialiste du nettoyage et de la protection nanotechnologique des surfaces traditionnelles marocaines : bejmat; zellige; carreaux de ciment beldi; pierre de Taza et marbre. Fond├⌐e en 2019; NanoProtects intervient dans les h├┤tels; riads et r├⌐siden', updated_at = NOW() WHERE id = '56bd3b71-b57d-50c5-8c8e-6d03a93ba47c'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '56bd3b71-b57d-50c5-8c8e-6d03a93ba47c'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '56bd3b71-b57d-50c5-8c8e-6d03a93ba47c'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.6.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '56bd3b71-b57d-50c5-8c8e-6d03a93ba47c'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '56bd3b71-b57d-50c5-8c8e-6d03a93ba47c'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '56bd3b71-b57d-50c5-8c8e-6d03a93ba47c'::uuid AND ic.code = '8.6.1';
UPDATE public.profiles SET bio = 'Sp├⌐cialis├⌐e dans la commercialisation et lΓÇÖinstallation de mat├⌐riaux haut de gamme : marbre et granite; bruts ou transform├⌐s. Nous exploitons nos propres carri├¿res au Maroc; garantissant qualit├⌐; tra├ºabilit├⌐ et r├⌐gularit├⌐. Nous proposons ├', updated_at = NOW() WHERE id = '4df5d382-c243-5ed5-b639-46aaf17e76b6'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '4df5d382-c243-5ed5-b639-46aaf17e76b6'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '4df5d382-c243-5ed5-b639-46aaf17e76b6'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '4df5d382-c243-5ed5-b639-46aaf17e76b6'::uuid AND ic.code = '3.3.1';
UPDATE public.profiles SET bio = 'Depuis 1994; le laboratoire NBR fournit des services d''ing├⌐nierie de haute qualit├⌐. NBR Centre est sp├⌐cialis├⌐ dans le contr├┤le et la conception dΓÇÖouvrages en interaction avec le sol et les mat├⌐riaux de construction. Nous assurons des prestatio', updated_at = NOW() WHERE id = '747b4e54-0bdf-589a-b8cc-05d7d32addc7'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '747b4e54-0bdf-589a-b8cc-05d7d32addc7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '747b4e54-0bdf-589a-b8cc-05d7d32addc7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '747b4e54-0bdf-589a-b8cc-05d7d32addc7'::uuid AND ic.code = '3.4.2';
UPDATE public.profiles SET bio = 'Nextile est une entreprise sp├⌐cialis├⌐e dans la vente de v├¬tements de travail et d''EPI. Bien plus quΓÇÖun simple fournisseur; nous accompagnons nos clients dans le choix des tenues et protections les plus adapt├⌐es ├á leur environnement professionne', updated_at = NOW() WHERE id = '41af6f1b-4eb4-5ea9-a23a-d2debdc95a12'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '41af6f1b-4eb4-5ea9-a23a-d2debdc95a12'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '41af6f1b-4eb4-5ea9-a23a-d2debdc95a12'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '41af6f1b-4eb4-5ea9-a23a-d2debdc95a12'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'NexView est un service sp├⌐cialis├⌐ dans la cr├⌐ation de visites virtuelles 360┬░ immersives pour lΓÇÖimmobilier. Notre objectif est dΓÇÖaider agences et particuliers ├á mieux valoriser leurs biens ├á vendre ou ├á louer en offrant aux clients une exp├', updated_at = NOW() WHERE id = 'dba3c5bb-00f2-547f-abe1-879a23fca362'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'dba3c5bb-00f2-547f-abe1-879a23fca362'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'dba3c5bb-00f2-547f-abe1-879a23fca362'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'dba3c5bb-00f2-547f-abe1-879a23fca362'::uuid AND ic.code = '4.2.5';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'a56e92ff-d58a-5d9a-9f44-8cd427a10d80'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'a56e92ff-d58a-5d9a-9f44-8cd427a10d80'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'a56e92ff-d58a-5d9a-9f44-8cd427a10d80'::uuid AND ic.code = '8.5.3';
UPDATE public.profiles SET bio = 'Omari Zellige est un fabricant de carreaux marocains bas├⌐ ├á F├¿s; berceau historique de lΓÇÖartisanat du zellige. Sp├⌐cialis├⌐e dans la fabrication artisanale de carreaux en terre cuite ├⌐maill├⌐e; lΓÇÖentreprise perp├⌐tue un savoir-faire ancestral ', updated_at = NOW() WHERE id = '3d90d8be-2d25-5a6a-8114-37b913fd6fd8'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '3d90d8be-2d25-5a6a-8114-37b913fd6fd8'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '3d90d8be-2d25-5a6a-8114-37b913fd6fd8'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '3d90d8be-2d25-5a6a-8114-37b913fd6fd8'::uuid AND ic.code = '3.3.1';
UPDATE public.profiles SET bio = 'Fond├⌐e en 1985; Optima Peintures est une entreprise marocaine reconnue pour son expertise dans la fabrication de peintures; de colles et dΓÇÖ├⌐mulsions. Forts de notre savoir-faire acquis au fil des ann├⌐es; nous vous proposons une gamme compl├¿te de', updated_at = NOW() WHERE id = '7d322a35-dcf1-5dfd-9b6f-55d25b5f1824'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '7d322a35-dcf1-5dfd-9b6f-55d25b5f1824'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7d322a35-dcf1-5dfd-9b6f-55d25b5f1824'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7d322a35-dcf1-5dfd-9b6f-55d25b5f1824'::uuid AND ic.code = '3.3.2';
DELETE FROM public.profile_internal_categories WHERE profile_id = '9e4ee215-07c1-53c6-b74e-12531ab5022a'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9e4ee215-07c1-53c6-b74e-12531ab5022a'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9e4ee215-07c1-53c6-b74e-12531ab5022a'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'ORCA LUM ΓÇô Profil de soci├⌐t├⌐ Secteur dΓÇÖactivit├⌐ : Construction et menuiserie industrielle Sous-secteurs : Menuiserie aluminium : portes; fen├¬tres; fa├ºades; cloisons; volets; baies vitr├⌐es sur mesure Portes isothermes et solutions techniques ', updated_at = NOW() WHERE id = '96a7c268-9d94-51c7-a1e1-8aff5ba8b7a1'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '96a7c268-9d94-51c7-a1e1-8aff5ba8b7a1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '96a7c268-9d94-51c7-a1e1-8aff5ba8b7a1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '96a7c268-9d94-51c7-a1e1-8aff5ba8b7a1'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'PARADIS AM├ëNAGEMENT est une entreprise sp├⌐cialis├⌐e dans les travaux de menuiserie; agencement et am├⌐nagement int├⌐rieur et ext├⌐rieur. Forte dΓÇÖune solide exp├⌐rience dans le domaine; notre soci├⌐t├⌐ accompagne ses clients ΓÇö particuliers et pro', updated_at = NOW() WHERE id = '4f27022b-983e-5ff0-97f2-8fe42a539b95'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '4f27022b-983e-5ff0-97f2-8fe42a539b95'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '4f27022b-983e-5ff0-97f2-8fe42a539b95'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '4f27022b-983e-5ff0-97f2-8fe42a539b95'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'PARM fabrique et distribue exclusivement les produits du groupe ARDEX des solutions techniques certifi├⌐es pour la pose de carrelage / la r├⌐paration structurelle du b├⌐ton; l''├⌐tanch├⌐it├⌐ et le cuvelage; et les rev├¬tements de sol industriels. La ga', updated_at = NOW() WHERE id = 'c2cc9996-e951-5dd6-97d5-a42a1b3adf2d'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c2cc9996-e951-5dd6-97d5-a42a1b3adf2d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c2cc9996-e951-5dd6-97d5-a42a1b3adf2d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c2cc9996-e951-5dd6-97d5-a42a1b3adf2d'::uuid AND ic.code = '3.3.1';
UPDATE public.profiles SET bio = 'Depuis 2012; PE2S accompagne particuliers; professionnels et promoteurs immobiliers dans leurs projets dΓÇÖ├⌐lectricit├⌐; de domotique; de s├⌐curit├⌐ et de r├⌐seaux informatiques. Nous transformons chaque espace en un lieu moderne; s├╗r et intelligent', updated_at = NOW() WHERE id = 'ac6d6f51-0e3c-58d0-9dc6-98daae87a290'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ac6d6f51-0e3c-58d0-9dc6-98daae87a290'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ac6d6f51-0e3c-58d0-9dc6-98daae87a290'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ac6d6f51-0e3c-58d0-9dc6-98daae87a290'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ac6d6f51-0e3c-58d0-9dc6-98daae87a290'::uuid AND ic.code = '3.2.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '9056c079-eaf5-5665-ab5d-ae5958ddadd3'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9056c079-eaf5-5665-ab5d-ae5958ddadd3'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9056c079-eaf5-5665-ab5d-ae5958ddadd3'::uuid AND ic.code = '3.3.2';
UPDATE public.profiles SET bio = 'POINT TP est une soci├⌐t├⌐ dΓÇÖam├⌐nagement int├⌐rieur et ext├⌐rieur et de r├⌐novation qui concerne des travaux qui touchent ├á la structure ; la restauration et la remise en ├⌐tat des b├ótis dans leur ├⌐tat original; en respectant les logiques de con', updated_at = NOW() WHERE id = '6c5642e6-2797-5790-b4a8-803e86022929'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '6c5642e6-2797-5790-b4a8-803e86022929'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6c5642e6-2797-5790-b4a8-803e86022929'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.4.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '6c5642e6-2797-5790-b4a8-803e86022929'::uuid AND ic.code = '3.4.1';
UPDATE public.profiles SET bio = 'Polio Carrelage est une entreprise marocaine sp├⌐cialis├⌐e dans la vente de carrelage haut de gamme; de sanitaires et de solutions de rev├¬tement pour lΓÇÖhabitat et les projets professionnels. Elle propose une large gamme de carreaux (gr├¿s c├⌐rame; ', updated_at = NOW() WHERE id = '297a3f52-446c-5d73-aa18-58766ce728b8'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '297a3f52-446c-5d73-aa18-58766ce728b8'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '297a3f52-446c-5d73-aa18-58766ce728b8'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '297a3f52-446c-5d73-aa18-58766ce728b8'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '297a3f52-446c-5d73-aa18-58766ce728b8'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '297a3f52-446c-5d73-aa18-58766ce728b8'::uuid AND ic.code = '4.2.4';
UPDATE public.profiles SET bio = 'La vente et location des conteneurs maritimes pour construction stokage bureaux de chantier logement ouvrier shaw room situe en plien centre ville a 5 min de port6 du port de casa', updated_at = NOW() WHERE id = '8743148c-1b40-552b-820a-c9a640fdfc00'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '8743148c-1b40-552b-820a-c9a640fdfc00'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '8743148c-1b40-552b-820a-c9a640fdfc00'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '8743148c-1b40-552b-820a-c9a640fdfc00'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'POWEVOLT Innovation et qualit├⌐ dans les installations int├⌐grales avec une grande exp├⌐rience nationale et internationale Votre partenaire de confiance pour les solutions ├⌐lectriques; hydrauliques; de climatisation et de piscine. Chez Overboard; nou', updated_at = NOW() WHERE id = '30a92592-5d7c-5d8c-ad6e-a0502a8f723d'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '30a92592-5d7c-5d8c-ad6e-a0502a8f723d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '30a92592-5d7c-5d8c-ad6e-a0502a8f723d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '30a92592-5d7c-5d8c-ad6e-a0502a8f723d'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '30a92592-5d7c-5d8c-ad6e-a0502a8f723d'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '30a92592-5d7c-5d8c-ad6e-a0502a8f723d'::uuid AND ic.code = '3.2.5';
UPDATE public.profiles SET bio = 'Bonjour; Notre soci├⌐t├⌐ PRIORITY FIRE EQUIPMENT est sp├⌐cialis├⌐e dans lΓÇÖ├⌐tude; la fourniture; lΓÇÖinstallation; la maintenance et la formation dans le domaine des syst├¿mes de protection incendie. Nous proposons des solutions fiables; performante', updated_at = NOW() WHERE id = '1f80216a-2af9-5321-a077-19333d178155'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '1f80216a-2af9-5321-a077-19333d178155'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '1f80216a-2af9-5321-a077-19333d178155'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.8'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '1f80216a-2af9-5321-a077-19333d178155'::uuid AND ic.code = '3.2.8';
UPDATE public.profiles SET bio = 'PROAIRSTEEL est une entreprise marocaine sp├⌐cialis├⌐e dans lΓÇÖimportation et la distribution dΓÇÖ├⌐quipements de cuisine; de salle de bain et dΓÇÖam├⌐nagement ext├⌐rieur. Forte de son expertise dans le domaine de lΓÇÖacier inoxydable; PROAIRSTEEL pr', updated_at = NOW() WHERE id = 'ad881cc2-ed2e-51fe-b755-55f14d5d90a2'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ad881cc2-ed2e-51fe-b755-55f14d5d90a2'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ad881cc2-ed2e-51fe-b755-55f14d5d90a2'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ad881cc2-ed2e-51fe-b755-55f14d5d90a2'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ad881cc2-ed2e-51fe-b755-55f14d5d90a2'::uuid AND ic.code = '4.2.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'f1113850-0e4b-593a-b811-dcdfb5f9e1e7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'f1113850-0e4b-593a-b811-dcdfb5f9e1e7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'f1113850-0e4b-593a-b811-dcdfb5f9e1e7'::uuid AND ic.code = '4.2.1';
UPDATE public.profiles SET bio = 'PVC PROJECT ΓÇô Expert Italien de la menuiserie PVC REHAU au Maroc Bas├⌐e ├á Mohammedia; PVC PROJECT est une soci├⌐t├⌐ ├á capitaux italiens sp├⌐cialis├⌐e dans la fabrication de menuiseries PVC haut de gamme; en partenariat avec la marque allemande REH', updated_at = NOW() WHERE id = '7b631617-f04b-5821-9dc4-9b2c8ea29ee1'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '7b631617-f04b-5821-9dc4-9b2c8ea29ee1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7b631617-f04b-5821-9dc4-9b2c8ea29ee1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7b631617-f04b-5821-9dc4-9b2c8ea29ee1'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'Propoly Industry est une soci├⌐t├⌐ marocaine sp├⌐cialis├⌐e dans la fabrication et la transformation de mati├¿res plastiques. Bas├⌐e ├á Casablanca; lΓÇÖentreprise met ├á disposition son savoir-faire et ses ├⌐quipements industriels modernes pour r├⌐pond', updated_at = NOW() WHERE id = '9346c29f-3ff9-5d74-9fdb-039cee3ef96d'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '9346c29f-3ff9-5d74-9fdb-039cee3ef96d'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9346c29f-3ff9-5d74-9fdb-039cee3ef96d'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9346c29f-3ff9-5d74-9fdb-039cee3ef96d'::uuid AND ic.code = '4.3.5';
UPDATE public.profiles SET bio = 'NOUS NOUS ENGAGEONS ├Ç OFFRIR DES PRESTATIONS DE HAUTE QUALIT├ë POUR ASSURER DES ESPACES PROPRES ├Ç VIVRE. QUE VOUS SOYEZ UNE ENTREPRISE; UNE INSTITUTION OU UN PARTICULIER; NOUS PROPOSONS DES SOLUTIONS ADAPT├ëES ├Ç VOS BESOINS GR├éCE ├Ç UNE ├ëQUIPE QU', updated_at = NOW() WHERE id = 'c44f2551-c04f-5ba8-8d68-e343053a37fc'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c44f2551-c04f-5ba8-8d68-e343053a37fc'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c44f2551-c04f-5ba8-8d68-e343053a37fc'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.6.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c44f2551-c04f-5ba8-8d68-e343053a37fc'::uuid AND ic.code = '8.6.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '433c6235-ef86-54ef-885c-13b43dea1609'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '433c6235-ef86-54ef-885c-13b43dea1609'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '433c6235-ef86-54ef-885c-13b43dea1609'::uuid AND ic.code = '8.5.3';
UPDATE public.profiles SET bio = 'Rmarbre est un acteur majeur dans lΓÇÖextraction; la transformation et la distribution de marbre haut de gamme au Maroc et ├á l''international. Forts dΓÇÖun savoir-faire ancestral alli├⌐ ├á des technologies de pointe; nous fournissons des mat├⌐riaux dΓ', updated_at = NOW() WHERE id = '41148957-8c39-5ac6-a85d-10c90b80c781'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '41148957-8c39-5ac6-a85d-10c90b80c781'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '41148957-8c39-5ac6-a85d-10c90b80c781'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '41148957-8c39-5ac6-a85d-10c90b80c781'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'Agente immobili├¿re ind├⌐pendante ├á Agadir. J''accompagne la vente et la location; de la recherche du bien jusqu''├á la visite; pour les appartements comme pour les villas.', updated_at = NOW() WHERE id = '4867c782-7063-4153-bfe7-878e9483c7e6'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '4867c782-7063-4153-bfe7-878e9483c7e6'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '4867c782-7063-4153-bfe7-878e9483c7e6'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = 'NULL'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '4867c782-7063-4153-bfe7-878e9483c7e6'::uuid AND ic.code = 'NULL';
UPDATE public.profiles SET bio = 'Depuis 1993 READY BAT con├ºoit; ├⌐tudie et suit vos projet. Avec plus de 32 ans d''exp├⌐riences forte; d├⌐vou├⌐e et ax├⌐e sur la satisfaction client; et une qu├¬te continue de qualit├⌐ de classe internationale; READY BAT poss├¿de des capacit├⌐s in├⌐gal', updated_at = NOW() WHERE id = '36966192-66de-5a7b-8eb6-c5a7049006d2'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '36966192-66de-5a7b-8eb6-c5a7049006d2'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '36966192-66de-5a7b-8eb6-c5a7049006d2'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '36966192-66de-5a7b-8eb6-c5a7049006d2'::uuid AND ic.code = '3.4.2';
UPDATE public.profiles SET bio = 'RIAD STONE est une entreprise marocaine sp├⌐cialis├⌐e dans la marbrerie; la taille de pierre et le n├⌐goce de mat├⌐riaux min├⌐raux. Bas├⌐e ├á A├»n Atiq (T├⌐mara) - Rabat; elle accompagne les architectes; promoteurs et particuliers dans tous leurs proj', updated_at = NOW() WHERE id = 'c04daf82-8af1-52ca-9922-2bfe8e8e82f0'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c04daf82-8af1-52ca-9922-2bfe8e8e82f0'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c04daf82-8af1-52ca-9922-2bfe8e8e82f0'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c04daf82-8af1-52ca-9922-2bfe8e8e82f0'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'Fond├⌐e en 1998 sur une expertise de terrain et une vision dΓÇÖexcellence; Robot S├⌐curit├⌐ Process est une entreprise sp├⌐cialis├⌐e dans lΓÇÖinstallation; la mise en service; la maintenance et la r├⌐novation des syst├¿mes de d├⌐tection incendie; exti', updated_at = NOW() WHERE id = 'c6ea1934-8dba-5fed-aaab-948ab6eff157'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c6ea1934-8dba-5fed-aaab-948ab6eff157'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c6ea1934-8dba-5fed-aaab-948ab6eff157'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c6ea1934-8dba-5fed-aaab-948ab6eff157'::uuid AND ic.code = '3.3.1';
UPDATE public.profiles SET bio = 'Travaux de placo pl├ótre (BA13) Je suis sp├⌐cialis├⌐ dans l''installation de cloisons s├¿ches; faux plafonds et doublages en plaques de pl├ótre (BA13). Mon travail permet d''assurer une finition propre; une isolation phonique efficace; et une bonne pr├⌐', updated_at = NOW() WHERE id = '9cfa4a18-a3d9-5f00-ac58-a59b4dc45948'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '9cfa4a18-a3d9-5f00-ac58-a59b4dc45948'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9cfa4a18-a3d9-5f00-ac58-a59b4dc45948'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.7'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '9cfa4a18-a3d9-5f00-ac58-a59b4dc45948'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '9cfa4a18-a3d9-5f00-ac58-a59b4dc45948'::uuid AND ic.code = '3.2.7';
UPDATE public.profiles SET bio = 'Importation et distribution des vernis (polyur├⌐thane; nitrocellulosique; acrylique; polyester; hudro pour int├⌐rieur ├á ext├⌐rieur); peintures (pr├⌐paration RAL; couleur system); mastic en couleurs; effets sp├⌐ciaux (craquelet;fluorescent; filant; ef', updated_at = NOW() WHERE id = 'd4cb5d4a-6d99-514b-912d-17c94bcd8666'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'd4cb5d4a-6d99-514b-912d-17c94bcd8666'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'd4cb5d4a-6d99-514b-912d-17c94bcd8666'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'd4cb5d4a-6d99-514b-912d-17c94bcd8666'::uuid AND ic.code = '3.3.2';
UPDATE public.profiles SET bio = 'ROST MARBRE est une entreprise sp├⌐cialis├⌐e dans lΓÇÖexploitation et la transformation de pierre naturelle; notamment le nouveau Pierre Taza gris et beige. Nous assurons lΓÇÖextraction; la d├⌐coupe sur mesure selon les dimensions demand├⌐es; ainsi qu', updated_at = NOW() WHERE id = 'ebe6a67e-98de-5b31-a761-eb1a5fcae8ea'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ebe6a67e-98de-5b31-a761-eb1a5fcae8ea'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ebe6a67e-98de-5b31-a761-eb1a5fcae8ea'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ebe6a67e-98de-5b31-a761-eb1a5fcae8ea'::uuid AND ic.code = '3.3.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b32ac3ce-43a6-59c2-9a0f-670b7ccf95e1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b32ac3ce-43a6-59c2-9a0f-670b7ccf95e1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '6.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b32ac3ce-43a6-59c2-9a0f-670b7ccf95e1'::uuid AND ic.code = '6.2.3';
UPDATE public.profiles SET bio = 'Fond├⌐e avec la volont├⌐ dΓÇÖapporter des solutions fiables et innovantes dans le domaine du chauffage; climatisation; ventilation et ├⌐nergies renouvelables; S.O.S Thermique sΓÇÖest impos├⌐e comme un acteur de r├⌐f├⌐rence dans le secteur du g├⌐nie cl', updated_at = NOW() WHERE id = 'c56c7dd2-ecbd-56cd-984e-b5a5c3e5ab09'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c56c7dd2-ecbd-56cd-984e-b5a5c3e5ab09'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c56c7dd2-ecbd-56cd-984e-b5a5c3e5ab09'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c56c7dd2-ecbd-56cd-984e-b5a5c3e5ab09'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c56c7dd2-ecbd-56cd-984e-b5a5c3e5ab09'::uuid AND ic.code = '3.2.5';
UPDATE public.profiles SET bio = 'S2G est une soci├⌐t├⌐ sp├⌐cialis├⌐e dans les domaines de g├⌐otechnique; hydrog├⌐ologie et g├⌐ophysique; Ing├⌐nierie des sols et mat├⌐riaux; expertise technique; contr├┤le de qualit├⌐ des travaux; contr├┤le NDT; investigation maritimes; Ing├⌐nierie de ', updated_at = NOW() WHERE id = '22cecb76-7288-5352-a9a1-04e25e0645bc'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '22cecb76-7288-5352-a9a1-04e25e0645bc'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '22cecb76-7288-5352-a9a1-04e25e0645bc'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '22cecb76-7288-5352-a9a1-04e25e0645bc'::uuid AND ic.code = '3.4.2';
UPDATE public.profiles SET bio = 'SAEZ est une entreprise sp├⌐cialis├⌐e dans la fabrication; la vente et la location de grues ├á tour. Forte dΓÇÖune longue exp├⌐rience dans le secteur; elle propose des solutions innovantes et fiables adapt├⌐es aux besoins de la construction moderne. S', updated_at = NOW() WHERE id = '91bc13e3-230f-5533-a718-fd97dfbf5eee'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '91bc13e3-230f-5533-a718-fd97dfbf5eee'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '91bc13e3-230f-5533-a718-fd97dfbf5eee'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '91bc13e3-230f-5533-a718-fd97dfbf5eee'::uuid AND ic.code = '3.5.2';
UPDATE public.profiles SET bio = 'Soci├⌐t├⌐ SAHARA STORES ; est active depuis 2004. Intervient dans le domaine dΓÇÖ├⌐quipement de b├óche et de store; b├óche camion; tente de chantierΓÇª Nous offrons une gamme vari├⌐e de : Stores Int├⌐rieurs : enrouleurs avec motorisation OU avec chain', updated_at = NOW() WHERE id = '3514fbf6-dcae-50d6-8a67-2c578bf005ff'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '3514fbf6-dcae-50d6-8a67-2c578bf005ff'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '3514fbf6-dcae-50d6-8a67-2c578bf005ff'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '3514fbf6-dcae-50d6-8a67-2c578bf005ff'::uuid AND ic.code = '4.3.3';
UPDATE public.profiles SET bio = 'Sanitaire Dare Alfadl a ├⌐t├⌐ fond├⌐ en 2022 par M. Aboulfadl Youssef ; un visionnaire passionn├⌐ par lΓÇÖexcellence en mati├¿re de mat├⌐riel sanitaire. Avec une expertise approfondie et une d├⌐votion pour la qualit├⌐; M. Aboulfadl a ├⌐tabli Monsanita', updated_at = NOW() WHERE id = '3eca3cb6-3e23-5587-8db9-303ae302d945'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '3eca3cb6-3e23-5587-8db9-303ae302d945'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '3eca3cb6-3e23-5587-8db9-303ae302d945'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '3eca3cb6-3e23-5587-8db9-303ae302d945'::uuid AND ic.code = '3.2.2';
DELETE FROM public.profile_internal_categories WHERE profile_id = '89c9fcd8-6cbd-5fab-8828-be5ecff58b51'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '89c9fcd8-6cbd-5fab-8828-be5ecff58b51'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '89c9fcd8-6cbd-5fab-8828-be5ecff58b51'::uuid AND ic.code = '3.2.2';
UPDATE public.profiles SET bio = 'SANIWORLD; votre partenaire de confiance avec plus de 24 ans d''exp├⌐rience sur le march├⌐ marocain. Nous sommes fiers d''offrir un service de qualit├⌐ dans les domaines vari├⌐s de l''industrie marocaine; de l''agriculture et de la distribution de syst├¿m', updated_at = NOW() WHERE id = 'd29b8efe-0bb8-5a15-ae3f-655149aacc4b'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'd29b8efe-0bb8-5a15-ae3f-655149aacc4b'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'd29b8efe-0bb8-5a15-ae3f-655149aacc4b'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'd29b8efe-0bb8-5a15-ae3f-655149aacc4b'::uuid AND ic.code = '4.3.4';
DELETE FROM public.profile_internal_categories WHERE profile_id = '87aaa768-a6cb-5093-aad2-e02b11fdce85'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '87aaa768-a6cb-5093-aad2-e02b11fdce85'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '87aaa768-a6cb-5093-aad2-e02b11fdce85'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '87aaa768-a6cb-5093-aad2-e02b11fdce85'::uuid AND ic.code = '3.2.2';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e3fda8c2-0842-5fc9-8f94-4f45c04b13ce'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e3fda8c2-0842-5fc9-8f94-4f45c04b13ce'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e3fda8c2-0842-5fc9-8f94-4f45c04b13ce'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e3fda8c2-0842-5fc9-8f94-4f45c04b13ce'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e3fda8c2-0842-5fc9-8f94-4f45c04b13ce'::uuid AND ic.code = '4.3.4';
DELETE FROM public.profile_internal_categories WHERE profile_id = '416318e1-1ef6-5104-8c0f-44a9a49ff035'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '416318e1-1ef6-5104-8c0f-44a9a49ff035'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '416318e1-1ef6-5104-8c0f-44a9a49ff035'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '416318e1-1ef6-5104-8c0f-44a9a49ff035'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '416318e1-1ef6-5104-8c0f-44a9a49ff035'::uuid AND ic.code = '4.2.4';
UPDATE public.profiles SET bio = 'Saroutech est une entreprise marocaine sp├⌐cialis├⌐e dans les syst├¿mes de verrouillage intelligents. Elle propose une gamme vari├⌐e de serrures connect├⌐es adapt├⌐es aux besoins des particuliers et des professionnels. Ses produits combinent plusieurs', updated_at = NOW() WHERE id = '1e3524f3-2af4-533b-8380-da0ba4fa7bb7'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '1e3524f3-2af4-533b-8380-da0ba4fa7bb7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '1e3524f3-2af4-533b-8380-da0ba4fa7bb7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '1e3524f3-2af4-533b-8380-da0ba4fa7bb7'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '1e3524f3-2af4-533b-8380-da0ba4fa7bb7'::uuid AND ic.code = '7.5.2';
UPDATE public.profiles SET bio = 'SBTP (SMART BUILDING TECHNOLOGIES POWER) est une entreprise marocaine sp├⌐cialis├⌐e dans la fabrication et la commercialisation de solutions techniques pour le secteur du BTP. ├Ç travers sa marque POWER; SBTP propose une gamme compl├¿te de produits de', updated_at = NOW() WHERE id = '7c85ceee-b192-5cb5-a5be-f595f59b93de'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '7c85ceee-b192-5cb5-a5be-f595f59b93de'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7c85ceee-b192-5cb5-a5be-f595f59b93de'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7c85ceee-b192-5cb5-a5be-f595f59b93de'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7c85ceee-b192-5cb5-a5be-f595f59b93de'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7c85ceee-b192-5cb5-a5be-f595f59b93de'::uuid AND ic.code = '3.3.2';
UPDATE public.profiles SET bio = 'SDK WOOD ΓÇô LΓÇÖexcellence du bois; ge╠üne╠üration apr├¿s ge╠üne╠üration Forte dΓÇÖun savoir-faire transmis depuis trois g├⌐n├⌐rations; SDK WOOD sΓÇÖimpose aujourdΓÇÖhui comme lΓÇÖun des leaders du marche╠ü du bois au Maroc. Sp├⌐cialis├⌐s dans lΓÇÖim', updated_at = NOW() WHERE id = 'da124f0f-1607-5bd9-b6ce-b3f257ae708f'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'da124f0f-1607-5bd9-b6ce-b3f257ae708f'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'da124f0f-1607-5bd9-b6ce-b3f257ae708f'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'da124f0f-1607-5bd9-b6ce-b3f257ae708f'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'Notre soci├⌐t├⌐ est sp├⌐cialis├⌐e dans lΓÇÖam├⌐nagement cl├⌐ en main des espaces int├⌐rieurs et ext├⌐rieurs; alliant design; confort et fonctionnalit├⌐. Nous intervenons depuis la conception jusquΓÇÖ├á la r├⌐alisation; afin de cr├⌐er des environnement', updated_at = NOW() WHERE id = 'e2ffc9f9-8476-5efa-859d-e221845292a8'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e2ffc9f9-8476-5efa-859d-e221845292a8'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e2ffc9f9-8476-5efa-859d-e221845292a8'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e2ffc9f9-8476-5efa-859d-e221845292a8'::uuid AND ic.code = '4.4.2';
DELETE FROM public.profile_internal_categories WHERE profile_id = '4df4e655-ec70-5f13-bfb7-d826e727c68a'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '4df4e655-ec70-5f13-bfb7-d826e727c68a'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '4df4e655-ec70-5f13-bfb7-d826e727c68a'::uuid AND ic.code = '3.2.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '2fa7e266-94e1-5907-8fac-c602afc69a8e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2fa7e266-94e1-5907-8fac-c602afc69a8e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2fa7e266-94e1-5907-8fac-c602afc69a8e'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2fa7e266-94e1-5907-8fac-c602afc69a8e'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'SICATGB S.A.R.L est une soci├⌐t├⌐ marocaine sp├⌐cialis├⌐e dans la construction; le BTP; et la fourniture de mat├⌐riel de quincaillerie. Elle offre des services d''am├⌐nagement; de sous-traitance; et de formation en BTP; tout en participant ├á des proje', updated_at = NOW() WHERE id = '67fda7d6-9426-58e8-86b8-9ff975d42d38'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '67fda7d6-9426-58e8-86b8-9ff975d42d38'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '67fda7d6-9426-58e8-86b8-9ff975d42d38'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '67fda7d6-9426-58e8-86b8-9ff975d42d38'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'SITCA: Soci├⌐t├⌐ intelligente des Travaux de Construction et Am├⌐nagement a lΓÇÖhonneur de mettre ├á votre disposition lΓÇÖexpertise technique de son personnel et souhaite ├¬tre parmi vos partenaires. Nous vous informons que nous sommes ├á votre servi', updated_at = NOW() WHERE id = 'bbc01261-a78e-5c37-8a16-31dce23382bd'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'bbc01261-a78e-5c37-8a16-31dce23382bd'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'bbc01261-a78e-5c37-8a16-31dce23382bd'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'bbc01261-a78e-5c37-8a16-31dce23382bd'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'SkyScan Solutions est un cabinet sp├⌐cialis├⌐ en g├⌐omatique; topographie et solutions g├⌐ospatiales bas├⌐ ├á K├⌐nitra; au service des professionnels et des particuliers dans tout le Maroc. Nous proposons des prestations de haute pr├⌐cision : lev├⌐s t', updated_at = NOW() WHERE id = '2814469e-ca7f-547e-a02f-e1f1e3b59f8b'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '2814469e-ca7f-547e-a02f-e1f1e3b59f8b'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2814469e-ca7f-547e-a02f-e1f1e3b59f8b'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '6.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2814469e-ca7f-547e-a02f-e1f1e3b59f8b'::uuid AND ic.code = '6.2.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'a16df87f-a298-50f5-a5d7-970b72b46bc6'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'a16df87f-a298-50f5-a5d7-970b72b46bc6'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'a16df87f-a298-50f5-a5d7-970b72b46bc6'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'a16df87f-a298-50f5-a5d7-970b72b46bc6'::uuid AND ic.code = '3.2.3';
UPDATE public.profiles SET bio = 'SMETEC est une entreprise marocaine sp├⌐cialis├⌐e dans la conception; la r├⌐alisation et lΓÇÖam├⌐nagement dΓÇÖinfrastructures sportives cl├⌐ en main. Forte dΓÇÖune expertise reconnue dans le domaine; SMETEC accompagne ses clients publics et priv├⌐s ├á', updated_at = NOW() WHERE id = 'ffddb2ac-3cba-5d15-b362-0854060fa92c'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ffddb2ac-3cba-5d15-b362-0854060fa92c'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ffddb2ac-3cba-5d15-b362-0854060fa92c'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ffddb2ac-3cba-5d15-b362-0854060fa92c'::uuid AND ic.code = '4.3.3';
UPDATE public.profiles SET bio = 'La Soci├⌐t├⌐ dΓÇÖIng├⌐nierie du Paysage (SIP) est un bureau dΓÇÖ├⌐tudes sp├⌐cialis├⌐ dans la conception; la planification et le suivi des am├⌐nagements ext├⌐rieurs. Nos prestations : ΓÇô Am├⌐nagement des espaces verts ΓÇô ├ëtude et installation des r├', updated_at = NOW() WHERE id = 'c8fd9452-4f79-5f01-ad2f-44c117c971e1'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c8fd9452-4f79-5f01-ad2f-44c117c971e1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c8fd9452-4f79-5f01-ad2f-44c117c971e1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.3.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c8fd9452-4f79-5f01-ad2f-44c117c971e1'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c8fd9452-4f79-5f01-ad2f-44c117c971e1'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c8fd9452-4f79-5f01-ad2f-44c117c971e1'::uuid AND ic.code = '5.3.3';
UPDATE public.profiles SET bio = 'Nous sommes une entreprise sp├⌐cialis├⌐e dans le jardinage; lΓÇÖam├⌐nagement dΓÇÖespaces verts et le nettoyage de fin de chantier. Avec une expertise de plusieurs ann├⌐es dans le domaine; notre ├⌐quipe met son savoir-faire ├á votre service pour cr├⌐er', updated_at = NOW() WHERE id = '0c924e1d-69a5-5cd7-809a-366fd6a8bf29'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '0c924e1d-69a5-5cd7-809a-366fd6a8bf29'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '0c924e1d-69a5-5cd7-809a-366fd6a8bf29'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.3.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '0c924e1d-69a5-5cd7-809a-366fd6a8bf29'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '0c924e1d-69a5-5cd7-809a-366fd6a8bf29'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '8.6.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '0c924e1d-69a5-5cd7-809a-366fd6a8bf29'::uuid AND ic.code = '5.3.3';
UPDATE public.profiles SET bio = '├Ç propos de SOGETECH SOGETECH est une entreprise sp├⌐cialis├⌐e en topographie et ├⌐tudes techniques. Nous accompagnons nos clients dans leurs projets dΓÇÖam├⌐nagement; de cadastre; de g├⌐nie civil et de VRD gr├óce ├á une expertise reconnue; des outil', updated_at = NOW() WHERE id = 'e8989385-b43a-5749-acc3-8d67ea3c9d05'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e8989385-b43a-5749-acc3-8d67ea3c9d05'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e8989385-b43a-5749-acc3-8d67ea3c9d05'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '6.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e8989385-b43a-5749-acc3-8d67ea3c9d05'::uuid AND ic.code = '6.2.3';
UPDATE public.profiles SET bio = 'Solution Toiture est le repr├⌐sentant exclusif de la marque allemande RODECA au Maroc.Nous proposons des solutions innovantes en toiture et bardage; alliant ├⌐coconception; performance et esth├⌐tique gr├óce ├á nos mat├⌐riaux de pointe en polycarbonate', updated_at = NOW() WHERE id = '3fd090a9-4f62-57f7-9189-59fae0c57815'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '3fd090a9-4f62-57f7-9189-59fae0c57815'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '3fd090a9-4f62-57f7-9189-59fae0c57815'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.6'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '3fd090a9-4f62-57f7-9189-59fae0c57815'::uuid AND ic.code = '3.1.6';
DELETE FROM public.profile_internal_categories WHERE profile_id = '6129b61d-8049-53d4-8837-e7bc9a8155b8'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6129b61d-8049-53d4-8837-e7bc9a8155b8'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '6129b61d-8049-53d4-8837-e7bc9a8155b8'::uuid AND ic.code = '4.3.1';
UPDATE public.profiles SET bio = 'Sonajib ΓÇô Votre partenaire de confiance en carrelage; sanitaire et ├⌐lectrom├⌐nager Sonajib est une entreprise sp├⌐cialis├⌐e dans la vente au showroom et la distribution ├á lΓÇÖ├⌐chelle nationale de carrelage (local et import├⌐); sanitaires et ├⌐lec', updated_at = NOW() WHERE id = 'd5f4389c-3a26-5b2c-be85-623098472735'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'd5f4389c-3a26-5b2c-be85-623098472735'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'd5f4389c-3a26-5b2c-be85-623098472735'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'd5f4389c-3a26-5b2c-be85-623098472735'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'd5f4389c-3a26-5b2c-be85-623098472735'::uuid AND ic.code = '3.3.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '2fcdd72f-a8f8-53c7-99e7-9b753719cae9'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2fcdd72f-a8f8-53c7-99e7-9b753719cae9'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2fcdd72f-a8f8-53c7-99e7-9b753719cae9'::uuid AND ic.code = '4.2.3';
UPDATE public.profiles SET bio = 'Souss Therm est une entreprise bien ├⌐tablie ├á Marrakech et Agadir; sp├⌐cialis├⌐e dans lΓÇÖinstallation; la fourniture et la maintenance de climatisations. Avec un solide capital social et une immatriculation conforme; elle intervient aussi dans les ', updated_at = NOW() WHERE id = '49761da5-b40c-5a1a-a798-3c42a7f4af9b'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '49761da5-b40c-5a1a-a798-3c42a7f4af9b'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '49761da5-b40c-5a1a-a798-3c42a7f4af9b'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '49761da5-b40c-5a1a-a798-3c42a7f4af9b'::uuid AND ic.code = '3.2.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e2c78e9f-753b-5667-99c6-a658eecd22e7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e2c78e9f-753b-5667-99c6-a658eecd22e7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e2c78e9f-753b-5667-99c6-a658eecd22e7'::uuid AND ic.code = '3.5.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'cbc2743d-306a-5617-a8e4-5ed6127cb49b'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'cbc2743d-306a-5617-a8e4-5ed6127cb49b'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'cbc2743d-306a-5617-a8e4-5ed6127cb49b'::uuid AND ic.code = '3.3.5';
UPDATE public.profiles SET bio = 'Fourniture installation des :chauffe eaux solaire et ballon solaire 150L.200L.300L.500L. injection solaire. pompage solaire. hybride solaire', updated_at = NOW() WHERE id = '935911f0-f1dc-58f9-a41a-6020bdb88ffc'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '935911f0-f1dc-58f9-a41a-6020bdb88ffc'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '935911f0-f1dc-58f9-a41a-6020bdb88ffc'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '935911f0-f1dc-58f9-a41a-6020bdb88ffc'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '935911f0-f1dc-58f9-a41a-6020bdb88ffc'::uuid AND ic.code = '3.2.3';
UPDATE public.profiles SET bio = 'Nous sommes specialise dans le domaine de plomberie sanitaire et aussi chauffage et matereil et produit piscine', updated_at = NOW() WHERE id = '6add0935-6400-5b06-8bf2-6321a64246dc'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '6add0935-6400-5b06-8bf2-6321a64246dc'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6add0935-6400-5b06-8bf2-6321a64246dc'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6add0935-6400-5b06-8bf2-6321a64246dc'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6add0935-6400-5b06-8bf2-6321a64246dc'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '6add0935-6400-5b06-8bf2-6321a64246dc'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '6add0935-6400-5b06-8bf2-6321a64246dc'::uuid AND ic.code = '4.2.4';
UPDATE public.profiles SET bio = 'STORE ACCESS; une entreprise marocaine sp├⌐cialis├⌐e dans lΓÇÖimportation et la distribution de solutions technologiques et ├⌐lectroniques avanc├⌐es. Nous proposons une gamme compl├¿te de produits innovants couvrant les domaines de la s├⌐curit├⌐; du c', updated_at = NOW() WHERE id = '27018a2d-807e-5876-8b0d-9d8099987888'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '27018a2d-807e-5876-8b0d-9d8099987888'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '27018a2d-807e-5876-8b0d-9d8099987888'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '27018a2d-807e-5876-8b0d-9d8099987888'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '27018a2d-807e-5876-8b0d-9d8099987888'::uuid AND ic.code = '7.5.2';
UPDATE public.profiles SET bio = 'Sterixis Engineering ΓÇô Solid Foundations; Smart Solutions Bureau dΓÇÖ├⌐tudes pluridisciplinaire en ing├⌐nierie du b├ótiment et des infrastructures. Nous r├⌐alisons ├⌐tudes; diagnostics; mod├⌐lisation BIM; calculs de structure; suivi de travaux; audi', updated_at = NOW() WHERE id = '03d23db6-7243-5512-84ba-f66967d5808e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '03d23db6-7243-5512-84ba-f66967d5808e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '03d23db6-7243-5512-84ba-f66967d5808e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '03d23db6-7243-5512-84ba-f66967d5808e'::uuid AND ic.code = '3.4.2';
UPDATE public.profiles SET bio = 'STOCKAGE MAROC ΓÇô Votre sp├⌐cialiste en solutions de rayonnage et am├⌐nagement au Maroc Depuis plus de 38 ans; STOCKAGE MAROC fournit des solutions professionnelles de rayonnage industriel; mobilier de bureau et stockage. Nous importons nos produits ', updated_at = NOW() WHERE id = '2eac745e-9228-5f5c-8f7e-ee2431a3421b'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '2eac745e-9228-5f5c-8f7e-ee2431a3421b'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2eac745e-9228-5f5c-8f7e-ee2431a3421b'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2eac745e-9228-5f5c-8f7e-ee2431a3421b'::uuid AND ic.code = '8.5.2';
UPDATE public.profiles SET bio = 'Bureau d''├⌐tudes techniques agr├⌐├⌐ multidisciplinaire sp├⌐cialis├⌐ dans les des ├⌐tudes de structures en b├⌐ton arm├⌐; charpente m├⌐tallique; ainsi que des ├⌐tudes de fluides et dΓÇÖ├⌐lectricit├⌐; d├¿s la conception du projet afin dΓÇÖ├⌐viter les err', updated_at = NOW() WHERE id = 'c18de6fe-bb3c-5933-abcf-42b7a7689b8e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c18de6fe-bb3c-5933-abcf-42b7a7689b8e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c18de6fe-bb3c-5933-abcf-42b7a7689b8e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.6'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c18de6fe-bb3c-5933-abcf-42b7a7689b8e'::uuid AND ic.code = '3.1.6';
UPDATE public.profiles SET bio = 'Studio 33 Architects est un cabinet dΓÇÖarchitecture et de design bas├⌐ au Maroc; sp├⌐cialis├⌐ dans la conception de projets r├⌐sidentiels haut de gamme et sur-mesure. Notre approche allie luxe; ├⌐l├⌐gance et fonctionnalit├⌐; en mettant lΓÇÖaccent sur', updated_at = NOW() WHERE id = 'b1f4130d-f0d3-5f87-9267-6e075f99abb7'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b1f4130d-f0d3-5f87-9267-6e075f99abb7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b1f4130d-f0d3-5f87-9267-6e075f99abb7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b1f4130d-f0d3-5f87-9267-6e075f99abb7'::uuid AND ic.code = '5.1.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'af7b7862-65b0-5f91-a6a7-b82461df0216'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'af7b7862-65b0-5f91-a6a7-b82461df0216'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'af7b7862-65b0-5f91-a6a7-b82461df0216'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = 'Achat; vente et distribution de fourniture et mat├⌐riel ├⌐lectrique; et tout accessoire relatif aux produits et services d''├⌐lectricit├⌐ et ├⌐clairage.', updated_at = NOW() WHERE id = '01ee9428-38a2-5728-9fea-45675b1b219b'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '01ee9428-38a2-5728-9fea-45675b1b219b'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '01ee9428-38a2-5728-9fea-45675b1b219b'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '01ee9428-38a2-5728-9fea-45675b1b219b'::uuid AND ic.code = '8.5.4';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b35c08a2-b5db-53c7-925f-f60f5abaf4da'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b35c08a2-b5db-53c7-925f-f60f5abaf4da'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b35c08a2-b5db-53c7-925f-f60f5abaf4da'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b35c08a2-b5db-53c7-925f-f60f5abaf4da'::uuid AND ic.code = '3.2.3';
UPDATE public.profiles SET bio = 'Https://www.synelec.ma Importation et distribution et installation du mat├⌐riel ├⌐lectrique et ├⌐clairage La soci├⌐t├⌐ SYNELEC ENERGY Sarl est une soci├⌐t├⌐ marocaine n├⌐e d''une v├⌐ritable passion pour la vente du mat├⌐riel ├⌐lectrique et la r├⌐alisat', updated_at = NOW() WHERE id = '90917402-88ef-5644-838f-5b9f282096c7'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '90917402-88ef-5644-838f-5b9f282096c7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '90917402-88ef-5644-838f-5b9f282096c7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '90917402-88ef-5644-838f-5b9f282096c7'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'Synergy Solutions est une entreprise sp├⌐cialis├⌐e en ├⌐nergie solaire photovolta├»que; cr├⌐├⌐e en 2021 par des experts en ├⌐nergies renouvelables. Nous avons d├⌐j├á install├⌐ plus de 1 M├⌐gaWatt dΓÇÖ├⌐nergie solaire ├á travers une multitude de projet', updated_at = NOW() WHERE id = 'c83df0de-cf2b-5b71-b40c-11d7f849ded3'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c83df0de-cf2b-5b71-b40c-11d7f849ded3'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c83df0de-cf2b-5b71-b40c-11d7f849ded3'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c83df0de-cf2b-5b71-b40c-11d7f849ded3'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'TAFC Construction est une entreprise sp├⌐cialis├⌐e dans la construction de b├ótiments r├⌐sidentiels; commerciaux et industriels. Forte d''une expertise technique solide et dΓÇÖune ├⌐quipe hautement qualifi├⌐e; notre soci├⌐t├⌐ s''engage ├á offrir des ser', updated_at = NOW() WHERE id = '739b7723-a16a-5bbe-9d1a-b68b2b296d9e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '739b7723-a16a-5bbe-9d1a-b68b2b296d9e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '739b7723-a16a-5bbe-9d1a-b68b2b296d9e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '739b7723-a16a-5bbe-9d1a-b68b2b296d9e'::uuid AND ic.code = '3.1.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = '18c78104-630c-5e72-9c06-0b63054d73d1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '18c78104-630c-5e72-9c06-0b63054d73d1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '18c78104-630c-5e72-9c06-0b63054d73d1'::uuid AND ic.code = '3.2.1';
UPDATE public.profiles SET bio = 'Bienvenue chez TCG LA JEUNESSE; votre partenaire de confiance en mati├¿re de construction et d''immobilier. Nous nous engageons ├á utiliser des m├⌐thodes modernes de construction. Notre priorit├⌐ est de satisfaire nos clients au maximum; en offrant des', updated_at = NOW() WHERE id = '012143dd-bf5a-5158-8d52-3c8916ec23b1'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '012143dd-bf5a-5158-8d52-3c8916ec23b1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '012143dd-bf5a-5158-8d52-3c8916ec23b1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '012143dd-bf5a-5158-8d52-3c8916ec23b1'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Technoprime est une entreprise marocaine sp├⌐cialis├⌐e dans les solutions dΓÇÖautomatisation; lΓÇÖ├⌐clairage intelligent; la climatisation et les syst├¿mes audio professionnels. Bas├⌐e ├á Agadir; nous accompagnons nos clients ΓÇö particuliers; promote', updated_at = NOW() WHERE id = 'b0530e99-157a-5cac-a945-d883323d17b8'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'b0530e99-157a-5cac-a945-d883323d17b8'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b0530e99-157a-5cac-a945-d883323d17b8'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b0530e99-157a-5cac-a945-d883323d17b8'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'b0530e99-157a-5cac-a945-d883323d17b8'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'b0530e99-157a-5cac-a945-d883323d17b8'::uuid AND ic.code = '7.5.2';
UPDATE public.profiles SET bio = 'Soci├⌐t├⌐ experte dans la conception; lΓÇÖinstallation et la maintenance de syst├¿mes techniques pour le b├ótiment et lΓÇÖindustrie. Ses comp├⌐tences couvrent un large ├⌐ventail de domaines : climatisation; aspiration centralis├⌐e; domotique; plancher', updated_at = NOW() WHERE id = '948df84d-8930-5d60-9c14-a754bff2fc36'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '948df84d-8930-5d60-9c14-a754bff2fc36'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '948df84d-8930-5d60-9c14-a754bff2fc36'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '948df84d-8930-5d60-9c14-a754bff2fc36'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '948df84d-8930-5d60-9c14-a754bff2fc36'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '7.5.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '948df84d-8930-5d60-9c14-a754bff2fc36'::uuid AND ic.code = '3.2.3';
UPDATE public.profiles SET bio = 'TEEMLAN ENGINEERING SERVICES est un bureau dΓÇÖ├⌐tudes bas├⌐ ├á Tanger; sp├⌐cialis├⌐ dans les lots techniques suivants : - ├ëtude du chauffage; de la ventilation et de la climatisation (CVC) ; - ├ëtude de lΓÇÖ├⌐lectricit├⌐ courants forts (CFO) ; - ├ët', updated_at = NOW() WHERE id = 'fa8bb52f-4673-53f9-8aef-d36aa05b6788'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'fa8bb52f-4673-53f9-8aef-d36aa05b6788'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'fa8bb52f-4673-53f9-8aef-d36aa05b6788'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'fa8bb52f-4673-53f9-8aef-d36aa05b6788'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.5'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'fa8bb52f-4673-53f9-8aef-d36aa05b6788'::uuid AND ic.code = '3.2.3';
DELETE FROM public.profile_internal_categories WHERE profile_id = '0b7329b1-4ec6-53d3-887f-b9537d9f1ab5'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '0b7329b1-4ec6-53d3-887f-b9537d9f1ab5'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '0b7329b1-4ec6-53d3-887f-b9537d9f1ab5'::uuid AND ic.code = '8.5.3';
UPDATE public.profiles SET bio = 'TH.GUARD Entreprise fournit les meilleurs services dans le domaine du gardiennage et de la s├╗ret├⌐ des installations et de divers secteurs gr├óce ├á une expertise nationale form├⌐e et des comp├⌐tences. L''entreprise a toujours veill├⌐ ├á ce que l''ex├⌐', updated_at = NOW() WHERE id = 'e8b3e2c4-99d2-5fc7-86f6-e6af72e142e7'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'e8b3e2c4-99d2-5fc7-86f6-e6af72e142e7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e8b3e2c4-99d2-5fc7-86f6-e6af72e142e7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.6.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'e8b3e2c4-99d2-5fc7-86f6-e6af72e142e7'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '8.6.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'e8b3e2c4-99d2-5fc7-86f6-e6af72e142e7'::uuid AND ic.code = '8.6.1';
UPDATE public.profiles SET bio = 'The Architect studio est un cabinet dΓÇÖarchitecture contemporain qui allie ├⌐l├⌐gance; innovation et durabilit├⌐. Anim├⌐s par la passion de concevoir des espaces uniques; nous intervenons dans la cr├⌐ation de villas; immeubles; bureaux et projets pub', updated_at = NOW() WHERE id = '7aa9afe7-7d8b-5ef4-9442-c81e653dd069'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '7aa9afe7-7d8b-5ef4-9442-c81e653dd069'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '7aa9afe7-7d8b-5ef4-9442-c81e653dd069'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '7aa9afe7-7d8b-5ef4-9442-c81e653dd069'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'Depuis sa cr├⌐ation en 2003; forte de ses 23 ans d''exp├⌐rience; TOP GRAD s''est impos├⌐e comme un acteur de r├⌐f├⌐rence sur le march├⌐ marocain de l''├⌐quipement pour la cuisine professionnelle; la restauration et les m├⌐tiers de bouche. Gr├óce ├á une s', updated_at = NOW() WHERE id = '4b0fe318-590d-5fba-a7a5-a092e9dfbdd3'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '4b0fe318-590d-5fba-a7a5-a092e9dfbdd3'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '4b0fe318-590d-5fba-a7a5-a092e9dfbdd3'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '4b0fe318-590d-5fba-a7a5-a092e9dfbdd3'::uuid AND ic.code = '4.2.3';
UPDATE public.profiles SET bio = 'Tradebridge International est une entreprise marocaine sp├⌐cialis├⌐e dans lΓÇÖimportation et la distribution de solutions dΓÇÖ├⌐clairage et dΓÇÖ├⌐lectricit├⌐ modernes de haute qualit├⌐. Nous proposons une gamme compl├¿te allant du c├óblage ├⌐lectrique', updated_at = NOW() WHERE id = '031c23ec-33bd-5687-acbe-64f2bb67b75f'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '031c23ec-33bd-5687-acbe-64f2bb67b75f'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '031c23ec-33bd-5687-acbe-64f2bb67b75f'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '031c23ec-33bd-5687-acbe-64f2bb67b75f'::uuid AND ic.code = '8.5.4';
DELETE FROM public.profile_internal_categories WHERE profile_id = '71b7d2d1-70ed-5051-b21e-5475e8a36ed6'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '71b7d2d1-70ed-5051-b21e-5475e8a36ed6'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '71b7d2d1-70ed-5051-b21e-5475e8a36ed6'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '71b7d2d1-70ed-5051-b21e-5475e8a36ed6'::uuid AND ic.code = '3.2.3';
UPDATE public.profiles SET bio = 'Avec 25 ans dΓÇÖexp├⌐rience; TRECQ est un laboratoire de r├⌐f├⌐rence au Maroc; sp├⌐cialis├⌐ dans le contr├┤le de la qualit├⌐ des mat├⌐riaux; les ├⌐tudes g├⌐otechniques; et le suivi technique des projets de construction et dΓÇÖinfrastructures. Nous pro', updated_at = NOW() WHERE id = '20f5c30e-2946-5b1a-9dba-2c5fc5893e84'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '20f5c30e-2946-5b1a-9dba-2c5fc5893e84'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '20f5c30e-2946-5b1a-9dba-2c5fc5893e84'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.4.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '20f5c30e-2946-5b1a-9dba-2c5fc5893e84'::uuid AND ic.code = '3.4.2';
UPDATE public.profiles SET bio = 'Ultrapro Confec est sp├⌐cialis├⌐e dans la confection dΓÇÖ├ëquipements de Protection Individuelle (EPI) et de tenues de travail pour tous les secteurs. Forte de 5 ans dΓÇÖexp├⌐rience; notre entreprise op├¿re partout au Maroc et garantit des produits de', updated_at = NOW() WHERE id = '8e0a23b9-9ab3-50ff-b553-6a8794565959'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '8e0a23b9-9ab3-50ff-b553-6a8794565959'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '8e0a23b9-9ab3-50ff-b553-6a8794565959'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '8e0a23b9-9ab3-50ff-b553-6a8794565959'::uuid AND ic.code = '3.5.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '33bac6c1-d297-5214-a08d-68a7403d8596'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '33bac6c1-d297-5214-a08d-68a7403d8596'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '33bac6c1-d297-5214-a08d-68a7403d8596'::uuid AND ic.code = '3.5.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '2faa7fdb-90cb-5474-a036-5ff06129289e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2faa7fdb-90cb-5474-a036-5ff06129289e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2faa7fdb-90cb-5474-a036-5ff06129289e'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2faa7fdb-90cb-5474-a036-5ff06129289e'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.2.2'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2faa7fdb-90cb-5474-a036-5ff06129289e'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.3.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '2faa7fdb-90cb-5474-a036-5ff06129289e'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '2faa7fdb-90cb-5474-a036-5ff06129289e'::uuid AND ic.code = '4.2.4';
UPDATE public.profiles SET bio = 'Chez UsiCuisine; nous croyons que la cuisine est bien plus quΓÇÖun espace de pr├⌐paration. CΓÇÖest un lieu de partage; de cr├⌐ation; et de convivialit├⌐. CΓÇÖest pourquoi nous concevons des cuisines sur mesure; fonctionnelles et esth├⌐tiques; adapt├⌐e', updated_at = NOW() WHERE id = 'ca50efef-e3f4-5456-987e-3b645414762a'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ca50efef-e3f4-5456-987e-3b645414762a'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ca50efef-e3f4-5456-987e-3b645414762a'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ca50efef-e3f4-5456-987e-3b645414762a'::uuid AND ic.code = '4.2.3';
UPDATE public.profiles SET bio = 'VEDOVA est une entreprise bas├⌐e ├á Casablanca; sp├⌐cialis├⌐e dans la vente et l''installation de panneaux d├⌐coratifs en PVC effet marbre; pierre naturelle ou dor├⌐. Nos produits sont con├ºus pour apporter une finition moderne; durable et ├⌐l├⌐gante a', updated_at = NOW() WHERE id = '88b60f9d-2dc9-592f-af67-917433f03bc7'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '88b60f9d-2dc9-592f-af67-917433f03bc7'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '88b60f9d-2dc9-592f-af67-917433f03bc7'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '88b60f9d-2dc9-592f-af67-917433f03bc7'::uuid AND ic.code = '4.2.1';
UPDATE public.profiles SET bio = 'VENEZIA est une marque sp├⌐cialis├⌐e dans lΓÇÖ├⌐lectrom├⌐nager; proposant une gamme de produits con├ºus pour r├⌐pondre aux besoins des foyers modernes en mati├¿re de confort; de praticit├⌐ et de performance. ├Ç travers une offre diversifi├⌐e; VENEZIA ', updated_at = NOW() WHERE id = 'c70e0ba5-2275-50fd-a5ae-11b0d449584e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'c70e0ba5-2275-50fd-a5ae-11b0d449584e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'c70e0ba5-2275-50fd-a5ae-11b0d449584e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'c70e0ba5-2275-50fd-a5ae-11b0d449584e'::uuid AND ic.code = '4.2.3';
UPDATE public.profiles SET bio = 'La soci├⌐t├⌐ VETCO (Vente et Transformation de mat├⌐riaux de Construction) est une entreprise marocaine bas├⌐e ├á Biougra; dans la r├⌐gion dΓÇÖAgadir; sp├⌐cialis├⌐e dans la fabrication et la commercialisation de mat├⌐riaux de construction. Gr├óce ├á u', updated_at = NOW() WHERE id = 'ab2f4b77-280a-5513-9f2c-f8a5ff1a1937'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'ab2f4b77-280a-5513-9f2c-f8a5ff1a1937'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'ab2f4b77-280a-5513-9f2c-f8a5ff1a1937'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'ab2f4b77-280a-5513-9f2c-f8a5ff1a1937'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'VETFASHION NORTH AFRICA propose toutes les gammes des v├¬tements professionnels; une vision de marque pour personnaliser vos v├¬tements de travail afin quΓÇÖils refl├¿tent lΓÇÖimage de votre entreprise. Sp├⌐cialiste de la conception; de la fabrication', updated_at = NOW() WHERE id = '41c3424b-d575-5ebb-b225-5e852cc66ab3'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '41c3424b-d575-5ebb-b225-5e852cc66ab3'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '41c3424b-d575-5ebb-b225-5e852cc66ab3'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '41c3424b-d575-5ebb-b225-5e852cc66ab3'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'VIASIM : Expertise Technique en D├⌐molition et Terrassement. VIASIM est votre partenaire de r├⌐f├⌐rence pour les projets exigeants en d├⌐molition et terrassement; alliant rigueur technique et gestion ├⌐prouv├⌐e. Notre approche est fa├ºonn├⌐e par l''exp', updated_at = NOW() WHERE id = '45a3e5c2-dfde-5ac6-a0b1-dd7241597c0e'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '45a3e5c2-dfde-5ac6-a0b1-dd7241597c0e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '45a3e5c2-dfde-5ac6-a0b1-dd7241597c0e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '45a3e5c2-dfde-5ac6-a0b1-dd7241597c0e'::uuid AND ic.code = '3.1.3';
UPDATE public.profiles SET bio = 'Acteur de r├⌐f├⌐rence dans la distribution des produits m├⌐tallurgiques et des mat├⌐riaux de construction', updated_at = NOW() WHERE id = '1ab80af2-be12-5c04-b174-4ddc77b07295'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '1ab80af2-be12-5c04-b174-4ddc77b07295'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '1ab80af2-be12-5c04-b174-4ddc77b07295'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '1ab80af2-be12-5c04-b174-4ddc77b07295'::uuid AND ic.code = '3.5.1';
UPDATE public.profiles SET bio = 'Gr├óce ├á Vitres Intelligentes Maroc; passez de la transparence ├á lΓÇÖintimit├⌐ en un instant. Offrez ├á vos espaces ├⌐l├⌐gance; confort et innovation. Nos films de verre intelligents red├⌐finissent vos environnements professionnels : bureaux; h├┤tel', updated_at = NOW() WHERE id = '8699ffac-86b9-587b-99bd-ddc9632dcc82'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '8699ffac-86b9-587b-99bd-ddc9632dcc82'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '8699ffac-86b9-587b-99bd-ddc9632dcc82'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '8699ffac-86b9-587b-99bd-ddc9632dcc82'::uuid AND ic.code = '3.3.4';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'd1d4fa54-dcaa-5e0d-aa28-9ab5574e8e1a'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'd1d4fa54-dcaa-5e0d-aa28-9ab5574e8e1a'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'd1d4fa54-dcaa-5e0d-aa28-9ab5574e8e1a'::uuid AND ic.code = '5.1.1';
DELETE FROM public.profile_internal_categories WHERE profile_id = '8aeabc95-fac4-59f0-be4c-7bcca0cf6034'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '8aeabc95-fac4-59f0-be4c-7bcca0cf6034'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.1.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '8aeabc95-fac4-59f0-be4c-7bcca0cf6034'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '3.5.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '8aeabc95-fac4-59f0-be4c-7bcca0cf6034'::uuid AND ic.code = '3.1.4';
DELETE FROM public.profile_internal_categories WHERE profile_id = 'bda53830-6ea5-59c2-9900-5609fcb47e3e'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'bda53830-6ea5-59c2-9900-5609fcb47e3e'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'bda53830-6ea5-59c2-9900-5609fcb47e3e'::uuid, ic.id, FALSE
FROM public.internal_categories ic WHERE ic.code = '4.2.3'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'bda53830-6ea5-59c2-9900-5609fcb47e3e'::uuid AND ic.code = '3.3.4';
UPDATE public.profiles SET bio = '"YafZin Doors". ┘ç┘è ╪┤╪▒┘â╪⌐ ┘à╪¬╪«╪╡╪╡╪⌐ ┘ü┘è ╪¿┘è╪╣ ╪º┘ä╪ú╪¿┘ê╪º╪¿ ╪º┘ä╪¬╪▒┘â┘è╪⌐╪î ╪¡┘è╪½ ╪¬┘ê┘ü╪▒ ┘à╪¼┘à┘ê╪╣╪⌐ ┘à╪¬┘å┘ê╪╣╪⌐ ┘à┘å ╪º┘ä╪ú╪¿┘ê╪º╪¿ ╪º┘ä┘à╪╡┘å┘ê╪╣╪⌐ ╪¿╪¼┘ê╪»╪⌐ ╪╣╪º┘ä┘è╪⌐ ┘ê╪¿╪¬╪╡╪º┘à┘è┘à ┘à┘à┘è╪▓╪⌐ ╪¬╪¼┘à╪╣ ╪¿┘è┘å ╪º┘ä╪ú┘å╪º┘é╪⌐ ┘ê╪º', updated_at = NOW() WHERE id = '4d0f760d-7bf0-5df6-9eda-3d4e8b0547d1'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '4d0f760d-7bf0-5df6-9eda-3d4e8b0547d1'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '4d0f760d-7bf0-5df6-9eda-3d4e8b0547d1'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '8.5.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '4d0f760d-7bf0-5df6-9eda-3d4e8b0547d1'::uuid AND ic.code = '8.5.4';
UPDATE public.profiles SET bio = 'Conseils en architecture services d''architecture architecture d''int├⌐rieur d├⌐coration int├⌐rieure planification en mati├¿re d''urbanisme conception d''am├⌐nagements paysagers', updated_at = NOW() WHERE id = 'df690491-dc89-584b-8502-0f0877ed4810'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = 'df690491-dc89-584b-8502-0f0877ed4810'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT 'df690491-dc89-584b-8502-0f0877ed4810'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '5.1.1'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = 'df690491-dc89-584b-8502-0f0877ed4810'::uuid AND ic.code = '5.1.1';
UPDATE public.profiles SET bio = 'WE-TRADE est une soci├⌐t├⌐ Turque sp├⌐cialis├⌐e dans la fourniture et l''exportation de produits en verre de haute qualit├⌐ pour l''industrie de la construction. Notre expertise garantit des solutions de qualit├⌐ sup├⌐rieure adapt├⌐es aux besoins archit', updated_at = NOW() WHERE id = '4cb0b719-1345-5e81-a9fc-7c645758d6fe'::uuid;
DELETE FROM public.profile_internal_categories WHERE profile_id = '4cb0b719-1345-5e81-a9fc-7c645758d6fe'::uuid;
INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '4cb0b719-1345-5e81-a9fc-7c645758d6fe'::uuid, ic.id, TRUE
FROM public.internal_categories ic WHERE ic.code = '3.3.4'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;
UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '4cb0b719-1345-5e81-a9fc-7c645758d6fe'::uuid AND ic.code = '3.3.4';
COMMIT;
