-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  profession TEXT,
  location TEXT,
  bio TEXT CHECK (char_length(bio) <= 165),
  about_text TEXT,
  avatar_url TEXT,
  cover_photo_url TEXT,
  profile_type TEXT CHECK (profile_type IN ('craftsman', 'hunter')),
  phone TEXT,
  email TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about_text TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_updated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.profiles.is_verified IS
  'True when this profile has passed Sifarah verification. Default false until a moderator sets it.';
COMMENT ON COLUMN public.profiles.verified_at IS
  'UTC time when is_verified became true. Cleared if verification is revoked.';
COMMENT ON COLUMN public.profiles.contact_updated_at IS
  'UTC time when phone, email, or website_url last changed.';
COMMENT ON COLUMN public.profiles.avatar_updated_at IS
  'UTC time when avatar_url last changed.';

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
  title TEXT NOT NULL,
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
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.get_default_avatar_url(profile_kind TEXT)
RETURNS TEXT AS $$
DECLARE
  svg TEXT;
BEGIN
  IF profile_kind = 'hunter' THEN
    svg := '<svg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 120 120''><rect width=''120'' height=''120'' fill=''#e5e7eb''/><circle cx=''60'' cy=''44'' r=''22'' fill=''#9ca3af''/><path d=''M20 108c6-22 22-34 40-34s34 12 40 34'' fill=''#9ca3af''/><path d=''M38 42c6-16 16-20 22-20s16 4 22 20'' fill=''none'' stroke=''#9ca3af'' stroke-width=''8''/></svg>';
  ELSE
    svg := '<svg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 120 120''><rect width=''120'' height=''120'' fill=''#e5e7eb''/><circle cx=''60'' cy=''40'' r=''22'' fill=''#9ca3af''/><path d=''M18 108c8-24 24-34 42-34s34 10 42 34'' fill=''#9ca3af''/></svg>';
  END IF;

  RETURN 'data:image/svg+xml;utf8,' || replace(replace(svg, '#', '%23'), ' ', '%20');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.enforce_profile_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NULL OR btrim(NEW.username) = '' THEN
    NEW.username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  IF NEW.avatar_url IS NULL OR btrim(NEW.avatar_url) = '' THEN
    NEW.avatar_url := public.get_default_avatar_url(COALESCE(NEW.profile_type, 'craftsman'));
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
  avatar_url = COALESCE(NULLIF(btrim(avatar_url), ''), public.get_default_avatar_url(COALESCE(profile_type, 'craftsman')))
WHERE username IS NULL
   OR btrim(username) = ''
   OR avatar_url IS NULL
   OR btrim(avatar_url) = '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, profession, location, bio, phone, email, profile_type)
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
      WHEN NEW.raw_user_meta_data->>'profile_type' IN ('craftsman', 'hunter')
      THEN NEW.raw_user_meta_data->>'profile_type'
      ELSE 'craftsman'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
  WITH CHECK (auth.uid() = user_id);

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

-- RLS Policies for saved_posts
DROP POLICY IF EXISTS "Users can view their own saved posts" ON public.saved_posts;
CREATE POLICY "Users can view their own saved posts"
  ON public.saved_posts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save posts" ON public.saved_posts;
CREATE POLICY "Users can save posts"
  ON public.saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave posts" ON public.saved_posts;
CREATE POLICY "Users can unsave posts"
  ON public.saved_posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_listings
DROP POLICY IF EXISTS "Users can view their own saved listings" ON public.saved_listings;
CREATE POLICY "Users can view their own saved listings"
  ON public.saved_listings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save listings" ON public.saved_listings;
CREATE POLICY "Users can save listings"
  ON public.saved_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave listings" ON public.saved_listings;
CREATE POLICY "Users can unsave listings"
  ON public.saved_listings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_reels
DROP POLICY IF EXISTS "Users can view their own saved reels" ON public.saved_reels;
CREATE POLICY "Users can view their own saved reels"
  ON public.saved_reels FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save reels" ON public.saved_reels;
CREATE POLICY "Users can save reels"
  ON public.saved_reels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave reels" ON public.saved_reels;
CREATE POLICY "Users can unsave reels"
  ON public.saved_reels FOR DELETE
  USING (auth.uid() = user_id);

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
  CHECK (post_type IN ('standard', 'property', 'project'));

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

CREATE TABLE IF NOT EXISTS public.property_inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  needs TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can send a property inquiry" ON public.property_inquiries;
CREATE POLICY "Anyone can send a property inquiry"
  ON public.property_inquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sellers can view their property inquiries" ON public.property_inquiries;
CREATE POLICY "Sellers can view their property inquiries"
  ON public.property_inquiries FOR SELECT
  USING (auth.uid() = seller_id);

