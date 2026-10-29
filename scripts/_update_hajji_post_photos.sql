-- Replace Hajji & Associés feed post stock nature menus with official firm photos.
update public.posts
set
  single_image_url = 'https://ahlo.ma/wp-content/uploads/2022/06/Amin-Hajji-le-fondateur.jpg',
  images = '[
    "https://ahlo.ma/wp-content/uploads/2022/06/Amin-Hajji-le-fondateur.jpg",
    "https://ahlo.ma/wp-content/uploads/2022/05/CABINET-D-AVOCAT-HAJJI-ASSOCIES-CASABLANCA-CABINET-AMIN-HAJJI-MISE-EN-AVANT.jpg",
    "https://ahlo.ma/wp-content/uploads/2022/04/CABINET-D-AVOCAT-HAJJI-ASSOCIES-CASABLANCA-TROPHEE-D-OR.png"
  ]'::jsonb,
  updated_at = now()
where id = 'a65e904e-2115-541b-b2cf-192efe2349f1'::uuid;

select
  id::text,
  left(single_image_url, 100) as cover,
  images
from public.posts
where id = 'a65e904e-2115-541b-b2cf-192efe2349f1'::uuid;
