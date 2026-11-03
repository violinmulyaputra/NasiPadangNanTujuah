import "server-only";
import { getIpHash } from "@/lib/ip-hash";
import { normalizeOrderCode } from "@/lib/order-code-format";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus, OrderTracking, PaymentMethod } from "@/types/order";

const HOUR_MS = 60 * 60 * 1000;
const TRACK_MAX_PER_HOUR = 60;
// Semua batas laju order_attempts memakai jendela 1 jam, jadi baris di atas 24 jam aman dihapus.
const ATTEMPT_RETENTION_MS = 24 * HOUR_MS;

// Data halaman lacak (F4) lewat service role. Kolom dipilih satu per satu: data pemesan
// (nama, email, telepon, alamat, catatan), jalur bukti bayar, dan id tidak pernah diambil.
// Tanpa "use cache": status harus selalu terbaru. null bila kode salah bentuk atau tidak ada.
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

  // Relasi many-to-one bisa diketik sebagai array oleh supabase-js; ambil satu nilainya.
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

// Dipanggil Proxy sebelum halaman /pesanan/[kode] dirender, supaya "tidak ditemukan"
// bisa dijawab dengan status HTTP 404 sungguhan (di dalam Suspense statusnya sudah 200).
// Kode harus sudah dinormalisasi. Batas laju dicek lebih dulu untuk SEMUA kode, jadi IP
// yang diblokir tidak bisa memakai jawaban apa pun untuk menebak. Yang dicatat hanya
// pencarian yang tidak menemukan pesanan: penyegaran otomatis halaman pesanan yang ada
// (tiap 30 detik) tidak menghabiskan kuota, menebak-nebak kode yang menghabiskannya.
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
  // Pembersihan oportunistik agar tabel tidak membengkak di free tier. Gagal tidak masalah.
  const { error: cleanupError } = await supabase
    .from("order_attempts")
    .delete()
    .lt("created_at", new Date(Date.now() - ATTEMPT_RETENTION_MS).toISOString());
  if (cleanupError) console.error("Gagal membersihkan order_attempts lama:", cleanupError);
  return "not_found";
}
