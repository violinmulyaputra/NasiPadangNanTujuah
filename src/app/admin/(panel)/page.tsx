import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import HoverGlow from "@/components/HoverGlow";
import { getDashboardCounts } from "@/lib/admin-orders";

export const metadata: Metadata = { title: "Ringkasan" };

async function Counts() {
  const counts = await getDashboardCounts();
  const cards = [
    { label: "Bukti bayar perlu diverifikasi", value: counts.verifikasi, href: "/admin/pesanan?status=verifikasi" },
    { label: "Menunggu pembayaran", value: counts.menungguBayar, href: "/admin/pesanan?status=menunggu_bayar" },
    { label: "Diproses", value: counts.diproses, href: "/admin/pesanan?status=diproses" },
    { label: "Diantar", value: counts.diantar, href: "/admin/pesanan?status=diantar" },
    { label: "Pesanan hari ini", value: counts.hariIni, href: "/admin/pesanan?status=hari-ini" },
    { label: "Ulasan baru (7 hari)", value: counts.ulasanBaru, href: "/admin/ulasan?filter=baru" },
    { label: "Menu tidak tersedia", value: counts.menuHabis, href: "/admin/menu?filter=habis" },
  ];
  return (
    <ul className="isolate grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <li key={card.href} className="group relative">
          <HoverGlow className="-z-10" />
          <Link
            href={card.href}
            className="block h-full rounded-card focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none"
          >
            <span className="flex h-full flex-col justify-between gap-2 rounded-card bg-card p-4 hover-lift">
              <span className="text-sm text-muted">{card.label}</span>
              <span className="text-3xl font-bold tabular-nums">{card.value}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function AdminSummaryPage() {
  return (
    <main>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Ringkasan</h1>
      <p className="mt-1 text-sm text-muted">Menampilkan ringkasan per hari ini.</p>
      <div className="mt-6">
        <Suspense
          fallback={<div aria-busy="true" aria-label="Memuat ringkasan" className="h-28 animate-pulse rounded-card bg-line/60 motion-reduce:animate-none" />}
        >
          <Counts />
        </Suspense>
      </div>
    </main>
  );
}
