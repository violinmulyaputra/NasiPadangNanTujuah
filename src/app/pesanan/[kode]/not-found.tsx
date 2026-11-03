import TrackOrderSearch from "@/components/TrackOrderSearch";
import { TRACK_NOT_FOUND } from "@/lib/order-code-format";

// Cadangan bila pesanan hilang setelah lolos cek Proxy. Tampilan sama dengan /pesanan.
export default function OrderNotFound() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 md:py-20">
      <h1 className="font-display text-title-mobile font-bold text-ink md:text-5xl">Lacak Pesanan</h1>
      <TrackOrderSearch message={TRACK_NOT_FOUND} />
    </main>
  );
}
