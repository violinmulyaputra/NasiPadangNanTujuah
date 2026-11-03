"use client";

import { usePathname, useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { normalizeOrderCode, TRACK_NOT_FOUND } from "@/lib/order-code-format";

// Form kode pesanan (F4) di /pesanan dan di tampilan "tidak ditemukan". Kode tidak
// disimpan di perangkat. Server (Proxy) memeriksa ulang bentuk dan keberadaan kode.
export default function TrackOrderSearch({ message = "" }: { message?: string }) {
  const id = useId();
  const router = useRouter();
  const [value, setValue] = useState("");
  // null = tampilkan pesan dari server (message); string = hasil cek di klien.
  const [error, setError] = useState<string | null>(null);
  // URL berganti (pencarian baru): pesan server yang baru berlaku lagi.
  const pathname = usePathname();
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setError(null);
  }
  const shown = error ?? message;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const code = normalizeOrderCode(value);
    // Pesan yang sama dengan kode yang tidak ada di database.
    if (!code) return setError(TRACK_NOT_FOUND);
    setError(""); // sembunyikan pesan lama selama berpindah halaman
    router.push(`/pesanan/${code}`);
  };

  return (
    <form onSubmit={submit} noValidate className="mt-6">
      <label htmlFor={`${id}-kode`} className="block font-semibold">
        Kode pesanan
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id={`${id}-kode`}
          name="kode"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase().replace(/\s/g, ""))}
          placeholder="NPT-XXXXXXXX"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          aria-invalid={shown !== "" || undefined}
          aria-describedby={shown ? `${id}-galat` : undefined}
          className="min-h-12 w-full min-w-0 rounded-full border border-line bg-paper px-5 font-mono text-base tracking-wider text-ink placeholder:text-muted focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none sm:flex-1"
        />
        <button
          type="submit"
          className="min-h-12 shrink-0 rounded-full bg-ink px-8 text-base font-semibold text-paper transition-colors duration-150 hover:bg-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none"
        >
          Lacak
        </button>
      </div>
      <p id={`${id}-galat`} role="alert" className="mt-3 min-h-6 font-semibold text-brand-strong">
        {shown}
      </p>
    </form>
  );
}
