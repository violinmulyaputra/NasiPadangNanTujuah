# DESIGN.md: Nasi Padang Nan Tujuah (Beranda)

Sumber kebenaran desain untuk landing page. Urutan prioritas jika ada konflik:
1. Sketsa wireframe pengguna (hanya susunan seksi dan isi, bukan gaya gambarnya).
2. Untuk tampilan dan gerak 5 komponen 21st.dev (carousel coverflow, testimoni berjalan, tumpukan kartu foto, galeri akordeon 7 Nilai, dan acuan putaran piring), versi aslinya menang atas larangan di bagian "Jangan". Lihat "Pengecualian komponen 21st.dev".
3. File ini, lalu saran skill.

Dari komponen 21st.dev yang boleh diubah hanya: teks, data, gambar, bahasa, dan penyesuaian teknis (next/image, Tailwind v4, aksesibilitas). Tampilan, warna, efek, dan gerak bawaannya dipertahankan.

## Arah
Tampilan web restoran profesional: rapi, hangat, otentik Minangkabau, mudah dibaca di HP. Aksen merah brand dipakai pada kata kunci judul.

Sketsa wireframe pengguna hanya acuan susunan seksi dan isi. Gaya gambar tangannya TIDAK ditiru: tidak ada font tulisan tangan, garis buku bergaris, garis tepi tebal bergaya coretan, atau ilustrasi sketsa. Hasil akhir harus terlihat seperti situs jadi yang dibuat desainer profesional, dengan tipografi, jarak, dan foto yang tajam.

## Token (taruh di globals.css lewat @theme, jangan tulis warna langsung di komponen)
| Token | Nilai | Catatan |
| --- | --- | --- |
| --color-brand | #E1331C | merah dari sketsa; kata kunci judul, tombol utama, aksen |
| --color-brand-strong | #CC2E19 | merah untuk teks kecil di atas paper (kontras 5,20:1) |
| --color-cream-glow | #E9DFCB | cahaya hover foto cerita Tentang (alpha 80 persen) |
| --color-card | #F9F6EF | latar kartu halaman Ulasan saja: kartu ringkasan, kartu form, dan kartu ulasan (termasuk kerangka Suspense dan offset ring fokus bintang). Kartu di seksi lain tetap memakai warnanya sendiri. Kontras: `ink` 16,91:1, `muted` 5,33:1, `brand-strong` 4,90:1, `brand` 4,15:1 (hanya bintang dan elemen besar, bukan teks kecil) |
| --color-ink | #161513 | teks utama, garis, ikon |
| --color-paper | #FFFDF9 | latar halaman (usulan, krem sangat terang) |
| --color-muted | #6B655E | teks pendukung |
| --color-line | #D9D4CB | garis pemisah, garis kartu samping |
| --radius-card | 18px | kartu carousel dan testimoni |
| --container | 1280px | lebar konten maksimum |

Kontras teks terhadap latar minimal 4,5:1. Merah brand tidak dipakai untuk teks kecil di atas krem tanpa dicek kontrasnya.

## Tipografi (usulan, ganti jika pengguna punya pilihan lain)
- Judul besar: Fraunces (serif hangat), bobot 600 sampai 700. Kata aksen berwarna brand.
- Teks dan UI: Plus Jakarta Sans.
- Muat lewat `next/font/google`, bukan tag link.
- Tidak memakai miring (italic) di seluruh antarmuka: judul, aksen, maupun teks isi, termasuk deskripsi kartu Best Seller. Miring 3D pada kartu samping coverflow adalah efek gerak, bukan gaya huruf, dan tetap dipakai.
- Skala: judul hero `clamp(2rem, 4vw, 3.25rem)` mulai `md` dengan line-height 1.15; judul seksi `clamp(1.75rem, 4vw, 3rem)` mulai `md`; subjudul seksi 1rem sampai 1,25rem; isi 1rem.
- Di HP (di bawah `md`) judul Hero dan judul seksi sama ukurannya, yaitu token `--text-title-mobile` (`clamp(1.5rem, 6.4vw, 2.5rem)`, sekitar 24 px di layar 375 px, utilitas `text-title-mobile`). Judul Hero di HP mengalir alami di kolom kiri (sekitar 6 baris, `text-wrap: pretty`), mulai `md` empat baris lewat span block. Judul seksi dibuat lewat komponen `SectionHeading`, rata tengah dan boleh membungkus ke dua baris dengan `text-balance`, jadi seksi berikutnya ("Apa Kata Mereka", "Kunjungi Kami!") otomatis memakai ukuran yang sama.

## Tata letak
- Mobile-first. Hero berdampingan di semua lebar: judul, paragraf, dan tombol di kolom kiri, piring di kanan, blok kiri sejajar vertikal di tengah piring. Hero memakai satu `h1` yang posisinya diatur lewat `grid-template-areas` (judul tidak digandakan).
- Hero di HP (di bawah `md`): seksi `py-12`. Kolom kiri sekitar 60 persen lebar layar dengan padding kiri 24 px: judul (ukuran sama dengan judul seksi, `--text-title-mobile`, mengalir alami), lalu paragraf 0,875rem berjarak 16 px, lalu tombol ringkas setinggi 40 px berjarak 24 px. Kolom kanan piring sekitar 48vw yang sekitar 20 persen diameternya terpotong di tepi kanan layar dan tidak menimpa teks. Pembungkus hero memakai `overflow-x: clip`.
- Hero mulai `md`: judul empat baris, paragraf, dan tombol di kolom kiri, piring di kanan tampil penuh, sejajar vertikal di tengah.
- Semua seksi dipusatkan, jarak vertikal antarseksi `py-16 md:py-24`.
- **Satu latar situs: `paper` (#FFFDF9).** Dipasang di `html` dan `body` (`globals.css`), termasuk area overscroll di HP, dan sebagai `theme-color` (export `viewport` di `layout.tsx`; meta tag tidak bisa membaca variabel CSS, jadi nilainya disalin dan harus diubah bersama token). Navbar, menu lipat HP, panel keranjang, dan footer juga `bg-paper`. Seksi tidak memberi latar sendiri (paling jauh `bg-paper`, sama dengan halaman); warna lain hanya untuk kartu (`card` di Ulasan dan Kontak, `surface` di seksi lain), tombol, dan overlay. Tanpa putih murni (`bg-white`, `#fff`) atau `bg-neutral/gray/slate/stone/zinc-*` sebagai latar; putih hanya untuk teks atau ikon di atas merah, lewat token `paper`.
- **Variabel shadcn:** proyek tidak memakai variabel bawaan shadcn (`--background`, `--card`, `--popover`, dan sejenisnya tidak ada di `globals.css`). Komponen shadcn (Avatar) memakai token proyek langsung (`bg-surface`). Jika komponen shadcn baru ditambahkan, variabelnya dipetakan ke token proyek (`--background` ke `--color-paper`, `--foreground` ke `--color-ink`, `--card` ke `--color-card`, `--border` ke `--color-line`, `--muted-foreground` ke `--color-muted`), bukan putih bawaan.
- **Pemudaran ke latar:** setiap gradasi atau mask yang berakhir ke latar memakai `paper` persis (`from-paper`, `to-paper`, atau mask ke transparan di atas latar `paper`), bukan putih atau krem lain: tepi marquee testimoni, scrim dan pemudaran bawah band Ulasan dan Kontak. Foto yang tepinya sudah memudar tetapi tidak persis `paper` (selisih lebih dari 2 per kanal) tidak diubah berkasnya; tepinya diberi mask tipis.
- Navbar menempel di atas: logo kiri, tautan tengah (Tentang, Menu, Ulasan, Kontak), ikon keranjang kanan. Di HP tautan jadi menu lipat.

## Seksi dan komponen
1. **Navbar**: logo (SVG atau PNG transparan), 4 tautan, tombol keranjang yang membuka panel samping.
2. **Hero**: judul 4 baris mulai `md`: "Dengan beberapa" / "kali ketukan," / "Nasi Padang Nan Tujuah" / "siap diantarkan!"; di HP judul mengalir alami di kolom kiri (sekitar 6 baris). Kata "ketukan," dan "diantarkan!" berwarna brand solid, baris 3 tidak boleh terpotong. Deskripsi persis: "Sekarang, Anda bisa menikmati cita rasa khas Minangkabau yang otentik ala Nasi Padang Nan Tujuah di rumah Anda masing-masing." Tombol "Pesan Sekarang" ke /menu, piring yang bisa diputar.
3. **Hidangan Andalan** (seksi Best Seller, "Andalan" berwarna brand): carousel coverflow 3D dengan data menu `is_popular = true`. Kartu: foto, garis pemisah, nama, deskripsi singkat, tombol ke /menu.
4. **Apa Kata Mereka** (seksi Testimoni): kartu testimoni berjalan (marquee), "Kata" berwarna brand, subjudul "Inilah pengalaman nyata dari tamu-tamu kami". Enam ulasan contoh fiktif (nama dan kota, tanpa rating), tanpa label di kartu; keterangan data contoh ada di footer. Avatar memakai inisial.
5. **Kunjungi Kami!** (seksi Visit Us): carousel tumpukan kartu foto suasana (kiri mulai `md`, di atas pada HP) dengan judul dan keterangan di bawah kartu yang mengikuti foto teratas, diapit panah kiri dan kanan, tanpa penghitung halaman. Kolom kanan (di bawah pada HP, rata kiri dengan padding 24 px) berisi judul seksi "Kunjungi Kami!" ("Kami!" berwarna brand, "Kunjungi" `ink`, rata kiri sejajar nama kota, berjarak 24 px ke nama kota pertama) lalu daftar alamat cabang; mulai `md` kolom kanan sejajar vertikal di tengah kartu foto. Tidak ada judul seksi di tengah atas. Foto 354 x 472 px (3:4) di `public/images/suasana/`, urutan slide:
   1. `restoran-minang.webp`: "Nuansa Minang yang Mewah". "Restoran dengan sentuhan arsitektur Minangkabau dan cahaya hangat yang siap menyambut Anda untuk menikmati kelezatan masakan Padang."
   2. `interior-kayu.webp`: "Nyaman di Setiap Sudut". "Interior bernuansa kayu dengan pencahayaan yang lembut, menghadirkan suasana hangat untuk bersantap bersama orang-orang terdekat."
   3. `pelayanan.webp`: "Disajikan dengan Sepenuh Hati". "Setiap hidangan ditata dengan cermat, membawa kehangatan pelayanan khas rumah makan Padang ke meja Anda."
   4. `beragam-lauk.webp`: "Beragam Lauk, Kaya Cita Rasa". "Dari rendang berbumbu pekat hingga gulai berkuah gurih, nikmati beragam hidangan khas Padang yang saling melengkapi dalam satu santapan."
   5. `rempah.webp`: "Cita Rasa Berawal dari Rempah". "Racikan cabai, kunyit, ketumbar, dan aneka rempah menghadirkan warna, aroma, serta rasa yang khas pada setiap masakan."

   Alamat cabang (data contoh fiktif), dikelompokkan per kota dengan garis pemisah `line`: Semarang (Jl. Ahmad Yani No. 115, Jl. Pandanaran No. 107) dan Yogyakarta (Jl. Jend. Sudirman No. 42, Jl. Kaliurang No. 5).
6. **Footer**: logo dan nama, kalimat singkat, Quick Links, Contact (hanya telepon dan email, tanpa alamat), Follow Us (Facebook, X, Instagram, LinkedIn).

## Gerak
- Piring: bisa diputar dengan jari atau cursor, dan berputar mengikuti scroll ke bawah. Pakai Framer Motion.
- Semua animasi mati atau berkurang untuk `prefers-reduced-motion`.
- Gerak lewat `transform` dan `opacity`. Fade-in halus saat scroll diperbolehkan pada seksi di bawah hero (durasi singkat, sekitar 0,4 sampai 0,6 detik, tanpa menunda keterbacaan). Judul hero tidak menunggu animasi apa pun.
- Gerak yang diizinkan: piring yang berputar, carousel coverflow dan tumpukan kartu, dan marquee testimoni. Kartu samping carousel yang lebih redup adalah kedalaman visual yang statis, bukan animasi muncul.
- **Muncul saat digulir di beranda** memakai `Reveal` (spesifikasi di Halaman Tentang): opacity dan geser `y` saja, 0,5 detik, delay bertingkat, sekali jalan, menghormati `prefers-reduced-motion`. Pembungkus diletakkan di dalam seksi, jadi latar seksi tidak ikut beranimasi, dan tidak membungkus per kartu atau per item. Tempat pemakaian:
  - Best Seller: judul seksi (index 0), lalu panggung coverflow beserta panah dan titik halaman (index 1). Pembungkus `relative`, panah sejajar tengah panggung (250 px di HP, 272 px mulai `md`) agar tidak bergeser saat transform berakhir.
  - Testimoni: judul dan teks pengantar (index 0), lalu marquee beserta gradien tepinya (index 1).
  - Visit Us: judul seksi (index 0), lalu tumpukan kartu foto dan daftar cabang di sampingnya (index 1).
  - Hero (judul, deskripsi, tombol, piring), navbar, dan footer tidak memakai `Reveal`. Judul hero adalah elemen LCP dan tampil tanpa menunggu animasi.
- Tombol panah carousel (Best Seller dan Visit Us) saat hover dan fokus keyboard berubah merah brand solid: latar `brand`, garis tepi `brand`, ikon putih (`paper`), dengan transisi warna sekitar 150 ms, tanpa opacity dan tanpa bayangan tambahan. Keadaan normal tidak berubah.

## Halaman Tentang
Rute `/tentang` (`src/app/(public)/tentang/page.tsx`), komponen server. Tautan "Tentang" di navbar, menu lipat HP, dan Quick Links footer menuju rute ini.
- **Judul:** satu `h1` rata tengah, dua baris: "Tentang" (`ink`) dan "Nasi Padang Nan Tujuah" (`brand`). Ukuran sama dengan judul Hero (`--text-title-mobile` di HP, `clamp(2rem, 4vw, 3.25rem)` mulai `md`). Judul tanpa animasi.
- **Dua baris cerita**, foto dan teks berdampingan di semua lebar dengan posisi foto bergantian: baris 1 foto kiri dan teks kanan, baris 2 teks kiri dan foto kanan. Di HP grid dua kolom, foto 4fr (sekitar 44 persen) dan teks 5fr, gap 16 px, teks 0,875rem. Mulai `md` tiap baris menjadi satu kelompok rapat di tengah kontainer: foto lebar tetap 320 px (`md`) dan 400 px (`lg`), teks maksimal 30rem, gap 48 px (`md`) dan 64 px (`lg`), teks 1,125rem (`md`) dan 1,25rem (`lg`). Foto tidak melebar mengikuti kolom. Teks rata kiri, `leading-relaxed`, warna `ink`, sejajar vertikal di tengah foto. Frasa kunci semibold berwarna `brand-strong`. Kedua baris memakai lebar trek yang sama, jadi tepi kiri dan kanannya sejajar di semua lebar.
- **Jarak:** seksi `py-16 md:py-24`, jarak antarbaris 48 px di HP dan 64 px mulai `md`, lebar mengikuti `--container`.
- **Foto:** sumber 3:2, 1200 x 800 px WebP, usahakan di bawah 150 KB, di `public/images/tentang/story-1.webp` dan `story-2.webp`. Tampil 3:2 di semua lebar layar, `object-cover` dengan posisi tengah, jadi objek utama sebaiknya berada di sekitar 70 persen bagian tengah foto. Sudut `--radius-card`. Foto baris 1 dimuat lebih dulu (`preload`), baris 2 lazy. Path dan rasio disimpan sebagai konstanta di atas `page.tsx`. Tidak memakai foto koki atau petugas (larangan foto orang asli berlaku).
- **Hover foto cerita:** foto membesar `scale(1.04)` dan di belakangnya muncul cahaya krem buram tanpa gradasi (bukan merah): lapisan `bg-cream-glow/80` (token `--color-cream-glow` #E9DFCB, krem hangat, dengan alpha 80 persen), `inset` -16 px, blur statis 32 px. Opacity lapisan 0 saat normal dan 1 saat hover; kepekatan diatur lewat alpha warna. Hasilnya samar tetapi nyata di atas `paper`. `--color-surface` atau alpha 50 persen hampir tidak terlihat karena scale 1.04 menutup sekitar 8 px tiap sisi foto, jadi yang tampak hanya ekor blur. Hanya transform dan opacity yang dianimasikan, 300 ms `ease-out`. Hanya pada perangkat dengan kursor (`hover` Tailwind v4 berlaku pada `(hover: hover)`), jadi tidak menempel setelah ketukan di HP. `prefers-reduced-motion`: tanpa scale, cahaya tetap muncul lewat fade opacity. Teks di sebelahnya tetap di atas cahaya. Murni CSS di komponen server. Lapisan cahaya adalah komponen bersama `src/components/HoverGlow.tsx` (induk wajib `group relative`), dipakai juga oleh kartu ulasan.
- **Token `--color-brand-strong` (#CC2E19):** merah untuk teks berukuran kecil, kontras 5,20:1 terhadap `paper` (brand #E1331C hanya 4,41:1). Judul besar tetap memakai `brand`.
- **Reveal** (`src/components/Reveal.tsx`, adaptasi Reveal 21st.dev, impor dari `framer-motion`): tanpa filter blur, hanya opacity dan geser `y: 24`, durasi 0,5 detik, `easeOut`, delay bertingkat `index * 0.12` detik, sekali jalan saat 15 persen elemen terlihat (seksi tinggi tetap terpicu di layar kecil). Di tiap baris foto `index 0` lalu paragraf `index 1`. `prefers-reduced-motion`: tampil langsung tanpa gerak. Tanpa JavaScript konten tetap terlihat (gaya `noscript`). Tidak dipakai pada judul.

### 7 Nilai
Seksi kedua halaman Tentang, di bawah dua baris cerita, `py-16 md:py-24`.
- **Susunan:** judul `h2` rata tengah "7 Nilai Nasi Padang Nan Tujuah" ("7 Nilai" `brand`, sisanya `ink`) lewat `SectionHeading`, lalu galeri akordeon (`src/components/ValuesAccordion.tsx`, data di `src/lib/about-values.ts`). Judul (index 0) dan galeri (index 1) dibungkus `Reveal`; modal dirender lewat portal ke `body`, di luar `Reveal`.
- **Galeri:** satu baris di tengah, lebar maksimal 960 px. Tinggi 300 px di bawah `sm`, 320 px di `sm`, 340 px di `md`, 380 px di `lg`. Kartu terbuka mengisi sisa lebar; strip tertutup 12 px di HP (kartu terbuka sekitar 230 px di layar 360 px), 24 px di `sm`, 40 px di `md`, 56 px di `lg`; gap 4 px di HP dan 8 px mulai `md`. Sudut `--radius-card`. Muat di lebar 360 px tanpa scroll horizontal. Kartu terbuka awal: nilai ke-4.
- **Panel teks** (hanya di kartu terbuka): di bagian bawah kartu, latar `paper` dengan opacity 15 persen (keputusan pemilik proyek) lewat variabel `--values-panel-opacity` di `@theme` (`bg-paper/(--values-panel-opacity)`), ditambah blur sangat tipis `backdrop-blur-[2px]` (pemilik proyek tidak ingin blur lebih kuat). Padding 12 px atas-bawah dan 14 px kiri-kanan di HP, 14 px dan 18 px mulai `md`. Isi: judul "{nomor}. {judul}" semibold `brand` (0,9375rem di HP, 1rem mulai `md`), sama persis dengan warna garis di bawahnya (keputusan pemilik proyek), garis merah `brand` 48 x 2 px, deskripsi `ink` `leading-snug` (0,8125rem di HP, 0,875rem mulai `md`); jarak antarelemen 6 px. Judul dan deskripsi diberi halo tipis `text-halo-paper` (utilitas di `globals.css`: `text-shadow` paper 70 persen, 0 0 6px dan 0 0 12px) agar huruf terpisah dari detail foto di atas panel yang hampir bening. Panel muncul dengan fade 250 ms setelah kartu hampir selesai melebar. Modal tidak berubah: judul `brand-strong`, tanpa halo, jarak 8 px.
- **Kontras panel (pengukuran foto, panel 15 persen):** sampel 40 persen bagian bawah tiap foto 1200 x 1200, warna rata-rata dan persentil 10 (tergelap) dicampur dengan `paper` 15 persen; halo dan blur tidak dihitung. Judul `brand` (#E1331C) hanya 4,41:1 bahkan di atas `paper` polos, dan gagal 4,5:1 di semua foto, baik pada warna rata-rata maupun persentil 10 (terendah 1,10:1). Deskripsi `ink` gagal pada persentil 10 di ketujuh foto, dan pada warna rata-rata di nilai 2, 3, 5, dan 7. Di bagian tergelap campuran panel lebih gelap daripada judul merah, jadi rasio p10 judul di beberapa foto lebih tinggi daripada rasio rata-ratanya; keduanya tetap di bawah 4,5:1. Halo `paper` membantu secara visual, tetapi tidak menutup selisih ini:

  | Nilai | Judul `brand` rata-rata / p10 | Deskripsi rata-rata / p10 | Area gelap di 40 persen bawah |
  | --- | --- | --- | --- |
  | 1. Bahan yang Baik | 1,53 / 1,55 | 6,22 / 2,62 | daging merah tua, terutama kiri |
  | 2. Rempah Pilihan | 1,10 / 2,83 | 3,72 / 1,44 | sekat kotak kayu dan rempah gelap, merata |
  | 3. Ketelatenan Memasak | 1,58 / 2,96 | 2,59 / 1,38 | latar dan baju hitam, merata, terberat kanan |
  | 4. Konsistensi Rasa | 2,05 / 1,20 | 8,35 / 3,39 | sedikit, kanan bawah |
  | 5. Kebersihan | 1,41 / 3,02 | 2,89 / 1,35 | rak bawah meja dan panci, tengah |
  | 6. Keramahan | 1,85 / 3,01 | 7,56 / 1,36 | celana hitam pelayan, tengah |
  | 7. Kebersamaan | 1,31 / 3,00 | 3,12 / 1,36 | meja dan tamu di sisi kanan |
- **Interaksi:** hover mouse (gerak kursor nyata) membuka kartu; klik atau ketuk strip membuka kartu itu; klik atau ketuk kartu terbuka membuka modal. Tiap item `<button>` dengan `aria-label` judul dan `aria-expanded`; fokus keyboard yang terlihat ikut membuka kartu, Enter atau Space membuka modal, ring fokus `brand`.
- **Modal:** overlay `bg-paper/70` dengan `backdrop-blur-lg`, foto 1:1 selebar `min(92vw, 560px)` dengan transisi `layoutId` dari kartu. Teks (gaya sama dengan panel) di kartu `paper` di bawah foto, tidak menumpuk di atas foto. Tombol tutup, Escape, atau klik overlay menutup; `role="dialog"`, `aria-modal`, scroll body terkunci, fokus kembali ke item pemicu.
- **Foto:** `public/images/tentang/value-1.webp` sampai `value-7.webp`, foto polos tanpa teks, sumber 1:1, 1200 x 1200 px, WebP maksimal 150 KB; di kartu tampil `object-cover`. Tepi bawah ketujuh foto memudar ke putih murni (selisih 6 dari `paper`), jadi foto di kartu akordeon diberi mask tipis `mask-b-from-96%` (4 persen terbawah memudar ke latar `paper`); foto di modal tanpa mask. Judul dan deskripsi selalu dari kode. 
- **Gerak:** lebar kartu bertransisi 300 ms `ease-in-out`. `prefers-reduced-motion`: tanpa transisi lebar, tanpa animasi layout, panel langsung tampil.

## Halaman Ulasan
Rute `/ulasan` (`src/app/(public)/ulasan/page.tsx`), komponen server. Tautan "Ulasan" di navbar, menu lipat HP, dan Quick Links footer menuju rute ini (lewat `src/lib/nav-links.ts`). Fitur kirim ulasan adalah perluasan F1 yang disetujui 2026-11-03 (lihat PRD). Lebar mengikuti `--container`, seksi `py-16 md:py-24`, jarak judul ke isi 32 px di HP dan 48 px mulai `md`.
- **Susunan:**
  1. Band atas: `h1` rata kiri "Ulasan Pelanggan" ("Ulasan" `ink`, "Pelanggan" `brand`), ukuran sama dengan judul halaman Tentang, tanpa animasi, lalu kartu ringkasan rating rata kiri, dengan foto hero di sisi kanan (lihat "Band atas").
  2. `h2` "Bagikan Pengalaman Anda!" ("Bagikan" `brand`) lewat `SectionHeading`, lalu kartu form.
  3. `h2` "Ulasan Terkini" ("Terkini" `brand`), lalu 10 ulasan terbaru dalam satu kolom selebar form.
- **Band atas** (seksi pertama, tanpa `py` seksi biasa): satu susunan di semua lebar layar. Foto menjadi latar penuh band, teks dan kartu menimpa foto.
  - `section` `relative overflow-hidden` selebar layar, tinggi minimal 380 px di HP dan 460 px mulai `md`; isi sejajar vertikal di tengah (padding 48 px atas-bawah di HP, 64 px mulai `md`), di dalam kontainer `--container`.
  - Foto `public/images/ulasan/hero.webp`: 16:9, 1920 x 1080, WebP, sekitar 54 KB. Absolut `inset-0`, `object-cover` posisi tengah, jadi di desktop terpotong atas-bawah dan di HP terpotong kiri-kanan. Foto memudar sendiri ke `paper` di tepi kiri dan bawah (sampel tepi: selisih 0 dari `paper`); tepi atas (selisih sekitar 26) dan kanan (sekitar 62) tidak memudar.
  - Lapisan di atas foto, berurutan: scrim `paper`, pemudaran bawah, lalu konten (`relative z-10`). Judul `h1` rata kiri (ukuran sama dengan judul halaman lain), lalu kartu ringkasan rata kiri berlatar `card` opaque, lebar maksimal 28rem dan maksimal 85 persen lebar di HP; jarak judul ke kartu 24 px di HP dan 48 px mulai `md`. Di HP tipografi kartu lebih kecil (padding 16 px, bintang 20 px, angka `text-2xl` dengan "(n Ulasan)" `text-lg`, predikat 0,875rem); mulai `md` padding 32 px, bintang 32 px, angka `text-4xl` dengan `text-3xl`, predikat 1rem.
  - **Scrim:** di HP gradien ke kanan `paper` 25 persen sampai 60 persen lebar lalu 15 persen di tepi kanan (hampir merata, karena teks mengisi lebar layar). Mulai `md` tanpa scrim: judul jatuh di sisi kiri foto yang sudah memudar sendiri, sehingga foto tetap terlihat penuh di sisi kanan. Nilai ini kepekatan terendah yang lolos pengukuran.
  - **Pengukuran kontras** (piksel foto asli dipetakan ke posisi kata judul sesuai `object-cover`, dicampur scrim; rata-rata warna latar dan persentil 10 terburuk; syarat `ink` 4,5:1, `brand` besar 3:1). Tanpa scrim di HP, "Pelanggan" hanya 2,62 sampai 2,69:1 (p10), jadi gagal. Hasil akhir:

    | Lebar | "Ulasan" `ink` rata-rata / p10 | "Pelanggan" `brand` rata-rata / p10 | Scrim |
    | --- | --- | --- | --- |
    | 360 | 15,13 / 14,14 | 3,29 / 3,01 | 25 persen |
    | 375 | 15,21 / 14,18 | 3,32 / 3,06 | 25 persen |
    | 414 | 15,42 / 14,40 | 3,36 / 3,07 | 25 persen |
    | 768 | 16,63 / 15,26 | 3,83 / 3,35 | tanpa |
    | 1280 | 17,11 / 15,86 | 3,73 / 3,27 | tanpa |
    | 1920 | 16,53 / 15,61 | 3,85 / 3,51 | tanpa |

    Teks di kartu berada di latar `card` opaque (kontras lihat token `--color-card`). Halo teks tidak diperlukan.
  - **Pemudaran bawah:** mulai `lg` foto terpotong atas-bawah sehingga tepi bawahnya yang sudah pudar ikut terpotong; lapisan `h-1/3` dari transparan ke `paper` di tepi bawah band menyatukannya dengan seksi berikutnya. Di bawah `lg` band menampilkan hampir seluruh tinggi foto, jadi tepi bawah sudah pudar sendiri dan tidak diberi pemudaran. Tanpa `mask-image`. Diukur di 360 sampai 1920 px: selisih warna di tepi bawah band paling besar 2 dari 255.
  - Foto: satu `next/image` dengan `fill`, `preload` (pengganti `priority` yang usang di Next.js 16), `sizes="100vw"`, `alt=""` dan `aria-hidden`. Foto, scrim, dan `h1` tanpa animasi dan tanpa `Reveal` agar tidak menunda LCP; kartu ringkasan tetap beranimasi sendiri. Tanpa scroll horizontal (teruji 360, 375, 414, 768, 1280, 1920 px).
  - Bagian di bawah band ("Bagikan Pengalaman Anda!" dan "Ulasan Terkini") tetap rata tengah di dalam kontainer dengan `py-16 md:py-24`.
- **Data:** ringkasan dari view `review_stats`, daftar dari tabel `reviews` (hanya `is_visible`), keduanya lewat `src/lib/reviews.ts`. Klien Supabase membaca cookies, jadi ringkasan dan daftar dirender per permintaan di dalam `<Suspense>` dengan kerangka `card` setinggi kontennya. Setelah kirim sukses, Server Action memanggil `revalidatePath("/ulasan")`, jadi ulasan baru langsung tampil paling atas.
- **Kartu ringkasan** (`src/components/ReviewSummaryCard.tsx`, client, adaptasi card-2 21st.dev): prop `align` (`"center"` bawaan, `"left"` di band atas; isi kartu ikut rata kiri tanpa mengubah animasi), lebar maksimal 28rem, latar `card`, garis `line`, sudut `--radius-card`. Isi: lima bintang, baris besar "{rating} ({jumlah} Ulasan)" (Fraunces), lalu "{Predikat}: Dinilai {rating} dari {jumlah} Ulasan." Predikat: 4,5 ke atas "Sangat Baik", 3,5 ke atas "Baik", 2,5 ke atas "Cukup", di bawahnya "Kurang". Rating dibulatkan satu desimal dan diformat id-ID (4,7). Tanpa ulasan: bintang kosong dan "Belum ada ulasan", tanpa angka. Perubahan dari aslinya: impor dari `framer-motion`, ikon `Star` lucide-react, token proyek menggantikan token shadcn (`bg-card` shadcn ke token proyek `card`, `text-foreground` ke `ink`, `text-muted-foreground` ke `muted`, bintang `yellow-400` ke `brand` karena Testimoni tidak punya warna bintang), `Intl` "id-ID", teks bahasa Indonesia, bintang mendukung setengah, angka besar `aria-hidden` (kalimat ringkasan statis yang dibacakan). Animasi asli dipertahankan (kartu naik 20 px dan memudar 0,5 detik, bintang muncul bertingkat 0,1 detik, angka menghitung naik 1,5 detik), tetapi dipicu sekali saat kartu masuk layar (`useInView`), bukan saat mount. HTML server sudah berisi angka final. `prefers-reduced-motion`: tampil langsung, angka final tanpa hitung naik. Tidak dibungkus `Reveal`.
- **Bintang** (`src/components/StarIcon.tsx`): `Star` lucide terisi, kosong `line`, isi `brand` yang dipotong lebar untuk setengah bintang. Dipakai ringkasan, input, dan kartu ulasan.
- **Kartu form:** latar `card`, garis `line`, sudut `--radius-card`, lebar maksimal 56rem, padding 16 px di HP dan 32 px mulai `md`, jarak antarkolom 24 px. Kolom: Nama (2 sampai 40 karakter), Rating, Ulasan Anda (textarea 10 sampai 500 karakter dengan penghitung "{n}/500 karakter"), dan kolom jebakan `website` tersembunyi (`aria-hidden`, `tabIndex -1`, `autoComplete off`). **Tanpa kolom email** (keputusan privasi: ulasan hanya nama, rating, dan teks). Label di atas kolom; input latar `paper`, garis `line`, sudut 12 px, teks 16 px di semua lebar (mencegah zoom iOS), placeholder `muted` ("Masukkan nama Anda", "Ceritakanlah pengalaman bersantap Anda..."), fokus garis dan ring `brand`. Tombol "Kirim" rata kanan: gaya tombol utama (`brand`, huruf `paper`, membulat penuh), hover `brand-dark` seperti tombol "Lihat Menu"; saat mengirim dinonaktifkan dengan teks "Mengirim...". Validasi di server (`useActionState` dengan `submitReview`): pesan per kolom di bawah kolom (`role="alert"`, `aria-describedby`, `aria-invalid`, warna `brand-strong`), pesan umum dan pesan sukses "Terima kasih! Ulasan Anda sudah terkirim." di area `aria-live`. Form direset setelah sukses; nilai tetap ada bila gagal (kolom dikendalikan state dan kiriman lewat `onSubmit`, karena React mengosongkan form otomatis pada `action`).
- **Input bintang** (`src/components/StarRatingInput.tsx`, client): lima bintang tanpa jarak, nilai kelipatan 0,5. Klik atau ketuk separuh kiri bintang berarti .5, separuh kanan berarti penuh; menyeret jari atau kursor mengubah nilai (`touch-action: pan-y`, geser vertikal tetap menggulir halaman). Pratinjau hover hanya untuk kursor, termasuk teks di sampingnya. Teks nilai "{n} dari 5" atau "Belum dipilih". Aksesibilitas: `role="slider"`, `aria-valuemin` 0.5, `aria-valuemax` 5, `aria-valuenow`, `aria-valuetext` "4,5 dari 5"; keyboard panah kiri dan kanan (juga atas dan bawah) 0,5, Home 0,5, End 5; ring fokus `brand`. `aria-valuestep` tidak dipakai karena bukan atribut ARIA yang sah. Bintang 36 px di HP, 32 px mulai `md`. Nilai dikirim lewat input hidden `rating`.
- **Kartu ulasan:** latar `card`, garis `line`, sudut `--radius-card`, padding 16 px di HP dan 24 px mulai `md`, jarak antarkartu 24 px. Isi: avatar lingkaran berisi inisial (Avatar yang sama dengan Testimoni, tanpa foto orang), nama semibold, tanggal id-ID panjang zona Asia/Jakarta ("2 November 2026"), bintang 20 px, lalu teks ulasan sebagai teks biasa dengan `whitespace-pre-line` dan `break-words`. Kosong: "Belum ada ulasan. Jadilah yang pertama!".
- **Hover kartu ulasan:** hanya perangkat dengan kursor (`hover: hover` dan `pointer: fine`). Kartu membesar `scale(1.02)` lewat utilitas bersama `hover-lift` (bukan 1.04 karena kartunya lebar) dan `HoverGlow` yang sama dengan foto Tentang muncul di belakangnya (300 ms `ease-out`). Daftar memakai `isolate` dan cahaya `-z-10`, jadi cahaya dilukis di bawah semua kartu dan hanya tampak di celah, tidak menutupi kartu di sebelahnya. `prefers-reduced-motion`: tanpa scale. Teruji tanpa scroll horizontal di 360, 375, 768, dan 1280 px.
- **Reveal:** `h2` "Bagikan..." (index 0) dan kartu form (index 1); `h2` "Ulasan Terkini" (index 0) lalu tiap kartu ulasan dengan index `min(urutan + 1, 3)`. `h1` dan kartu ringkasan tanpa `Reveal`.
- **Moderasi:** ulasan tampil langsung. Moderasi dikerjakan nanti di dashboard admin (F5) dengan menyembunyikan ulasan (`is_visible = false`); ulasan tersembunyi tidak ikut daftar maupun ringkasan karena RLS.

## Halaman Kontak
Rute `/kontak` (`src/app/(public)/kontak/page.tsx`), komponen server. Tautan "Kontak" di navbar, menu lipat HP, dan Quick Links footer lewat `src/lib/nav-links.ts`; bagian Contact footer tidak berubah. Tanpa formulir kontak, tanpa peta, tanpa WhatsApp API.
- **Band judul** (seksi pertama, cara yang sama dengan band Ulasan): `section` `relative overflow-hidden` selebar layar, tinggi minimal 240 px di HP dan 320 px mulai `md`, isi sejajar vertikal di tengah di dalam kontainer `--container`.
  - Foto `public/images/kontak/hero.webp`: 3:1, 1920 x 640, WebP, sekitar 40 KB (meja makan dengan mawar merah). Absolut `inset-0`, `object-cover` posisi tengah atas. Foto memudar sendiri ke krem di sisi kanan dan bawah (tepi bawah selisih paling besar 10 dari `paper`, kanan 4), tetapi band pendek memotong tepi bawahnya, jadi lapisan `h-1/3` dari transparan ke `paper` di tepi bawah band (semua lebar) menyatukannya dengan seksi kartu tanpa garis batas.
  - Judul `h1` "Hubungi Kami" ("Hubungi" `brand`, "Kami" `ink`) rata kanan di semua lebar, ukuran sama dengan judul halaman lain; di bawahnya "Hubungi Nasi Padang Nan Tujuah sesuai kebutuhan Anda." rata kanan, `ink`, 1rem di HP dan 1,125rem mulai `md`, jarak 12 px. Foto, scrim, `h1`, dan subjudul tanpa animasi (tanpa `Reveal`). Foto: `next/image` `fill`, `preload` (pengganti `priority`), `sizes="100vw"`, `alt=""`, `aria-hidden`.
  - **Scrim** `paper` di antara foto dan teks: di HP rata 45 persen (teks selebar layar); mulai `md` gradien ke kanan 0 persen di tepi kiri naik ke 30 persen di tengah lalu tetap 30 persen, jadi sisi kiri foto tetap jelas. Halo teks tidak diperlukan.
  - **Pengukuran kontras** (piksel foto asli dipetakan ke kotak kata sesuai `object-cover` posisi atas, dicampur scrim dan pemudaran bawah; rata-rata / persentil 10 terburuk; syarat `ink` 4,5:1, `brand` besar 3:1). Yang menentukan hanya "Hubungi". Foto diganti (1920 x 640) setelah pengukuran pertama, jadi diukur ulang: scrim lama (30 persen HP, 20 persen mulai `md`) gagal di 360 sampai 414 px (p10 2,74 sampai 2,81:1) dan 1920 px (2,92:1). Kepekatan terendah yang lolos per lebar: 45 persen (360), 40 persen (375, 414), 20 persen (768 sampai 1280), 25 persen (1920, tepat 3,00:1, jadi dipakai 30 persen agar ada cadangan). Hasil akhir:

    | Lebar | "Hubungi" `brand` | "Kami" `ink` | Subjudul `ink` |
    | --- | --- | --- | --- |
    | 360 | 3,33 / 3,06 | 14,58 / 13,67 | 14,76 / 13,34 |
    | 375 | 3,35 / 3,10 | 14,71 / 13,71 | 14,82 / 13,41 |
    | 414 | 3,36 / 3,11 | 15,00 / 14,23 | 14,60 / 12,97 |
    | 768 | 3,62 / 3,24 | 15,76 / 15,39 | 14,40 / 12,87 |
    | 1024 | 3,74 / 3,50 | 16,73 / 16,00 | 15,23 / 13,78 |
    | 1280 | 3,60 / 3,32 | 16,73 / 15,83 | 15,71 / 13,87 |
    | 1920 | 3,27 / 3,09 | 14,48 / 13,55 | 13,38 / 12,11 |
- **Kartu** (seksi `py-16 md:py-24`, lebar `--container`): grid 1 kolom di bawah `lg` (lebar maksimal 36rem, di tengah) dan 3 kolom sama lebar mulai `lg`, jarak kolom 32 px, jarak baris 48 px (ruang ikon), tinggi kartu sama. Kartu `SpotlightCard`: latar `card`, garis 1 px `line`, sudut `--radius-card`, padding 24 px (atas 40 px di HP, 48 px mulai `md`), tidak `overflow-hidden`.
  - Ikon lingkaran `brand` 48 px (56 px mulai `md`) berisi ikon lucide `paper` 24 px (`MessagesSquare`, `Users`, `Package`), `aria-hidden`, menimpa tepi atas kartu (`-translate-y-1/2`), sejajar padding kiri.
  - Isi berurutan: `h2` semibold `brand-strong` 1,0625rem (1,125rem mulai `md`), `leading-snug` (kontras di atas `card` 4,90:1); deskripsi 0,9375rem `ink` `leading-relaxed`; garis pendek 56 x 1 px `ink`; kota sebagai `h3` semibold ("Semarang", "Yogyakarta"); tiap cabang dalam `<address>` `not-italic` (alamat, lalu "Telepon: ..."), jarak antarcabang 12 px; garis pendek kedua; label jam semibold dan isi jam. Semua rata kiri, `ink`, minimal 0,875rem.
  - **Data contoh** di `src/lib/contact-info.ts` (alamat, telepon, jam fiktif). Nomor telepon teks biasa, **bukan tautan `tel:`**, karena nomor contoh bisa milik orang sungguhan.
  - **Hover membesar:** sama dengan kartu Ulasan Terkini lewat utilitas bersama `hover-lift` (`globals.css`): `scale` 1.02, transisi 300 ms `ease-out`, hanya perangkat `hover: hover` dan `pointer: fine` (tidak menempel setelah ketukan), `prefers-reduced-motion`: tanpa scale. Tanpa halo krem; garis tepi merah tetap. Scale dipasang pada kartu di dalam pembungkus `Reveal`, jadi tidak bentrok dengan transform `Reveal`; ikon ikut membesar bersama kartu. Kartu yang di-hover naik `z-10` di dalam grid `isolate` (tidak menimpa navbar). Teruji tanpa scroll horizontal pada kartu terluar di 360, 768, 1024, 1280, dan 1920 px.
  - **Reveal:** tiap kartu dengan index 0, 1, 2. Posisi kursor dihitung relatif ke kartu dan dibagi skala tampilnya, jadi geser `Reveal` dan scale hover tidak memengaruhinya.
  - Teruji di 360, 375, 414, 768, 1024, 1280, 1920 px: tanpa scroll horizontal, teks dan ikon tidak terpotong, tinggi kartu sama mulai `lg`.

## Panel keranjang
Panel samping dari kanan. Isi tahap ini hanya kerangka: judul "Keranjang Anda", keadaan kosong "Keranjang masih kosong", dan tombol "Lanjut Belanja" ke /menu. Isi keranjang sungguhan dikerjakan di tahap F2.

## Konten
- Bahasa Indonesia untuk semua teks tampilan, termasuk judul seksi beranda ("Hidangan Andalan", "Apa Kata Mereka", "Kunjungi Kami!").
- Tidak ada foto orang asli atau angka yang dikarang. Ulasan dan rating di beranda adalah data contoh fiktif; keterangannya ada di catatan footer. Halaman Ulasan menampilkan ulasan kiriman pengunjung ditambah data contoh (`is_sample`).
- Pengecualian foto orang: foto hero Halaman Ulasan (`public/images/ulasan/hero.webp`) memuat tangan orang tanpa wajah dan dipakai atas keputusan pemilik proyek. Sumber dan lisensi foto ini harus dipastikan sebelum situs dipublikasikan.
- Foto hero Halaman Kontak (`public/images/kontak/hero.webp`) memuat tepi bawah layar TV (teks berjalan, tanpa orang) di pojok kanan atas. Sumber dan lisensi foto ini juga harus dipastikan sebelum situs dipublikasikan.
- Alamat cabang, telepon, dan email adalah data contoh fiktif.

## Aset (di folder public/images/)
`logo/` (SVG atau PNG transparan), `hero/nasi-padang.webp` (di bawah 200 KB), `menu/<slug>.webp`, `suasana/`. Gambar lewat `next/image`; gambar hero memakai `priority`.

## Performa
Mengikuti PRD: LCP maksimal 2,5 detik, Lighthouse mobile minimal 90.

## Jangan (larangan desain)
Warna dan tipografi
- Gradien ungu-ke-biru, dan gradien apa pun pada teks judul hero. Kata aksen berwarna merah brand solid.
- Grain atau noise di atas gradien.
- Mode gelap berkontras rendah. MVP hanya mode terang.
- Font Inter di mana-mana. Pasangan font Space Grotesk dengan Instrument Serif. Teks serif miring (italic) sebagai aksen.
- Warna atau font ditulis langsung di komponen (selalu lewat token).

Kartu dan ikon
- Kartu dengan border berwarna. Kartu memakai garis netral `--color-line`.
- Glassmorphism (blur latar, kartu tembus pandang) di luar komponen 21st.dev.
- Kartu di dalam kartu.
- Tiga kotak ikon berjajar sebagai pengisi seksi.
- Lucide icons di mana-mana. Ikon hanya yang dibutuhkan (keranjang, panah carousel, media sosial), dengan gaya garis yang seragam. Pengecualian: ikon `Star` lucide-react untuk bintang rating di Halaman Ulasan.
- Komponen shadcn yang dipakai apa adanya. Setiap komponen shadcn harus disesuaikan dengan token dan bentuk di file ini.

Judul dan teks
- Emoji di judul atau di mana pun dalam teks tampilan.
- Badge atau label kecil di atas judul seksi atau judul hero.
- Tanda hubung panjang (em dash) berlebihan dalam teks. Pakai koma atau titik.
- Teks generik penuh kata kunci kosong. Setiap kalimat harus spesifik tentang makanan, rasa, atau layanan restoran ini.

Gerak dan interaksi
- Berkas cahaya atau elemen yang mengikuti cursor.
- Tombol yang memudar (opacity) saat di-hover. Umpan balik hover lewat perubahan warna solid, garis bawah, atau pergeseran kecil.

Konsistensi
- Jarak yang tidak konsisten. Pakai skala 4 px: 4, 8, 12, 16, 24, 32, 48, 64, 96. Jarak antarseksi sama di semua seksi.
- Menambah seksi atau fitur di luar daftar di atas.
- Memakai teks, gambar, atau nama dari situs referensi (Bites) apa adanya.

## Pengecualian komponen 21st.dev
Larangan di atas tidak berlaku di dalam 6 komponen ini. Pertahankan gaya aslinya:
- **Kartu spotlight (Halaman Kontak, `src/components/SpotlightCard.tsx`):** pengecualian larangan "elemen yang mengikuti cursor", "kartu dengan border berwarna", dan "lucide di mana-mana" (ikon kartu). Yang dipertahankan hanya garis tepi yang menyala mengikuti kursor: `::before` (kelas `.spotlight-card` di `globals.css`) berisi `radial-gradient` 200 px dari `brand` ke transparan, berpusat di `--mx`/`--my`, dipotong menjadi garis tepi 1 px dengan mask (`padding-box` lawan `border-box`, `mask-composite: exclude` dan `-webkit-mask-composite: xor`). Warna merah brand tetap, bukan hue yang berubah. Muncul (opacity 0 ke 1, 200 ms) hanya saat kursor di atas kartu dan hanya di perangkat `hover: hover` dan `pointer: fine`; `onPointerMove` di kartu hanya untuk `pointerType` mouse. Gradasi di efek ini diperbolehkan (larangan gradasi hanya untuk judul). Dibuang dari aslinya: halo buram di luar kartu, blur latar 5 px, bayangan hitam, ukuran dan rasio tetap (3:4, `sizeMap`), peta `glowColor`, `background-attachment: fixed`, `touch-action: none` (scroll HP tidak terhalang, teruji), tag `<style>` inline, dan listener `pointermove` global per kartu. `prefers-reduced-motion`: tanpa transisi opacity.
- **Carousel coverflow (Best Seller):** tema terang menggantikan latar gelap dan aksen emas aslinya. Latar seksi `paper` tanpa foto buram atau gradien. Semua kartu (termasuk kartu tengah) semi-transparan: `surface` dengan opasitas 45 persen dan blur latar, garis tepi tipis 1 px `line`, dan bayangan hangat lembut; foto piring diberi bayangan halus (`drop-shadow-plate`) tanpa latar tambahan. Kartu memakai aksen merah brand (garis pembatas, tombol "Lihat Menu" dengan hover `brand-dark`, titik halaman aktif). Judul menu `ink` (huruf besar), tag dan deskripsi `muted`. Kartu samping diredupkan dengan lapisan `paper` sekitar 55 persen. Tombol panah `paper` dengan garis `line` dan ikon `ink`, hover `brand`. Ukuran kartu tengah 350 x 525 px mulai `md`. Di HP kartu 290 x 480 px dengan foto lebih besar dan teks lebih kecil: foto persegi 240 px (sekitar 83 persen lebar kartu) di tengah bagian atas, judul menu 1,25rem, deskripsi 0,8125rem (paling banyak 4 baris, tidak miring), dan tombol "Lihat Menu" setinggi 40 px dengan teks 0,75rem. Kartu samping mengikuti proporsi yang sama. Efek yang dipertahankan: coverflow 3D (miring dan kedalaman), blur pada panah (`backdrop-filter`), bayangan, dan transisi bawaan.
- **Testimoni berjalan:** gradien lembut pada kartu, `border-t`, dan avatar shadcn bawaan. Avatar memakai inisial (tanpa foto orang).
- **Tumpukan kartu foto (Visit Us):** CSS bawaan komponen, termasuk transisi, bayangan, dan gerak lemparnya. Penyesuaian: foto lewat `next/image`, warna dan font lewat token, lebar kartu 260 px di HP dan 320 px mulai `md` (rasio 3:4), tanpa lanskap lukisan bawaan, tanpa putar otomatis, judul foto boleh membungkus, dan penghitung halaman dihapus (nomor foto tetap dibacakan pembaca layar).
- **Galeri akordeon 7 Nilai (gallery-modal-accordion):** transisi lebar kartu 300 ms (pengecualian aturan gerak lewat `transform` dan `opacity`), panel teks semi-transparan dengan `backdrop-blur-[2px]` dan overlay modal dengan `backdrop-blur-lg` (pengecualian larangan glassmorphism), serta animasi layout `layoutId` dari kartu ke modal. Penyesuaian: impor dari `framer-motion`, gambar lewat `next/image`, warna dan font lewat token, tanpa kelas `dark:`.
- **Piring putar:** komponen buatan sendiri, tetap ikut seluruh larangan di atas.

Penyesuaian teks tetap berlaku di dalam komponen: bahasa Indonesia, tanpa em dash berlebihan, tanpa buzzword generik, tanpa emoji.
