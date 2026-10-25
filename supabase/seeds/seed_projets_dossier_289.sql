-- Seed: project documents from projets_dossier_289.csv
-- 224 documents across 42 Kerix projects; each one is
-- attached to every projects row sharing attributes.source_project_id
-- (one row per linked pro). Idempotent: re-running inserts nothing twice
-- (matched on project_id + url).
-- Apply with: supabase db query --linked -f supabase/seeds/seed_projets_dossier_289.sql

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, '2026 BROCHURE ADDOHA MRE', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '05d0c73a-a0f7-5845-8f7c-85a1e8b6a621'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MULTI PROJET REGION CASABLANCA', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '05d0c73a-a0f7-5845-8f7c-85a1e8b6a621'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'DEPLIANT AZURIA terrain villa R3 assilah', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2026/06/DEPLIANT-AZURIA-terrain-villa-R3-assilah.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '092d156b-63cc-5c5a-b0ed-255a90a1980b'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/06/DEPLIANT-AZURIA-terrain-villa-R3-assilah.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Brochure Riad marrakech Map 2 compressed', 'Brochure commerciale', 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '092d156b-63cc-5c5a-b0ed-255a90a1980b'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE MEHDIA A5', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20MEHDIA%20A5.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '15707414-0b74-51e8-b166-13ae82ec2553'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20MEHDIA%20A5.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE CHWITER A5', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20CHWITER%20A5.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1b8a29b6-e3ec-5ce7-ad75-f0e26070ac2c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20CHWITER%20A5.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE MENZAH FEDALA A5 VF', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1b8a29b6-e3ec-5ce7-ad75-f0e26070ac2c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE MENZAH FEDALA A5 VF', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1d81c475-74ac-531f-bd3d-05592ef8c5c1'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MENZAH BENSLIMANE lot terrain a vendre', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/BROCHURE-MENZAH-BENSLIMANE-lot-terrain-a-vendre.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1d81c475-74ac-531f-bd3d-05592ef8c5c1'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/BROCHURE-MENZAH-BENSLIMANE-lot-terrain-a-vendre.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE KSOUR TENSIFT 1 C', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/526277/plaquette_commerciale/PLAQUETTE%20KSOUR%20TENSIFT%201%20C.pdf?inLanguage=fre-FR', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/526277/plaquette_commerciale/PLAQUETTE%20KSOUR%20TENSIFT%201%20C.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR ALWARD TR2 GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR SANAOUBAR GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS GO commerces ALKARAMA FR JUIN 2026', 'Autre', 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE oualili tr 2 al felline juillet 26 FR.pptx', 'Autre', 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR LOTISSEMENT SIDI ABDELLAH GUICHET OUVERT JUILLET 2026', 'Autre', 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf', 'public', 5
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'ESSALAM Log FR', 'Autre', 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf', 'public', 6
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'cahier de charge ASSAFAE', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/524946/cahier_des_charges/cahier%20de%20charge%20ASSAFAE.pdf?inLanguage=fre-FR', 'public', 7
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524946/cahier_des_charges/cahier%20de%20charge%20ASSAFAE.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="icon-d', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/524946/plaquette_commerciale/Groupement%20d%E2%80%99habitations%20Assafae%20SAFI%20compressed%20.pdf?inLanguage=fre-FR', 'public', 8
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524946/plaquette_commerciale/Groupement%20d%E2%80%99habitations%20Assafae%20SAFI%20compressed%20.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'CAHIER DES CHARGES RIAD BENGURIR TR4 compressed', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/498096/cahier_des_charges/CAHIER%20DES%20CHARGES%20RIAD%20BENGURIR%20TR4_compressed.pdf?inLanguage=fre-FR', 'public', 9
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/498096/cahier_des_charges/CAHIER%20DES%20CHARGES%20RIAD%20BENGURIR%20TR4_compressed.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="icon-d', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/530535/plaquette_commerciale/SAHAR-%20PLAQUETTE%20DEFINITIVE_compressed_compressed%20%281%29.pdf?inLanguage=fre-FR', 'public', 10
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/530535/plaquette_commerciale/SAHAR-%20PLAQUETTE%20DEFINITIVE_compressed_compressed%20%281%29.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="icon-d', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/526081/plaquette_commerciale/palaquette%20RIAD%20AL%20YASSAMINE.pdf?inLanguage=fre-FR', 'public', 11
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/526081/plaquette_commerciale/palaquette%20RIAD%20AL%20YASSAMINE.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Cahier des charges (1) compressed', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/524942/cahier_des_charges/Cahier%20des%20charges%20%281%29_compressed.pdf?inLanguage=fre-FR', 'public', 12
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524942/cahier_des_charges/Cahier%20des%20charges%20%281%29_compressed.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="icon-d', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/524942/plaquette_commerciale/PLAQUETTE%20IBN%20KHALDOUNE%20A3%20%281%29.pdf?inLanguage=fre-FR', 'public', 13
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524942/plaquette_commerciale/PLAQUETTE%20IBN%20KHALDOUNE%20A3%20%281%29.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="icon-d', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/502789/plaquette_commerciale/comp%20PLAQ%20COM%20LOT%20137-142-157-168%20%20IMM%20TARFAYA%20-opt.pdf?inLanguage=fre-FR', 'public', 14
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/502789/plaquette_commerciale/comp%20PLAQ%20COM%20LOT%20137-142-157-168%20%20IMM%20TARFAYA%20-opt.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="icon-d', 'Brochure commerciale', 'https://www.alomrane.gov.ma/content/download/530535/plaquette_commerciale/SAHAR-%20PLAQUETTE%20DEFINITIVE_compressed_compressed%20%281%29.pdf?inLanguage=fre-FR', 'public', 15
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/530535/plaquette_commerciale/SAHAR-%20PLAQUETTE%20DEFINITIVE_compressed_compressed%20%281%29.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="icon-d', 'Brochure commerciale', 'https://www.alomrane.gov.ma/content/download/526277/plaquette_commerciale/PLAQUETTE%20KSOUR%20TENSIFT%201%20C.pdf?inLanguage=fre-FR', 'public', 16
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/526277/plaquette_commerciale/PLAQUETTE%20KSOUR%20TENSIFT%201%20C.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="icon-d', 'Brochure commerciale', 'https://www.alomrane.gov.ma/content/download/526081/plaquette_commerciale/palaquette%20RIAD%20AL%20YASSAMINE.pdf?inLanguage=fre-FR', 'public', 17
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/526081/plaquette_commerciale/palaquette%20RIAD%20AL%20YASSAMINE.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'cahier de charge ASSAFAE', 'Spécifications publiques du projet', 'https://www.alomrane.gov.ma/content/download/524946/cahier_des_charges/cahier%20de%20charge%20ASSAFAE.pdf?inLanguage=fre-FR', 'public', 18
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/524946/cahier_des_charges/cahier%20de%20charge%20ASSAFAE.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="icon-d', 'Brochure commerciale', 'https://www.alomrane.gov.ma/content/download/524946/plaquette_commerciale/Groupement%20d%E2%80%99habitations%20Assafae%20SAFI%20compressed%20.pdf?inLanguage=fre-FR', 'public', 19
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/524946/plaquette_commerciale/Groupement%20d%E2%80%99habitations%20Assafae%20SAFI%20compressed%20.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Cahier des charges (1) compressed', 'Spécifications publiques du projet', 'https://www.alomrane.gov.ma/content/download/524942/cahier_des_charges/Cahier%20des%20charges%20%281%29_compressed.pdf?inLanguage=fre-FR', 'public', 20
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/524942/cahier_des_charges/Cahier%20des%20charges%20%281%29_compressed.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="icon-d', 'Brochure commerciale', 'https://www.alomrane.gov.ma/content/download/524942/plaquette_commerciale/PLAQUETTE%20IBN%20KHALDOUNE%20A3%20%281%29.pdf?inLanguage=fre-FR', 'public', 21
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/524942/plaquette_commerciale/PLAQUETTE%20IBN%20KHALDOUNE%20A3%20%281%29.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="icon-d', 'Brochure commerciale', 'https://www.alomrane.gov.ma/content/download/502789/plaquette_commerciale/comp%20PLAQ%20COM%20LOT%20137-142-157-168%20%20IMM%20TARFAYA%20-opt.pdf?inLanguage=fre-FR', 'public', 22
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/502789/plaquette_commerciale/comp%20PLAQ%20COM%20LOT%20137-142-157-168%20%20IMM%20TARFAYA%20-opt.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="icon-d', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/496346/plaquette_commerciale/Plaquette_commerciale_compressee.pdf?inLanguage=fre-FR', 'public', 23
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/496346/plaquette_commerciale/Plaquette_commerciale_compressee.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'LAKSOUR CAHIER DE CHARGE PROVINCE DE TINGHIR', 'Spécifications publiques du projet', 'https://www.alomrane.gov.ma/content/download/15831/cahier_des_charges/LAKSOUR%20CAHIER%20DE%20CHARGE%20PROVINCE%20DE%20TINGHIR.pdf?inLanguage=fre-FR', 'public', 24
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/15831/cahier_des_charges/LAKSOUR%20CAHIER%20DE%20CHARGE%20PROVINCE%20DE%20TINGHIR.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'flyer_0001 LAKSOUR.jpg', 'Présentation du projet', 'https://www.alomrane.gov.ma/content/download/15831/file/flyer_0001%20LAKSOUR.jpg?inLanguage=fre-FR', 'public', 25
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/15831/file/flyer_0001%20LAKSOUR.jpg?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'TAMANSOURT CAHIER DE CHARGE GLOBAL', 'Spécifications publiques du projet', 'https://www.alomrane.gov.ma/content/download/1911/cahier_des_charges/TAMANSOURT%20CAHIER%20DE%20CHARGE%20GLOBAL.pdf?inLanguage=fre-FR', 'public', 26
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/1911/cahier_des_charges/TAMANSOURT%20CAHIER%20DE%20CHARGE%20GLOBAL.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'ilovepdf merged', 'Brochure commerciale', 'https://www.alomrane.gov.ma/content/download/1911/plaquette_commerciale/ilovepdf_merged.pdf?inLanguage=fre-FR', 'public', 27
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/1911/plaquette_commerciale/ilovepdf_merged.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'TAMANSOURT CAHIER DE CHARGE GLOBAL', 'Spécifications publiques du projet', 'https://www.alomrane.gov.ma/content/download/2090/cahier_des_charges/TAMANSOURT%20CAHIER%20DE%20CHARGE%20GLOBAL.pdf?inLanguage=fre-FR', 'public', 28
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/2090/cahier_des_charges/TAMANSOURT%20CAHIER%20DE%20CHARGE%20GLOBAL.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Ksour Al Atlas copy.jpg', 'Brochure commerciale', 'https://www.alomrane.gov.ma/content/download/2090/plaquette_commerciale/Ksour%20Al%20Atlas%20copy.jpg?inLanguage=fre-FR', 'public', 29
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/2090/plaquette_commerciale/Ksour%20Al%20Atlas%20copy.jpg?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'TAMANSOURT CAHIER DE CHARGE GLOBAL', 'Spécifications publiques du projet', 'https://www.alomrane.gov.ma/content/download/2094/cahier_des_charges/TAMANSOURT%20CAHIER%20DE%20CHARGE%20GLOBAL.pdf?inLanguage=fre-FR', 'public', 30
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/2094/cahier_des_charges/TAMANSOURT%20CAHIER%20DE%20CHARGE%20GLOBAL.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'plaquette+COMMERCIALE.dwg', 'Brochure commerciale', 'https://www.alomrane.gov.ma/content/download/2094/plaquette_commerciale/plaquette+COMMERCIALE.dwg.pdf?inLanguage=fre-FR', 'public', 31
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/2094/plaquette_commerciale/plaquette+COMMERCIALE.dwg.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'IMG_0680.JPG', 'Présentation du projet', 'https://www.alomrane.gov.ma/content/download/2094/file/IMG_0680.JPG?inLanguage=fre-FR', 'public', 32
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alomrane.gov.ma/content/download/2094/file/IMG_0680.JPG?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'IMG-20260828-WA0005.jpg', 'Présentation du projet', 'https://alomrane.gov.ma/content/download/526277/file/IMG-20260828-WA0005.jpg?inLanguage=fre-FR', 'public', 33
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '1f058156-9d10-5263-b015-b3594a8a5919'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/526277/file/IMG-20260828-WA0005.jpg?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE PROJET ALDARNA CENTRE SAB', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-PROJET-ALDARNA-CENTRE-SAB.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2363ed0d-d11d-572d-a9ba-08c00341d11a'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-PROJET-ALDARNA-CENTRE-SAB.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE MENZAH FEDALA A5 VF', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2363ed0d-d11d-572d-a9ba-08c00341d11a'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, '2026 BROCHURE ADDOHA MRE', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '287d3802-a41a-542f-b5a8-6656b5e46728'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MULTI PROJET REGION CASABLANCA', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '287d3802-a41a-542f-b5a8-6656b5e46728'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'plaquette', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/495740/plaquette_commerciale/plaquette.pdf?inLanguage=fre-FR', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495740/plaquette_commerciale/plaquette.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE COMMERCIALE ALAMAL 454', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/491175/plaquette_commerciale/PLAQUETTE%20COMMERCIALE%20ALAMAL%20454.pdf?inLanguage=fre-FR', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/491175/plaquette_commerciale/PLAQUETTE%20COMMERCIALE%20ALAMAL%20454.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'plaquette commerciale compressed', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/476301/plaquette_commerciale/plaquette%20commerciale_compressed.pdf?inLanguage=fre-FR', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/476301/plaquette_commerciale/plaquette%20commerciale_compressed.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'plaquette commercial bloc3. compressed', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/458880/plaquette_commerciale/plaquette%20commercial%20bloc3._compressed.pdf?inLanguage=fre-FR', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/458880/plaquette_commerciale/plaquette%20commercial%20bloc3._compressed.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'cahier salam charge 251028 115603 compressed', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/449485/cahier_des_charges/cahier%20salam%20charge_251028_115603_compressed.pdf?inLanguage=fre-FR', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/449485/cahier_des_charges/cahier%20salam%20charge_251028_115603_compressed.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PROJET SALAM V1 A5 (flyer) compressed', 'Autre', 'https://alomrane.gov.ma/content/download/449485/file/PROJET%20SALAM%20V1%20A5%20%28flyer%29_compressed.pdf?inLanguage=fre-FR', 'public', 5
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/449485/file/PROJET%20SALAM%20V1%20A5%20%28flyer%29_compressed.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE ENNOUR 15 12 2024 compressée', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/441833/plaquette_commerciale/PLAQUETTE%20ENNOUR%2015%2012%202024%20compress%C3%A9e.pdf?inLanguage=fre-FR', 'public', 6
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/441833/plaquette_commerciale/PLAQUETTE%20ENNOUR%2015%2012%202024%20compress%C3%A9e.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR LOTISSEMENT SIDI ABDELLAH GUICHET OUVERT JUILLET 2026', 'Autre', 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf', 'public', 7
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE oualili tr 2 al felline juillet 26 FR.pptx', 'Autre', 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf', 'public', 8
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS GO commerces ALKARAMA FR JUIN 2026', 'Autre', 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf', 'public', 9
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR ALWARD TR2 GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 10
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR SANAOUBAR GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 11
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'ESSALAM Log FR', 'Autre', 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf', 'public', 12
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR HADAIK AL BADR', 'Autre', 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf', 'public', 13
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR DE VGO AZZAITOUNE 06 04 2026 FRANCAIS def', 'Autre', 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf', 'public', 14
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '2a50f583-a60e-5e8f-abed-e784a4b220a5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Mentions légales Réalisa', 'Autre', 'https://anouar-almostakbal.ma/sites/default/files/mentions_legales_anouar_almostakbal.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '32a1efb5-2f57-5233-8d56-05b81dd5de1b'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://anouar-almostakbal.ma/sites/default/files/mentions_legales_anouar_almostakbal.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, '2026 BROCHURE ADDOHA MRE', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '37e78b9c-f34e-5a18-b279-623178068291'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MULTI PROJET REGION CASABLANCA', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '37e78b9c-f34e-5a18-b279-623178068291'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, '2026 BROCHURE ADDOHA MRE', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '385970b2-d485-5e03-8b05-f946c18113d0'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MULTI PROJET REGION CASABLANCA', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '385970b2-d485-5e03-8b05-f946c18113d0'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTES WARD B ET C COMPRESSED compressed compressed 2', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/491191/plaquette_commerciale/PLAQUETTES%20WARD%20B%20ET%20C%20COMPRESSED_compressed_compressed%202.pdf?inLanguage=fre-FR', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '3c53f43d-aeaa-5d6a-9a37-e913d5736123'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/491191/plaquette_commerciale/PLAQUETTES%20WARD%20B%20ET%20C%20COMPRESSED_compressed_compressed%202.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR LOTISSEMENT SIDI ABDELLAH GUICHET OUVERT JUILLET 2026', 'Autre', 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '3c53f43d-aeaa-5d6a-9a37-e913d5736123'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE oualili tr 2 al felline juillet 26 FR.pptx', 'Autre', 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '3c53f43d-aeaa-5d6a-9a37-e913d5736123'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS GO commerces ALKARAMA FR JUIN 2026', 'Autre', 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '3c53f43d-aeaa-5d6a-9a37-e913d5736123'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR ALWARD TR2 GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '3c53f43d-aeaa-5d6a-9a37-e913d5736123'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR SANAOUBAR GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 5
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '3c53f43d-aeaa-5d6a-9a37-e913d5736123'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'ESSALAM Log FR', 'Autre', 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf', 'public', 6
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '3c53f43d-aeaa-5d6a-9a37-e913d5736123'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR HADAIK AL BADR', 'Autre', 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf', 'public', 7
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '3c53f43d-aeaa-5d6a-9a37-e913d5736123'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR DE VGO AZZAITOUNE 06 04 2026 FRANCAIS def', 'Autre', 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf', 'public', 8
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '3c53f43d-aeaa-5d6a-9a37-e913d5736123'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE Les jardins de Hellala A5', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20Les%20jardins%20de%20Hellala%20A5.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '3f83529c-7536-5233-97ba-7a8ed2534905'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20Les%20jardins%20de%20Hellala%20A5.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE MENZAH FEDALA A5 VF', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '3f83529c-7536-5233-97ba-7a8ed2534905'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, '2026 BROCHURE ADDOHA MRE', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '42b987d5-db29-587d-b5cd-fc2acf6eb2b5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MULTI PROJET REGION CASABLANCA', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '42b987d5-db29-587d-b5cd-fc2acf6eb2b5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE RIAD BENI MELLAL A5', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20RIAD%20BENI%20MELLAL%20A5.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '431a4c9c-a69d-5bc2-9f39-234332347cdb'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20RIAD%20BENI%20MELLAL%20A5.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE RIAD TANGER A5', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20RIAD%20TANGER%20A5.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '439703eb-bf10-53ca-b671-1d048e6ab46a'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20RIAD%20TANGER%20A5.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE MENZAH FEDALA A5 VF', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '44439e07-c71d-5e82-ab06-86e1b2d3baba'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR LOTISSEMENT SIDI ABDELLAH GUICHET OUVERT JUILLET 2026', 'Autre', 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE oualili tr 2 al felline juillet 26 FR.pptx', 'Autre', 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS GO commerces ALKARAMA FR JUIN 2026', 'Autre', 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR ALWARD TR2 GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR SANAOUBAR GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'ESSALAM Log FR', 'Autre', 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf', 'public', 5
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR HADAIK AL BADR', 'Autre', 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf', 'public', 6
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR DE VGO AZZAITOUNE 06 04 2026 FRANCAIS def', 'Autre', 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf', 'public', 7
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'SAHAR PLAQUETTE DEFINITIVE compressed compressed (1)', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/530535/plaquette_commerciale/SAHAR-%20PLAQUETTE%20DEFINITIVE_compressed_compressed%20%281%29.pdf?inLanguage=fre-FR', 'public', 8
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/530535/plaquette_commerciale/SAHAR-%20PLAQUETTE%20DEFINITIVE_compressed_compressed%20%281%29.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE KSOUR TENSIFT 1 C', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/526277/plaquette_commerciale/PLAQUETTE%20KSOUR%20TENSIFT%201%20C.pdf?inLanguage=fre-FR', 'public', 9
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/526277/plaquette_commerciale/PLAQUETTE%20KSOUR%20TENSIFT%201%20C.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'palaquette RIAD AL YASSAMINE', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/526081/plaquette_commerciale/palaquette%20RIAD%20AL%20YASSAMINE.pdf?inLanguage=fre-FR', 'public', 10
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/526081/plaquette_commerciale/palaquette%20RIAD%20AL%20YASSAMINE.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'fLAYERS RIAD YASSAMINE 19 17 26 35', 'Autre', 'https://alomrane.gov.ma/content/download/526081/file/fLAYERS%20RIAD%20YASSAMINE-19-17-26-35.pdf?inLanguage=fre-FR', 'public', 11
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/526081/file/fLAYERS%20RIAD%20YASSAMINE-19-17-26-35.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'cahier de charge ASSAFAE', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/524946/cahier_des_charges/cahier%20de%20charge%20ASSAFAE.pdf?inLanguage=fre-FR', 'public', 12
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524946/cahier_des_charges/cahier%20de%20charge%20ASSAFAE.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Groupement d’habitations Assafae SAFI compressed', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/524946/plaquette_commerciale/Groupement%20d%E2%80%99habitations%20Assafae%20SAFI%20compressed%20.pdf?inLanguage=fre-FR', 'public', 13
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524946/plaquette_commerciale/Groupement%20d%E2%80%99habitations%20Assafae%20SAFI%20compressed%20.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'RESIDENCE ASSAFAA A SAFI', 'Autre', 'https://alomrane.gov.ma/content/download/524946/file/RESIDENCE%20ASSAFAA%20A%20SAFI.pdf?inLanguage=fre-FR', 'public', 14
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524946/file/RESIDENCE%20ASSAFAA%20A%20SAFI.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Cahier des charges (1) compressed', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/524942/cahier_des_charges/Cahier%20des%20charges%20%281%29_compressed.pdf?inLanguage=fre-FR', 'public', 15
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524942/cahier_des_charges/Cahier%20des%20charges%20%281%29_compressed.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE IBN KHALDOUNE A3 (1)', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/524942/plaquette_commerciale/PLAQUETTE%20IBN%20KHALDOUNE%20A3%20%281%29.pdf?inLanguage=fre-FR', 'public', 16
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524942/plaquette_commerciale/PLAQUETTE%20IBN%20KHALDOUNE%20A3%20%281%29.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'comp PLAQ COM LOT 137 142 157 168 IMM TARFAYA opt', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/502789/plaquette_commerciale/comp%20PLAQ%20COM%20LOT%20137-142-157-168%20%20IMM%20TARFAYA%20-opt.pdf?inLanguage=fre-FR', 'public', 17
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '518f73a9-0e36-58ee-868b-36aecc0bf761'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/502789/plaquette_commerciale/comp%20PLAQ%20COM%20LOT%20137-142-157-168%20%20IMM%20TARFAYA%20-opt.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, '2026 BROCHURE ADDOHA MRE', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '54febac3-0142-5792-8450-b51dc89c0182'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MULTI PROJET REGION CASABLANCA', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '54febac3-0142-5792-8450-b51dc89c0182'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'DÉPLIANT LES VILLAS PRESTIGE MARRAKECH', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2025/04/DÉPLIANT-LES-VILLAS-PRESTIGE-MARRAKECH.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '58f2968d-5adc-551f-bb93-bfc8ab7f6abc'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2025/04/DÉPLIANT-LES-VILLAS-PRESTIGE-MARRAKECH.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'VILLAÉ residences marrakech', 'Autre', 'https://alliancesresidences.ma/wp-content/uploads/2026/05/VILLAÉ-residences-marrakech.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '58f2968d-5adc-551f-bb93-bfc8ab7f6abc'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/05/VILLAÉ-residences-marrakech.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Brochure-Riad marrakech-Jnane-riad-24', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2024/11/Brochure-Riad-marrakech-Jnane-riad-24.pdf', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '58f2968d-5adc-551f-bb93-bfc8ab7f6abc'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2024/11/Brochure-Riad-marrakech-Jnane-riad-24.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Brochure Riad marrakech Map 2 compressed', 'Brochure commerciale', 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '58f2968d-5adc-551f-bb93-bfc8ab7f6abc'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'LOTISSEMENT AL BASSATINE SAFI', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/LOTISSEMENT%20AL%20BASSATINE-SAFI.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '600c7c9c-72bc-5ff5-855f-60656d04af7c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/LOTISSEMENT%20AL%20BASSATINE-SAFI.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE MENZAH FEDALA A5 VF', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '600c7c9c-72bc-5ff5-855f-60656d04af7c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MENZAH BENSLIMANE(25 25)', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/BROCHURE%20MENZAH%20BENSLIMANE(25_25).pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '66e6963b-36da-50c0-b739-928331b8f6bf'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/BROCHURE%20MENZAH%20BENSLIMANE(25_25).pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE MENZAH FEDALA A5 VF', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '66e6963b-36da-50c0-b739-928331b8f6bf'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MENZAH BENSLIMANE lot terrain a vendre', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/BROCHURE-MENZAH-BENSLIMANE-lot-terrain-a-vendre.pdf', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '66e6963b-36da-50c0-b739-928331b8f6bf'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/BROCHURE-MENZAH-BENSLIMANE-lot-terrain-a-vendre.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, '2026 BROCHURE ADDOHA MRE', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '70e43e5d-be85-5efb-8753-cd81b8c0622d'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MULTI PROJET REGION CASABLANCA', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '70e43e5d-be85-5efb-8753-cd81b8c0622d'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Brochure Riad marrakech Jnane riad 24', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2024/11/Brochure-Riad-marrakech-Jnane-riad-24.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '7decb336-93f6-5c43-8238-8226892e498e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2024/11/Brochure-Riad-marrakech-Jnane-riad-24.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'VILLAÉ residences marrakech', 'Autre', 'https://alliancesresidences.ma/wp-content/uploads/2026/05/VILLAÉ-residences-marrakech.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '7decb336-93f6-5c43-8238-8226892e498e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/05/VILLAÉ-residences-marrakech.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'DÉPLIANT LES VILLAS PRESTIGE MARRAKECH', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2025/04/DÉPLIANT-LES-VILLAS-PRESTIGE-MARRAKECH.pdf', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '7decb336-93f6-5c43-8238-8226892e498e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2025/04/DÉPLIANT-LES-VILLAS-PRESTIGE-MARRAKECH.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Brochure Riad marrakech Map 2 compressed', 'Brochure commerciale', 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '7decb336-93f6-5c43-8238-8226892e498e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'comp PLAQ COM LOT 137 142 157 168 IMM TARFAYA opt', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/502789/plaquette_commerciale/comp%20PLAQ%20COM%20LOT%20137-142-157-168%20%20IMM%20TARFAYA%20-opt.pdf?inLanguage=fre-FR', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/502789/plaquette_commerciale/comp%20PLAQ%20COM%20LOT%20137-142-157-168%20%20IMM%20TARFAYA%20-opt.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Plaquette commerciale compressee', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/496346/plaquette_commerciale/Plaquette_commerciale_compressee.pdf?inLanguage=fre-FR', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/496346/plaquette_commerciale/Plaquette_commerciale_compressee.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Cahier des Charges', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/492700/cahier_des_charges/Cahier%20%20des%20Charges.pdf?inLanguage=fre-FR', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/492700/cahier_des_charges/Cahier%20%20des%20Charges.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Compressed MANUEL COMMER SALAM 2 TARFAYA (1) compressed (1)', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/453383/cahier_des_charges/Compressed%20MANUEL%20COMMER%20SALAM%202%20TARFAYA%20%281%29_compressed%20%281%29.pdf?inLanguage=fre-FR', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/453383/cahier_des_charges/Compressed%20MANUEL%20COMMER%20SALAM%202%20TARFAYA%20%281%29_compressed%20%281%29.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'cc riad eddahab ne varieture mai 2023 (2)', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/452837/cahier_des_charges/cc%20riad%20eddahab%20ne%20varieture%20mai%202023%20%282%29.pdf?inLanguage=fre-FR', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/452837/cahier_des_charges/cc%20riad%20eddahab%20ne%20varieture%20mai%202023%20%282%29.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'cc al khair 2 ne varieture', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/373836/cahier_des_charges/cc%20al%20khair%202%20ne%20varieture.pdf?inLanguage=fre-FR', 'public', 5
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/373836/cahier_des_charges/cc%20al%20khair%202%20ne%20varieture.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Cahier des charges', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/337917/cahier_des_charges/Cahier%20des%20charges.pdf?inLanguage=fre-FR', 'public', 6
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/337917/cahier_des_charges/Cahier%20des%20charges.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR LOTISSEMENT SIDI ABDELLAH GUICHET OUVERT JUILLET 2026', 'Autre', 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf', 'public', 7
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE oualili tr 2 al felline juillet 26 FR.pptx', 'Autre', 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf', 'public', 8
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS GO commerces ALKARAMA FR JUIN 2026', 'Autre', 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf', 'public', 9
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR ALWARD TR2 GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 10
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR SANAOUBAR GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 11
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'ESSALAM Log FR', 'Autre', 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf', 'public', 12
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR HADAIK AL BADR', 'Autre', 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf', 'public', 13
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR DE VGO AZZAITOUNE 06 04 2026 FRANCAIS def', 'Autre', 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf', 'public', 14
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f130efd-37bd-5993-9ab6-3a0760700e84'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE Park Errahma A5', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20Park%20Errahma%20A5.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f5f821d-ceb4-5a69-b1dc-3f6958fc356a'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20Park%20Errahma%20A5.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE MENZAH FEDALA A5 VF', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '8f5f821d-ceb4-5a69-b1dc-3f6958fc356a'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE LA COLLINE VERTE A5', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20LA%20COLLINE%20VERTE%20A5.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '933460bf-5907-5e34-8eeb-7e73909a45e6'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/VF/PLAQUETTE%20LA%20COLLINE%20VERTE%20A5.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE MENZAH FEDALA A5 VF', 'Brochure commerciale', 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '933460bf-5907-5e34-8eeb-7e73909a45e6'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesdarna.ma/wp-content/uploads/Brochures/PLAQUETTE-MENZAH-FEDALA-A5-VF.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'DÉPLIANT LES TERRASSES DE JNANE appartement studio marrakech', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2026/08/DÉPLIANT_LES_TERRASSES_DE_JNANE_appartement_studio_marrakech.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '940d97d8-fd27-5487-a1f3-e31ebfd1ff38'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/08/DÉPLIANT_LES_TERRASSES_DE_JNANE_appartement_studio_marrakech.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'VILLAÉ residences marrakech', 'Autre', 'https://alliancesresidences.ma/wp-content/uploads/2026/05/VILLAÉ-residences-marrakech.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '940d97d8-fd27-5487-a1f3-e31ebfd1ff38'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/05/VILLAÉ-residences-marrakech.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'DÉPLIANT LES VILLAS PRESTIGE MARRAKECH', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2025/04/DÉPLIANT-LES-VILLAS-PRESTIGE-MARRAKECH.pdf', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '940d97d8-fd27-5487-a1f3-e31ebfd1ff38'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2025/04/DÉPLIANT-LES-VILLAS-PRESTIGE-MARRAKECH.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Brochure-Riad marrakech-Jnane-riad-24', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2024/11/Brochure-Riad-marrakech-Jnane-riad-24.pdf', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '940d97d8-fd27-5487-a1f3-e31ebfd1ff38'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2024/11/Brochure-Riad-marrakech-Jnane-riad-24.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Brochure Riad marrakech Map 2 compressed', 'Brochure commerciale', 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '940d97d8-fd27-5487-a1f3-e31ebfd1ff38'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Télécharger la brochure', 'Brochure commerciale', 'https://coraliaimmobilier.com/wp-content/uploads/2026/03/PLAQUETTE-LA-PERLE-DE-SIDI-RAHAL-2024-1.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '95b4ef5d-14ff-5966-9517-cf485366beda'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://coraliaimmobilier.com/wp-content/uploads/2026/03/PLAQUETTE-LA-PERLE-DE-SIDI-RAHAL-2024-1.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE LA PERLE DE TANGER 32×24', 'Brochure commerciale', 'https://coraliaimmobilier.com/wp-content/uploads/2026/03/BROCHURE-LA-PERLE-DE-TANGER-32x24-2.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '95b4ef5d-14ff-5966-9517-cf485366beda'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://coraliaimmobilier.com/wp-content/uploads/2026/03/BROCHURE-LA-PERLE-DE-TANGER-32x24-2.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'span class="broch', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2026/08/Tamuda_hills_dépliant_Villas_VF.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '9807d394-13d0-5438-a7ea-cee1614944c8'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/08/Tamuda_hills_dépliant_Villas_VF.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Villa BROCHURE Appartement', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2026/08/Tamuda_hills_dépliant_appartements_VF_2.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '9807d394-13d0-5438-a7ea-cee1614944c8'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/08/Tamuda_hills_dépliant_appartements_VF_2.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Brochure Riad marrakech Map 2 compressed', 'Brochure commerciale', 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '9807d394-13d0-5438-a7ea-cee1614944c8'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Mentions légales Réalisa', 'Autre', 'https://anouar-almostakbal.ma/sites/default/files/mentions_legales_anouar_almostakbal.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '9a319c5b-dea2-53e7-ad09-b02c78599690'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://anouar-almostakbal.ma/sites/default/files/mentions_legales_anouar_almostakbal.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, '2026 BROCHURE ADDOHA MRE', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '9a935071-67bd-5c65-9be7-1fc2eb3024d5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MULTI PROJET REGION CASABLANCA', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = '9a935071-67bd-5c65-9be7-1fc2eb3024d5'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE KSOUR TENSIFT 1 C', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/526277/plaquette_commerciale/PLAQUETTE%20KSOUR%20TENSIFT%201%20C.pdf?inLanguage=fre-FR', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/526277/plaquette_commerciale/PLAQUETTE%20KSOUR%20TENSIFT%201%20C.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'cahier de charge ASSAFAE', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/524946/cahier_des_charges/cahier%20de%20charge%20ASSAFAE.pdf?inLanguage=fre-FR', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524946/cahier_des_charges/cahier%20de%20charge%20ASSAFAE.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Groupement d’habitations Assafae SAFI compressed', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/524946/plaquette_commerciale/Groupement%20d%E2%80%99habitations%20Assafae%20SAFI%20compressed%20.pdf?inLanguage=fre-FR', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524946/plaquette_commerciale/Groupement%20d%E2%80%99habitations%20Assafae%20SAFI%20compressed%20.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'RESIDENCE ASSAFAA A SAFI', 'Autre', 'https://alomrane.gov.ma/content/download/524946/file/RESIDENCE%20ASSAFAA%20A%20SAFI.pdf?inLanguage=fre-FR', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524946/file/RESIDENCE%20ASSAFAA%20A%20SAFI.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'CAHIER DES CHARGES RIAD BENGURIR TR4 compressed', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/498096/cahier_des_charges/CAHIER%20DES%20CHARGES%20RIAD%20BENGURIR%20TR4_compressed.pdf?inLanguage=fre-FR', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/498096/cahier_des_charges/CAHIER%20DES%20CHARGES%20RIAD%20BENGURIR%20TR4_compressed.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR LOTISSEMENT SIDI ABDELLAH GUICHET OUVERT JUILLET 2026', 'Autre', 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf', 'public', 5
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE oualili tr 2 al felline juillet 26 FR.pptx', 'Autre', 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf', 'public', 6
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS GO commerces ALKARAMA FR JUIN 2026', 'Autre', 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf', 'public', 7
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR ALWARD TR2 GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 8
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR SANAOUBAR GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 9
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'ESSALAM Log FR', 'Autre', 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf', 'public', 10
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR HADAIK AL BADR', 'Autre', 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf', 'public', 11
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR DE VGO AZZAITOUNE 06 04 2026 FRANCAIS def', 'Autre', 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf', 'public', 12
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'b315bce6-52c0-51bf-8f57-95782837f84e'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'cahier de charge ASSAFAE', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/524946/cahier_des_charges/cahier%20de%20charge%20ASSAFAE.pdf?inLanguage=fre-FR', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524946/cahier_des_charges/cahier%20de%20charge%20ASSAFAE.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Groupement d’habitations Assafae SAFI compressed', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/524946/plaquette_commerciale/Groupement%20d%E2%80%99habitations%20Assafae%20SAFI%20compressed%20.pdf?inLanguage=fre-FR', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524946/plaquette_commerciale/Groupement%20d%E2%80%99habitations%20Assafae%20SAFI%20compressed%20.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'RESIDENCE ASSAFAA A SAFI', 'Autre', 'https://alomrane.gov.ma/content/download/524946/file/RESIDENCE%20ASSAFAA%20A%20SAFI.pdf?inLanguage=fre-FR', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/524946/file/RESIDENCE%20ASSAFAA%20A%20SAFI.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE KSOUR TENSIFT 1 C', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/526277/plaquette_commerciale/PLAQUETTE%20KSOUR%20TENSIFT%201%20C.pdf?inLanguage=fre-FR', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/526277/plaquette_commerciale/PLAQUETTE%20KSOUR%20TENSIFT%201%20C.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'CAHIER DES CHARGES RIAD BENGURIR TR4 compressed', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/498096/cahier_des_charges/CAHIER%20DES%20CHARGES%20RIAD%20BENGURIR%20TR4_compressed.pdf?inLanguage=fre-FR', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/498096/cahier_des_charges/CAHIER%20DES%20CHARGES%20RIAD%20BENGURIR%20TR4_compressed.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR LOTISSEMENT SIDI ABDELLAH GUICHET OUVERT JUILLET 2026', 'Autre', 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf', 'public', 5
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE oualili tr 2 al felline juillet 26 FR.pptx', 'Autre', 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf', 'public', 6
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS GO commerces ALKARAMA FR JUIN 2026', 'Autre', 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf', 'public', 7
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR ALWARD TR2 GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 8
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR SANAOUBAR GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 9
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'ESSALAM Log FR', 'Autre', 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf', 'public', 10
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR HADAIK AL BADR', 'Autre', 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf', 'public', 11
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR DE VGO AZZAITOUNE 06 04 2026 FRANCAIS def', 'Autre', 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf', 'public', 12
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'c167af28-dcb4-5c15-ad2e-4a7322baffa7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, '2026 BROCHURE ADDOHA MRE', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'd2117965-53d8-51e4-97f5-39f944456b4f'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MULTI PROJET REGION CASABLANCA', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'd2117965-53d8-51e4-97f5-39f944456b4f'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTES WARD B ET C COMPRESSED compressed compressed 2', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/491191/plaquette_commerciale/PLAQUETTES%20WARD%20B%20ET%20C%20COMPRESSED_compressed_compressed%202.pdf?inLanguage=fre-FR', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'd47450ab-538c-5b54-ae73-f6e1d654f36c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/491191/plaquette_commerciale/PLAQUETTES%20WARD%20B%20ET%20C%20COMPRESSED_compressed_compressed%202.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR LOTISSEMENT SIDI ABDELLAH GUICHET OUVERT JUILLET 2026', 'Autre', 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'd47450ab-538c-5b54-ae73-f6e1d654f36c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE oualili tr 2 al felline juillet 26 FR.pptx', 'Autre', 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'd47450ab-538c-5b54-ae73-f6e1d654f36c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS GO commerces ALKARAMA FR JUIN 2026', 'Autre', 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'd47450ab-538c-5b54-ae73-f6e1d654f36c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR ALWARD TR2 GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'd47450ab-538c-5b54-ae73-f6e1d654f36c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR SANAOUBAR GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 5
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'd47450ab-538c-5b54-ae73-f6e1d654f36c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'ESSALAM Log FR', 'Autre', 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf', 'public', 6
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'd47450ab-538c-5b54-ae73-f6e1d654f36c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR HADAIK AL BADR', 'Autre', 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf', 'public', 7
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'd47450ab-538c-5b54-ae73-f6e1d654f36c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR DE VGO AZZAITOUNE 06 04 2026 FRANCAIS def', 'Autre', 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf', 'public', 8
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'd47450ab-538c-5b54-ae73-f6e1d654f36c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Brochure Riad marrakech Map 2 compressed', 'Brochure commerciale', 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df20b747-8a4f-5000-b9f6-ba973237a7be'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Tamuda hills dépliant Villas VF', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2026/08/Tamuda_hills_dépliant_Villas_VF.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df20b747-8a4f-5000-b9f6-ba973237a7be'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/08/Tamuda_hills_dépliant_Villas_VF.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Tamuda hills dépliant appartements VF 2', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2026/08/Tamuda_hills_dépliant_appartements_VF_2.pdf', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df20b747-8a4f-5000-b9f6-ba973237a7be'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/08/Tamuda_hills_dépliant_appartements_VF_2.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'VILLAÉ residences marrakech', 'Autre', 'https://alliancesresidences.ma/wp-content/uploads/2026/05/VILLAÉ-residences-marrakech.pdf', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df20b747-8a4f-5000-b9f6-ba973237a7be'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/05/VILLAÉ-residences-marrakech.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'DÉPLIANT LES VILLAS PRESTIGE MARRAKECH', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2025/04/DÉPLIANT-LES-VILLAS-PRESTIGE-MARRAKECH.pdf', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df20b747-8a4f-5000-b9f6-ba973237a7be'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2025/04/DÉPLIANT-LES-VILLAS-PRESTIGE-MARRAKECH.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Brochure-Riad marrakech-Jnane-riad-24', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2024/11/Brochure-Riad-marrakech-Jnane-riad-24.pdf', 'public', 5
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df20b747-8a4f-5000-b9f6-ba973237a7be'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2024/11/Brochure-Riad-marrakech-Jnane-riad-24.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE-Riad-Bernoussi-2-A5-VA', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2025/10/PLAQUETTE-Riad-Bernoussi-2-A5-VA.pdf', 'public', 6
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df20b747-8a4f-5000-b9f6-ba973237a7be'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2025/10/PLAQUETTE-Riad-Bernoussi-2-A5-VA.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE-Riad-Bernoussi-2-FR', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2025/10/PLAQUETTE-Riad-Bernoussi-2-FR.pdf', 'public', 7
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df20b747-8a4f-5000-b9f6-ba973237a7be'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2025/10/PLAQUETTE-Riad-Bernoussi-2-FR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Brochure Riad marrakech Map 2 compressed', 'Brochure commerciale', 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df27cef2-514f-5e73-bfb0-6f2c45dc4ad7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.alliancesresidences.ma/wp-content/uploads/2024/Depliant/Brochure%20Riad%20marrakech%20Map-2_compressed.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Tamuda hills dépliant Villas VF', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2026/08/Tamuda_hills_dépliant_Villas_VF.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df27cef2-514f-5e73-bfb0-6f2c45dc4ad7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/08/Tamuda_hills_dépliant_Villas_VF.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Tamuda hills dépliant appartements VF 2', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2026/08/Tamuda_hills_dépliant_appartements_VF_2.pdf', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df27cef2-514f-5e73-bfb0-6f2c45dc4ad7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/08/Tamuda_hills_dépliant_appartements_VF_2.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'VILLAÉ residences marrakech', 'Autre', 'https://alliancesresidences.ma/wp-content/uploads/2026/05/VILLAÉ-residences-marrakech.pdf', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df27cef2-514f-5e73-bfb0-6f2c45dc4ad7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2026/05/VILLAÉ-residences-marrakech.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'DÉPLIANT LES VILLAS PRESTIGE MARRAKECH', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2025/04/DÉPLIANT-LES-VILLAS-PRESTIGE-MARRAKECH.pdf', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df27cef2-514f-5e73-bfb0-6f2c45dc4ad7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2025/04/DÉPLIANT-LES-VILLAS-PRESTIGE-MARRAKECH.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Brochure-Riad marrakech-Jnane-riad-24', 'Brochure commerciale', 'https://alliancesresidences.ma/wp-content/uploads/2024/11/Brochure-Riad-marrakech-Jnane-riad-24.pdf', 'public', 5
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'df27cef2-514f-5e73-bfb0-6f2c45dc4ad7'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alliancesresidences.ma/wp-content/uploads/2024/11/Brochure-Riad-marrakech-Jnane-riad-24.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, '2026 BROCHURE ADDOHA MRE', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'eab9e9df-dfc8-5870-9a7f-3e049c9cb80c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Les Portes de Marrakech Télécharger la brochure', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf#page=16', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'eab9e9df-dfc8-5870-9a7f-3e049c9cb80c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf#page=16'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE ADDOHA MRE 1 1', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2025/09/BROCHURE-ADDOHA-MRE-1-1.pdf', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'eab9e9df-dfc8-5870-9a7f-3e049c9cb80c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2025/09/BROCHURE-ADDOHA-MRE-1-1.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'exe BROCHURE ADDOHA MRE II 1', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/01/exe-BROCHURE-ADDOHA-MRE-II-1.pdf', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'eab9e9df-dfc8-5870-9a7f-3e049c9cb80c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/01/exe-BROCHURE-ADDOHA-MRE-II-1.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MULTI PROJET REGION CASABLANCA', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'eab9e9df-dfc8-5870-9a7f-3e049c9cb80c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE MULTI PROJET REGION-MARRAKECH', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/PLAQUETTE-MULTI-PROJET-REGION-MARRAKECH-1.pdf', 'public', 5
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'eab9e9df-dfc8-5870-9a7f-3e049c9cb80c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/PLAQUETTE-MULTI-PROJET-REGION-MARRAKECH-1.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'exe-BROCHURE-ADDOHA-MRE-II-1', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/exe-BROCHURE-ADDOHA-MRE-II-1.pdf', 'public', 6
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'eab9e9df-dfc8-5870-9a7f-3e049c9cb80c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/exe-BROCHURE-ADDOHA-MRE-II-1.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, '2026 BROCHURE ADDOHA MRE', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'eb2c02d5-a13b-5f1c-b925-a81bd094825c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/04/2026-BROCHURE-ADDOHA-MRE.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'BROCHURE MULTI PROJET REGION CASABLANCA', 'Brochure commerciale', 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'eb2c02d5-a13b-5f1c-b925-a81bd094825c'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://www.groupeaddoha.com/wp-content/uploads/2026/03/BROCHURE-MULTI-PROJET-REGION-CASABLANCA.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'palaquette RIAD AL YASSAMINE', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/526081/plaquette_commerciale/palaquette%20RIAD%20AL%20YASSAMINE.pdf?inLanguage=fre-FR', 'public', 0
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/526081/plaquette_commerciale/palaquette%20RIAD%20AL%20YASSAMINE.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'fLAYERS RIAD YASSAMINE 19 17 26 35', 'Autre', 'https://alomrane.gov.ma/content/download/526081/file/fLAYERS%20RIAD%20YASSAMINE-19-17-26-35.pdf?inLanguage=fre-FR', 'public', 1
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/526081/file/fLAYERS%20RIAD%20YASSAMINE-19-17-26-35.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'plaquette Naima Npadel', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/487650/plaquette_commerciale/plaquette%20Naima%20Npadel.pdf?inLanguage=fre-FR', 'public', 2
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/487650/plaquette_commerciale/plaquette%20Naima%20Npadel.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE EL belle vue NPADEL COMMERCIEL FINI', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/486149/plaquette_commerciale/PLAQUETTE%20EL%20belle%20vue%20NPADEL%20%20COMMERCIEL%20FINI.pdf?inLanguage=fre-FR', 'public', 3
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/486149/plaquette_commerciale/PLAQUETTE%20EL%20belle%20vue%20NPADEL%20%20COMMERCIEL%20FINI.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'PLAQUETTE Boughriba npadel AUTORISATION', 'Brochure commerciale', 'https://alomrane.gov.ma/content/download/486143/plaquette_commerciale/PLAQUETTE%20Boughriba%20npadel%20AUTORISATION.pdf?inLanguage=fre-FR', 'public', 4
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/486143/plaquette_commerciale/PLAQUETTE%20Boughriba%20npadel%20AUTORISATION.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'Cahier des charges Lotissement Al Azhar compressed', 'Spécifications publiques du projet', 'https://alomrane.gov.ma/content/download/452452/cahier_des_charges/Cahier%20des%20charges%20Lotissement%20Al%20Azhar_compressed.pdf?inLanguage=fre-FR', 'public', 5
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/452452/cahier_des_charges/Cahier%20des%20charges%20Lotissement%20Al%20Azhar_compressed.pdf?inLanguage=fre-FR'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR LOTISSEMENT SIDI ABDELLAH GUICHET OUVERT JUILLET 2026', 'Autre', 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf', 'public', 6
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/509291/13947895/version/6/file/AVIS%20DE%20VENTE%20FR%20LOTISSEMENT%20SIDI%20ABDELLAH%20GUICHET%20OUVERT%20JUILLET%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE oualili tr 2 al felline juillet 26 FR.pptx', 'Autre', 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf', 'public', 7
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/504598/13827084/version/2/file/AVIS%20DE%20VENTE%20oualili%20tr%202%20al%20felline%20juillet%2026%20FR.pptx.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS GO commerces ALKARAMA FR JUIN 2026', 'Autre', 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf', 'public', 8
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/496452/13647626/version/5/file/AVIS%20GO%20commerces%20ALKARAMA%20%20FR%20JUIN%202026.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR ALWARD TR2 GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 9
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495791/13632880/version/4/file/AVIS%20DE%20VENTE%20FR%20ALWARD%20TR2%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS DE VENTE FR SANAOUBAR GUICHET OUVERT JUIN26', 'Autre', 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf', 'public', 10
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/495792/13632914/version/4/file/AVIS%20DE%20VENTE%20FR%20SANAOUBAR%20GUICHET%20OUVERT%20JUIN26.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'ESSALAM Log FR', 'Autre', 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf', 'public', 11
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/525046/14363474/version/4/file/ESSALAM%20Log%20FR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR HADAIK AL BADR', 'Autre', 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf', 'public', 12
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/469823/13103822/version/2/file/AVIS%20FR%20HADAIK%20AL%20BADR.pdf'
  );

INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
SELECT p.id, 'AVIS FR DE VGO AZZAITOUNE 06 04 2026 FRANCAIS def', 'Autre', 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf', 'public', 13
FROM public.projects p
WHERE p.attributes->>'source_project_id' = 'edc8b71f-ec19-5ceb-bd95-fe196adb3abe'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects_documents d
    WHERE d.project_id = p.id AND d.url = 'https://alomrane.gov.ma/content/download/484931/13393749/version/2/file/AVIS%20FR%20DE%20VGO%20AZZAITOUNE%2006%2004%202026%20FRANCAIS%20def.pdf'
  );
