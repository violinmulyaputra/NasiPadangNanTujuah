"use server";

import { randomBytes } from "node:crypto";
import { detectImageType } from "@/lib/image-type";
import { getIpHash } from "@/lib/ip-hash";
import { normalizeOrderCode } from "@/lib/order-code-format";
import { takeAttempt } from "@/lib/order-rate-limit";
import { MAX_PROOF_BYTES, MAX_PROOF_UPLOADS } from "@/lib/payment-info";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderPaymentStatus, OrderStatus, PaymentMethod, UploadProofResult } from "@/types/order";

const BUCKET = "payment-proofs";
const MAX_PER_HOUR = 10;
const MIN_GAP_MS = 5_000;

const NOT_FOUND = "Pesanan tidak ditemukan.";
const RATE_LIMIT_MESSAGE = "Terlalu sering mengirim. Coba lagi nanti.";
const GENERIC_ERROR = "Bukti bayar gagal diunggah. Coba lagi beberapa saat lagi.";

const fail = (message: string): UploadProofResult => ({ status: "error", message });

export async function uploadPaymentProof(formData: FormData): Promise<UploadProofResult> {
  const method = formData.get("method");
  if (method !== "transfer" && method !== "qris") return fail("Pilih metode pembayaran: transfer atau QRIS.");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Pilih gambar bukti bayar.");
  if (file.size > MAX_PROOF_BYTES) return fail("Ukuran gambar maksimal 2 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_PROOF_BYTES) return fail("Ukuran gambar maksimal 2 MB.");
  const type = detectImageType(bytes);
  if (!type) return fail("Bukti bayar harus berupa gambar JPEG, PNG, atau WebP.");

  try {
    const supabase = createAdminClient();
    const ipHash = await getIpHash();
    if (!(await takeAttempt(supabase, ipHash, "proof", { maxPerHour: MAX_PER_HOUR, minGapMs: MIN_GAP_MS })))
      return fail(RATE_LIMIT_MESSAGE);

    const code = normalizeOrderCode(formData.get("code"));
    if (!code) return fail(NOT_FOUND);
    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("id, status, payment_proof_path, proof_upload_count")
      .eq("code", code)
      .maybeSingle();
    if (findError) throw findError;
    if (!order) return fail(NOT_FOUND);
    if ((order.status as OrderStatus) !== "menunggu_bayar")
      return fail("Pesanan ini sudah tidak menunggu pembayaran, jadi bukti bayar tidak bisa diunggah lagi.");
    if (order.proof_upload_count >= MAX_PROOF_UPLOADS)
      return fail("Bukti bayar sudah diunggah 3 kali. Hubungi restoran lewat WhatsApp bila perlu mengganti.");

    const path = `${order.id}/${randomBytes(16).toString("hex")}.${type.ext}`;
    const bucket = supabase.storage.from(BUCKET);
    const { error: uploadError } = await bucket.upload(path, bytes, { contentType: type.mime, upsert: false });
    if (uploadError) throw uploadError;

    const uploadedAt = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({
        payment_method: method,
        payment_proof_path: path,
        proof_uploaded_at: uploadedAt,
        proof_upload_count: order.proof_upload_count + 1,
      })
      .eq("id", order.id)
      .eq("status", "menunggu_bayar")
      .eq("proof_upload_count", order.proof_upload_count)
      .select("id");
    if (updateError || updated.length === 0) {
      const { error: cleanupError } = await bucket.remove([path]);
      if (cleanupError) console.error("Gagal menghapus bukti yatim:", cleanupError);
      if (updateError) throw updateError;
      return fail("Bukti bayar gagal disimpan karena pesanan baru saja berubah. Muat ulang lalu coba lagi.");
    }

    if (order.payment_proof_path) {
      const { error: removeError } = await bucket.remove([order.payment_proof_path]);
      if (removeError) console.error("Gagal menghapus bukti lama:", removeError);
    }
    return { status: "success", uploadedAt, uploadCount: order.proof_upload_count + 1 };
  } catch (error) {
    console.error("Gagal mengunggah bukti bayar:", error);
    return fail(GENERIC_ERROR);
  }
}

export async function getPaymentStatus(rawCode: string): Promise<OrderPaymentStatus | null> {
  const code = normalizeOrderCode(rawCode);
  if (!code) return null;

  const { data, error } = await createAdminClient()
    .from("orders")
    .select("code, status, total, payment_method, proof_uploaded_at, proof_upload_count")
    .eq("code", code)
    .maybeSingle();
  if (error) {
    console.error("Gagal membaca status pembayaran:", error);
    throw new Error("Status pesanan gagal dimuat.");
  }
  if (!data) return null;

  return {
    code: data.code,
    status: data.status as OrderStatus,
    total: data.total,
    paymentMethod: data.payment_method as PaymentMethod | null,
    proofUploaded: data.proof_uploaded_at !== null,
    proofUploadedAt: data.proof_uploaded_at,
    proofUploadCount: data.proof_upload_count,
  };
}
