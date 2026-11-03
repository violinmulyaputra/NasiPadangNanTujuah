-- =============================================================================
-- Halaman lacak pesanan (F4): batas laju pencarian kode.
--
-- Cara pakai: tempel ke Supabase SQL Editor lalu jalankan, SETELAH schema.sql,
-- schema-pesanan.sql, dan schema-pembayaran.sql. Aman dijalankan ulang.
--
-- Tidak ada kolom atau kebijakan baru di orders. Data lacak dibaca server lewat
-- service role dengan kolom terpilih (lihat src/lib/orders.ts).
-- =============================================================================

-- order_attempts: tambah kind 'track' (pencarian kode yang tidak menemukan pesanan).
alter table public.order_attempts drop constraint if exists order_attempts_kind_check;
alter table public.order_attempts add constraint order_attempts_kind_check
  check (kind in ('order', 'proof', 'track'));

-- Pembersihan oportunistik menghapus baris di atas 24 jam berdasarkan created_at.
create index if not exists order_attempts_created_idx
  on public.order_attempts (created_at);
