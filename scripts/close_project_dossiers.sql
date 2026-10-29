-- Every promoteur dossier stays closed. Équipe and documents open only
-- for the project owner or a partner on the paid plan.

update public.projects
set open_dossier = false
where open_dossier;

create or replace function public.project_dossier_locked(p_user_id uuid, p_open_dossier boolean)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((select featured_promoter from public.profiles where id = p_user_id), false)
    and auth.uid() is distinct from p_user_id
    and not public.project_viewer_is_partner();
$$;
