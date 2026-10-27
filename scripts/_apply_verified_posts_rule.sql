BEGIN;

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

COMMIT;
NOTIFY pgrst, 'reload schema';
