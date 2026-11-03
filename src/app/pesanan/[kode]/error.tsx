"use client";

// Database bermasalah saat memuat pesanan. Detail galat hanya di log server.
export default function OrderError({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 md:py-20">
      <h1 className="font-display text-title-mobile font-bold text-ink md:text-5xl">Lacak Pesanan</h1>
      <p role="alert" className="mt-4 font-semibold text-brand-strong">
        Status pesanan gagal dimuat. Coba lagi beberapa saat lagi.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 min-h-12 rounded-full bg-ink px-8 font-semibold text-paper transition-colors duration-150 hover:bg-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Coba lagi
      </button>
    </main>
  );
}
