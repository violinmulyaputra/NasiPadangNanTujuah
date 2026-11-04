import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { DeliveryZone } from "@/types/order";

export const ZONES_CACHE_TAG = "delivery-zones";

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(ZONES_CACHE_TAG);

  const { data, error } = await createPublicClient()
    .from("delivery_zones")
    .select("code, name, fee")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error(`Gagal memuat zona: ${error.message}`);
  return data;
}
