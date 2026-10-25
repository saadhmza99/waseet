-- Migration: move project documents out of the projects.documents JSONB
-- column into their own table public.projects_documents.
-- Safe to re-run: table/policies are idempotent, the backfill only runs
-- while the JSONB column still exists and skips projects already migrated.

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

CREATE INDEX IF NOT EXISTS projects_documents_project_position_idx
  ON public.projects_documents (project_id, position);

ALTER TABLE public.projects_documents ENABLE ROW LEVEL SECURITY;

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

DROP TRIGGER IF EXISTS update_projects_documents_updated_at ON public.projects_documents;
CREATE TRIGGER update_projects_documents_updated_at
  BEFORE UPDATE ON public.projects_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

GRANT SELECT ON public.projects_documents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects_documents TO authenticated;

-- Backfill any documents still stored as JSONB on projects, preserving order.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'documents'
  ) THEN
    INSERT INTO public.projects_documents (project_id, title, type, url, privacy, position)
    SELECT
      p.id,
      COALESCE(elem->>'title', ''),
      COALESCE(NULLIF(elem->>'type', ''), 'Brochure commerciale'),
      COALESCE(elem->>'url', ''),
      CASE WHEN elem->>'privacy' = 'private' THEN 'private' ELSE 'public' END,
      (ord - 1)::integer
    FROM public.projects p,
         jsonb_array_elements(
           CASE WHEN jsonb_typeof(p.documents) = 'array' THEN p.documents ELSE '[]'::jsonb END
         ) WITH ORDINALITY AS t(elem, ord)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.projects_documents d WHERE d.project_id = p.id
    );
  END IF;
END $$;

-- The JSONB column is gone for good; documents live in projects_documents now.
ALTER TABLE public.projects DROP COLUMN IF EXISTS documents;
