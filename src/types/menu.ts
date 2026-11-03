// Nilai kolom category di tabel menu_items (lihat check di supabase/schema.sql).
export type MenuCategory = "Ayam" | "Sapi" | "Seafood" | "Sayuran" | "Minuman" | "Buah";

// Satu baris menu_items yang dipakai halaman Menu dan keranjang.
export type MenuItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_popular: boolean;
  sort_order: number;
};
