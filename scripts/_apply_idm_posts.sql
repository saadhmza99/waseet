-- Industrie du Maroc profile posts from their public LinkedIn updates.
-- https://www.linkedin.com/posts/industrie-du-maroc-magazine_...
DO $$
DECLARE
  uid uuid;
  was_verified boolean;
BEGIN
  SELECT id, is_verified INTO uid, was_verified
  FROM public.profiles
  WHERE username = 'industrie-du-maroc' AND profile_type = 'institution';

  IF uid IS NULL THEN
    RAISE EXCEPTION 'industrie-du-maroc institution profile not found';
  END IF;

  UPDATE public.profiles SET is_verified = true WHERE id = uid;

  -- ~5 days ago: Morocco–Japan bilateral meeting (ministry / ambassador)
  INSERT INTO public.posts (
    id, user_id, title, description, single_image_url, images,
    likes_count, comments_count, shares_count, is_sponsored, post_type, city,
    created_at, updated_at
  ) VALUES (
    '75193391-8811-4116-a032-000000000001'::uuid,
    uid,
    '',
    E'استقبل السيد توفيق مشرف، الكاتب العام لوزارة الصناعة والتجارة والاستثمار والإدماج الاقتصادي، اليوم بمقر الوزارة بالرباط، سعادة السيد ناكاتا ماساهيرو، السفير المفوض فوق العادة لليابان لدى المملكة المغربية، في لقاء شكل مناسبة لتدارس سبل تعزيز التعاون الثنائي في مجالات الصناعة والتجارة والاستثمار، واستعراض فرص الشراكة المتاحة أمام الفاعلين الاقتصاديين المغاربة واليابانيين، بما يخدم المصالح المشتركة للبلدين ويدعم مسار التنمية المستدامة. وأكد الطرفان، بهذه المناسبة، متانة العلاقات التي تجمع المملكة المغربية واليابان، وما تقوم عليه من ثقة وتفاهم، معربين عن حرصهما على مواصلة الجهود من أجل تطويرها والارتقاء بها نحو آفاق أوسع، بما يستجيب لتطلعات الجانبين ويرسخ ما تحقق بينهما من مكتسبات',
    '/federations/posts/idm-japon-maroc.jpg',
    '["/federations/posts/idm-japon-maroc.jpg"]'::jsonb,
    0, 0, 0, FALSE, 'standard', 'Rabat',
    NOW() - interval '5 days',
    NOW() - interval '5 days'
  )
  ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description,
    single_image_url = EXCLUDED.single_image_url,
    images = EXCLUDED.images,
    city = EXCLUDED.city,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

  -- ~2 days ago: Oriental Meeting Days 2026
  INSERT INTO public.posts (
    id, user_id, title, description, single_image_url, images,
    likes_count, comments_count, shares_count, is_sponsored, post_type, city,
    created_at, updated_at
  ) VALUES (
    '75205141-1734-4279-a728-000000000002'::uuid,
    uid,
    '',
    E'L''Oriental connaît une phase importante de son développement économique, portée par la réalisation de grandes infrastructures et l''émergence de nouvelles opportunités industrielles, logistiques et énergétiques. C''est dans ce contexte que les Oriental Meeting Days reviennent pour une deuxième édition consacrée aux investissements, au financement des projets et aux compétences nécessaires pour accompagner les transformations économiques de la région.\n\nOriental Meeting Days 2026 : Nador accueille une deuxième édition tournée vers les grands projets et l''investissement\nhttps://www.orientalmeetingdays.com/',
    '/federations/posts/idm-oriental-meeting.jpg',
    '["/federations/posts/idm-oriental-meeting.jpg"]'::jsonb,
    0, 0, 0, FALSE, 'standard', 'Nador',
    NOW() - interval '2 days',
    NOW() - interval '2 days'
  )
  ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description,
    single_image_url = EXCLUDED.single_image_url,
    images = EXCLUDED.images,
    city = EXCLUDED.city,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

  UPDATE public.profiles SET is_verified = was_verified WHERE id = uid;
END $$;

SELECT left(description, 56) AS excerpt, city, created_at
FROM public.posts
WHERE id IN (
  '75193391-8811-4116-a032-000000000001'::uuid,
  '75205141-1734-4279-a728-000000000002'::uuid
)
ORDER BY created_at DESC;
