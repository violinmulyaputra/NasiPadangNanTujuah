import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout | Nasi Padang Nan Tujuah",
};

// Penampung sementara. Akan diganti form checkout pada F2 (dan pembayaran pada F3).
export default function CheckoutPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-(--container) px-4 py-16 text-center md:px-8 md:py-24">
        <h1 className="font-display text-title-mobile leading-[1.15] font-bold text-ink md:text-[clamp(2rem,4vw,3.25rem)]">
          Checkout
        </h1>
        <p className="mt-4 text-ink">Halaman checkout sedang disiapkan.</p>
        <Link
          href="/menu"
          className="mt-8 inline-block font-semibold text-ink underline underline-offset-4 hover:text-brand-strong"
        >
          Kembali ke menu
        </Link>
      </div>
    </main>
  );
}
