-- F5 Dashboard admin

-- admin_users

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

do $$
declare
  p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'admin_users'
  loop
    execute format('drop policy %I on public.admin_users', p.policyname);
  end loop;
end
$$;

-- is_admin()

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Tinjauan kebijakan lain

do $$
declare
  p record;
begin
  for p in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('orders', 'order_items', 'order_attempts')
      and policyname not in ('Admin membaca pesanan', 'Admin mengubah pesanan', 'Admin membaca item pesanan')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end
$$;

do $$
declare
  p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (coalesce(qual, '') like '%payment-proofs%' or coalesce(with_check, '') like '%payment-proofs%')
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end
$$;

-- Pemeriksaan

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and coalesce(qual, '') not like '%bucket_id%'
  and coalesce(with_check, '') not like '%bucket_id%';
