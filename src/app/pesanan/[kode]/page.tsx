import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CopyCodeButton from "@/components/CopyCodeButton";
import OrderStatusRefresher from "@/components/OrderStatusRefresher";
import OrderTimeline, { statusLabel } from "@/components/OrderTimeline";
import PaymentPanel from "@/components/PaymentPanel";
import { RESTAURANT_PHONE } from "@/lib/contact-info";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { normalizeOrderCode } from "@/lib/order-code-format";
import { getOrderTracking } from "@/lib/orders";

type Props = PageProps<"/pesanan/[kode]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kode } = await params;
  return {
    title: `Pesanan ${normalizeOrderCode(kode) ?? ""}`.trim(),
    robots: { index: false, follow: false },
  };
}

const card = "rounded-card border border-line bg-card p-4 md:p-6";

// Data pesanan dibaca per permintaan (tanpa cache) di dalam Suspense. Proxy sudah
// menjawab 404 untuk kode yang tidak ada; notFound() di sini hanya cadangan.
async function OrderDetail({ params }: { params: Props["params"] }) {
  const { kode } = await params;
  const order = await getOrderTracking(kode);
  if (!order) notFound();

  const waText = encodeURIComponent(`Halo Nasi Padang Nan Tujuah, saya ingin bertanya tentang pesanan ${order.code}.`);

  return (
    <>
      <header>
        <h1>
          <span className="block font-display text-2xl font-semibold text-ink md:text-3xl">Pesanan</span>
          <span className="mt-1 block font-mono text-3xl font-bold tracking-wider break-all text-ink">
            {order.code}
          </span>
        </h1>
        <p className="mt-2 text-muted">Dipesan {formatDateTime(order.createdAt)}</p>
        <div className="mt-3">
          <CopyCodeButton code={order.code} />
        </div>
      </header>

      <section aria-labelledby="judul-status" className={`${card} mt-8`}>
        <h2 id="judul-status" className="font-semibold">
          Status pesanan
        </h2>
        <div className="mt-5">
          <OrderTimeline status={order.status} />
        </div>
        <div className="mt-6 border-t border-line pt-4">
          <OrderStatusRefresher label={statusLabel(order.status)} auto={order.status !== "selesai"} />
        </div>
      </section>

      {/* Pembayaran hanya selama menunggu_bayar. Panel sendiri menampilkan "Bukti bayar
          terkirim" bila proofUploadedAt ada, dengan pilihan ganti bukti. */}
      {order.status === "menunggu_bayar" && (
        <div className="mt-6">
          <PaymentPanel
            code={order.code}
            total={order.total}
            initialState={{
              paymentMethod: order.paymentMethod,
              proofUploadedAt: order.proofUploadedAt,
              proofUploadCount: order.proofUploadCount,
            }}
          />
        </div>
      )}

      <section aria-labelledby="judul-ringkasan" className={`${card} mt-6`}>
        <h2 id="judul-ringkasan" className="font-semibold">
          Ringkasan pesanan
        </h2>
        <ul className="mt-2 divide-y divide-line">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-4 py-3">
              <span className="min-w-0">
                {item.quantity} x {item.name}
                {item.optionLabels.length > 0 && (
                  <span className="block text-sm text-muted">{item.optionLabels.join(", ")}</span>
                )}
              </span>
              <span className="shrink-0 font-semibold">{formatRupiah(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 border-t border-line pt-3">
          <div className="flex justify-between gap-4 py-1">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold">{formatRupiah(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <dt className="text-muted">Ongkir{order.zoneName && ` (${order.zoneName})`}</dt>
            <dd className="shrink-0 font-semibold">{formatRupiah(order.deliveryFee)}</dd>
          </div>
          <div className="mt-2 flex items-center justify-between gap-4 border-t border-line pt-3">
            <dt className="font-semibold">Total</dt>
            <dd className="text-2xl font-bold">{formatRupiah(order.total)}</dd>
          </div>
        </dl>
      </section>

      <a
        href={`https://wa.me/${RESTAURANT_PHONE}?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex min-h-12 w-full items-center justify-center rounded-full border border-ink bg-paper px-4 font-semibold text-ink transition-colors duration-150 hover:border-brand-strong hover:text-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none"
      >
        Tanya lewat WhatsApp
      </a>
    </>
  );
}

function OrderSkeleton() {
  const block = "animate-pulse rounded-card bg-line/60 motion-reduce:animate-none";
  return (
    <div aria-busy="true" aria-label="Memuat pesanan">
      <div className={`${block} h-6 w-28`} />
      <div className={`${block} mt-2 h-9 w-64 max-w-full`} />
      <div className={`${block} mt-3 h-5 w-52 max-w-full`} />
      <div className={`${block} mt-8 h-72 md:h-44`} />
      <div className={`${block} mt-6 h-64`} />
    </div>
  );
}

// F4: halaman lacak. Tidak diindeks (metadata robots dan header X-Robots-Tag dari Proxy).
export default function OrderPage({ params }: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-8 md:py-16">
      <Suspense fallback={<OrderSkeleton />}>
        <OrderDetail params={params} />
      </Suspense>
    </main>
  );
}
