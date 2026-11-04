import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeOrderCode } from "@/lib/order-code-format";
import { checkTrackRequest, type TrackCheck } from "@/lib/orders";

export const config = { matcher: ["/pesanan/:kode", "/admin/:path*"] };

// Admin (F5): menyegarkan sesi Supabase (cookie) dan mengalihkan lebih awal ke
// /admin/login bila belum login. BUKAN satu-satunya penjaga: setiap halaman dan
// Server Action admin tetap memanggil requireAdmin()/getAdmin() (cek admin_users).
async function adminProxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPage = request.method === "GET" || request.method === "HEAD";
  if (!user && isPage && request.nextUrl.pathname !== "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    response = redirect;
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  // Halaman admin tidak boleh disimpan CDN atau browser (termasuk cangkang statis login).
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

// Halaman lacak (F4) memuat data di dalam Suspense, dan respons streaming selalu mulai
// dengan status 200. Supaya kode yang tidak ada dijawab 404 (dan batas laju 429), kode
// dicek di sini sebelum halaman dirender. Yang gagal di-rewrite ke /pesanan (form yang
// sama) dengan pesan; URL di browser tetap.
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) return adminProxy(request);

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
