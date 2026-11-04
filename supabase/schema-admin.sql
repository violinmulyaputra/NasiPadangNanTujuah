-- =============================================================================
-- F5 Dashboard admin: model akses admin (keputusan 2026-11-04).
-- Jalankan SETELAH schema.sql, schema-pesanan.sql, schema-pembayaran.sql,
-- schema-ulasan.sql, dan schema-lacak.sql. Aman dijalankan ulang (idempoten).
--
-- Model akses:
--   - Admin tunggal. Akun dibuat manual di Supabase Auth (tanpa pendaftaran).
--   - "Admin" = user yang terdaftar di tabel admin_users. Bukan sekadar
--     authenticated, dan bukan lagi app_metadata.role = 'admin'.
--   - Dashboard membaca dan menulis data lewat service role di server, SETELAH
--     requireAdmin() memeriksa sesi (getUser) dan admin_users. Kebijakan admin di
--     tabel tetap ada sebagai lapisan kedua dan sekarang memakai admin_users juga.
--
-- Daftarkan akun admin (ganti emailnya):
--   insert into public.admin_users (user_id)
--   select id from auth.users where email = '<email-admin>'
--   on conflict (user_id) do nothing;
-- =============================================================================


-- -----------------------------------------------------------------------------
-- admin_users: daftar user yang boleh membuka dashboard.
-- RLS aktif TANPA kebijakan apa pun: anon dan authenticated tidak bisa membaca
-- atau menulis. Hanya service role (server) dan fungsi is_admin() di bawah.
-- -----------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

-- Jaga-jaga: hapus kebijakan apa pun yang pernah dibuat di admin_users.
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


-- -----------------------------------------------------------------------------
-- is_admin(): dulu membaca app_metadata.role dari JWT. Sekarang true hanya bila
-- auth.uid() ada di admin_users. Semua kebijakan lama yang memakai is_admin()
-- ("Admin mengelola menu", "Admin membaca pesanan", "Admin mengubah pesanan",
-- "Admin membaca item pesanan") otomatis ikut model baru tanpa dibuat ulang.
--
-- security definer: admin_users tidak punya kebijakan, jadi fungsi perlu hak
-- pemilik untuk membacanya. search_path kosong dan nama tabel lengkap mencegah
-- pembajakan lewat objek lain. Fungsi hanya mengembalikan boolean untuk diri
-- sendiri (auth.uid()), tidak membocorkan isi tabel.
-- -----------------------------------------------------------------------------

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


-- -----------------------------------------------------------------------------
-- Tinjauan kebijakan lain (tidak diubah, dicatat di sini):
--   - orders, order_items: hanya kebijakan admin (is_admin) dari schema.sql.
--     schema-pesanan.sql sudah menghapus kebijakan lain. order_attempts tanpa
--     kebijakan. Diulang di bawah supaya tidak ada sisa yang terlalu longgar.
--   - reviews: anon dan authenticated hanya membaca is_visible = true. Ulasan
--     tersembunyi tidak terbaca user biasa. review_attempts tanpa kebijakan.
--   - menu_items: baca publik; tulis hanya is_admin().
--   - delivery_zones: baca publik hanya zona aktif.
--   - storage payment-proofs: tanpa kebijakan di storage.objects (blok bawah
--     menghapus kebijakan yang menyebut bucket ini bila ada).
-- -----------------------------------------------------------------------------

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

-- Kebijakan storage.objects yang menyebut bucket payment-proofs dihapus.
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


-- -----------------------------------------------------------------------------
-- Pemeriksaan (baca hasilnya setelah menjalankan skrip):
-- 1. Kebijakan storage.objects yang TIDAK menyebut bucket tertentu bisa berlaku
--    untuk semua bucket, termasuk payment-proofs. Hasil query ini harus kosong.
-- -----------------------------------------------------------------------------

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and coalesce(qual, '') not like '%bucket_id%'
  and coalesce(with_check, '') not like '%bucket_id%';
