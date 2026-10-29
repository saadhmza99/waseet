-- Agréments BET D13–D21 under Construction & BTP → Ingénierie & études (3.4.x).
-- Clicking Discover sub "ingenierie-etudes" includes these codes automatically.

INSERT INTO public.internal_categories (category_id, code, sub_category, detailed_sub_category, feed_sub_category_id)
SELECT v.category_id, v.code, v.sub_category, v.detailed_sub_category, f.id
FROM (VALUES
  (3, '3.4.13', 'Ingénierie & études', 'D13 – Études générales', 'ingenierie-etudes'),
  (3, '3.4.14', 'Ingénierie & études', 'D14 – Calcul de structures', 'ingenierie-etudes'),
  (3, '3.4.15', 'Ingénierie & études', 'D15 – Courant fort et courant faible', 'ingenierie-etudes'),
  (3, '3.4.16', 'Ingénierie & études', 'D16 – Réseaux des fluides', 'ingenierie-etudes'),
  (3, '3.4.17', 'Ingénierie & études', 'D17 – Voirie, assainissement et eau potable', 'ingenierie-etudes'),
  (3, '3.4.18', 'Ingénierie & études', 'D18 – Électricité, télécoms et éclairage public', 'ingenierie-etudes'),
  (3, '3.4.19', 'Ingénierie & études', 'D19 – Études d''impact sur l''environnement', 'ingenierie-etudes'),
  (3, '3.4.20', 'Ingénierie & études', 'D20 – Géologie, géophysique, hydrologie', 'ingenierie-etudes'),
  (3, '3.4.21', 'Ingénierie & études', 'D21 – Sécurité incendie dans les constructions', 'ingenierie-etudes')
) AS v(category_id, code, sub_category, detailed_sub_category, feed_slug)
JOIN public.feed_sub_categories f ON f.slug = v.feed_slug
ON CONFLICT (code) DO UPDATE
SET category_id = EXCLUDED.category_id,
    sub_category = EXCLUDED.sub_category,
    detailed_sub_category = EXCLUDED.detailed_sub_category,
    feed_sub_category_id = EXCLUDED.feed_sub_category_id;

NOTIFY pgrst, 'reload schema';
