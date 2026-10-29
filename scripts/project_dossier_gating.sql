-- Server-side dossier gating for promoteur projects.
-- Équipe, partenaires, équipe attributes, and documents stay closed
-- unless the viewer owns the project or is on the paid partner plan.
-- Direct table SELECT is owner-only; public reads go through projects_directory
-- and project_public (security definer / owner-bypassing view).

alter table public.projects
  add column if not exists open_dossier boolean not null default false;

create index if not exists projects_open_dossier_idx
  on public.projects (id)
  where open_dossier;

-- Placeholder for future réseau partenaire unlock. Always false for now.
create or replace function public.project_viewer_is_partner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select false;
$$;

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

create or replace function public.project_attributes_for_viewer(p_attributes jsonb, p_locked boolean)
returns jsonb
language sql
immutable
as $$
  select case
    when not p_locked or p_attributes is null then p_attributes
    else p_attributes
      - 'architecte'
      - 'bureau_etudes'
      - 'entreprises_construction'
      - 'sous_traitants'
      - 'equipe_realisation_mentions'
  end;
$$;

-- Redacted directory for anon/authenticated. View owner bypasses table RLS.
drop view if exists public.projects_directory;
create view public.projects_directory as
select
  p.id,
  p.user_id,
  p.title,
  p.description,
  p.city,
  p.region,
  p.neighborhood,
  p.address,
  p.postal_code,
  p.country,
  p.latitude,
  p.longitude,
  p.category,
  p.subtype,
  p.project_type,
  p.status,
  p.commercial_status,
  p.progress,
  p.start_date,
  p.expected_end,
  p.actual_end,
  p.cover_image,
  p.images,
  p.typologies,
  p.equipment,
  p.nearby,
  p.price_on_request,
  p.price_from,
  p.price_min,
  p.price_max,
  p.currency,
  p.usage,
  p.land_area,
  p.built_area,
  p.buildings,
  p.floors,
  p.basements,
  p.apartments,
  p.parking,
  p.surface,
  p.promoter_id,
  p.promoter_name,
  p.promoter_website,
  case
    when public.project_dossier_locked(p.user_id, p.open_dossier) then '[]'::jsonb
    else coalesce(p.team, '[]'::jsonb)
  end as team,
  case
    when public.project_dossier_locked(p.user_id, p.open_dossier) then '[]'::jsonb
    else coalesce(p.partners, '[]'::jsonb)
  end as partners,
  p.phases,
  p.updates,
  p.media,
  p.units,
  p.choices,
  public.project_attributes_for_viewer(
    p.attributes,
    public.project_dossier_locked(p.user_id, p.open_dossier)
  ) as attributes,
  p.open_dossier,
  public.project_dossier_locked(p.user_id, p.open_dossier) as dossier_locked,
  coalesce(pr.featured_promoter, false) as featured_promoter,
  p.created_at,
  p.updated_at
from public.projects p
left join public.profiles pr on pr.id = p.user_id;

revoke all on public.projects_directory from public;
grant select on public.projects_directory to anon, authenticated;

-- Detail RPC: same redaction + documents only when unlocked.
create or replace function public.project_public(p_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  proj public.projects%rowtype;
  locked boolean := false;
  docs jsonb := '[]'::jsonb;
  payload jsonb;
  viewer uuid := auth.uid();
begin
  select * into proj from public.projects where id = p_id;
  if not found then
    return null;
  end if;

  locked := public.project_dossier_locked(proj.user_id, proj.open_dossier);

  if locked then
    proj.team := '[]'::jsonb;
    proj.partners := '[]'::jsonb;
    proj.attributes := public.project_attributes_for_viewer(proj.attributes, true);
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

revoke all on function public.project_dossier_locked(uuid, boolean) from public;
grant execute on function public.project_dossier_locked(uuid, boolean) to anon, authenticated;

revoke all on function public.project_viewer_is_partner() from public;
grant execute on function public.project_viewer_is_partner() to anon, authenticated;

-- Base table: owners only. Everyone else must use projects_directory / project_public.
drop policy if exists "Projects are viewable by everyone" on public.projects;
drop policy if exists "Owners can view their own projects" on public.projects;
create policy "Owners can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

-- Documents: hide public docs on locked featured dossiers from non-owners / non-partners.
create or replace function public.project_document_readable(p_project_id uuid, p_privacy text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p.user_id = auth.uid() then true
    when coalesce(p_privacy, '') is distinct from 'public' then false
    when public.project_dossier_locked(p.user_id, p.open_dossier) then false
    else true
  end
  from public.projects p
  where p.id = p_project_id;
$$;

revoke all on function public.project_document_readable(uuid, text) from public;
grant execute on function public.project_document_readable(uuid, text) to anon, authenticated;

drop policy if exists "Project documents are viewable when public or owned" on public.projects_documents;
create policy "Project documents are viewable when public or owned"
  on public.projects_documents for select
  using (public.project_document_readable(project_id, privacy));

notify pgrst, 'reload schema';
