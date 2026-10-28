-- Curated non-Chridari covers from promoter websites / official pages.
update public.projects p
set cover_image = v.cover,
    images = case
      when jsonb_typeof(p.images) = 'array' and jsonb_array_length(p.images) > 0
        then jsonb_set(p.images, '{0}', to_jsonb(v.cover), true)
      else jsonb_build_array(v.cover)
    end,
    updated_at = now()
from (
  values
    ('Nour Confort Targa', 'https://groupealnour.ma/wp-content/uploads/2026/07/Confort-targa-1-5.jpg'),
    ('Nour Prestige Targa', 'https://groupealnour.ma/wp-content/uploads/2026/07/Prestige-targa-5.png'),
    ('Nour Horizon', 'https://groupealnour.ma/wp-content/uploads/2026/07/Nour-Horizon.jpg'),
    ('Nour Prestige Extension', 'https://groupealnour.ma/wp-content/uploads/2026/07/Prestige-extension.png'),
    ('Nour Confort Guéliz', 'https://groupealnour.ma/wp-content/uploads/2026/07/confort-gueliz-2-1024x757.jpg'),
    ('Nour Confort Gueliz', 'https://groupealnour.ma/wp-content/uploads/2026/07/confort-gueliz-2-1024x757.jpg'),
    ('Nour Prisme Élite', 'https://groupealnour.ma/wp-content/uploads/2026/07/Prisme-4.png'),
    ('Nour Prisme Elite', 'https://groupealnour.ma/wp-content/uploads/2026/07/Prisme-4.png'),
    ('Nour Prestige', 'https://groupealnour.ma/wp-content/uploads/2026/07/Nour-prestige-5-793x1024.jpeg'),
    ('Al Houda Prestige', 'https://alhoudagroupe.com/wp-content/uploads/2026/02/ChatGPT-Image-25-fevr.-2026-18_15_41.png'),
    ('Majorelle Hills', 'https://alhoudagroupe.com/wp-content/uploads/2026/02/ChatGPT-Image-25-fevr.-2026-11_24_52-e1772018742580.png'),
    ('Targa Palm', 'https://alhoudagroupe.com/wp-content/uploads/2026/02/ChatGPT-Image-25-fevr.-2026-16_31_40.png'),
    ('Residence Ranamir Semlalia', 'https://alhoudagroupe.com/wp-content/uploads/2026/02/ChatGPT-Image-25-fevr.-2026-16_59_34.png'),
    ('The Mansions', 'https://promoteurimmobilier.ma/wp-content/uploads/2023/07/villa-ourika-marrakech.jpg')
) as v(title, cover)
where p.title ilike v.title
  and exists (
    select 1 from public.profiles pr
    where pr.id = p.user_id and pr.featured_promoter
  );
