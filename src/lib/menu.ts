import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { MenuItem } from "@/types/menu";

// Tag cache daftar menu. Aksi admin (F5) yang mengubah menu_items memanggil
// updateTag(MENU_CACHE_TAG) agar halaman Menu langsung memuat data baru.
export const MENU_CACHE_TAG = "menu-items";

// Daftar menu publik, di-cache lintas permintaan ("use cache"), jadi ikut shell statis.
// Klien anon tanpa cookies (createPublicClient), tetap patuh RLS.
export async function getMenuItems(): Promise<MenuItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(MENU_CACHE_TAG);

  const { data, error } = await createPublicClient()
    .from("menu_items")
    .select("id, slug, name, description, category, price, image_url, is_available, is_popular, sort_order")
    .order("sort_order");

  // Lempar agar hasil gagal tidak ikut di-cache berjam-jam.
  if (error) throw new Error(`Gagal memuat menu: ${error.message}`);
  return data as MenuItem[];
}
