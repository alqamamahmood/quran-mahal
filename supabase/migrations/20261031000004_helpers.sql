-- 20261031000004_helpers.sql
-- Small server-side helpers referenced by the Next.js app.

-- Best-effort view counter. SECURITY DEFINER so any visitor can increment
-- without needing UPDATE rights on content_items.
create or replace function public.increment_view_count(content_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.content_items
  set view_count = coalesce(view_count, 0) + 1
  where id = content_id
    and status = 'published'
    and visibility in ('public', 'premium');
end;
$$;

revoke all on function public.increment_view_count(uuid) from public;
grant execute on function public.increment_view_count(uuid) to anon, authenticated;
