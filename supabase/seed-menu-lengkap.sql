-- =============================================================================
-- Data menu lengkap: deskripsi, harga, dan urutan tampil untuk 44 menu.
-- Sumber: docs/referensi/menu-44.md (harga per porsi, integer Rupiah, data contoh
-- restoran fiktif). Hanya UPDATE berdasarkan slug yang sudah ada di schema.sql:
-- tanpa DELETE, DROP, atau perubahan skema. slug, category, image_url,
-- is_popular, dan is_available tidak disentuh. Aman dijalankan ulang.
--
-- sort_order = indeks kategori x 100 + nomor urut dalam kategori:
--   Ayam 1, Sapi 2, Seafood 3, Sayuran 4, Minuman 5, Buah 6.
--
-- Cara pakai: tempel ke Supabase SQL Editor lalu jalankan, setelah schema.sql
-- dan seed-populer.sql. Catatan: deskripsi 6 menu populer dari seed-populer.sql
-- ikut diganti dengan teks dari menu-44.md.
-- =============================================================================

begin;

update public.menu_items
set description = 'Ayam goreng berbumbu gurih dengan bagian luar keemasan, daging lembut, dan taburan remah bumbu yang renyah.',
    price       = 25000,
    sort_order  = 101
where slug = 'ayam-goreng';

update public.menu_items
set description = 'Ayam panggang dengan bumbu rempah yang meresap, rasa gurih sedikit pedas, serta aroma panggang yang khas.',
    price       = 27000,
    sort_order  = 102
where slug = 'ayam-panggang';

update public.menu_items
set description = 'Ayam bertekstur lembut dengan cita rasa gurih ringan, disajikan bersama sambal oranye untuk tambahan rasa pedas.',
    price       = 27000,
    sort_order  = 103
where slug = 'ayam-pop';

update public.menu_items
set description = 'Ayam berbalut cabai merah tumbuk kasar dengan rasa pedas gurih dan sedikit manis dari bumbu bawang.',
    price       = 27000,
    sort_order  = 104
where slug = 'ayam-balado';

update public.menu_items
set description = 'Ayam dalam kuah santan berbumbu kunyit dengan rasa gurih, pedas ringan, dan aroma segar daun kemangi.',
    price       = 28000,
    sort_order  = 105
where slug = 'ayam-tutu-ruga';

update public.menu_items
set description = 'Ayam dengan balutan sambal cabai hijau yang gurih dan pedas, dilengkapi aroma bawang serta tekstur cabai tumbuk.',
    price       = 27000,
    sort_order  = 106
where slug = 'ayam-cabe-ijo';

update public.menu_items
set description = 'Telur rebus berbalut sambal merah yang pedas gurih, berpadu dengan kuning telur yang lembut dan padat.',
    price       = 10000,
    sort_order  = 107
where slug = 'telur-balado';

update public.menu_items
set description = 'Daging sapi dimasak perlahan dalam santan dan rempah hingga empuk, dengan bumbu pekat bercita rasa gurih dan pedas hangat.',
    price       = 32000,
    sort_order  = 201
where slug = 'rendang-daging-sapi';

update public.menu_items
set description = 'Otak sapi bertekstur lembut dalam kuah gulai santan yang gurih, kaya rempah, dan sedikit pedas.',
    price       = 30000,
    sort_order  = 202
where slug = 'gulai-otak';

update public.menu_items
set description = 'Potongan kecil daging sapi dalam kuah gulai berbumbu pekat, menghadirkan rasa gurih, pedas, dan aroma rempah yang kuat.',
    price       = 30000,
    sort_order  = 203
where slug = 'gulai-cincang-sapi';

update public.menu_items
set description = 'Kikil sapi kenyal dan lembut dengan cabai hijau serta bumbu bawang yang gurih, pedas, dan sedikit manis.',
    price       = 28000,
    sort_order  = 204
where slug = 'kikil-cabe-ijo';

update public.menu_items
set description = 'Kerupuk kulit yang disiram kuah gulai gurih berbumbu rempah, menghasilkan perpaduan tekstur renyah dan lembut saat kuah meresap.',
    price       = 15000,
    sort_order  = 205
where slug = 'jangek-siram';

update public.menu_items
set description = 'Irisan daging sapi yang dipukul hingga pipih, disajikan dengan sambal cabai merah yang pedas gurih dan sedikit berminyak.',
    price       = 32000,
    sort_order  = 206
where slug = 'dendeng-batoko';

update public.menu_items
set description = 'Irisan paru sapi goreng dengan rasa gurih berbumbu, bagian tepi sedikit garing, dan tekstur khas yang agak kenyal.',
    price       = 25000,
    sort_order  = 207
where slug = 'paru-sapi';

update public.menu_items
set description = 'Udang dengan rasa manis alami dalam kuah santan kuning yang gurih, sedikit pedas, dan harum rempah.',
    price       = 38000,
    sort_order  = 301
where slug = 'udang-gulai';

update public.menu_items
set description = 'Udang bakar berbalut bumbu gurih sedikit manis, dengan aroma panggang dan daging yang padat serta lembut.',
    price       = 40000,
    sort_order  = 302
where slug = 'udang-bakar';

update public.menu_items
set description = 'Udang dan potongan kentang berbalut sambal merah, memadukan manis alami udang dengan rasa pedas gurih.',
    price       = 38000,
    sort_order  = 303
where slug = 'udang-balado';

update public.menu_items
set description = 'Udang dan tofu lembut dalam saus merah berbumbu yang gurih, sedikit manis, dan pedas ringan.',
    price       = 35000,
    sort_order  = 304
where slug = 'udang-tofu';

update public.menu_items
set description = 'Udang pancet goreng dengan kulit garing dan daging padat, dibumbui bawang serta cabai untuk rasa gurih pedas.',
    price       = 48000,
    sort_order  = 305
where slug = 'udang-pancet-goreng';

update public.menu_items
set description = 'Ikan bilis kecil yang digoreng hingga renyah, dengan rasa asin gurih yang cocok sebagai pelengkap nasi hangat.',
    price       = 18000,
    sort_order  = 306
where slug = 'ikan-bilis-goreng';

update public.menu_items
set description = 'Ikan goreng berbalut sambal merah melimpah, memadukan rasa gurih ikan dengan pedas cabai dan bumbu bawang.',
    price       = 38000,
    sort_order  = 307
where slug = 'ikan-kakap-balado';

update public.menu_items
set description = 'Ikan nila goreng dengan sambal potong dari cabai, bawang merah, dan tomat, menghadirkan rasa pedas serta asam segar.',
    price       = 35000,
    sort_order  = 308
where slug = 'ikan-nila-dabu-dabu';

update public.menu_items
set description = 'Potongan tenggiri dalam kuah merah tanpa santan yang pedas dan asam segar, dengan aroma rempah yang meresap ke dalam ikan.',
    price       = 35000,
    sort_order  = 309
where slug = 'ikan-tenggiri-asam-padeh';

update public.menu_items
set description = 'Kepala kakap dalam kuah gulai santan kuning yang gurih, sedikit pedas, dan memiliki sentuhan asam yang menyegarkan.',
    price       = 95000,
    sort_order  = 310
where slug = 'kepala-kakap';

update public.menu_items
set description = 'Daun singkong yang ditumbuk halus dan dimasak dengan bumbu gurih, menghasilkan tekstur lembut dengan cita rasa khas daun singkong.',
    price       = 15000,
    sort_order  = 401
where slug = 'daun-ubi-tumbuk';

update public.menu_items
set description = 'Buncis yang ditumis bersama potongan ayam dan bawang, dengan rasa gurih sedikit manis serta tekstur buncis yang masih renyah.',
    price       = 18000,
    sort_order  = 402
where slug = 'cah-buncis-ayam';

update public.menu_items
set description = 'Nangka muda lembut dalam kuah santan berbumbu kuning yang gurih dan sedikit pedas, dilengkapi kacang panjang.',
    price       = 12000,
    sort_order  = 403
where slug = 'sayur-nangka';

update public.menu_items
set description = 'Daun singkong rebus dengan rasa alami yang ringan dan sedikit pahit, cocok dipadukan dengan kuah gulai atau sambal.',
    price       = 8000,
    sort_order  = 404
where slug = 'sayur-singkong-rebus';

update public.menu_items
set description = 'Irisan pare dengan rasa pahit khas yang berpadu dengan gurihnya bawang dan sedikit pedas dari cabai.',
    price       = 12000,
    sort_order  = 405
where slug = 'tumis-pare';

update public.menu_items
set description = 'Potongan timun segar dan selada dengan tekstur renyah serta rasa ringan untuk menyeimbangkan hidangan berbumbu kuat.',
    price       = 7000,
    sort_order  = 406
where slug = 'lalap-timun';

update public.menu_items
set description = 'Es kopyor dengan kuah manis beraroma kelapa dan sirup, menghadirkan tekstur lembut serta rasa dingin yang menyegarkan.',
    price       = 22000,
    sort_order  = 501
where slug = 'es-kopyor';

update public.menu_items
set description = 'Es krim lembut dengan alpukat, kelapa muda, dan butiran mutiara, dilengkapi cokelat serta kacang renyah untuk rasa manis yang kaya.',
    price       = 25000,
    sort_order  = 502
where slug = 'es-podeng';

update public.menu_items
set description = 'Es serut dengan aneka isian buah dan jeli, disiram kuah susu manis yang memadukan tekstur lembut, kenyal, dan segar.',
    price       = 24000,
    sort_order  = 503
where slug = 'es-campur';

update public.menu_items
set description = 'Jus alpukat bertekstur kental dan lembut dengan rasa gurih alami, dilengkapi susu serta cokelat yang manis.',
    price       = 22000,
    sort_order  = 504
where slug = 'jus-alpukat';

update public.menu_items
set description = 'Jus stroberi dengan perpaduan rasa manis dan asam segar serta aroma buah yang khas.',
    price       = 20000,
    sort_order  = 505
where slug = 'jus-strawberry';

update public.menu_items
set description = 'Minuman jeruk dingin dengan rasa manis dan asam yang seimbang, cocok sebagai pendamping hidangan gurih atau pedas.',
    price       = 15000,
    sort_order  = 506
where slug = 'es-jeruk';

update public.menu_items
set description = 'Perpaduan jeruk yang manis asam dengan kelapa muda lembut dan es, menghadirkan rasa segar di setiap tegukan.',
    price       = 22000,
    sort_order  = 507
where slug = 'es-kelapa-jeruk';

update public.menu_items
set description = 'Seduhan teh tanpa gula dengan aroma harum dan rasa sepat ringan, disajikan dingin untuk menyegarkan santapan.',
    price       = 6000,
    sort_order  = 508
where slug = 'es-teh-tawar';

update public.menu_items
set description = 'Seduhan teh harum dengan manis gula yang seimbang dan rasa sepat ringan, disajikan dengan es.',
    price       = 8000,
    sort_order  = 509
where slug = 'es-teh-manis';

update public.menu_items
set description = 'Air mineral dengan rasa netral dan segar untuk menemani berbagai pilihan hidangan.',
    price       = 6000,
    sort_order  = 510
where slug = 'air-mineral-botol-330-ml';

update public.menu_items
set description = 'Perpaduan semangka, melon, dan pepaya potong dengan rasa manis alami serta tekstur yang beragam dan menyegarkan.',
    price       = 18000,
    sort_order  = 601
where slug = 'buah-mix-potong';

update public.menu_items
set description = 'Potongan mangga matang dengan daging lembut, aroma harum, dan rasa manis dengan sedikit sentuhan asam.',
    price       = 18000,
    sort_order  = 602
where slug = 'buah-mangga-potong';

update public.menu_items
set description = 'Potongan semangka dengan rasa manis ringan, tekstur renyah, dan kandungan air yang menyegarkan.',
    price       = 15000,
    sort_order  = 603
where slug = 'buah-semangka-potong';

update public.menu_items
set description = 'Potongan melon dengan rasa manis lembut, aroma khas, dan daging buah yang segar serta berair.',
    price       = 15000,
    sort_order  = 604
where slug = 'buah-melon-potong';

commit;

-- Semua 44 menu di menu-44.md punya baris di database, jadi tidak ada blok
-- INSERT tambahan.

-- Cek setelah dijalankan: hasilnya harus 0 baris. Baris yang muncul berarti
-- menu di database yang tidak ikut diperbarui oleh berkas ini.
-- select slug, name, price, sort_order from public.menu_items where sort_order < 100;