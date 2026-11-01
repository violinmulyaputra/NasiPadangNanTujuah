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
- Tidak memakai miring (italic) pada judul atau aksen.
- Skala: judul hero `clamp(2.25rem, 6vw, 4.5rem)`; judul seksi `clamp(1.75rem, 4vw, 3rem)`; subjudul seksi 1rem sampai 1,25rem; isi 1rem.

## Tata letak
- Mobile-first. Hero: teks di atas, piring di bawah (di HP); dua kolom mulai `md`.
- Semua seksi dipusatkan, jarak vertikal antarseksi `py-16 md:py-24`.
- Navbar menempel di atas: logo kiri, tautan tengah (Tentang, Menu, Ulasan, Kontak), ikon keranjang kanan. Di HP tautan jadi menu lipat.

## Seksi dan komponen
1. **Navbar**: logo (SVG atau PNG transparan), 4 tautan, tombol keranjang yang membuka panel samping.
2. **Hero**: judul "Dengan beberapa kali ketukan, Nasi Padang Nan Tujuah siap diantarkan!" (kata "ketukan." dan "diantarkan!" berwarna brand), deskripsi, tombol "Pesan Sekarang" ke /menu, piring yang bisa diputar.
3. **Our Best Seller Menu**: carousel coverflow 3D dengan data menu `populer = true`. Kartu: foto, garis pemisah, nama, deskripsi singkat, tombol ke /menu.
4. **What Our Customers Say**: kartu testimoni berjalan (marquee). Data contoh fiktif berlabel "contoh".
5. **Visit Us!**: carousel tumpukan kartu foto suasana (kiri, dengan judul dan keterangan yang mengikuti foto), daftar alamat cabang (kanan).
6. **Footer**: logo dan nama, kalimat singkat, Quick Links, Contact, Follow Us (Facebook, X, Instagram, LinkedIn).

## Gerak
- Piring: bisa diputar dengan jari atau cursor, dan berputar mengikuti scroll ke bawah. Pakai Framer Motion.
- Semua animasi mati atau berkurang untuk `prefers-reduced-motion`.
- Gerak lewat `transform` dan `opacity`. Fade-in halus saat scroll diperbolehkan pada seksi di bawah hero (durasi singkat, sekitar 0,4 sampai 0,6 detik, tanpa menunda keterbacaan). Judul hero tidak menunggu animasi apa pun.
- Gerak yang diizinkan: piring yang berputar, carousel coverflow dan tumpukan kartu, dan marquee testimoni. Kartu samping carousel yang lebih redup adalah kedalaman visual yang statis, bukan animasi muncul.

## Panel keranjang
Panel samping dari kanan. Isi tahap ini hanya kerangka: judul "Keranjang Anda", keadaan kosong "Keranjang masih kosong", dan tombol "Lanjut Belanja" ke /menu. Isi keranjang sungguhan dikerjakan di tahap F2.

## Konten
- Bahasa Indonesia untuk semua teks tampilan, kecuali judul seksi yang sengaja berbahasa Inggris sesuai sketsa ("Our Best Seller Menu", "What Our Customers Say", "Visit Us!").
- Tidak ada foto orang asli atau angka yang dikarang. Ulasan dan rating adalah data contoh fiktif dan diberi label.
- Alamat, telepon, dan email adalah data contoh fiktif.

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
- **Carousel coverflow (Best Seller):** latar gelap, aksen emas, gradien overlay, tombol panah dengan blur (`backdrop-filter`), tag di kartu (isi dengan kategori menu, misalnya "#Ayam"), bayangan, dan transisi `all` pada tombol. Seksi ini akan tampil lebih gelap daripada seksi lain, dan itu disengaja.
- **Testimoni berjalan:** gradien lembut pada kartu, `border-t`, dan avatar shadcn bawaan. Avatar memakai inisial (tanpa foto orang).
- **Tumpukan kartu foto (Visit Us):** CSS bawaan komponen, termasuk transisi dan bayangannya.
- **Piring putar:** komponen buatan sendiri, tetap ikut seluruh larangan di atas.

Penyesuaian teks tetap berlaku di dalam komponen: bahasa Indonesia, tanpa em dash berlebihan, tanpa buzzword generik, tanpa emoji.
