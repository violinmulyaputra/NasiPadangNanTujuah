# DESIGN.md: Nasi Padang Nan Tujuah (Beranda)

Sumber kebenaran desain untuk landing page. Urutan prioritas jika ada konflik:
1. Sketsa wireframe pengguna (hanya susunan seksi dan isi, bukan gaya gambarnya).
2. Untuk tampilan dan gerak 4 komponen 21st.dev (carousel coverflow, testimoni berjalan, tumpukan kartu foto, dan acuan putaran piring), versi aslinya menang atas larangan di bagian "Jangan". Lihat "Pengecualian komponen 21st.dev".
3. File ini, lalu saran skill.

Dari komponen 21st.dev yang boleh diubah hanya: teks, data, gambar, bahasa, dan penyesuaian teknis (next/image, Tailwind v4, aksesibilitas). Tampilan, warna, efek, dan gerak bawaannya dipertahankan.

## Arah
Tampilan web restoran profesional: rapi, hangat, otentik Minangkabau, mudah dibaca di HP. Aksen merah brand dipakai pada kata kunci judul.

Sketsa wireframe pengguna hanya acuan susunan seksi dan isi. Gaya gambar tangannya TIDAK ditiru: tidak ada font tulisan tangan, garis buku bergaris, garis tepi tebal bergaya coretan, atau ilustrasi sketsa. Hasil akhir harus terlihat seperti situs jadi yang dibuat desainer profesional, dengan tipografi, jarak, dan foto yang tajam.

## Token (taruh di globals.css lewat @theme, jangan tulis warna langsung di komponen)
| Token | Nilai | Catatan |
| --- | --- | --- |
| --color-brand | #E1331C | merah dari sketsa; kata kunci judul, tombol utama, aksen |
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
- Di HP (di bawah `md`) judul Hero dan judul seksi sama ukurannya, yaitu token `--text-title-mobile` (`clamp(1.5rem, 6.4vw, 2.5rem)`, sekitar 24 px di layar 375 px, utilitas `text-title-mobile`). Judul Hero di HP mengalir alami di kolom kiri (sekitar 6 baris, `text-wrap: pretty`), mulai `md` empat baris lewat span block. Judul seksi dibuat lewat komponen `SectionHeading`, rata tengah dan boleh membungkus ke dua baris dengan `text-balance`, jadi seksi berikutnya ("What Our Customers Say?", "Visit Us!") otomatis memakai ukuran yang sama.

## Tata letak
- Mobile-first. Hero berdampingan di semua lebar: judul, paragraf, dan tombol di kolom kiri, piring di kanan, blok kiri sejajar vertikal di tengah piring. Hero memakai satu `h1` yang posisinya diatur lewat `grid-template-areas` (judul tidak digandakan).
- Hero di HP (di bawah `md`): seksi `py-12`. Kolom kiri sekitar 60 persen lebar layar dengan padding kiri 24 px: judul (ukuran sama dengan judul seksi, `--text-title-mobile`, mengalir alami), lalu paragraf 0,875rem berjarak 16 px, lalu tombol ringkas setinggi 40 px berjarak 24 px. Kolom kanan piring sekitar 48vw yang sekitar 20 persen diameternya terpotong di tepi kanan layar dan tidak menimpa teks. Pembungkus hero memakai `overflow-x: clip`.
- Hero mulai `md`: judul empat baris, paragraf, dan tombol di kolom kiri, piring di kanan tampil penuh, sejajar vertikal di tengah.
- Semua seksi dipusatkan, jarak vertikal antarseksi `py-16 md:py-24`.
- Navbar menempel di atas: logo kiri, tautan tengah (Tentang, Menu, Ulasan, Kontak), ikon keranjang kanan. Di HP tautan jadi menu lipat.

## Seksi dan komponen
1. **Navbar**: logo (SVG atau PNG transparan), 4 tautan, tombol keranjang yang membuka panel samping.
2. **Hero**: judul 4 baris mulai `md`: "Dengan beberapa" / "kali ketukan," / "Nasi Padang Nan Tujuah" / "siap diantarkan!"; di HP judul mengalir alami di kolom kiri (sekitar 6 baris). Kata "ketukan," dan "diantarkan!" berwarna brand solid, baris 3 tidak boleh terpotong. Deskripsi persis: "Sekarang, Anda bisa menikmati cita rasa khas Minangkabau yang otentik ala Nasi Padang Nan Tujuah di rumah Anda masing-masing." Tombol "Pesan Sekarang" ke /menu, piring yang bisa diputar.
3. **Our Best Seller Menu**: carousel coverflow 3D dengan data menu `is_popular = true`. Kartu: foto, garis pemisah, nama, deskripsi singkat, tombol ke /menu.
4. **What Our Customers Say?**: kartu testimoni berjalan (marquee), "Our Customers" berwarna brand, subjudul "Inilah pengalaman nyata dari tamu-tamu kami". Enam ulasan contoh fiktif (nama dan kota, tanpa rating), tanpa label di kartu; keterangan data contoh ada di footer. Avatar memakai inisial.
5. **Visit Us!**: carousel tumpukan kartu foto suasana (kiri mulai `md`, di atas pada HP) dengan judul dan keterangan di bawah kartu yang mengikuti foto teratas, diapit panah kiri dan kanan, tanpa penghitung halaman. Kolom kanan (di bawah pada HP, rata kiri dengan padding 24 px) berisi judul seksi "Visit Us!" ("Us!" berwarna brand, rata kiri sejajar nama kota, berjarak 24 px ke nama kota pertama) lalu daftar alamat cabang; mulai `md` kolom kanan sejajar vertikal di tengah kartu foto. Tidak ada judul seksi di tengah atas. Foto 354 x 472 px (3:4) di `public/images/suasana/`, urutan slide:
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
- Tombol panah carousel (Best Seller dan Visit Us) saat hover dan fokus keyboard berubah merah brand solid: latar `brand`, garis tepi `brand`, ikon putih (`paper`), dengan transisi warna sekitar 150 ms, tanpa opacity dan tanpa bayangan tambahan. Keadaan normal tidak berubah.

## Panel keranjang
Panel samping dari kanan. Isi tahap ini hanya kerangka: judul "Keranjang Anda", keadaan kosong "Keranjang masih kosong", dan tombol "Lanjut Belanja" ke /menu. Isi keranjang sungguhan dikerjakan di tahap F2.

## Konten
- Bahasa Indonesia untuk semua teks tampilan, kecuali judul seksi yang sengaja berbahasa Inggris sesuai sketsa ("Our Best Seller Menu", "What Our Customers Say?", "Visit Us!").
- Tidak ada foto orang asli atau angka yang dikarang. Ulasan dan rating adalah data contoh fiktif; keterangannya ada di catatan footer.
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
- Lucide icons di mana-mana. Ikon hanya yang dibutuhkan (keranjang, panah carousel, media sosial), dengan gaya garis yang seragam.
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
Larangan di atas tidak berlaku di dalam 4 komponen ini. Pertahankan gaya aslinya:
- **Carousel coverflow (Best Seller):** tema terang menggantikan latar gelap dan aksen emas aslinya. Latar seksi `paper` tanpa foto buram atau gradien. Semua kartu (termasuk kartu tengah) semi-transparan: `surface` dengan opasitas 45 persen dan blur latar, garis tepi tipis 1 px `line`, dan bayangan hangat lembut; foto piring diberi bayangan halus (`drop-shadow-plate`) tanpa latar tambahan. Kartu memakai aksen merah brand (garis pembatas, tombol "Lihat Menu" dengan hover `brand-dark`, titik halaman aktif). Judul menu `ink` (huruf besar), tag dan deskripsi `muted`. Kartu samping diredupkan dengan lapisan `paper` sekitar 55 persen. Tombol panah `paper` dengan garis `line` dan ikon `ink`, hover `brand`. Ukuran kartu tengah 350 x 525 px mulai `md`. Di HP kartu 290 x 480 px dengan foto lebih besar dan teks lebih kecil: foto persegi 240 px (sekitar 83 persen lebar kartu) di tengah bagian atas, judul menu 1,25rem, deskripsi 0,8125rem (paling banyak 4 baris, tidak miring), dan tombol "Lihat Menu" setinggi 40 px dengan teks 0,75rem. Kartu samping mengikuti proporsi yang sama. Efek yang dipertahankan: coverflow 3D (miring dan kedalaman), blur pada panah (`backdrop-filter`), bayangan, dan transisi bawaan.
- **Testimoni berjalan:** gradien lembut pada kartu, `border-t`, dan avatar shadcn bawaan. Avatar memakai inisial (tanpa foto orang).
- **Tumpukan kartu foto (Visit Us):** CSS bawaan komponen, termasuk transisi, bayangan, dan gerak lemparnya. Penyesuaian: foto lewat `next/image`, warna dan font lewat token, lebar kartu 260 px di HP dan 320 px mulai `md` (rasio 3:4), tanpa lanskap lukisan bawaan, tanpa putar otomatis, judul foto boleh membungkus, dan penghitung halaman dihapus (nomor foto tetap dibacakan pembaca layar).
- **Piring putar:** komponen buatan sendiri, tetap ikut seluruh larangan di atas.

Penyesuaian teks tetap berlaku di dalam komponen: bahasa Indonesia, tanpa em dash berlebihan, tanpa buzzword generik, tanpa emoji.
