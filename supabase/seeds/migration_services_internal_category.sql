-- Each service can have its own specialty (independent of the author's primary category).
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS internal_category_id INTEGER
    REFERENCES public.internal_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS services_internal_category_idx
  ON public.services (internal_category_id);

UPDATE public.services s
SET internal_category_id = h.internal_category_id
FROM public.profile_category_history h
WHERE s.category_history_id = h.id
  AND s.internal_category_id IS NULL
  AND h.internal_category_id IS NOT NULL;

NOTIFY pgrst, 'reload schema';
