-- Skema database Nasi Padang Nan Tujuah

-- Tipe enum

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

-- Fungsi bantu

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

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create or replace function public.generate_order_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'NT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

-- Tabel menu_items

create table if not exists public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique
                  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name          text not null check (char_length(name) between 2 and 80),
  description   text not null default '' check (char_length(description) <= 300),
  category      text not null
                  check (category in ('Ayam', 'Sapi', 'Seafood', 'Sayuran', 'Minuman', 'Buah')),
  price         integer not null check (price > 0),
  image_url     text,
  is_available  boolean not null default true,
  is_popular    boolean not null default false,
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

-- Tabel orders

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique default public.generate_order_code(),
  customer_name       text not null check (char_length(customer_name) between 2 and 80),
  customer_whatsapp   text not null check (customer_whatsapp ~ '^62[0-9]{8,13}$'),
  delivery_address    text not null check (char_length(delivery_address) between 10 and 300),
  delivery_zone       text not null check (char_length(delivery_zone) between 1 and 50),
  delivery_fee        integer not null check (delivery_fee >= 0),
  notes               text not null default '' check (char_length(notes) <= 300),
  subtotal            integer not null check (subtotal >= 0),
  total               integer generated always as (subtotal + delivery_fee) stored,
  status              public.order_status not null default 'menunggu_bayar',
  payment_proof_path  text,
  is_paid             boolean not null default false,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint orders_paid_at_consistent check (is_paid = (paid_at is not null))
);

create index if not exists orders_status_created_idx
  on public.orders (status, created_at desc);
create index if not exists orders_created_idx
  on public.orders (created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Tabel order_items

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  menu_item_id  uuid not null references public.menu_items (id) on delete restrict,
  name          text not null,
  unit_price    integer not null check (unit_price > 0),
  quantity      integer not null check (quantity between 1 and 50),
  line_total    integer generated always as (unit_price * quantity) stored,
  created_at    timestamptz not null default now(),
  constraint order_items_order_menu_unique unique (order_id, menu_item_id)
);

create index if not exists order_items_menu_item_idx
  on public.order_items (menu_item_id);

-- Row Level Security

alter table public.menu_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

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

drop policy if exists "Admin membaca item pesanan" on public.order_items;
create policy "Admin membaca item pesanan"
  on public.order_items for select
  to authenticated
  using ((select public.is_admin()));

-- Data contoh

insert into public.menu_items
  (slug, name, category, price, image_url, is_available, is_popular, sort_order)
values
  ('ayam-goreng',              'Ayam goreng',              'Ayam',    22000, null, true, false, 1),
  ('ayam-panggang',            'Ayam panggang',            'Ayam',    24000, null, true, false, 2),
  ('ayam-pop',                 'Ayam Pop',                 'Ayam',    25000, null, true, true,  3),
  ('ayam-balado',              'Ayam balado',              'Ayam',    24000, null, true, true,  4),
  ('ayam-tutu-ruga',           'Ayam tutu ruga',           'Ayam',    26000, null, true, false, 5),
  ('ayam-cabe-ijo',            'Ayam cabe ijo',            'Ayam',    24000, null, true, false, 6),
  ('telur-balado',             'Telur balado',             'Ayam',    15000, null, true, false, 7),

  ('rendang-daging-sapi',      'Rendang daging sapi',      'Sapi',    35000, null, true, true,  1),
  ('gulai-otak',               'Gulai otak',               'Sapi',    30000, null, true, false, 2),
  ('gulai-cincang-sapi',       'Gulai cincang sapi',       'Sapi',    32000, null, true, false, 3),
  ('kikil-cabe-ijo',           'Kikil cabe ijo',           'Sapi',    25000, null, true, false, 4),
  ('jangek-siram',             'Jangek siram',             'Sapi',    18000, null, true, false, 5),
  ('dendeng-batoko',           'Dendeng batoko',           'Sapi',    35000, null, true, false, 6),
  ('paru-sapi',                'Paru sapi',                'Sapi',    25000, null, true, false, 7),

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

  ('daun-ubi-tumbuk',          'Daun ubi tumbuk',          'Sayuran', 10000, null, true, false, 1),
  ('cah-buncis-ayam',          'Cah buncis ayam',          'Sayuran', 15000, null, true, false, 2),
  ('sayur-nangka',             'Sayur Nangka',             'Sayuran', 10000, null, true, false, 3),
  ('sayur-singkong-rebus',     'Sayur singkong rebus',     'Sayuran',  8000, null, true, false, 4),
  ('tumis-pare',               'Tumis pare',               'Sayuran', 12000, null, true, false, 5),
  ('lalap-timun',              'Lalap timun',              'Sayuran',  8000, null, true, false, 6),

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

  ('buah-mix-potong',          'Buah mix potong',          'Buah',    15000, null, true, false, 1),
  ('buah-mangga-potong',       'Buah mangga potong',       'Buah',    13000, null, true, false, 2),
  ('buah-semangka-potong',     'Buah semangka potong',     'Buah',    10000, null, true, false, 3),
  ('buah-melon-potong',        'Buah melon potong',        'Buah',    12000, null, true, false, 4)
on conflict (slug) do nothing;
