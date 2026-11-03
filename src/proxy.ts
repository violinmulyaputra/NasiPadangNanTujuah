import { NextResponse, type NextRequest } from "next/server";
import { normalizeOrderCode } from "@/lib/order-code-format";
import { checkTrackRequest, type TrackCheck } from "@/lib/orders";

export const config = { matcher: "/pesanan/:kode" };

// Halaman lacak (F4) memuat data di dalam Suspense, dan respons streaming selalu mulai
// dengan status 200. Supaya kode yang tidak ada dijawab 404 (dan batas laju 429), kode
// dicek di sini sebelum halaman dirender. Yang gagal di-rewrite ke /pesanan (form yang
// sama) dengan pesan; URL di browser tetap.
export async function proxy(request: NextRequest) {
  // Server Action (POST, mis. unggah bukti bayar) tidak perlu cek ulang.
  if (request.method !== "GET" && request.method !== "HEAD") return;

  // Tanpa decode: kode yang sah hanya huruf, angka, dan "-", jadi %xx otomatis salah bentuk.
  const raw = request.nextUrl.pathname.slice("/pesanan/".length);
  const code = normalizeOrderCode(raw);

  // "npt-7kq2xh9m" -> /pesanan/NPT-7KQ2XH9M
  if (code && code !== raw) {
    const url = request.nextUrl.clone();
    url.pathname = `/pesanan/${code}`;
    return NextResponse.redirect(url);
  }

  let result: TrackCheck = "not_found"; // salah bentuk: tanpa query dan tidak dihitung
  if (code) {
    try {
      result = await checkTrackRequest(code, request.headers);
    } catch (error) {
      // Database bermasalah: biarkan halaman yang menampilkan galat.
      console.error("Cek kode pesanan gagal:", error);
      result = "found";
    }
  }

  const response =
    result === "found"
      ? NextResponse.next()
      : NextResponse.rewrite(
          new URL(`/pesanan?galat=${result === "rate_limited" ? "batas" : "tidak-ditemukan"}`, request.url),
          { status: result === "rate_limited" ? 429 : 404 },
        );
  // Halaman pesanan tidak boleh diindeks, apa pun hasilnya.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
