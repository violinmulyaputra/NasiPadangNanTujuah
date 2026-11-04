"use client";

import { useState } from "react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [status, setStatus] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Kode tersalin.");
    } catch {
      setStatus("Gagal menyalin. Salin kode secara manual.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={copy}
        className="min-h-11 rounded-full border border-line bg-paper px-5 font-semibold text-ink hover:border-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      >
        Salin kode
      </button>
      <p aria-live="polite" className="text-muted">
        {status}
      </p>
    </div>
  );
}
