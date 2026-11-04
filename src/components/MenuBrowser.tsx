"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { addItem } from "@/lib/cart";
import type { Selections } from "@/lib/menu-options";
import type { MenuCategory, MenuItem } from "@/types/menu";
import { openCartPanel } from "./CartPanel";
import MenuCard from "./MenuCard";
import MenuDetailDialog from "./MenuDetailDialog";
import Reveal from "./Reveal";

const FILTERS: { label: string; category: MenuCategory | null }[] = [
  { label: "Semua", category: null },
  { label: "Ayam", category: "Ayam" },
  { label: "Sapi", category: "Sapi" },
  { label: "Seafood", category: "Seafood" },
  { label: "Sayur", category: "Sayuran" },
  { label: "Minuman", category: "Minuman" },
  { label: "Buah", category: "Buah" },
];

export default function MenuBrowser({ items }: { items: MenuItem[] }) {
  const [category, setCategory] = useState<MenuCategory | null>(null);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [openKey, setOpenKey] = useState(0);
  const [status, setStatus] = useState<{ id: number; text: string } | null>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const visibleCount = category ? items.filter((i) => i.category === category).length : items.length;

  // notifikasi lama tidak muncul lagi saat kembali ke /menu
  useLayoutEffect(() => () => setStatus(null), []);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 6000);
    return () => clearTimeout(t);
  }, [status]);

  const choose = (next: MenuCategory | null) => {
    if (next === category) return;
    setCategory(next);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gridRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
    }
  };

  const open = (item: MenuItem, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setSelected(item);
    setOpenKey((k) => k + 1);
  };

  const add = (item: MenuItem, selections: Selections, quantity: number) => {
    const result = addItem(item, selections, quantity);
    setStatus({
      id: Date.now(),
      text: result.ok ? `${item.name} ditambahkan ke keranjang` : result.error,
    });
  };

  let visibleIndex = 0;

  return (
    <>
      <div role="group" aria-label="Filter kategori" className="mt-8 flex flex-wrap justify-center gap-2 md:mt-10">
        {FILTERS.map((f) => {
          const active = f.category === category;
          return (
            <button
              key={f.label}
              type="button"
              aria-pressed={active}
              onClick={() => choose(f.category)}
              className={
                active
                  ? "min-h-10 rounded-full bg-brand-strong px-5 text-sm font-semibold text-paper"
                  : "min-h-10 rounded-full bg-card px-5 text-sm text-ink hover:text-brand-strong"
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        Menampilkan {visibleCount} hidangan
      </p>

      <ul
        ref={gridRef}
        className="isolate mt-8 grid grid-cols-1 gap-x-8 gap-y-24 pt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10"
      >
        {items.map((item, i) => {
          const visible = !category || item.category === category;
          const index = visible ? visibleIndex++ : 0;
          return (
            <li key={item.id} hidden={!visible} className="relative hover:z-10">
              <Reveal index={index % 3} className="h-full">
                <MenuCard item={item} eager={i < 3} onAdd={open} />
              </Reveal>
            </li>
          );
        })}
      </ul>

      <MenuDetailDialog
        item={selected}
        openKey={openKey}
        onSubmit={add}
        onClose={() => triggerRef.current?.focus()}
      />

      <div
        role="status"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {status && (
          <p
            key={status.id}
            className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-1 rounded-card bg-ink px-5 py-3 text-sm text-paper shadow-control"
          >
            <span>{status.text}</span>
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                openCartPanel();
              }}
              className="min-h-11 font-semibold underline underline-offset-4 hover:text-brand"
            >
              Lihat keranjang
            </button>
          </p>
        )}
      </div>
    </>
  );
}
