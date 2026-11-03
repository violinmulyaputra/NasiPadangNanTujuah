# PRD & Rekomendasi Stack: Nasi Padang Nan Tujuah

## Ringkasan dan asumsi

MVP ini adalah web pemesanan langsung untuk satu restoran fiktif, dibangun satu developer dalam 5 hari dengan biaya hosting Rp0.

**Masalah.** Pelanggan setia hanya bisa memesan lewat aplikasi pihak ketiga (komisi merchant umumnya 15 sampai 25 persen per transaksi, yang biasanya ikut menaikkan harga di aplikasi) atau lewat chat manual tanpa menu terstruktur dan status pesanan.

**Solusi.** Satu situs: lihat menu, pesan tanpa akun, bayar manual, pantau status, dan admin restoran memproses pesanan.

**Asumsi:**

- Merek fiktif untuk portofolio, jadi tidak ada uang atau data pelanggan sungguhan. Pembayaran manual berupa simulasi dengan data rekening dan QRIS contoh.
- Developer: fullstack Next.js dan SQL (PostgreSQL atau MySQL), belum pernah deploy ke produksi.
- Budget Rp0 (hanya free tier), waktu 6 sampai 8 jam per hari selama 5 hari kerja.
- Pengiriman oleh kurir restoran sendiri, dengan area layanan dan ongkir tetap per zona.
- Validasi lewat 5 sampai 10 teman atau keluarga sebagai penguji.

**Referensi desain.** Tampilan dan susunan halaman mengacu pada situs Bites (https://bitechops.netlify.app/): Beranda, Tentang, Menu, Ulasan, dan Kontak, dengan kartu hidangan dan foto makanan besar. Di situs referensi itu keranjang dan pembayaran belum berfungsi, jadi alur pesan, bayar, dan lacak dibuat sendiri. Teks, foto, dan nama diganti dengan konten sendiri, tidak disalin.

## 1. Fitur inti MVP

MVP hanya berisi 5 fitur, yaitu alur minimum dari melihat menu sampai pesanan selesai diproses admin.

| # | Fitur | Isi minimum |
| --- | --- | --- |
| F1 | Etalase dan menu | Beranda (hero, hidangan populer, testimoni), Tentang, Ulasan (daftar ulasan dan form kirim ulasan, lihat keputusan 2026-11-03), Kontak, dan halaman Menu berisi 44 item dalam 6 kategori (Ayam, Sapi, Seafood, Sayuran, Minuman, Buah) dengan foto, harga Rupiah, dan status tersedia atau habis |
| F2 | Keranjang dan checkout tanpa akun | Ubah jumlah item, isi nama, nomor WhatsApp, alamat, zona antar, dan catatan |
| F3 | Pembayaran manual | Kode pesanan unik, instruksi transfer atau QRIS contoh, unggah bukti bayar |
| F4 | Status pesanan | Halaman lacak dengan kode pesanan: menunggu bayar, diproses, diantar, selesai |
| F5 | Dashboard admin | Login admin, daftar pesanan, ubah status, tandai lunas, tombol menu habis, tautan WhatsApp ke pelanggan |

## 2. User story

Setiap fitur punya satu user story dan satu kriteria selesai yang bisa diuji.

**F1. Etalase dan menu**

- Sebagai pelanggan setia, saya mau melihat beranda, ulasan pelanggan, dan menu lengkap dengan foto, harga, dan status tersedia, supaya saya yakin dengan restorannya dan tahu apa yang bisa saya pesan sekarang.
- Selesai bila: menu habis tidak bisa ditambahkan ke keranjang, dan kelima halaman (Beranda, Tentang, Menu, Ulasan, Kontak) terbuka dengan baik di layar HP.

**F2. Keranjang dan checkout**

- Sebagai pelanggan setia, saya mau memesan tanpa membuat akun, supaya saya bisa memesan dalam hitungan menit.
- Selesai bila: total (item ditambah ongkir zona) benar dan pesanan tersimpan dengan kode unik.

**F3. Pembayaran manual**

- Sebagai pelanggan setia, saya mau melihat cara bayar dan mengunggah bukti transfer, supaya restoran tahu pesanan saya sudah dibayar.
- Selesai bila: bukti bayar (gambar maksimal 2 MB) tertaut ke pesanan yang benar.

**F4. Status pesanan**

- Sebagai pelanggan setia, saya mau melacak pesanan dengan kode pesanan, supaya saya tidak perlu bertanya lewat chat.
- Selesai bila: status di halaman lacak sama dengan status di dashboard admin setelah dimuat ulang.

**F5. Dashboard admin**

- Sebagai admin restoran, saya mau melihat semua pesanan masuk dan mengubah statusnya, supaya saya bisa memproses pesanan tanpa mencatat manual.
- Sebagai admin restoran, saya mau menandai menu habis, supaya pelanggan tidak memesan menu yang tidak tersedia.
- Selesai bila: hanya admin yang login yang bisa membuka halaman ini.

## 3. Di luar scope MVP

Semua hal berikut sengaja tidak dikerjakan dalam 5 hari ini.

- Akun pelanggan, login, dan riwayat pesanan
- Payment gateway otomatis (Midtrans, Xendit) dan pembayaran uang sungguhan
- Pelacakan kurir real-time atau GPS
- Ongkir dinamis berdasarkan jarak (MVP memakai ongkir tetap per zona)
- Notifikasi otomatis lewat WhatsApp API (MVP hanya tautan wa.me)
- Promo, kupon, dan poin loyalitas
- Multi-cabang, multi-admin dengan peran berbeda, dan laporan keuangan
- Aplikasi mobile native dan mode PWA offline
- Integrasi dengan GoFood, GrabFood, atau ShopeeFood
- Dukungan lebih dari satu bahasa
- Reservasi meja, blog, dan aplikasi mobile seperti di situs referensi

**Keputusan 2026-11-03.** Pemilik proyek menyetujui fitur kirim ulasan sebagai perluasan F1. Ulasan hanya berisi nama, rating, dan teks; tanpa akun pelanggan dan tanpa email; tampil langsung; dimoderasi nanti lewat dashboard admin (F5) dengan menyembunyikan ulasan. Ulasan di etalase beranda tetap data contoh. Hal lain di daftar ini tetap di luar scope.

## 4. Metrik keberhasilan MVP

MVP dianggap berhasil bila 5 sampai 10 penguji mencapai semua target berikut dalam uji coba 3 hari.

| Metrik | Target | Cara ukur |
| --- | --- | --- |
| Penyelesaian pesanan tanpa bantuan | Minimal 80 persen penguji (8 dari 10) sampai ke kode pesanan | Pengamatan langsung atau rekam layar |
| Waktu dari buka menu sampai kode pesanan | Median maksimal 3 menit | Stopwatch saat uji, atau selisih waktu di database |
| Jumlah pesanan uji | Minimal 20 pesanan tercatat | Hitung baris tabel pesanan |
| Pesanan hilang atau ganda | 0 | Cocokkan catatan penguji dengan daftar pesanan admin |
| Waktu admin memproses satu pesanan | Maksimal 30 detik (buka, ubah status, tandai lunas) | Stopwatch pada 10 pesanan |
| Skor kemudahan pakai | Rata-rata minimal 4 dari 5 | Satu pertanyaan survei di akhir uji |
| Bug kritis terbuka | 0 saat uji coba berakhir | Daftar isu di GitHub |

Target teknis (kecepatan dan uptime) ada di bagian 6.

## 5. Perbandingan opsi stack

Untuk satu developer yang belum pernah deploy dan berbudget Rp0, opsi satu repo (Next.js untuk frontend dan backend, PostgreSQL di Supabase) paling sedikit bagian yang harus dijaga.

| Lapisan | Opsi | Kerumitan setup | Biaya per bulan (perkiraan) | Kecocokan untuk solo developer |
| --- | --- | --- | --- | --- |
| Frontend | A. Next.js (App Router) dengan Tailwind | Rendah, proyek sudah berjalan | Rp0 di Vercel Hobby (untuk penggunaan non-komersial) | Sangat cocok: routing, rendering server, dan optimasi gambar bawaan |
| Frontend | B. React dengan Vite (SPA) dan Tailwind | Rendah, tetapi butuh backend terpisah dan pengaturan CORS | Rp0 di Netlify atau Cloudflare Pages | Cukup cocok: dua proyek yang harus dijaga |
| Backend | A. Next.js Server Actions dan Route Handlers | Rendah, satu kali deploy | Rp0 (ikut Vercel) | Sangat cocok: satu bahasa dan satu repo |
| Backend | B. Express (Node) terpisah | Sedang: server sendiri, CORS, deploy kedua | Rp0 di free tier (layanan tertidur saat sepi, request pertama lambat), sekitar Rp115 ribu untuk instans berbayar terkecil | Kurang cocok untuk pemula deploy |
| Database | A. PostgreSQL di Supabase, termasuk Auth dan Storage | Rendah sampai sedang | Rp0 di free tier (proyek dijeda otomatis jika tidak aktif sekitar 1 minggu), sekitar Rp410 ribu untuk paket berbayar | Sangat cocok: sesuai kemampuan SQL, sekaligus login admin dan penyimpanan bukti bayar |
| Database | B. MySQL di penyedia free tier | Sedang: login admin dan penyimpanan file perlu layanan terpisah | Rp0 dengan batas kecil (cek harga penyedia) | Cukup cocok |

Biaya adalah perkiraan dengan kurs Rp16.500 per USD. Harga dan batas free tier bisa berubah, jadi cek halaman harga resmi masing-masing sebelum deploy.

## 6. Target teknis yang bisa diverifikasi

Target realistis untuk free tier adalah API di bawah 500 ms, halaman menu termuat dalam 2,5 detik di jaringan seluler, dan uptime 99 persen.

| Metrik | Target | Cara verifikasi |
| --- | --- | --- |
| Latency API baca menu (p95) | Maksimal 300 ms | 50 request berurutan dengan autocannon atau k6 ke endpoint menu, dijalankan dari Indonesia |
| Latency API buat pesanan (p95) | Maksimal 500 ms | Skrip uji yang sama, 20 request ke endpoint pesanan |
| Waktu muat halaman menu (LCP) | Maksimal 2,5 detik | Lighthouse mode mobile pada URL produksi |
| Skor Lighthouse Performance (mobile) | Minimal 90 | Lighthouse di Chrome DevTools, rata-rata 3 kali jalan |
| Ukuran unduhan halaman menu | Maksimal 1 MB | Tab Network di DevTools dengan cache dimatikan |
| Uptime bulanan | Minimal 99 persen (maksimal sekitar 7,2 jam tidak tersedia per 30 hari) | UptimeRobot gratis, cek tiap 5 menit pada halaman menu |

Uptime dipatok 99 persen, bukan 99,9 persen, karena free tier tidak memberi jaminan layanan (SLA). Pilih region server Singapura untuk aplikasi dan database supaya latency dari Indonesia tetap rendah.

## Rekomendasi final

Pakai Next.js dengan Tailwind dan Server Actions, PostgreSQL di Supabase (termasuk Auth dan Storage), dan deploy di Vercel region Singapura.

**Alasan singkat:**

- Proyek Next.js sudah berjalan, jadi tidak perlu mulai ulang.
- Satu repo, satu bahasa (TypeScript), dan satu kali deploy: bagian yang bisa salah paling sedikit bagi yang belum pernah deploy.
- PostgreSQL sesuai kemampuan SQL developer. Auth untuk admin dan Storage untuk bukti bayar sudah tersedia di Supabase.
- Rp0 dan cukup untuk beban 5 sampai 10 penguji.

**Rencana 5 hari:**

1. Hari 1: deploy halaman kosong ke Vercel lebih dulu, hubungkan Supabase, buat tabel menu, pesanan, dan item pesanan, isi data contoh. Deploy pertama sering paling banyak masalah, jadi jangan ditunda ke akhir.
2. Hari 2: F1 etalase (Beranda, Tentang, Ulasan, Kontak) dan halaman menu bergaya Bites, memakai komponen 21st.dev dan Framer Motion.
3. Hari 3: F2 keranjang dan checkout, lalu F3 pembayaran manual.
4. Hari 4: F4 halaman status pesanan, F5 dashboard admin, dan tautan wa.me.
5. Hari 5: ukur target teknis (bagian 6), pasang UptimeRobot, perbaiki bug.

Jika waktu mepet, gabungkan Tentang dan Ulasan menjadi bagian di Beranda lebih dulu. Setelah Hari 5, jalankan uji coba 3 hari dengan 5 sampai 10 penguji untuk mengukur metrik di bagian 4. Buat endpoint `/api/health` yang membaca database dan panggil dari UptimeRobot, supaya proyek free tier tidak dijeda karena sepi.