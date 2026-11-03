import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import type { MenuItem } from "@/types/menu";

// Tag cache daftar menu. Aksi admin (F5) yang mengubah menu_items memanggil
// updateTag(MENU_CACHE_TAG) agar halaman Menu langsung memuat data baru.
export const MENU_CACHE_TAG = "menu-items";

// Daftar menu publik, di-cache lintas permintaan ("use cache"), jadi ikut shell statis.
// Klien anon TANPA cookies (cookies() tidak boleh di dalam "use cache"), tetap patuh RLS.
export async function getMenuItems(): Promise<MenuItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(MENU_CACHE_TAG);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, slug, name, description, category, price, image_url, is_available, is_popular, sort_order")
    .order("sort_order");

  // Lempar agar hasil gagal tidak ikut di-cache berjam-jam.
  if (error) throw new Error(`Gagal memuat menu: ${error.message}`);
  return data as MenuItem[];
}
