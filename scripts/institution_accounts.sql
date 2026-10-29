-- Institution profiles: federations, orders, chambers, public bodies, press, observatories.
-- Articles for every institution. Formations for federation, order, chamber, and public.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_profile_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_profile_type_check
  CHECK (profile_type IS NULL OR profile_type IN ('individual', 'enterprise', 'institution'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution_kind TEXT;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_institution_kind_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_institution_kind_check
  CHECK (
    (
      profile_type IS DISTINCT FROM 'institution'
      AND institution_kind IS NULL
    )
    OR (
      profile_type = 'institution'
      AND institution_kind IN ('federation', 'order', 'chamber', 'public', 'media', 'observatory')
    )
  );

CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cover_url TEXT,
  rubrique TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  excerpt TEXT,
  published_on DATE,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS articles_user_published_idx
  ON public.articles (user_id, published_on DESC NULLS LAST, created_at DESC);

CREATE TABLE IF NOT EXISTS public.formations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cover_url TEXT,
  title TEXT NOT NULL,
  excerpt TEXT,
  starts_on DATE,
  place TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS formations_user_starts_idx
  ON public.formations (user_id, starts_on DESC NULLS LAST, created_at DESC);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Articles are viewable by everyone" ON public.articles;
CREATE POLICY "Articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Institutions can insert their articles" ON public.articles;
CREATE POLICY "Institutions can insert their articles"
  ON public.articles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.profile_type = 'institution'
    )
  );

DROP POLICY IF EXISTS "Institutions can update their articles" ON public.articles;
CREATE POLICY "Institutions can update their articles"
  ON public.articles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Institutions can delete their articles" ON public.articles;
CREATE POLICY "Institutions can delete their articles"
  ON public.articles FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Formations are viewable by everyone" ON public.formations;
CREATE POLICY "Formations are viewable by everyone"
  ON public.formations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Eligible institutions can insert formations" ON public.formations;
CREATE POLICY "Eligible institutions can insert formations"
  ON public.formations FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.profile_type = 'institution'
        AND p.institution_kind IN ('federation', 'order', 'chamber', 'public')
    )
  );

DROP POLICY IF EXISTS "Institutions can update their formations" ON public.formations;
CREATE POLICY "Institutions can update their formations"
  ON public.formations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Institutions can delete their formations" ON public.formations;
CREATE POLICY "Institutions can delete their formations"
  ON public.formations FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT ON public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT SELECT ON public.formations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.formations TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF COALESCE(NEW.is_anonymous, FALSE) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (
    id, username, full_name, profession, location, bio, phone, email, profile_type, institution_kind,
    is_verified, signup_ip, signup_country, signup_country_code
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(btrim(NEW.raw_user_meta_data->>'username'), ''), 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'profession',
    NEW.raw_user_meta_data->>'location',
    NEW.raw_user_meta_data->>'bio',
    NEW.raw_user_meta_data->>'phone',
    NULLIF(btrim(NEW.email), ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'profile_type' = 'institution'
        AND NEW.raw_user_meta_data->>'institution_kind' IN ('federation', 'order', 'chamber', 'public', 'media', 'observatory')
      THEN 'institution'
      WHEN NEW.raw_user_meta_data->>'profile_type' = 'enterprise' THEN 'enterprise'
      WHEN NEW.raw_user_meta_data->>'profile_type' = 'hunter' THEN 'enterprise'
      ELSE 'individual'
    END,
    CASE
      WHEN NEW.raw_user_meta_data->>'profile_type' = 'institution'
        AND NEW.raw_user_meta_data->>'institution_kind' IN ('federation', 'order', 'chamber', 'public', 'media', 'observatory')
      THEN NEW.raw_user_meta_data->>'institution_kind'
      ELSE NULL
    END,
    CASE
      WHEN NEW.raw_user_meta_data->>'profile_type' = 'institution'
        AND NEW.raw_user_meta_data->>'institution_kind' IN ('federation', 'order', 'chamber', 'public', 'media', 'observatory')
      THEN TRUE
      ELSE FALSE
    END,
    NULLIF(btrim(NEW.raw_user_meta_data->>'signup_ip'), ''),
    NULLIF(btrim(NEW.raw_user_meta_data->>'signup_country'), ''),
    NULLIF(btrim(NEW.raw_user_meta_data->>'signup_country_code'), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE VIEW public.visible_feed_posts
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.user_id,
  p.description,
  p.before_image_url,
  p.after_image_url,
  p.single_image_url,
  p.images,
  p.likes_count,
  p.comments_count,
  p.shares_count,
  p.is_sponsored,
  p.created_at,
  p.post_type,
  p.price,
  p.surface,
  p.beds,
  p.baths,
  COALESCE(NULLIF(btrim(p.city), ''), NULLIF(btrim(p.property_details->>'city'), '')) AS city,
  COALESCE(
    (
      SELECT btrim(item)
      FROM jsonb_array_elements_text(
        CASE
          WHEN jsonb_typeof(p.property_details->'phones') = 'array' THEN p.property_details->'phones'
          ELSE '[]'::jsonb
        END
      ) AS item
      WHERE length(regexp_replace(item, '\D', '', 'g')) >= 6
      LIMIT 1
    ),
    NULLIF(btrim(pr.phone), '')
  ) AS phone,
  pr.username,
  pr.full_name,
  pr.avatar_url,
  pr.location,
  pr.profession,
  pr.is_verified,
  EXISTS (
    SELECT 1
    FROM public.follows f
    WHERE f.follower_id = auth.uid()
      AND f.following_id = p.user_id
  ) AS from_following
FROM public.posts p
JOIN public.profiles pr ON pr.id = p.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.blocked_users b
  WHERE b.blocker_id = auth.uid() AND b.blocked_id = p.user_id
)
AND NOT EXISTS (
  SELECT 1 FROM public.muted_accounts m
  WHERE m.muter_id = auth.uid() AND m.muted_id = p.user_id AND m.mute_posts
)
;

GRANT SELECT ON public.visible_feed_posts TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
