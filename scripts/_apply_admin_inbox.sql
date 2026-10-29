-- Devis source context + moderator read access for inbox (devis, contact, partners).

ALTER TABLE public.devis_requests
  ADD COLUMN IF NOT EXISTS source_path TEXT,
  ADD COLUMN IF NOT EXISTS source_label TEXT;

CREATE INDEX IF NOT EXISTS contact_messages_topic_created_idx
  ON public.contact_messages (topic, created_at DESC);

DROP POLICY IF EXISTS "Moderators can view devis requests" ON public.devis_requests;
CREATE POLICY "Moderators can view devis requests"
  ON public.devis_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.moderation_admins ma WHERE ma.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Moderators can view contact messages" ON public.contact_messages;
CREATE POLICY "Moderators can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.moderation_admins ma WHERE ma.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Moderators can view partner requests" ON public.partner_requests;
CREATE POLICY "Moderators can view partner requests"
  ON public.partner_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.moderation_admins ma WHERE ma.user_id = auth.uid())
  );

GRANT SELECT ON public.contact_messages TO authenticated;
GRANT SELECT ON public.partner_requests TO authenticated;
-- devis_requests already granted SELECT to authenticated (seller/requester); policy still filters.

NOTIFY pgrst, 'reload schema';
