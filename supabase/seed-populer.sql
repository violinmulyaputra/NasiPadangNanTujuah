-- =============================================================================
-- Data menu populer untuk seksi "Our Best Seller Menu" di beranda.
-- Mengisi description dan image_url untuk 6 menu, lalu menjadikan es campur menu
-- populer menggantikan es teh manis. Hanya UPDATE: tanpa DELETE,
-- DROP, atau perubahan skema. Aman dijalankan ulang.
-- Cara pakai: tempel ke Supabase SQL Editor lalu jalankan, setelah schema.sql.
-- =============================================================================

update public.menu_items
set description = 'Potongan daging sapi berbalut bumbu pekat yang kaya rempah, dengan rasa gurih santan dan pedas hangat di setiap suapan.',
    image_url   = '/images/menu/rendang-daging-sapi.webp'
where slug = 'rendang-daging-sapi';

update public.menu_items
set description = 'Ayam lembut bercita rasa gurih ringan, disajikan bersama sambal oranye yang memberi sentuhan pedas pada setiap gigitan.',
    image_url   = '/images/menu/ayam-pop.webp'
where slug = 'ayam-pop';

update public.menu_items
set description = 'Udang dengan rasa manis alami berpadu dengan balado merah yang pedas gurih, dilengkapi potongan kentang yang lembut.',
    image_url   = '/images/menu/udang-balado.webp'
where slug = 'udang-balado';

update public.menu_items
set description = 'Potongan ayam gurih berselimut cabai merah tumbuk kasar, menghadirkan rasa pedas yang kuat dengan tekstur sambal yang terasa di setiap suapan.',
    image_url   = '/images/menu/ayam-balado.webp'
where slug = 'ayam-balado';

update public.menu_items
set description = 'Ikan goreng keemasan dengan balutan sambal merah melimpah, memadukan gurihnya ikan dengan sensasi pedas cabai.',
    image_url   = '/images/menu/ikan-kakap-balado.webp'
where slug = 'ikan-kakap-balado';

update public.menu_items
set description = 'Es serut dengan alpukat lembut, kelapa muda, dan butiran mutiara kenyal, dilengkapi siraman susu, cokelat, serta taburan kacang yang renyah.',
    image_url   = '/images/menu/es-campur.webp'
where slug = 'es-campur';

-- Menu populer: es campur masuk, es teh manis keluar (belum punya foto dan deskripsi).
update public.menu_items
set is_popular = true
where slug = 'es-campur';

update public.menu_items
set is_popular = false
where slug = 'es-teh-manis';
