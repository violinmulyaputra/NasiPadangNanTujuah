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
| F2 | Keranjang dan checkout tanpa akun | Ubah jumlah item; pop-up checkout di keranjang berisi nama, email, nomor telepon, alamat, zona antar, dan catatan (lihat keputusan 2026-11-04) |
| F3 | Pembayaran manual | Kode pesanan unik, instruksi transfer atau QRIS contoh, unggah bukti bayar |
| F4 | Status pesanan | Halaman lacak dengan kode pesanan: menunggu bayar, diproses, diantar, selesai |
| F5 | Dashboard admin | Login admin, daftar pesanan, ubah status, tandai lunas, tombol menu habis, tautan WhatsApp ke pelanggan |

### Opsi pesanan dan aturan harga (F1, F2)

Daftar 44 menu, deskripsi, dan harga per porsi ada di `docs/referensi/menu-44.md`, dimuat ke database lewat `supabase/seed-menu-lengkap.sql`. Logikanya ada di `src/lib/menu-options.ts` dan `src/lib/pricing.ts`, modul murni yang dipakai klien dan server.

- **Harga di database adalah sumber kebenaran.** Kolom `menu_items.price` (integer Rupiah) adalah harga dasar per porsi. Harga pilihan didefinisikan di `menu-options.ts`.
- **Kelompok pilihan, pilih satu per kelompok.** Harga pilihan dihitung per porsi.

| Kategori | Kelompok (bawaan) | Pilihan dan tambahan harga |
| --- | --- | --- |
| Ayam, Sapi, Seafood | Pilihan Nasi (Tidak pakai) | Nasi pulen Rp5.000; Nasi pera Rp5.000; Tidak pakai nasi Rp0 |
| | Pilihan Gulai (Tidak pakai) | Gulai cubadak Rp5.000; Gulai cancang Rp10.000; Tidak pakai gulai Rp0 |
| | Pilihan Sayur (Tidak pakai) | Daun pucuk ubi Rp5.000; Tidak pakai sayur Rp0 |
| | Pilihan Sambal (Tidak pakai) | Sambal cabai merah Rp2.500; Sambal cabai hijau Rp2.500; Tidak pakai sambal Rp0 |
| Minuman | Pilihan Gula (Pakai) | Pakai; Sedikit; Tidak pakai (semua Rp0) |
| | Pilihan Es (Pakai) | Pakai; Sedikit; Tidak pakai (semua Rp0) |
| Sayuran, Buah | Tanpa kelompok | Hanya jumlah |

- **Pengecualian minuman** (konstanta `DRINK_OPTION_EXCEPTIONS`): Air Mineral Botol 330 ml tanpa pilihan; Es Teh Tawar hanya Pilihan Es.
- **Harga satu porsi** = harga dasar + jumlah harga pilihan terpilih. **Total baris** = harga satu porsi x jumlah. Jumlah per baris 1 sampai 20.
- **Baris keranjang** dibedakan per kombinasi menu dan pilihan. Menu sama dengan pilihan sama digabung (jumlah bertambah, maksimal 20); pilihan berbeda menjadi baris terpisah. Keranjang disimpan di localStorage browser dengan versi skema; data versi lama dibuang otomatis.
- **Server menghitung ulang saat checkout (F2).** Total di keranjang hanya untuk tampilan. Saat checkout, server membaca harga dari `menu_items`, memvalidasi pilihan dengan `validateSelections` (pilihan tidak dikenal ditolak), menolak menu habis, lalu menghitung ulang dengan `pricing.ts`. Harga atau total kiriman klien tidak dipakai.
- **Skema F2:** `supabase/schema-pesanan.sql` menyesuaikan `order_items` (unik per menu dihapus, jumlah 1 sampai 20, kolom `selections` jsonb dan `option_labels`), jadi satu menu bisa muncul beberapa kali dengan pilihan berbeda.

### Zona antar dan ongkir (F2)

Data contoh untuk restoran fiktif. Nama zona berupa rentang jarak dari restoran dan pelanggan memilih zonanya sendiri; ongkir tetap per zona. Tidak ada hitung jarak, GPS, atau peta. Jangkauan antar maksimal 15 km. Disimpan di tabel `delivery_zones` (kode, nama, tarif integer Rupiah, status aktif) dan dibaca server saat checkout.

| Kode | Zona | Ongkir | Status |
| --- | --- | --- | --- |
| zona-1 | Sampai 5 km | Rp8.000 | aktif |
| zona-2 | 5 sampai 10 km | Rp12.000 | aktif |
| zona-3 | 10 sampai 15 km | Rp18.000 | aktif |
| zona-4 | Di atas 15 km (tidak dipakai) | Rp25.000 | nonaktif (`is_active = false`), tidak tampil dan ditolak server |

### Model data pesanan (F2, dipakai F3 sampai F5)

Skema di `supabase/schema.sql` lalu `supabase/schema-pesanan.sql`. Tipe di `src/types/order.ts`.

- **`orders`:** `code` (unik, format `NPT-` + 8 karakter acak tanpa 0, O, 1, I, L, dibuat `src/lib/order-code.ts` dari crypto; server mencoba ulang bila bentrok), `customer_name` (2 sampai 60), `customer_email` (maksimal 120), `customer_phone` (ternormalisasi `62xxxxxxxxxx` untuk tautan wa.me), `delivery_address` (10 sampai 200), `delivery_zone` (foreign key ke `delivery_zones`), `delivery_fee` (disalin dari zona saat checkout), `notes` (maksimal 200, boleh kosong), `subtotal`, `total` (kolom generated = subtotal + ongkir), `status` (`menunggu_bayar`, `diproses`, `diantar`, `selesai`; awal selalu `menunggu_bayar`), kolom bukti bayar untuk F3, `created_at`, `updated_at`.
- **`order_items`:** salinan nama, `base_price`, `unit_price` (termasuk pilihan), `quantity` (1 sampai 20), `line_total` (generated), `selections` jsonb, dan `option_labels`. `menu_item_id` jadi null bila menu dihapus kemudian.
- **`order_attempts`:** hash sha256 IP + salt (`REVIEW_IP_SALT`) dan kolom `kind` (`order` untuk checkout, `proof` untuk unggah bukti bayar F3), dicek lewat `src/lib/order-rate-limit.ts`. Checkout: maksimal 5 percobaan per jam dan jeda minimal 10 detik. IP mentah tidak disimpan.
- **Pembuatan pesanan:** Server Action `createOrder` (`src/lib/actions/order.ts`) memvalidasi input (pesan per kolom berbahasa Indonesia, kolom jebakan `website`), membaca harga, ketersediaan, dan ongkir dari database, menghitung ulang semuanya dengan `pricing.ts` (angka dari klien diabaikan), lalu memanggil fungsi SQL `create_order` yang menyisipkan pesanan dan itemnya dalam satu transaksi. Tidak ada pesanan tanpa item.
- **Privasi:** RLS aktif di `orders`, `order_items`, dan `order_attempts` tanpa kebijakan publik, jadi data pemesan (nama, email, telepon, alamat) tidak bisa dibaca publik. Penulisan hanya lewat service role di server; dashboard F5 memakai kebijakan admin terpisah. Dari `delivery_zones` publik hanya bisa membaca zona aktif.

### Pembayaran manual (F3)

Hanya transfer bank atau QRIS dengan data **contoh** (`src/lib/payment-info.ts`): Bank Jono, rekening 0000 1234 5678 atas nama "Nasi Padang Nan Tujuah", dan gambar `public/images/pembayaran/qris.webp` dengan QR diburamkan sehingga tidak bisa dipindai. Rekening dan QRIS tetap data contoh. Panel pembayaran tidak memuat catatan peringatan; keterangan fiktif ada di footer setiap halaman: "Situs ini proyek portofolio. Restoran dan pembayaran bersifat fiktif." Tidak ada payment gateway dan tidak ada uang sungguhan.

- **Tanpa status baru.** Status tetap `menunggu_bayar`, `diproses`, `diantar`, `selesai`. Keterangan "bukti terkirim" diturunkan dari `proof_uploaded_at`. Admin yang memindahkan status dan menandai lunas (`is_paid`, `paid_at`) di F5.
- **Kolom `orders` (skema `supabase/schema-pembayaran.sql`):** `payment_method` (`transfer` atau `qris`), `payment_proof_path` (jalur di bucket), `proof_uploaded_at`, `proof_upload_count` (0 sampai 3).
- **Bucket `payment-proofs`:** privat, maksimal 2 MB (2097152 byte), hanya `image/jpeg`, `image/png`, `image/webp`. Tidak ada kebijakan apa pun di `storage.objects` untuk bucket ini; hanya service role di server yang menulis, membaca, dan menghapus. Jalur berkas `<id pesanan>/<32 karakter hex acak>.<ext>`; nama asli berkas tidak disimpan dan tidak ditampilkan.
- **Server Action `uploadPaymentProof`** (`src/lib/actions/payment.ts`, FormData `code`, `method`, `file`): ukuran dicek dari isi berkas (maksimal 2 MB), jenis dicek dari magic bytes (`src/lib/image-type.ts`), bukan dari nama atau Content-Type. Hanya untuk pesanan berstatus `menunggu_bayar`, maksimal 3 kali unggah per pesanan; unggahan baru mengganti berkas lama (berkas lama dihapus setelah yang baru tersimpan). Update memakai syarat status dan jumlah unggah, jadi unggahan serentak atau status yang baru diubah admin tidak menimpa data. Kode salah bentuk dan kode tidak ada sama-sama dijawab "Pesanan tidak ditemukan." Detail error Supabase dan jalur berkas hanya di log server.
- **Batas laju unggah:** `order_attempts` dengan `kind = 'proof'`, maksimal 10 per jam per IP dan jeda minimal 5 detik ("Terlalu sering mengirim. Coba lagi nanti.").
- **`getPaymentStatus(code)`:** hanya data non-pribadi: kode, status, total, metode bayar, apakah bukti terkirim, waktunya, dan jumlah unggah (untuk batas 3 kali). `uploadPaymentProof` yang sukses juga mengembalikan jumlah unggah terbaru. Tanpa nama, email, telepon, alamat, atau jalur berkas.
- **Batas body Server Action** dinaikkan ke `3mb` (`experimental.serverActions.bodySizeLimit` di `next.config.ts`) untuk gambar 2 MB ditambah overhead multipart; masih di bawah batas body fungsi Vercel 4,5 MB. Batas ini berlaku untuk semua Server Action, yang tetap memvalidasi isinya sendiri.

## 2. User story

Setiap fitur punya satu user story dan satu kriteria selesai yang bisa diuji.

**F1. Etalase dan menu**

- Sebagai pelanggan setia, saya mau melihat beranda, ulasan pelanggan, dan menu lengkap dengan foto, harga, dan status tersedia, supaya saya yakin dengan restorannya dan tahu apa yang bisa saya pesan sekarang.
- Selesai bila: menu habis tidak bisa ditambahkan ke keranjang, dan kelima halaman (Beranda, Tentang, Menu, Ulasan, Kontak) terbuka dengan baik di layar HP.

**F2. Keranjang dan checkout**

- Sebagai pelanggan setia, saya mau memesan tanpa membuat akun, supaya saya bisa memesan dalam hitungan menit.
- Selesai bila: total (item ditambah ongkir zona) benar dan pesanan tersimpan dengan kode unik.
- Status: panel keranjang (daftar item, ubah jumlah, hapus, subtotal, tombol "Lanjut ke Checkout") sudah dibangun bersama halaman Menu. Checkout berupa pop-up di atas panel keranjang (keputusan 2026-11-04), tanpa halaman /checkout: isian nama, email, nomor telepon, alamat, zona antar, dan catatan, lalu `createOrder` menyimpan pesanan dan layar sukses menampilkan kode pesanan serta total resmi dari server. Layar sukses memuat panel pembayaran F3.

**F3. Pembayaran manual**

- Sebagai pelanggan setia, saya mau melihat cara bayar dan mengunggah bukti transfer, supaya restoran tahu pesanan saya sudah dibayar.
- Selesai bila: bukti bayar (gambar maksimal 2 MB) tertaut ke pesanan yang benar.
- Status: panel pembayaran (`PaymentPanel`) tampil di layar sukses checkout: total, pilihan Transfer bank atau QRIS dengan data contoh, unggah bukti (gambar dikecilkan di browser sebelum dikirim), keadaan "Bukti bayar terkirim. Menunggu verifikasi admin." dan "Ganti bukti bayar" sampai 3 kali. Menutup pop-up tidak membatalkan pesanan; pelanggan melanjutkan pembayaran nanti lewat halaman lacak (F4, belum dibangun) dengan kode pesanan. Panel yang sama dipakai di halaman lacak. Rincian tampilan di DESIGN.md "Panel pembayaran".

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

**Keputusan 2026-11-04.** Pemilik proyek (Violin) memutuskan checkout berupa pop-up di panel keranjang, bukan halaman terpisah; folder rute `checkout/` tidak dipakai. Form checkout mengumpulkan nama, email, nomor telepon, dan alamat pengiriman (ditambah zona antar dan catatan). Tidak ada nomor kartu dan tidak ada pembayaran uang sungguhan; pembayaran tetap manual dengan rekening dan QRIS contoh (F3). Hal lain di daftar ini tetap di luar scope.

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