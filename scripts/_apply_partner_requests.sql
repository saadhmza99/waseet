-- Partner visibility demand (unsigned users asking to join / get posts visibility)
BEGIN;

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

COMMIT;
NOTIFY pgrst, 'reload schema';
