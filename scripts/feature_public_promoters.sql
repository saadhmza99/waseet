-- Public directory: one batch of 50 promoteurs stays listed.
-- Every other promoteur is hidden from Discover (including Tout).
-- The match rule lives only in this script, never in the client.

alter table public.profiles
  add column if not exists featured_promoter boolean not null default false;

alter table public.profiles
  add column if not exists directory_visible boolean not null default true;

update public.profiles
set featured_promoter = false
where featured_promoter;

with featured as (
  select p.id
  from public.profiles p
  where coalesce(p.website_url, '') ilike '%chridari.ma%'
     or exists (
       select 1
       from public.projects j
       where j.user_id = p.id
         and nullif(j.attributes->>'chridari_ref', '') is not null
     )
  order by lower(coalesce(p.full_name, p.username, ''))
  limit 50
)
update public.profiles p
set featured_promoter = true
where p.id in (select id from featured);

update public.profiles p
set directory_visible = p.featured_promoter
where exists (
  select 1
  from public.profile_internal_categories pic
  join public.internal_categories ic on ic.id = pic.internal_category_id
  where pic.profile_id = p.id
    and ic.code = '1.2.1'
);

update public.profiles p
set directory_visible = true
where not exists (
  select 1
  from public.profile_internal_categories pic
  join public.internal_categories ic on ic.id = pic.internal_category_id
  where pic.profile_id = p.id
    and ic.code = '1.2.1'
);

create index if not exists profiles_featured_promoter_idx
  on public.profiles (full_name)
  where featured_promoter;

create index if not exists profiles_directory_visible_idx
  on public.profiles (id)
  where directory_visible;

notify pgrst, 'reload schema';

select
  count(*) filter (where featured_promoter) as featured,
  count(*) filter (where not directory_visible) as hidden_promoters
from public.profiles;
