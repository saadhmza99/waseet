-- Repair: public.track_profile_category_change() still updates
-- public.listings, a table that was superseded by public.services and no
-- longer exists — so EVERY profile internal_category_id change (app or
-- seed) failed with "relation public.listings does not exist".
-- Point the category-history mechanism at services, like posts.

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS category_history_id INTEGER
    REFERENCES public.profile_category_history(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS services_category_history_idx
  ON public.services (category_history_id);

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

DROP TRIGGER IF EXISTS trg_services_10_attach_category_history ON public.services;
CREATE TRIGGER trg_services_10_attach_category_history
  BEFORE INSERT OR UPDATE OF category_history_id ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.attach_post_category_history();
