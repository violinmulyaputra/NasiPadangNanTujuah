-- =============================================================================
-- TIDAK DIPAKAI LAGI (2026-11-04). Ulasan kini hanya dari pengunjung (form di /ulasan)
-- dan dimoderasi admin di /admin/ulasan. Isi lama disimpan sebagai arsip di dalam
-- komentar blok di bawah, jadi menjalankan file ini tidak menambah baris apa pun.
--
-- Membersihkan ulasan contoh yang dulu terlanjur diisi (opsional, jalankan manual):
--   delete from public.reviews where is_sample = true;
-- =============================================================================

/* ARSIP, JANGAN DIJALANKAN
-- =============================================================================
-- Data contoh ulasan: 6 testimoni fiktif dari seksi Testimoni beranda
-- (src/components/Testimonials.tsx), ditandai is_sample = true.
-- Komponen itu tidak punya rating, jadi rating dibuat bervariasi 4.5 dan 5.0.
--
-- Cara pakai: jalankan setelah schema-ulasan.sql. Aman dijalankan ulang:
-- baris contoh yang sudah ada (nama dan teks sama) tidak ditambah lagi.
-- =============================================================================

insert into public.reviews (author_name, rating, comment, is_sample, created_at)
select v.author_name, v.rating, v.comment, true, v.created_at
from (
  values
    ('Rina Aprilia',  5.0,
     'Paling suka rendangnya, empuk dan bumbunya berasa banget. Pas sampai juga masih hangat. Nasinya pas, nggak benyek.',
     timestamptz '2026-10-25 12:15:00+07'),
    ('Bagas Pratama', 4.5,
     'Awalnya kirain ayam popnya bakal hambar, ternyata gurih. Dicocol pake sambal oranyenya juga bikin tambah enak, pedasnya masih aman sih buat saya.',
     timestamptz '2026-10-26 19:40:00+07'),
    ('Dewi Lestari',  5.0,
     'Udang baladonya enak, ada manis-manisnya sedikit. Kentangnya juga empuk sampai ikut saya habisin. Bakal pesan lagi sih.',
     timestamptz '2026-10-28 13:05:00+07'),
    ('Fajar Nugroho', 4.5,
     'Ayam baladonya lumayan pedas buat saya, tapi malah bikin nambah nasi. Sambalnya banyak, nggak cuma di atas ayam.',
     timestamptz '2026-10-29 20:20:00+07'),
    ('Maya Sari',     5.0,
     'Habis makan ayam balado dilanjut minum es campur, beuh beneran cocok banget. Suka banget sama alpukat dan kelapa mudanya. Mantap banget bikin kenyang.',
     timestamptz '2026-10-31 12:50:00+07'),
    ('Hendra Wijaya', 4.5,
     'Pesan kakap balado buat makan di rumah. Dapet sambel banyak banget, ikannya juga gurih. Untung kemasannya rapat, jadi minyak sambalnya nggak bocor.',
     timestamptz '2026-11-02 18:30:00+07')
) as v (author_name, rating, comment, created_at)
where not exists (
  select 1 from public.reviews r
  where r.is_sample and r.author_name = v.author_name and r.comment = v.comment
);
*/
