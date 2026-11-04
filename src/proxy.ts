import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeOrderCode } from "@/lib/order-code-format";
import { checkTrackRequest, type TrackCheck } from "@/lib/orders";

export const config = { matcher: ["/pesanan/:kode", "/admin/:path*"] };

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
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) return adminProxy(request);

  if (request.method !== "GET" && request.method !== "HEAD") return;

  const raw = request.nextUrl.pathname.slice("/pesanan/".length);
  const code = normalizeOrderCode(raw);

  if (code && code !== raw) {
    const url = request.nextUrl.clone();
    url.pathname = `/pesanan/${code}`;
    return NextResponse.redirect(url);
  }

  let result: TrackCheck = "not_found";
  if (code) {
    try {
      result = await checkTrackRequest(code, request.headers);
    } catch (error) {
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
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
