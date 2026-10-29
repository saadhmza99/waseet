-- The project owner may delete gallery photos and set or clear the cover.
-- Curator@sifarah.local (?power=1) can do the same on any project.

create or replace function public.patch_project_media(
  p_id uuid,
  p_action text,
  p_url text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_images jsonb;
  v_media jsonb;
  v_cover text;
  v_url text;
  v_next jsonb := '[]'::jsonb;
  v_item jsonb;
  v_kept_images text[] := '{}';
  v_kept_media jsonb := '[]'::jsonb;
  v_found boolean := false;
  v_curator_id constant uuid := 'a1111111-1111-5111-8111-111111111111';
  v_curator_email constant text := 'curator@sifarah.local';
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'pro account required';
  end if;
  if auth.uid() is distinct from v_curator_id
     and lower(coalesce(auth.jwt() ->> 'email', '')) is distinct from v_curator_email then
    if p_action not in ('delete_image', 'set_cover', 'clear_cover')
       or not exists (
         select 1 from public.projects
         where id = p_id and user_id = auth.uid()
       ) then
      raise exception 'curator account required';
    end if;
  end if;

  if p_action not in ('set_cover', 'delete_image', 'clear_cover') then
    raise exception 'invalid action';
  end if;

  v_url := nullif(trim(coalesce(p_url, '')), '');
  if p_action <> 'clear_cover' and v_url is null then
    raise exception 'url required';
  end if;

  select
    coalesce(images, '[]'::jsonb),
    coalesce(media, '[]'::jsonb),
    coalesce(cover_image, '')
  into v_images, v_media, v_cover
  from public.projects
  where id = p_id;

  if not found then
    raise exception 'project not found';
  end if;

  if jsonb_typeof(v_images) <> 'array' then
    v_images := '[]'::jsonb;
  end if;
  if jsonb_typeof(v_media) <> 'array' then
    v_media := '[]'::jsonb;
  end if;

  if p_action = 'set_cover' then
    -- Put chosen url first; keep unique remaining urls.
    v_kept_images := array[v_url];
    for v_item in select * from jsonb_array_elements(v_images)
    loop
      if jsonb_typeof(v_item) = 'string' and trim(v_item #>> '{}') <> '' then
        if trim(v_item #>> '{}') <> v_url
           and trim(v_item #>> '{}') <> v_cover
           and not (trim(v_item #>> '{}') = any (v_kept_images)) then
          v_kept_images := array_append(v_kept_images, trim(v_item #>> '{}'));
        end if;
        if trim(v_item #>> '{}') = v_url then
          v_found := true;
        end if;
      end if;
    end loop;

    -- Also accept urls that only live in media[].url
    if not v_found then
      for v_item in select * from jsonb_array_elements(v_media)
      loop
        if jsonb_typeof(v_item) = 'object'
           and trim(coalesce(v_item->>'url', '')) = v_url then
          v_found := true;
          exit;
        end if;
      end loop;
    end if;

    if not v_found and v_cover <> v_url then
      -- Still allow setting any http(s) url passed from the gallery UI.
      null;
    end if;

    v_next := to_jsonb(v_kept_images);
    v_kept_media := '[]'::jsonb;
    for v_item in select * from jsonb_array_elements(v_media)
    loop
      if jsonb_typeof(v_item) = 'object'
         and (
           trim(coalesce(v_item->>'url', '')) = v_url
           or (v_cover <> '' and v_cover <> v_url and trim(coalesce(v_item->>'url', '')) = v_cover)
         ) then
        null;
      else
        v_kept_media := v_kept_media || jsonb_build_array(v_item);
      end if;
    end loop;

    update public.projects
    set cover_image = v_url,
        images = v_next,
        media = v_kept_media,
        updated_at = now()
    where id = p_id;

    return jsonb_build_object(
      'id', p_id,
      'cover_image', v_url,
      'images', v_next,
      'media', v_kept_media
    );
  end if;

  if p_action = 'clear_cover' then
    if v_cover <> '' then
      for v_item in select * from jsonb_array_elements(v_images)
      loop
        if jsonb_typeof(v_item) = 'string'
           and trim(v_item #>> '{}') <> ''
           and trim(v_item #>> '{}') <> v_cover then
          v_kept_images := array_append(v_kept_images, trim(v_item #>> '{}'));
        end if;
      end loop;
      for v_item in select * from jsonb_array_elements(v_media)
      loop
        if jsonb_typeof(v_item) = 'object'
           and trim(coalesce(v_item->>'url', '')) = v_cover then
          null;
        else
          v_kept_media := v_kept_media || jsonb_build_array(v_item);
        end if;
      end loop;
    else
      v_kept_images := '{}';
      v_kept_media := v_media;
      v_next := v_images;
    end if;
    if v_cover <> '' then
      v_next := to_jsonb(v_kept_images);
    end if;
    update public.projects
    set cover_image = null,
        images = v_next,
        media = v_kept_media,
        updated_at = now()
    where id = p_id;
    return jsonb_build_object(
      'id', p_id,
      'cover_image', null,
      'images', v_next,
      'media', v_kept_media
    );
  end if;

  -- delete_image
  for v_item in select * from jsonb_array_elements(v_images)
  loop
    if jsonb_typeof(v_item) = 'string'
       and trim(v_item #>> '{}') <> ''
       and trim(v_item #>> '{}') <> v_url then
      v_kept_images := array_append(v_kept_images, trim(v_item #>> '{}'));
    elsif jsonb_typeof(v_item) = 'string' and trim(v_item #>> '{}') = v_url then
      v_found := true;
    end if;
  end loop;

  for v_item in select * from jsonb_array_elements(v_media)
  loop
    if jsonb_typeof(v_item) = 'object'
       and trim(coalesce(v_item->>'url', '')) = v_url then
      v_found := true;
    elsif jsonb_typeof(v_item) = 'object'
          and trim(coalesce(v_item->>'url', '')) <> v_url then
      v_kept_media := v_kept_media || jsonb_build_array(v_item);
    elsif jsonb_typeof(v_item) <> 'object' then
      v_kept_media := v_kept_media || jsonb_build_array(v_item);
    end if;
  end loop;

  if not v_found and v_cover <> v_url then
    raise exception 'image not in gallery';
  end if;

  v_next := to_jsonb(v_kept_images);
  if v_cover = v_url then
    v_cover := coalesce(v_kept_images[1], '');
  end if;

  update public.projects
  set cover_image = nullif(v_cover, ''),
      images = v_next,
      media = v_kept_media,
      updated_at = now()
  where id = p_id;

  return jsonb_build_object(
    'id', p_id,
    'cover_image', nullif(v_cover, ''),
    'images', v_next,
    'media', v_kept_media
  );
end;
$$;

revoke all on function public.patch_project_media(uuid, text, text) from public;
grant execute on function public.patch_project_media(uuid, text, text) to authenticated;
