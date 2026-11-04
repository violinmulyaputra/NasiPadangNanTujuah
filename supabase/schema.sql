-- =============================================================================
-- Skema database Nasi Padang Nan Tujuah (Supabase / PostgreSQL)
-- Acuan: docs/PRD.md (F1 menu, F2 checkout, F3 bayar manual, F4 status, F5 admin)
--
-- Pemetaan nama tabel (identifier dalam bahasa Inggris, snake_case jamak):
--   menu          -> menu_items
--   pesanan       -> orders
--   item_pesanan  -> order_items
--
-- Cara pakai: tempel ke Supabase SQL Editor lalu jalankan. Skrip aman dijalankan
-- ulang (idempotent): tabel tidak dibuat dua kali dan data contoh tidak ganda.
--
-- Model akses (RLS):
--   - Pengunjung (anon) hanya boleh MEMBACA menu.
--   - Pesanan dibuat dan dilacak lewat Server Actions di server memakai
--     service role key (melewati RLS), setelah input divalidasi di server.
--     Jadi anon tidak punya akses langsung ke orders dan order_items, dan data
--     pelanggan tidak bisa dibaca dari browser.
--   - Admin: DIGANTI oleh supabase/schema-admin.sql (2026-11-04). Admin = user
--     yang terdaftar di tabel admin_users; is_admin() di bawah didefinisikan ulang
--     di sana. app_metadata.role tidak dipakai lagi.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Tipe enum
-- -----------------------------------------------------------------------------

-- Status pesanan hanya empat nilai ini (lihat AGENTS.md).
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'menunggu_bayar',
      'diproses',
      'diantar',
      'selesai'
    );
  end if;
end
$$;


-- -----------------------------------------------------------------------------
-- Fungsi bantu
-- -----------------------------------------------------------------------------

-- Isi kolom updated_at otomatis setiap baris diubah.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- True bila user yang login adalah admin. app_metadata hanya bisa diubah
-- dari server/dashboard, bukan oleh user sendiri.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Kode pesanan unik yang mudah dibaca, contoh: NT-3F9A1C7B.
-- Diambil dari 8 karakter hex pertama UUID v4 (32 bit acak).
create or replace function public.generate_order_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'NT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;


-- -----------------------------------------------------------------------------
-- Tabel menu_items (F1, F5: tombol menu habis)
-- -----------------------------------------------------------------------------

create table if not exists public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique
                  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name          text not null check (char_length(name) between 2 and 80),
  description   text not null default '' check (char_length(description) <= 300),
  -- Kategori menu (kolom "kategori" di PRD). Hanya enam nilai ini.
  category      text not null
                  check (category in ('Ayam', 'Sapi', 'Seafood', 'Sayuran', 'Minuman', 'Buah')),
  -- Harga dalam Rupiah utuh, tanpa desimal.
  price         integer not null check (price > 0),
  -- Foto menu (foto_url): path gambar lokal (public/) atau URL Supabase
  -- Storage, dipakai next/image. Boleh kosong selama foto belum ada.
  image_url     text,
  -- Tersedia: false bila admin menandai menu habis (F5).
  is_available  boolean not null default true,
  -- Populer: ditampilkan di bagian hidangan populer di beranda (F1).
  is_popular    boolean not null default false,
  -- Urutan tampil di dalam satu kategori (kecil dulu).
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists menu_items_category_sort_idx
  on public.menu_items (category, sort_order);

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- Tabel orders (F2 checkout, F3 bayar manual, F4 status, F5 admin)
-- -----------------------------------------------------------------------------

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique default public.generate_order_code(),
  customer_name       text not null check (char_length(customer_name) between 2 and 80),
  -- Nomor WhatsApp format 62xxxxxxxxxx (tanpa +), siap dipakai di tautan wa.me.
  customer_whatsapp   text not null check (customer_whatsapp ~ '^62[0-9]{8,13}$'),
  delivery_address    text not null check (char_length(delivery_address) between 10 and 300),
  -- Zona antar dan ongkirnya disalin saat checkout (ongkir tetap per zona,
  -- daftar zona didefinisikan di kode aplikasi dan divalidasi di server).
  delivery_zone       text not null check (char_length(delivery_zone) between 1 and 50),
  delivery_fee        integer not null check (delivery_fee >= 0),
  notes               text not null default '' check (char_length(notes) <= 300),
  -- Jumlah harga item (Rupiah). Total = subtotal + ongkir, dihitung otomatis.
  subtotal            integer not null check (subtotal >= 0),
  total               integer generated always as (subtotal + delivery_fee) stored,
  status              public.order_status not null default 'menunggu_bayar',
  -- Path file bukti bayar di Supabase Storage (bucket privat), maks 2 MB
  -- divalidasi di server saat unggah.
  payment_proof_path  text,
  is_paid             boolean not null default false,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- paid_at wajib terisi bila lunas, dan kosong bila belum.
  constraint orders_paid_at_consistent check (is_paid = (paid_at is not null))
);

-- Daftar pesanan di dashboard admin: terbaru dulu, bisa difilter status.
create index if not exists orders_status_created_idx
  on public.orders (status, created_at desc);
create index if not exists orders_created_idx
  on public.orders (created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- Tabel order_items (F2: isi keranjang yang dipesan)
-- -----------------------------------------------------------------------------

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  -- restrict: menu yang pernah dipesan tidak bisa dihapus, cukup ditandai habis.
  menu_item_id  uuid not null references public.menu_items (id) on delete restrict,
  -- Nama dan harga disalin saat checkout, supaya pesanan lama tidak berubah
  -- bila harga menu diubah kemudian.
  name          text not null,
  unit_price    integer not null check (unit_price > 0),
  quantity      integer not null check (quantity between 1 and 50),
  line_total    integer generated always as (unit_price * quantity) stored,
  created_at    timestamptz not null default now(),
  -- Satu menu cukup satu baris per pesanan (jumlah diatur lewat quantity).
  constraint order_items_order_menu_unique unique (order_id, menu_item_id)
);

create index if not exists order_items_menu_item_idx
  on public.order_items (menu_item_id);


-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.menu_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- menu_items: semua orang boleh membaca, hanya admin yang boleh menulis.
drop policy if exists "Menu bisa dibaca publik" on public.menu_items;
create policy "Menu bisa dibaca publik"
  on public.menu_items for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin mengelola menu" on public.menu_items;
create policy "Admin mengelola menu"
  on public.menu_items for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- orders: tidak ada policy untuk anon (pembuatan dan pelacakan lewat server).
-- Admin boleh membaca dan mengubah (status, tandai lunas). Tidak ada hapus.
drop policy if exists "Admin membaca pesanan" on public.orders;
create policy "Admin membaca pesanan"
  on public.orders for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admin mengubah pesanan" on public.orders;
create policy "Admin mengubah pesanan"
  on public.orders for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- order_items: admin hanya membaca. Item tidak diubah setelah checkout.
drop policy if exists "Admin membaca item pesanan" on public.order_items;
create policy "Admin membaca item pesanan"
  on public.order_items for select
  to authenticated
  using ((select public.is_admin()));


-- -----------------------------------------------------------------------------
-- Data contoh: 44 menu
--
-- PENTING: semua harga di bawah HANYA CONTOH untuk restoran fiktif (portofolio),
-- bukan harga sungguhan. Patokan kisaran: lauk Rp15.000-45.000, sayuran
-- Rp8.000-15.000, minuman Rp5.000-20.000, buah Rp10.000-15.000.
-- Foto (image_url) dibiarkan kosong sampai foto buatan sendiri tersedia.
-- -----------------------------------------------------------------------------

insert into public.menu_items
  (slug, name, category, price, image_url, is_available, is_popular, sort_order)
values
  -- Ayam
  ('ayam-goreng',              'Ayam goreng',              'Ayam',    22000, null, true, false, 1),
  ('ayam-panggang',            'Ayam panggang',            'Ayam',    24000, null, true, false, 2),
  ('ayam-pop',                 'Ayam Pop',                 'Ayam',    25000, null, true, true,  3),
  ('ayam-balado',              'Ayam balado',              'Ayam',    24000, null, true, true,  4),
  ('ayam-tutu-ruga',           'Ayam tutu ruga',           'Ayam',    26000, null, true, false, 5),
  ('ayam-cabe-ijo',            'Ayam cabe ijo',            'Ayam',    24000, null, true, false, 6),
  ('telur-balado',             'Telur balado',             'Ayam',    15000, null, true, false, 7),

  -- Sapi
  ('rendang-daging-sapi',      'Rendang daging sapi',      'Sapi',    35000, null, true, true,  1),
  ('gulai-otak',               'Gulai otak',               'Sapi',    30000, null, true, false, 2),
  ('gulai-cincang-sapi',       'Gulai cincang sapi',       'Sapi',    32000, null, true, false, 3),
  ('kikil-cabe-ijo',           'Kikil cabe ijo',           'Sapi',    25000, null, true, false, 4),
  ('jangek-siram',             'Jangek siram',             'Sapi',    18000, null, true, false, 5),
  ('dendeng-batoko',           'Dendeng batoko',           'Sapi',    35000, null, true, false, 6),
  ('paru-sapi',                'Paru sapi',                'Sapi',    25000, null, true, false, 7),

  -- Seafood
  ('udang-gulai',              'Udang gulai',              'Seafood', 35000, null, true, false, 1),
  ('udang-bakar',              'Udang bakar',              'Seafood', 38000, null, true, false, 2),
  ('udang-balado',             'Udang balado',             'Seafood', 35000, null, true, true,  3),
  ('udang-tofu',               'Udang tofu',               'Seafood', 32000, null, true, false, 4),
  ('udang-pancet-goreng',      'Udang pancet goreng',      'Seafood', 40000, null, true, false, 5),
  ('ikan-bilis-goreng',        'Ikan bilis goreng',        'Seafood', 18000, null, true, false, 6),
  ('ikan-kakap-balado',        'Ikan kakap balado',        'Seafood', 38000, null, true, true,  7),
  ('ikan-nila-dabu-dabu',      'Ikan nila dabu-dabu',      'Seafood', 30000, null, true, false, 8),
  ('ikan-tenggiri-asam-padeh', 'Ikan tenggiri asam padeh', 'Seafood', 35000, null, true, false, 9),
  ('kepala-kakap',             'Kepala kakap',             'Seafood', 45000, null, true, false, 10),

  -- Sayuran
  ('daun-ubi-tumbuk',          'Daun ubi tumbuk',          'Sayuran', 10000, null, true, false, 1),
  ('cah-buncis-ayam',          'Cah buncis ayam',          'Sayuran', 15000, null, true, false, 2),
  ('sayur-nangka',             'Sayur Nangka',             'Sayuran', 10000, null, true, false, 3),
  ('sayur-singkong-rebus',     'Sayur singkong rebus',     'Sayuran',  8000, null, true, false, 4),
  ('tumis-pare',               'Tumis pare',               'Sayuran', 12000, null, true, false, 5),
  ('lalap-timun',              'Lalap timun',              'Sayuran',  8000, null, true, false, 6),

  -- Minuman
  ('es-kopyor',                'Es kopyor',                'Minuman', 18000, null, true, false, 1),
  ('es-podeng',                'Es podeng',                'Minuman', 15000, null, true, false, 2),
  ('es-campur',                'Es campur',                'Minuman', 18000, null, true, false, 3),
  ('jus-alpukat',              'Jus Alpukat',              'Minuman', 20000, null, true, false, 4),
  ('jus-strawberry',           'Jus strawberry',           'Minuman', 18000, null, true, false, 5),
  ('es-jeruk',                 'Es jeruk',                 'Minuman', 10000, null, true, false, 6),
  ('es-kelapa-jeruk',          'Es kelapa jeruk',          'Minuman', 15000, null, true, false, 7),
  ('es-teh-tawar',             'Es teh tawar',             'Minuman',  5000, null, true, false, 8),
  ('es-teh-manis',             'Es teh manis',             'Minuman',  7000, null, true, true,  9),
  ('air-mineral-botol-330-ml', 'Air mineral botol 330 ml', 'Minuman',  5000, null, true, false, 10),

  -- Buah
  ('buah-mix-potong',          'Buah mix potong',          'Buah',    15000, null, true, false, 1),
  ('buah-mangga-potong',       'Buah mangga potong',       'Buah',    13000, null, true, false, 2),
  ('buah-semangka-potong',     'Buah semangka potong',     'Buah',    10000, null, true, false, 3),
  ('buah-melon-potong',        'Buah melon potong',        'Buah',    12000, null, true, false, 4)
on conflict (slug) do nothing;
