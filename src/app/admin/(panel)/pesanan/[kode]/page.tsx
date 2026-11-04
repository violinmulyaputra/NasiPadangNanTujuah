import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AdminOrderActions from "@/components/AdminOrderActions";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { getAdminOrder } from "@/lib/admin-orders";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { normalizeOrderCode } from "@/lib/order-code-format";

type Props = PageProps<"/admin/pesanan/[kode]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kode } = await params;
  return { title: `Pesanan ${normalizeOrderCode(kode) ?? ""}`.trim() };
}

const card = "rounded-card border border-line bg-card p-4 md:p-6";

function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="break-words">{children}</dd>
    </div>
  );
}

async function OrderDetail({ params }: { params: Props["params"] }) {
  const { kode } = await params;
  const order = await getAdminOrder(kode);
  if (!order) notFound();

  const waText = encodeURIComponent(
    `Halo, kami dari Nasi Padang Nan Tujuah tentang pesanan Anda ${order.code}.`,
  );
  const method = order.paymentMethod === "qris" ? "QRIS" : order.paymentMethod === "transfer" ? "Transfer bank" : "Belum dipilih";

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-wider break-all md:text-3xl">{order.code}</h1>
          <p className="mt-1 text-sm text-muted">Dipesan {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          {order.isPaid && (
            <span className="rounded-full border border-ink px-2.5 py-0.5 text-xs font-semibold">Lunas</span>
          )}
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <div className="space-y-6">
          <section aria-labelledby="judul-aksi" className={card}>
            <h2 id="judul-aksi" className="font-semibold">
              Ubah status
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Terakhir diubah {formatDateTime(order.updatedAt)}
              {order.paidAt && `. Lunas sejak ${formatDateTime(order.paidAt)}`}.
            </p>
            <AdminOrderActions
              code={order.code}
              status={order.status}
              hasProof={order.proofUploadedAt !== null}
              isPaid={order.isPaid}
            />
          </section>

          <section aria-labelledby="judul-pelanggan" className={card}>
            <h2 id="judul-pelanggan" className="font-semibold">
              Pelanggan
            </h2>
            <dl className="mt-2 divide-y divide-line">
              <Row label="Nama">{order.customerName}</Row>
              <Row label="Email">{order.customerEmail}</Row>
              <Row label="Telepon">{order.customerPhone}</Row>
              <Row label="Alamat">{order.deliveryAddress}</Row>
              <Row label="Zona">{order.zoneName || "-"}</Row>
              <Row label="Catatan">{order.notes || "-"}</Row>
            </dl>
            <a
              href={`https://wa.me/${toWhatsAppNumber(order.customerPhone)}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center rounded-full border border-ink bg-paper px-5 text-sm font-semibold text-ink transition-colors duration-150 hover:border-brand-strong hover:text-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none"
            >
              Hubungi lewat WhatsApp
            </a>
          </section>

          <section aria-labelledby="judul-item" className={card}>
            <h2 id="judul-item" className="font-semibold">
              Item pesanan
            </h2>
            <ul className="mt-2 divide-y divide-line">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-4 py-3">
                  <span className="min-w-0">
                    {item.quantity} x {item.name}
                    {item.optionLabels.length > 0 && (
                      <span className="block text-sm text-muted">{item.optionLabels.join(", ")}</span>
                    )}
                    <span className="block text-sm text-muted">{formatRupiah(item.unitPrice)} per porsi</span>
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
        </div>

        <section aria-labelledby="judul-bayar" className={card}>
          <h2 id="judul-bayar" className="font-semibold">
            Pembayaran
          </h2>
          <dl className="mt-2 divide-y divide-line">
            <Row label="Metode">{method}</Row>
            <Row label="Lunas">{order.isPaid ? "Ya" : "Belum"}</Row>
            <Row label="Bukti dikirim">
              {order.proofUploadedAt
                ? `${formatDateTime(order.proofUploadedAt)} (${order.proofUploadCount} kali unggah)`
                : "Belum ada"}
            </Row>
          </dl>
          {order.proofUrl ? (
            <figure className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.proofUrl}
                alt={`Bukti bayar pesanan ${order.code}`}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-full rounded-xl border border-line bg-paper object-contain"
              />
              <figcaption className="mt-2 text-xs text-muted">
                Tautan gambar berlaku 60 detik. Muat ulang halaman untuk melihat lagi.
              </figcaption>
            </figure>
          ) : (
            order.proofUploadedAt && (
              <p className="mt-4 text-sm font-semibold text-brand-strong">Gambar bukti bayar gagal dimuat.</p>
            )
          )}
        </section>
      </div>
    </>
  );
}

export default function AdminOrderPage({ params }: Props) {
  return (
    <main>
      <Link
        href="/admin/pesanan"
        className="inline-flex min-h-10 items-center text-sm font-semibold underline underline-offset-4 hover:text-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      >
        Kembali ke daftar pesanan
      </Link>
      <div className="mt-4">
        <Suspense
          fallback={
            <div
              aria-busy="true"
              aria-label="Memuat pesanan"
              className="h-96 animate-pulse rounded-card bg-line/60 motion-reduce:animate-none"
            />
          }
        >
          <OrderDetail params={params} />
        </Suspense>
      </div>
    </main>
  );
}
