"use client";

import { useActionState, useId, useState, useTransition } from "react";
import { setMenuAvailable, setMenuPopular, updateMenuItem } from "@/lib/actions/admin";
import { formatRupiah } from "@/lib/format";
import { MENU_DESC_MAX, MENU_NAME_MAX } from "@/lib/menu-validation";
import { cn } from "@/lib/utils";
import type { MenuEditState, MenuItem } from "@/types/menu";
import type { AdminActionResult } from "@/types/order";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none";
const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-base text-ink focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none aria-invalid:border-brand-strong";
const INITIAL: MenuEditState = { status: "idle", message: "", fieldErrors: {} };

type Field = "name" | "description" | "price";

export default function AdminMenuItem({ item }: { item: MenuItem }) {
  const uid = useId();
  const [pending, startTransition] = useTransition();
  const [flagResult, setFlagResult] = useState<AdminActionResult | null>(null);
  const [state, formAction, saving] = useActionState(updateMenuItem, INITIAL);
  const [values, setValues] = useState({ name: item.name, description: item.description, price: String(item.price) });

  const toggle = (action: () => Promise<AdminActionResult>) => {
    setFlagResult(null);
    startTransition(async () => {
      try {
        setFlagResult(await action());
      } catch {
        setFlagResult({ status: "error", message: "Koneksi bermasalah. Coba lagi." });
      }
    });
  };

  const field = (name: Field) => ({
    id: `${uid}-${name}`,
    name,
    value: values[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [name]: e.target.value })),
    "aria-invalid": state.fieldErrors[name] ? true : undefined,
    "aria-describedby": state.fieldErrors[name] ? `${uid}-${name}-error` : undefined,
    className: inputClass,
  });
  const fieldError = (name: Field) =>
    state.fieldErrors[name] && (
      <p id={`${uid}-${name}-error`} role="alert" className="mt-1 text-sm text-brand-strong">
        {state.fieldErrors[name]}
      </p>
    );

  const message = pending ? "Menyimpan..." : flagResult?.message;

  return (
    <article
      aria-labelledby={`${uid}-title`}
      className={cn("rounded-card border border-line p-4", item.is_available ? "bg-card" : "bg-paper")}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <h3 id={`${uid}-title`} className="min-w-0 font-semibold break-words">
          {item.name}
        </h3>
        <span className="shrink-0 font-semibold">{formatRupiah(item.price)}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={item.is_available}
          disabled={pending}
          onClick={() => toggle(() => setMenuAvailable(item.id, !item.is_available))}
          className={cn(
            "min-h-10 rounded-full px-4 text-sm font-semibold transition-colors duration-150 disabled:cursor-wait disabled:opacity-60",
            focusRing,
            item.is_available
              ? "border border-ink bg-paper text-ink hover:border-brand-strong hover:text-brand-strong"
              : "bg-ink text-paper hover:bg-brand-strong",
          )}
        >
          {item.is_available ? "Tersedia" : "Habis"}
          <span className="sr-only">. Ketuk untuk {item.is_available ? "menandai habis" : "menandai tersedia"}.</span>
        </button>
        <button
          type="button"
          aria-pressed={item.is_popular}
          disabled={pending}
          onClick={() => toggle(() => setMenuPopular(item.id, !item.is_popular))}
          className={cn(
            "min-h-10 rounded-full px-4 text-sm font-semibold transition-colors duration-150 disabled:cursor-wait disabled:opacity-60",
            focusRing,
            item.is_popular
              ? "bg-brand-strong text-paper hover:bg-brand-dark"
              : "border border-line bg-paper text-ink hover:border-ink",
          )}
        >
          {item.is_popular ? "Andalan" : "Bukan andalan"}
        </button>
      </div>
      <p
        aria-live="polite"
        className={cn("mt-2 min-h-5 text-sm font-semibold", flagResult?.status === "error" ? "text-brand-strong" : "text-ink")}
      >
        {message}
      </p>

      <details className="group mt-1">
        <summary
          className={cn(
            "inline-flex min-h-10 cursor-pointer list-none items-center rounded-full text-sm font-semibold underline underline-offset-4 hover:text-brand-strong [&::-webkit-details-marker]:hidden",
            focusRing,
          )}
        >
          <span className="group-open:hidden">Ubah nama, deskripsi, harga</span>
          <span className="hidden group-open:inline">Tutup form</span>
        </summary>
        <form action={formAction} noValidate className="mt-3 space-y-3">
          <input type="hidden" name="id" value={item.id} />
          <div>
            <label htmlFor={`${uid}-name`} className="text-sm font-semibold">
              Nama
            </label>
            <input {...field("name")} type="text" maxLength={MENU_NAME_MAX} autoComplete="off" />
            {fieldError("name")}
          </div>
          <div>
            <label htmlFor={`${uid}-description`} className="text-sm font-semibold">
              Deskripsi
            </label>
            <textarea {...field("description")} rows={3} maxLength={MENU_DESC_MAX} className={cn(inputClass, "resize-y")} />
            <p className="mt-1 text-xs text-muted">{[...values.description].length}/{MENU_DESC_MAX} karakter</p>
            {fieldError("description")}
          </div>
          <div>
            <label htmlFor={`${uid}-price`} className="text-sm font-semibold">
              Harga per porsi (Rupiah)
            </label>
            <input {...field("price")} type="text" inputMode="numeric" autoComplete="off" maxLength={7} />
            <p className="mt-1 text-xs text-muted">Angka bulat tanpa titik, contoh 25000.</p>
            {fieldError("price")}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-paper transition-colors duration-150 hover:bg-brand-strong disabled:cursor-wait disabled:opacity-60",
                focusRing,
              )}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <p
              aria-live="polite"
              className={cn("text-sm font-semibold", state.status === "error" ? "text-brand-strong" : "text-ink")}
            >
              {saving ? "" : state.message}
            </p>
          </div>
        </form>
      </details>
    </article>
  );
}
