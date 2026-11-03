"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

const AUTO_REFRESH_MS = 30_000;

// Tombol "Perbarui status" dan penyegaran otomatis tiap 30 detik selama pesanan belum
// selesai, hanya saat tab terlihat. Hanya membaca ulang status dari database lewat
// router.refresh(); bukan pelacakan kurir. Perubahan status diumumkan lewat aria-live.
export default function OrderStatusRefresher({ label, auto }: { label: string; auto: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [seenLabel, setSeenLabel] = useState(label);
  const [message, setMessage] = useState("");

  // Status berubah setelah refresh: umumkan (pola menyesuaikan state saat props berubah).
  if (label !== seenLabel) {
    setSeenLabel(label);
    setMessage(`Status diperbarui: ${label}.`);
  }

  useEffect(() => {
    if (!auto) return;
    let timer: number | undefined;
    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      timer = window.setInterval(() => router.refresh(), AUTO_REFRESH_MS);
    };
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return stop();
      router.refresh(); // kembali ke tab: langsung ambil status terbaru
      start();
    };
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [auto, router]);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        onClick={() => startTransition(() => router.refresh())}
        disabled={pending}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink bg-paper px-5 font-semibold text-ink transition-colors duration-150 hover:border-brand-strong hover:text-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
      >
        <RefreshCw aria-hidden className={cn("size-4", pending && "animate-spin motion-reduce:animate-none")} />
        {pending ? "Memperbarui..." : "Perbarui status"}
      </button>
      <p aria-live="polite" className="text-muted">
        {message || (auto ? "Diperbarui otomatis tiap 30 detik." : "")}
      </p>
    </div>
  );
}
