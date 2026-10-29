-- Messages sent from Contactez-nous (partnership, sponsorship, visibility, site problem).
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic TEXT NOT NULL CHECK (topic IN ('partnership', 'sponsorship', 'visibility', 'problem')),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 120),
  email TEXT NOT NULL CHECK (position('@' IN email) > 1 AND char_length(email) <= 180),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 40),
  organization TEXT CHECK (organization IS NULL OR char_length(organization) <= 160),
  message TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 8 AND 4000),
  page_url TEXT CHECK (page_url IS NULL OR char_length(page_url) <= 500),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON public.contact_messages (created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can send a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can send a contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

GRANT INSERT ON public.contact_messages TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
