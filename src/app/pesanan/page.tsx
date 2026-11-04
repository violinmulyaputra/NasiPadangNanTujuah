import type { Metadata } from "next";
import { Suspense } from "react";
import TrackOrderSearch from "@/components/TrackOrderSearch";
import { TRACK_NOT_FOUND, TRACK_RATE_LIMITED } from "@/lib/order-code-format";

export const metadata: Metadata = {
  title: "Lacak Pesanan | Nasi Padang Nan Tujuah",
  description: "Lacak status pesanan Anda dengan kode pesanan.",
};

async function SearchWithMessage({ searchParams }: { searchParams: PageProps<"/pesanan">["searchParams"] }) {
  const { galat } = await searchParams;
  const message = galat === "batas" ? TRACK_RATE_LIMITED : galat === "tidak-ditemukan" ? TRACK_NOT_FOUND : "";
  return <TrackOrderSearch message={message} />;
}

export default function TrackOrderPage({ searchParams }: PageProps<"/pesanan">) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 md:py-20">
      <h1 className="font-display text-title-mobile font-bold text-ink md:text-5xl">
        Lacak <span className="text-brand">Pesanan</span>
      </h1>
      <p className="mt-3 text-base text-muted">
        Masukkan kode pesanan yang Anda terima setelah checkout untuk melihat status dan cara pembayarannya.
      </p>
      <Suspense fallback={<TrackOrderSearch />}>
        <SearchWithMessage searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
