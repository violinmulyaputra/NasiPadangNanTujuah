@AGENTS.md

Keputusan 2026-11-04: checkout berupa pop-up di keranjang (tidak ada halaman /checkout, folder rute `checkout/` tidak dipakai). Form mengumpulkan nama, email, nomor telepon, dan alamat pengiriman. Tanpa nomor kartu dan tanpa pembayaran uang sungguhan. Rincian di AGENTS.md dan docs/PRD.md.

F4 (status pesanan) terdiri dari dua rute: /pesanan (form kode pesanan) dan /pesanan/[kode] (status). Rincian di docs/PRD.md F4 dan docs/DESIGN.md "Halaman Lacak Pesanan".

Keputusan 2026-11-04 (F5): admin tunggal; akun dibuat manual di Supabase Auth; tidak ada pendaftaran; akses ditentukan tabel admin_users (supabase/schema-admin.sql). Setiap halaman admin memanggil requireAdmin() dan setiap Server Action admin memanggil getAdmin() (src/lib/admin-auth.ts). Rincian di docs/PRD.md F5.
