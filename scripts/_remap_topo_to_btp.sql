-- Move géomètre / topographie / études de terrain from Juridique (6.2) to Construction BTP (3.4).
-- Cadastre (6.2.5) stays under Juridique & Foncier.

update public.internal_categories
set
  category_id = 3,
  code = '3.4.7',
  sub_category = 'Ingénierie & études',
  feed_sub_category_id = (select id from public.feed_sub_categories where slug = 'ingenierie-etudes' limit 1)
where code = '6.2.3';

update public.internal_categories
set
  category_id = 3,
  code = '3.4.8',
  sub_category = 'Ingénierie & études',
  feed_sub_category_id = (select id from public.feed_sub_categories where slug = 'ingenierie-etudes' limit 1)
where code = '6.2.4';

update public.internal_categories
set
  category_id = 3,
  code = '3.4.9',
  sub_category = 'Ingénierie & études',
  feed_sub_category_id = (select id from public.feed_sub_categories where slug = 'ingenierie-etudes' limit 1)
where code = '6.2.6';

select code, detailed_sub_category, category_id, feed_sub_category_id
from public.internal_categories
where code in ('3.4.7', '3.4.8', '3.4.9', '6.2.1', '6.2.2', '6.2.5')
   or detailed_sub_category in ('Géomètre-topographe', 'Topographie', 'Études de terrain', 'Cadastre')
order by code;
