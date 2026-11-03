"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { removeItem, updateQuantity, useCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/format";
import { calculateLineTotal, MAX_QUANTITY, MIN_QUANTITY } from "@/lib/pricing";
import { CartIcon, CloseIcon } from "./Icons";
import MenuPhoto from "./MenuPhoto";

const PANEL_ID = "panel-keranjang";

// Dibuka dari luar Navbar (pesan "Lihat keranjang" di halaman Menu).
export function openCartPanel() {
  (document.getElementById(PANEL_ID) as HTMLDialogElement | null)?.showModal();
}

const stepperClass =
  "inline-flex size-10 items-center justify-center rounded-full border border-line text-ink transition-colors duration-150 hover:border-brand-strong hover:text-brand-strong disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink";

const primaryButton =
  "flex min-h-12 w-full items-center justify-center rounded-full px-6 text-sm font-semibold";

// Isi dari store localStorage (src/lib/cart.ts). Render server dan hidrasi pertama
// memakai keranjang kosong (getServerSnapshot), lalu isi asli tampil, jadi tanpa hydration mismatch.
// <dialog> modal bawaan: focus trap, Escape menutup, aria-modal, dan fokus kembali ke ikon keranjang.
export default function CartPanel() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();
  const lines = useCart();
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + calculateLineTotal(l.unitPrice, l.quantity), 0);
  // Ongkir tetap per zona dipilih saat checkout (PRD F2), jadi total sementara = subtotal.
  const total = subtotal;

  return (
    <>
      <button
        type="button"
        aria-label={count > 0 ? `Buka keranjang, ${count} item` : "Buka keranjang"}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="relative inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-line/50"
      >
        <CartIcon />
        {count > 0 && (
          // key berubah tiap jumlah berubah, jadi animasi bump diputar ulang
          <span
            key={count}
            aria-hidden
            className="absolute top-0.5 right-0.5 inline-flex h-5 min-w-5 animate-bump items-center justify-center rounded-full bg-brand-strong px-1 text-[0.6875rem] font-semibold text-paper motion-reduce:animate-none"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      <dialog
        ref={dialogRef}
        id={PANEL_ID}
        aria-labelledby="judul-keranjang"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-full translate-x-full border-l border-line bg-paper p-0 text-ink opacity-0 shadow-xl transition-[translate,opacity,display,overlay] transition-discrete duration-250 ease-out backdrop:bg-ink/50 open:translate-x-0 open:opacity-100 sm:max-w-[420px] starting:open:translate-x-full starting:open:opacity-0 motion-reduce:transition-none"
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
            <h2 id="judul-keranjang" className="font-display text-2xl font-semibold">
              Keranjang Anda
            </h2>
            <button
              type="button"
              aria-label="Tutup keranjang"
              onClick={close}
              className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-line/50"
            >
              <CloseIcon />
            </button>
          </div>

          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="text-muted">Keranjang masih kosong</p>
              <Link
                href="/menu"
                onClick={close}
                className="font-semibold text-ink underline underline-offset-4 hover:text-brand-strong"
              >
                Lihat menu
              </Link>
            </div>
          ) : (
            <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-4">
              {lines.map((line) => (
                <li key={line.lineKey} className="flex gap-3 rounded-card bg-card p-3">
                  <MenuPhoto
                    src={line.imageUrl}
                    alt=""
                    sizes="64px"
                    className="size-16 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug">{line.name}</p>
                    {line.optionLabels.length > 0 && (
                      <p className="mt-0.5 text-xs text-muted">{line.optionLabels.join(", ")}</p>
                    )}
                    <p className="mt-1 text-sm">{formatRupiah(line.unitPrice)}</p>
                    <div role="group" aria-label={`Jumlah ${line.name}`} className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Kurangi jumlah"
                        disabled={line.quantity <= MIN_QUANTITY}
                        onClick={() => updateQuantity(line.lineKey, line.quantity - 1)}
                        className={stepperClass}
                      >
                        <Minus aria-hidden className="size-4" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Tambah jumlah"
                        disabled={line.quantity >= MAX_QUANTITY}
                        onClick={() => updateQuantity(line.lineKey, line.quantity + 1)}
                        className={stepperClass}
                      >
                        <Plus aria-hidden className="size-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Hapus ${line.name} dari keranjang`}
                    onClick={() => removeItem(line.lineKey)}
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-brand-strong transition-colors duration-150 hover:bg-brand-strong hover:text-paper"
                  >
                    <Trash2 aria-hidden className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Ringkasan menempel di dasar panel; daftar di atasnya yang discroll */}
          <div className="shrink-0 border-t border-line px-6 py-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">Subtotal</p>
                <p className="text-sm font-semibold">{formatRupiah(subtotal)}</p>
              </div>
              <p className="text-xs text-muted">Ongkir dihitung saat checkout</p>
              <div className="flex items-center justify-between pt-2">
                <p className="font-semibold">Total</p>
                <p aria-live="polite" className="text-lg font-bold">
                  {formatRupiah(total)}
                </p>
              </div>
            </div>
            {lines.length === 0 ? (
              <button type="button" disabled className={`${primaryButton} mt-4 cursor-not-allowed bg-line text-muted`}>
                Lanjut ke Checkout
              </button>
            ) : (
              <Link
                href="/checkout"
                onClick={close}
                className={`${primaryButton} mt-4 bg-ink text-paper transition-colors duration-150 hover:bg-brand-strong`}
              >
                Lanjut ke Checkout
              </Link>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
