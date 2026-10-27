-- Devis requests (lechantier-style quote wizard)
BEGIN;

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

COMMIT;
NOTIFY pgrst, 'reload schema';
