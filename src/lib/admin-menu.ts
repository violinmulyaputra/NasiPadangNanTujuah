import "server-only";
import { requireAdmin } from "@/lib/admin-auth";
import { first, type SearchParamValue } from "@/lib/admin-orders";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MenuItem } from "@/types/menu";

// Data pengelolaan menu (F5) lewat service role, tanpa cache: admin selalu melihat data terbaru.

export const MAX_MENU_QUERY = 40;
export type MenuFilter = "semua" | "habis" | "populer";
export type MenuListParams = { filter: MenuFilter; query: string };

export function parseMenuListParams(params: Record<string, SearchParamValue>): MenuListParams {
  const filter = first(params.filter);
  return {
    filter: filter === "habis" || filter === "populer" ? filter : "semua",
    query: first(params.q).replace(/\s+/g, " ").trim().slice(0, MAX_MENU_QUERY),
  };
}

export async function listMenuForAdmin({ filter, query }: MenuListParams): Promise<MenuItem[]> {
  await requireAdmin();
  const { data, error } = await createAdminClient()
    .from("menu_items")
    .select("id, slug, name, description, category, price, image_url, is_available, is_popular, sort_order")
    .order("sort_order");
  if (error) {
    console.error("Gagal membaca menu admin:", error);
    throw new Error("Menu gagal dimuat.");
  }
  // shortcut: filter di memori; cukup untuk sekitar 44 menu. Pindah ke query bila menu ratusan.
  const needle = query.toLocaleLowerCase("id-ID");
  return (data as MenuItem[]).filter(
    (item) =>
      (filter === "semua" || (filter === "habis" ? !item.is_available : item.is_popular)) &&
      (!needle || item.name.toLocaleLowerCase("id-ID").includes(needle)),
  );
}
