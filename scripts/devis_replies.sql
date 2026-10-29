alter table public.devis_requests add column if not exists reply text;
alter table public.devis_requests add column if not exists replied_at timestamp with time zone;

create or replace function public.reply_devis_request(p_id uuid, p_reply text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if char_length(btrim(coalesce(p_reply, ''))) < 1 or char_length(btrim(p_reply)) > 2000 then
    raise exception 'reply must be between 1 and 2000 characters';
  end if;
  update public.devis_requests
  set reply = btrim(p_reply),
      replied_at = now()
  where id = p_id
    and seller_id = auth.uid();
  if not found then
    raise exception 'devis not found';
  end if;
end;
$$;

revoke all on function public.reply_devis_request(uuid, text) from public, anon;
grant execute on function public.reply_devis_request(uuid, text) to authenticated;

notify pgrst, 'reload schema';
