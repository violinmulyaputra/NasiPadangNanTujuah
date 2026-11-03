import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { DeliveryZone } from "@/types/order";

// Tag cache zona. Aksi admin yang mengubah delivery_zones memanggil updateTag(ZONES_CACHE_TAG).
export const ZONES_CACHE_TAG = "delivery-zones";

// Zona aktif untuk pilihan di pop-up checkout. Hanya tampilan: ongkir resmi dibaca ulang
// server di createOrder.
export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(ZONES_CACHE_TAG);

  const { data, error } = await createPublicClient()
    .from("delivery_zones")
    .select("code, name, fee")
    .eq("is_active", true)
    .order("sort_order");
  // Lempar agar hasil gagal tidak ikut di-cache.
  if (error) throw new Error(`Gagal memuat zona: ${error.message}`);
  return data;
}
