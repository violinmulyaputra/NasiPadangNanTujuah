import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

// Hash IP pengirim untuk batas laju (ulasan dan pesanan). IP mentah tidak pernah disimpan.
// Salt bersama dari REVIEW_IP_SALT.
// Proxy memberi header permintaannya sendiri; selain itu dibaca lewat headers().
export async function getIpHash(given?: Headers): Promise<string> {
  const salt = process.env.REVIEW_IP_SALT;
  if (!salt) throw new Error("REVIEW_IP_SALT belum diisi");

  const h = given ?? (await headers());
  // Di Vercel, nilai pertama x-forwarded-for adalah IP klien.
  // Tanpa header (mis. dev lokal) semua permintaan berbagi satu kuota.
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
