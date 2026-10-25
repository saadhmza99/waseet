-- Favoris: projets + produits
-- Run in Supabase SQL editor, then: NOTIFY pgrst, 'reload schema';

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

GRANT SELECT, INSERT, DELETE ON public.saved_projects TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.saved_products TO authenticated;

NOTIFY pgrst, 'reload schema';
