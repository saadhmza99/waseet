-- Revert mistaken generic lechantier portfolio covers; restore first remaining Chridari gallery asset.
update public.projects p
set cover_image = src.u,
    updated_at = now()
from (
  select p2.id,
         (
           select elem
           from jsonb_array_elements_text(coalesce(p2.images, '[]'::jsonb)) elem
           where elem ilike '%chridari.ma%'
           limit 1
         ) as u
  from public.projects p2
  where p2.cover_image ilike '%lechantier.ma/uploads/pro/cmvhe7o5s01e1j02w5y6zpssf/%'
) src
where p.id = src.id
  and src.u is not null;
