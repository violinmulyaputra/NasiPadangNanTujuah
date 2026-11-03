-- =============================================================================
-- Skema pembayaran manual (F3). Transfer bank atau QRIS dengan data CONTOH:
-- tidak ada payment gateway dan tidak ada uang sungguhan.
--
-- Cara pakai: tempel ke Supabase SQL Editor lalu jalankan, SETELAH schema.sql
-- dan schema-pesanan.sql. Aman dijalankan ulang (idempoten).
--
-- Tidak ada status pesanan baru. Status tetap menunggu_bayar, diproses, diantar,
-- selesai. "Bukti terkirim" diturunkan dari proof_uploaded_at.
--
-- Model akses:
--   - orders dan order_attempts: tetap TANPA kebijakan publik (schema-pesanan.sql).
--   - Bucket payment-proofs: privat, TANPA kebijakan apa pun di storage.objects.
--     Hanya service role di server (Server Action) yang menulis, membaca, dan
--     menghapus berkas. Anon dan user login tidak punya akses.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- orders: kolom pembayaran
-- -----------------------------------------------------------------------------

alter table public.orders add column if not exists payment_method text;
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('transfer', 'qris'));

-- payment_proof_path sudah dibuat schema.sql; baris ini untuk jaga-jaga.
-- Isinya jalur di bucket payment-proofs: <order id>/<nama acak>.<ext>.
alter table public.orders add column if not exists payment_proof_path text;

alter table public.orders add column if not exists proof_uploaded_at timestamptz;

-- Maksimal 3 kali unggah per pesanan (dicek Server Action, dijaga juga di sini).
alter table public.orders add column if not exists proof_upload_count integer not null default 0;
alter table public.orders drop constraint if exists orders_proof_upload_count_check;
alter table public.orders add constraint orders_proof_upload_count_check
  check (proof_upload_count between 0 and 3);

-- Jalur, waktu, dan metode terisi bersamaan saat unggah berhasil.
alter table public.orders drop constraint if exists orders_proof_consistent;
alter table public.orders add constraint orders_proof_consistent
  check ((payment_proof_path is null) = (proof_uploaded_at is null));


-- -----------------------------------------------------------------------------
-- order_attempts: bedakan percobaan checkout ('order') dan unggah bukti ('proof')
-- -----------------------------------------------------------------------------

alter table public.order_attempts add column if not exists kind text not null default 'order';
alter table public.order_attempts drop constraint if exists order_attempts_kind_check;
alter table public.order_attempts add constraint order_attempts_kind_check
  check (kind in ('order', 'proof'));

-- Batas laju selalu menyaring ip_hash + kind + rentang waktu.
drop index if exists public.order_attempts_ip_created_idx;
create index if not exists order_attempts_ip_kind_created_idx
  on public.order_attempts (ip_hash, kind, created_at);


-- -----------------------------------------------------------------------------
-- Bucket Storage privat untuk bukti bayar. Maksimal 2 MB, hanya JPEG, PNG, WebP.
-- Server juga memeriksa ukuran dan magic bytes sebelum mengunggah.
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Sengaja TIDAK ada create policy pada storage.objects untuk bucket ini.
