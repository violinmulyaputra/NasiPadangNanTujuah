import "server-only";
import { getIpHash } from "@/lib/ip-hash";
import { normalizeOrderCode } from "@/lib/order-code-format";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus, OrderTracking, PaymentMethod } from "@/types/order";

const HOUR_MS = 60 * 60 * 1000;
const TRACK_MAX_PER_HOUR = 60;
const ATTEMPT_RETENTION_MS = 24 * HOUR_MS;

export async function getOrderTracking(rawCode: string): Promise<OrderTracking | null> {
  const code = normalizeOrderCode(rawCode);
  if (!code) return null;

  const { data, error } = await createAdminClient()
    .from("orders")
    .select(
      "code, status, created_at, delivery_fee, subtotal, total, payment_method, proof_uploaded_at, proof_upload_count, delivery_zones(name), order_items(name, quantity, option_labels, line_total)",
    )
    .eq("code", code)
    .maybeSingle();
  if (error) {
    console.error("Gagal membaca pesanan untuk halaman lacak:", error);
    throw new Error("Status pesanan gagal dimuat.");
  }
  if (!data) return null;

  const zone = Array.isArray(data.delivery_zones) ? data.delivery_zones[0] : data.delivery_zones;
  return {
    code: data.code,
    status: data.status as OrderStatus,
    createdAt: data.created_at,
    zoneName: zone?.name ?? "",
    deliveryFee: data.delivery_fee,
    subtotal: data.subtotal,
    total: data.total,
    paymentMethod: data.payment_method as PaymentMethod | null,
    proofUploadedAt: data.proof_uploaded_at,
    proofUploadCount: data.proof_upload_count,
    items: data.order_items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      optionLabels: item.option_labels,
      lineTotal: item.line_total,
    })),
  };
}

export type TrackCheck = "found" | "not_found" | "rate_limited";

export async function checkTrackRequest(code: string, requestHeaders: Headers): Promise<TrackCheck> {
  const supabase = createAdminClient();
  const ipHash = await getIpHash(requestHeaders);
  const since = new Date(Date.now() - HOUR_MS).toISOString();

  const [attempts, order] = await Promise.all([
    supabase
      .from("order_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("kind", "track")
      .gte("created_at", since),
    supabase.from("orders").select("code").eq("code", code).maybeSingle(),
  ]);
  if (attempts.error) throw attempts.error;
  if (order.error) throw order.error;

  if ((attempts.count ?? 0) >= TRACK_MAX_PER_HOUR) return "rate_limited";
  if (order.data) return "found";

  const { error: logError } = await supabase.from("order_attempts").insert({ ip_hash: ipHash, kind: "track" });
  if (logError) throw logError;
  const { error: cleanupError } = await supabase
    .from("order_attempts")
    .delete()
    .lt("created_at", new Date(Date.now() - ATTEMPT_RETENTION_MS).toISOString());
  if (cleanupError) console.error("Gagal membersihkan order_attempts lama:", cleanupError);
  return "not_found";
}
