-- =============================================================================
-- Skema pesanan (F2 checkout). Keputusan pemilik proyek 2026-11-04: checkout
-- berupa pop-up di keranjang, form berisi nama, email, telepon, dan alamat.
-- Tanpa nomor kartu dan tanpa pembayaran uang sungguhan.
--
-- Cara pakai: tempel ke Supabase SQL Editor lalu jalankan, SETELAH schema.sql
-- (yang sudah membuat orders dan order_items versi awal). Berkas ini mengubah
-- kedua tabel itu di tempat, membuat delivery_zones dan order_attempts, serta
-- fungsi create_order. Aman dijalankan ulang (idempoten).
--
-- Asumsi: orders masih kosong (checkout belum pernah jalan). Bila sudah ada
-- baris lama, langkah "set not null" untuk customer_email dan foreign key zona
-- akan gagal; hapus pesanan uji dulu.
--
-- Model akses (RLS):
--   - delivery_zones: publik hanya boleh MEMBACA zona aktif.
--   - orders, order_items, order_attempts: TIDAK ADA kebijakan publik. Data
--     pemesan (nama, email, telepon, alamat) tidak bisa dibaca anon. Penulisan
--     lewat Server Action dengan service role. Kebijakan admin login dari
--     schema.sql (is_admin) tetap, untuk dashboard F5.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Tabel delivery_zones. Data contoh restoran fiktif: nama zona berupa rentang
-- jarak dan dipilih sendiri oleh pelanggan, ongkir tetap per zona. Tidak ada
-- hitung jarak, GPS, atau peta. Jangkauan antar maksimal 15 km (PRD, "Zona antar").
-- -----------------------------------------------------------------------------

create table if not exists public.delivery_zones (
  code        text primary key,
  name        text not null,
  fee         integer not null check (fee >= 0),
  is_active   boolean not null default true,
  sort_order  integer
);

-- zona-4 tidak dipakai: dinonaktifkan, bukan dihapus, supaya foreign key pesanan
-- lama (bila ada) tetap sah. Zona nonaktif tidak terbaca publik dan ditolak createOrder.
insert into public.delivery_zones (code, name, fee, is_active, sort_order) values
  ('zona-1', 'Sampai 5 km',                    8000, true,  1),
  ('zona-2', '5 sampai 10 km',                12000, true,  2),
  ('zona-3', '10 sampai 15 km',               18000, true,  3),
  ('zona-4', 'Di atas 15 km (tidak dipakai)', 25000, false, 4)
on conflict (code) do update
  set name = excluded.name, fee = excluded.fee, is_active = excluded.is_active,
      sort_order = excluded.sort_order;


-- -----------------------------------------------------------------------------
-- orders: sesuaikan tabel dari schema.sql
-- -----------------------------------------------------------------------------

-- Kode dibuat aplikasi (src/lib/order-code.ts, format NPT-XXXXXXXX), bukan default DB.
alter table public.orders alter column code drop default;
alter table public.orders drop constraint if exists orders_code_format;
-- not valid: baris lama (format NT-) tidak diperiksa, baris baru wajib format baru.
alter table public.orders add constraint orders_code_format
  check (code ~ '^NPT-[2-9A-HJKMNP-Z]{8}$') not valid;

alter table public.orders drop constraint if exists orders_customer_name_check;
alter table public.orders add constraint orders_customer_name_check
  check (char_length(customer_name) between 2 and 60);

alter table public.orders add column if not exists customer_email text;
alter table public.orders alter column customer_email set not null;
alter table public.orders drop constraint if exists orders_customer_email_check;
alter table public.orders add constraint orders_customer_email_check
  check (char_length(customer_email) <= 120 and customer_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');

-- customer_whatsapp -> customer_phone. Disimpan ternormalisasi 62xxxxxxxxxx (tanpa +),
-- siap dipakai di tautan wa.me.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'customer_whatsapp'
  ) then
    alter table public.orders rename column customer_whatsapp to customer_phone;
  end if;
end
$$;
alter table public.orders drop constraint if exists orders_customer_whatsapp_check;
alter table public.orders drop constraint if exists orders_customer_phone_check;
alter table public.orders add constraint orders_customer_phone_check
  check (customer_phone ~ '^62[0-9]{8,13}$');

alter table public.orders drop constraint if exists orders_delivery_address_check;
alter table public.orders add constraint orders_delivery_address_check
  check (char_length(delivery_address) between 10 and 200);

-- Zona wajib ada di delivery_zones. Ongkir tetap disalin ke delivery_fee saat
-- checkout, jadi pesanan lama tidak berubah bila tarif zona diubah.
alter table public.orders drop constraint if exists orders_delivery_zone_check;
alter table public.orders drop constraint if exists orders_delivery_zone_fkey;
alter table public.orders add constraint orders_delivery_zone_fkey
  foreign key (delivery_zone) references public.delivery_zones (code);

-- Catatan opsional: null bila kosong, maksimal 200 karakter.
alter table public.orders alter column notes drop not null;
alter table public.orders alter column notes drop default;
alter table public.orders drop constraint if exists orders_notes_check;
alter table public.orders add constraint orders_notes_check
  check (notes is null or char_length(notes) <= 200);

-- total tetap kolom generated (subtotal + delivery_fee) dari schema.sql dan status
-- tetap enum order_status dengan empat nilai yang sama; keduanya lebih ketat dari
-- integer atau text biasa. Index created_at dan (status, created_at) sudah ada.


-- -----------------------------------------------------------------------------
-- order_items: sesuaikan tabel dari schema.sql
-- -----------------------------------------------------------------------------

-- Menu boleh dihapus kemudian: baris pesanan tetap, menu_item_id jadi null
-- (nama dan harga sudah disalin).
alter table public.order_items alter column menu_item_id drop not null;
alter table public.order_items drop constraint if exists order_items_menu_item_id_fkey;
alter table public.order_items add constraint order_items_menu_item_id_fkey
  foreign key (menu_item_id) references public.menu_items (id) on delete set null;

-- Satu menu boleh muncul beberapa kali dengan pilihan berbeda.
alter table public.order_items drop constraint if exists order_items_order_menu_unique;

-- Harga dasar saat dipesan (unit_price = base_price + harga pilihan).
alter table public.order_items add column if not exists base_price integer not null default 0;
alter table public.order_items alter column base_price drop default;
alter table public.order_items drop constraint if exists order_items_base_price_check;
alter table public.order_items add constraint order_items_base_price_check
  check (base_price > 0 and unit_price >= base_price);

alter table public.order_items drop constraint if exists order_items_quantity_check;
alter table public.order_items add constraint order_items_quantity_check
  check (quantity between 1 and 20);

-- Pilihan yang sudah divalidasi server ({id kelompok: id pilihan}) dan labelnya.
alter table public.order_items add column if not exists selections jsonb not null default '{}';
alter table public.order_items alter column selections drop default;
alter table public.order_items add column if not exists option_labels text[] not null default '{}';

-- line_total tetap kolom generated (unit_price * quantity) dari schema.sql.

create index if not exists order_items_order_idx on public.order_items (order_id);


-- -----------------------------------------------------------------------------
-- order_attempts (batas laju checkout). Hanya hash sha256 IP + salt.
-- -----------------------------------------------------------------------------

create table if not exists public.order_attempts (
  id          bigint generated always as identity primary key,
  ip_hash     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists order_attempts_ip_created_idx
  on public.order_attempts (ip_hash, created_at);


-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.delivery_zones enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.order_attempts enable row level security;

drop policy if exists "Zona aktif bisa dibaca publik" on public.delivery_zones;
create policy "Zona aktif bisa dibaca publik"
  on public.delivery_zones for select
  to anon, authenticated
  using (is_active = true);

-- Jaga-jaga: hapus kebijakan apa pun di tabel pesanan selain kebijakan admin
-- dari schema.sql, jadi tidak ada akses publik yang tertinggal.
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


-- -----------------------------------------------------------------------------
-- create_order: sisipkan orders dan order_items dalam SATU transaksi.
-- Dipanggil lewat rpc dari klien service role setelah server memvalidasi dan
-- menghitung ulang semua harga. Bila sisipan item gagal, pesanan ikut batal
-- (tidak ada pesanan tanpa item). Mengembalikan null bila kode bentrok, supaya
-- server mencoba lagi dengan kode baru.
-- -----------------------------------------------------------------------------

create or replace function public.create_order(p_code text, p_order jsonb, p_items jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Pesanan tanpa item';
  end if;

  begin
    insert into public.orders (
      code, customer_name, customer_email, customer_phone, delivery_address,
      delivery_zone, delivery_fee, notes, subtotal
    ) values (
      p_code,
      p_order ->> 'customer_name',
      p_order ->> 'customer_email',
      p_order ->> 'customer_phone',
      p_order ->> 'delivery_address',
      p_order ->> 'delivery_zone',
      (p_order ->> 'delivery_fee')::integer,
      nullif(p_order ->> 'notes', ''),
      (p_order ->> 'subtotal')::integer
    )
    returning id into v_id;
  exception when unique_violation then
    -- Satu-satunya kolom unik selain id adalah code.
    return null;
  end;

  insert into public.order_items (
    order_id, menu_item_id, name, base_price, unit_price, quantity, selections, option_labels
  )
  select
    v_id,
    (i ->> 'menu_item_id')::uuid,
    i ->> 'name',
    (i ->> 'base_price')::integer,
    (i ->> 'unit_price')::integer,
    (i ->> 'quantity')::integer,
    i -> 'selections',
    array(select jsonb_array_elements_text(i -> 'option_labels'))
  from jsonb_array_elements(p_items) as i;

  return v_id;
end;
$$;

-- Hanya service role (server). Anon dan user login tidak bisa memanggilnya.
revoke all on function public.create_order(text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_order(text, jsonb, jsonb) to service_role;
