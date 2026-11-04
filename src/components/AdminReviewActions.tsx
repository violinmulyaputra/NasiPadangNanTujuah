"use client";

import { useState, useTransition } from "react";
import { deleteReview, setReviewVisible } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";
import type { AdminActionResult } from "@/types/order";

const button =
  "min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none disabled:cursor-wait disabled:opacity-60";

// Aksi moderasi satu ulasan. Sembunyikan dan tampilkan bisa dibalik, jadi tanpa konfirmasi;
// hapus permanen dikonfirmasi lebih dulu. Hasil dibacakan lewat aria-live.
export default function AdminReviewActions({ id, name, visible }: { id: string; name: string; visible: boolean }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminActionResult | null>(null);

  const run = (action: () => Promise<AdminActionResult>) => {
    setResult(null);
    startTransition(async () => {
      try {
        setResult(await action());
      } catch {
        setResult({ status: "error", message: "Koneksi bermasalah. Coba lagi." });
      }
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setReviewVisible(id, !visible))}
          className={cn(button, "border-ink bg-paper text-ink hover:border-brand-strong hover:text-brand-strong")}
        >
          {visible ? "Sembunyikan" : "Tampilkan"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm(`Hapus permanen ulasan dari ${name}? Tindakan ini tidak bisa dibatalkan.`))
              run(() => deleteReview(id));
          }}
          className={cn(button, "border-brand-strong bg-paper text-brand-strong hover:bg-brand-strong hover:text-paper")}
        >
          Hapus
        </button>
      </div>
      <p
        aria-live="polite"
        className={cn("mt-2 min-h-5 text-sm font-semibold", result?.status === "error" ? "text-brand-strong" : "text-ink")}
      >
        {pending ? "Menyimpan..." : result?.message}
      </p>
    </div>
  );
}
