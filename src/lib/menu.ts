import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { MenuItem } from "@/types/menu";

export const MENU_CACHE_TAG = "menu-items";

export async function getMenuItems(): Promise<MenuItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(MENU_CACHE_TAG);

  const { data, error } = await createPublicClient()
    .from("menu_items")
    .select("id, slug, name, description, category, price, image_url, is_available, is_popular, sort_order")
    .order("sort_order");

  if (error) throw new Error(`Gagal memuat menu: ${error.message}`);
  return data as MenuItem[];
}
