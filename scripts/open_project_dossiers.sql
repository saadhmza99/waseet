-- Every promoteur dossier stays closed. Équipe and documents open only
-- for the project owner or a partner on the paid plan.

alter table public.projects
  add column if not exists open_dossier boolean not null default false;

update public.projects
set open_dossier = false
where open_dossier;

update public.profiles p
set featured_promoter = true,
    directory_visible = true
where p.id in (
  select j.user_id
  from public.projects j
  where j.open_dossier
);

create index if not exists projects_open_dossier_idx
  on public.projects (id)
  where open_dossier;

-- Public read redacts équipe and documents unless the dossier is open
-- or the viewer owns the project.
create or replace function public.project_public(p_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  proj public.projects%rowtype;
  featured boolean := false;
  viewer uuid := auth.uid();
  locked boolean := false;
  docs jsonb := '[]'::jsonb;
  payload jsonb;
begin
  select * into proj from public.projects where id = p_id;
  if not found then
    return null;
  end if;

  select coalesce(pr.featured_promoter, false)
  into featured
  from public.profiles pr
  where pr.id = proj.user_id;

  locked := featured
    and viewer is distinct from proj.user_id
    and not public.project_viewer_is_partner();

  if locked then
    proj.team := '[]'::jsonb;
    proj.partners := '[]'::jsonb;
    if proj.attributes is not null then
      proj.attributes := proj.attributes
        - 'architecte'
        - 'bureau_etudes'
        - 'entreprises_construction'
        - 'sous_traitants'
        - 'equipe_realisation_mentions';
    end if;
  else
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', d.id,
          'title', d.title,
          'type', d.type,
          'url', d.url,
          'privacy', d.privacy
        )
        order by d.position
      ),
      '[]'::jsonb
    )
    into docs
    from public.projects_documents d
    where d.project_id = p_id
      and (d.privacy = 'public' or viewer = proj.user_id);
  end if;

  payload := to_jsonb(proj) || jsonb_build_object(
    'documents', docs,
    'dossier_locked', locked,
    'open_dossier', coalesce(proj.open_dossier, false)
  );
  return payload;
end;
$$;

revoke all on function public.project_public(uuid) from public;
grant execute on function public.project_public(uuid) to anon, authenticated;

notify pgrst, 'reload schema';

select p.title, pr.full_name, p.open_dossier, pr.featured_promoter, pr.directory_visible
from public.projects p
join public.profiles pr on pr.id = p.user_id
where p.open_dossier
order by p.title;
