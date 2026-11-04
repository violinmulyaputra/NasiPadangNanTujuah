import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { ORDER_STEPS } from "@/components/OrderTimeline";
import {
  listOrders,
  MAX_QUERY_LENGTH,
  ORDERS_PER_PAGE,
  parseOrderListParams,
  type OrderListParams,
} from "@/lib/admin-orders";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminOrderFilter } from "@/types/order";

export const metadata: Metadata = { title: "Pesanan" };

const FILTERS: { value: AdminOrderFilter; label: string }[] = [
  { value: "semua", label: "Semua" },
  ...ORDER_STEPS.map((s) => ({ value: s.status, label: s.label })),
  { value: "verifikasi", label: "Perlu verifikasi" },
  { value: "hari-ini", label: "Hari ini" },
];

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none";
const pagerLink = cn(
  "inline-flex min-h-10 items-center rounded-full border border-ink px-4 text-sm font-semibold transition-colors duration-150 hover:border-brand-strong hover:text-brand-strong",
  focusRing,
);

// URL daftar hanya berisi filter, kode yang dicari, dan halaman; tanpa data pemesan.
function listHref(params: Partial<OrderListParams>) {
  const search = new URLSearchParams();
  if (params.filter && params.filter !== "semua") search.set("status", params.filter);
  if (params.query) search.set("q", params.query);
  if (params.page && params.page > 1) search.set("halaman", String(params.page));
  const qs = search.toString();
  return qs ? `/admin/pesanan?${qs}` : "/admin/pesanan";
}

async function OrderList({ searchParams }: { searchParams: PageProps<"/admin/pesanan">["searchParams"] }) {
  const params = parseOrderListParams(await searchParams);
  // listOrders memanggil requireAdmin() sebelum menyentuh data.
  const { rows, total } = await listOrders(params);
  const pages = Math.max(1, Math.ceil(total / ORDERS_PER_PAGE));
  const filterLabel = FILTERS.find((f) => f.value === params.filter)?.label ?? "Semua";

  return (
    <>
      <nav aria-label="Filter status" className="mt-4">
        <ul className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f.value === params.filter;
            return (
              <li key={f.value}>
                <Link
                  href={listHref({ filter: f.value, query: params.query })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-150",
                    focusRing,
                    active ? "bg-brand-strong text-paper" : "bg-card text-ink hover:text-brand-strong",
                  )}
                >
                  {f.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Form action="/admin/pesanan" className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        {params.filter !== "semua" && <input type="hidden" name="status" value={params.filter} />}
        <div className="sm:w-72">
          <label htmlFor="cari-kode" className="text-sm font-semibold">
            Cari kode pesanan
          </label>
          <input
            id="cari-kode"
            name="q"
            type="search"
            defaultValue={params.query}
            maxLength={MAX_QUERY_LENGTH}
            autoComplete="off"
            placeholder="NPT-XXXXXXXX"
            className="mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-2.5 font-mono text-base text-ink uppercase placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className={cn(
            "min-h-11 rounded-full bg-ink px-5 font-semibold text-paper transition-colors duration-150 hover:bg-brand-strong",
            focusRing,
          )}
        >
          Cari
        </button>
        {params.query && (
          <Link
            href={listHref({ filter: params.filter })}
            className={cn(
              "inline-flex min-h-11 items-center px-2 text-sm font-semibold underline underline-offset-4 hover:text-brand-strong",
              focusRing,
            )}
          >
            Hapus pencarian
          </Link>
        )}
      </Form>

      <p aria-live="polite" className="mt-4 text-sm text-muted">
        {params.queryValid
          ? `${total} pesanan (${filterLabel}${params.query ? `, kode memuat ${params.query}` : ""}).`
          : "Kode pesanan hanya berisi huruf, angka, dan tanda hubung."}
      </p>

      {rows.length === 0 ? (
        <p className="mt-3 rounded-card border border-line bg-card p-6 text-center text-muted">Tidak ada pesanan.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-card border border-line">
          {rows.map((order) => (
            <li key={order.code}>
              {/* HP: kartu dua kolom. Mulai md: satu baris berkolom seperti tabel. */}
              <Link
                href={`/admin/pesanan/${order.code}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 bg-paper p-4 transition-colors duration-150 hover:bg-card focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none focus-visible:ring-inset md:grid-cols-[9.5rem_15rem_minmax(0,1fr)_7rem_13rem] md:items-center"
              >
                <span className="font-mono font-semibold">{order.code}</span>
                <span className="text-right font-semibold md:order-4">{formatRupiah(order.total)}</span>
                <span className="col-span-2 text-sm text-muted md:order-2 md:col-span-1">
                  {formatDateTime(order.createdAt)}
                </span>
                <span className="col-span-2 truncate md:order-3 md:col-span-1">{order.customerName}</span>
                <span className="col-span-2 mt-1 flex flex-wrap items-center gap-2 md:order-5 md:col-span-1 md:mt-0 md:justify-end">
                  <OrderStatusBadge status={order.status} />
                  {order.status === "menunggu_bayar" && order.proofUploaded && (
                    <span className="text-xs font-semibold text-brand-strong">Bukti bayar terkirim</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Halaman daftar pesanan" className="mt-4 flex items-center justify-between gap-3">
          {params.page > 1 ? (
            <Link href={listHref({ ...params, page: Math.min(params.page - 1, pages) })} className={pagerLink}>
              Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted">
            Halaman {params.page} dari {pages}
          </span>
          {params.page < pages ? (
            <Link href={listHref({ ...params, page: params.page + 1 })} className={pagerLink}>
              Berikutnya
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}

// F5: daftar pesanan, terbaru di atas, 20 per halaman.
export default function AdminOrdersPage({ searchParams }: PageProps<"/admin/pesanan">) {
  return (
    <main>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Pesanan</h1>
      <Suspense
        fallback={
          <div
            aria-busy="true"
            aria-label="Memuat pesanan"
            className="mt-4 h-96 animate-pulse rounded-card bg-line/60 motion-reduce:animate-none"
          />
        }
      >
        <OrderList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
