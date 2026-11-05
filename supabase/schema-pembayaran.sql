-- Skema pembayaran manual

-- orders

alter table public.orders add column if not exists payment_method text;
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('transfer', 'qris'));

alter table public.orders add column if not exists payment_proof_path text;

alter table public.orders add column if not exists proof_uploaded_at timestamptz;

alter table public.orders add column if not exists proof_upload_count integer not null default 0;
alter table public.orders drop constraint if exists orders_proof_upload_count_check;
alter table public.orders add constraint orders_proof_upload_count_check
  check (proof_upload_count between 0 and 3);

alter table public.orders drop constraint if exists orders_proof_consistent;
alter table public.orders add constraint orders_proof_consistent
  check ((payment_proof_path is null) = (proof_uploaded_at is null));

-- order_attempts

alter table public.order_attempts add column if not exists kind text not null default 'order';
alter table public.order_attempts drop constraint if exists order_attempts_kind_check;
alter table public.order_attempts add constraint order_attempts_kind_check
  check (kind in ('order', 'proof'));

drop index if exists public.order_attempts_ip_created_idx;
create index if not exists order_attempts_ip_kind_created_idx
  on public.order_attempts (ip_hash, kind, created_at);

-- Bucket bukti bayar

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

