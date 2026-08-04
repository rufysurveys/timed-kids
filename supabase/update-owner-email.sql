create or replace function public.is_timed_kids_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'rufysurveys@gmail.com'
$$;
