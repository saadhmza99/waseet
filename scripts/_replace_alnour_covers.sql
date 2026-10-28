-- Official Groupe Al Nour covers (verified 200) — no Chridari watermark.
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
    ('Nour Prestige Targa', 'https://groupealnour.ma/wp-content/uploads/2026/07/Prestige-targa-5.png')
) as v(title, cover)
where p.user_id in (select id from public.profiles where full_name ilike '%Al Nour%')
  and p.title ilike v.title;
