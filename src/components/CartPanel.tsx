"use client";

import Link from "next/link";
import { useRef } from "react";
import { CartIcon, CloseIcon } from "./Icons";

// Kerangka saja. Isi keranjang sungguhan dikerjakan di F2.
export default function CartPanel() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label="Buka keranjang"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-line/50"
      >
        <CartIcon />
      </button>

      {/* <dialog> modal: fokus terkunci di panel dan Escape menutup, bawaan browser */}
      <dialog
        ref={dialogRef}
        aria-labelledby="judul-keranjang"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-sm translate-x-full border-l border-line bg-paper p-0 text-ink shadow-xl transition-[translate,display,overlay] transition-discrete duration-300 ease-out backdrop:bg-ink/40 open:translate-x-0 starting:open:translate-x-full motion-reduce:transition-none"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
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

          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="text-muted">Keranjang masih kosong</p>
            <Link
              href="/menu"
              onClick={close}
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-paper hover:bg-ink"
            >
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
