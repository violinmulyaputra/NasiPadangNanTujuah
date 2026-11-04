-- =============================================================================
-- Skema fitur Ulasan (perluasan F1, disetujui 2026-11-03).
-- Ulasan hanya berisi nama, rating, dan teks. Tanpa akun pelanggan dan tanpa email.
-- Ulasan tampil langsung; moderasi nanti lewat dashboard admin (F5) dengan
-- menyembunyikan ulasan (is_visible = false).
--
-- Cara pakai: tempel ke Supabase SQL Editor lalu jalankan, setelah schema.sql.
-- Aman dijalankan ulang (idempotent). Ulasan hanya dari pengunjung; seed-ulasan.sql tidak dipakai lagi.
--
-- Model akses (RLS):
--   - Pengunjung (anon) dan user login hanya boleh MEMBACA ulasan yang tampil.
--   - Tidak ada kebijakan insert, update, atau delete publik. Ulasan ditulis lewat
--     Server Action memakai service role key (melewati RLS) setelah validasi server.
--   - review_attempts (catatan batas laju, berisi hash IP) tidak bisa diakses publik.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Tabel reviews
-- -----------------------------------------------------------------------------

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  author_name  text not null check (char_length(author_name) between 2 and 40),
  -- Rating kelipatan 0,5 dari 0,5 sampai 5.
  rating       numeric(2,1) not null
                 check (rating between 0.5 and 5 and rating * 2 = round(rating * 2)),
  comment      text not null check (char_length(comment) between 10 and 500),
  -- false bila disembunyikan admin (moderasi F5).
  is_visible   boolean not null default true,
  -- Warisan seed lama (tidak dipakai lagi); tidak dibedakan di tampilan.
  is_sample    boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists reviews_created_idx
  on public.reviews (created_at desc);


-- -----------------------------------------------------------------------------
-- Tabel review_attempts (batas laju kirim ulasan)
-- Hanya hash sha256 dari IP + salt, IP mentah tidak pernah disimpan.
-- -----------------------------------------------------------------------------

create table if not exists public.review_attempts (
  id          bigint generated always as identity primary key,
  ip_hash     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists review_attempts_ip_created_idx
  on public.review_attempts (ip_hash, created_at);


-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.reviews         enable row level security;
alter table public.review_attempts enable row level security;

-- reviews: hanya ulasan yang tampil yang bisa dibaca publik.
drop policy if exists "Ulasan tampil bisa dibaca publik" on public.reviews;
create policy "Ulasan tampil bisa dibaca publik"
  on public.reviews for select
  to anon, authenticated
  using (is_visible = true);

-- review_attempts: sengaja tanpa kebijakan apa pun (hanya service role).


-- -----------------------------------------------------------------------------
-- View review_stats: rata-rata rating dan jumlah ulasan yang tampil.
-- security_invoker = true: view memakai hak pembaca, jadi RLS reviews tetap
-- berlaku (hanya baris is_visible yang terhitung).
-- -----------------------------------------------------------------------------

create or replace view public.review_stats
with (security_invoker = true)
as
select
  coalesce(round(avg(rating), 1), 0)::numeric(2,1) as average_rating,
  count(*)::integer                               as review_count
from public.reviews
where is_visible = true;

grant select on public.review_stats to anon, authenticated;
