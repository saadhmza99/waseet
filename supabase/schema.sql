-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  profession TEXT,
  location TEXT,
  bio TEXT CHECK (char_length(bio) <= 251),
  about_text TEXT,
  avatar_url TEXT,
  cover_photo_url TEXT,
  profile_type TEXT CHECK (profile_type IN ('individual', 'enterprise')),
  phone TEXT,
  email TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about_text TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ice TEXT;
COMMENT ON COLUMN public.profiles.ice IS
  'Identifiant Commun de l''Entreprise (Morocco). Shown on profile Infos when set.';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signup_ip TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signup_country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signup_country_code TEXT;

-- profile_type: craftsman / hunter are deprecated; individual / enterprise replace them.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_profile_type_check;
UPDATE public.profiles SET profile_type = 'individual' WHERE profile_type = 'craftsman';
UPDATE public.profiles SET profile_type = 'enterprise' WHERE profile_type = 'hunter';
ALTER TABLE public.profiles ADD CONSTRAINT profiles_profile_type_check
  CHECK (profile_type IS NULL OR profile_type IN ('individual', 'enterprise'));

COMMENT ON COLUMN public.profiles.is_verified IS
  'True when this profile has passed Sifarah verification. Default false until a moderator sets it.';
COMMENT ON COLUMN public.profiles.verified_at IS
  'UTC time when is_verified became true. Cleared if verification is revoked.';
COMMENT ON COLUMN public.profiles.contact_updated_at IS
  'UTC time when phone, email, or website_url last changed.';
COMMENT ON COLUMN public.profiles.avatar_updated_at IS
  'UTC time when avatar_url last changed.';
COMMENT ON COLUMN public.profiles.signup_ip IS
  'Public IP observed at account creation. Used only to derive signup_country; not shown on the profile.';
COMMENT ON COLUMN public.profiles.signup_country IS
  'Country name resolved from signup_ip at account creation. Immutable after first save.';
COMMENT ON COLUMN public.profiles.signup_country_code IS
  'ISO country code resolved from signup_ip at account creation.';

UPDATE public.profiles
SET
  is_verified = COALESCE(is_verified, FALSE),
  contact_updated_at = COALESCE(contact_updated_at, updated_at, created_at),
  avatar_updated_at = COALESCE(avatar_updated_at, updated_at, created_at)
WHERE contact_updated_at IS NULL
   OR avatar_updated_at IS NULL
   OR is_verified IS NULL;

CREATE OR REPLACE FUNCTION public.track_profile_field_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.is_verified := COALESCE(NEW.is_verified, FALSE);
    NEW.contact_updated_at := COALESCE(NEW.contact_updated_at, NEW.created_at, NOW());
    NEW.avatar_updated_at := COALESCE(NEW.avatar_updated_at, NEW.created_at, NOW());
    IF NEW.is_verified IS TRUE THEN
      NEW.verified_at := COALESCE(NEW.verified_at, NOW());
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.phone IS DISTINCT FROM OLD.phone
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.website_url IS DISTINCT FROM OLD.website_url THEN
    NEW.contact_updated_at := NOW();
  END IF;

  IF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN
    NEW.avatar_updated_at := NOW();
  END IF;

  -- Signup origin is written once from the creation IP and must not be rewritten later.
  IF OLD.signup_ip IS NOT NULL THEN
    NEW.signup_ip := OLD.signup_ip;
  END IF;
  IF OLD.signup_country IS NOT NULL THEN
    NEW.signup_country := OLD.signup_country;
  END IF;
  IF OLD.signup_country_code IS NOT NULL THEN
    NEW.signup_country_code := OLD.signup_country_code;
  END IF;

  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    IF NEW.is_verified THEN
      NEW.verified_at := COALESCE(NEW.verified_at, NOW());
    ELSE
      NEW.verified_at := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS track_profile_field_updates_trigger ON public.profiles;
CREATE TRIGGER track_profile_field_updates_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.track_profile_field_updates();

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT '',
  description TEXT,
  before_image_url TEXT,
  after_image_url TEXT,
  single_image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_sponsored BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Listings/Jobs table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  profession TEXT,
  location TEXT NOT NULL,
  price_range TEXT,
  image_url TEXT,
  image_count INTEGER DEFAULT 0,
  is_sponsored BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Post comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Likes table (for posts)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Post shares table
CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Portfolio items table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  text TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Saved posts table
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Saved listings table
CREATE TABLE IF NOT EXISTS public.saved_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, listing_id)
);

-- Saved reels table
CREATE TABLE IF NOT EXISTS public.saved_reels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, reel_id)
);

-- Reels table (videos from Cloudflare Stream)
CREATE TABLE IF NOT EXISTS public.reels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cloudflare_video_id TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Reel likes table
CREATE TABLE IF NOT EXISTS public.reel_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(reel_id, user_id)
);

-- Reel comments table
CREATE TABLE IF NOT EXISTS public.reel_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Reel shares table
CREATE TABLE IF NOT EXISTS public.reel_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(reel_id, user_id)
);

-- Function to increment a column value
CREATE OR REPLACE FUNCTION public.increment(
  table_name TEXT,
  column_name TEXT,
  row_id UUID,
  increment_value INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + $1 WHERE id = $2', table_name, column_name, column_name)
  USING increment_value, row_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement a column value
CREATE OR REPLACE FUNCTION public.decrement(
  table_name TEXT,
  column_name TEXT,
  row_id UUID,
  decrement_value INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = GREATEST(%I - $1, 0) WHERE id = $2', table_name, column_name, column_name)
  USING decrement_value, row_id;
END;
$$ LANGUAGE plpgsql;

-- Default profile photo (Sifarah PRO hard-hat) in Storage: images/avatars/default-pro.jpg
CREATE OR REPLACE FUNCTION public.get_default_avatar_url(profile_kind TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Same branded mark for all profile kinds; kept as a function for triggers / backfills.
  RETURN 'https://auusinntfgmoneqhjcbe.supabase.co/storage/v1/object/public/images/avatars/default-pro.jpg';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.enforce_profile_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NULL OR btrim(NEW.username) = '' THEN
    NEW.username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  IF NEW.avatar_url IS NULL OR btrim(NEW.avatar_url) = '' THEN
    NEW.avatar_url := public.get_default_avatar_url(COALESCE(NEW.profile_type, 'individual'));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_profile_defaults_trigger ON public.profiles;
CREATE TRIGGER enforce_profile_defaults_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_defaults();

UPDATE public.profiles
SET
  username = COALESCE(NULLIF(btrim(username), ''), 'user_' || substr(id::text, 1, 8)),
  avatar_url = COALESCE(NULLIF(btrim(avatar_url), ''), public.get_default_avatar_url(COALESCE(profile_type, 'individual')))
WHERE username IS NULL
   OR btrim(username) = ''
   OR avatar_url IS NULL
   OR btrim(avatar_url) = '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Visitors (anonymous sign-ins) live in public.visitors, not in profiles.
  IF COALESCE(NEW.is_anonymous, FALSE) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (
    id, username, full_name, profession, location, bio, phone, email, profile_type,
    signup_ip, signup_country, signup_country_code
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
    CASE NEW.raw_user_meta_data->>'profile_type'
      WHEN 'individual' THEN 'individual'
      WHEN 'enterprise' THEN 'enterprise'
      WHEN 'craftsman' THEN 'individual'
      WHEN 'hunter' THEN 'enterprise'
      ELSE 'individual'
    END,
    NULLIF(btrim(NEW.raw_user_meta_data->>'signup_ip'), ''),
    NULLIF(btrim(NEW.raw_user_meta_data->>'signup_country'), ''),
    NULLIF(btrim(NEW.raw_user_meta_data->>'signup_country_code'), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- auth.users has no full_name column. Name, phone, username, etc. live in
-- raw_user_meta_data. Keep that JSON in sync whenever public.profiles changes
-- so the Auth dashboard and JWT user_metadata match the profile.
CREATE OR REPLACE FUNCTION public.sync_profile_to_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'full_name', NEW.full_name,
    'username', NEW.username,
    'phone', NEW.phone,
    'email', NEW.email,
    'profession', NEW.profession,
    'location', NEW.location,
    'bio', NEW.bio,
    'profile_type', NEW.profile_type,
    'avatar_url', NEW.avatar_url
  )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_to_auth_trigger ON public.profiles;
CREATE TRIGGER sync_profile_to_auth_trigger
  AFTER INSERT OR UPDATE OF
    full_name, username, phone, email, profession, location, bio, profile_type, avatar_url
  ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_auth();

UPDATE auth.users u
SET raw_user_meta_data = COALESCE(u.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
  'full_name', p.full_name,
  'username', p.username,
  'phone', p.phone,
  'email', p.email,
  'profession', p.profession,
  'location', p.location,
  'bio', p.bio,
  'profile_type', p.profile_type,
  'avatar_url', p.avatar_url
)
FROM public.profiles p
WHERE u.id = p.id;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_reels_updated_at ON public.reels;
CREATE TRIGGER update_reels_updated_at
  BEFORE UPDATE ON public.reels
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_reel_comments_updated_at ON public.reel_comments;
CREATE TRIGGER update_reel_comments_updated_at
  BEFORE UPDATE ON public.reel_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for posts
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
CREATE POLICY "Users can create their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      COALESCE(post_type, 'standard') <> 'standard'
      OR EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = user_id AND pr.is_verified IS TRUE
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for listings
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
CREATE POLICY "Listings are viewable by everyone"
  ON public.listings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own listings" ON public.listings;
CREATE POLICY "Users can create their own listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;
CREATE POLICY "Users can delete their own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for post_comments
DROP POLICY IF EXISTS "Post comments are viewable by everyone" ON public.post_comments;
CREATE POLICY "Post comments are viewable by everyone"
  ON public.post_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create post comments" ON public.post_comments;
CREATE POLICY "Authenticated users can create post comments"
  ON public.post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own post comments" ON public.post_comments;
CREATE POLICY "Users can update their own post comments"
  ON public.post_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own post comments" ON public.post_comments;
CREATE POLICY "Users can delete their own post comments"
  ON public.post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for post_likes
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.post_likes;
CREATE POLICY "Likes are viewable by everyone"
  ON public.post_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.post_likes;
CREATE POLICY "Authenticated users can like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.post_likes;
CREATE POLICY "Users can unlike their own likes"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for post_shares
DROP POLICY IF EXISTS "Post shares are viewable by everyone" ON public.post_shares;
CREATE POLICY "Post shares are viewable by everyone"
  ON public.post_shares FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can share posts" ON public.post_shares;
CREATE POLICY "Authenticated users can share posts"
  ON public.post_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unshare posts" ON public.post_shares;
CREATE POLICY "Users can unshare posts"
  ON public.post_shares FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for portfolio_items
DROP POLICY IF EXISTS "Portfolio items are viewable by everyone" ON public.portfolio_items;
CREATE POLICY "Portfolio items are viewable by everyone"
  ON public.portfolio_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own portfolio" ON public.portfolio_items;
CREATE POLICY "Users can manage their own portfolio"
  ON public.portfolio_items FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- RLS Policies for follows
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can follow others" ON public.follows;
CREATE POLICY "Authenticated users can follow others"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- RLS policies for saved_posts / saved_listings are in the "Visitors" section
-- at the end of this file (they also cover visitor accounts).

-- RLS policies for saved_reels are in the "Visitors" section at the end of this file.

-- RLS Policies for reels
DROP POLICY IF EXISTS "Reels are viewable by everyone" ON public.reels;
CREATE POLICY "Reels are viewable by everyone"
  ON public.reels FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own reels" ON public.reels;
CREATE POLICY "Users can create their own reels"
  ON public.reels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reels" ON public.reels;
CREATE POLICY "Users can update their own reels"
  ON public.reels FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reels" ON public.reels;
CREATE POLICY "Users can delete their own reels"
  ON public.reels FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for reel_likes
DROP POLICY IF EXISTS "Reel likes are viewable by everyone" ON public.reel_likes;
CREATE POLICY "Reel likes are viewable by everyone"
  ON public.reel_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can like reels" ON public.reel_likes;
CREATE POLICY "Authenticated users can like reels"
  ON public.reel_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.reel_likes;
CREATE POLICY "Users can unlike their own likes"
  ON public.reel_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for reel_comments
DROP POLICY IF EXISTS "Reel comments are viewable by everyone" ON public.reel_comments;
CREATE POLICY "Reel comments are viewable by everyone"
  ON public.reel_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reel comments" ON public.reel_comments;
CREATE POLICY "Authenticated users can create reel comments"
  ON public.reel_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reel comments" ON public.reel_comments;
CREATE POLICY "Users can update their own reel comments"
  ON public.reel_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reel comments" ON public.reel_comments;
CREATE POLICY "Users can delete their own reel comments"
  ON public.reel_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for reel_shares
DROP POLICY IF EXISTS "Reel shares are viewable by everyone" ON public.reel_shares;
CREATE POLICY "Reel shares are viewable by everyone"
  ON public.reel_shares FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can share reels" ON public.reel_shares;
CREATE POLICY "Authenticated users can share reels"
  ON public.reel_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unshare reels" ON public.reel_shares;
CREATE POLICY "Users can unshare reels"
  ON public.reel_shares FOR DELETE
  USING (auth.uid() = user_id);

-- Post comment settings table
CREATE TABLE IF NOT EXISTS public.post_comment_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  permission TEXT CHECK (permission IN ('anyone', 'follow_back', 'off')) DEFAULT 'anyone' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Post reports table
CREATE TABLE IF NOT EXISTS public.post_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT DEFAULT 'user_report' NOT NULL,
  status TEXT CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')) DEFAULT 'pending' NOT NULL,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(post_id, reporter_id)
);

ALTER TABLE IF EXISTS public.post_reports
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE IF EXISTS public.post_reports
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.post_reports
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE IF EXISTS public.post_reports
  ADD COLUMN IF NOT EXISTS resolution_note TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'post_reports_status_check'
  ) THEN
    ALTER TABLE public.post_reports
      ADD CONSTRAINT post_reports_status_check
      CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed'));
  END IF;
END $$;

-- Blocked users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Moderation admins table
CREATE TABLE IF NOT EXISTS public.moderation_admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger for post_comment_settings updated_at
DROP TRIGGER IF EXISTS update_post_comment_settings_updated_at ON public.post_comment_settings;
CREATE TRIGGER update_post_comment_settings_updated_at
  BEFORE UPDATE ON public.post_comment_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS for new moderation/settings tables
ALTER TABLE public.post_comment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_admins ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_comment_settings
DROP POLICY IF EXISTS "Post comment settings are viewable by everyone" ON public.post_comment_settings;
CREATE POLICY "Post comment settings are viewable by everyone"
  ON public.post_comment_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own post comment settings" ON public.post_comment_settings;
CREATE POLICY "Users can manage their own post comment settings"
  ON public.post_comment_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.profile_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT DEFAULT 'user_report' NOT NULL,
  status TEXT CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')) DEFAULT 'pending' NOT NULL,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(profile_id, reporter_id)
);

ALTER TABLE public.profile_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create profile reports" ON public.profile_reports;
CREATE POLICY "Users can create profile reports"
  ON public.profile_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view their own profile reports" ON public.profile_reports;
CREATE POLICY "Users can view their own profile reports"
  ON public.profile_reports FOR SELECT
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Moderators can view all profile reports" ON public.profile_reports;
CREATE POLICY "Moderators can view all profile reports"
  ON public.profile_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.moderation_admins ma
      WHERE ma.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Moderators can update profile reports" ON public.profile_reports;
CREATE POLICY "Moderators can update profile reports"
  ON public.profile_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.moderation_admins ma
      WHERE ma.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.moderation_admins ma
      WHERE ma.user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT ON public.profile_reports TO authenticated;

-- RLS policies for post_reports
DROP POLICY IF EXISTS "Users can create post reports" ON public.post_reports;
CREATE POLICY "Users can create post reports"
  ON public.post_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view their own post reports" ON public.post_reports;
CREATE POLICY "Users can view their own post reports"
  ON public.post_reports FOR SELECT
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Moderators can view all post reports" ON public.post_reports;
CREATE POLICY "Moderators can view all post reports"
  ON public.post_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.moderation_admins ma
      WHERE ma.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Moderators can update post reports" ON public.post_reports;
CREATE POLICY "Moderators can update post reports"
  ON public.post_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.moderation_admins ma
      WHERE ma.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.moderation_admins ma
      WHERE ma.user_id = auth.uid()
    )
  );

-- RLS policies for blocked_users
DROP POLICY IF EXISTS "Users can create their own blocks" ON public.blocked_users;
CREATE POLICY "Users can create their own blocks"
  ON public.blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocked_users;
CREATE POLICY "Users can view their own blocks"
  ON public.blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

-- Direct DELETE is revoked: unblocking must go through unblock_account() so the 48h cooldown is stored.
DROP POLICY IF EXISTS "Users can remove their own blocks" ON public.blocked_users;

REVOKE ALL ON TABLE public.blocked_users FROM PUBLIC;
GRANT SELECT, INSERT ON TABLE public.blocked_users TO authenticated;

-- After an unblock, the same blocker cannot block that account again for 48 hours.
-- unblocked_at is written by unblock_account(); the timer is unblocked_at + 48 hours (UTC).
CREATE TABLE IF NOT EXISTS public.block_cooldowns (
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  unblocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

COMMENT ON TABLE public.block_cooldowns IS
  'Stores the last unblock time per blocker/blocked pair. A new row in blocked_users is rejected until unblocked_at + 48 hours.';
COMMENT ON COLUMN public.block_cooldowns.unblocked_at IS
  'UTC timestamp of the last successful unblock. Re-block is allowed only after unblocked_at + interval 48 hours.';

ALTER TABLE public.block_cooldowns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own block cooldowns" ON public.block_cooldowns;
CREATE POLICY "Users can view their own block cooldowns"
  ON public.block_cooldowns FOR SELECT
  USING (auth.uid() = blocker_id);

REVOKE ALL ON TABLE public.block_cooldowns FROM PUBLIC;
GRANT SELECT ON TABLE public.block_cooldowns TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_block_cooldown()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  last_unblock TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT c.unblocked_at
    INTO last_unblock
  FROM public.block_cooldowns c
  WHERE c.blocker_id = NEW.blocker_id
    AND c.blocked_id = NEW.blocked_id;

  IF last_unblock IS NOT NULL
     AND last_unblock + INTERVAL '48 hours' > NOW() THEN
    RAISE EXCEPTION 'BLOCK_COOLDOWN'
      USING ERRCODE = 'P0001',
            DETAIL = 'Cannot block this account again until 48 hours after the last unblock.';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_block_cooldown() IS
  'BEFORE INSERT on blocked_users: rejects a block when the same pair was unblocked less than 48 hours ago.';

DROP TRIGGER IF EXISTS trg_enforce_block_cooldown ON public.blocked_users;
CREATE TRIGGER trg_enforce_block_cooldown
  BEFORE INSERT ON public.blocked_users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_block_cooldown();

CREATE OR REPLACE FUNCTION public.unblock_account(target_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor UUID := auth.uid();
  removed INTEGER;
BEGIN
  IF actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF target_id IS NULL OR target_id = actor THEN
    RAISE EXCEPTION 'Invalid target';
  END IF;

  DELETE FROM public.blocked_users
  WHERE blocker_id = actor
    AND blocked_id = target_id;

  GET DIAGNOSTICS removed = ROW_COUNT;
  IF removed = 0 THEN
    RAISE EXCEPTION 'Not blocked';
  END IF;

  INSERT INTO public.block_cooldowns (blocker_id, blocked_id, unblocked_at)
  VALUES (actor, target_id, NOW())
  ON CONFLICT (blocker_id, blocked_id)
  DO UPDATE SET unblocked_at = EXCLUDED.unblocked_at;
END;
$$;

COMMENT ON FUNCTION public.unblock_account(UUID) IS
  'Removes the current block and records unblocked_at. The blocker cannot block target_id again for 48 hours.';

REVOKE ALL ON FUNCTION public.unblock_account(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unblock_account(UUID) TO authenticated;

-- RLS policies for moderation_admins
DROP POLICY IF EXISTS "Users can view own moderation membership" ON public.moderation_admins;
CREATE POLICY "Users can view own moderation membership"
  ON public.moderation_admins FOR SELECT
  USING (auth.uid() = user_id);

-- User settings table (persist app preferences in DB)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  notifications_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  email_notifications_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  dark_mode_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  language TEXT DEFAULT 'English' NOT NULL,
  region TEXT DEFAULT 'UAE' NOT NULL,
  show_phone BOOLEAN DEFAULT FALSE NOT NULL,
  allow_direct_messages BOOLEAN DEFAULT TRUE NOT NULL,
  show_activity_status BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE IF EXISTS public.user_settings
  ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE IF EXISTS public.user_settings
  ADD COLUMN IF NOT EXISTS allow_direct_messages BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE IF EXISTS public.user_settings
  ADD COLUMN IF NOT EXISTS show_activity_status BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE IF EXISTS public.user_settings
  ADD COLUMN IF NOT EXISTS comment_permission TEXT DEFAULT 'followers' NOT NULL;
ALTER TABLE IF EXISTS public.user_settings
  ADD COLUMN IF NOT EXISTS tag_permission TEXT DEFAULT 'everyone' NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_settings_comment_permission_check'
  ) THEN
    ALTER TABLE public.user_settings
      ADD CONSTRAINT user_settings_comment_permission_check
      CHECK (comment_permission IN ('followers', 'follow_back', 'off'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_settings_tag_permission_check'
  ) THEN
    ALTER TABLE public.user_settings
      ADD CONSTRAINT user_settings_tag_permission_check
      CHECK (tag_permission IN ('everyone', 'following', 'off'));
  END IF;
END $$;

COMMENT ON COLUMN public.user_settings.comment_permission IS
  'Who may comment on this user''s posts unless a post overrides it: followers, follow_back, or off.';
COMMENT ON COLUMN public.user_settings.tag_permission IS
  'Who may tag this user: everyone, people they follow (following), or off.';

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.user_settings TO authenticated;

-- Muted accounts (hide posts and/or services in the viewer feed)
CREATE TABLE IF NOT EXISTS public.muted_accounts (
  muter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  muted_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mute_posts BOOLEAN DEFAULT FALSE NOT NULL,
  mute_services BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (muter_id, muted_id),
  CHECK (muter_id != muted_id),
  CHECK (mute_posts OR mute_services)
);

COMMENT ON TABLE public.muted_accounts IS
  'Viewer-chosen mutes. mute_posts hides that account''s posts; mute_services hides their listings/jobs.';

ALTER TABLE public.muted_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own mutes" ON public.muted_accounts;
CREATE POLICY "Users can manage their own mutes"
  ON public.muted_accounts FOR ALL
  USING (auth.uid() = muter_id)
  WITH CHECK (auth.uid() = muter_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.muted_accounts TO authenticated;

-- @username tags on posts and comments
CREATE TABLE IF NOT EXISTS public.user_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tagged_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tagged_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT CHECK (entity_type IN ('post', 'comment')) NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (entity_type, entity_id, tagged_user_id)
);

COMMENT ON TABLE public.user_tags IS
  'Mentions created from @username in posts or comments. Insert is rejected when the tagged user disallows tags.';

ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.user_tags;
CREATE POLICY "Tags are viewable by everyone"
  ON public.user_tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create tags they author" ON public.user_tags;
CREATE POLICY "Users can create tags they author"
  ON public.user_tags FOR INSERT
  WITH CHECK (auth.uid() = tagged_by);

DROP POLICY IF EXISTS "Tag authors can delete tags" ON public.user_tags;
CREATE POLICY "Tag authors can delete tags"
  ON public.user_tags FOR DELETE
  USING (auth.uid() = tagged_by OR auth.uid() = tagged_user_id);

GRANT SELECT, INSERT, DELETE ON public.user_tags TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_tag_permission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  perm TEXT;
  tagger_is_followed BOOLEAN;
BEGIN
  IF NEW.tagged_user_id = NEW.tagged_by THEN
    RETURN NEW;
  END IF;

  SELECT tag_permission INTO perm
  FROM public.user_settings
  WHERE user_id = NEW.tagged_user_id;
  perm := COALESCE(perm, 'everyone');

  IF perm = 'off' THEN
    RAISE EXCEPTION 'TAG_NOT_ALLOWED'
      USING ERRCODE = 'P0001',
            DETAIL = 'This account does not allow tags.';
  END IF;

  IF perm = 'following' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.follows
      WHERE follower_id = NEW.tagged_user_id
        AND following_id = NEW.tagged_by
    ) INTO tagger_is_followed;
    IF NOT tagger_is_followed THEN
      RAISE EXCEPTION 'TAG_NOT_ALLOWED'
        USING ERRCODE = 'P0001',
              DETAIL = 'This account only allows tags from people they follow.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_tag_permission ON public.user_tags;
CREATE TRIGGER trg_enforce_tag_permission
  BEFORE INSERT ON public.user_tags
  FOR EACH ROW EXECUTE FUNCTION public.enforce_tag_permission();

CREATE OR REPLACE FUNCTION public.enforce_comment_permission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  author UUID;
  perm TEXT;
  commenter_follows BOOLEAN;
  author_follows BOOLEAN;
BEGIN
  SELECT user_id INTO author FROM public.posts WHERE id = NEW.post_id;
  IF author IS NULL OR author = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT permission INTO perm
  FROM public.post_comment_settings
  WHERE post_id = NEW.post_id;

  IF perm IS NULL THEN
    SELECT comment_permission INTO perm
    FROM public.user_settings
    WHERE user_id = author;
    perm := COALESCE(perm, 'followers');
  END IF;

  IF perm = 'anyone' THEN
    RETURN NEW;
  END IF;
  IF perm = 'off' THEN
    RAISE EXCEPTION 'COMMENTS_OFF' USING ERRCODE = 'P0001';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.follows
    WHERE follower_id = NEW.user_id AND following_id = author
  ) INTO commenter_follows;
  SELECT EXISTS (
    SELECT 1 FROM public.follows
    WHERE follower_id = author AND following_id = NEW.user_id
  ) INTO author_follows;

  IF perm = 'followers' AND NOT commenter_follows THEN
    RAISE EXCEPTION 'COMMENTS_FOLLOWERS_ONLY' USING ERRCODE = 'P0001';
  END IF;
  IF perm = 'follow_back' AND NOT (commenter_follows AND author_follows) THEN
    RAISE EXCEPTION 'COMMENTS_FOLLOW_BACK_ONLY' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_comment_permission ON public.post_comments;
CREATE TRIGGER trg_enforce_comment_permission
  BEFORE INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_comment_permission();

CREATE OR REPLACE FUNCTION public.get_effective_comment_permission(p_post_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT permission FROM public.post_comment_settings WHERE post_id = p_post_id),
    (
      SELECT us.comment_permission
      FROM public.posts p
      LEFT JOIN public.user_settings us ON us.user_id = p.user_id
      WHERE p.id = p_post_id
    ),
    'followers'
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_effective_comment_permission(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_effective_comment_permission(UUID) TO anon;

DO $$
BEGIN
  ALTER TABLE public.post_comment_settings DROP CONSTRAINT IF EXISTS post_comment_settings_permission_check;
  ALTER TABLE public.post_comment_settings
    ADD CONSTRAINT post_comment_settings_permission_check
    CHECK (permission IN ('anyone', 'followers', 'follow_back', 'off'));
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

-- Notifications table (in-app bell notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('post_like', 'post_comment', 'post_share', 'post_save', 'follow', 'job_invite', 'listing_save')) NOT NULL,
  entity_type TEXT CHECK (entity_type IN ('post', 'listing', 'profile', 'job_invite')) NOT NULL,
  entity_id UUID,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_target_created_at
  ON public.notifications (target_user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = target_user_id);

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create their own notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = actor_user_id
    AND actor_user_id IS DISTINCT FROM target_user_id
  );

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = target_user_id)
  WITH CHECK (auth.uid() = target_user_id);

CREATE OR REPLACE FUNCTION public.create_notification(
  p_target_user_id UUID,
  p_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_message TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nid UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF auth.uid() = p_target_user_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.notifications (
    actor_user_id,
    target_user_id,
    type,
    entity_type,
    entity_id,
    message
  ) VALUES (
    auth.uid(),
    p_target_user_id,
    p_type,
    p_entity_type,
    p_entity_id,
    p_message
  )
  RETURNING id INTO nid;

  RETURN nid;
END;
$$;

REVOKE ALL ON FUNCTION public.create_notification(UUID, TEXT, TEXT, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, UUID, TEXT) TO authenticated;

-- ---------------------------------------------------------------------------
-- Reel limits (law): max 1000 minutes stored platform-wide; max 3 reels per
-- user per calendar month (UTC); each reel capped at 30s (Cloudflare + DB).
-- ---------------------------------------------------------------------------

ALTER TABLE public.reels
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

ALTER TABLE public.reels
  DROP CONSTRAINT IF EXISTS reels_duration_seconds_cap;

ALTER TABLE public.reels
  ADD CONSTRAINT reels_duration_seconds_cap
  CHECK (
    duration_seconds IS NULL
    OR (duration_seconds > 0 AND duration_seconds <= 30)
  );

-- Serialize quota checks to avoid concurrent inserts bypassing limits.
CREATE OR REPLACE FUNCTION public.assert_reel_quota_ok()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  monthly_count INTEGER;
  total_minutes NUMERIC;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentification requise.';
  END IF;

  PERFORM pg_advisory_xact_lock(384729104);

  SELECT COUNT(*)::integer INTO monthly_count
  FROM public.reels
  WHERE user_id = uid
    AND created_at >= date_trunc('month', timezone('utc', now()));

  IF monthly_count >= 3 THEN
    RAISE EXCEPTION 'Limite: 3 reels maximum par mois calendaire (UTC).';
  END IF;

  -- Each row counts up to 30s until duration_seconds is known (conservative).
  SELECT COALESCE(
    SUM(LEAST(COALESCE(duration_seconds, 30), 30) / 60.0),
    0
  ) INTO total_minutes
  FROM public.reels;

  IF total_minutes + (30::numeric / 60.0) > 1000 THEN
    RAISE EXCEPTION 'Limite: 1000 minutes de vidéo stockées au total pour la plateforme (cap atteint).';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_reel_quota_ok() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assert_reel_quota_ok() TO authenticated;

CREATE OR REPLACE FUNCTION public.reels_enforce_upload_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Insertion reel: utilisateur non autorisé.';
  END IF;
  PERFORM public.assert_reel_quota_ok();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reels_before_insert_upload_limits ON public.reels;
CREATE TRIGGER reels_before_insert_upload_limits
  BEFORE INSERT ON public.reels
  FOR EACH ROW
  EXECUTE FUNCTION public.reels_enforce_upload_limits();

-- Reel reports (user reports on reels)
CREATE TABLE IF NOT EXISTS public.reel_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT DEFAULT 'user_report' NOT NULL,
  status TEXT CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')) DEFAULT 'pending' NOT NULL,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(reel_id, reporter_id)
);

ALTER TABLE public.reel_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create reel reports" ON public.reel_reports;
CREATE POLICY "Users can create reel reports"
  ON public.reel_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view their own reel reports" ON public.reel_reports;
CREATE POLICY "Users can view their own reel reports"
  ON public.reel_reports FOR SELECT
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Moderators can view all reel reports" ON public.reel_reports;
CREATE POLICY "Moderators can view all reel reports"
  ON public.reel_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.moderation_admins ma
      WHERE ma.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Moderators can update reel reports" ON public.reel_reports;
CREATE POLICY "Moderators can update reel reports"
  ON public.reel_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.moderation_admins ma
      WHERE ma.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.moderation_admins ma
      WHERE ma.user_id = auth.uid()
    )
  );

-- Post types: standard feed posts vs portfolio property/project cards
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'standard';

ALTER TABLE public.posts
  DROP CONSTRAINT IF EXISTS posts_post_type_check;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_post_type_check
  CHECK (post_type IN ('standard', 'realisation', 'property', 'project'));

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS price TEXT,
  ADD COLUMN IF NOT EXISTS surface TEXT,
  ADD COLUMN IF NOT EXISTS beds INTEGER,
  ADD COLUMN IF NOT EXISTS baths INTEGER,
  ADD COLUMN IF NOT EXISTS property_details JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS property_details JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

CREATE INDEX IF NOT EXISTS posts_user_id_post_type_idx
  ON public.posts (user_id, post_type, created_at DESC);

-- Information requests sent to agencies from posts (property / project / post)
-- or services (listings). Visitors don't need an account; email is optional.
DO $$
BEGIN
  IF to_regclass('public.property_inquiries') IS NOT NULL
     AND to_regclass('public.inquiries') IS NULL THEN
    ALTER TABLE public.property_inquiries RENAME TO inquiries;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'property',
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  needs TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'property',
  ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.inquiries ALTER COLUMN email DROP NOT NULL;

UPDATE public.inquiries i
SET type = CASE WHEN p.post_type = 'standard' THEN 'post' ELSE p.post_type END
FROM public.posts p
WHERE i.post_id = p.id AND i.listing_id IS NULL;

UPDATE public.inquiries SET type = 'service' WHERE listing_id IS NOT NULL;

ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_type_check;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_type_check
  CHECK (type IN ('property', 'project', 'service', 'post'));

ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_target_check;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_target_check
  CHECK ((post_id IS NOT NULL) <> (listing_id IS NOT NULL)) NOT VALID;

CREATE INDEX IF NOT EXISTS inquiries_seller_created_idx
  ON public.inquiries (seller_id, created_at DESC);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can send a property inquiry" ON public.inquiries;
DROP POLICY IF EXISTS "Anyone can send an inquiry" ON public.inquiries;
CREATE POLICY "Anyone can send an inquiry"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sellers can view their property inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Sellers can view their inquiries" ON public.inquiries;
CREATE POLICY "Sellers can view their inquiries"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = seller_id);

ALTER TABLE public.posts ALTER COLUMN title DROP NOT NULL;
ALTER TABLE public.posts ALTER COLUMN title SET DEFAULT '';

-- Feed "Bonjour!" banner: images rotate every 15 minutes in sort_order.
-- image_url can be a path under frontend/public (e.g. /feed-banners/x.jpg) or a full URL.
CREATE TABLE IF NOT EXISTS public.feed_banner_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_url TEXT NOT NULL UNIQUE,
  alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.feed_banner_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active feed banner images" ON public.feed_banner_images;
CREATE POLICY "Anyone can view active feed banner images"
  ON public.feed_banner_images FOR SELECT
  USING (is_active);

INSERT INTO public.feed_banner_images (image_url, alt, sort_order) VALUES
  ('/feed-banners/agadir-plage.png', 'Plage d’Agadir au coucher du soleil', 1),
  ('/feed-banners/palais-piscine.webp', 'Palais marocain avec piscine', 2),
  ('/feed-banners/villa-jardin.webp', 'Villa marocaine dans un jardin', 3),
  ('/feed-banners/riad-patio.jpg', 'Patio de riad avec piscine', 4)
ON CONFLICT (image_url) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Visitors: regular traffic (not agencies / professionals).
-- A visitor is a Supabase anonymous sign-in (no password, no email verification)
-- plus the contact details they typed. Agencies keep using email + password
-- and live in public.profiles.
-- Requires: Dashboard > Authentication > Sign In / Providers > "Allow anonymous sign-ins".
-- A visitor session stays valid while the visitor comes back at least once every
-- 30 days; after 30 days of inactivity it can no longer be renewed. The visitor
-- then fills the form again: if name + phone match a stored visitor, the new
-- session takes over that visitor (same lead, same saves).
-- public.visitors is also the leads table: one row per person, kept even if the
-- auth account behind it is deleted.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.normalize_phone(p TEXT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN d LIKE '00212%' THEN '0' || substr(d, 6)
    WHEN d LIKE '212%' AND length(d) = 12 THEN '0' || substr(d, 4)
    ELSE d
  END
  FROM (SELECT regexp_replace(COALESCE(p, ''), '\D', '', 'g') AS d) digits;
$$;

CREATE OR REPLACE FUNCTION public.normalize_person_name(p TEXT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE
AS $$
  SELECT lower(regexp_replace(btrim(COALESCE(p, '')), '\s+', ' ', 'g'));
$$;

CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Earlier shape keyed visitors.id on auth.users; move that link to user_id.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'visitors' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.visitors DROP CONSTRAINT IF EXISTS visitors_id_fkey;
    ALTER TABLE public.visitors ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
    UPDATE public.visitors SET user_id = id;
    ALTER TABLE public.visitors ALTER COLUMN id SET DEFAULT uuid_generate_v4();
  END IF;
END $$;

ALTER TABLE public.visitors
  ADD COLUMN IF NOT EXISTS phone_normalized TEXT GENERATED ALWAYS AS (public.normalize_phone(phone)) STORED,
  ADD COLUMN IF NOT EXISTS name_normalized TEXT GENERATED ALWAYS AS (public.normalize_person_name(name)) STORED,
  ADD COLUMN IF NOT EXISTS login_count INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE INDEX IF NOT EXISTS visitors_phone_name_idx
  ON public.visitors (phone_normalized, name_normalized);
CREATE INDEX IF NOT EXISTS visitors_created_idx
  ON public.visitors (created_at DESC);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Visitors read their own row; writes only go through the functions below so
-- last_seen_at can't be pushed forward by hand.
DROP POLICY IF EXISTS "Visitors can view their own row" ON public.visitors;
CREATE POLICY "Visitors can view their own row"
  ON public.visitors FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_anonymous_session()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, FALSE);
$$;

-- TRUE for members (agencies / professionals) and for visitors seen in the last 30 days.
CREATE OR REPLACE FUNCTION public.visitor_session_active()
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_anonymous_session() THEN
    RETURN TRUE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.visitors
    WHERE user_id = auth.uid()
      AND last_seen_at > NOW() - INTERVAL '30 days'
  );
END;
$$;

-- Called right after an anonymous sign-in with the form values.
-- Returns TRUE when name + phone matched a stored visitor and that visitor
-- (lead + saves) was moved onto the new session, FALSE when a new lead was created.
DROP FUNCTION IF EXISTS public.register_visitor(TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.register_visitor(p_name TEXT, p_phone TEXT, p_email TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_visitor_id UUID;
  v_old_user UUID;
BEGIN
  IF v_uid IS NULL OR NOT public.is_anonymous_session() THEN
    RAISE EXCEPTION 'register_visitor requires an anonymous session';
  END IF;
  IF COALESCE(btrim(p_name), '') = '' OR public.normalize_phone(p_phone) = '' THEN
    RAISE EXCEPTION 'name and phone are required';
  END IF;

  IF EXISTS (SELECT 1 FROM public.visitors WHERE user_id = v_uid) THEN
    UPDATE public.visitors
    SET name = btrim(p_name),
        phone = btrim(p_phone),
        email = COALESCE(NULLIF(btrim(p_email), ''), email)
    WHERE user_id = v_uid;
    RETURN FALSE;
  END IF;

  SELECT id, user_id INTO v_visitor_id, v_old_user
  FROM public.visitors
  WHERE phone_normalized = public.normalize_phone(p_phone)
    AND name_normalized = public.normalize_person_name(p_name)
  ORDER BY last_seen_at DESC
  LIMIT 1;

  IF v_visitor_id IS NULL THEN
    INSERT INTO public.visitors (user_id, name, phone, email)
    VALUES (v_uid, btrim(p_name), btrim(p_phone), NULLIF(btrim(p_email), ''));
    RETURN FALSE;
  END IF;

  IF v_old_user IS NOT NULL THEN
    UPDATE public.saved_posts SET user_id = v_uid WHERE user_id = v_old_user;
    UPDATE public.saved_listings SET user_id = v_uid WHERE user_id = v_old_user;
    UPDATE public.saved_reels SET user_id = v_uid WHERE user_id = v_old_user;
    UPDATE public.saved_projects SET user_id = v_uid WHERE user_id = v_old_user;
    UPDATE public.saved_products SET user_id = v_uid WHERE user_id = v_old_user;
    UPDATE public.follows SET follower_id = v_uid WHERE follower_id = v_old_user;
  END IF;

  UPDATE public.visitors
  SET user_id = v_uid,
      email = COALESCE(NULLIF(btrim(p_email), ''), email),
      last_seen_at = NOW(),
      login_count = login_count + 1
  WHERE id = v_visitor_id;

  -- The old anonymous account is now empty; remove it if we're allowed to.
  IF v_old_user IS NOT NULL THEN
    BEGIN
      DELETE FROM auth.users WHERE id = v_old_user AND is_anonymous;
    EXCEPTION WHEN insufficient_privilege THEN
      NULL;
    END;
  END IF;

  RETURN TRUE;
END;
$$;

-- Called on each visit: renews the 30-day window, or returns FALSE if it already lapsed.
CREATE OR REPLACE FUNCTION public.touch_visitor()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.visitors
  SET last_seen_at = NOW()
  WHERE user_id = auth.uid()
    AND last_seen_at > NOW() - INTERVAL '30 days';
  RETURN FOUND;
END;
$$;

-- Visitor edits their own profile (the only things a visitor profile holds).
CREATE OR REPLACE FUNCTION public.update_visitor_profile(
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.visitors WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'update_visitor_profile requires a particulier profile';
  END IF;
  IF COALESCE(btrim(p_name), '') = '' OR public.normalize_phone(p_phone) = '' THEN
    RAISE EXCEPTION 'name and phone are required';
  END IF;

  UPDATE public.visitors
  SET name = btrim(p_name),
      phone = btrim(p_phone),
      email = NULLIF(btrim(p_email), ''),
      bio = NULLIF(btrim(p_bio), ''),
      avatar_url = NULLIF(btrim(p_avatar_url), '')
  WHERE user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.register_visitor(TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.touch_visitor() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_visitor_profile(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_visitor(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_visitor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_visitor_profile(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Link each information request to the visitor (lead) who sent it.
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS visitor_id UUID REFERENCES public.visitors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS inquiries_visitor_idx ON public.inquiries (visitor_id);

CREATE OR REPLACE FUNCTION public.set_inquiry_visitor()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.visitor_id := NULL;
  IF auth.uid() IS NOT NULL THEN
    SELECT id INTO NEW.visitor_id FROM public.visitors WHERE user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_inquiry_visitor_trigger ON public.inquiries;
CREATE TRIGGER set_inquiry_visitor_trigger
  BEFORE INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_inquiry_visitor();

-- Visitors can't create an agency / professional profile.
DROP POLICY IF EXISTS "Visitors cannot create profiles" ON public.profiles;
CREATE POLICY "Visitors cannot create profiles"
  ON public.profiles AS RESTRICTIVE FOR INSERT
  WITH CHECK (NOT public.is_anonymous_session());

-- Saved posts / listings / reels belong to any auth user (member or visitor), not only profiles.
ALTER TABLE public.saved_posts DROP CONSTRAINT IF EXISTS saved_posts_user_id_fkey;
ALTER TABLE public.saved_posts
  ADD CONSTRAINT saved_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.saved_listings DROP CONSTRAINT IF EXISTS saved_listings_user_id_fkey;
ALTER TABLE public.saved_listings
  ADD CONSTRAINT saved_listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.saved_reels DROP CONSTRAINT IF EXISTS saved_reels_user_id_fkey;
ALTER TABLE public.saved_reels
  ADD CONSTRAINT saved_reels_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users can view their own saved reels" ON public.saved_reels;
CREATE POLICY "Users can view their own saved reels"
  ON public.saved_reels FOR SELECT
  USING (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can save reels" ON public.saved_reels;
CREATE POLICY "Users can save reels"
  ON public.saved_reels FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can unsave reels" ON public.saved_reels;
CREATE POLICY "Users can unsave reels"
  ON public.saved_reels FOR DELETE
  USING (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can view their own saved posts" ON public.saved_posts;
CREATE POLICY "Users can view their own saved posts"
  ON public.saved_posts FOR SELECT
  USING (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can save posts" ON public.saved_posts;
CREATE POLICY "Users can save posts"
  ON public.saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can unsave posts" ON public.saved_posts;
CREATE POLICY "Users can unsave posts"
  ON public.saved_posts FOR DELETE
  USING (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can view their own saved listings" ON public.saved_listings;
CREATE POLICY "Users can view their own saved listings"
  ON public.saved_listings FOR SELECT
  USING (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can save listings" ON public.saved_listings;
CREATE POLICY "Users can save listings"
  ON public.saved_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can unsave listings" ON public.saved_listings;
CREATE POLICY "Users can unsave listings"
  ON public.saved_listings FOR DELETE
  USING (auth.uid() = user_id AND public.visitor_session_active());

-- 3 private messages per person per post/listing, then a 24h cooldown.
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

UPDATE public.inquiries i
SET sender_id = v.user_id
FROM public.visitors v
WHERE i.sender_id IS NULL AND i.visitor_id = v.id;

CREATE INDEX IF NOT EXISTS inquiries_rate_post_idx
  ON public.inquiries (post_id, created_at DESC) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS inquiries_rate_listing_idx
  ON public.inquiries (listing_id, created_at DESC) WHERE listing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS inquiries_sender_created_idx
  ON public.inquiries (sender_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.inquiry_rate_retry_at(
  p_sender UUID,
  p_visitor UUID,
  p_phone TEXT,
  p_post UUID,
  p_listing UUID
)
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT MIN(created_at) + INTERVAL '24 hours'
  FROM (
    SELECT i.created_at
    FROM public.inquiries i
    WHERE i.created_at > NOW() - INTERVAL '24 hours'
      AND (
        (p_post IS NOT NULL AND i.post_id = p_post)
        OR (p_listing IS NOT NULL AND i.listing_id = p_listing)
      )
      AND (
        (p_sender IS NOT NULL AND i.sender_id = p_sender)
        OR (p_visitor IS NOT NULL AND i.visitor_id = p_visitor)
        OR (COALESCE(public.normalize_phone(p_phone), '') <> '' AND public.normalize_phone(i.phone) = public.normalize_phone(p_phone))
      )
    ORDER BY i.created_at DESC
    LIMIT 3
  ) recent;
$$;

CREATE OR REPLACE FUNCTION public.inquiry_rate_count(
  p_sender UUID,
  p_visitor UUID,
  p_phone TEXT,
  p_post UUID,
  p_listing UUID
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.inquiries i
  WHERE i.created_at > NOW() - INTERVAL '24 hours'
    AND (
      (p_post IS NOT NULL AND i.post_id = p_post)
      OR (p_listing IS NOT NULL AND i.listing_id = p_listing)
    )
    AND (
      (p_sender IS NOT NULL AND i.sender_id = p_sender)
      OR (p_visitor IS NOT NULL AND i.visitor_id = p_visitor)
      OR (COALESCE(public.normalize_phone(p_phone), '') <> '' AND public.normalize_phone(i.phone) = public.normalize_phone(p_phone))
    );
$$;

CREATE OR REPLACE FUNCTION public.inquiry_rate_status(
  p_post_id UUID DEFAULT NULL,
  p_listing_id UUID DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_visitor UUID;
  v_phone TEXT := NULLIF(btrim(COALESCE(p_phone, '')), '');
  v_count INTEGER;
  v_retry TIMESTAMPTZ;
BEGIN
  IF v_uid IS NOT NULL THEN
    SELECT id INTO v_visitor FROM public.visitors WHERE user_id = v_uid;
    IF v_phone IS NULL THEN
      SELECT NULLIF(btrim(phone), '') INTO v_phone FROM public.visitors WHERE user_id = v_uid;
    END IF;
    IF v_phone IS NULL THEN
      SELECT NULLIF(btrim(phone), '') INTO v_phone FROM public.profiles WHERE id = v_uid;
    END IF;
  END IF;

  v_count := public.inquiry_rate_count(v_uid, v_visitor, v_phone, p_post_id, p_listing_id);
  IF v_count >= 3 THEN
    v_retry := public.inquiry_rate_retry_at(v_uid, v_visitor, v_phone, p_post_id, p_listing_id);
    RETURN json_build_object('allowed', false, 'remaining', 0, 'retry_at', v_retry);
  END IF;
  RETURN json_build_object('allowed', true, 'remaining', 3 - v_count, 'retry_at', NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_inquiry_visitor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_retry TIMESTAMPTZ;
BEGIN
  NEW.sender_id := auth.uid();
  NEW.visitor_id := NULL;
  IF auth.uid() IS NOT NULL THEN
    SELECT id INTO NEW.visitor_id FROM public.visitors WHERE user_id = auth.uid();
  END IF;

  v_count := public.inquiry_rate_count(NEW.sender_id, NEW.visitor_id, NEW.phone, NEW.post_id, NEW.listing_id);
  IF v_count >= 3 THEN
    v_retry := public.inquiry_rate_retry_at(NEW.sender_id, NEW.visitor_id, NEW.phone, NEW.post_id, NEW.listing_id);
    RAISE EXCEPTION 'INQUIRY_RATE_LIMIT:%', COALESCE(v_retry::TEXT, '')
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_inquiry_visitor_trigger ON public.inquiries;
CREATE TRIGGER set_inquiry_visitor_trigger
  BEFORE INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_inquiry_visitor();

REVOKE ALL ON FUNCTION public.inquiry_rate_count(UUID, UUID, TEXT, UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.inquiry_rate_retry_at(UUID, UUID, TEXT, UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.inquiry_rate_status(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inquiry_rate_status(UUID, UUID, TEXT) TO authenticated, anon;

-- Biens and projets live in their own tables so they can sit in the portfolio
-- without a row in `posts`. A feed copy is optional (posts.property_id / project_id).
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT,
  city TEXT,
  region TEXT,
  price TEXT,
  surface TEXT,
  beds INTEGER,
  baths INTEGER,
  images JSONB DEFAULT '[]'::jsonb,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Projects: English typed columns matching create-project form (UI labels stay French).
-- Nested lists use named JSONB arrays — there is no monolithic `details` blob.
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT,
  city TEXT,
  region TEXT,
  neighborhood TEXT,
  address TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Maroc',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  category TEXT,
  subtype TEXT,
  project_type TEXT,
  status TEXT,
  commercial_status TEXT,
  progress INTEGER DEFAULT 0,
  start_date TEXT,
  expected_end TEXT,
  actual_end TEXT,
  cover_image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  typologies TEXT,
  equipment TEXT,
  nearby TEXT,
  price_on_request BOOLEAN DEFAULT false,
  price_from NUMERIC,
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'MAD',
  usage TEXT,
  land_area TEXT,
  built_area TEXT,
  buildings TEXT,
  floors TEXT,
  basements TEXT,
  apartments TEXT,
  parking TEXT,
  surface TEXT,
  promoter_id TEXT,
  promoter_name TEXT,
  promoter_website TEXT,
  team JSONB DEFAULT '[]'::jsonb,
  partners JSONB DEFAULT '[]'::jsonb,
  phases JSONB DEFAULT '[]'::jsonb,
  updates JSONB DEFAULT '[]'::jsonb,
  media JSONB DEFAULT '[]'::jsonb,
  units JSONB DEFAULT '[]'::jsonb,
  choices JSONB DEFAULT '[]'::jsonb,
  attributes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Project documents: one row per document (brochure, plans, autorisations…).
-- Kept out of projects JSONB so `privacy` is enforced by RLS: private
-- documents are only ever returned to the project owner.
CREATE TABLE IF NOT EXISTS public.projects_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'Brochure commerciale',
  url TEXT NOT NULL DEFAULT '',
  privacy TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Services: English typed columns matching create-service form (UI labels stay French).
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT,
  category TEXT,
  cover TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  kinds JSONB DEFAULT '[]'::jsonb,
  included JSONB DEFAULT '[]'::jsonb,
  options JSONB DEFAULT '[]'::jsonb,
  price_mode TEXT DEFAULT 'devis',
  amount TEXT,
  duration TEXT,
  zone_mode TEXT DEFAULT 'villes',
  cities JSONB DEFAULT '[]'::jsonb,
  region TEXT,
  travel BOOLEAN DEFAULT false,
  remote BOOLEAN DEFAULT false,
  audiences JSONB DEFAULT '[]'::jsonb,
  audience_other TEXT,
  missions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS properties_user_created_idx
  ON public.properties (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS properties_city_idx
  ON public.properties (city);
CREATE INDEX IF NOT EXISTS projects_user_created_idx
  ON public.projects (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS projects_city_idx
  ON public.projects (city);
CREATE INDEX IF NOT EXISTS projects_promoter_name_idx
  ON public.projects (promoter_name);
CREATE INDEX IF NOT EXISTS projects_status_idx
  ON public.projects (status);
CREATE INDEX IF NOT EXISTS projects_commercial_status_idx
  ON public.projects (commercial_status);
CREATE INDEX IF NOT EXISTS projects_project_type_idx
  ON public.projects (project_type);
CREATE INDEX IF NOT EXISTS projects_title_idx
  ON public.projects (title);
CREATE INDEX IF NOT EXISTS projects_documents_project_position_idx
  ON public.projects_documents (project_id, position);
CREATE INDEX IF NOT EXISTS services_user_created_idx
  ON public.services (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS services_category_idx
  ON public.services (category);
CREATE INDEX IF NOT EXISTS services_title_idx
  ON public.services (title);

-- Products: materials / catalogue items offered by fournisseurs (Sifarah Product).
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT,
  category TEXT,
  brand TEXT,
  sku TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'MAD',
  unit TEXT,
  min_quantity TEXT,
  cover TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  delivery_cities JSONB DEFAULT '[]'::jsonb,
  attributes JSONB DEFAULT '{}'::jsonb,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS products_user_created_idx
  ON public.products (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS products_category_idx
  ON public.products (category);
CREATE INDEX IF NOT EXISTS products_title_idx
  ON public.products (title);

-- Saved catalog projects & products (after parent tables exist).
CREATE TABLE IF NOT EXISTS public.saved_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, project_id)
);

CREATE TABLE IF NOT EXISTS public.saved_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved projects" ON public.saved_projects;
CREATE POLICY "Users can view their own saved projects"
  ON public.saved_projects FOR SELECT
  USING (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can save projects" ON public.saved_projects;
CREATE POLICY "Users can save projects"
  ON public.saved_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can unsave projects" ON public.saved_projects;
CREATE POLICY "Users can unsave projects"
  ON public.saved_projects FOR DELETE
  USING (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can view their own saved products" ON public.saved_products;
CREATE POLICY "Users can view their own saved products"
  ON public.saved_products FOR SELECT
  USING (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can save products" ON public.saved_products;
CREATE POLICY "Users can save products"
  ON public.saved_products FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.visitor_session_active());

DROP POLICY IF EXISTS "Users can unsave products" ON public.saved_products;
CREATE POLICY "Users can unsave products"
  ON public.saved_products FOR DELETE
  USING (auth.uid() = user_id AND public.visitor_session_active());

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
CREATE POLICY "Properties are viewable by everyone"
  ON public.properties FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own properties" ON public.properties;
CREATE POLICY "Users can create their own properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
CREATE POLICY "Users can update their own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;
CREATE POLICY "Users can delete their own properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;
CREATE POLICY "Projects are viewable by everyone"
  ON public.projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Project documents: public ones are readable by everyone; private ones only
-- by the owner of the parent project. Writes are owner-only.
DROP POLICY IF EXISTS "Project documents are viewable when public or owned" ON public.projects_documents;
CREATE POLICY "Project documents are viewable when public or owned"
  ON public.projects_documents FOR SELECT
  USING (
    privacy = 'public'
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can add documents to their own projects" ON public.projects_documents;
CREATE POLICY "Users can add documents to their own projects"
  ON public.projects_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update documents of their own projects" ON public.projects_documents;
CREATE POLICY "Users can update documents of their own projects"
  ON public.projects_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete documents of their own projects" ON public.projects_documents;
CREATE POLICY "Users can delete documents of their own projects"
  ON public.projects_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own services" ON public.services;
CREATE POLICY "Users can create their own services"
  ON public.services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own services" ON public.services;
CREATE POLICY "Users can update their own services"
  ON public.services FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;
CREATE POLICY "Users can delete their own services"
  ON public.services FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own products" ON public.products;
CREATE POLICY "Users can create their own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
CREATE POLICY "Users can update their own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
CREATE POLICY "Users can delete their own products"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_projects_documents_updated_at ON public.projects_documents;
CREATE TRIGGER update_projects_documents_updated_at
  BEFORE UPDATE ON public.projects_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

GRANT SELECT ON public.properties TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT ON public.projects_documents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects_documents TO authenticated;
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS property_id UUID,
  ADD COLUMN IF NOT EXISTS project_id UUID;

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_property_id_fkey;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_project_id_fkey;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_catalog_link_check;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_catalog_link_check
  CHECK (property_id IS NULL OR project_id IS NULL);

CREATE INDEX IF NOT EXISTS posts_city_idx ON public.posts (city);
CREATE INDEX IF NOT EXISTS posts_property_id_idx ON public.posts (property_id);
CREATE INDEX IF NOT EXISTS posts_project_id_idx ON public.posts (project_id);

UPDATE public.posts
SET city = NULLIF(btrim(property_details->>'city'), '')
WHERE city IS NULL
  AND NULLIF(btrim(property_details->>'city'), '') IS NOT NULL;

INSERT INTO public.properties (
  id, user_id, title, description, city, region, price, surface, beds, baths, images, details, created_at, updated_at
)
SELECT
  p.id,
  p.user_id,
  COALESCE(NULLIF(btrim(p.title), ''), 'Bien'),
  p.description,
  COALESCE(NULLIF(btrim(p.city), ''), NULLIF(btrim(p.property_details->>'city'), '')),
  NULLIF(btrim(p.property_details->>'region'), ''),
  p.price,
  p.surface,
  p.beds,
  p.baths,
  COALESCE(p.images, '[]'::jsonb),
  COALESCE(p.property_details, '{}'::jsonb),
  p.created_at,
  p.updated_at
FROM public.posts p
WHERE p.post_type = 'property'
  AND NOT EXISTS (SELECT 1 FROM public.properties x WHERE x.id = p.id);

INSERT INTO public.projects (
  id, user_id, title, description, city, images, created_at, updated_at
)
SELECT
  p.id,
  p.user_id,
  COALESCE(NULLIF(btrim(p.title), ''), 'Projet'),
  p.description,
  COALESCE(NULLIF(btrim(p.city), ''), NULLIF(btrim(p.property_details->>'city'), '')),
  COALESCE(p.images, '[]'::jsonb),
  p.created_at,
  p.updated_at
FROM public.posts p
WHERE p.post_type = 'project'
  AND NOT EXISTS (SELECT 1 FROM public.projects x WHERE x.id = p.id);

UPDATE public.posts
SET property_id = id
WHERE post_type = 'property' AND property_id IS NULL;

UPDATE public.posts
SET project_id = id
WHERE post_type = 'project' AND project_id IS NULL;

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS inquiries_rate_property_idx
  ON public.inquiries (property_id, created_at DESC) WHERE property_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS inquiries_rate_project_idx
  ON public.inquiries (project_id, created_at DESC) WHERE project_id IS NOT NULL;

ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_target_check;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_target_check
  CHECK (
    (
      (CASE WHEN post_id IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN listing_id IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN property_id IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN project_id IS NOT NULL THEN 1 ELSE 0 END)
    ) = 1
  ) NOT VALID;

DROP FUNCTION IF EXISTS public.inquiry_rate_retry_at(UUID, UUID, TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS public.inquiry_rate_count(UUID, UUID, TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS public.inquiry_rate_status(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS public.inquiry_rate_retry_at(UUID, UUID, TEXT, UUID, UUID, UUID, UUID);
DROP FUNCTION IF EXISTS public.inquiry_rate_count(UUID, UUID, TEXT, UUID, UUID, UUID, UUID);
DROP FUNCTION IF EXISTS public.inquiry_rate_status(UUID, UUID, TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS public.inquiry_rate_retry_at(UUID, UUID, TEXT, UUID, UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS public.inquiry_rate_count(UUID, UUID, TEXT, UUID, UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS public.inquiry_rate_status(UUID, UUID, TEXT, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.inquiry_rate_retry_at(
  p_sender UUID,
  p_visitor UUID,
  p_phone TEXT,
  p_post UUID,
  p_listing UUID,
  p_property UUID DEFAULT NULL,
  p_project UUID DEFAULT NULL
)
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT MIN(created_at) + INTERVAL '24 hours'
  FROM (
    SELECT i.created_at
    FROM public.inquiries i
    WHERE i.created_at > NOW() - INTERVAL '24 hours'
      AND (
        (p_post IS NOT NULL AND i.post_id = p_post)
        OR (p_listing IS NOT NULL AND i.listing_id = p_listing)
        OR (p_property IS NOT NULL AND i.property_id = p_property)
        OR (p_project IS NOT NULL AND i.project_id = p_project)
      )
      AND (
        (p_sender IS NOT NULL AND i.sender_id = p_sender)
        OR (p_visitor IS NOT NULL AND i.visitor_id = p_visitor)
        OR (COALESCE(public.normalize_phone(p_phone), '') <> '' AND public.normalize_phone(i.phone) = public.normalize_phone(p_phone))
      )
    ORDER BY i.created_at DESC
    LIMIT 3
  ) recent;
$$;

CREATE OR REPLACE FUNCTION public.inquiry_rate_count(
  p_sender UUID,
  p_visitor UUID,
  p_phone TEXT,
  p_post UUID,
  p_listing UUID,
  p_property UUID DEFAULT NULL,
  p_project UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.inquiries i
  WHERE i.created_at > NOW() - INTERVAL '24 hours'
    AND (
      (p_post IS NOT NULL AND i.post_id = p_post)
      OR (p_listing IS NOT NULL AND i.listing_id = p_listing)
      OR (p_property IS NOT NULL AND i.property_id = p_property)
      OR (p_project IS NOT NULL AND i.project_id = p_project)
    )
    AND (
      (p_sender IS NOT NULL AND i.sender_id = p_sender)
      OR (p_visitor IS NOT NULL AND i.visitor_id = p_visitor)
      OR (COALESCE(public.normalize_phone(p_phone), '') <> '' AND public.normalize_phone(i.phone) = public.normalize_phone(p_phone))
    );
$$;

CREATE OR REPLACE FUNCTION public.inquiry_rate_status(
  p_post_id UUID DEFAULT NULL,
  p_listing_id UUID DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_property_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_visitor UUID;
  v_phone TEXT := NULLIF(btrim(COALESCE(p_phone, '')), '');
  v_count INTEGER;
  v_retry TIMESTAMPTZ;
BEGIN
  IF v_uid IS NOT NULL THEN
    SELECT id INTO v_visitor FROM public.visitors WHERE user_id = v_uid;
    IF v_phone IS NULL THEN
      SELECT NULLIF(btrim(phone), '') INTO v_phone FROM public.visitors WHERE user_id = v_uid;
    END IF;
    IF v_phone IS NULL THEN
      SELECT NULLIF(btrim(phone), '') INTO v_phone FROM public.profiles WHERE id = v_uid;
    END IF;
  END IF;

  v_count := public.inquiry_rate_count(
    v_uid, v_visitor, v_phone, p_post_id, p_listing_id, p_property_id, p_project_id
  );
  IF v_count >= 3 THEN
    v_retry := public.inquiry_rate_retry_at(
      v_uid, v_visitor, v_phone, p_post_id, p_listing_id, p_property_id, p_project_id
    );
    RETURN json_build_object('allowed', false, 'remaining', 0, 'retry_at', v_retry);
  END IF;
  RETURN json_build_object('allowed', true, 'remaining', 3 - v_count, 'retry_at', NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_inquiry_visitor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_retry TIMESTAMPTZ;
BEGIN
  NEW.sender_id := auth.uid();
  NEW.visitor_id := NULL;
  IF auth.uid() IS NOT NULL THEN
    SELECT id INTO NEW.visitor_id FROM public.visitors WHERE user_id = auth.uid();
  END IF;

  v_count := public.inquiry_rate_count(
    NEW.sender_id, NEW.visitor_id, NEW.phone, NEW.post_id, NEW.listing_id, NEW.property_id, NEW.project_id
  );
  IF v_count >= 3 THEN
    v_retry := public.inquiry_rate_retry_at(
      NEW.sender_id, NEW.visitor_id, NEW.phone, NEW.post_id, NEW.listing_id, NEW.property_id, NEW.project_id
    );
    RAISE EXCEPTION 'INQUIRY_RATE_LIMIT:%', COALESCE(v_retry::TEXT, '')
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_inquiry_visitor_trigger ON public.inquiries;
CREATE TRIGGER set_inquiry_visitor_trigger
  BEFORE INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_inquiry_visitor();

REVOKE ALL ON FUNCTION public.inquiry_rate_count(UUID, UUID, TEXT, UUID, UUID, UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.inquiry_rate_retry_at(UUID, UUID, TEXT, UUID, UUID, UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.inquiry_rate_status(UUID, UUID, TEXT, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inquiry_rate_status(UUID, UUID, TEXT, UUID, UUID) TO authenticated, anon;

-- Feed reads this instead of loading every post, then discarding blocked and muted authors in the browser.
CREATE INDEX IF NOT EXISTS posts_feed_order_idx ON public.posts (created_at DESC, id DESC);

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
  SELECT 1
  FROM public.blocked_users b
  WHERE b.blocker_id = auth.uid()
    AND b.blocked_id = p.user_id
)
AND NOT EXISTS (
  SELECT 1
  FROM public.muted_accounts m
  WHERE m.muter_id = auth.uid()
    AND m.muted_id = p.user_id
    AND m.mute_posts
);

COMMENT ON VIEW public.visible_feed_posts IS
  'Posts the current viewer can see. Blocked authors and accounts muted for posts are excluded in SQL.';

GRANT SELECT ON public.visible_feed_posts TO anon, authenticated;

-- One page of the feed. Every 4th slot is the next post from someone the viewer follows.
-- Anonymous viewers, and viewers who follow nobody, get a plain newest-first page.
CREATE OR REPLACE FUNCTION public.feed_page(p_limit integer DEFAULT 8, p_offset integer DEFAULT 0)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  description text,
  before_image_url text,
  after_image_url text,
  single_image_url text,
  images jsonb,
  likes_count integer,
  comments_count integer,
  shares_count integer,
  is_sponsored boolean,
  created_at timestamptz,
  post_type text,
  price text,
  surface text,
  beds integer,
  baths integer,
  city text,
  phone text,
  username text,
  full_name text,
  avatar_url text,
  location text,
  profession text,
  is_verified boolean,
  has_more boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $feed$
  WITH args AS (
    SELECT
      GREATEST(COALESCE(p_limit, 8), 0) AS lim,
      GREATEST(COALESCE(p_offset, 0), 0) AS off,
      auth.uid() AS uid
  ),
  mode AS (
    SELECT
      a.lim,
      a.off,
      a.uid,
      (
        a.uid IS NOT NULL
        AND EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id = a.uid)
        AND EXISTS (
          SELECT 1 FROM public.visible_feed_posts v
          WHERE NOT v.from_following OR COALESCE(v.is_verified, false)
        )
      ) AS mix
    FROM args a
  ),
  counts AS (
    SELECT
      m.lim,
      m.off,
      m.uid,
      m.mix,
      CASE WHEN m.mix THEN m.off / 4 ELSE 0 END AS follow_before,
      CASE WHEN m.mix THEN m.off - (m.off / 4) ELSE m.off END AS general_before,
      CASE
        WHEN m.mix THEN (
          SELECT count(*)::integer
          FROM generate_series(m.off, m.off + m.lim - 1) AS s(slot)
          WHERE s.slot % 4 = 3
        )
        ELSE 0
      END AS follow_count
    FROM mode m
  ),
  sized AS (
    SELECT
      c.*,
      CASE WHEN c.mix THEN c.lim - c.follow_count ELSE c.lim END AS general_count
    FROM counts c
  ),
  -- Verified (badge) authors always ride the public Accueil stream — no follow required.
  -- When mixing with follows, keep verified posts out of the follow slots to avoid duplicates.
  general_slice AS (
    SELECT q.*, row_number() OVER (
      ORDER BY COALESCE(q.is_verified, false) DESC, q.created_at DESC, q.id DESC
    ) - 1 AS local_index
    FROM (
      SELECT v.*
      FROM public.visible_feed_posts v
      CROSS JOIN sized s
      WHERE s.general_count > 0
        AND (
          NOT s.mix
          OR NOT v.from_following
          OR COALESCE(v.is_verified, false)
        )
      ORDER BY COALESCE(v.is_verified, false) DESC, v.created_at DESC, v.id DESC
      OFFSET (SELECT general_before FROM sized)
      LIMIT (SELECT general_count FROM sized)
    ) q
  ),
  follow_slice AS (
    SELECT q.*, row_number() OVER (ORDER BY q.created_at DESC, q.id DESC) - 1 AS local_index
    FROM (
      SELECT v.*
      FROM public.visible_feed_posts v
      CROSS JOIN sized s
      WHERE s.mix
        AND s.follow_count > 0
        AND v.from_following
        AND NOT COALESCE(v.is_verified, false)
      ORDER BY v.created_at DESC, v.id DESC
      OFFSET (SELECT follow_before FROM sized)
      LIMIT (SELECT follow_count FROM sized)
    ) q
  ),
  slots AS (
    SELECT
      s.slot,
      CASE WHEN z.mix AND s.slot % 4 = 3 THEN 'follow' ELSE 'general' END AS kind,
      CASE
        WHEN z.mix AND s.slot % 4 = 3 THEN (s.slot / 4) - z.follow_before
        WHEN z.mix THEN (s.slot - (s.slot / 4)) - z.general_before
        ELSE s.slot - z.off
      END AS local_index
    FROM sized z
    CROSS JOIN LATERAL generate_series(z.off, z.off + z.lim - 1) AS s(slot)
    WHERE z.lim > 0
  ),
  picked AS (
    SELECT sl.slot, sl.kind, g.id, g.user_id, g.description, g.before_image_url, g.after_image_url,
      g.single_image_url, g.images, g.likes_count, g.comments_count, g.shares_count, g.is_sponsored,
      g.created_at, g.post_type, g.price, g.surface, g.beds, g.baths, g.city, g.phone,
      g.username, g.full_name, g.avatar_url, g.location, g.profession, g.is_verified
    FROM slots sl
    JOIN general_slice g ON sl.kind = 'general' AND g.local_index = sl.local_index
    UNION ALL
    SELECT sl.slot, sl.kind, f.id, f.user_id, f.description, f.before_image_url, f.after_image_url,
      f.single_image_url, f.images, f.likes_count, f.comments_count, f.shares_count, f.is_sponsored,
      f.created_at, f.post_type, f.price, f.surface, f.beds, f.baths, f.city, f.phone,
      f.username, f.full_name, f.avatar_url, f.location, f.profession, f.is_verified
    FROM slots sl
    JOIN follow_slice f ON sl.kind = 'follow' AND f.local_index = sl.local_index
  ),
  more AS (
    SELECT
      EXISTS (
        SELECT 1
        FROM public.visible_feed_posts v
        CROSS JOIN sized s
        WHERE NOT s.mix OR NOT v.from_following OR COALESCE(v.is_verified, false)
        ORDER BY COALESCE(v.is_verified, false) DESC, v.created_at DESC, v.id DESC
        OFFSET (
          SELECT s.general_before + (SELECT count(*)::integer FROM picked pk WHERE pk.kind = 'general')
          FROM sized s
        )
        LIMIT 1
      )
      OR EXISTS (
        SELECT 1
        FROM public.visible_feed_posts v
        CROSS JOIN sized s
        WHERE s.mix AND v.from_following AND NOT COALESCE(v.is_verified, false)
        ORDER BY v.created_at DESC, v.id DESC
        OFFSET (
          SELECT s.follow_before + (SELECT count(*)::integer FROM picked pk WHERE pk.kind = 'follow')
          FROM sized s
        )
        LIMIT 1
      ) AS has_more
  )
  SELECT
    pk.id,
    pk.user_id,
    pk.description,
    pk.before_image_url,
    pk.after_image_url,
    pk.single_image_url,
    pk.images,
    pk.likes_count,
    pk.comments_count,
    pk.shares_count,
    pk.is_sponsored,
    pk.created_at,
    pk.post_type,
    pk.price,
    pk.surface,
    pk.beds,
    pk.baths,
    pk.city,
    pk.phone,
    pk.username,
    pk.full_name,
    pk.avatar_url,
    pk.location,
    pk.profession,
    pk.is_verified,
    more.has_more
  FROM picked pk
  CROSS JOIN more
  ORDER BY pk.slot;
$feed$;

COMMENT ON FUNCTION public.feed_page(integer, integer) IS
  'Newest visible posts, paged. Verified-badge authors are boosted on Accueil without requiring a follow. Signed-in viewers who follow people get one non-verified followed post after every three others.';

REVOKE ALL ON FUNCTION public.feed_page(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.feed_page(integer, integer) TO anon, authenticated;

-- Visitors have no profile row. Let them follow with their auth user id.
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE public.follows
  ADD CONSTRAINT follows_follower_id_fkey
  FOREIGN KEY (follower_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Particuliers (anonymous visitors) can own portfolio biens and mute profiles.
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_user_id_fkey;
ALTER TABLE public.properties
  ADD CONSTRAINT properties_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.muted_accounts DROP CONSTRAINT IF EXISTS muted_accounts_muter_id_fkey;
ALTER TABLE public.muted_accounts
  ADD CONSTRAINT muted_accounts_muter_id_fkey
  FOREIGN KEY (muter_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- A particulier who set a password is no longer anonymous, and can still edit their visitor row.
CREATE OR REPLACE FUNCTION public.update_visitor_profile(
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.visitors WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'update_visitor_profile requires a particulier profile';
  END IF;
  IF COALESCE(btrim(p_name), '') = '' OR public.normalize_phone(p_phone) = '' THEN
    RAISE EXCEPTION 'name and phone are required';
  END IF;

  UPDATE public.visitors
  SET name = btrim(p_name),
      phone = btrim(p_phone),
      email = NULLIF(btrim(p_email), ''),
      bio = NULLIF(btrim(p_bio), ''),
      avatar_url = NULLIF(btrim(p_avatar_url), '')
  WHERE user_id = auth.uid();
END;
$$;

-- One private exchange per person per post: their message, then one reply from the business.
CREATE TABLE IF NOT EXISTS public.post_private_threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_name TEXT NOT NULL DEFAULT '',
  sender_phone TEXT,
  message TEXT NOT NULL,
  reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  replied_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT post_private_threads_post_sender_key UNIQUE (post_id, sender_id),
  CONSTRAINT post_private_threads_not_self CHECK (sender_id <> business_id)
);

ALTER TABLE public.post_private_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read a private thread" ON public.post_private_threads;
CREATE POLICY "Participants can read a private thread"
  ON public.post_private_threads FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = business_id);

REVOKE ALL ON public.post_private_threads FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.post_private_threads TO authenticated;

CREATE OR REPLACE FUNCTION public.send_private_thread(p_post_id UUID, p_message TEXT)
RETURNS public.post_private_threads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_business UUID;
  v_name TEXT;
  v_phone TEXT;
  v_row public.post_private_threads;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'send_private_thread requires a session';
  END IF;
  IF char_length(btrim(COALESCE(p_message, ''))) = 0 OR char_length(btrim(p_message)) > 700 THEN
    RAISE EXCEPTION 'message must be between 1 and 700 characters';
  END IF;

  SELECT user_id INTO v_business FROM public.posts WHERE id = p_post_id;
  IF v_business IS NULL OR v_business = v_uid THEN
    RAISE EXCEPTION 'this post cannot receive a private reply';
  END IF;

  SELECT COALESCE(
    (SELECT NULLIF(btrim(name), '') FROM public.visitors WHERE user_id = v_uid),
    (SELECT NULLIF(btrim(full_name), '') FROM public.profiles WHERE id = v_uid),
    'Quelqu''un'
  ) INTO v_name;

  SELECT COALESCE(
    (SELECT NULLIF(btrim(phone), '') FROM public.visitors WHERE user_id = v_uid),
    (SELECT NULLIF(btrim(phone), '') FROM public.profiles WHERE id = v_uid)
  ) INTO v_phone;

  INSERT INTO public.post_private_threads (post_id, business_id, sender_id, sender_name, sender_phone, message)
  VALUES (p_post_id, v_business, v_uid, v_name, v_phone, btrim(p_message))
  RETURNING * INTO v_row;

  RETURN v_row;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'THREAD_EXISTS';
END;
$$;

CREATE OR REPLACE FUNCTION public.reply_private_thread(p_thread_id UUID, p_reply TEXT)
RETURNS public.post_private_threads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.post_private_threads;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'reply_private_thread requires a session';
  END IF;
  IF char_length(btrim(COALESCE(p_reply, ''))) = 0 OR char_length(btrim(p_reply)) > 700 THEN
    RAISE EXCEPTION 'reply must be between 1 and 700 characters';
  END IF;

  UPDATE public.post_private_threads
  SET reply = btrim(p_reply),
      replied_at = NOW()
  WHERE id = p_thread_id
    AND business_id = auth.uid()
    AND reply IS NULL
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'private thread not found or already answered';
  END IF;
  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.send_private_thread(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reply_private_thread(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_private_thread(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reply_private_thread(UUID, TEXT) TO authenticated;

-- ============================================================================
-- Taxonomy
--   categories           : sector categories shown in the feed (Biens & Projets is not one of them)
--   feed_sub_categories  : sub-category buttons shown after a category is picked
--   internal_categories  : detailed internal taxonomy, never shown as such in the feed
--   profiles.internal_category_id : the one internal category of a professional, set in Paramètres
--   profile_category_history      : every category a professional has had
--   posts.category_history_id     : the author's category when the post was published
--   listings.category_history_id  : the same for services
--   property_types / project_types: buttons of the Biens and Projets tabs
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id SMALLINT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  position SMALLINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.feed_sub_categories (
  id SERIAL PRIMARY KEY,
  category_id SMALLINT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  position SMALLINT NOT NULL
);

CREATE INDEX IF NOT EXISTS feed_sub_categories_category_idx
  ON public.feed_sub_categories (category_id, position);

CREATE TABLE IF NOT EXISTS public.internal_categories (
  id SERIAL PRIMARY KEY,
  category_id SMALLINT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  code TEXT UNIQUE NOT NULL,
  sub_category TEXT NOT NULL,
  detailed_sub_category TEXT NOT NULL,
  feed_sub_category_id INTEGER NOT NULL REFERENCES public.feed_sub_categories(id) ON DELETE RESTRICT,
  CONSTRAINT internal_categories_unique_path UNIQUE (category_id, sub_category, detailed_sub_category)
);

CREATE INDEX IF NOT EXISTS internal_categories_feed_sub_category_idx
  ON public.internal_categories (feed_sub_category_id);

CREATE TABLE IF NOT EXISTS public.property_types (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position SMALLINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.project_types (
  slug TEXT PRIMARY KEY,
  group_name TEXT NOT NULL,
  name TEXT NOT NULL,
  position SMALLINT NOT NULL
);

INSERT INTO public.categories (id, slug, name, description, position) VALUES
  (1, 'gestion-services-immobiliers', 'Gestion & services immobiliers',
   'Agences immobilières, agents indépendants, promoteurs immobiliers, gestionnaires de biens, syndics et conciergeries.', 1),
  (3, 'construction-btp', 'Construction & BTP',
   'Entreprises de construction, gros œuvre, génie civil, ingénierie, bureaux d''études techniques et entreprises spécialisées.', 2),
  (4, 'renovation-amenagement', 'Rénovation & Aménagement',
   'Rénovation, artisans, peinture, plomberie, électricité, menuiserie, aménagement intérieur et extérieur, paysagisme et décoration.', 3),
  (5, 'architecture-design', 'Architecture & Design',
   'Architectes, architectes d''intérieur, designers, paysagistes et cabinets de conception.', 4),
  (6, 'juridique-foncier', 'Juridique & Foncier',
   'Notaires, avocats spécialisés, conseil foncier, géomètres-topographes, expertise foncière et conseil en fiscalité immobilière.', 5),
  (7, 'immotech', 'ImmoTech',
   'PropTech, logiciels immobiliers, plateformes numériques, domotique, gestion technique des bâtiments et solutions innovantes.', 6),
  (8, 'autres-services', 'Autres services',
   'Assurances, financement immobilier, courtiers, experts-comptables, fournisseurs et prestataires qui ne rentrent pas dans les autres catégories.', 7)
ON CONFLICT (id) DO UPDATE
SET slug = EXCLUDED.slug, name = EXCLUDED.name, description = EXCLUDED.description, position = EXCLUDED.position;

INSERT INTO public.feed_sub_categories (category_id, slug, name, position) VALUES
  (1, 'agences-agents', 'Agences & agents', 1),
  (1, 'promotion-immobiliere', 'Promotion immobilière', 2),
  (1, 'gestion-immobiliere', 'Gestion immobilière', 3),
  (1, 'conseil-expertise', 'Conseil & expertise', 4),
  (3, 'construction-gros-oeuvre', 'Construction & gros œuvre', 1),
  (3, 'second-oeuvre', 'Second œuvre', 2),
  (3, 'ingenierie-etudes', 'Ingénierie & études', 3),
  (3, 'entreprises-specialisees', 'Entreprises spécialisées', 4),
  (3, 'materiaux-equipements', 'Matériaux & équipements', 5),
  (4, 'renovation', 'Rénovation', 1),
  (4, 'amenagement-interieur', 'Aménagement intérieur', 2),
  (4, 'amenagement-exterieur', 'Aménagement extérieur', 3),
  (4, 'decoration', 'Décoration', 4),
  (4, 'travaux-specialises', 'Travaux spécialisés', 5),
  (5, 'architecture', 'Architecture', 1),
  (5, 'architecture-interieure', 'Architecture intérieure', 2),
  (5, 'design', 'Design', 3),
  (5, 'urbanisme-paysage', 'Urbanisme & paysage', 4),
  (5, 'bim-3d', 'BIM & 3D', 5),
  (6, 'foncier-developpement', 'Foncier & développement', 1),
  (6, 'droit-immobilier-foncier', 'Droit immobilier & foncier', 2),
  (6, 'notariat', 'Notariat', 3),
  (6, 'fiscalite', 'Fiscalité', 4),
  (6, 'expertise-etudes', 'Expertise & études', 5),
  (7, 'proptech', 'PropTech', 1),
  (7, 'logiciels-immobiliers', 'Logiciels immobiliers', 2),
  (7, 'construction-tech', 'Construction Tech', 3),
  (7, 'data-ia', 'Data & IA', 4),
  (7, 'smart-building', 'Smart Building', 5),
  (8, 'finance-assurance', 'Finance & assurance', 1),
  (8, 'conseil-comptabilite', 'Conseil & comptabilité', 2),
  (8, 'marketing-communication', 'Marketing & communication', 3),
  (8, 'fournisseurs', 'Fournisseurs', 4),
  (8, 'services-professionnels', 'Services professionnels', 5)
ON CONFLICT (slug) DO UPDATE
SET category_id = EXCLUDED.category_id, name = EXCLUDED.name, position = EXCLUDED.position;

INSERT INTO public.internal_categories (category_id, code, sub_category, detailed_sub_category, feed_sub_category_id)
SELECT v.category_id, v.code, v.sub_category, v.detailed_sub_category, f.id
FROM (VALUES
  (1, '1.1.1', 'Transaction & commercialisation', 'Agence immobilière', 'agences-agents'),
  (1, '1.1.2', 'Transaction & commercialisation', 'Agent immobilier indépendant', 'agences-agents'),
  (1, '1.1.3', 'Transaction & commercialisation', 'Courtage immobilier', 'agences-agents'),
  (1, '1.1.4', 'Transaction & commercialisation', 'Commercialisation immobilière', 'agences-agents'),
  (1, '1.1.5', 'Transaction & commercialisation', 'Location', 'agences-agents'),
  (1, '1.1.6', 'Transaction & commercialisation', 'Location longue durée', 'agences-agents'),
  (1, '1.1.7', 'Transaction & commercialisation', 'Location courte durée', 'agences-agents'),
  (1, '1.2.1', 'Promotion & développement immobilier', 'Promoteur immobilier', 'promotion-immobiliere'),
  (1, '1.2.2', 'Promotion & développement immobilier', 'Développeur immobilier', 'promotion-immobiliere'),
  (1, '1.2.3', 'Promotion & développement immobilier', 'Marchand de biens', 'promotion-immobiliere'),
  (1, '1.2.4', 'Promotion & développement immobilier', 'Opérateur immobilier', 'promotion-immobiliere'),
  (1, '1.3.1', 'Gestion', 'Gestion immobilière', 'gestion-immobiliere'),
  (1, '1.3.2', 'Gestion', 'Gestion locative', 'gestion-immobiliere'),
  (1, '1.3.3', 'Gestion', 'Property management', 'gestion-immobiliere'),
  (1, '1.3.4', 'Gestion', 'Asset management', 'gestion-immobiliere'),
  (1, '1.3.5', 'Gestion', 'Facility management', 'gestion-immobiliere'),
  (1, '1.3.6', 'Gestion', 'Syndic', 'gestion-immobiliere'),
  (1, '1.3.7', 'Gestion', 'Conciergerie', 'gestion-immobiliere'),
  (1, '1.4.1', 'Conseil & expertise', 'Conseil immobilier', 'conseil-expertise'),
  (1, '1.4.2', 'Conseil & expertise', 'Expertise immobilière', 'conseil-expertise'),
  (1, '1.4.3', 'Conseil & expertise', 'Évaluation immobilière', 'conseil-expertise'),
  (1, '1.4.4', 'Conseil & expertise', 'Conseil en investissement immobilier', 'conseil-expertise'),
  (1, '1.4.5', 'Conseil & expertise', 'Conseil en commercialisation', 'conseil-expertise'),

  (3, '3.1.1', 'Construction & gros œuvre', 'Fondations', 'construction-gros-oeuvre'),
  (3, '3.1.2', 'Construction & gros œuvre', 'Terrassement bâtiment', 'construction-gros-oeuvre'),
  (3, '3.1.3', 'Construction & gros œuvre', 'Structure', 'construction-gros-oeuvre'),
  (3, '3.1.4', 'Construction & gros œuvre', 'Béton', 'construction-gros-oeuvre'),
  (3, '3.1.5', 'Construction & gros œuvre', 'Maçonnerie', 'construction-gros-oeuvre'),
  (3, '3.1.6', 'Construction & gros œuvre', 'Charpente', 'construction-gros-oeuvre'),
  (3, '3.2.1', 'Second œuvre technique', 'Électricité', 'second-oeuvre'),
  (3, '3.2.2', 'Second œuvre technique', 'Plomberie', 'second-oeuvre'),
  (3, '3.2.3', 'Second œuvre technique', 'Climatisation', 'second-oeuvre'),
  (3, '3.2.4', 'Second œuvre technique', 'Ventilation', 'second-oeuvre'),
  (3, '3.2.5', 'Second œuvre technique', 'Chauffage', 'second-oeuvre'),
  (3, '3.2.6', 'Second œuvre technique', 'Étanchéité', 'second-oeuvre'),
  (3, '3.2.7', 'Second œuvre technique', 'Isolation', 'second-oeuvre'),
  (3, '3.2.8', 'Second œuvre technique', 'Sécurité incendie', 'second-oeuvre'),
  (3, '3.2.9', 'Second œuvre technique', 'Ascenseurs', 'second-oeuvre'),
  (3, '3.3.1', 'Finition', 'Revêtements', 'entreprises-specialisees'),
  (3, '3.3.2', 'Finition', 'Peinture', 'entreprises-specialisees'),
  (3, '3.3.3', 'Finition', 'Façades', 'entreprises-specialisees'),
  (3, '3.3.4', 'Finition', 'Menuiserie', 'entreprises-specialisees'),
  (3, '3.3.5', 'Finition', 'Métallerie', 'entreprises-specialisees'),
  (3, '3.3.6', 'Finition', 'Serrurerie', 'entreprises-specialisees'),
  (3, '3.4.1', 'Ingénierie & études', 'Génie civil / structure', 'ingenierie-etudes'),
  (3, '3.4.2', 'Ingénierie & études', 'Bureau d’études', 'ingenierie-etudes'),
  (3, '3.4.3', 'Ingénierie & études', 'Études techniques', 'ingenierie-etudes'),
  (3, '3.4.4', 'Ingénierie & études', 'Contrôle technique', 'ingenierie-etudes'),
  (3, '3.4.5', 'Ingénierie & études', 'Économie de la construction', 'ingenierie-etudes'),
  (3, '3.4.6', 'Ingénierie & études', 'Coordination de chantier', 'ingenierie-etudes'),
  (3, '3.4.7', 'Ingénierie & études', 'Géomètre-topographe', 'ingenierie-etudes'),
  (3, '3.4.8', 'Ingénierie & études', 'Topographie', 'ingenierie-etudes'),
  (3, '3.4.9', 'Ingénierie & études', 'Études de terrain', 'ingenierie-etudes'),
  (3, '3.5.1', 'Matériaux & équipements', 'Matériaux de construction', 'materiaux-equipements'),
  (3, '3.5.2', 'Matériaux & équipements', 'Équipements de chantier', 'materiaux-equipements'),
  (3, '3.5.3', 'Matériaux & équipements', 'Équipements techniques', 'materiaux-equipements'),
  (3, '3.5.4', 'Matériaux & équipements', 'Fournisseurs spécialisés', 'materiaux-equipements'),

  (4, '4.1.1', 'Rénovation', 'Rénovation complète', 'renovation'),
  (4, '4.1.2', 'Rénovation', 'Rénovation intérieure', 'renovation'),
  (4, '4.1.3', 'Rénovation', 'Rénovation extérieure', 'renovation'),
  (4, '4.1.4', 'Rénovation', 'Rénovation de façade', 'renovation'),
  (4, '4.1.5', 'Rénovation', 'Réhabilitation', 'renovation'),
  (4, '4.1.6', 'Rénovation', 'Restauration', 'renovation'),
  (4, '4.1.7', 'Rénovation', 'Rénovation énergétique', 'renovation'),
  (4, '4.2.1', 'Aménagement intérieur', 'Aménagement intérieur', 'amenagement-interieur'),
  (4, '4.2.2', 'Aménagement intérieur', 'Décoration', 'decoration'),
  (4, '4.2.3', 'Aménagement intérieur', 'Cuisine', 'amenagement-interieur'),
  (4, '4.2.4', 'Aménagement intérieur', 'Salle de bain', 'amenagement-interieur'),
  (4, '4.2.5', 'Aménagement intérieur', 'Mobilier', 'decoration'),
  (4, '4.2.6', 'Aménagement intérieur', 'Dressing', 'amenagement-interieur'),
  (4, '4.2.7', 'Aménagement intérieur', 'Éclairage', 'decoration'),
  (4, '4.3.1', 'Aménagement extérieur', 'Jardin', 'amenagement-exterieur'),
  (4, '4.3.2', 'Aménagement extérieur', 'Paysagisme', 'amenagement-exterieur'),
  (4, '4.3.3', 'Aménagement extérieur', 'Terrasse', 'amenagement-exterieur'),
  (4, '4.3.4', 'Aménagement extérieur', 'Piscine', 'amenagement-exterieur'),
  (4, '4.3.5', 'Aménagement extérieur', 'Aménagement extérieur', 'amenagement-exterieur'),
  (4, '4.4.1', 'Travaux spécialisés', 'Peinture', 'travaux-specialises'),
  (4, '4.4.2', 'Travaux spécialisés', 'Revêtement', 'travaux-specialises'),
  (4, '4.4.3', 'Travaux spécialisés', 'Menuiserie', 'travaux-specialises'),
  (4, '4.4.4', 'Travaux spécialisés', 'Plomberie', 'travaux-specialises'),
  (4, '4.4.5', 'Travaux spécialisés', 'Électricité', 'travaux-specialises'),
  (4, '4.4.6', 'Travaux spécialisés', 'Isolation', 'travaux-specialises'),

  (5, '5.1.1', 'Architecture', 'Architecture', 'architecture'),
  (5, '5.1.2', 'Architecture', 'Architecture résidentielle', 'architecture'),
  (5, '5.1.3', 'Architecture', 'Architecture commerciale', 'architecture'),
  (5, '5.1.4', 'Architecture', 'Architecture industrielle', 'architecture'),
  (5, '5.1.5', 'Architecture', 'Architecture touristique', 'architecture'),
  (5, '5.1.6', 'Architecture', 'Architecture patrimoniale', 'architecture'),
  (5, '5.2.1', 'Architecture intérieure', 'Architecture intérieure', 'architecture-interieure'),
  (5, '5.2.2', 'Architecture intérieure', 'Design intérieur', 'design'),
  (5, '5.2.3', 'Architecture intérieure', 'Décoration', 'design'),
  (5, '5.3.1', 'Urbanisme & paysage', 'Urbanisme', 'urbanisme-paysage'),
  (5, '5.3.2', 'Urbanisme & paysage', 'Aménagement urbain', 'urbanisme-paysage'),
  (5, '5.3.3', 'Urbanisme & paysage', 'Paysagisme', 'urbanisme-paysage'),
  (5, '5.4.1', 'Conception numérique', 'BIM', 'bim-3d'),
  (5, '5.4.2', 'Conception numérique', 'Modélisation 3D', 'bim-3d'),
  (5, '5.4.3', 'Conception numérique', 'Visualisation architecturale', 'bim-3d'),
  (5, '5.4.4', 'Conception numérique', 'Rendu 3D', 'bim-3d'),
  (5, '5.4.5', 'Conception numérique', 'Réalité virtuelle', 'bim-3d'),
  (5, '5.5.1', 'Études & maîtrise d’œuvre', 'Conception', 'architecture'),
  (5, '5.5.2', 'Études & maîtrise d’œuvre', 'Plans', 'architecture'),
  (5, '5.5.3', 'Études & maîtrise d’œuvre', 'Maîtrise d’œuvre', 'architecture'),
  (5, '5.5.4', 'Études & maîtrise d’œuvre', 'Assistance à maîtrise d’ouvrage', 'architecture'),
  (5, '5.5.5', 'Études & maîtrise d’œuvre', 'Coordination', 'architecture'),

  (6, '6.1.1', 'Foncier & développement', 'Stratégie foncière', 'foncier-developpement'),
  (6, '6.1.2', 'Foncier & développement', 'Développement foncier', 'foncier-developpement'),
  (6, '6.1.3', 'Foncier & développement', 'Acquisition foncière', 'foncier-developpement'),
  (6, '6.1.4', 'Foncier & développement', 'Valorisation foncière', 'foncier-developpement'),
  (6, '6.1.5', 'Foncier & développement', 'Gestion foncière', 'foncier-developpement'),
  (6, '6.1.6', 'Foncier & développement', 'Conseil foncier', 'foncier-developpement'),
  (6, '6.1.7', 'Foncier & développement', 'Aménagement foncier', 'foncier-developpement'),
  (6, '6.1.8', 'Foncier & développement', 'Lotissement', 'foncier-developpement'),
  (6, '6.2.1', 'Expertise & études foncières', 'Expertise foncière', 'expertise-etudes'),
  (6, '6.2.2', 'Expertise & études foncières', 'Études foncières', 'expertise-etudes'),
  (6, '6.2.5', 'Expertise & études foncières', 'Cadastre', 'expertise-etudes'),
  (6, '6.3.1', 'Droit', 'Droit immobilier', 'droit-immobilier-foncier'),
  (6, '6.3.2', 'Droit', 'Droit foncier', 'droit-immobilier-foncier'),
  (6, '6.3.3', 'Droit', 'Titres fonciers', 'droit-immobilier-foncier'),
  (6, '6.3.4', 'Droit', 'Copropriété', 'droit-immobilier-foncier'),
  (6, '6.3.5', 'Droit', 'Baux', 'droit-immobilier-foncier'),
  (6, '6.3.6', 'Droit', 'Urbanisme & construction', 'droit-immobilier-foncier'),
  (6, '6.3.7', 'Droit', 'Servitudes', 'droit-immobilier-foncier'),
  (6, '6.3.8', 'Droit', 'Indivision', 'droit-immobilier-foncier'),
  (6, '6.3.9', 'Droit', 'Succession immobilière', 'droit-immobilier-foncier'),
  (6, '6.3.10', 'Droit', 'Contentieux immobilier', 'droit-immobilier-foncier'),
  (6, '6.4.1', 'Professions juridiques', 'Notaire', 'notariat'),
  (6, '6.4.2', 'Professions juridiques', 'Avocat', 'droit-immobilier-foncier'),
  (6, '6.4.3', 'Professions juridiques', 'Conseil juridique', 'droit-immobilier-foncier'),
  (6, '6.4.4', 'Professions juridiques', 'Adoul', 'notariat'),
  (6, '6.4.5', 'Professions juridiques', 'Médiation / arbitrage', 'droit-immobilier-foncier'),
  (6, '6.5.1', 'Fiscalité', 'Fiscalité immobilière', 'fiscalite'),
  (6, '6.5.2', 'Fiscalité', 'Fiscalité foncière', 'fiscalite'),
  (6, '6.5.3', 'Fiscalité', 'Fiscalité locative', 'fiscalite'),
  (6, '6.5.4', 'Fiscalité', 'Fiscalité des transactions', 'fiscalite'),
  (6, '6.5.5', 'Fiscalité', 'Conseil fiscal', 'fiscalite'),

  (7, '7.1.1', 'Logiciels immobiliers', 'CRM immobilier', 'logiciels-immobiliers'),
  (7, '7.1.2', 'Logiciels immobiliers', 'Gestion immobilière', 'logiciels-immobiliers'),
  (7, '7.1.3', 'Logiciels immobiliers', 'Gestion locative', 'logiciels-immobiliers'),
  (7, '7.1.4', 'Logiciels immobiliers', 'Gestion de copropriété', 'logiciels-immobiliers'),
  (7, '7.1.5', 'Logiciels immobiliers', 'Gestion de projets', 'logiciels-immobiliers'),
  (7, '7.1.6', 'Logiciels immobiliers', 'Gestion commerciale', 'logiciels-immobiliers'),
  (7, '7.2.1', 'Transaction & commercialisation', 'Marketplace', 'proptech'),
  (7, '7.2.2', 'Transaction & commercialisation', 'Listing immobilier', 'proptech'),
  (7, '7.2.3', 'Transaction & commercialisation', 'Transaction digitale', 'proptech'),
  (7, '7.2.4', 'Transaction & commercialisation', 'Signature électronique', 'proptech'),
  (7, '7.2.5', 'Transaction & commercialisation', 'Visite virtuelle', 'proptech'),
  (7, '7.2.6', 'Transaction & commercialisation', '3D / VR / AR', 'proptech'),
  (7, '7.3.1', 'Construction Tech', 'Construction management', 'construction-tech'),
  (7, '7.3.2', 'Construction Tech', 'BIM', 'construction-tech'),
  (7, '7.3.3', 'Construction Tech', 'Gestion de chantier', 'construction-tech'),
  (7, '7.3.4', 'Construction Tech', 'Planification', 'construction-tech'),
  (7, '7.3.5', 'Construction Tech', 'Suivi de chantier', 'construction-tech'),
  (7, '7.3.6', 'Construction Tech', 'Reality capture', 'construction-tech'),
  (7, '7.4.1', 'Data & IA', 'Data immobilière', 'data-ia'),
  (7, '7.4.2', 'Data & IA', 'Analytics', 'data-ia'),
  (7, '7.4.3', 'Data & IA', 'Intelligence artificielle', 'data-ia'),
  (7, '7.4.4', 'Data & IA', 'Valuation', 'data-ia'),
  (7, '7.4.5', 'Data & IA', 'Market intelligence', 'data-ia'),
  (7, '7.5.1', 'Smart Building', 'IoT', 'smart-building'),
  (7, '7.5.2', 'Smart Building', 'Domotique', 'smart-building'),
  (7, '7.5.3', 'Smart Building', 'BMS', 'smart-building'),
  (7, '7.5.4', 'Smart Building', 'Gestion énergétique', 'smart-building'),
  (7, '7.5.5', 'Smart Building', 'Sécurité intelligente', 'smart-building'),
  (7, '7.5.6', 'Smart Building', 'Maintenance intelligente', 'smart-building'),
  (7, '7.6.1', 'Finance & transactions', 'FinTech immobilière', 'proptech'),
  (7, '7.6.2', 'Finance & transactions', 'Paiement', 'proptech'),
  (7, '7.6.3', 'Finance & transactions', 'Financement', 'proptech'),
  (7, '7.6.4', 'Finance & transactions', 'Investissement immobilier', 'proptech'),

  (8, '8.1.1', 'Finance', 'Banque', 'finance-assurance'),
  (8, '8.1.2', 'Finance', 'Crédit immobilier', 'finance-assurance'),
  (8, '8.1.3', 'Finance', 'Financement', 'finance-assurance'),
  (8, '8.1.4', 'Finance', 'Courtage financier', 'finance-assurance'),
  (8, '8.1.5', 'Finance', 'Investissement', 'finance-assurance'),
  (8, '8.2.1', 'Assurance', 'Assurance immobilière', 'finance-assurance'),
  (8, '8.2.2', 'Assurance', 'Assurance construction', 'finance-assurance'),
  (8, '8.2.3', 'Assurance', 'Assurance professionnelle', 'finance-assurance'),
  (8, '8.3.1', 'Conseil', 'Comptabilité', 'conseil-comptabilite'),
  (8, '8.3.2', 'Conseil', 'Expertise comptable', 'conseil-comptabilite'),
  (8, '8.3.3', 'Conseil', 'Conseil aux entreprises', 'conseil-comptabilite'),
  (8, '8.3.4', 'Conseil', 'Ressources humaines', 'conseil-comptabilite'),
  (8, '8.3.5', 'Conseil', 'Recrutement', 'conseil-comptabilite'),
  (8, '8.3.6', 'Conseil', 'Formation', 'conseil-comptabilite'),
  (8, '8.4.1', 'Marketing & communication', 'Marketing immobilier', 'marketing-communication'),
  (8, '8.4.2', 'Marketing & communication', 'Communication', 'marketing-communication'),
  (8, '8.4.3', 'Marketing & communication', 'Photographie', 'marketing-communication'),
  (8, '8.4.4', 'Marketing & communication', 'Vidéo', 'marketing-communication'),
  (8, '8.4.5', 'Marketing & communication', 'Médias', 'marketing-communication'),
  (8, '8.5.1', 'Fournisseurs', 'Fournitures professionnelles', 'fournisseurs'),
  (8, '8.5.2', 'Fournisseurs', 'Mobilier', 'fournisseurs'),
  (8, '8.5.3', 'Fournisseurs', 'Équipements', 'fournisseurs'),
  (8, '8.5.4', 'Fournisseurs', 'Matériaux', 'fournisseurs'),
  (8, '8.5.5', 'Fournisseurs', 'Produits spécialisés', 'fournisseurs'),
  (8, '8.6.1', 'Services opérationnels', 'Nettoyage', 'services-professionnels'),
  (8, '8.6.2', 'Services opérationnels', 'Maintenance', 'services-professionnels'),
  (8, '8.6.3', 'Services opérationnels', 'Sécurité', 'services-professionnels'),
  (8, '8.6.4', 'Services opérationnels', 'Déménagement', 'services-professionnels'),
  (8, '8.6.5', 'Services opérationnels', 'Transport', 'services-professionnels'),
  (8, '8.6.6', 'Services opérationnels', 'Énergie', 'services-professionnels')
) AS v(category_id, code, sub_category, detailed_sub_category, feed_slug)
JOIN public.feed_sub_categories f ON f.slug = v.feed_slug
ON CONFLICT (code) DO UPDATE
SET category_id = EXCLUDED.category_id,
    sub_category = EXCLUDED.sub_category,
    detailed_sub_category = EXCLUDED.detailed_sub_category,
    feed_sub_category_id = EXCLUDED.feed_sub_category_id;

INSERT INTO public.property_types (slug, name, position) VALUES
  ('appartement', 'Appartement', 1),
  ('maison_villa', 'Maison / Villa', 2),
  ('riad', 'Riad', 3),
  ('terrain', 'Terrain', 4),
  ('local_commercial', 'Local commercial', 5),
  ('bureau', 'Bureau', 6),
  ('entrepot', 'Entrepôt', 7),
  ('immeuble', 'Immeuble', 8),
  ('residence', 'Résidence', 9),
  ('hotel', 'Hôtel', 10),
  ('bien_industriel', 'Bien industriel', 11),
  ('bien_agricole', 'Bien agricole', 12)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, position = EXCLUDED.position;

INSERT INTO public.project_types (slug, group_name, name, position) VALUES
  ('projet_residentiel', 'Projets immobiliers', 'Projet résidentiel', 1),
  ('lotissement', 'Projets immobiliers', 'Lotissement', 2),
  ('residence', 'Projets immobiliers', 'Résidence', 3),
  ('complexe_immobilier', 'Projets immobiliers', 'Complexe immobilier', 4),
  ('projet_commercial', 'Projets immobiliers', 'Projet commercial', 5),
  ('projet_hotelier', 'Projets immobiliers', 'Projet hôtelier', 6),
  ('projet_industriel', 'Projets immobiliers', 'Projet industriel', 7),
  ('projet_mixte', 'Projets immobiliers', 'Projet mixte', 8),
  ('usine', 'Projets non-résidentiels', 'Usine', 9),
  ('centre_commercial', 'Projets non-résidentiels', 'Centre commercial', 10),
  ('bureau', 'Projets non-résidentiels', 'Bureau', 11),
  ('hotel', 'Projets non-résidentiels', 'Hôtel', 12),
  ('equipement_prive', 'Projets non-résidentiels', 'Équipement privé', 13),
  ('equipement_collectif', 'Projets non-résidentiels', 'Équipement collectif', 14),
  ('infrastructure_projet', 'Projets non-résidentiels', 'Infrastructure liée à un projet immobilier', 15)
ON CONFLICT (slug) DO UPDATE
SET group_name = EXCLUDED.group_name, name = EXCLUDED.name, position = EXCLUDED.position;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Feed sub-categories are viewable by everyone" ON public.feed_sub_categories;
CREATE POLICY "Feed sub-categories are viewable by everyone" ON public.feed_sub_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Internal categories are viewable by everyone" ON public.internal_categories;
CREATE POLICY "Internal categories are viewable by everyone" ON public.internal_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Property types are viewable by everyone" ON public.property_types;
CREATE POLICY "Property types are viewable by everyone" ON public.property_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Project types are viewable by everyone" ON public.project_types;
CREATE POLICY "Project types are viewable by everyone" ON public.project_types FOR SELECT USING (true);

REVOKE ALL ON public.categories, public.feed_sub_categories, public.internal_categories,
  public.property_types, public.project_types FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.categories, public.feed_sub_categories, public.internal_categories,
  public.property_types, public.project_types TO anon, authenticated;

-- A professional has exactly one internal category, edited in Paramètres.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS internal_category_id INTEGER
    REFERENCES public.internal_categories(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS profiles_internal_category_idx
  ON public.profiles (internal_category_id);

CREATE TABLE IF NOT EXISTS public.profile_category_history (
  id SERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  internal_category_id INTEGER NOT NULL REFERENCES public.internal_categories(id) ON DELETE RESTRICT,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX IF NOT EXISTS profile_category_history_current_idx
  ON public.profile_category_history (profile_id) WHERE valid_to IS NULL;

ALTER TABLE public.profile_category_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Category history is viewable by everyone" ON public.profile_category_history;
CREATE POLICY "Category history is viewable by everyone"
  ON public.profile_category_history FOR SELECT USING (true);

REVOKE ALL ON public.profile_category_history FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profile_category_history TO anon, authenticated;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category_history_id INTEGER
    REFERENCES public.profile_category_history(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS posts_category_history_idx
  ON public.posts (category_history_id);

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS category_history_id INTEGER
    REFERENCES public.profile_category_history(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS services_category_history_idx
  ON public.services (category_history_id);

-- Closes the current history row and opens a new one when the category changes.
-- The author's posts and services that had no category yet are attached to the first one.
CREATE OR REPLACE FUNCTION public.track_profile_category_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_history_id INTEGER;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.internal_category_id IS NOT DISTINCT FROM OLD.internal_category_id THEN
    RETURN NEW;
  END IF;

  UPDATE public.profile_category_history
  SET valid_to = NOW()
  WHERE profile_id = NEW.id AND valid_to IS NULL;

  IF NEW.internal_category_id IS NOT NULL THEN
    INSERT INTO public.profile_category_history (profile_id, internal_category_id)
    VALUES (NEW.id, NEW.internal_category_id)
    RETURNING id INTO v_history_id;

    UPDATE public.posts
    SET category_history_id = v_history_id
    WHERE user_id = NEW.id AND category_history_id IS NULL;

    UPDATE public.services
    SET category_history_id = v_history_id
    WHERE user_id = NEW.id AND category_history_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_profile_category_change ON public.profiles;
CREATE TRIGGER trg_track_profile_category_change
  AFTER INSERT OR UPDATE OF internal_category_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.track_profile_category_change();

-- A new post or service takes the author's current category. Afterwards it can only be
-- filled in once (old rows), with a history row that belongs to the author.
CREATE OR REPLACE FUNCTION public.attach_post_category_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT h.id INTO NEW.category_history_id
    FROM public.profile_category_history h
    WHERE h.profile_id = NEW.user_id AND h.valid_to IS NULL;
    RETURN NEW;
  END IF;

  IF OLD.category_history_id IS NOT NULL
     OR NOT EXISTS (
       SELECT 1 FROM public.profile_category_history h
       WHERE h.id = NEW.category_history_id AND h.profile_id = NEW.user_id
     ) THEN
    NEW.category_history_id := OLD.category_history_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_posts_10_attach_category_history ON public.posts;
CREATE TRIGGER trg_posts_10_attach_category_history
  BEFORE INSERT OR UPDATE OF category_history_id ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.attach_post_category_history();

DROP TRIGGER IF EXISTS trg_services_10_attach_category_history ON public.services;
CREATE TRIGGER trg_services_10_attach_category_history
  BEFORE INSERT OR UPDATE OF category_history_id ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.attach_post_category_history();

-- Only Gestion & services immobiliers professionals publish biens on the feed.
CREATE OR REPLACE FUNCTION public.check_post_property_author()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.post_type <> 'property' THEN
    RETURN NEW;
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.profile_category_history h
    JOIN public.internal_categories ic ON ic.id = h.internal_category_id
    WHERE h.id = NEW.category_history_id AND ic.category_id = 1
  ) THEN
    RAISE EXCEPTION 'PROPERTY_AUTHOR_NOT_ALLOWED'
      USING DETAIL = 'Seuls les professionnels de Gestion & services immobiliers publient des biens.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_posts_20_check_property_author ON public.posts;
CREATE TRIGGER trg_posts_20_check_property_author
  BEFORE INSERT OR UPDATE OF post_type ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.check_post_property_author();

-- Feed posts (post_type = standard) are reserved for verified badge profiles.
CREATE OR REPLACE FUNCTION public.check_post_standard_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.post_type, 'standard') <> 'standard' THEN
    RETURN NEW;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles pr
    WHERE pr.id = NEW.user_id AND pr.is_verified IS TRUE
  ) THEN
    RAISE EXCEPTION 'POST_AUTHOR_NOT_VERIFIED'
      USING DETAIL = 'Seuls les profils vérifiés (badge) peuvent publier des posts sur le fil.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_posts_15_check_standard_verified ON public.posts;
CREATE TRIGGER trg_posts_15_check_standard_verified
  BEFORE INSERT OR UPDATE OF post_type, user_id ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.check_post_standard_verified();

-- Same rule for the portfolio. Particuliers have no profile row and keep their 3 biens.
CREATE OR REPLACE FUNCTION public.check_property_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles pr WHERE pr.id = NEW.user_id)
     AND NOT EXISTS (
       SELECT 1
       FROM public.profiles pr
       JOIN public.internal_categories ic ON ic.id = pr.internal_category_id
       WHERE pr.id = NEW.user_id AND ic.category_id = 1
     ) THEN
    RAISE EXCEPTION 'PROPERTY_AUTHOR_NOT_ALLOWED'
      USING DETAIL = 'Seuls les professionnels de Gestion & services immobiliers publient des biens.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_property_owner ON public.properties;
CREATE TRIGGER trg_check_property_owner
  BEFORE INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.check_property_owner();

-- Biens / Projets tab buttons. Typed columns are derived from source fields.
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS property_type TEXT
    REFERENCES public.property_types(slug) ON UPDATE CASCADE ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_project_type_fkey'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_project_type_fkey
      FOREIGN KEY (project_type) REFERENCES public.project_types(slug)
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS properties_property_type_idx ON public.properties (property_type);

CREATE OR REPLACE FUNCTION public.property_type_from_kind(p_kind TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT pt.slug
  FROM public.property_types pt
  WHERE pt.slug = CASE btrim(COALESCE(p_kind, ''))
    WHEN 'maison' THEN 'maison_villa'
    WHEN 'villa' THEN 'maison_villa'
    WHEN 'ferme' THEN 'bien_agricole'
    ELSE btrim(COALESCE(p_kind, ''))
  END;
$$;

CREATE OR REPLACE FUNCTION public.set_property_type()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.property_type := public.property_type_from_kind(NEW.details->>'propertyKind');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_property_type ON public.properties;
CREATE TRIGGER trg_set_property_type
  BEFORE INSERT OR UPDATE OF details ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_property_type();

CREATE OR REPLACE FUNCTION public.set_project_type()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_slug TEXT;
BEGIN
  v_slug := NULLIF(btrim(COALESCE(NEW.project_type, '')), '');
  SELECT pt.slug INTO NEW.project_type
  FROM public.project_types pt
  WHERE pt.slug = v_slug;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_project_type ON public.projects;
CREATE TRIGGER trg_set_project_type
  BEFORE INSERT OR UPDATE OF project_type ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_project_type();

UPDATE public.properties
SET property_type = public.property_type_from_kind(details->>'propertyKind')
WHERE property_type IS NULL;

-- Enterprises may hold several concurrent internal categories.
-- profiles.internal_category_id remains the primary (post/service history).
CREATE TABLE IF NOT EXISTS public.profile_internal_categories (
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  internal_category_id INTEGER NOT NULL REFERENCES public.internal_categories(id) ON DELETE RESTRICT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, internal_category_id)
);

CREATE INDEX IF NOT EXISTS profile_internal_categories_category_idx
  ON public.profile_internal_categories (internal_category_id);

CREATE UNIQUE INDEX IF NOT EXISTS profile_internal_categories_one_primary_idx
  ON public.profile_internal_categories (profile_id)
  WHERE is_primary;

-- Specialty chosen on create (one of the author's Paramètres internal categories).
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS internal_category_id INTEGER
    REFERENCES public.internal_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS services_internal_category_idx
  ON public.services (internal_category_id);

-- Réalisations: dedicated portfolio works (title, description, images) — not posts.
CREATE TABLE IF NOT EXISTS public.realisations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover TEXT,
  city TEXT,
  internal_category_id INTEGER REFERENCES public.internal_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT realisations_title_not_blank CHECK (length(btrim(title)) > 0),
  CONSTRAINT realisations_images_is_array CHECK (jsonb_typeof(images) = 'array')
);

CREATE INDEX IF NOT EXISTS realisations_user_created_idx
  ON public.realisations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS realisations_internal_category_idx
  ON public.realisations (internal_category_id);
CREATE INDEX IF NOT EXISTS realisations_city_idx
  ON public.realisations (city);

ALTER TABLE public.realisations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Realisations are viewable by everyone" ON public.realisations;
CREATE POLICY "Realisations are viewable by everyone"
  ON public.realisations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own realisations" ON public.realisations;
CREATE POLICY "Users can create their own realisations"
  ON public.realisations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own realisations" ON public.realisations;
CREATE POLICY "Users can update their own realisations"
  ON public.realisations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own realisations" ON public.realisations;
CREATE POLICY "Users can delete their own realisations"
  ON public.realisations FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_realisations_updated_at ON public.realisations;
CREATE TRIGGER update_realisations_updated_at
  BEFORE UPDATE ON public.realisations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

GRANT SELECT ON public.realisations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.realisations TO authenticated;

-- Devis requests (lechantier-style quote wizard)
CREATE TABLE IF NOT EXISTS public.devis_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_name TEXT,
  service_id UUID,
  product_id UUID,
  project_type_id TEXT NOT NULL,
  project_type_label TEXT NOT NULL,
  city TEXT NOT NULL,
  budget TEXT,
  description TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  whatsapp BOOLEAN NOT NULL DEFAULT TRUE,
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT devis_requests_source_check CHECK (source IN ('open', 'profile', 'service', 'product'))
);

CREATE INDEX IF NOT EXISTS devis_requests_created_idx ON public.devis_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS devis_requests_seller_idx ON public.devis_requests (seller_id, created_at DESC);

ALTER TABLE public.devis_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create a devis request" ON public.devis_requests;
CREATE POLICY "Anyone can create a devis request"
  ON public.devis_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sellers can view devis aimed at them" ON public.devis_requests;
CREATE POLICY "Sellers can view devis aimed at them"
  ON public.devis_requests FOR SELECT
  USING (auth.uid() = seller_id OR auth.uid() = requester_id);

CREATE OR REPLACE FUNCTION public.set_devis_requester()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.requester_id IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.requester_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_devis_requester_trigger ON public.devis_requests;
CREATE TRIGGER set_devis_requester_trigger
  BEFORE INSERT ON public.devis_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_devis_requester();

GRANT SELECT, INSERT ON public.devis_requests TO anon, authenticated;

-- Partner visibility demand (guests asking to publish on the feed)
CREATE TABLE IF NOT EXISTS public.partner_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  enterprise_name TEXT NOT NULL,
  professional_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS partner_requests_created_idx ON public.partner_requests (created_at DESC);

ALTER TABLE public.partner_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create a partner request" ON public.partner_requests;
CREATE POLICY "Anyone can create a partner request"
  ON public.partner_requests FOR INSERT
  WITH CHECK (true);

GRANT INSERT ON public.partner_requests TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

