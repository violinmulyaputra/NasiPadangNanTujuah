"use server";

import { revalidatePath } from "next/cache";
import { getIpHash } from "@/lib/ip-hash";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateReview } from "@/lib/review-validation";
import type { ReviewFormState } from "@/types/review";

const MAX_PER_HOUR = 3;
const MIN_GAP_MS = 20_000;
const RATE_LIMIT_MESSAGE = "Terlalu sering mengirim. Coba lagi nanti.";
const GENERIC_ERROR = "Ulasan gagal dikirim. Coba lagi beberapa saat lagi.";
const SUCCESS_MESSAGE = "Terima kasih! Ulasan Anda sudah terkirim.";

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  // Kolom jebakan: manusia tidak melihatnya, bot biasanya mengisinya.
  // Pura-pura sukses tanpa menyimpan apa pun.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "success", message: SUCCESS_MESSAGE, fieldErrors: {} };
  }

  const result = validateReview({
    author_name: formData.get("author_name"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!result.ok) {
    return {
      status: "error",
      message: "Periksa lagi isian yang ditandai.",
      fieldErrors: result.fieldErrors,
    };
  }

  try {
    const ipHash = await getIpHash();
    const supabase = createAdminClient();

    // shortcut: cek lalu tulis tidak atomik, kiriman serentak bisa lolos sedikit
    // di atas batas; pindah ke fungsi SQL bila spam serentak jadi masalah.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: attempts, error: attemptsError } = await supabase
      .from("review_attempts")
      .select("created_at")
      .eq("ip_hash", ipHash)
      .gte("created_at", since)
      .order("created_at", { ascending: false });
    if (attemptsError) throw attemptsError;

    const last = attempts[0] ? new Date(attempts[0].created_at).getTime() : 0;
    if (attempts.length >= MAX_PER_HOUR || Date.now() - last < MIN_GAP_MS) {
      return { status: "error", message: RATE_LIMIT_MESSAGE, fieldErrors: {} };
    }

    const { error: insertError } = await supabase.from("reviews").insert(result.data);
    if (insertError) throw insertError;

    // Dicatat hanya setelah ulasan tersimpan, jadi batas per jam = ulasan berhasil.
    const { error: logError } = await supabase
      .from("review_attempts")
      .insert({ ip_hash: ipHash });
    if (logError) console.error("Gagal mencatat percobaan ulasan:", logError);
  } catch (error) {
    // Detail error hanya di log server, tidak dikirim ke klien.
    console.error("Gagal menyimpan ulasan:", error);
    return { status: "error", message: GENERIC_ERROR, fieldErrors: {} };
  }

  // Data ulasan dibaca per permintaan (klien cookies), jadi cukup segarkan rute /ulasan.
  revalidatePath("/ulasan");
  return { status: "success", message: SUCCESS_MESSAGE, fieldErrors: {} };
}
