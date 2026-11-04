-- Halaman lacak pesanan

alter table public.order_attempts drop constraint if exists order_attempts_kind_check;
alter table public.order_attempts add constraint order_attempts_kind_check
  check (kind in ('order', 'proof', 'track'));

create index if not exists order_attempts_created_idx
  on public.order_attempts (created_at);
